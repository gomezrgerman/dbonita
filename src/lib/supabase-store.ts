import { supabase } from './supabase'
import { SERVICIOS } from './constants'
import type { Booking, Cliente, EstadoCita, SlotBloqueado } from './types'

// ─── Bloqueos (Supabase) ───────────────────────────────────

interface BloqueoRow {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string | null
  afecta: string | null
  created_at: string
}

function rowToBloqueo(row: BloqueoRow): SlotBloqueado {
  return {
    id: row.id,
    fecha: row.fecha,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    motivo: row.motivo ?? '',
    afecta: (row.afecta ?? 'negocio') as 'negocio' | 'trabajadora',
    creadoEn: row.created_at,
  }
}

export async function getSlotsBloqueadosAsync(): Promise<SlotBloqueado[]> {
  const { data, error } = await supabase
    .from('bloqueos')
    .select('*')
    .order('fecha', { ascending: true })
  if (error) { console.error('getSlotsBloqueadosAsync:', error); return [] }
  return (data as BloqueoRow[]).map(rowToBloqueo)
}

export async function crearBloqueoAsync(
  input: Omit<SlotBloqueado, 'id' | 'creadoEn'>
): Promise<SlotBloqueado> {
  const { data, error } = await supabase
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
  if (error) throw error
  return rowToBloqueo(data as BloqueoRow)
}

export async function eliminarBloqueoAsync(id: string): Promise<void> {
  const { error } = await supabase.from('bloqueos').delete().eq('id', id)
  if (error) console.error('eliminarBloqueoAsync:', error)
}

export async function isDiaCompletoAsync(fecha: string): Promise<boolean> {
  const { data } = await supabase
    .from('bloqueos')
    .select('id')
    .eq('fecha', fecha)
    .eq('hora_inicio', 'todo-el-dia')
    .in('afecta', ['negocio', null])
    .maybeSingle()
  return data !== null
}

// ─── Row type matching the Supabase reservas table ────────
interface ReservaRow {
  id: string
  nombre: string
  telefono: string
  email: string | null
  servicio: string             // JSON array of service IDs, e.g. '["lifting-pestanas"]'
  fecha: string                // YYYY-MM-DD (Supabase returns as string)
  hora: string                 // HH:MM
  estado: string
  notas: string | null
  created_at: string
  duracion_minutos: number | null
  importe_pagado: number | null
  pagado: boolean | null
  cancelado_en: string | null
  stripe_payment_intent_id: string | null
}

function computeDuracion(servicios: string[]): number {
  return servicios.reduce((acc, id) => {
    const s = SERVICIOS.find((sv) => sv.id === id)
    return acc + (s?.duracionMinutos ?? 0)
  }, 0)
}

function parseServicios(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  } catch {
    return [raw]
  }
}

function rowToBooking(row: ReservaRow): Booking {
  const servicios = parseServicios(row.servicio)
  return {
    id: row.id,
    clienteNombre: row.nombre,
    clienteEmail: row.email ?? '',
    clienteTelefono: row.telefono,
    servicios,
    duracionMinutos: row.duracion_minutos ?? computeDuracion(servicios),
    fecha: row.fecha,
    hora: row.hora,
    notas: row.notas ?? '',
    estado: row.estado as EstadoCita,
    pagado: row.pagado ?? true,
    importePagado: row.importe_pagado ?? 10,
    creadoEn: row.created_at,
    ...(row.cancelado_en ? { canceladoEn: row.cancelado_en } : {}),
    ...(row.stripe_payment_intent_id ? { stripePaymentIntentId: row.stripe_payment_intent_id } : {}),
  }
}

// ─── Bookings ─────────────────────────────────────────────

export async function getBookingsAsync(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getBookingsAsync:', error); return [] }
  return (data as ReservaRow[]).map(rowToBooking)
}

export async function getBookingAsync(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return rowToBooking(data as ReservaRow)
}

