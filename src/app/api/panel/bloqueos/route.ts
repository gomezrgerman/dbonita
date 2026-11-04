import { NextResponse } from 'next/server'
import { fechaValida } from '@/lib/reservas-reglas'
import { crearBloqueoAsync, eliminarBloqueoAsync, getSlotsBloqueadosAsync } from '@/lib/supabase-store'

// Protegido por middleware (cookie del panel) — ver src/middleware.ts

interface BloqueoInput {
  fecha: string
  horaInicio: string
  horaFin: string
  motivo?: string
  afecta?: 'negocio' | 'trabajadora'
}

const HORA = /^\d{2}:\d{2}$/

export async function GET() {
  try {
    return NextResponse.json(await getSlotsBloqueadosAsync(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('panel bloqueos GET:', err)
    return NextResponse.json({ error: 'Error cargando bloqueos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const input: BloqueoInput = await req.json()
    const todoElDia = input.horaInicio === 'todo-el-dia'
    const horasOk = todoElDia
      ? input.horaFin === 'todo-el-dia'
      : HORA.test(input.horaInicio) && HORA.test(input.horaFin) && input.horaInicio < input.horaFin
    if (!fechaValida(input.fecha) || !horasOk) {
      return NextResponse.json({ error: 'Datos del bloqueo no válidos' }, { status: 400 })
    }
    const bloqueo = await crearBloqueoAsync({
      fecha: input.fecha,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      motivo: input.motivo ?? '',
      afecta: input.afecta === 'trabajadora' ? 'trabajadora' : 'negocio',
    })
    return NextResponse.json(bloqueo)
  } catch (err) {
    console.error('panel bloqueos POST:', err)
    return NextResponse.json({ error: 'Error creando el bloqueo' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (typeof id !== 'string') return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 })
    await eliminarBloqueoAsync(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('panel bloqueos DELETE:', err)
    return NextResponse.json({ error: 'Error eliminando el bloqueo' }, { status: 500 })
  }
}
