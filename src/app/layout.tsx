import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import Chatbot from '@/components/Chatbot'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'D Bonita — Centro de Estética en Dénia',
  description:
    'En D Bonita cuidamos cada detalle para ofrecerte mucho más que un tratamiento: una experiencia de bienestar, belleza y desconexión. Centro de estética en Dénia especializado en lifting de pestañas, higienes faciales y servicios corporales.',
  keywords: [
    'centro de estética Dénia',
    'lifting de pestañas Dénia',
    'higiene facial Dénia',
    'uñas semipermanentes Dénia',
    'nail art Dénia',
    'manicura Dénia',
    'pedicura Dénia',
    'belleza natural Dénia',
    'D Bonita Dénia',
    'estética Dénia',
  ],
  openGraph: {
    title: 'D Bonita — Centro de Estética en Dénia',
    description:
      'Centro de estética en Dénia especializado en lifting de pestañas, higienes faciales y servicios corporales.',
    type: 'website',
    locale: 'es_ES',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'D Bonita — Centro de Estética en Dénia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'D Bonita — Centro de Estética en Dénia',
    description: 'Centro de estética en Dénia especializado en lifting de pestañas, higienes faciales y servicios corporales.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${spaceMono.variable}`}>
      <body className="bg-bg text-text antialiased">{children}<Chatbot /></body>
    </html>
  )
}
