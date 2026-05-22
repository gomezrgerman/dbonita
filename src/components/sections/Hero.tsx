'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Script from 'next/script'
import { useLang } from '@/lib/i18n'
import { useCookieConsent } from '@/lib/cookie-consent'

declare global {
  interface Window {
    UnicornStudio?: { init: () => void; isInitialized: boolean }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

type DOEWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const MAX_PX = 20  // máximo desplazamiento en píxeles

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const { consent } = useCookieConsent()

  const reservar = () => {
    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
  }

  const verServicios = () => {
    document.querySelector('#servicios')?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Parallax móvil ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (!isMobile) return

    const el = bgRef.current
    if (!el) return

    let targetX = 0
    let targetY = 0
    let smoothX = 0
    let smoothY = 0
    let rafId: number

    // Bucle de animación: interpola suavemente hacia el objetivo
    const tick = () => {
      smoothX += 0.08 * (targetX - smoothX)
      smoothY += 0.08 * (targetY - smoothY)
      el.style.transform = `translate(${smoothX.toFixed(2)}px, ${smoothY.toFixed(2)}px)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    // Giroscopio: gamma = inclinación lateral, beta = inclinación frontal
    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = Math.max(-40, Math.min(40, e.gamma ?? 0))
      const beta  = Math.max(-40, Math.min(40, (e.beta ?? 45) - 45))
      targetX = (gamma / 40) * MAX_PX
      targetY = (beta  / 40) * MAX_PX
    }

    const setupOrientation = () => {
      window.addEventListener('deviceorientation', onOrientation, true)
    }

    const DOE = DeviceOrientationEvent as DOEWithPermission
    if (typeof DOE.requestPermission === 'function') {
      // iOS 13+: pedir permiso en el primer toque
      document.addEventListener('touchstart', async () => {
        try {
          const perm = await DOE.requestPermission!()
          if (perm === 'granted') setupOrientation()
        } catch { /* usuario denegó */ }
      }, { once: true })
    } else {
      setupOrientation()
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('deviceorientation', onOrientation, true)
    }
  }, [])

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-end overflow-hidden bg-black"
      aria-label="Sección principal"
    >
      {/*
        Wrapper sobredimensionado: MAX_PX px de margen en cada lado.
        Así aunque se desplace nunca aparecen bordes blancos.
        En desktop UnicornStudio gestiona el parallax internamente (no se aplica transform).
      */}
      <div
        ref={bgRef}
        className="absolute z-0 md:inset-0"
        style={{
          top:    `-${MAX_PX}px`,
          left:   `-${MAX_PX}px`,
          right:  `-${MAX_PX}px`,
          bottom: `-${MAX_PX}px`,
        }}
      >
        {/*
          Mobile: pointer-events none → UnicornStudio no recibe eventos táctiles
          propios (que eran los que movían el canvas y mostraban bordes).
          Nosotros aplicamos el desplazamiento vía CSS transform en el wrapper.
        */}
        <div
          className="md:hidden absolute inset-0"
          style={{ pointerEvents: 'none' }}
          data-us-project="0z4NtvQtWlhYgpvjWpTQ"
        />
        {/* Desktop: comportamiento original sin cambios */}
        <div
          className="hidden md:block absolute inset-0"
          data-us-project="0z4NtvQtWlhYgpvjWpTQ"
        />
      </div>

      {/* Gradiente inferior para legibilidad del texto */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.30) 40%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Contenido ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12 sm:pb-16 lg:pb-24 pt-20 sm:pt-28 lg:pt-32">
        <div className="flex flex-col gap-6 max-w-2xl">

          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <span
              className="label-upper text-white/60"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              {t.hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            custom={0.12}
            initial="hidden" animate="visible" variants={fadeUp}
            className="font-sans leading-none tracking-tight text-white"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
            }}
          >
            {t.hero.headline}{' '}
            <span style={{ color: 'var(--color-brand)' }}>{t.hero.headlineAccent}</span>.
          </motion.h1>

          <motion.p
            custom={0.34}
            initial="hidden" animate="visible" variants={fadeUp}
            className="text-base sm:text-lg leading-relaxed max-w-md"
            style={{ fontWeight: 400, color: 'rgba(255,255,255,0.75)' }}
          >
            {t.hero.subheadline}
          </motion.p>

          <motion.div custom={0.46} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-3">
            <button onClick={reservar} className="btn-primary flex-1 sm:flex-initial" aria-label={t.hero.bookBtn}>
              {t.hero.bookBtn}
            </button>
            <button
              onClick={verServicios}
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              aria-label={t.hero.servicesBtn}
            >
              {t.hero.servicesBtn}
            </button>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 z-20"
        aria-hidden="true"
      >
        <span className="label-upper text-white/40" style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.6rem' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>

      {consent === 'accepted' && (
        <Script
          src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.12/dist/unicornStudio.umd.js"
          strategy="afterInteractive"
          onLoad={() => { window.UnicornStudio?.init() }}
        />
      )}
    </section>
  )
}
