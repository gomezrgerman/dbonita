'use client'

import { FC } from 'react'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────
export interface iServiceCardItem {
  title: string
  description: string
  duracion: string
  precio: string
  src: string
  tag: string        // para accesibilidad / aria-label
}

interface iCardProps extends iServiceCardItem {
  i: number
  onReservar: (servicio: string) => void
}

// ─── Tarjeta individual ───────────────────────────────────
const Card: FC<iCardProps> = ({
  title,
  description,
  duracion,
  precio,
  src,
  i,
  onReservar,
}) => {
  return (
    <div
      className="h-screen flex items-center justify-center sticky top-0"
      style={{ zIndex: 10 + i }}
    >
      <div className="relative w-full h-full overflow-hidden">

        {/* Imagen de fondo */}
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority={i === 0}
        />

        {/* Overlay degradado — oscuro en la mitad inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Contenido centrado en la parte inferior */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
            <div className="max-w-2xl flex flex-col gap-5">

              {/* Número decorativo */}
              <span
                className="font-display text-7xl lg:text-9xl font-light leading-none text-white/10 select-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Nombre del servicio */}
              <h3 className="font-display text-4xl lg:text-6xl font-light text-white leading-tight -mt-6 lg:-mt-10">
                {title}
              </h3>

              {/* Descripción */}
              <p className="font-sans text-sm lg:text-base font-light text-white/75 leading-relaxed max-w-lg">
                {description}
              </p>

              {/* Duración + Precio + CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                {/* Duración */}
                <div className="flex items-center gap-2 text-white/60">
                  <Clock size={14} aria-hidden="true" />
                  <span className="font-sans text-sm font-light">{duracion}</span>
                </div>

                {/* Separador */}
                <span className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />

                {/* Precio */}
                <span className="font-sans text-sm font-light text-white/60">
                  {precio}
                </span>

                {/* Botón reservar */}
                <button
                  onClick={() => onReservar(title)}
                  className="sm:ml-auto flex items-center gap-2 text-sm text-white px-6 py-3 rounded-card transition-all duration-200"
                  style={{ fontWeight: 600, background: 'var(--color-pomegranate)', transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-4px)'; e.currentTarget.style.boxShadow = 'rgb(255,255,255) -5px 5px' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                  aria-label={`Reservar ${title}`}
                >
                  Reservar
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────
interface iScrollCardsProps {
  items: iServiceCardItem[]
  onReservar: (servicio: string) => void
}

const ScrollCards: FC<iScrollCardsProps> = ({ items, onReservar }) => {
  return (
    <div style={{ height: `${items.length * 100}vh` }}>
      {items.map((item, i) => (
        <Card
          key={item.title}
          {...item}
          i={i}
          onReservar={onReservar}
        />
      ))}
    </div>
  )
}

export { ScrollCards }
