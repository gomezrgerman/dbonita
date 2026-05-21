import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.error('stripe intent: STRIPE_SECRET_KEY no configurada')
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  try {
    const stripe = new Stripe(secretKey)
    const {
      nombre, email, telefono,
      servicios, servicioDesc,
      fecha, hora, duracionMinutos, notas,
    } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // 10 € en céntimos
      currency: 'eur',
      description: `Señal reserva D Bonita — ${servicioDesc}`,
      receipt_email: email || undefined,
      metadata: {
        nombre: nombre ?? '',
        email: email ?? '',
        telefono: telefono ?? '',
        servicios: JSON.stringify(servicios ?? []),
        servicio_desc: servicioDesc ?? '',
        fecha: fecha ?? '',
        hora: hora ?? '',
        duracion_minutos: String(duracionMinutos ?? 0),
        notas: notas ?? '',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: unknown) {
    console.error('stripe intent error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 500 })
  }
}
