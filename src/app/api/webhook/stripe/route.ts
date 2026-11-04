import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { confirmarReservaDesdePago, getStripe } from '@/lib/stripe-server'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    console.error('webhook stripe: variables de entorno no configuradas')
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Falta stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook: firma inválida:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await confirmarReservaDesdePago(pi)
    } catch (err) {
      console.error('Webhook: error creando reserva:', err)
      // 500 para que Stripe reintente el webhook
      return NextResponse.json({ error: 'Error guardando reserva' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
