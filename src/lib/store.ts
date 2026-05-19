import { Booking, Cliente, SlotBloqueado, EstadoCita } from './types'
import { SERVICIOS } from './constants'

export const NUM_PERSONAL = 2

const KEYS = {
  bookings: 'dbonita_bookings',
  clientes: 'dbonita_clientes',
  bloqueados: 'dbonita_bloqueados',
}

// ─── Utilidades internas ───────────────────────────────────

function leer<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function guardar<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── Bookings ─────────────────────────────────────────────

export function getBookings(): Booking[] {
  return leer<Booking>(KEYS.bookings)
}

export function getBooking(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id)
}

export function createBooking(
  data: Omit<Booking, 'id' | 'creadoEn'> & { estado?: EstadoCita }
): Booking {
  const serviciosNombres = data.servicios.map(
    (id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id
  )
  const duracionTotal = data.servicios.reduce((acc, id) => {
    const s = SERVICIOS.find((s) => s.id === id)
    return acc + (s?.duracionMinutos ?? 0)
  }, 0)
  const booking: Booking = {
    ...data,
    servicios: data.servicios,
    duracionMinutos: duracionTotal || data.duracionMinutos,
    id: uid(),
    estado: data.estado ?? 'confirmada',
    creadoEn: new Date().toISOString(),
  }
  const lista = getBookings()
  lista.push(booking)
  guardar(KEYS.bookings, lista)
  upsertCliente(booking)
  return booking
}

export function updateBookingEstado(id: string, estado: EstadoCita): Booking | null {
  const lista = getBookings()
  const idx = lista.findIndex((b) => b.id === id)
  if (idx === -1) return null
  lista[idx] = {
    ...lista[idx],
    estado,
    ...(estado === 'cancelada' ? { canceladoEn: new Date().toISOString() } : {}),
  }
  guardar(KEYS.bookings, lista)
  return lista[idx]
}

export function getBookingsByFecha(fecha: string): Booking[] {
  return getBookings().filter((b) => b.fecha === fecha && b.estado !== 'cancelada')
}

export function getHorasOcupadasByFecha(fecha: string): Array<{ inicio: number; fin: number }> {
  return getBookingsByFecha(fecha).map((b) => {
    const [h, m] = b.hora.split(':').map(Number)
    const inicio = h * 60 + m
    return { inicio, fin: inicio + b.duracionMinutos }
  })
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Devuelve cuántas "plazas" de personal están ocupadas en el intervalo [inicio, fin).
 * Tiene en cuenta reservas activas + bloqueos del panel.
 */
export function getPlazasOcupadas(
  fecha: string,
  inicioMin: number,
  finMin: number
): number {
  const reservas = getHorasOcupadasByFecha(fecha).filter(
    (o) => inicioMin < o.fin && finMin > o.inicio
  ).length

  const bloqueados = getSlotsBloqueados()
    .filter((b) => b.fecha === fecha)
    .filter((b) => {
      if (b.horaInicio === 'todo-el-dia') return true
      const bInicio = timeToMin(b.horaInicio)
      const bFin = timeToMin(b.horaFin)
      return inicioMin < bFin && finMin > bInicio
    }).length

  return reservas + bloqueados
}

/** Cuántas reservas activas hay en un día (para mostrar en el calendario del panel) */
export function getConteoByFecha(fecha: string): number {
  return getBookingsByFecha(fecha).length
}

export function puedeClienteCancelar(id: string): { puede: boolean; motivo?: string } {
  const booking = getBooking(id)
  if (!booking) return { puede: false, motivo: 'Reserva no encontrada' }
  if (booking.estado === 'cancelada') return { puede: false, motivo: 'La reserva ya está cancelada' }
  if (booking.estado === 'completada') return { puede: false, motivo: 'La cita ya se ha realizado' }

  const citaDateTime = new Date(`${booking.fecha}T${booking.hora}:00`)
  const ahora = new Date()
  const horasRestantes = (citaDateTime.getTime() - ahora.getTime()) / (1000 * 60 * 60)

  if (horasRestantes < 24) {
    return {
      puede: false,
      motivo: `La cita es en menos de 24 horas. Según nuestra política, el pago de señal de ${booking.importePagado}€ no es reembolsable.`,
    }
  }
  return { puede: true }
}

// ─── Clientes ─────────────────────────────────────────────

export function getClientes(): Cliente[] {
  return leer<Cliente>(KEYS.clientes)
}

export function getCliente(email: string): Cliente | undefined {
  return getClientes().find((c) => c.email === email)
}

function upsertCliente(booking: Booking): void {
  const lista = getClientes()
  const idx = lista.findIndex((c) => c.email === booking.clienteEmail)
  if (idx === -1) {
    lista.push({
      email: booking.clienteEmail,
      nombre: booking.clienteNombre,
      telefono: booking.clienteTelefono,
      reservaIds: [booking.id],
      creadoEn: new Date().toISOString(),
    })
  } else {
    if (!lista[idx].reservaIds.includes(booking.id)) {
      lista[idx].reservaIds.push(booking.id)
    }
    lista[idx].nombre = booking.clienteNombre
    lista[idx].telefono = booking.clienteTelefono
  }
  guardar(KEYS.clientes, lista)
}

export function getHistorialCliente(email: string): Booking[] {
  const cliente = getCliente(email)
  if (!cliente) return []
  const todos = getBookings()
  return todos.filter((b) => cliente.reservaIds.includes(b.id))
}

// ─── Slots bloqueados ──────────────────────────────────────

export function getSlotsBloqueados(): SlotBloqueado[] {
  return leer<SlotBloqueado>(KEYS.bloqueados)
}

export function crearBloqueo(
  data: Omit<SlotBloqueado, 'id' | 'creadoEn'>
): SlotBloqueado {
  const bloqueo: SlotBloqueado = {
    ...data,
    id: uid(),
    creadoEn: new Date().toISOString(),
  }
  const lista = getSlotsBloqueados()
  lista.push(bloqueo)
  guardar(KEYS.bloqueados, lista)
  return bloqueo
}

export function eliminarBloqueo(id: string): void {
  const lista = getSlotsBloqueados().filter((b) => b.id !== id)
  guardar(KEYS.bloqueados, lista)
}

export function isDiaCompleto(fecha: string): boolean {
  // Solo cierra el día si el bloqueo afecta al negocio entero (ambas trabajadoras).
  // Un bloqueo de una sola trabajadora reduce capacidad pero no cierra el día.
  return getSlotsBloqueados().some(
    (b) =>
      b.fecha === fecha &&
      b.horaInicio === 'todo-el-dia' &&
      (b.afecta === 'negocio' || b.afecta === undefined)
  )
}
