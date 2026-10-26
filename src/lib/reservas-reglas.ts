import { SERVICIOS } from './constants'

// Reglas de negocio de las reservas. Sin dependencias de servidor:
// las usa tanto el calendario del navegador como las rutas API.

export const ZONA_HORARIA = 'Europe/Madrid'
export interface Tramo { apertura: number; cierre: number }

const MANANA_A_19: Tramo[] = [{ apertura: 10 * 60, cierre: 19 * 60 }]
const MANANA_A_18: Tramo[] = [{ apertura: 10 * 60, cierre: 18 * 60 }]

// Índice = día de la semana (0 domingo … 6 sábado)
export const HORARIO_SEMANAL: Tramo[][] = [
  [],          // domingo
  MANANA_A_19, // lunes
  MANANA_A_18, // martes
  MANANA_A_19, // miércoles
  MANANA_A_19, // jueves
  MANANA_A_18, // viernes
  [],          // sábado
]
export const DIAS_CERRADO = HORARIO_SEMANAL.flatMap((tramos, dia) => (tramos.length === 0 ? [dia] : []))
export const HORAS_MINIMAS_CANCELACION = 24
export const DIAS_MAXIMOS_ANTELACION = 180
export const IMPORTE_SENAL_CENTIMOS = 1000
export const IMPORTE_SENAL_REDUCIDA_CENTIMOS = 500

export function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function partesEnMadrid(fecha: Date): Record<string, number> {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_HORARIA,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha)
  return Object.fromEntries(
    partes.filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)])
  )
}

function offsetMadridMs(instante: Date): number {
  const p = partesEnMadrid(instante)
  const comoUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return comoUtc - Math.floor(instante.getTime() / 1000) * 1000
}

/** Instante UTC que corresponde a una fecha y hora locales de Madrid. */
export function madridAUtc(fecha: string, hora: string): Date {
  const [y, m, d] = fecha.split('-').map(Number)
  const [h, min] = hora.split(':').map(Number)
  const ingenuo = Date.UTC(y, m - 1, d, h, min)
  const primero = ingenuo - offsetMadridMs(new Date(ingenuo))
  return new Date(ingenuo - offsetMadridMs(new Date(primero)))
}

export function hoyEnMadrid(ahora: Date = new Date()): string {
  const p = partesEnMadrid(ahora)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

function minutoActualEnMadrid(ahora: Date): number {
  const p = partesEnMadrid(ahora)
  return p.hour * 60 + p.minute
}

export function horasHastaCita(fecha: string, hora: string, ahora: Date = new Date()): number {
  return (madridAUtc(fecha, hora).getTime() - ahora.getTime()) / (1000 * 60 * 60)
}

export function esCancelableConReembolso(fecha: string, hora: string, ahora: Date = new Date()): boolean {
  return horasHastaCita(fecha, hora, ahora) >= HORAS_MINIMAS_CANCELACION
}

export function calcularDuracion(servicios: string[]): number {
  return servicios.reduce(
    (acc, id) => acc + (SERVICIOS.find((s) => s.id === id)?.duracionMinutos ?? 0),
    0
  )
}

/** Precio en euros de un servicio, o null si es "a consultar". "Desde 45€" cuenta como 45. */
function precioEuros(precio: string): number | null {
  const m = precio.match(/(\d+(?:[.,]\d+)?)\s*€/)
  return m ? Number(m[1].replace(',', '.')) : null
}

/** Señal de 10 €, o de 5 € si el total de la reserva no llega a 10 €. */
export function calcularSenalCentimos(servicios: string[]): number {
  const precios = servicios.map((id) => {
    const s = SERVICIOS.find((x) => x.id === id)
    return s ? precioEuros(s.precio) : null
  })
  if (precios.some((p) => p === null)) return IMPORTE_SENAL_CENTIMOS
  const total = (precios as number[]).reduce((a, b) => a + b, 0)
  return total < IMPORTE_SENAL_CENTIMOS / 100 ? IMPORTE_SENAL_REDUCIDA_CENTIMOS : IMPORTE_SENAL_CENTIMOS
}

export function horarioDelDia(fecha: string): Tramo[] {
  return HORARIO_SEMANAL[diaSemana(fecha)]
}

export function fechaValida(fecha: unknown): fecha is string {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false
  const [y, m, d] = fecha.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function horaValida(hora: unknown): hora is string {
  return typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
}

function diaSemana(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function sumarDias(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10)
}

export interface SolicitudReserva {
  nombre: unknown
  email: unknown
  telefono: unknown
  servicios: unknown
  fecha: unknown
  hora: unknown
  notas?: unknown
}

export interface ReservaValidada {
  nombre: string
  email: string
  telefono: string
  servicios: string[]
  fecha: string
  hora: string
  notas: string
  duracionMinutos: number
}

export type ResultadoValidacion =
  | { ok: true; datos: ReservaValidada }
  | { ok: false; error: string }

const fallo = (error: string): ResultadoValidacion => ({ ok: false, error })

export function validarSolicitudReserva(
  input: SolicitudReserva,
  ahora: Date = new Date()
): ResultadoValidacion {
  const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const telefono = typeof input.telefono === 'string' ? input.telefono.trim() : ''
  const notas = typeof input.notas === 'string' ? input.notas.trim() : ''

  if (!nombre || nombre.length > 100) return fallo('Nombre no válido.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return fallo('Email no válido.')
  const digitos = telefono.replace(/[\s\-().+]/g, '')
  if (!/^\d{9,15}$/.test(digitos)) return fallo('Teléfono no válido.')
  if (notas.length > 500) return fallo('Las notas son demasiado largas.')

  if (!Array.isArray(input.servicios) || input.servicios.length === 0 || input.servicios.length > 10) {
    return fallo('Selecciona al menos un servicio.')
  }
  const servicios = input.servicios as unknown[]
  if (!servicios.every((id) => typeof id === 'string' && SERVICIOS.some((s) => s.id === id))) {
    return fallo('Servicio no válido.')
  }
  const idsServicios = Array.from(new Set(servicios as string[]))

  if (!fechaValida(input.fecha)) return fallo('Fecha no válida.')
  if (!horaValida(input.hora)) return fallo('Hora no válida.')
  const fecha = input.fecha
  const hora = input.hora

  const hoy = hoyEnMadrid(ahora)
  if (fecha < hoy) return fallo('La fecha ya ha pasado.')
  if (fecha > sumarDias(hoy, DIAS_MAXIMOS_ANTELACION)) return fallo('La fecha es demasiado lejana.')
  if (DIAS_CERRADO.includes(diaSemana(fecha))) return fallo('Ese día el centro está cerrado.')

  const duracionMinutos = calcularDuracion(idsServicios)
  const inicio = timeToMin(hora)
  const dentroDeHorario = horarioDelDia(fecha).some(
    ({ apertura, cierre }) => inicio >= apertura && inicio + duracionMinutos <= cierre
  )
  if (!dentroDeHorario) return fallo('La hora está fuera del horario.')
  if (fecha === hoy && inicio <= minutoActualEnMadrid(ahora)) return fallo('Esa hora ya ha pasado.')

  return {
    ok: true,
    datos: { nombre, email, telefono, servicios: idsServicios, fecha, hora, notas, duracionMinutos },
  }
}