export async function createBookingAsync(
  input: Omit<Booking, 'id' | 'creadoEn'> & { estado?: EstadoCita; stripePaymentIntentId?: string }
): Promise<Booking> {
  const { data, error } = await supabase
    .from('reservas')
    .insert({
      nombre: input.clienteNombre,
      telefono: input.clienteTelefono,
      email: input.clienteEmail || null,
      servicio: JSON.stringify(input.servicios),
      fecha: input.fecha,
      hora: input.hora,
      estado: input.estado ?? 'confirmada',
      notas: input.notas || null,
      duracion_minutos: input.duracionMinutos,
      importe_pagado: input.importePagado,
      pagado: input.pagado,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToBooking(data as ReservaRow)
}

export async function updateBookingEstadoAsync(
  id: string,
  estado: EstadoCita
): Promise<Booking | null> {
  const updates: Record<string, unknown> = { estado }
  if (estado === 'cancelada') updates.cancelado_en = new Date().toISOString()
  const { data, error } = await supabase
    .from('reservas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateBookingEstadoAsync:', error); return null }
  return rowToBooking(data as ReservaRow)
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function getHorasOcupadasByFechaAsync(
  fecha: string
): Promise<{ rangos: Array<{ inicio: number; fin: number }>; diaCompleto: boolean }> {
  const [reservasResult, bloqueosResult] = await Promise.all([
    supabase
      .from('reservas')
      .select('hora, duracion_minutos, servicio')
      .eq('fecha', fecha)
      .neq('estado', 'cancelada'),
    supabase
      .from('bloqueos')
      .select('*')
      .eq('fecha', fecha),
  ])

  if (reservasResult.error) console.error('getHorasOcupadasByFechaAsync reservas:', reservasResult.error)
  if (bloqueosResult.error) console.error('getHorasOcupadasByFechaAsync bloqueos:', bloqueosResult.error)

  const bloqueos = ((bloqueosResult.data ?? []) as BloqueoRow[]).map(rowToBloqueo)

  const diaCompleto = bloqueos.some(
    (b) => b.horaInicio === 'todo-el-dia' && (b.afecta === 'negocio' || !b.afecta)
  )

  const reservasRangos = ((reservasResult.data ?? []) as Pick<ReservaRow, 'hora' | 'duracion_minutos' | 'servicio'>[]).map((row) => {
    const inicio = timeToMin(row.hora)
    const servicios = parseServicios(row.servicio)
    const duracion = row.duracion_minutos ?? computeDuracion(servicios)
    return { inicio, fin: inicio + duracion }
  })

  const bloqueosRangos: Array<{ inicio: number; fin: number }> = []
  for (const b of bloqueos) {
    if (b.horaInicio === 'todo-el-dia') continue
    const inicio = timeToMin(b.horaInicio)
    const fin = timeToMin(b.horaFin)
    if (b.afecta === 'trabajadora') {
      bloqueosRangos.push({ inicio, fin })
    } else {
      // negocio: bloquea ambas plazas
      bloqueosRangos.push({ inicio, fin }, { inicio, fin })
    }
  }

  return { rangos: [...reservasRangos, ...bloqueosRangos], diaCompleto }
}

// ─── Clientes (derived from reservas) ────────────────────

export async function getClientesAsync(): Promise<Cliente[]> {
  const bookings = await getBookingsAsync()
  const map = new Map<string, Cliente>()
  ;[...bookings].reverse().forEach((b) => {
    const email = b.clienteEmail
    if (!email) return
    if (!map.has(email)) {
      map.set(email, {
        email,
        nombre: b.clienteNombre,
        telefono: b.clienteTelefono,
        reservaIds: [b.id],
        creadoEn: b.creadoEn,
      })
    } else {
      const c = map.get(email)!
      c.nombre = b.clienteNombre
      c.telefono = b.clienteTelefono
      if (!c.reservaIds.includes(b.id)) c.reservaIds.push(b.id)
    }
  })
  return Array.from(map.values())
}

export async function getHistorialClienteAsync(email: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('email', email)
    .order('fecha', { ascending: false })
  if (error) { console.error('getHistorialClienteAsync:', error); return [] }
  return (data as ReservaRow[]).map(rowToBooking)
}
