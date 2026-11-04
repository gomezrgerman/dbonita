import { describe, it, expect } from 'vitest'
import { tipoDeServicios, cabeEnHueco, type RangoOcupado } from './reservas-capacidad'
import { horarioDelDia, calcularSenalCentimos } from './reservas-reglas'

const r = (inicio: number, fin: number, tipo: RangoOcupado['tipo'] = 'normal'): RangoOcupado => ({ inicio, fin, tipo })

describe('tipoDeServicios', () => {
  it('es "cejas" solo si todos los servicios son de cejas', () => {
    expect(tipoDeServicios(['laminado-cejas'])).toBe('cejas')
    expect(tipoDeServicios(['laminado-cejas', 'cejas-hilo'])).toBe('cejas')
    expect(tipoDeServicios(['laminado-cejas', 'manicura'])).toBe('normal')
  })
  it('es "corporal" si incluye algún corporal', () => {
    expect(tipoDeServicios(['maderoterapia'])).toBe('corporal')
    expect(tipoDeServicios(['manicura', 'drenaje-linfatico'])).toBe('corporal')
  })
  it('es "normal" para el resto', () => {
    expect(tipoDeServicios(['manicura-dbonita'])).toBe('normal')
    expect(tipoDeServicios(['lifting-pestanas'])).toBe('normal')
  })
})

describe('cabeEnHueco', () => {
  it('admite hasta 2 citas normales a la vez', () => {
    expect(cabeEnHueco([r(600, 660)], 600, 660, 'normal')).toBe(true)
    expect(cabeEnHueco([r(600, 660), r(630, 690)], 600, 660, 'normal')).toBe(false)
  })
  it('admite una tercera cita si es solo de cejas', () => {
    expect(cabeEnHueco([r(600, 660), r(600, 660)], 600, 660, 'cejas')).toBe(true)
  })
  it('admite una tercera normal si ya hay una de cejas', () => {
    expect(cabeEnHueco([r(600, 660), r(600, 660, 'cejas')], 600, 660, 'normal')).toBe(true)
  })
  it('nunca pasa de 3 citas a la vez', () => {
    const tres = [r(600, 660), r(600, 660, 'cejas'), r(600, 660, 'cejas')]
    expect(cabeEnHueco(tres, 600, 660, 'cejas')).toBe(false)
  })
  it('solo admite un corporal a la vez (solo lo hace Valeria)', () => {
    expect(cabeEnHueco([r(600, 690, 'corporal')], 630, 720, 'corporal')).toBe(false)
    expect(cabeEnHueco([r(600, 690, 'corporal')], 630, 720, 'normal')).toBe(true)
  })
  it('no cuenta citas que no se solapan', () => {
    expect(cabeEnHueco([r(600, 660), r(660, 720)], 600, 660, 'normal')).toBe(true)
  })
  it('evalúa cada momento del hueco, no solo el inicio', () => {
    // A las 11:00 entran dos normales: una cita de 10:00 a 12:00 ya no cabe
    expect(cabeEnHueco([r(660, 720), r(660, 720)], 600, 720, 'normal')).toBe(false)
  })
  it('un cierre bloquea cualquier cita, también la de cejas', () => {
    expect(cabeEnHueco([r(600, 1140, 'cierre')], 700, 760, 'cejas')).toBe(false)
  })
  it('con una trabajadora bloqueada queda una plaza y la extra de cejas', () => {
    const bloqueo = r(0, 1440, 'trabajadora')
    expect(cabeEnHueco([bloqueo], 600, 660, 'normal')).toBe(true)
    expect(cabeEnHueco([bloqueo, r(600, 660)], 600, 660, 'normal')).toBe(false)
    expect(cabeEnHueco([bloqueo, r(600, 660)], 600, 660, 'cejas')).toBe(true)
  })
})

describe('horarioDelDia', () => {
  it('lunes, miércoles y jueves de 10 a 19', () => {
    expect(horarioDelDia('2026-11-02')).toEqual([{ apertura: 600, cierre: 1140 }])
    expect(horarioDelDia('2026-11-04')).toEqual([{ apertura: 600, cierre: 1140 }])
    expect(horarioDelDia('2026-11-05')).toEqual([{ apertura: 600, cierre: 1140 }])
  })
  it('martes y viernes de 10 a 18', () => {
    expect(horarioDelDia('2026-11-03')).toEqual([{ apertura: 600, cierre: 1080 }])
    expect(horarioDelDia('2026-11-06')).toEqual([{ apertura: 600, cierre: 1080 }])
  })
  it('sábado y domingo cerrado', () => {
    expect(horarioDelDia('2026-11-07')).toEqual([])
    expect(horarioDelDia('2026-11-08')).toEqual([])
  })
})

describe('calcularSenalCentimos', () => {
  it('cobra 10 € cuando el total llega a 10 €', () => {
    expect(calcularSenalCentimos(['manicura'])).toBe(1000)
    expect(calcularSenalCentimos(['bigote-cera', 'decoracion-basica', 'retirado'])).toBe(1000)
  })
  it('cobra 5 € cuando el total no llega a 10 €', () => {
    expect(calcularSenalCentimos(['bigote-cera'])).toBe(500)
    expect(calcularSenalCentimos(['decoracion-basica', 'francesa'])).toBe(500)
  })
  it('cobra 10 € si algún precio es "a consultar"', () => {
    expect(calcularSenalCentimos(['decoracion-elaborada'])).toBe(1000)
  })
})
