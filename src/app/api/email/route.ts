import { NextResponse } from 'next/server'
import type { Booking } from '@/lib/types'
import { SERVICIOS } from '@/lib/constants'

const SERVICE_ID   = process.env.EMAILJS_SERVICE_ID   ?? ''
const TPL_CONFIRM  = process.env.EMAILJS_TEMPLATE_CONFIRMACION ?? ''
const TPL_CANCEL   = process.env.EMAILJS_TEMPLATE_CANCELACION  ?? ''
const TPL_NEGOCIO  = process.env.EMAILJS_TEMPLATE_NEGOCIO      ?? ''
const PUBLIC_KEY   = process.env.EMAILJS_PUBLIC_KEY   ?? ''
const BUSINESS_EMAIL = process.env.EMAILJS_BUSINESS_EMAIL ?? ''
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dbonita.es'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`
}

function resolverNombres(ids: string[]): string {
  return ids.map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id).join(', ')
}

async function sendViaEmailJS(templateId: string, params: Record<string, string>): Promise<void> {
  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.warn('[email] EmailJS no configurado — email omitido')
    return
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: SERVICE_ID, template_id: templateId, user_id: PUBLIC_KEY, template_params: params }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[email] EmailJS error:', res.status, text)
  }
}

export async function POST(req: Request) {
  try {
    const { type, booking, reembolso } = (await req.json()) as {
      type: 'confirmacion' | 'negocio' | 'cancelacion'
      booking: Booking
      reembolso?: boolean
    }

    if (type === 'confirmacion') {
      await sendViaEmailJS(TPL_CONFIRM, {
        to_name:        booking.clienteNombre,
        to_email:       booking.clienteEmail,
        servicio:       resolverNombres(booking.servicios),
        fecha:          formatFecha(booking.fecha),
        hora:           booking.hora,
        importe_pagado: `${booking.importePagado}€`,
        url_cancelacion: `${SITE_URL}/cancelar/${booking.id}`,
        notas:          booking.notas || 'Sin notas',
      })
    }

    if (type === 'negocio' && BUSINESS_EMAIL) {
      await sendViaEmailJS(TPL_NEGOCIO, {
        to_email:        BUSINESS_EMAIL,
        cliente_nombre:  booking.clienteNombre,
        cliente_telefono: booking.clienteTelefono,
        cliente_email:   booking.clienteEmail,
        servicio:        resolverNombres(booking.servicios),
        fecha:           formatFecha(booking.fecha),
        hora:            booking.hora,
        importe_pagado:  `${booking.importePagado}€`,
        notas:           booking.notas || 'Sin notas',
      })
    }

    if (type === 'cancelacion') {
      await sendViaEmailJS(TPL_CANCEL, {
        to_name:  booking.clienteNombre,
        to_email: booking.clienteEmail,
        servicio: resolverNombres(booking.servicios),
        fecha:    formatFecha(booking.fecha),
        hora:     booking.hora,
        reembolso: reembolso
          ? `Se te devolverán ${booking.importePagado}€ en 5-7 días hábiles.`
          : `La señal de ${booking.importePagado}€ no es reembolsable por cancelación con menos de 24 horas de antelación.`,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email] route error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error enviando email' }, { status: 500 })
  }
}
