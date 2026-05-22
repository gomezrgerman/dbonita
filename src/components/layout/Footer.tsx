'use client'

import { Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import { SITE_NAME, NAV_LINKS } from '@/lib/constants'
import { useLang } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLang()
  const instagramUrl  = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/dbonita'
  const whatsappNum   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'

  const goTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer id="contacto" role="contentinfo" className="bg-bg px-6 lg:px-12 pb-8">
      <div
        className="max-w-7xl mx-auto rounded-section overflow-hidden"
        style={{ backgroundColor: '#000', borderRadius: '40px' }}
      >
        <div className="px-8 lg:px-14 py-14 lg:py-20">
          {/* Grid 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b pb-14" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>

            {/* Marca */}
            <div className="flex flex-col gap-5">
              <Image
                src="/img/logo.png"
                alt="D Bonita"
                width={130}
                height={52}
                className="object-contain"
              />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                {t.footer.tagline}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {[
                  { href: instagramUrl, icon: <Instagram size={16} />, label: 'Instagram' },
                  { href: `https://wa.me/${whatsappNum}?text=${encodeURIComponent(t.footer.bookWaMsg)}`, icon: <MessageCircle size={16} />, label: 'WhatsApp' },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-card border flex items-center justify-center text-white/60 transition-all duration-200"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-3px)'; e.currentTarget.style.boxShadow = 'rgb(255,255,255) -4px 4px'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.color = '' }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex flex-col gap-4">
              <h4 className="label-upper" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.footer.navigation}</h4>
              <nav aria-label="Navegación footer">
                <ul className="flex flex-col gap-3">
                  {NAV_LINKS.map((link, i) => (
                    <li key={link.href}>
                      <button
                        onClick={() => goTo(link.href)}
                        className="text-sm transition-colors duration-200"
                        style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      >
                        {t.nav.links[i]}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Contacto */}
            <div className="flex flex-col gap-4">
              <h4 className="label-upper" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.footer.contact}</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href="tel:+34657332722" className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                    <Phone size={14} style={{ color: 'var(--color-pomegranate)', flexShrink: 0 }} />
                    +34 657 33 27 22
                  </a>
                </li>
                <li>
                  <a href="mailto:hola@dbonita.es" className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                    <Mail size={14} style={{ color: 'var(--color-pomegranate)', flexShrink: 0 }} />
                    hola@dbonita.es
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin size={14} style={{ color: 'var(--color-pomegranate)', flexShrink: 0, marginTop: 2 }} />
                  Carrer del Cop, 5 · 1º 2ª · Dénia, Alicante
                </li>
              </ul>
              <div className="mt-1">
                <h5 className="label-upper mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.footer.hours}</h5>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{t.footer.hoursWeekday}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{t.footer.hoursWeekend}</p>
              </div>
            </div>
          </div>

          {/* Copyright + legal */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
              © 2026 {SITE_NAME} — {t.footer.copyright}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacidad"
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >
                {t.footer.privacy}
              </a>
              <a
                href="/aviso-legal"
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >
                {t.footer.legal}
              </a>
            </div>
          </div>

          {/* Crédito */}
          <div
            className="mt-10 pt-8 flex flex-col items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="text-xs text-center leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.15)', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.015em' }}
            >
              Internet ya tenía suficientes webs feas.
            </p>
            <a
              href="https://german-gomez.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-all duration-500"
              style={{
                color: 'rgba(255,255,255,0.22)',
                fontWeight: 400,
                letterSpacing: '0.12em',
                fontFamily: '"Space Mono", monospace',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                e.currentTarget.style.letterSpacing = '0.18em'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.22)'
                e.currentTarget.style.letterSpacing = '0.12em'
              }}
            >
              german-gomez.es
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
