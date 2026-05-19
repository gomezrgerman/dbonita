import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Próximamente — D Bonita',
  description: 'Muy pronto abrimos las puertas. Síguenos en Instagram para no perderte el lanzamiento.',
  robots: { index: false, follow: false },
}

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/dbonita'
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'

export default function Proximamente() {
  return (
    <main
      className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      aria-label="Página próximamente"
    >

      {/* Blob decorativo fondo — amarillo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--color-brand)' }}
      />
      {/* Blob decorativo fondo — azul */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'var(--color-brand-blue)' }}
      />

      {/* Contenido centrado */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10 text-center">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-baseline gap-0">
            <span
              className="font-sans"
              style={{ fontWeight: 800, fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', letterSpacing: '-0.03em', color: 'var(--color-brand)' }}
            >
              D
            </span>
            <span
              className="font-sans"
              style={{ fontWeight: 800, fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', letterSpacing: '-0.03em', color: '#1A3A4A' }}
            >
              {' '}Bonita
            </span>
          </div>
          <span
            className="label-upper"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Centro de Estética · Dénia
          </span>
        </div>

        {/* Card principal */}
        <div className="clay-card w-full flex flex-col items-center gap-6 p-8" style={{ borderRadius: '28px' }}>

          {/* Badge */}
          <span
            className="label-upper px-4 py-1.5 rounded-full"
            style={{ background: 'var(--color-brand-light)', color: '#8a6800' }}
          >
            Muy pronto
          </span>

          {/* Headline */}
          <div className="flex flex-col gap-3">
            <h1
              className="font-sans text-black leading-tight"
              style={{ fontWeight: 800, fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              Estamos preparando algo especial
            </h1>
            <p
              className="font-sans leading-relaxed"
              style={{ fontWeight: 400, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}
            >
              Nuestra web de reservas estará lista en breve. Mientras tanto, puedes contactarnos directamente.
            </p>
          </div>

          {/* Divisor */}
          <div className="w-full h-px" style={{ background: 'var(--color-accent)' }} aria-hidden="true" />

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              style={{ borderRadius: '12px', textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </Link>
            <Link
              href={`https://wa.me/${whatsappNumber}?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20informaci%C3%B3n`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
              style={{ borderRadius: '12px', textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.136 1.542 5.863L.057 23.527a.5.5 0 0 0 .609.64l5.856-1.533A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 0 1-5.032-1.389l-.36-.214-3.733.978.996-3.63-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
              </svg>
              WhatsApp
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="label-upper" style={{ color: 'var(--color-accent)' }}>
          © 2025 D Bonita — Todos los derechos reservados
        </p>

      </div>
    </main>
  )
}
