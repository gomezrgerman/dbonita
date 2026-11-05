// Cancelación de una reserva, compartida por la clienta (enlace del email) y el panel.
// SOLO servidor.
import type { Booking } from './types'
import { updateBookingEstadoAsync } from './supabase-store'
import { enviarCancelacion } from './email-server'
import { getStripe } from './stripe-server'

export class ReembolsoError extends Error {
  constructor(causa: unknown) {
    super('No se pudo procesar el reembolso')
    this.name = 'ReembolsoError'
    this.cause = causa
  }
}

export interface OpcionesCancelacion {
  /** Devolver la señal en Stripe (solo si la reserva se pagó online) */
  reembolsar: boolean
  /** Enviar el email de cancelación a la clienta */
  avisar: boolean
  /** La cancela el centro (cambia el texto del email) */
  porCentro: boolean
}

export interface ResultadoCancelacion {
  reserva: Booking
  reembolsada: boolean
}

export function puedeReembolsarse(b: Booking): boolean {
  return b.pagado && b.importePagado > 0 && !!b.stripePaymentIntentId
}

export async function cancelarReserva(
  booking: Booking,
  { reembolsar, avisar, porCentro }: OpcionesCancelacion
): Promise<ResultadoCancelacion> {
  const reembolsada = reembolsar && puedeReembolsarse(booking)

  // Primero el dinero: si Stripe falla, la reserva sigue activa y se puede reintentar.
  if (reembolsada) {
    try {
      await getStripe().refunds.create(
        { payment_intent: booking.stripePaymentIntentId! },
        { idempotencyKey: `reembolso-${booking.id}` }
      )
    } catch (err) {
      if ((err as { code?: string }).code !== 'charge_already_refunded') throw new ReembolsoError(err)
    }
  }

  const actualizada = (await updateBookingEstadoAsync(booking.id, 'cancelada')) ?? { ...booking, estado: 'cancelada' as const }

  if (avisar) {
    await enviarCancelacion(booking, reembolsada, porCentro).catch((err) =>
      console.error('cancelacion: email:', err)
    )
  }

  return { reserva: actualizada, reembolsada }
}
