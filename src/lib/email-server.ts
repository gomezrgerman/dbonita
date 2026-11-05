// Envío de emails con la API de Resend (https://resend.com). SOLO servidor.
// Variables: RESEND_API_KEY (obligatoria), EMAIL_FROM, EMAIL_REPLY_TO, EMAIL_NEGOCIO.
// Si falta RESEND_API_KEY el email se omite sin romper la reserva.
import type { Booking } from './types'
import {
  plantillaCancelacion,
  plantillaConfirmacion,
  plantillaNegocio,
  type EmailContenido,
} from './email-plantillas'

const FROM_DEFECTO = 'D Bonita <reservas@dbonita.es>'
const REPLY_TO_DEFECTO = 'dbonitadenia@gmail.com'

interface Envio {
  to: string
  replyTo: string
  contenido: EmailContenido
  /** Evita duplicados si el webhook y el navegador confirman a la vez */
  idempotencyKey: string
}

async function enviar({ to, replyTo, contenido, idempotencyKey }: Envio): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY no configurada: email omitido')
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || FROM_DEFECTO,
        to: [to],
        reply_to: replyTo,
        subject: contenido.subject,
        html: contenido.html,
        text: contenido.text,
      }),
    })
    if (!res.ok) console.error('[email] Resend error:', res.status, await res.text())
  } catch (err) {
    console.error('[email] Resend no disponible:', err instanceof Error ? err.message : err)
  }
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dbonita.es'
}

function replyToNegocio(): string {
  return process.env.EMAIL_REPLY_TO || REPLY_TO_DEFECTO
}

export async function enviarConfirmacion(booking: Booking): Promise<void> {
  if (!booking.clienteEmail) return
  await enviar({
    to: booking.clienteEmail,
    replyTo: replyToNegocio(),
    contenido: plantillaConfirmacion(booking, siteUrl()),
    idempotencyKey: `confirmacion-${booking.id}`,
  })
}

export async function enviarNotificacionNegocio(booking: Booking): Promise<void> {
  const destino = process.env.EMAIL_NEGOCIO || REPLY_TO_DEFECTO
  await enviar({
    to: destino,
    replyTo: booking.clienteEmail || replyToNegocio(),
    contenido: plantillaNegocio(booking),
    idempotencyKey: `negocio-${booking.id}`,
  })
}

export async function enviarCancelacion(booking: Booking, reembolso: boolean, porCentro = false): Promise<void> {
  if (!booking.clienteEmail) return
  await enviar({
    to: booking.clienteEmail,
    replyTo: replyToNegocio(),
    contenido: plantillaCancelacion(booking, reembolso, porCentro),
    idempotencyKey: `cancelacion-${booking.id}`,
  })
}
