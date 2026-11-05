// Plantillas de los emails de reserva, con la identidad visual de la web
// (rosa del hero, amarillo y azul del logo, titulares negros en negrita).
// Funciones puras: sin envío ni variables de entorno.
import { SERVICIOS } from './constants'
import type { Booking } from './types'

export interface EmailContenido {
  subject: string
  html: string
  text: string
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const C = {
  rosa: '#ffb8cb',
  amarillo: '#F9BC1A',
  amarilloClaro: '#FDE9A0',
  azul: '#6CC4E6',
  azulTexto: '#1A3A4A',
  fondo: '#faf9f7',
  borde: '#eee9df',
  gris: '#9f9b93',
  grisOscuro: '#55534e',
} as const

const WEB = 'https://www.dbonita.es'
const LOGO_URL = `${WEB}/img/logo-email.png`
const DIRECCION = 'Carrer del Cop, 5 · 1º 2ª · Dénia'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Carrer%20del%20Cop%205%2C%2003700%20D%C3%A9nia'
const WHATSAPP_URL = 'https://wa.me/34657332722'
const WHATSAPP_TXT = '+34 657 33 27 22'
const INSTAGRAM_URL = 'https://www.instagram.com/dbonitadenia/'
const FUENTE = "'Plus Jakarta Sans',Arial,Helvetica,sans-serif"

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

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] || nombre
}

/** Teléfono en formato internacional sin "+" para enlaces de WhatsApp. */
function telefonoInternacional(tel: string): string {
  const digitos = tel.replace(/\D/g, '')
  return digitos.length === 9 ? `34${digitos}` : digitos
}

// ── Piezas ────────────────────────────────────────────────

function titulo(antes: string, acento: string): string {
  return `<h1 style="margin:0 0 6px;font-size:26px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:#000">${antes} <span style="color:${C.amarillo}">${acento}</span>.</h1>`
}

function etiqueta(texto: string): string {
  return `<p style="margin:0 0 6px;font-family:'Space Mono',Courier,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.gris}">${texto}</p>`
}

