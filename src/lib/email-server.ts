// Envío de emails vía API REST de EmailJS. SOLO servidor.
// En EmailJS → Account → Security hay que activar "Allow EmailJS API for non-browser applications".
import { SERVICIOS } from './constants'
import type { Booking } from './types'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`
}

function resolverNombres(ids: string[]): string {
  return ids.map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id).join(', ')
}

async function sendViaEmailJS(templateId: string | undefined, params: Record<string, string>): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  if (!serviceId || !templateId || !publicKey) {
    console.warn('[email] EmailJS no configurado — email omitido')
    return
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      // Private key: obligatoria si EmailJS tiene activado "Use Private Key"
      ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
      template_params: params,
    }),
  })
  if (!res.ok) {
    console.error('[email] EmailJS error:', res.status, await res.text())
  }
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dbonita.es'
}

export async function enviarConfirmacion(booking: Booking): Promise<void> {
  if (!booking.clienteEmail) return
  await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_CONFIRMACION, {
    to_name:         booking.clienteNombre,
    to_email:        booking.clienteEmail,
    servicio:        resolverNombres(booking.servicios),
    fecha:           formatFecha(booking.fecha),
    hora:            booking.hora,
    importe_pagado:  `${booking.importePagado}€`,
    url_cancelacion: `${siteUrl()}/cancelar/${booking.id}`,
    notas:           booking.notas || 'Sin notas',
  })
}

export async function enviarNotificacionNegocio(booking: Booking): Promise<void> {
  const businessEmail = process.env.EMAILJS_BUSINESS_EMAIL
  if (!businessEmail) return
  await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_NEGOCIO, {
    to_email:         businessEmail,
    cliente_nombre:   booking.clienteNombre,
    cliente_telefono: booking.clienteTelefono,
    cliente_email:    booking.clienteEmail,
    servicio:         resolverNombres(booking.servicios),
    fecha:            formatFecha(booking.fecha),
    hora:             booking.hora,
    importe_pagado:   `${booking.importePagado}€`,
    notas:            booking.notas || 'Sin notas',
  })
}

export async function enviarCancelacion(booking: Booking, reembolso: boolean): Promise<void> {
  if (!booking.clienteEmail) return
  await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_CANCELACION, {
    to_name:   booking.clienteNombre,
    to_email:  booking.clienteEmail,
    servicio:  resolverNombres(booking.servicios),
    fecha:     formatFecha(booking.fecha),
    hora:      booking.hora,
    reembolso: reembolso
      ? `Se te devolverán ${booking.importePagado}€ en 5-10 días hábiles.`
      : `La señal de ${booking.importePagado}€ no es reembolsable por cancelación con menos de 24 horas de antelación.`,
  })
}
