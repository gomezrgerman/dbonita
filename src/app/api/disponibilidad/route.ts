import { NextResponse } from 'next/server'
import { fechaValida } from '@/lib/reservas-reglas'
import { getDiasCerradosAsync, getOcupacionFechaAsync } from '@/lib/supabase-store'

// Disponibilidad pública. Solo devuelve rangos horarios, nunca datos de clientas.
//   ?fecha=YYYY-MM-DD               → { rangos, diaCompleto }
//   ?desde=YYYY-MM-DD&hasta=...     → { diasCerrados }
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const fecha = params.get('fecha')
  const desde = params.get('desde')
  const hasta = params.get('hasta')

  try {
    if (fecha !== null) {
      if (!fechaValida(fecha)) return NextResponse.json({ error: 'Fecha no válida' }, { status: 400 })
      return NextResponse.json(await getOcupacionFechaAsync(fecha), {
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    if (!fechaValida(desde) || !fechaValida(hasta) || desde > hasta) {
      return NextResponse.json({ error: 'Rango no válido' }, { status: 400 })
    }
    return NextResponse.json({ diasCerrados: await getDiasCerradosAsync(desde, hasta) }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('disponibilidad:', err)
    return NextResponse.json({ error: 'No se pudo consultar la disponibilidad' }, { status: 503 })
  }
}
