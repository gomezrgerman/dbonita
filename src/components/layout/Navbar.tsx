'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Sparkles, Image, User, Calendar } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { MenuBar, type GlowMenuItem } from '@/components/ui/glow-menu'

const iconMap: Record<string, typeof Home> = {
  'Inicio': Home,
  'Servicios': Sparkles,
  'Galería': Image,
  'Sobre mí': User,
  'Reservar': Calendar,
}

const gradientMap: Record<string, string> = {
  'Inicio': 'radial-gradient(circle, rgba(108,196,230,0.20) 0%, rgba(108,196,230,0.08) 50%, rgba(108,196,230,0) 100%)',
  'Servicios': 'radial-gradient(circle, rgba(249,188,26,0.20) 0%, rgba(249,188,26,0.08) 50%, rgba(249,188,26,0) 100%)',
  'Galería': 'radial-gradient(circle, rgba(108,196,230,0.20) 0%, rgba(108,196,230,0.08) 50%, rgba(108,196,230,0) 100%)',
  'Sobre mí': 'radial-gradient(circle, rgba(249,188,26,0.20) 0%, rgba(249,188,26,0.08) 50%, rgba(249,188,26,0) 100%)',
  'Reservar': 'radial-gradient(circle, rgba(108,196,230,0.25) 0%, rgba(108,196,230,0.10) 50%, rgba(108,196,230,0) 100%)',
}

const iconColorMap: Record<string, string> = {
  'Inicio': 'text-brand-blue',
  'Servicios': 'text-brand',
  'Galería': 'text-brand-blue',
  'Sobre mí': 'text-brand',
  'Reservar': 'text-brand-blue',
}

const menuItems: GlowMenuItem[] = NAV_LINKS.map((link) => ({
  icon: iconMap[link.label],
  label: link.label,
  href: link.href,
  gradient: gradientMap[link.label],
  iconColor: iconColorMap[link.label],
}))

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState<string>('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)

      const sections = NAV_LINKS.map((l) => l.href.replace('#', ''))
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) {
            const match = NAV_LINKS.find((l) => l.href === `#${id}`)
            if (match) setActiveItem(match.label)
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
    setActiveItem(_label)
  }

  const reservar = () => {
    const url = process.env.NEXT_PUBLIC_CALENDLY_URL
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    window.open(
      url ?? `https://wa.me/${wa}?text=Hola, me gustaría reservar una cita en D Bonita`,
      '_blank'
    )
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

        {/* CTA desktop */}
        <div className="hidden lg:block">
          <button onClick={reservar} className="btn-primary" aria-label="Reservar cita">
            Reservar cita
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
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.06 }}
                onClick={reservar}
                className="btn-primary mt-2"
              >
                Reservar cita
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}