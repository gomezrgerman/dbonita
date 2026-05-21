import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aviso Legal — D Bonita',
  description: 'Aviso legal e información del titular de D Bonita, centro de estética en Dénia.',
  robots: { index: false, follow: false },
}

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-text-muted hover:text-black transition-colors mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="font-sans text-3xl font-bold text-black mb-2" style={{ letterSpacing: '-0.03em' }}>
          Aviso Legal
        </h1>
        <p className="text-sm text-text-muted mb-10">En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</p>

        <div className="flex flex-col gap-8 font-sans text-sm text-text leading-relaxed" style={{ fontWeight: 400 }}>

          <section>
            <h2 className="font-bold text-black text-base mb-3">1. Datos del titular</h2>
            <p>
              <strong>Nombre:</strong> Diana Alexandra Pulgarin Morales<br />
              <strong>NIF:</strong> 54738932J<br />
              <strong>Domicilio:</strong> Carrer del Cop, 5, Piso 1 Puerta 2, 03700 Dénia, Alicante, España<br />
              <strong>Email de contacto:</strong> {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@dbonita.es'}<br />
              <strong>Actividad:</strong> Centro de estética — servicios de belleza y bienestar
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">2. Objeto y ámbito de aplicación</h2>
            <p>
              El presente Aviso Legal regula el acceso y uso del sitio web <strong>dbonita.es</strong> (en adelante, "el Sitio"), cuya titularidad corresponde a Diana Alexandra Pulgarin Morales. El acceso al Sitio implica la aceptación plena y sin reservas de las condiciones aquí establecidas.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">3. Propiedad intelectual e industrial</h2>
            <p>
              Todos los contenidos del Sitio —textos, imágenes, logotipos, diseño gráfico y código fuente— son propiedad de Diana Alexandra Pulgarin Morales o de sus proveedores, y están protegidos por las leyes de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o comunicación pública sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">4. Exclusión de responsabilidad</h2>
            <p>
              D Bonita no se hace responsable de los daños que pudieran derivarse del uso incorrecto del Sitio, de interrupciones del servicio por causas ajenas, ni del contenido de páginas de terceros enlazadas desde el Sitio.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">5. Política de reservas y pagos</h2>
            <p className="mb-2">
              La reserva de cita requiere el abono de una <strong>señal de 10 €</strong> a través de la pasarela de pago Stripe. El resto del importe se abona en el establecimiento el día de la cita.
            </p>
            <p className="mb-2">
              <strong>Política de cancelación:</strong> La cancelación es gratuita hasta <strong>24 horas antes</strong> de la cita. Pasado ese plazo, la señal no es reembolsable, salvo causa de fuerza mayor debidamente acreditada.
            </p>
            <p>
              Para cancelaciones dentro del plazo, utiliza el enlace de cancelación incluido en el email de confirmación. Para cualquier incidencia, contáctanos directamente.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">6. Protección de datos</h2>
            <p>
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/privacidad" className="underline hover:text-black transition-colors">
                Política de Privacidad
              </Link>
              , elaborada conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">7. Legislación aplicable y jurisdicción</h2>
            <p>
              El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia derivada del uso del Sitio, las partes se someten a los Juzgados y Tribunales de <strong>Dénia (Alicante)</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-accent flex gap-4 text-xs text-text-muted">
          <Link href="/privacidad" className="hover:text-black transition-colors">Política de Privacidad</Link>
          <Link href="/" className="hover:text-black transition-colors">D Bonita</Link>
        </div>
      </div>
    </div>
  )
}
