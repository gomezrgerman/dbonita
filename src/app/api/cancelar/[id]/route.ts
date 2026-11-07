import { NextResponse } from 'next/server'
import { esCancelableConReembolso } from '@/lib/reservas-reglas'
import { getBookingAsync, toReservaPublica } from '@/lib/supabase-store'
import { cancelarReserva, ReembolsoError } from '@/lib/cancelacion'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  try {
    const booking = await getBookingAsync(id)
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
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  try {
    const booking = await getBookingAsync(id)
    if (!booking) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    if (booking.estado === 'cancelada' || booking.estado === 'completada') {
      return NextResponse.json({ error: 'La reserva ya no se puede cancelar' }, { status: 409 })
    }
    if (!esCancelableConReembolso(booking.fecha, booking.hora)) {
      return NextResponse.json({ error: 'Fuera de plazo de cancelación' }, { status: 409 })
    }

    try {
      const { reserva, reembolsada } = await cancelarReserva(booking, {
        reembolsar: true,
        avisar: true,
        porCentro: false,
      })
      return NextResponse.json({ reserva: toReservaPublica(reserva), reembolsada })
    } catch (err) {
      if (!(err instanceof ReembolsoError)) throw err
      console.error('cancelar: error en reembolso:', err.cause)
      return NextResponse.json(
        { error: 'No se pudo procesar el reembolso. Contáctanos y lo resolvemos.' },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error('cancelar POST:', err)
    return NextResponse.json({ error: 'No se pudo cancelar la reserva' }, { status: 500 })
  }
}
