'use client'

import { motion } from 'framer-motion'

import { MapPin, Phone, Mail, Instagram, MessageCircle, Clock } from 'lucide-react'

const INFO_CONTACTO = [
  {
    icono: Phone,
    etiqueta: 'Teléfono',
    valor: '+34 657 33 27 22',
    href: 'tel:+34657332722',
  },
  {
    icono: Mail,
    etiqueta: 'Email',
    valor: 'hola@dbonita.es',
    href: 'mailto:hola@dbonita.es',
  },
  {
    icono: MapPin,
    etiqueta: 'Ubicación',
    valor: 'Carrer del Cop, 5 · 1º 2ª · Dénia, Alicante',
    href: 'https://www.google.com/maps/search/D+Bonita+Carrer+del+Cop+5+Denia+Alicante',
  },
  {
    icono: Clock,
    etiqueta: 'Horario',
    valor: 'Lun–Vie 10:00–19:00 · Sáb y Dom cerrado',
    href: null,
  },
]

export default function Contact() {
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/dbonita'
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'

  return (
    <section
      className="section-padding bg-bg"
      aria-label="Información de contacto"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
          {/* Columna izquierda — texto */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <span className="decorative-line" aria-hidden="true" />
              <span className="font-sans text-xs font-light tracking-[0.3em] uppercase text-text-muted">
                Contáctanos
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-6xl font-light text-text leading-tight"
            >
              Estamos aquí{' '}
              <em className="not-italic text-primary">para ti</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base font-light text-text-muted leading-relaxed max-w-md"
            >
              ¿Tienes alguna pregunta o quieres saber más sobre nuestros
              tratamientos? No dudes en ponerte en contacto con nosotros. Estaremos
              encantadas de atenderte.
            </motion.p>

            {/* Info de contacto */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-5"
            >
              {INFO_CONTACTO.map((item) => {
                const Icono = item.icono
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 border border-accent flex items-center justify-center flex-shrink-0">
                      <Icono size={15} className="text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-light tracking-widest uppercase text-text-muted mb-1">
                        {item.etiqueta}
                      </p>
                      <p className="font-sans text-sm font-light text-text">
                        {item.valor}
                      </p>
                    </div>
                  </div>
                )

                return (
                  <li key={item.etiqueta}>
                    {item.href && item.href !== '#' ? (
                      <a
                        href={item.href}
                        className="hover:text-primary transition-colors duration-300 block"
                        aria-label={`${item.etiqueta}: ${item.valor}`}
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                )
              })}
            </motion.ul>

            {/* Redes sociales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-3 pt-2"
            >
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-accent px-4 py-2.5 font-sans text-xs font-light tracking-widest uppercase text-text-muted hover:border-primary hover:text-primary transition-all duration-300"
                aria-label="Síguenos en Instagram"
              >
                <Instagram size={14} aria-hidden="true" />
                Instagram
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hola, me gustaría obtener más información`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-accent px-4 py-2.5 font-sans text-xs font-light tracking-widest uppercase text-text-muted hover:border-primary hover:text-primary transition-all duration-300"
                aria-label="Contactar por WhatsApp"
              >
                <MessageCircle size={14} aria-hidden="true" />
                WhatsApp
              </a>
            </motion.div>
          </div>

          {/* Columna derecha — Mapa */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="bg-surface aspect-[4/3] lg:aspect-auto lg:h-full min-h-80 flex flex-col items-center justify-center gap-4 border border-accent">
              <MapPin size={32} className="text-primary" aria-hidden="true" />
              <div className="text-center px-6">
                <p className="font-sans text-xl text-text" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  D Bonita · Dénia
                </p>
                <p className="font-sans text-sm text-text-muted mt-1" style={{ fontWeight: 400 }}>
                  Carrer del Cop, 5 · Piso 1 puerta 2
                </p>
                <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 400 }}>
                  03700 Dénia, Alicante
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/D+Bonita+Carrer+del+Cop+5+Denia+Alicante"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs mt-2"
                aria-label="Ver D Bonita en Google Maps"
              >
                Ver en Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
