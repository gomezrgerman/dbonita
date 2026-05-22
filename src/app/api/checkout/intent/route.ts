import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { NUM_PERSONAL } from '@/lib/constants'

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

interface ReservaRow { hora: string; duracion_minutos: number | null }
interface BloqueoRow { hora_inicio: string; hora_fin: string; afecta: string | null }

async function slotDisponible(fecha: string, hora: string, duracionMinutos: number): Promise<boolean> {
  const [reservasResult, bloqueosResult] = await Promise.all([
    supabase
      .from('reservas')
      .select('hora, duracion_minutos')
      .eq('fecha', fecha)
      .neq('estado', 'cancelada'),
    supabase
      .from('bloqueos')
      .select('hora_inicio, hora_fin, afecta')
      .eq('fecha', fecha),
  ])

  if (reservasResult.error || bloqueosResult.error) return true // no bloquear ante error de BD

  const inicio = timeToMin(hora)
  const fin = inicio + duracionMinutos

  const reservasOcupadas = (reservasResult.data as ReservaRow[]).filter((r) => {
    const rInicio = timeToMin(r.hora)
    const rFin = rInicio + (r.duracion_minutos ?? 60)
    return inicio < rFin && fin > rInicio
  }).length

  const plazasBloqueadas = (bloqueosResult.data as BloqueoRow[]).reduce((acc, b) => {
    const esPorTrabajadora = b.afecta === 'trabajadora'
    const plazas = esPorTrabajadora ? 1 : NUM_PERSONAL
    if (b.hora_inicio === 'todo-el-dia') return acc + plazas
    const bInicio = timeToMin(b.hora_inicio)
    const bFin = timeToMin(b.hora_fin)
    return inicio < bFin && fin > bInicio ? acc + plazas : acc
  }, 0)

  return reservasOcupadas + plazasBloqueadas < NUM_PERSONAL
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.error('stripe intent: STRIPE_SECRET_KEY no configurada')
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  try {
    const {
      nombre, email, telefono,
      servicios, servicioDesc,
      fecha, hora, duracionMinutos, notas,
    } = await req.json()

    // Verificación de disponibilidad en servidor antes de crear el PaymentIntent
    const disponible = await slotDisponible(fecha, hora, duracionMinutos ?? 60)
    if (!disponible) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible. Por favor, elige otro.' },
        { status: 409 }
      )
    }

    const stripe = new Stripe(secretKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
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
