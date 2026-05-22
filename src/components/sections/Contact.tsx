'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Instagram, MessageCircle, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { useCookieConsent } from '@/lib/cookie-consent'

export default function Contact() {
  const { t } = useLang()
  const { consent, accept } = useCookieConsent()
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/dbonita'
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'

  const infoContacto = [
    {
      icono: Phone,
      etiqueta: t.contact.labels.phone,
      valor: '+34 657 33 27 22',
      href: 'tel:+34657332722',
    },
    {
      icono: Mail,
      etiqueta: t.contact.labels.email,
      valor: 'hola@dbonita.es',
      href: 'mailto:hola@dbonita.es',
    },
    {
      icono: MapPin,
      etiqueta: t.contact.labels.location,
      valor: 'Carrer del Cop, 5 · 1º 2ª · Dénia, Alicante',
      href: 'https://www.google.com/maps/search/D+Bonita+Carrer+del+Cop+5+Denia+Alicante',
    },
    {
      icono: Clock,
      etiqueta: t.contact.labels.hours,
      valor: t.contact.hoursValue,
      href: null,
    },
  ]

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
                {t.contact.eyebrow}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-6xl font-light text-text leading-tight"
            >
              {t.contact.headlinePre}{' '}
              <em className="not-italic text-primary">{t.contact.headlineAccent}</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base font-light text-text-muted leading-relaxed max-w-md"
            >
              {t.contact.body}
            </motion.p>

            {/* Info de contacto */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-5"
            >
              {infoContacto.map((item) => {
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
                aria-label="Instagram"
              >
                <Instagram size={14} aria-hidden="true" />
                Instagram
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t.contact.waMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-accent px-4 py-2.5 font-sans text-xs font-light tracking-widest uppercase text-text-muted hover:border-primary hover:text-primary transition-all duration-300"
                aria-label="WhatsApp"
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
            <div className="relative overflow-hidden border border-accent" style={{ borderRadius: '24px', minHeight: '380px' }}>
              {consent === 'accepted' ? (
                <>
                  <iframe
                    src="https://maps.google.com/maps?q=Carrer+del+Cop+5+Denia+Alicante+España&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', inset: 0, minHeight: '380px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de D Bonita en Google Maps"
                    aria-label="Mapa de ubicación de D Bonita, Carrer del Cop 5, Dénia"
                  />
                  <a
                    href="https://www.google.com/maps/search/D+Bonita+Carrer+del+Cop+5+Denia+Alicante"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 btn-secondary text-xs shadow-clay"
                    aria-label={t.contact.openMaps}
                  >
                    <MapPin size={12} aria-hidden="true" />
                    {t.contact.openMaps}
                  </a>
                </>
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <MapPin size={28} className="text-primary" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                    Acepta las cookies para ver el mapa interactivo.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={accept}
                      className="btn-primary text-xs px-5 py-2.5"
                      aria-label="Aceptar cookies y ver mapa"
                    >
                      Aceptar cookies
                    </button>
                    <a
                      href="https://www.google.com/maps/search/D+Bonita+Carrer+del+Cop+5+Denia+Alicante"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs text-text-muted underline underline-offset-2 hover:text-text transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      {t.contact.openMaps}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
