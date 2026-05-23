import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface BloqueoInput {
  fecha: string
  horaInicio: string
  horaFin: string
  motivo?: string
  afecta?: 'negocio' | 'trabajadora'
}

export async function POST(req: Request) {
  try {
    const input: BloqueoInput = await req.json()
    const { data, error } = await getSupabaseAdmin()
      .from('bloqueos')
      .insert({
        fecha: input.fecha,
        hora_inicio: input.horaInicio,
        hora_fin: input.horaFin,
        motivo: input.motivo || null,
        afecta: input.afecta ?? 'negocio',
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    const { error } = await getSupabaseAdmin().from('bloqueos').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
