'use client'

import Image from 'next/image'

const CLIP_PATTERNS = [
  {
    id: 'clip-organic-0',
    path: 'M0.001 0H1V0.665V0.889C1 0.951 0.944 1 0.874 1S0.748 0.951 0.748 0.89V0.891C0.748 0.951 0.692 1 0.623 1C0.56 1 0.508 0.96 0.499 0.907C0.491 0.96 0.439 1 0.377 1C0.312 1 0.259 0.957 0.254 0.902C0.246 0.957 0.193 1 0.127 1C0.057 1 0 0.95 0 0.889V0.666C0 0.661 0.0004 0.656 0.001 0.651V0Z',
  },
  {
    id: 'clip-organic-1',
    path: 'M0.83 0.233C0.928 0.263 1 0.339 1 0.428V0.964C1 0.984 0.98 1 0.955 1H0.045C0.02 1 0 0.984 0 0.964V0.428C0 0.339 0.072 0.263 0.172 0.233C0.188 0.102 0.329 0 0.5 0C0.671 0 0.812 0.102 0.828 0.233H0.83Z',
  },
  {
    id: 'clip-organic-2',
    path: 'M0.997 0.542C1.029 0.316 0.774 -0.009 0.492 0C0.249 0.008 0 0.218 0 0.539C0.025 0.837 0.249 1 0.492 1C0.745 1 0.983 0.838 0.997 0.542Z',
  },
  {
    id: 'clip-organic-3',
    path: 'M0 1H0.152C0.185 0.96 0.327 0.885 0.505 0.885S0.819 0.968 0.849 1H1V0.347C0.985 0.222 0.839 0.005 0.498 0C0.157 -0.005 0.024 0.229 0 0.347V1Z',
  },
]

export const GALLERY_CLIP_PATHS = CLIP_PATTERNS

export function getClipPathId(index: number): string {
  return CLIP_PATTERNS[index % CLIP_PATTERNS.length].id
}

export function GalleryClipDefs() {
  return (
    <svg className="absolute -top-[999px] -left-[999px] w-0 h-0" aria-hidden="true">
      <defs>
        {CLIP_PATTERNS.map((pattern) => (
          <clipPath key={pattern.id} id={pattern.id} clipPathUnits="objectBoundingBox">
            <path fillRule="evenodd" clipRule="evenodd" d={pattern.path} />
          </clipPath>
        ))}
      </defs>
    </svg>
  )
}

interface OrganicGalleryImageProps {
  src: string
  alt: string
  clipIndex: number
  className?: string
}

export function OrganicGalleryImage({ src, alt, clipIndex, className }: OrganicGalleryImageProps) {
  const clipId = getClipPathId(clipIndex)

  return (
    <div
      className={`relative w-full aspect-[4/5] ${className ?? ''}`}
      style={{ clipPath: `url(#${clipId})` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  )
}