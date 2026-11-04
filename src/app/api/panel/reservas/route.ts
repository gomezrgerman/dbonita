import { NextResponse } from 'next/server'
import { SERVICIOS } from '@/lib/constants'
import { fechaValida } from '@/lib/reservas-reglas'
import { createBookingAsync, getBookingsAsync, updateBookingEstadoAsync } from '@/lib/supabase-store'
import type { EstadoCita } from '@/lib/types'

// Protegido por middleware (cookie del panel) — ver src/middleware.ts

const ESTADOS: EstadoCita[] = ['pendiente', 'confirmada', 'cancelada', 'completada']

export async function GET() {
  try {
    return NextResponse.json(await getBookingsAsync(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('panel reservas GET:', err)
    return NextResponse.json({ error: 'Error cargando reservas' }, { status: 500 })
  }
}

// Cita añadida a mano desde el panel (sin pago online)
export async function POST(req: Request) {
  try {
    const input = await req.json()
    const servicio = SERVICIOS.find((s) => s.id === input.servicioId)
    const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : ''
    if (!nombre || !servicio || !fechaValida(input.fecha) || !/^\d{2}:\d{2}$/.test(input.hora ?? '')) {
      return NextResponse.json({ error: 'Datos de la cita no válidos' }, { status: 400 })
    }
    const pagado = input.pagado === true
    const booking = await createBookingAsync({
      clienteNombre: nombre,
      clienteEmail: typeof input.email === 'string' ? input.email.trim() : '',
      clienteTelefono: typeof input.telefono === 'string' ? input.telefono.trim() : '',
      servicios: [servicio.id],
      duracionMinutos: servicio.duracionMinutos,
      fecha: input.fecha,
      hora: input.hora,
      notas: typeof input.notas === 'string' ? input.notas : '',
      pagado,
      importePagado: pagado ? Math.max(0, Number(input.importePagado) || 0) : 0,
      estado: 'pendiente',
    })
    return NextResponse.json(booking)
  } catch (err) {
    console.error('panel reservas POST:', err)
    return NextResponse.json({ error: 'Error creando la cita' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, estado } = await req.json()
    if (typeof id !== 'string' || !ESTADOS.includes(estado)) {
      return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 })
    }
    const booking = await updateBookingEstadoAsync(id, estado)
    if (!booking) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json(booking)
  } catch (err) {
    console.error('panel reservas PATCH:', err)
    return NextResponse.json({ error: 'Error actualizando la cita' }, { status: 500 })
  }
}
