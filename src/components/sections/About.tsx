'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { STATS } from '@/lib/constants'

export default function About() {
  return (
    <section
      id="sobre-mi"
      className="section-padding overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
      aria-label="Sobre la especialista"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">

          {/* Imagen */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden aspect-[4/5] rounded-feature shadow-clay">
              <Image
                src="/img/diana-manicurista.png"
                alt="Diana — manicurista y fundadora de D Bonita en Dénia"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Badge valoración */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 lg:-right-8 bg-lemon rounded-card shadow-hard flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 z-20"
              aria-label="Valoración 5.0 de 5 en Google"
            >
              <span className="font-sans text-3xl text-black leading-none" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>5.0</span>
              <span className="label-upper text-black/60 mt-0.5" style={{ fontSize: '0.6rem' }}>valoración</span>
            </motion.div>
          </motion.div>

          {/* Contenido */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="label-upper" style={{ color: 'var(--color-text-muted)' }}>
                Conoce al equipo
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-sans text-text leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Somos{' '}
              <span style={{ color: 'var(--color-brand)' }}>Diana y Valeria</span>
              {' '}— tu centro de estética en Dénia
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              {[
                'En D Bonita cuidamos cada detalle para ofrecerte mucho más que un tratamiento: una experiencia de bienestar, belleza y desconexión.',
                'Somos un centro de estética en Dénia especializado en realzar tu belleza natural. Lifting de pestañas, higienes faciales y servicios corporales adaptados a cada clienta.',
                'Nuestro espacio está diseñado para que te relajes y disfrutes de tu momento. Apostamos por la calidad, la cercanía y resultados visibles desde la primera sesión.',
              ].map((p, i) => (
                <p key={i} className="text-base leading-relaxed" style={{ color: 'var(--color-text-dark)', fontWeight: 400 }}>
                  {p}
                </p>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-4 pt-6 border-t"
              style={{ borderColor: 'var(--color-accent)' }}
            >
              {STATS.map((stat) => (
                <div
                  key={stat.etiqueta}
                  className="clay-card p-3 md:p-4"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}
                >
                  <span className="font-sans text-2xl md:text-3xl text-lemon block" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
                    {stat.valor}
                  </span>
                  <span className="label-upper mt-0.5 md:mt-1 block" style={{ color: 'var(--color-text-muted)', fontSize: '0.6rem' }}>
                    {stat.etiqueta}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
