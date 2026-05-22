import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada — D Bonita',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-sm w-full flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <span
            className="font-sans text-black"
            style={{ fontSize: 'clamp(6rem, 25vw, 11rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}
            aria-hidden="true"
          >
            404
          </span>
          <span className="font-sans text-xs font-light tracking-[0.3em] uppercase text-text-muted">
            D Bonita · Dénia
          </span>
        </div>
        <div
          className="w-12 h-px"
          style={{ background: 'var(--color-primary)' }}
          aria-hidden="true"
        />
        <p className="font-sans text-base text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
          Esta página no existe o ha sido movida.
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
