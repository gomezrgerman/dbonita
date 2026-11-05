import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Booking } from './types'

const store = vi.hoisted(() => ({ updateBookingEstadoAsync: vi.fn() }))
const email = vi.hoisted(() => ({ enviarCancelacion: vi.fn() }))
const refundsCreate = vi.hoisted(() => vi.fn())

vi.mock('./supabase-store', () => store)
vi.mock('./email-server', () => email)
vi.mock('./stripe-server', () => ({ getStripe: () => ({ refunds: { create: refundsCreate } }) }))

import { cancelarReserva, ReembolsoError } from './cancelacion'

function reserva(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b1',
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
    stripePaymentIntentId: 'pi_1',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  store.updateBookingEstadoAsync.mockImplementation(async (id: string) => ({ ...reserva(), id, estado: 'cancelada' }))
  email.enviarCancelacion.mockResolvedValue(undefined)
  refundsCreate.mockResolvedValue({ id: 're_1' })
})

describe('cancelarReserva', () => {
  it('devuelve la señal, cancela y avisa a la clienta', async () => {
    const r = await cancelarReserva(reserva(), { reembolsar: true, avisar: true, porCentro: false })
    expect(refundsCreate).toHaveBeenCalledWith({ payment_intent: 'pi_1' }, { idempotencyKey: 'reembolso-b1' })
    expect(store.updateBookingEstadoAsync).toHaveBeenCalledWith('b1', 'cancelada')
    expect(email.enviarCancelacion).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1' }), true, false)
    expect(r.reembolsada).toBe(true)
  })

  it('sin reembolso no toca Stripe', async () => {
    const r = await cancelarReserva(reserva(), { reembolsar: false, avisar: true, porCentro: true })
    expect(refundsCreate).not.toHaveBeenCalled()
    expect(email.enviarCancelacion).toHaveBeenCalledWith(expect.anything(), false, true)
    expect(r.reembolsada).toBe(false)
  })

  it('sin aviso no envía email', async () => {
    await cancelarReserva(reserva(), { reembolsar: false, avisar: false, porCentro: true })
    expect(email.enviarCancelacion).not.toHaveBeenCalled()
  })

  it('no intenta reembolsar citas sin pago online', async () => {
    const r = await cancelarReserva(reserva({ stripePaymentIntentId: undefined }), {
      reembolsar: true, avisar: false, porCentro: true,
    })
    expect(refundsCreate).not.toHaveBeenCalled()
    expect(r.reembolsada).toBe(false)
  })

  it('tolera que el pago ya estuviera devuelto', async () => {
    refundsCreate.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'charge_already_refunded' }))
    const r = await cancelarReserva(reserva(), { reembolsar: true, avisar: false, porCentro: false })
    expect(r.reembolsada).toBe(true)
    expect(store.updateBookingEstadoAsync).toHaveBeenCalled()
  })

  it('si Stripe falla no cancela la reserva', async () => {
    refundsCreate.mockRejectedValueOnce(new Error('stripe caído'))
    await expect(
      cancelarReserva(reserva(), { reembolsar: true, avisar: true, porCentro: false })
    ).rejects.toBeInstanceOf(ReembolsoError)
    expect(store.updateBookingEstadoAsync).not.toHaveBeenCalled()
    expect(email.enviarCancelacion).not.toHaveBeenCalled()
  })

  it('un fallo del email no deshace la cancelación', async () => {
    email.enviarCancelacion.mockRejectedValueOnce(new Error('resend caído'))
    const r = await cancelarReserva(reserva(), { reembolsar: false, avisar: true, porCentro: true })
    expect(r.reserva.estado).toBe('cancelada')
  })
})
