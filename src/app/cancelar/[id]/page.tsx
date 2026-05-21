'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { getBookingAsync, updateBookingEstadoAsync } from '@/lib/supabase-store'
import { enviarCancelacion } from '@/lib/email'
import { SERVICIOS } from '@/lib/constants'
import type { Booking } from '@/lib/types'

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

export default function CancelarPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    getBookingAsync(params.id).then((b) => {
      if (!b) { setEstado('no-encontrada'); return }
      setBooking(b)
      if (b.estado === 'cancelada') { setEstado('ya-cancelada'); return }
      if (b.estado === 'completada') { setEstado('completada'); return }
      const citaDateTime = new Date(`${b.fecha}T${b.hora}:00`)
      const horasRestantes = (citaDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
      setEstado(horasRestantes >= 24 ? 'pendiente' : 'fuera-plazo')
    })
  }, [params.id])

  const confirmarCancelacion = async () => {
    if (!booking) return
    setCancelando(true)
    await updateBookingEstadoAsync(booking.id, 'cancelada')
    await enviarCancelacion(booking, true).catch(() => {})
    setEstado('cancelada-ok')
    setCancelando(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col gap-6">

        <a href="/" className="font-display text-2xl font-light">
          <span style={{ color: 'var(--color-brand)' }}>D</span>
          <span style={{ color: 'var(--color-brand-blue)' }}> Bonita</span>
        </a>

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
              <XCircle size={48} className="text-red-400" />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Reserva no encontrada</h1>
              <p className="text-sm text-text-muted">
                No hemos encontrado ninguna reserva con ese identificador. Comprueba el enlace de tu email.
              </p>
              <a href="/" className="btn-secondary text-xs">Volver al inicio</a>
            </div>
          )}

          {estado === 'ya-cancelada' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle size={48} className="text-yellow-500" />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Ya está cancelada</h1>
              <p className="text-sm text-text-muted">
                La cita de <strong>{booking.clienteNombre}</strong> del <strong>{formatFecha(booking.fecha)}</strong> ya fue cancelada.
              </p>
              <a href="/#reservar" className="btn-primary text-xs">Reservar nueva cita</a>
            </div>
          )}

          {estado === 'completada' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle size={48} className="text-blue-400" />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>La cita ya se realizó</h1>
              <a href="/#reservar" className="btn-primary text-xs mt-2">Reservar nueva cita</a>
            </div>
          )}

          {estado === 'fuera-plazo' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Clock size={48} className="text-red-400" />
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Cancelación fuera de plazo</h1>
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-left w-full">
                <p className="text-sm text-red-700 leading-relaxed">
                  Tu cita es en menos de <strong>24 horas</strong>. La señal de{' '}
                  <strong>{booking.importePagado}€</strong> no es reembolsable pasado este plazo según nuestra política de cancelación.
                </p>
              </div>
              <p className="text-sm text-text-muted">
                Si tienes una circunstancia especial, contáctanos directamente:
              </p>
              <div className="flex flex-col gap-2 w-full">
                <a
                  href="https://wa.me/34657332722?text=Hola, tengo una cita mañana y necesito cancelarla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-500 text-white text-sm rounded-xl font-medium hover:bg-green-600 transition-colors text-center"
                >
                  Escribir por WhatsApp
                </a>
                <a
                  href="tel:+34657332722"
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
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmarCancelacion}
                  disabled={cancelando}
                  className="w-full py-3 bg-red-500 text-white text-sm rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {cancelando ? 'Cancelando...' : 'Sí, cancelar mi cita'}
                </button>
                <a
                  href="/"
                  className="w-full py-3 border border-accent text-center text-sm text-text-muted rounded-xl hover:border-black transition-colors"
                >
                  Mantener la cita
                </a>
              </div>
            </div>
          )}

          {estado === 'cancelada-ok' && booking && (
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <CheckCircle size={56} className="text-green-500" />
              </motion.div>
              <h1 className="text-2xl text-text" style={{ fontWeight: 700 }}>Cita cancelada</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Tu cita del <strong>{formatFecha(booking.fecha)}</strong> ha sido cancelada correctamente.
              </p>
              <a href="/#reservar" className="btn-primary text-xs mt-2">Reservar nueva cita</a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
