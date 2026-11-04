// Acceso a Supabase SOLO desde servidor (rutas API).
// Usa la service role key: nunca importar este archivo desde un componente 'use client'.
import { getSupabaseAdmin } from './supabase-admin'
import { cabeEnHueco, tipoDeServicios, type RangoOcupado } from './reservas-capacidad'
import { calcularDuracion, timeToMin } from './reservas-reglas'
import type { Booking, EstadoCita, ReservaPublica, SlotBloqueado } from './types'

// ─── Bloqueos ──────────────────────────────────────────────

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
  const { data, error } = await getSupabaseAdmin()
    .from('bloqueos')
    .select('*')
    .order('fecha', { ascending: true })
  if (error) throw error
  return (data as BloqueoRow[]).map(rowToBloqueo)
}

export async function crearBloqueoAsync(
  input: Omit<SlotBloqueado, 'id' | 'creadoEn'>
): Promise<SlotBloqueado> {
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
  if (error) throw error
  return rowToBloqueo(data as BloqueoRow)
}

export async function eliminarBloqueoAsync(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from('bloqueos').delete().eq('id', id)
  if (error) throw error
}

/** Días (YYYY-MM-DD) con el negocio cerrado por bloqueo de jornada completa. */
export async function getDiasCerradosAsync(desde: string, hasta: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('bloqueos')
    .select('fecha, afecta')
    .eq('hora_inicio', 'todo-el-dia')
    .gte('fecha', desde)
    .lte('fecha', hasta)
  if (error) throw error
  const filas = data as Pick<BloqueoRow, 'fecha' | 'afecta'>[]
  return Array.from(new Set(filas.filter((b) => !b.afecta || b.afecta === 'negocio').map((b) => b.fecha)))
}

// ─── Reservas ──────────────────────────────────────────────

interface ReservaRow {
  id: string
  nombre: string
  telefono: string
  email: string | null
  servicio: string             // JSON array de IDs de servicio, ej. '["lifting-pestanas"]'
  fecha: string                // YYYY-MM-DD
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
    duracionMinutos: row.duracion_minutos ?? calcularDuracion(servicios),
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

/** Vista reducida de una reserva para páginas públicas (sin teléfono ni notas). */
export function toReservaPublica(b: Booking): ReservaPublica {
  return {
    id: b.id,
    clienteNombre: b.clienteNombre,
    clienteEmail: b.clienteEmail,
    servicios: b.servicios,
    duracionMinutos: b.duracionMinutos,
    fecha: b.fecha,
    hora: b.hora,
    estado: b.estado,
    importePagado: b.importePagado,
  }
}

export async function getBookingsAsync(): Promise<Booking[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as ReservaRow[]).map(rowToBooking)
}

export async function getBookingAsync(id: string): Promise<Booking | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('reservas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToBooking(data as ReservaRow) : null
}

export async function getBookingByPaymentIntentAsync(paymentIntentId: string): Promise<Booking | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('reservas')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()
  if (error) throw error
  return data ? rowToBooking(data as ReservaRow) : null
}

export async function createBookingAsync(
  input: Omit<Booking, 'id' | 'creadoEn'> & { estado?: EstadoCita; stripePaymentIntentId?: string }
): Promise<Booking> {
  const { data, error } = await getSupabaseAdmin()
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

export async function updateBookingEstadoAsync(id: string, estado: EstadoCita): Promise<Booking | null> {
  const updates: Record<string, unknown> = { estado }
  if (estado === 'cancelada') updates.cancelado_en = new Date().toISOString()
  const { data, error } = await getSupabaseAdmin()
    .from('reservas')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? rowToBooking(data as ReservaRow) : null
}

// ─── Disponibilidad ────────────────────────────────────────

export interface Ocupacion {
  rangos: RangoOcupado[]
  diaCompleto: boolean
}

/** Citas y bloqueos de un día, con su tipo para las reglas de capacidad. Lanza error si falla la BD. */
export async function getOcupacionFechaAsync(fecha: string): Promise<Ocupacion> {
  const supabase = getSupabaseAdmin()
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
  if (reservasResult.error) throw reservasResult.error
  if (bloqueosResult.error) throw bloqueosResult.error

  const bloqueos = (bloqueosResult.data as BloqueoRow[]).map(rowToBloqueo)
  const diaCompleto = bloqueos.some(
    (b) => b.horaInicio === 'todo-el-dia' && (b.afecta === 'negocio' || !b.afecta)
  )

  const reservas = reservasResult.data as Pick<ReservaRow, 'hora' | 'duracion_minutos' | 'servicio'>[]
  const reservasRangos: RangoOcupado[] = reservas.map((row) => {
    const servicios = parseServicios(row.servicio)
    const inicio = timeToMin(row.hora)
    const duracion = row.duracion_minutos ?? calcularDuracion(servicios)
    return { inicio, fin: inicio + duracion, tipo: tipoDeServicios(servicios) }
  })

  const bloqueosRangos: RangoOcupado[] = []
  for (const b of bloqueos) {
    const todoElDia = b.horaInicio === 'todo-el-dia'
    // Un bloqueo de jornada de una trabajadora reduce una plaza todo el día
    const inicio = todoElDia ? 0 : timeToMin(b.horaInicio)
    const fin = todoElDia ? 24 * 60 : timeToMin(b.horaFin)
    if (todoElDia && b.afecta !== 'trabajadora') continue // cubierto por diaCompleto
    bloqueosRangos.push({ inicio, fin, tipo: b.afecta === 'trabajadora' ? 'trabajadora' : 'cierre' })
  }

  return { rangos: [...reservasRangos, ...bloqueosRangos], diaCompleto }
}

export async function slotDisponibleAsync(
  fecha: string,
  hora: string,
  duracionMinutos: number,
  servicios: string[]
): Promise<boolean> {
  const { rangos, diaCompleto } = await getOcupacionFechaAsync(fecha)
  if (diaCompleto) return false
  const inicio = timeToMin(hora)
  return cabeEnHueco(rangos, inicio, inicio + duracionMinutos, tipoDeServicios(servicios))
}
