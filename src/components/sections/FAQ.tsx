'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { PREGUNTAS_FAQ } from '@/lib/constants'

export default function FAQ() {
  const [abierta, setAbierta] = useState<string | null>(null)
  const toggle = (id: string) => setAbierta((p) => (p === id ? null : id))

  return (
    <section className="section-padding bg-bg" aria-label="Preguntas frecuentes">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">

        {/* Cabecera */}
        <div className="flex flex-col gap-4 mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="label-upper text-text-muted"
          >
            Preguntas Frecuentes
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans font-800 leading-tight text-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Resolvemos tus{' '}
            <span style={{ color: 'var(--color-ube)' }}>dudas</span>
          </motion.h2>
        </div>

        {/* Acordeón */}
        <motion.dl
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          {PREGUNTAS_FAQ.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="clay-card overflow-hidden"
              style={{ borderRadius: '16px' }}
            >
              <dt>
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  aria-expanded={abierta === faq.id}
                  aria-controls={`faq-respuesta-${faq.id}`}
                >
                  <span className={`text-base font-500 leading-snug pr-8 transition-colors duration-200 ${abierta === faq.id ? 'text-black' : 'text-text-dark'}`}
                    style={{ fontWeight: 500 }}>
                    {faq.pregunta}
                  </span>
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-card flex items-center justify-center transition-colors duration-200 ${
                      abierta === faq.id ? 'bg-black text-white' : 'bg-accent text-text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {abierta === faq.id ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
              </dt>

              <AnimatePresence>
                {abierta === faq.id && (
                  <motion.dd
                    id={`faq-respuesta-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed pr-16" style={{ fontWeight: 400 }}>
                      {faq.respuesta}
                    </p>
                  </motion.dd>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.dl>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mt-10 clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderRadius: '16px' }}
        >
          <p className="text-sm text-text-muted" style={{ fontWeight: 400 }}>
            ¿Tienes otra pregunta? Escríbenos sin compromiso.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'}?text=Hola, tengo una pregunta sobre vuestros servicios`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary whitespace-nowrap"
            aria-label="Contactar por WhatsApp para resolver dudas"
          >
            Preguntar por WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
