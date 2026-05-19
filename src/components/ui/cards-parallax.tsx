'use client'

import { FC } from 'react'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'

export interface iParallaxCard {
  title: string
  description: string
  duracion: string
  precio: string
  src: string
  tag: string
  overlay: string
}

interface iCardProps extends iParallaxCard {
  i: number
  onReservar: () => void
}

const Card: FC<iCardProps> = ({ title, description, duracion, precio, src, tag, overlay, i, onReservar }) => {
  return (
    <div
      className="h-screen sticky top-0"
      style={{ zIndex: 10 + i }}
    >
      {/* Imagen a pantalla completa */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority={i === 0}
        />

        {/* Tinte de color de marca */}
        <div className="absolute inset-0" style={{ background: overlay }} />

        {/* Gradiente oscuro inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Contenido anclado abajo */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-12 md:px-16 md:pb-16 max-w-4xl">
          <span className="label-upper text-white/50 block mb-3">
            {tag}
          </span>

          <h3
            className="text-white leading-tight mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            {title}
          </h3>

          <p className="text-white/65 text-sm leading-relaxed max-w-md mb-6" style={{ fontWeight: 400 }}>
            {description}
          </p>

          <div
            className="flex flex-col sm:flex-row sm:items-center gap-4 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span
              className="flex items-center gap-1.5 text-white/55 text-xs"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              <Clock size={11} aria-hidden="true" />
              {duracion}
            </span>
            <span className="text-white text-lg" style={{ fontWeight: 800 }}>
              {precio}
            </span>

            <button
              onClick={onReservar}
              className="sm:ml-auto flex items-center gap-2 text-sm text-black px-6 py-3 rounded-card"
              style={{
                fontWeight: 700,
                background: '#F9BC1A',
                transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-3px)'
                e.currentTarget.style.boxShadow = 'rgb(255,255,255) -4px 4px'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
              aria-label={`Reservar ${title}`}
            >
              Reservar ahora
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface iCardsParallaxProps {
  items: iParallaxCard[]
  onReservar: () => void
}

const CardsParallax: FC<iCardsParallaxProps> = ({ items, onReservar }) => {
  return (
    <div>
      {items.map((item, i) => (
        <Card key={item.title} {...item} i={i} onReservar={onReservar} />
      ))}
    </div>
  )
}

export { CardsParallax }