function resumen(datos: Array<[string, string]>, destacado?: [string, string]): string {
  const borde = (i: number) => (i > 0 ? `border-top:1px solid ${C.borde};` : '')
  const filas = datos.map(
    ([k, v], i) =>
      `<tr><td style="padding:12px 16px;color:${C.gris};${borde(i)}">${k}</td><td style="padding:12px 16px;text-align:right;font-weight:700;${borde(i)}">${escaparHtml(v)}</td></tr>`
  )
  if (destacado) {
    filas.push(
      `<tr><td style="padding:12px 16px;color:${C.gris};${borde(1)}">${destacado[0]}</td><td style="padding:12px 16px;text-align:right;${borde(1)}"><span style="background:${C.amarilloClaro};padding:3px 10px;border-radius:999px;font-weight:800">${escaparHtml(destacado[1])}</span></td></tr>`
    )
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;font-size:15px;background:${C.fondo};border-radius:14px">${filas.join('')}</table>`
}

function botonAzul(texto: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:13px 24px;border-radius:12px;background:${C.azul};color:${C.azulTexto};text-decoration:none;font-size:14px;font-weight:700">${texto}</a>`
}

function botonBorde(texto: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:12px;border:1.5px solid #000;color:#000;text-decoration:none;font-size:14px;font-weight:700">${texto}</a>`
}

function marco(cuerpo: string): string {
  return `<div style="margin:0;padding:24px 12px;background:${C.fondo};font-family:${FUENTE};color:#000">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${C.borde}">
    <div style="background:${C.rosa};text-align:center;padding:20px 0 14px">
      <a href="${WEB}"><img src="${LOGO_URL}" width="115" height="120" alt="D Bonita" style="display:inline-block;border:0"></a>
    </div>
    <div style="padding:28px 28px 30px">
      ${cuerpo}
    </div>
    <div style="background:#000;color:#ffffff;padding:18px 28px;font-size:13px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="color:#ffffff"><span style="color:${C.amarillo};font-weight:800">D</span><strong>Bonita</strong></td>
        <td style="text-align:right"><a href="${WHATSAPP_URL}" style="color:${C.azul};text-decoration:none">WhatsApp</a> &nbsp;·&nbsp; <a href="${INSTAGRAM_URL}" style="color:${C.azul};text-decoration:none">Instagram</a></td>
      </tr></table>
    </div>
  </div>
</div>`
}

// ── Emails ────────────────────────────────────────────────

export function plantillaConfirmacion(b: Booking, siteUrl: string): EmailContenido {
  const fecha = formatFecha(b.fecha)
  const servicio = nombresServicios(b.servicios)
  const urlCancelar = `${siteUrl}/cancelar/${encodeURIComponent(b.id)}`
  const nombre = escaparHtml(primerNombre(b.clienteNombre))
  const datos: Array<[string, string]> = [
    ['Tratamiento', servicio],
    ['Fecha', fecha],
    ['Hora', b.hora],
  ]
  if (b.notas) datos.push(['Notas', b.notas])

  const html = marco(`${etiqueta('Estudio de belleza · Dénia')}
      ${titulo(`Hola ${nombre}, tu cita está`, 'confirmada')}
      <p style="margin:0 0 22px;font-size:14px;color:${C.grisOscuro}">Te esperamos. Aquí tienes el resumen:</p>
      ${resumen(datos, ['Señal pagada', `${b.importePagado}€`])}
      <p style="margin:22px 0 6px;font-size:14px;line-height:1.6">📍 <strong>${DIRECCION}</strong><br><span style="color:${C.grisOscuro}">El resto del importe se abona en el estudio.</span></p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${C.grisOscuro}">Puedes cancelar gratis hasta 24 horas antes y te devolvemos la señal automáticamente.</p>
      ${botonAzul('Cómo llegar', MAPS_URL)}${botonBorde('Cancelar mi cita', urlCancelar)}`)

  const text = [
    `Hola ${primerNombre(b.clienteNombre)}, tu cita en D Bonita está confirmada.`,
    '',
    `Tratamiento: ${servicio}`,
    `Fecha: ${fecha}`,
    `Hora: ${b.hora}`,
    `Señal pagada: ${b.importePagado}€`,
    ...(b.notas ? [`Notas: ${b.notas}`] : []),
    '',
    `Te esperamos en ${DIRECCION}. El resto del importe se abona en el estudio.`,
    `Cómo llegar: ${MAPS_URL}`,
    '',
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
  const tel = telefonoInternacional(b.clienteTelefono)
  const datos: Array<[string, string]> = [
    ['Clienta', b.clienteNombre],
    ['Teléfono', b.clienteTelefono],
    ['Email', b.clienteEmail],
    ['Tratamiento', servicio],
    ['Fecha', `${fecha} a las ${b.hora}`],
    ['Notas', notas],
  ]

  const html = marco(`${etiqueta('Reserva desde la web')}
      ${titulo('Nueva', 'reserva')}
      <p style="margin:0 0 22px;font-size:14px;color:${C.grisOscuro}">Ya aparece en el panel de reservas.</p>
      ${resumen(datos, ['Señal pagada', `${b.importePagado}€`])}
      <div style="margin-top:24px">
        ${tel ? botonAzul('Escribir por WhatsApp', `https://wa.me/${tel}`) : ''}${tel ? botonBorde('Llamar', `tel:+${tel}`) : ''}${botonBorde('Abrir el panel', `${WEB}/panel`)}
      </div>`)

  const text = [
    'Nueva reserva desde la web',
    '',
    ...datos.map(([k, v]) => `${k}: ${v}`),
    `Señal pagada: ${b.importePagado}€`,
    '',
    `Panel: ${WEB}/panel`,
  ].join('\n')

  return { subject: lineaUnica(`Nueva reserva: ${b.clienteNombre} - ${fecha} ${b.hora}`), html, text }
}

export function plantillaCancelacion(b: Booking, reembolso: boolean, porCentro = false): EmailContenido {
  const fecha = formatFecha(b.fecha)
  const servicio = nombresServicios(b.servicios)
  const nombre = escaparHtml(primerNombre(b.clienteNombre))
  const sinPago = !(b.importePagado > 0)
  const mensaje = reembolso
    ? `Se te devolverán ${b.importePagado}€ en 5-10 días hábiles.`
    : porCentro || sinPago
      ? 'Si tienes cualquier duda, escríbenos por WhatsApp y lo hablamos.'
      : `La señal de ${b.importePagado}€ no es reembolsable por cancelación con menos de 24 horas de antelación.`
  const intro = porCentro ? 'Desde D Bonita hemos cancelado esta cita:' : 'Esta era la cita:'

  const html = marco(`${etiqueta('Estudio de belleza · Dénia')}
      ${titulo(`Hola ${nombre}, tu cita se ha`, 'cancelado')}
      <p style="margin:0 0 22px;font-size:14px;color:${C.grisOscuro}">${intro}</p>
      ${resumen([
        ['Tratamiento', servicio],
        ['Fecha', fecha],
        ['Hora', b.hora],
      ])}
      <p style="margin:22px 0 24px;font-size:14px;line-height:1.6">${mensaje}</p>
      ${botonAzul('Reservar otra cita', `${WEB}/#servicios`)}`)

  const text = [
    `Hola ${primerNombre(b.clienteNombre)}, tu cita en D Bonita se ha cancelado.`,
    '',
    `Tratamiento: ${servicio}`,
    `Fecha: ${fecha}`,
    `Hora: ${b.hora}`,
    '',
    mensaje,
    '',
    `Reservar otra cita: ${WEB}/#servicios`,
    `Dudas: WhatsApp ${WHATSAPP_TXT}`,
  ].join('\n')

  return { subject: 'Tu cita en D Bonita ha sido cancelada', html, text }
}
