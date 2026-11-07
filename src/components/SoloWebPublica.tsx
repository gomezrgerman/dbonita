'use client'

import { usePathname } from 'next/navigation'

/** Oculta su contenido (chat, aviso de cookies) dentro del panel interno. */
export default function SoloWebPublica({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/panel')) return null
  return <>{children}</>
}
