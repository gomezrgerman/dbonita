'use client'

import { useEffect, useState } from 'react'

/**
 * Devuelve un contador que sube cada `intervaloMs` (solo con la app visible),
 * al volver a la app y al recuperar la conexión. Se usa como dependencia de
 * los efectos que cargan datos para que el panel se mantenga al día.
 */
export function useRefrescoAutomatico(intervaloMs = 60_000): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1)
    }
    const id = window.setInterval(refrescar, intervaloMs)
    document.addEventListener('visibilitychange', refrescar)
    window.addEventListener('online', refrescar)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', refrescar)
      window.removeEventListener('online', refrescar)
    }
  }, [intervaloMs])

  return tick
}
