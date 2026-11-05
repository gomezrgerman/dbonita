import { describe, it, expect } from 'vitest'
import { mensajeSolicitudWhatsApp } from './reservas-modo'

const textos = {
  intro: 'Hola, me gustaría reservar:',
  duration: 'Duración',
  total: 'Total',
  ask: '¿Qué días tenéis libres?',
}

describe('mensajeSolicitudWhatsApp', () => {
  it('lista los servicios con precio, la duración y el total', () => {
    const msg = mensajeSolicitudWhatsApp(
      [{ nombre: 'Manicura DBonita', precio: '25€' }, { nombre: 'Francesa', precio: '5€' }],
      '1h 15min',
      '30€',
      textos
    )
    expect(msg).toBe(
      'Hola, me gustaría reservar:\n• Manicura DBonita (25€)\n• Francesa (5€)\nDuración: 1h 15min · Total: 30€\n\n¿Qué días tenéis libres?'
    )
  })

  it('omite el total cuando el precio es a consultar', () => {
    const msg = mensajeSolicitudWhatsApp([{ nombre: 'Drenaje Linfático' }], '1h 30min', null, textos)
    expect(msg).toContain('• Drenaje Linfático\n')
    expect(msg).toContain('Duración: 1h 30min\n')
    expect(msg).not.toContain('Total')
  })
})
