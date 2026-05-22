'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { TESTIMONIOS } from '@/lib/constants'
import { useLang } from '@/lib/i18n'

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex gap-1" aria-label={`${cantidad} estrellas de 5`}>
      {Array.from({ length: cantidad }).map((_, i) => (
        <Star key={i} size={14} className="fill-lemon text-lemon" aria-hidden="true" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const { t } = useLang()
  const [actual, setActual] = useState(0)
  const total = TESTIMONIOS.length

  const anterior  = () => setActual((p) => (p === 0 ? total - 1 : p - 1))
  const siguiente = () => setActual((p) => (p === total - 1 ? 0 : p + 1))

  return (
    <section
      className="section-padding overflow-hidden"
      style={{ backgroundColor: 'var(--color-lemon-light)' }}
      aria-label="Testimonios de clientas"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Cabecera */}
        <div className="flex flex-col gap-4 mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="label-upper text-black/50"
          >
            {t.testimonials.eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans font-800 leading-tight text-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            {t.testimonials.headlinePre}{' '}
            <span style={{ color: 'var(--color-matcha)' }}>{t.testimonials.headlineAccent}</span>{' '}
            {t.testimonials.headlineSuf}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Slider */}
          <div className="lg:col-span-8">
            <div className="clay-card p-8 lg:p-10 min-h-[280px] flex items-center" style={{ borderRadius: '24px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={actual}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  <blockquote className="flex flex-col gap-5">
                    <Estrellas cantidad={TESTIMONIOS[actual].estrellas} />
                    <p className="font-sans leading-relaxed text-black" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 400 }}>
                      &ldquo;{TESTIMONIOS[actual].resena}&rdquo;
                    </p>
                    <footer className="flex flex-col gap-0.5">
                      <cite className="font-sans text-sm font-600 not-italic text-black" style={{ fontWeight: 600 }}>
                        {TESTIMONIOS[actual].nombre}
                      </cite>
                      <span className="label-upper text-text-muted">
                        {TESTIMONIOS[actual].ciudad} · {TESTIMONIOS[actual].tratamiento}
                      </span>
                    </footer>
                  </blockquote>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={anterior}
                className="w-11 h-11 rounded-card border border-accent bg-white flex items-center justify-center text-text-muted hover:border-black hover:text-black transition-all shadow-clay"
                style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-3px)'; e.currentTarget.style.boxShadow = 'rgb(0,0,0) -4px 4px' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                aria-label="Testimonio anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={siguiente}
                className="w-11 h-11 rounded-card border border-accent bg-white flex items-center justify-center text-text-muted hover:border-black hover:text-black transition-all shadow-clay"
                style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-3px)'; e.currentTarget.style.boxShadow = 'rgb(0,0,0) -4px 4px' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                aria-label="Testimonio siguiente"
              >
                <ChevronRight size={18} />
              </button>

              <div className="flex gap-2 ml-2" role="tablist">
                {TESTIMONIOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActual(i)}
                    role="tab" aria-selected={i === actual}
                    aria-label={`Ver testimonio ${i + 1}`}
                    className={`h-2 rounded-pill transition-all duration-300 ${i === actual ? 'w-8 bg-black' : 'w-2 bg-accent'}`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-text-muted ml-auto">{actual + 1} / {total}</span>
            </div>
          </div>

          {/* Mini panel lateral */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-3">
            {TESTIMONIOS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActual(i)}
                className={`text-left p-4 rounded-card border transition-all duration-200 ${
                  i === actual ? 'border-black bg-white shadow-clay' : 'border-accent bg-white/60 hover:border-black/30'
                }`}
                aria-label={`Ver testimonio de ${t.nombre}`}
                aria-pressed={i === actual}
              >
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">&ldquo;{t.resena}&rdquo;</p>
                <p className={`text-xs font-600 mt-2 ${i === actual ? 'text-black' : 'text-text-muted'}`} style={{ fontWeight: 600 }}>
                  {t.nombre}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
