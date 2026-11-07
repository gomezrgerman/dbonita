'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { SERVICIOS } from '@/lib/constants'
import type { ReservaPublica } from '@/lib/types'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34657332722'

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split('-')
  return `${parseInt(d)} de ${MESES[parseInt(m) - 1]} de ${y}`
}

function formatServicios(servicios: string[]): string {
  return servicios
    .map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id)
    .join(' + ')
}

type Estado = 'cargando' | 'no-encontrada' | 'ya-cancelada' | 'completada' | 'fuera-plazo' | 'pendiente' | 'cancelada-ok'

export default function CancelarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [booking, setBooking] = useState<ReservaPublica | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')
  const [cancelando, setCancelando] = useState(false)
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null)
  const [reembolsada, setReembolsada] = useState(false)

  useEffect(() => {
    fetch(`/api/cancelar/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) { setEstado('no-encontrada'); return }
        const { reserva, cancelable } = (await res.json()) as { reserva: ReservaPublica; cancelable: boolean }
        setBooking(reserva)
        if (reserva.estado === 'cancelada') { setEstado('ya-cancelada'); return }
        if (reserva.estado === 'completada') { setEstado('completada'); return }
        // El plazo de 24 h lo calcula el servidor en hora de Madrid
        setEstado(cancelable ? 'pendiente' : 'fuera-plazo')
      })
      .catch(() => setEstado('no-encontrada'))
  }, [id])

  const confirmarCancelacion = async () => {
    if (!booking) return
    setCancelando(true)
    setErrorCancelar(null)
    try {
      const res = await fetch(`/api/cancelar/${encodeURIComponent(booking.id)}`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorCancelar(data.error ?? 'No se pudo cancelar la cita. Inténtalo de nuevo o contáctanos.')
        return
      }
      setReembolsada(data.reembolsada === true)
      setEstado('cancelada-ok')
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col gap-6">

        <Link href="/" className="font-display text-2xl font-light">
          <span style={{ color: 'var(--color-brand)' }}>D</span>
          <span style={{ color: 'var(--color-brand-blue)' }}> Bonita</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-accent p-8 flex flex-col gap-6"
          style={{ borderRadius: '20px' }}
        >
          {estado === 'cargando' && (
            <p className="text-sm text-text-muted text-center">Cargando reserva...</p>
          )}

          {estado === 'no-encontrada' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle size={48} style={{ color: 'var(--color-pomegranate)' }} />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Reserva no encontrada</h1>
              <p className="text-sm text-text-muted">
                No hemos encontrado ninguna reserva con ese identificador. Comprueba el enlace de tu email.
              </p>
              <Link href="/" className="btn-secondary text-xs">Volver al inicio</Link>
            </div>
          )}

          {estado === 'ya-cancelada' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle size={48} style={{ color: 'var(--color-brand)' }} />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Ya está cancelada</h1>
              <p className="text-sm text-text-muted">
                La cita de <strong>{booking.clienteNombre}</strong> del <strong>{formatFecha(booking.fecha)}</strong> ya fue cancelada.
              </p>
              <Link href="/#reservar" className="btn-primary text-xs">Reservar nueva cita</Link>
            </div>
          )}

          {estado === 'completada' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle size={48} style={{ color: 'var(--color-brand-blue)' }} />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>La cita ya se realizó</h1>
              <Link href="/#reservar" className="btn-primary text-xs mt-2">Reservar nueva cita</Link>
            </div>
          )}

          {estado === 'fuera-plazo' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Clock size={48} style={{ color: 'var(--color-pomegranate)' }} />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Cancelación fuera de plazo</h1>
              <div
                className="p-4 rounded-xl text-left w-full"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)' }}
              >
                <p className="text-sm text-text-muted leading-relaxed">
                  Tu cita es en menos de <strong className="text-text">24 horas</strong>. La señal de{' '}
                  <strong className="text-text">{booking.importePagado}€</strong> no es reembolsable pasado este plazo según nuestra política de cancelación.
                </p>
              </div>
              <p className="text-sm text-text-muted">
                Si tienes una circunstancia especial, contáctanos directamente:
              </p>
              <div className="flex flex-col gap-2 w-full">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, tengo una cita mañana y necesito cancelarla')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 text-white text-sm rounded-xl text-center transition-colors duration-200"
                  style={{ background: '#25D366', fontWeight: 600 }}
                >
                  Escribir por WhatsApp
                </a>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="w-full py-3 border border-accent text-center text-sm text-text-muted rounded-xl hover:border-black transition-colors"
                >
                  Llamar al +34 657 33 27 22
                </a>
              </div>
            </div>
          )}

          {estado === 'pendiente' && booking && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Cancelar cita</h1>
                <p className="text-sm text-text-muted mt-1">Estás a punto de cancelar:</p>
              </div>
              <div className="bg-surface border border-accent p-5 rounded-xl flex flex-col gap-1.5">
                <p className="text-sm font-medium text-text">{booking.clienteNombre}</p>
                <p className="text-sm text-text-muted">{formatServicios(booking.servicios)}</p>
                <p className="text-lg mt-1" style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                  {formatFecha(booking.fecha)} · {booking.hora}
                </p>
              </div>
              {errorCancelar && (
                <p className="text-sm text-center" style={{ color: 'var(--color-pomegranate)' }} role="alert">
                  {errorCancelar}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmarCancelacion}
                  disabled={cancelando}
                  className="w-full py-3 text-white text-sm rounded-xl transition-colors duration-200 disabled:opacity-50"
                  style={{ background: 'var(--color-pomegranate)', fontWeight: 600 }}
                >
                  {cancelando ? 'Cancelando...' : 'Sí, cancelar mi cita'}
                </button>
                <Link
                  href="/"
                  className="w-full py-3 border border-accent text-center text-sm text-text-muted rounded-xl hover:border-black transition-colors"
                >
                  Mantener la cita
                </Link>
              </div>
            </div>
          )}

          {estado === 'cancelada-ok' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <CheckCircle size={56} style={{ color: 'var(--color-brand)' }} />
              </motion.div>
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Cita cancelada</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Tu cita del <strong>{formatFecha(booking.fecha)}</strong> ha sido cancelada correctamente.
              </p>
              {reembolsada && (
                <p className="text-sm text-text-muted leading-relaxed">
                  Te devolveremos la señal de <strong>{booking.importePagado}€</strong> en tu método de pago en 5-10 días hábiles.
                </p>
              )}
              <Link href="/#reservar" className="btn-primary text-xs mt-2">Reservar nueva cita</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
