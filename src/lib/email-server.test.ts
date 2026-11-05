import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enviarConfirmacion, enviarNotificacionNegocio } from './email-server'
import type { Booking } from './types'

const reserva: Booking = {
  id: 'abc-123',
  clienteNombre: 'Ana',
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

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response('{"id":"x"}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('EMAIL_FROM', '')
  vi.stubEnv('EMAIL_NEGOCIO', 'centro@example.com')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('email-server (Resend)', () => {
  it('envía la confirmación a la clienta con clave de idempotencia', async () => {
    await enviarConfirmacion(reserva)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers.Authorization).toBe('Bearer re_test')
    expect(init.headers['Idempotency-Key']).toBe('confirmacion-abc-123')
    const body = JSON.parse(init.body)
    expect(body.to).toEqual(['ana@example.com'])
    expect(body.from).toBe('D Bonita <reservas@dbonita.es>')
    expect(body.reply_to).toBe('dbonitadenia@gmail.com')
  })

  it('el aviso al centro va a EMAIL_NEGOCIO y responde a la clienta', async () => {
    await enviarNotificacionNegocio(reserva)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.to).toEqual(['centro@example.com'])
    expect(body.reply_to).toBe('ana@example.com')
  })

  it('sin RESEND_API_KEY no envía nada', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    await enviarConfirmacion(reserva)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('un fallo de Resend no rompe la reserva', async () => {
    fetchMock.mockRejectedValueOnce(new Error('red caída'))
    await expect(enviarConfirmacion(reserva)).resolves.toBeUndefined()
  })
})
