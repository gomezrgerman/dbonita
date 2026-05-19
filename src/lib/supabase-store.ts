import { supabase } from './supabase'
import { SERVICIOS } from './constants'
import type { Booking, Cliente, EstadoCita } from './types'

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
  input: Omit<Booking, 'id' | 'creadoEn'> & { estado?: EstadoCita }
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

export async function getHorasOcupadasByFechaAsync(
  fecha: string
): Promise<Array<{ inicio: number; fin: number }>> {
  const { data, error } = await supabase
    .from('reservas')
    .select('hora, duracion_minutos, servicio')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')
  if (error) { console.error('getHorasOcupadasByFechaAsync:', error); return [] }
  return (data as Pick<ReservaRow, 'hora' | 'duracion_minutos' | 'servicio'>[]).map((row) => {
    const [h, m] = row.hora.split(':').map(Number)
    const inicio = h * 60 + m
    const servicios = parseServicios(row.servicio)
    const duracion = row.duracion_minutos ?? computeDuracion(servicios)
    return { inicio, fin: inicio + duracion }
  })
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
