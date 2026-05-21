import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import Chatbot from '@/components/Chatbot'
import CookieBanner from '@/components/ui/CookieBanner'
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
        url: '/img/og-image.jpg',
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

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'D Bonita',
  url: 'https://dbonita.es',
  telephone: '+34657332722',
  email: 'hola@dbonita.es',
  image: 'https://dbonita.es/img/logo.png',
  description:
    'Centro de estética en Dénia especializado en lifting de pestañas, higienes faciales, manicura, pedicura y servicios corporales.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Carrer del Cop, 5, Piso 1 Puerta 2',
    addressLocality: 'Dénia',
    postalCode: '03700',
    addressRegion: 'Alicante',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.8409,
    longitude: 0.1057,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '19:00',
    },
  ],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card',
  sameAs: [
    'https://www.instagram.com/dbonitadenia/',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${spaceMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="bg-bg text-text antialiased">
        {children}
        <Chatbot />
        <CookieBanner />
      </body>
    </html>
  )
}
