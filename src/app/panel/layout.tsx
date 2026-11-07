import type { Metadata, Viewport } from 'next'
import PanelPwa from '@/components/panel/PanelPwa'

// El panel se instala como app (PWA) en el móvil o la tablet de las trabajadoras.
export const metadata: Metadata = {
  title: 'Panel · D Bonita',
  manifest: '/panel.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'D Bonita', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  viewportFit: 'cover',
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PanelPwa />
    </>
  )
}
