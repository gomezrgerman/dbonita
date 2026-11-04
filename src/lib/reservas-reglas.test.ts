import { describe, it, expect } from 'vitest'
import {
  madridAUtc,
  hoyEnMadrid,
  horasHastaCita,
  validarSolicitudReserva,
  type SolicitudReserva,
} from './reservas-reglas'

// Lunes 20 oct 2026, 09:00 en Madrid (CEST, UTC+2) = 07:00 UTC
const AHORA = new Date('2026-10-20T07:00:00Z')

const base: SolicitudReserva = {
  nombre: 'Laura',
  email: 'laura@correo.es',
  telefono: '600 123 456',
  servicios: ['manicura'],
  fecha: '2026-10-21',
  hora: '10:00',
  notas: '',
}

describe('madridAUtc', () => {
  it('convierte hora de verano (UTC+2)', () => {
    expect(madridAUtc('2026-07-15', '10:00').toISOString()).toBe('2026-07-15T08:00:00.000Z')
  })
  it('convierte hora de invierno (UTC+1)', () => {
    expect(madridAUtc('2026-12-15', '10:00').toISOString()).toBe('2026-12-15T09:00:00.000Z')
  })
})

describe('hoyEnMadrid', () => {
  it('usa la fecha de Madrid aunque en UTC aún sea el día anterior', () => {
    expect(hoyEnMadrid(new Date('2026-10-20T22:30:00Z'))).toBe('2026-10-21')
  })
})

describe('horasHastaCita', () => {
  it('calcula las horas restantes en hora de Madrid', () => {
    expect(horasHastaCita('2026-10-21', '09:00', AHORA)).toBe(24)
  })
})

describe('validarSolicitudReserva', () => {
  it('acepta una solicitud válida y calcula la duración en servidor', () => {
    const r = validarSolicitudReserva(base, AHORA)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.duracionMinutos).toBeGreaterThan(0)
  })

  it('rechaza fechas pasadas', () => {
    expect(validarSolicitudReserva({ ...base, fecha: '2026-10-19' }, AHORA).ok).toBe(false)
  })

  it('rechaza sábados y domingos', () => {
    expect(validarSolicitudReserva({ ...base, fecha: '2026-10-24' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, fecha: '2026-10-25' }, AHORA).ok).toBe(false)
  })

  it('rechaza horas fuera del horario', () => {
    expect(validarSolicitudReserva({ ...base, hora: '09:00' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, hora: '18:45' }, AHORA).ok).toBe(false)
  })

  it('rechaza una hora de hoy que ya ha pasado', () => {
    const tarde = new Date('2026-10-20T10:00:00Z') // 12:00 en Madrid
    expect(validarSolicitudReserva({ ...base, fecha: '2026-10-20', hora: '11:00' }, tarde).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, fecha: '2026-10-20', hora: '13:00' }, tarde).ok).toBe(true)
  })

  it('rechaza servicios desconocidos o vacíos', () => {
    expect(validarSolicitudReserva({ ...base, servicios: ['no-existe'] }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, servicios: [] }, AHORA).ok).toBe(false)
  })

  it('rechaza email, teléfono o nombre inválidos', () => {
    expect(validarSolicitudReserva({ ...base, email: 'no-es-email' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, telefono: '123' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, nombre: '  ' }, AHORA).ok).toBe(false)
  })

  it('rechaza formatos de fecha u hora mal formados', () => {
    expect(validarSolicitudReserva({ ...base, fecha: '21/10/2026' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, fecha: '2026-02-30' }, AHORA).ok).toBe(false)
    expect(validarSolicitudReserva({ ...base, hora: '10h' }, AHORA).ok).toBe(false)
  })
})
