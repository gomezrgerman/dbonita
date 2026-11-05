// Plantillas de los emails de reserva. Funciones puras: sin envío ni variables de entorno.
import { SERVICIOS } from './constants'
import type { Booking } from './types'

export interface EmailContenido {
  subject: string
  html: string
  text: string
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIRECCION = 'Carrer del Cop, 5 · 1º 2ª · Dénia'
const WHATSAPP_URL = 'https://wa.me/34657332722'
const WHATSAPP_TXT = '+34 657 33 27 22'

export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Los asuntos no pueden llevar saltos de línea (evita inyección de cabeceras). */
function lineaUnica(valor: string): string {
  return valor.replace(/[\r\n]+/g, ' ').trim()
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${parseInt(d, 10)} de ${MESES[parseInt(m, 10) - 1]} de ${y}`
}

function nombresServicios(ids: string[]): string {
  return ids.map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id).join(', ')
}

function filas(datos: Array<[string, string]>): string {
  return datos
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#8a7060">${k}</td><td style="padding:8px 0;text-align:right"><strong>${escaparHtml(v)}</strong></td></tr>`
    )
    .join('')
}

function marco(titulo: string, cuerpo: string): string {
  return `<div style="margin:0;padding:24px;background:#faf7f4;font-family:Arial,Helvetica,sans-serif;color:#2c2420">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e8d5c0">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7060">D Bonita · Dénia</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#000">${titulo}</h1>
    ${cuerpo}
  </div>
</div>`
}

const PIE = `<p style="margin:28px 0 0;font-size:13px;color:#8a7060">Dudas: WhatsApp <a href="${WHATSAPP_URL}" style="color:#2c2420">${WHATSAPP_TXT}</a></p>`

export function plantillaConfirmacion(b: Booking, siteUrl: string): EmailContenido {
  const fecha = formatFecha(b.fecha)
  const servicio = nombresServicios(b.servicios)
  const urlCancelar = `${siteUrl}/cancelar/${encodeURIComponent(b.id)}`
  const notas = b.notas || 'Sin notas'

  const html = marco(
    `Hola ${escaparHtml(b.clienteNombre)}, tu cita está confirmada`,
    `<table style="width:100%;border-collapse:collapse;font-size:15px">${filas([
      ['Tratamiento', servicio],
      ['Fecha', fecha],
      ['Hora', b.hora],
      ['Señal pagada', `${b.importePagado}€`],
      ['Notas', notas],
    ])}</table>
    <p style="margin:24px 0 8px;font-size:14px;line-height:1.6">Te esperamos en <strong>${DIRECCION}</strong>. El resto del importe se abona en el estudio.</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6">Puedes cancelar gratis hasta 24 horas antes y te devolvemos la señal automáticamente.</p>
    <a href="${urlCancelar}" style="display:inline-block;padding:12px 20px;border-radius:10px;border:1px solid #2c2420;color:#2c2420;text-decoration:none;font-size:14px">Cancelar mi cita</a>
    ${PIE}`
  )

  const text = [
    `Hola ${b.clienteNombre}, tu cita en D Bonita está confirmada.`,
    '',
    `Tratamiento: ${servicio}`,
    `Fecha: ${fecha}`,
    `Hora: ${b.hora}`,
    `Señal pagada: ${b.importePagado}€`,
    `Notas: ${notas}`,
    '',
    `Te esperamos en ${DIRECCION}. El resto del importe se abona en el estudio.`,
    'Puedes cancelar gratis hasta 24 horas antes y te devolvemos la señal automáticamente:',
    urlCancelar,
    '',
    `Dudas: WhatsApp ${WHATSAPP_TXT}`,
  ].join('\n')

  return { subject: `Tu cita en D Bonita está confirmada - ${fecha} a las ${b.hora}`, html, text }
}

export function plantillaNegocio(b: Booking): EmailContenido {
  const fecha = formatFecha(b.fecha)
  const servicio = nombresServicios(b.servicios)
  const notas = b.notas || 'Sin notas'
  const datos: Array<[string, string]> = [
    ['Clienta', b.clienteNombre],
    ['Teléfono', b.clienteTelefono],
    ['Email', b.clienteEmail],
    ['Tratamiento', servicio],
    ['Fecha', `${fecha} a las ${b.hora}`],
    ['Señal pagada', `${b.importePagado}€`],
    ['Notas', notas],
  ]

  const html = marco(
    'Nueva reserva desde la web',
    `<table style="width:100%;border-collapse:collapse;font-size:15px">${filas(datos)}</table>
    <p style="margin:16px 0 0;font-size:13px;color:#8a7060">Ya aparece en el panel: https://www.dbonita.es/panel</p>`
  )
  const text = ['Nueva reserva desde la web', '', ...datos.map(([k, v]) => `${k}: ${v}`)].join('\n')

  return { subject: lineaUnica(`Nueva reserva: ${b.clienteNombre} - ${fecha} ${b.hora}`), html, text }
}

export function plantillaCancelacion(b: Booking, reembolso: boolean): EmailContenido {
  const fecha = formatFecha(b.fecha)
  const servicio = nombresServicios(b.servicios)
  const mensaje = reembolso
    ? `Se te devolverán ${b.importePagado}€ en 5-10 días hábiles.`
    : `La señal de ${b.importePagado}€ no es reembolsable por cancelación con menos de 24 horas de antelación.`

  const html = marco(
    `Hola ${escaparHtml(b.clienteNombre)}, tu cita se ha cancelado`,
    `<table style="width:100%;border-collapse:collapse;font-size:15px">${filas([
      ['Tratamiento', servicio],
      ['Fecha', fecha],
      ['Hora', b.hora],
    ])}</table>
    <p style="margin:24px 0;font-size:14px;line-height:1.6">${mensaje}</p>
    <a href="https://www.dbonita.es/#servicios" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#000;color:#fff;text-decoration:none;font-size:14px">Reservar otra cita</a>
    ${PIE}`
  )
  const text = [
    `Hola ${b.clienteNombre}, tu cita en D Bonita se ha cancelado.`,
    '',
    `Tratamiento: ${servicio}`,
    `Fecha: ${fecha}`,
    `Hora: ${b.hora}`,
    '',
    mensaje,
    '',
    `Dudas: WhatsApp ${WHATSAPP_TXT}`,
  ].join('\n')

  return { subject: 'Tu cita en D Bonita ha sido cancelada', html, text }
}
