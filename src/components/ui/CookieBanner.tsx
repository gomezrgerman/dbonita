'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCookieConsent } from '@/lib/cookie-consent'

export default function CookieBanner() {
  const { accept: acceptConsent, reject: rejectConsent } = useCookieConsent()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dbonita_cookies_consent')
    if (!saved) setVisible(true)
  }, [])

  const handleAccept = () => {
    acceptConsent()
    setVisible(false)
  }

  const handleReject = () => {
    rejectConsent()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6"
            style={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.12), rgb(0,0,0) -4px 4px',
              border: '1.5px solid #000',
            }}
          >
            <p className="text-xs text-text-muted leading-relaxed flex-1" style={{ fontWeight: 400 }}>
              Usamos cookies técnicas necesarias para el proceso de reserva y pago.
              Si aceptas, también cargamos el mapa de Google Maps y la animación del hero,
              que pueden establecer cookies propias.{' '}
              <a href="/privacidad" className="text-black underline underline-offset-2" style={{ fontWeight: 600 }}>
                Más información
              </a>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs text-text-muted border border-accent rounded-xl transition-colors hover:border-black hover:text-black"
                style={{ fontWeight: 500 }}
              >
                Rechazar
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-xs text-white rounded-xl transition-all duration-200"
                style={{ background: '#000', fontWeight: 700 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotateZ(-2deg) translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'rgb(0,0,0) -3px 3px'
                  e.currentTarget.style.background = 'var(--color-pomegranate)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                  e.currentTarget.style.background = '#000'
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
