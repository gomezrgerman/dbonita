import { NextResponse } from 'next/server'
import { confirmarReservaDesdePago, getStripe, HorarioOcupadoError } from '@/lib/stripe-server'
import { toReservaPublica } from '@/lib/supabase-store'

// Vuelta del pago en el navegador (con o sin redirección de Stripe).
// Exige el client_secret, que solo conoce quien inició el pago.
export async function POST(req: Request) {
  let clientSecret: unknown
  try {
    ({ clientSecret } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  }
  if (typeof clientSecret !== 'string' || !/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(clientSecret)) {
    return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  }

  const paymentIntentId = clientSecret.split('_secret_')[0]

  try {
    const pi = await getStripe().paymentIntents.retrieve(paymentIntentId)
    if (pi.client_secret !== clientSecret) {
      return NextResponse.json({ error: 'Solicitud no válida' }, { status: 403 })
    }
    if (pi.status === 'processing') {
      return NextResponse.json({ pendiente: true }, { status: 202 })
    }
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'El pago no se ha completado' }, { status: 402 })
    }

    const booking = await confirmarReservaDesdePago(pi)
    return NextResponse.json({ reserva: toReservaPublica(booking) })
  } catch (err) {
    if (err instanceof HorarioOcupadoError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error('reserva confirmar:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'No se pudo guardar la reserva' }, { status: 500 })
  }
}
