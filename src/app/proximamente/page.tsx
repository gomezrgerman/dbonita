import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Próximamente — D Bonita',
  description: 'Muy pronto abrimos las puertas. Síguenos en Instagram para no perderte el lanzamiento.',
}

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/dbonita'
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'

export default function Proximamente() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FAF7F4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '"Jost", "DM Sans", sans-serif',
      }}
    >
      {/* Decoración superior */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #C9A882, #A8845E)',
        }}
        aria-hidden="true"
      />

      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '3rem',
              fontWeight: 300,
              color: '#2C2420',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            D Bonita
          </p>
          <div style={{ width: '40px', height: '1px', background: '#C9A882' }} aria-hidden="true" />
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(2.25rem, 8vw, 3.5rem)',
              fontWeight: 400,
              color: '#2C2420',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            Próximamente
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: '#8A7060',
              fontWeight: 300,
              lineHeight: 1.6,
              maxWidth: '360px',
            }}
          >
            Estamos preparando algo especial para ti. Muy pronto podrás reservar tu cita online.
          </p>
        </div>

        {/* Card de contacto */}
        <div
          style={{
            background: '#F2EDE8',
            border: '1px solid #E8D5C0',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8A7060',
            }}
          >
            Mientras tanto, encuéntranos en
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: '#2C2420',
                color: '#FAF7F4',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Instagram
            </Link>
            <Link
              href={`https://wa.me/${whatsappNumber}?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20informaci%C3%B3n`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: '#C9A882',
                color: '#2C2420',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          fontSize: '0.7rem',
          color: '#C9A882',
          letterSpacing: '0.08em',
        }}
      >
        © 2025 D Bonita
      </p>
    </main>
  )
}
