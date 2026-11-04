import { NextResponse } from 'next/server'
import { esCancelableConReembolso } from '@/lib/reservas-reglas'
import { getBookingAsync, toReservaPublica, updateBookingEstadoAsync } from '@/lib/supabase-store'
import { enviarCancelacion } from '@/lib/email-server'
import { getStripe } from '@/lib/stripe-server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  try {
    const booking = await getBookingAsync(params.id)
    if (!booking) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json({
      reserva: toReservaPublica(booking),
      cancelable: esCancelableConReembolso(booking.fecha, booking.hora),
    })
  } catch (err) {
    console.error('cancelar GET:', err)
    return NextResponse.json({ error: 'Error consultando la reserva' }, { status: 500 })
  }
}

// La clienta cancela desde el enlace de su email. Solo con 24 h o más de antelación,
// y en ese caso se devuelve la señal automáticamente.
export async function POST(_req: Request, { params }: Params) {
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  try {
    const booking = await getBookingAsync(params.id)
    if (!booking) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    if (booking.estado === 'cancelada' || booking.estado === 'completada') {
      return NextResponse.json({ error: 'La reserva ya no se puede cancelar' }, { status: 409 })
    }
    if (!esCancelableConReembolso(booking.fecha, booking.hora)) {
      return NextResponse.json({ error: 'Fuera de plazo de cancelación' }, { status: 409 })
    }

    const reembolsar = booking.pagado && booking.importePagado > 0 && !!booking.stripePaymentIntentId
    if (reembolsar) {
      try {
        await getStripe().refunds.create(
          { payment_intent: booking.stripePaymentIntentId! },
          { idempotencyKey: `reembolso-${booking.id}` }
        )
      } catch (err) {
        const code = (err as { code?: string }).code
        if (code !== 'charge_already_refunded') {
          console.error('cancelar: error en reembolso:', err)
          return NextResponse.json(
            { error: 'No se pudo procesar el reembolso. Contáctanos y lo resolvemos.' },
            { status: 502 }
          )
        }
      }
    }

    const actualizada = await updateBookingEstadoAsync(booking.id, 'cancelada')
    await enviarCancelacion(booking, reembolsar).catch((err) => console.error('cancelar: email:', err))

    return NextResponse.json({ reserva: toReservaPublica(actualizada ?? booking), reembolsada: reembolsar })
  } catch (err) {
    console.error('cancelar POST:', err)
    return NextResponse.json({ error: 'No se pudo cancelar la reserva' }, { status: 500 })
  }
}
