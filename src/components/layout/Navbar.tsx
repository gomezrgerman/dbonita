'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Sparkles, Image, User, Calendar } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { MenuBar, type GlowMenuItem } from '@/components/ui/glow-menu'
import { useLang } from '@/lib/i18n'

const iconMap: Record<string, typeof Home> = {
  '#inicio': Home,
  '#servicios': Sparkles,
  '#galeria': Image,
  '#sobre-mi': User,
  '#reservar': Calendar,
}

const gradientMap: Record<string, string> = {
  '#inicio':    'radial-gradient(circle, rgba(108,196,230,0.20) 0%, rgba(108,196,230,0.08) 50%, rgba(108,196,230,0) 100%)',
  '#servicios': 'radial-gradient(circle, rgba(249,188,26,0.20) 0%, rgba(249,188,26,0.08) 50%, rgba(249,188,26,0) 100%)',
  '#galeria':   'radial-gradient(circle, rgba(108,196,230,0.20) 0%, rgba(108,196,230,0.08) 50%, rgba(108,196,230,0) 100%)',
  '#sobre-mi':  'radial-gradient(circle, rgba(249,188,26,0.20) 0%, rgba(249,188,26,0.08) 50%, rgba(249,188,26,0) 100%)',
  '#reservar':  'radial-gradient(circle, rgba(108,196,230,0.25) 0%, rgba(108,196,230,0.10) 50%, rgba(108,196,230,0) 100%)',
}

const iconColorMap: Record<string, string> = {
  '#inicio':    'text-brand-blue',
  '#servicios': 'text-brand',
  '#galeria':   'text-brand-blue',
  '#sobre-mi':  'text-brand',
  '#reservar':  'text-brand-blue',
}

function LangToggle({ scrolled }: { scrolled: boolean }) {
  const { lang, setLang } = useLang()
  return (
    <div
      className="flex items-center gap-0.5"
      style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' }}
    >
      {(['es', 'en'] as const).map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span
              style={{ color: scrolled ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)', padding: '0 2px' }}
            >
              ·
            </span>
          )}
          <button
            onClick={() => setLang(l)}
            className="px-1.5 py-0.5 rounded transition-all duration-200"
            style={{
              color: lang === l
                ? (scrolled ? 'var(--color-text)' : '#fff')
                : (scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.4)'),
              fontWeight: lang === l ? 700 : 500,
            }}
            aria-label={l === 'es' ? 'Cambiar a Español' : 'Switch to English'}
            aria-pressed={lang === l}
          >
            {l.toUpperCase()}
          </button>
        </Fragment>
      ))}
    </div>
  )
}

export default function Navbar() {
  const { t, lang, setLang } = useLang()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLinkIndex, setActiveLinkIndex] = useState(-1)

  const activeItem = activeLinkIndex >= 0 ? (t.nav.links[activeLinkIndex] ?? '') : ''

  const menuItems: GlowMenuItem[] = NAV_LINKS.map((link, i) => ({
    icon: iconMap[link.href],
    label: t.nav.links[i],
    href: link.href,
    gradient: gradientMap[link.href],
    iconColor: iconColorMap[link.href],
  }))

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = NAV_LINKS.map((l) => l.href.replace('#', ''))
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) {
            const idx = NAV_LINKS.findIndex((l) => l.href === `#${id}`)
            if (idx >= 0) setActiveLinkIndex(idx)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (href: string) => {
    setMenuAbierto(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleMenuClick = (_label: string, href: string) => {
    goTo(href)
    const idx = NAV_LINKS.findIndex((l) => l.href === href)
    if (idx >= 0) setActiveLinkIndex(idx)
  }

  const goToBooking = () => {
    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-sm border-b border-accent'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <button
          onClick={() => goTo('#inicio')}
          className="flex items-baseline gap-0 transition-opacity duration-200 hover:opacity-80"
          aria-label="Ir al inicio"
        >
          <span className="font-sans text-lg" style={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-brand)' }}>
            D
          </span>
          <span className="font-sans text-lg" style={{ fontWeight: 800, letterSpacing: '-0.03em', color: scrolled ? '#1A3A4A' : '#fff' }}>
            {' '}Bonita
          </span>
        </button>

        {/* Glow menu desktop */}
        <div className="hidden lg:block">
          <MenuBar
            items={menuItems}
            activeItem={activeItem}
            onItemClick={handleMenuClick}
            variant={scrolled ? 'light' : 'dark'}
          />
        </div>

        {/* Lang toggle + CTA desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <LangToggle scrolled={scrolled} />
          <button onClick={goToBooking} className="btn-primary" aria-label={t.nav.bookCta}>
            {t.nav.bookCta}
          </button>
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="lg:hidden p-2 text-black"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Menú mobile */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-bg border-t border-accent overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-3">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => goTo(link.href)}
                  className="text-sm font-medium text-left text-text-muted hover:text-black transition-colors py-2 border-b border-accent last:border-0"
                >
                  {t.nav.links[i]}
                </motion.button>
              ))}

              {/* Lang toggle mobile */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.06 }}
                className="flex items-center gap-2 pt-2"
              >
                {(['es', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="text-xs px-3 py-1.5 rounded-card border transition-all duration-200"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      borderColor: lang === l ? 'var(--color-text)' : 'var(--color-accent)',
                      color: lang === l ? 'var(--color-text)' : 'var(--color-text-muted)',
                      background: lang === l ? 'transparent' : 'transparent',
                    }}
                    aria-pressed={lang === l}
                    aria-label={l === 'es' ? 'Cambiar a Español' : 'Switch to English'}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (NAV_LINKS.length + 1) * 0.06 }}
                onClick={goToBooking}
                className="btn-primary mt-2"
              >
                {t.nav.bookCta}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
