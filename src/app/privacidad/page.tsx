import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — D Bonita',
  description: 'Información sobre el tratamiento de datos personales en D Bonita, centro de estética en Dénia.',
  robots: { index: false, follow: false },
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-text-muted hover:text-black transition-colors mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="font-sans text-3xl font-bold text-black mb-2" style={{ letterSpacing: '-0.03em' }}>
          Política de Privacidad
        </h1>
        <p className="text-sm text-text-muted mb-10">Última actualización: mayo de 2026</p>

        <div className="flex flex-col gap-8 font-sans text-sm text-text leading-relaxed" style={{ fontWeight: 400 }}>

          <section>
            <h2 className="font-bold text-black text-base mb-3">1. Responsable del tratamiento</h2>
            <p>
              <strong>Titular:</strong> Diana Alexandra Pulgarin Morales<br />
              <strong>NIF:</strong> 54738932J<br />
              <strong>Dirección:</strong> Carrer del Cop, 5, Piso 1 Puerta 2, 03700 Dénia, Alicante, España<br />
              <strong>Email:</strong> {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@dbonita.es'}<br />
              <strong>Teléfono:</strong> {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` : '+34 600 000 000'}
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">2. Datos que recopilamos y finalidad</h2>
            <p className="mb-3">Cuando realizas una reserva a través de esta web, recogemos:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Nombre completo</strong> — para identificarte y gestionar tu cita.</li>
              <li><strong>Teléfono</strong> — para enviarte recordatorios y contactar contigo si hay algún cambio en tu cita.</li>
              <li><strong>Correo electrónico</strong> — para enviarte la confirmación y el enlace de cancelación.</li>
              <li><strong>Notas adicionales</strong> (opcional) — para personalizar el tratamiento (alergias, preferencias de diseño).</li>
            </ul>
            <p className="mt-3">
              El pago de la señal (10 €) se procesa a través de <strong>Stripe</strong>. D Bonita no almacena datos de tarjeta bancaria en ningún momento.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">3. Base jurídica del tratamiento</h2>
            <p>
              El tratamiento de tus datos se basa en la <strong>ejecución de un contrato de prestación de servicios</strong> (art. 6.1.b RGPD): la reserva de una cita implica un acuerdo de servicio entre tú y D Bonita. Los datos de contacto se tratan también por <strong>interés legítimo</strong> (art. 6.1.f RGPD) para el envío de recordatorios vinculados directamente a la cita reservada.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">4. Conservación de datos</h2>
            <p>
              Tus datos se conservan durante <strong>2 años</strong> desde la última cita realizada, plazo necesario para gestionar posibles reclamaciones. Transcurrido ese período se eliminan o anoninizan de forma segura.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">5. Destinatarios</h2>
            <p className="mb-2">Tus datos pueden ser accedidos por los siguientes proveedores de servicios, todos con garantías adecuadas según el RGPD:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Supabase Inc.</strong> (base de datos) — servidores en la UE.</li>
              <li><strong>Stripe Inc.</strong> (pasarela de pago) — con certificación PCI DSS.</li>
              <li><strong>EmailJS</strong> (envío de confirmaciones por email).</li>
              <li><strong>Vercel Inc.</strong> (alojamiento web) — con DPA firmado.</li>
            </ul>
            <p className="mt-3">No cedemos tus datos a terceros con fines comerciales ni publicitarios.</p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">6. Tus derechos</h2>
            <p className="mb-2">Puedes ejercer en cualquier momento los siguientes derechos:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos.</li>
              <li><strong>Oposición y limitación:</strong> oponerte a ciertos tratamientos.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, envía un email a{' '}
              <strong>{process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@dbonita.es'}</strong>{' '}
              indicando el derecho que deseas ejercer y una copia de tu DNI. Respondemos en un plazo máximo de 30 días.
            </p>
            <p className="mt-2">
              Si consideras que el tratamiento no es conforme, puedes presentar una reclamación ante la{' '}
              <strong>Agencia Española de Protección de Datos (AEPD)</strong> en{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline">www.aepd.es</a>.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">7. Cookies</h2>
            <p className="mb-3">
              Esta web utiliza cookies técnicas necesarias para el funcionamiento del proceso de reserva y el panel de administración. Con tu consentimiento explícito también se cargan recursos de terceros que pueden establecer cookies propias:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mb-3">
              <li><strong>Google Maps (Google LLC)</strong> — mapa interactivo de ubicación del estudio. Solo se carga si aceptas las cookies.</li>
              <li><strong>UnicornStudio (Hiunicorn Studio)</strong> — animación de fondo del hero. Solo se carga si aceptas las cookies.</li>
              <li><strong>Stripe Inc.</strong> — pasarela de pago para la señal de reserva. Necesario para completar el proceso.</li>
              <li><strong>Google Fonts (Google LLC)</strong> — tipografías del sitio.</li>
            </ul>
            <p>
              Puedes retirar tu consentimiento en cualquier momento recargando la página y pulsando «Rechazar» en el aviso de cookies, o gestionando las cookies desde la configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-black text-base mb-3">8. Seguridad</h2>
            <p>
              Adoptamos medidas técnicas y organizativas para proteger tus datos: conexión cifrada HTTPS, acceso restringido a la base de datos, y nunca almacenamos datos de tarjeta bancaria (procesados directamente por Stripe).
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-accent flex gap-4 text-xs text-text-muted">
          <Link href="/aviso-legal" className="hover:text-black transition-colors">Aviso Legal</Link>
          <Link href="/" className="hover:text-black transition-colors">D Bonita</Link>
        </div>
      </div>
    </div>
  )
}
