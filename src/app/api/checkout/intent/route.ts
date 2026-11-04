import { NextResponse } from 'next/server'
import { SERVICIOS } from '@/lib/constants'
import { calcularSenalCentimos, validarSolicitudReserva } from '@/lib/reservas-reglas'
import { slotDisponibleAsync } from '@/lib/supabase-store'
import { getStripe } from '@/lib/stripe-server'

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  }

  const validacion = validarSolicitudReserva({
    nombre: body.nombre,
    email: body.email,
    telefono: body.telefono,
    servicios: body.servicios,
    fecha: body.fecha,
    hora: body.hora,
    notas: body.notas,
  })
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: 400 })
  }
  const d = validacion.datos

  // Verificación de disponibilidad en servidor antes de cobrar.
  // Si la BD falla no se cobra: mejor un error que una doble reserva.
  try {
    const disponible = await slotDisponibleAsync(d.fecha, d.hora, d.duracionMinutos, d.servicios)
    if (!disponible) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible. Por favor, elige otro.' },
        { status: 409 }
      )
    }
  } catch (err) {
    console.error('checkout intent: error comprobando disponibilidad:', err)
    return NextResponse.json({ error: 'No se pudo comprobar la disponibilidad' }, { status: 503 })
  }

  try {
    const servicioDesc = d.servicios
      .map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id)
      .join(' + ')

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: calcularSenalCentimos(d.servicios),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      description: `Señal reserva D Bonita — ${servicioDesc}`.slice(0, 1000),
      receipt_email: d.email,
      metadata: {
        nombre: d.nombre,
        email: d.email,
        telefono: d.telefono,
        servicios: JSON.stringify(d.servicios),
        servicio_desc: servicioDesc.slice(0, 500),
        fecha: d.fecha,
        hora: d.hora,
        duracion_minutos: String(d.duracionMinutos),
        notas: d.notas,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: unknown) {
    console.error('stripe intent error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 500 })
  }
}
