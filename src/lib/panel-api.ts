// Llamadas del panel (navegador) a las rutas /api/panel/*, protegidas por cookie.
import type { Booking, Cliente, EstadoCita, SlotBloqueado } from './types'

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (res.status === 401) {
    window.location.href = '/panel/login'
    throw new Error('Sesión caducada')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getBookings(): Promise<Booking[]> {
  return pedir<Booking[]>('/api/panel/reservas')
}

export interface NuevaCitaPanel {
  nombre: string
  telefono: string
  email: string
  notas: string
  fecha: string
  hora: string
  servicioId: string
  pagado: boolean
  importePagado: number
}

export function crearCita(input: NuevaCitaPanel): Promise<Booking> {
  return pedir<Booking>('/api/panel/reservas', { method: 'POST', body: JSON.stringify(input) })
}

export interface OpcionesCancelarPanel {
  reembolsar: boolean
  avisar: boolean
}

export function actualizarEstado(id: string, estado: EstadoCita, opciones?: OpcionesCancelarPanel): Promise<Booking> {
  return pedir<Booking>('/api/panel/reservas', {
    method: 'PATCH',
    body: JSON.stringify({ id, estado, ...(opciones ?? {}) }),
  })
}

export function getBloqueos(): Promise<SlotBloqueado[]> {
  return pedir<SlotBloqueado[]>('/api/panel/bloqueos')
}

/** Agrupa las reservas por email para la vista de clientas. */
export function derivarClientes(bookings: Booking[]): Cliente[] {
  const map = new Map<string, Cliente>()
  ;[...bookings]
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
    .forEach((b) => {
      if (!b.clienteEmail) return
      const previo = map.get(b.clienteEmail)
      map.set(b.clienteEmail, {
        email: b.clienteEmail,
        nombre: b.clienteNombre,
        telefono: b.clienteTelefono,
        reservaIds: previo ? [...previo.reservaIds, b.id] : [b.id],
        creadoEn: previo?.creadoEn ?? b.creadoEn,
      })
    })
  return Array.from(map.values())
}
