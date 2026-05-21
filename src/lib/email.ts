import emailjs from '@emailjs/browser'
import { Booking } from './types'
import { SERVICIOS } from './constants'

function resolverNombresServicios(ids: string[]): string {
  return ids
    .map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id)
    .join(', ')
}

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? ''
const TEMPLATE_CONFIRMACION = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONFIRMACION ?? ''
const TEMPLATE_CANCELACION = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CANCELACION ?? ''
const TEMPLATE_NEGOCIO = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_NEGOCIO ?? ''
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? ''
const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? ''

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`
}

export async function enviarConfirmacion(booking: Booking): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_CONFIRMACION || !PUBLIC_KEY) {
    console.warn('[EmailJS] Variables de entorno no configuradas — email no enviado')
    return
  }

  const urlCancelacion = `${window.location.origin}/cancelar/${booking.id}`

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_CONFIRMACION,
    {
      to_name: booking.clienteNombre,
      to_email: booking.clienteEmail,
      servicio: resolverNombresServicios(booking.servicios),
      fecha: formatFecha(booking.fecha),
      hora: booking.hora,
      importe_pagado: `${booking.importePagado}€`,
      url_cancelacion: urlCancelacion,
      notas: booking.notas || 'Sin notas',
    },
    PUBLIC_KEY
  )
}

export async function enviarNotificacionNegocio(booking: Booking): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_NEGOCIO || !PUBLIC_KEY || !BUSINESS_EMAIL) return

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_NEGOCIO,
    {
      to_email: BUSINESS_EMAIL,
      cliente_nombre: booking.clienteNombre,
      cliente_telefono: booking.clienteTelefono,
      cliente_email: booking.clienteEmail,
      servicio: resolverNombresServicios(booking.servicios),
      fecha: formatFecha(booking.fecha),
      hora: booking.hora,
      importe_pagado: `${booking.importePagado}€`,
      notas: booking.notas || 'Sin notas',
    },
    PUBLIC_KEY
  )
}

export async function enviarCancelacion(booking: Booking, reembolso: boolean): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_CANCELACION || !PUBLIC_KEY) {
    console.warn('[EmailJS] Variables de entorno no configuradas — email no enviado')
    return
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_CANCELACION,
    {
      to_name: booking.clienteNombre,
      to_email: booking.clienteEmail,
      servicio: resolverNombresServicios(booking.servicios),
      fecha: formatFecha(booking.fecha),
      hora: booking.hora,
      reembolso: reembolso ? `Se te devolverán ${booking.importePagado}€ en 5-7 días hábiles.` : `La señal de ${booking.importePagado}€ no es reembolsable por cancelación con menos de 24 horas de antelación.`,
    },
    PUBLIC_KEY
  )
}
