'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Share, WifiOff, X } from 'lucide-react'

const CLAVE_OCULTO = 'dbonita_panel_instalar_oculto'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function leerOculto(): boolean {
  try { return localStorage.getItem(CLAVE_OCULTO) === '1' } catch { return false }
}

function guardarOculto() {
  try { localStorage.setItem(CLAVE_OCULTO, '1') } catch { /* sin almacenamiento: se vuelve a mostrar */ }
}

function esStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function esIOS(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

/** Registro del service worker, aviso de "Sin conexión" e invitación a instalar el panel. */
export default function PanelPwa() {
  const pathname = usePathname()
  const [offline, setOffline] = useState(false)
  const [eventoInstalar, setEventoInstalar] = useState<BeforeInstallPromptEvent | null>(null)
  const [ayudaIOS, setAyudaIOS] = useState(false)
  const [oculto, setOculto] = useState(true)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/panel-sw.js', { scope: '/panel' }).catch((err) => {
        console.error('panel: service worker:', err)
      })
    }

    const actualizarRed = () => setOffline(!navigator.onLine)
    actualizarRed()
    window.addEventListener('online', actualizarRed)
    window.addEventListener('offline', actualizarRed)

    const instalado = esStandalone()
    setOculto(instalado || leerOculto())
    if (!instalado && esIOS()) setAyudaIOS(true)

    const alPoderInstalar = (e: Event) => {
      e.preventDefault()
      setEventoInstalar(e as BeforeInstallPromptEvent)
    }
    const alInstalar = () => { setEventoInstalar(null); setOculto(true) }
    window.addEventListener('beforeinstallprompt', alPoderInstalar)
    window.addEventListener('appinstalled', alInstalar)

    return () => {
      window.removeEventListener('online', actualizarRed)
      window.removeEventListener('offline', actualizarRed)
      window.removeEventListener('beforeinstallprompt', alPoderInstalar)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  const cerrar = () => { guardarOculto(); setOculto(true) }

  const instalar = async () => {
    if (!eventoInstalar) return
    await eventoInstalar.prompt()
    const { outcome } = await eventoInstalar.userChoice
    setEventoInstalar(null)
    if (outcome === 'accepted') setOculto(true)
  }

  const enLogin = pathname?.startsWith('/panel/login') ?? false
  const mostrarInstalar = !oculto && !enLogin && (eventoInstalar !== null || ayudaIOS)

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 bg-black text-white font-sans text-sm py-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          <WifiOff size={16} aria-hidden />
          Sin conexión. Las citas se actualizarán al volver internet.
        </div>
      )}

      {mostrarInstalar && (
        <div className="fixed inset-x-3 z-[45] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:max-w-sm lg:bottom-6">
          <div className="flex items-start gap-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_#000] p-4">
            <div className="flex-1 font-sans text-sm text-text">
              <p className="font-bold mb-1">Instala el panel como app</p>
              {eventoInstalar ? (
                <p className="text-text-muted">Ábrelo desde la pantalla de inicio, como cualquier otra app.</p>
              ) : (
                <p className="text-text-muted">
                  Pulsa <Share size={14} className="inline -mt-0.5" aria-label="Compartir" /> y luego
                  {' '}<strong>&laquo;Añadir a pantalla de inicio&raquo;</strong>.
                </p>
              )}
              {eventoInstalar && (
                <button
                  type="button"
                  onClick={instalar}
                  className="mt-3 inline-flex items-center gap-2 bg-blue text-[#1A3A4A] border-2 border-black rounded-xl px-4 py-2 font-bold shadow-[3px_3px_0_#000]"
                >
                  <Download size={16} aria-hidden />
                  Instalar
                </button>
              )}
            </div>
            <button type="button" onClick={cerrar} aria-label="Cerrar aviso" className="p-1 -m-1 text-text-muted">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
