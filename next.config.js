/** @type {import('next').NextConfig} */

// Cabeceras de seguridad básicas. Sin CSP estricta a propósito: Stripe,
// UnicornStudio, Google Maps y EmailJS cargan recursos de terceros.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // El hero usa el giroscopio en móvil: accelerometer/gyroscope se permiten en el propio sitio
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
]

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
