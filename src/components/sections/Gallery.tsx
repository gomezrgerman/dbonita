'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { GALERIA_ITEMS } from '@/lib/constants'
import { GalleryClipDefs, getClipPathId } from '@/components/ui/image-mask'
import { useLang } from '@/lib/i18n'

const INSTAGRAM_URL = 'https://www.instagram.com/dbonitadenia/'

export default function Gallery() {
  const { t } = useLang()
  return (
    <section id="galeria" className="section-padding bg-bg overflow-hidden" aria-label="Galería de resultados">
      {/* SVG clip-paths definitions */}
      <GalleryClipDefs />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Cabecera */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4">
            <motion.span
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="label-upper text-text-muted"
            >
              {t.gallery.eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans leading-tight text-black"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {t.gallery.headlinePre}{' '}
              <span style={{ color: 'var(--color-pomegranate)' }}>{t.gallery.headlineAccent}</span>
            </motion.h2>
          </div>
          <motion.a
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-text-muted hover:text-black transition-colors"
            style={{ fontWeight: 500 }}
            aria-label="Ver más en Instagram de D Bonita Dénia"
          >
            <Instagram size={16} aria-hidden="true" />
            @dbonitadenia
          </motion.a>
        </div>

        {/* Grid con formas orgánicas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" role="list" aria-label="Galería de trabajos">
          {GALERIA_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="group flex flex-col gap-2"
              role="listitem"
            >
              {/* Imagen con clip-path — sin texto dentro para evitar que se recorte */}
              <div
                className="relative overflow-hidden"
                style={{ clipPath: `url(#${getClipPathId(i)})` }}
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {/* Etiqueta fuera del clip — siempre legible */}
              <span className="label-upper text-text-muted text-center px-2 pb-1">{t.gallery.treatments[item.tratamiento] ?? item.tratamiento}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex justify-center mt-10"
        >
          <a
            href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
            aria-label="Ver todos los trabajos en Instagram de D Bonita Dénia"
          >
            <Instagram size={16} aria-hidden="true" />
            {t.gallery.instagramCta}
          </a>
        </motion.div>
      </div>
    </section>
  )
}