/**
 * Modo de reserva de la web.
 *  - true:  reserva online completa (calendario + datos + señal con Stripe). Requiere Supabase y Stripe.
 *  - false: la clienta elige servicios y envía la solicitud por WhatsApp; el pago se hace en el centro.
 *
 * Se controla con NEXT_PUBLIC_RESERVAS_ONLINE en Vercel (se aplica en el siguiente deploy).
 * Por defecto está desactivado.
 */
export const RESERVAS_ONLINE = process.env.NEXT_PUBLIC_RESERVAS_ONLINE === 'true'

export interface LineaSolicitud {
  nombre: string
  precio?: string
}

export interface TextosSolicitud {
  intro: string
  duration: string
  total: string
  ask: string
}

/** Mensaje de WhatsApp con los servicios elegidos, listo para enviar. */
export function mensajeSolicitudWhatsApp(
  lineas: LineaSolicitud[],
  duracion: string,
  total: string | null,
  textos: TextosSolicitud
): string {
  const servicios = lineas.map((l) => `• ${l.nombre}${l.precio ? ` (${l.precio})` : ''}`).join('\n')
  const resumen = [
    `${textos.duration}: ${duracion}`,
    total ? `${textos.total}: ${total}` : null,
  ].filter(Boolean).join(' · ')
  return `${textos.intro}\n${servicios}\n${resumen}\n\n${textos.ask}`
}
