# Lanzamiento de D Bonita: pasos pendientes

Estado a 4 de noviembre de 2026. La web está en producción detrás de "Próximamente"
(`SITE_ENABLED` no es `true`). Todo lo de código está hecho; lo que queda son cuentas,
claves y pruebas.

## Dos formas de lanzar

**A. Lanzamiento rápido (modo WhatsApp, sin Supabase ni Stripe).** Es el modo por defecto.
La clienta elige sus tratamientos en la web y pulsa "Enviar solicitud por WhatsApp": se abre
WhatsApp con el mensaje ya escrito (servicios, duración y total). El pago se hace en el centro.
No hace falta nada de las secciones 1 a 3. Solo hay que hacer la sección 5 (contenido) y abrir la web (sección 8:
`SITE_ENABLED` = `true` → Redeploy).

**B. Reserva online completa (calendario + señal con tarjeta).** Cuando Supabase, Stripe y
Resend estén configurados (secciones 1 a 4), añadir en Vercel `NEXT_PUBLIC_RESERVAS_ONLINE` = `true`
y hacer Redeploy. La web pasa sola al calendario con pago de señal.

Las variables se configuran en **Vercel → proyecto dbonita → Settings → Environment
Variables**, entorno **Production**. Cada cambio de variables necesita un **Redeploy**
(Deployments → último → ⋯ → Redeploy) para que se aplique.

---

## 1. Base de datos (Supabase)

- [ ] Abrir el proyecto en supabase.com → **SQL Editor** → New query.
- [ ] Pegar el contenido de `supabase/schema.sql` y pulsar **Run**. Se puede ejecutar
      aunque ya se hubiera hecho antes: no borra datos.
- [ ] Comprobar en **Table Editor** que existen las tablas `reservas` y `bloqueos`.
- [ ] Confirmar que en Vercel `SUPABASE_SERVICE_ROLE_KEY` es la **service_role** de
      Project Settings → API (no la anon).

## 2. Pagos (Stripe)

Hacer primero todo en **modo prueba** y repetir en **modo real** al final (paso 7).

- [ ] Entrar en dashboard.stripe.com con la cuenta del negocio (titular: Diana).
- [ ] Developers → API keys → copiar las claves de prueba.
- [ ] En Vercel, **añadir** (ahora no existen):
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
  - `STRIPE_SECRET_KEY` = `sk_test_...`
- [ ] Developers → Webhooks → **Add endpoint**:
  - URL: `https://www.dbonita.es/api/webhook/stripe` (**con www**: Stripe no sigue redirecciones)
  - Evento: `payment_intent.succeeded`
- [ ] Copiar el **Signing secret** (`whsec_...`) y **sustituir** en Vercel
      `STRIPE_WEBHOOK_SECRET` (el actual es de hace meses y puede no corresponder).

## 3. Emails (Resend)

Los emails salen de `reservas@dbonita.es`. Las plantillas están en el código
(`src/lib/email-plantillas.ts`): confirmación a la clienta, aviso al centro y cancelación.

- [ ] Crear cuenta gratis en resend.com (3.000 emails/mes, 100/día).
- [ ] Domains → Add Domain → `dbonita.es` (región Ireland, eu-west-1).
- [ ] Copiar los registros DNS que muestra Resend (DKIM, SPF/MX en `send`, y DMARC opcional)
      en **Hostinger → Dominios → dbonita.es → DNS**. Esperar a que Resend marque el dominio como **Verified**.
- [ ] API Keys → Create API Key (permiso "Sending access", dominio `dbonita.es`).
- [ ] En Vercel, añadir:
  - `RESEND_API_KEY` = `re_...` (Sensitive)
  - `EMAIL_NEGOCIO` = email del centro que recibe el aviso de cada reserva (por defecto `dbonitadenia@gmail.com`)
  - Opcionales: `EMAIL_FROM` (por defecto `D Bonita <reservas@dbonita.es>`) y
    `EMAIL_REPLY_TO` (a dónde responden las clientas; por defecto `dbonitadenia@gmail.com`)

## 4. Resto de variables en Vercel

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.dbonita.es` (con www; se usa en el enlace de cancelar)
- [ ] `NEXT_PUBLIC_BUSINESS_EMAIL` = `dbonitadenia@gmail.com` (añadir, no existe)
- [ ] `PANEL_PASSWORD`: si sigue siendo `cambiar-antes-de-produccion`, poner una
      contraseña larga y dársela a las dueñas.
- [ ] `PREVIEW_TOKEN`: ya existe; apuntarlo para el paso 6.
- [ ] **Redeploy** de producción.

## 5. Contenido

- [ ] Foto corporal real para la tarjeta "Drenaje Linfático" (ahora usa un masaje facial provisional).
- [ ] Permiso de las clientas que salen con la cara (fotos de faciales y hombre con mascarilla).
- [ ] Repasar con las dueñas precios, duraciones y textos de servicios.

## 6. Prueba completa en modo prueba (sin abrir la web al público)

Entrar en `https://www.dbonita.es/?preview=PREVIEW_TOKEN` (deja una cookie de 7 días).

- [ ] Reservar un servicio desde el móvil hasta el pago.
- [ ] Pagar con la tarjeta de prueba `4242 4242 4242 4242`, fecha futura, CVC `123`.
- [ ] Llega el email de confirmación a la clienta y el aviso al negocio.
- [ ] La reserva aparece en `https://www.dbonita.es/panel`.
- [ ] Ese hueco ya no se ofrece en el calendario.
- [ ] Cancelar con el enlace del email → llega el email de cancelación y Stripe muestra el reembolso.
- [ ] En Stripe → Webhooks, el endpoint muestra entregas con respuesta 200.

## 7. Pasar a pagos reales

- [ ] Stripe: completar la activación de la cuenta (datos del negocio e IBAN).
- [ ] Repetir el paso 2 en **modo real**: claves `pk_live_...` / `sk_live_...` y un
      webhook nuevo en modo real con su propio `whsec_...`.
- [ ] Redeploy y hacer una reserva real de 10 € para comprobarlo (se puede cancelar y se reembolsa).

## 8. Abrir la web

- [ ] En Vercel: `SITE_ENABLED` = `true` → Redeploy.
- [ ] Google Search Console: añadir `https://www.dbonita.es` y enviar `https://www.dbonita.es/sitemap.xml`.
- [ ] Google Business Profile e Instagram: poner el enlace a la web.
