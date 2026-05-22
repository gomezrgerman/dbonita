import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F4',
          fontFamily: 'Georgia, serif',
          gap: '0px',
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid #E8D5C0',
            display: 'flex',
            pointerEvents: 'none',
          }}
        />

        {/* Brand name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px', lineHeight: '1' }}>
          <span
            style={{
              fontSize: '160px',
              fontWeight: '700',
              color: '#C9A882',
              letterSpacing: '-0.04em',
              lineHeight: '1',
              fontFamily: 'Georgia, serif',
            }}
          >
            D
          </span>
          <span
            style={{
              fontSize: '96px',
              fontWeight: '700',
              color: '#2C2420',
              letterSpacing: '-0.03em',
              lineHeight: '1',
              marginLeft: '12px',
              fontFamily: 'Georgia, serif',
            }}
          >
            Bonita
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '120px',
            height: '1px',
            backgroundColor: '#C9A882',
            marginTop: '32px',
            marginBottom: '28px',
          }}
        />

        {/* Tagline */}
        <span
          style={{
            fontSize: '20px',
            color: '#8A7060',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
            fontWeight: '400',
          }}
        >
          Estudio de Belleza · Dénia
        </span>

        {/* Services */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginTop: '20px',
          }}
        >
          {['Uñas', 'Lifting de Pestañas', 'Estética'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ fontSize: '15px', color: '#A8845E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {s}
              </span>
              {i < 2 && (
                <span style={{ fontSize: '14px', color: '#E8D5C0' }}>✦</span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
