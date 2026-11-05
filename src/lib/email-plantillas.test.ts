import { describe, it, expect } from 'vitest'
import {
  escaparHtml,
  formatFecha,
  plantillaConfirmacion,
  plantillaCancelacion,
  plantillaNegocio,
} from './email-plantillas'
import type { Booking } from './types'

const reserva: Booking = {
  id: 'abc-123',
  clienteNombre: 'Ana López',
  clienteEmail: 'ana@example.com',
  clienteTelefono: '600000000',
  servicios: ['manicura-dbonita'],
  duracionMinutos: 60,
  fecha: '2026-12-01',
  hora: '10:00',
  notas: '',
  estado: 'confirmada',
  pagado: true,
  importePagado: 10,
  creadoEn: '2026-11-05T10:00:00Z',
}

describe('escaparHtml', () => {
  it('neutraliza etiquetas y comillas', () => {
    expect(escaparHtml('<b>"x" & \'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;')
  })
})

describe('formatFecha', () => {
  it('formatea en español', () => {
    expect(formatFecha('2026-12-01')).toBe('1 de diciembre de 2026')
  })
})

describe('plantillaConfirmacion', () => {
  const e = plantillaConfirmacion(reserva, 'https://www.dbonita.es')

  it('incluye datos de la cita y el enlace de cancelación', () => {
    expect(e.subject).toBe('Tu cita en D Bonita está confirmada - 1 de diciembre de 2026 a las 10:00')
    expect(e.html).toContain('Hola Ana,')
    expect(e.html).toContain('google.com/maps')
    expect(e.html).toContain('Manicura DBonita')
    expect(e.html).toContain('10€')
    expect(e.html).toContain('https://www.dbonita.es/cancelar/abc-123')
    expect(e.text).toContain('https://www.dbonita.es/cancelar/abc-123')
  })

  it('escapa lo que escribe la clienta', () => {
    const r = plantillaConfirmacion(
      { ...reserva, clienteNombre: '<script>x</script>', notas: '<img src=x>' },
      'https://www.dbonita.es'
    )
    expect(r.html).not.toContain('<script>')
    expect(r.html).not.toContain('<img src=x>')
    expect(r.html).toContain('&lt;img src=x&gt;')
    expect(r.html).toContain('&lt;script&gt;')
  })
})

describe('plantillaNegocio', () => {
  it('resume la reserva para el centro', () => {
    const e = plantillaNegocio({ ...reserva, notas: 'Alergia al látex' })
    expect(e.subject).toBe('Nueva reserva: Ana López - 1 de diciembre de 2026 10:00')
    expect(e.html).toContain('600000000')
    expect(e.html).toContain('Alergia al látex')
    expect(e.html).toContain('https://wa.me/34600000000')
  })

  it('quita saltos de línea del asunto', () => {
    const e = plantillaNegocio({ ...reserva, clienteNombre: 'Ana\nBcc: x@y.z' })
    expect(e.subject).not.toMatch(/[\r\n]/)
  })
})

describe('plantillaCancelacion', () => {
  it('indica devolución cuando hay reembolso', () => {
    expect(plantillaCancelacion(reserva, true).html).toContain('Se te devolverán 10€')
  })

  it('si cancela el centro sin devolver, no culpa a la clienta del plazo', () => {
    const html = plantillaCancelacion(reserva, false, true).html
    expect(html).toContain('Desde D Bonita hemos cancelado')
    expect(html).not.toContain('no es reembolsable')
  })

  it('indica que la señal no se devuelve sin reembolso', () => {
    expect(plantillaCancelacion(reserva, false).html).toContain('no es reembolsable')
  })
})
