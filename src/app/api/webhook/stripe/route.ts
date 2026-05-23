import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createBookingAsync } from '@/lib/supabase-store'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!webhookSecret || !stripeKey) {
    console.error('webhook stripe: variables de entorno no configuradas')
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Falta stripe-signature' }, { status: 400 })
  }

  const stripe = new Stripe(stripeKey)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook: firma inválida:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent

    // Idempotencia: si ya existe una reserva con este paymentIntentId, no crear otra
    const { data: existing } = await getSupabaseAdmin()
      .from('reservas')
      .select('id')
      .eq('stripe_payment_intent_id', pi.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true })
    }

    const meta = pi.metadata
    let servicios: string[] = []
    try {
      servicios = JSON.parse(meta.servicios || '[]')
    } catch {
      servicios = []
    }

    try {
      await createBookingAsync({
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
      console.log(`Webhook: reserva creada para PaymentIntent ${pi.id}`)
    } catch (err) {
      console.error('Webhook: error creando reserva:', err)
      // Devolver 500 para que Stripe reintente el webhook
      return NextResponse.json({ error: 'Error guardando reserva' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
