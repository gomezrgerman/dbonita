import type { Booking } from './types'

async function post(type: string, booking: Booking, extra?: Record<string, unknown>): Promise<void> {
  await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, booking, ...extra }),
  })
}

export async function enviarConfirmacion(booking: Booking): Promise<void> {
  await post('confirmacion', booking)
}

export async function enviarNotificacionNegocio(booking: Booking): Promise<void> {
  await post('negocio', booking)
}

export async function enviarCancelacion(booking: Booking, reembolso: boolean): Promise<void> {
  await post('cancelacion', booking, { reembolso })
}
