'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { TRATAMIENTOS_DESTACADOS } from '@/lib/constants'

function scrollToReservar() {
  setTimeout(() => {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }, 50)
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

// ── Carrusel horizontal (móvil) ─────────────────────────────

function MobileCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    // Cada tarjeta ocupa 76vw + 16px de gap
    const cardStep = el.clientWidth * 0.76 + 16
    setActiveIndex(
      Math.min(Math.round(el.scrollLeft / cardStep), TRATAMIENTOS_DESTACADOS.length - 1)
    )
  }

  return (
    <div className="pb-8">
      {/* Contenedor con scroll horizontal y snap */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pl-6"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollPaddingLeft: '24px',
        } as React.CSSProperties}
      >
        {TRATAMIENTOS_DESTACADOS.map((t) => (
          <div
            key={t.id}
            className="snap-start flex-shrink-0 relative overflow-hidden"
            style={{ width: '76vw', aspectRatio: '3/4', borderRadius: '20px' }}
          >
            <Image
              src={t.imagen}
              alt={t.nombre}
              fill
              className="object-cover"
              sizes="76vw"
            />

            {/* Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/15 to-transparent" />

            {/* Contenido inferior */}
            <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3 z-10">
              <div>
                <span className="label-upper text-white/50 block mb-1.5">Destacado</span>
                <h3
                  className="text-white leading-tight"
                  style={{ fontSize: 'clamp(1.15rem, 4.5vw, 1.4rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
                >
                  {t.nombre}
                </h3>
                <p
                  className="text-white/65 text-xs leading-relaxed mt-1.5 line-clamp-2"
                  style={{ fontWeight: 400 }}
                >
                  {t.descripcion}
                </p>
              </div>

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-white text-lg leading-none"
                    style={{ fontWeight: 800, letterSpacing: '-0.02em' }}
                  >
                    {t.precio}
                  </span>
                  <span
                    className="flex items-center gap-1 text-white/50 text-xs"
                    style={{ fontFamily: '"Space Mono", monospace' }}
                  >
                    <Clock size={9} aria-hidden="true" />
                    {t.duracion}
                  </span>
                </div>

                <button
                  onClick={scrollToReservar}
                  className="flex items-center gap-1.5 text-black text-xs px-4 py-2.5 active:scale-95 transition-transform"
                  style={{ fontWeight: 700, background: 'var(--color-brand)', borderRadius: '12px' }}
                  aria-label={`Reservar ${t.nombre}`}
                >
                  Reservar
                  <ArrowRight size={12} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Espaciador final para que la última tarjeta tenga margen derecho */}
        <div className="flex-shrink-0 w-6" aria-hidden="true" />
      </div>

      {/* Indicadores de puntos */}
      <div className="flex justify-center items-center gap-2 mt-5">
        {TRATAMIENTOS_DESTACADOS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? '20px' : '6px',
              height: '6px',
              background: i === activeIndex ? 'var(--color-brand)' : 'var(--color-accent)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Tarjeta desktop con hover ──────────────────────────────

function TreatmentHoverCard({ t }: { t: typeof TRATAMIENTOS_DESTACADOS[number] }) {
  return (
    <motion.div
      custom={0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      className="group relative aspect-[4/5] overflow-hidden rounded-feature border border-accent cursor-pointer"
      style={{ boxShadow: 'var(--shadow-clay)' }}
    >
      <Image
        src={t.imagen}
        alt={t.nombre}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-500" />

      {/* Nombre + duración siempre visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-white text-sm font-sans leading-tight" style={{ fontWeight: 700 }}>
              {t.nombre}
            </h3>
            <span
              className="flex items-center gap-1.5 text-white/60 text-xs"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              <Clock size={11} aria-hidden="true" />
              {t.duracion}
            </span>
          </div>
          <span
            className="text-xl leading-none"
            style={{ fontWeight: 800, color: t.color, letterSpacing: '-0.04em' }}
          >
            {t.precio}
          </span>
        </div>
      </div>

      {/* Hover: descripción + CTA */}
      <div
        className="absolute left-0 right-0 bottom-0 p-5 md:p-6 z-20
          translate-y-full opacity-0
          group-hover:translate-y-0 group-hover:opacity-100
          transition-all duration-500 ease-out"
      >
        <div
          className="rounded-feature p-3 flex flex-col gap-2"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-white/85 text-xs leading-relaxed" style={{ fontWeight: 400 }}>
            {t.descripcion}
          </p>
          <div className="flex items-center justify-between">
            <span
              className="text-lg leading-none"
              style={{ fontWeight: 800, color: t.color, letterSpacing: '-0.03em' }}
            >
              {t.precio}
            </span>
            <button
              onClick={scrollToReservar}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-card text-xs text-white transition-all duration-200"
              style={{ fontWeight: 600, background: t.color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotateZ(-3deg) translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-hard)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
              aria-label={`Reservar ${t.nombre}`}
            >
              Reservar
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Sección principal ───────────────────────────────────────

export default function FeaturedTreatments() {
  return (
    <section
      id="tratamientos-destacados"
      className="bg-bg"
      aria-label="Tratamientos destacados"
    >
      {/* Cabecera */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="flex flex-col gap-4">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="label-upper text-text-muted"
          >
            Tratamientos Destacados
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl leading-tight"
            style={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Cada detalle,{' '}
            <span style={{ color: 'var(--color-pomegranate)' }}>perfecto</span>
          </motion.h2>
        </div>
      </div>

      {/* Móvil: carrusel horizontal con swipe */}
      <div className="md:hidden">
        <MobileCarousel />
      </div>

      {/* Desktop: grid con hover */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-12 pb-12 md:pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TRATAMIENTOS_DESTACADOS.map((t) => (
            <TreatmentHoverCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
