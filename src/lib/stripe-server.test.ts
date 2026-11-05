import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

const store = vi.hoisted(() => ({
  createBookingAsync: vi.fn(),
  getBookingByPaymentIntentAsync: vi.fn(),
  slotDisponibleAsync: vi.fn(),
}))
const email = vi.hoisted(() => ({
  enviarConfirmacion: vi.fn(),
  enviarNotificacionNegocio: vi.fn(),
}))
const refundsCreate = vi.hoisted(() => vi.fn())

vi.mock('./supabase-store', () => store)
vi.mock('./email-server', () => email)
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({ refunds: { create: refundsCreate } })),
}))

import { confirmarReservaDesdePago, HorarioOcupadoError } from './stripe-server'

function pago(overrides: Partial<Stripe.PaymentIntent> = {}): Stripe.PaymentIntent {
  return {
    id: 'pi_123',
    status: 'succeeded',
    amount: 1000,
    metadata: {
      nombre: 'Ana',
      email: 'ana@example.com',
      telefono: '600000000',
      servicios: JSON.stringify(['manicura-dbonita']),
      fecha: '2026-12-01',
      hora: '10:00',
      duracion_minutos: '60',
      notas: '',
    },
    ...overrides,
  } as unknown as Stripe.PaymentIntent
}

describe('confirmarReservaDesdePago', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
    store.getBookingByPaymentIntentAsync.mockResolvedValue(null)
    store.slotDisponibleAsync.mockResolvedValue(true)
    store.createBookingAsync.mockImplementation(async (b) => ({ id: 'b1', ...b }))
  })

  it('devuelve la reserva existente sin volver a crearla', async () => {
    store.getBookingByPaymentIntentAsync.mockResolvedValue({ id: 'ya' })
    const r = await confirmarReservaDesdePago(pago())
    expect(r).toEqual({ id: 'ya' })
    expect(store.createBookingAsync).not.toHaveBeenCalled()
    expect(store.slotDisponibleAsync).not.toHaveBeenCalled()
  })

  it('crea la reserva y envía los emails si el hueco sigue libre', async () => {
    const r = await confirmarReservaDesdePago(pago())
    expect(store.slotDisponibleAsync).toHaveBeenCalledWith('2026-12-01', '10:00', 60, ['manicura-dbonita'])
    expect(r.id).toBe('b1')
    expect(r.importePagado).toBe(10)
    expect(email.enviarConfirmacion).toHaveBeenCalledOnce()
    expect(email.enviarNotificacionNegocio).toHaveBeenCalledOnce()
    expect(refundsCreate).not.toHaveBeenCalled()
  })

  it('si el hueco se ocupó mientras pagaba, devuelve la señal y no crea la reserva', async () => {
    store.slotDisponibleAsync.mockResolvedValue(false)
    await expect(confirmarReservaDesdePago(pago())).rejects.toBeInstanceOf(HorarioOcupadoError)
    expect(refundsCreate).toHaveBeenCalledWith(
      { payment_intent: 'pi_123' },
      { idempotencyKey: 'reembolso-ocupado-pi_123' }
    )
    expect(store.createBookingAsync).not.toHaveBeenCalled()
    expect(email.enviarConfirmacion).not.toHaveBeenCalled()
  })

  it('tolera que el reembolso ya se hubiera hecho (webhook y navegador a la vez)', async () => {
    store.slotDisponibleAsync.mockResolvedValue(false)
    refundsCreate.mockRejectedValueOnce(Object.assign(new Error('done'), { code: 'charge_already_refunded' }))
    await expect(confirmarReservaDesdePago(pago())).rejects.toBeInstanceOf(HorarioOcupadoError)
  })

  it('rechaza pagos que no se han completado', async () => {
    await expect(confirmarReservaDesdePago(pago({ status: 'processing' }))).rejects.toThrow('processing')
    expect(store.createBookingAsync).not.toHaveBeenCalled()
  })
})
