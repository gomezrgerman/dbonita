// Cliente de Stripe y alta de reservas a partir de pagos. SOLO servidor.
import Stripe from 'stripe'
import {
  createBookingAsync,
  getBookingByPaymentIntentAsync,
} from './supabase-store'
import { enviarConfirmacion, enviarNotificacionNegocio } from './email-server'
import type { Booking } from './types'

let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY no configurada')
  if (!_stripe) _stripe = new Stripe(key)
  return _stripe
}

function esViolacionUnica(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
}

/**
 * Crea la reserva asociada a un PaymentIntent cobrado. Idempotente: la llaman tanto
 * el webhook de Stripe como la vuelta del pago en el navegador, y solo una de las dos
 * llega a insertar (índice único sobre stripe_payment_intent_id). Quien inserta envía los emails.
 */
export async function confirmarReservaDesdePago(pi: Stripe.PaymentIntent): Promise<Booking> {
  if (pi.status !== 'succeeded') throw new Error(`PaymentIntent ${pi.id} en estado ${pi.status}`)

  const existente = await getBookingByPaymentIntentAsync(pi.id)
  if (existente) return existente

  const meta = pi.metadata
  let servicios: string[] = []
  try {
    const parsed = JSON.parse(meta.servicios || '[]')
    servicios = Array.isArray(parsed) ? parsed : []
  } catch {
    servicios = []
  }

  let booking: Booking
  try {
    booking = await createBookingAsync({
      clienteNombre: meta.nombre || 'Sin nombre',
      clienteEmail: meta.email || '',
      clienteTelefono: meta.telefono || '',
      servicios,
      duracionMinutos: Number(meta.duracion_minutos) || 0,
      fecha: meta.fecha || '',
      hora: meta.hora || '',
      notas: meta.notas || '',
      importePagado: pi.amount / 100,
      pagado: true,
      estado: 'confirmada',
      stripePaymentIntentId: pi.id,
    })
  } catch (err) {
    if (esViolacionUnica(err)) {
      const yaCreada = await getBookingByPaymentIntentAsync(pi.id)
      if (yaCreada) return yaCreada
    }
    throw err
  }

  await Promise.allSettled([enviarConfirmacion(booking), enviarNotificacionNegocio(booking)])
  return booking
}
