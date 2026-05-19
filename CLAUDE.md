# CLAUDE.md — Proyecto: D Bonita

> Archivo de configuración para Claude Code. Lee este archivo completo antes de escribir cualquier línea de código.

---

## 🎯 Descripción del proyecto

Web profesional para **D Bonita**, estudio de belleza especializado en **uñas** y **lifting de pestañas**. La web debe transmitir elegancia, confianza y feminidad. El objetivo principal es convertir visitas en reservas de cita.

Referencia visual de inspiración: https://www.ristudio.in/

---

## 🛠️ Stack tecnológico

Replicar exactamente el stack de ristudio.in, que es un sitio moderno basado en:

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS v3
- **Animaciones**: Framer Motion + GSAP (ScrollTrigger)
- **Tipografías**: Google Fonts — combinar una serif elegante (ej. `Cormorant Garamond` o `Playfair Display`) con una sans-serif limpia (ej. `DM Sans` o `Jost`)
- **Formularios / Reservas**: Integración con **Calendly** (embed widget o redirect button)
- **Imágenes**: `next/image` con placeholders (blur placeholder, aspect-ratio fijo)
- **Iconos**: Lucide React
- **Deployment target**: Vercel

---

## 🎨 Identidad visual

### Paleta de colores
```css
:root {
  --color-bg:         #FAF7F4;   /* blanco roto / crema muy suave */
  --color-surface:    #F2EDE8;   /* beige claro para tarjetas/secciones */
  --color-primary:    #C9A882;   /* nude dorado cálido — color principal */
  --color-primary-dark: #A8845E; /* nude oscuro — hover, énfasis */
  --color-text:       #2C2420;   /* marrón casi negro — texto principal */
  --color-text-muted: #8A7060;   /* marrón medio — subtítulos, captions */
  --color-accent:     #E8D5C0;   /* beige claro — bordes, líneas decorativas */
  --color-white:      #FFFFFF;
}
```

### Tipografía
- **Display / Headings grandes**: `Cormorant Garamond` — serif elegante, peso 300–600
- **Subtítulos y UI**: `Jost` — sans-serif geométrica limpia, peso 300–500
- **Body / párrafos**: `Jost` peso 300

### Tono visual
Luxury spa minimalista. Mucho espacio negativo. Fotografías en tonos cálidos. Sin bordes agresivos. Sin colores saturados. Sensación de calma y profesionalidad.

---

## 📐 Estructura de páginas

### `/` — Home (página principal, scroll único)

Secciones en orden:

1. **Navbar**
   - Logo "D Bonita" (texto con tipografía serif)
   - Links: Inicio · Servicios · Galería · Sobre mí · Reservar
   - CTA button "Reservar cita" → abre Calendly
   - Mobile: hamburger menu con animación

2. **Hero**
   - Headline grande en dos líneas: *"Despierta tu*" + *"Belleza Natural"* (tipografía display, serif)
   - Subheadline: "Uñas y lifting de pestañas en [ciudad]"
   - Dos botones: "Reservar cita" (primario → Calendly) + "Ver servicios" (secundario → scroll)
   - Imagen hero: placeholder femenino de calidad (imagen en blanco/crema, aspect ratio portrait)
   - Decoración: línea dorada fina, forma geométrica suave (círculo parcial o arco)

3. **Franja de confianza** (tipo ticker/scroll horizontal)
   - Texto repetido animado: "✦ Uñas · ✦ Lifting de Pestañas · ✦ Manicura · ✦ Pedicura · ✦ D Bonita"

4. **Sobre mí** ("Conoce a la artista")
   - Foto placeholder (portrait, formato cuadrado o vertical)
   - Texto de presentación de la especialista
   - 3–4 badges/stats: "500+ clientas felices · 100% resultados naturales · X años de experiencia"

5. **Servicios** ("Nuestros Tratamientos")
   - Grid de tarjetas (2 cols desktop, 1 col mobile)
   - Servicios mínimos:
     - Manicura semipermanente
     - Nail art / diseño de uñas
     - Lifting de pestañas
     - Laminado de cejas (si aplica)
   - Cada tarjeta: icono o número decorativo, nombre del servicio, descripción corta, "Ver más →"

6. **Galería de resultados** ("Antes & Después")
   - Grid masonry o grid uniforme 3 columnas
   - Placeholders con aspect-ratio cuadrado
   - Efecto hover: ligero zoom + overlay con nombre del tratamiento
   - Botón "Ver más resultados" → link a Instagram (placeholder)

7. **Reserva de cita** ("Reserva tu momento")
   - Sección highlight con fondo `--color-primary` suave
   - Texto: "¿Lista para transformar tu look? Reserva tu cita en 60 segundos"
   - **Embed de Calendly** (inline widget) O botón grande que abre Calendly popup
   - Usar: `https://calendly.com/[USUARIO-DBONITA]` — dejar como variable de entorno `NEXT_PUBLIC_CALENDLY_URL`
   - Fallback: si no hay URL configurada, mostrar botón de WhatsApp

8. **Testimonios**
   - Slider/carousel (Framer Motion o Swiper)
   - Tarjetas con: nombre, edad/ciudad (opcional), reseña, estrellas ⭐⭐⭐⭐⭐
   - Mínimo 3 testimonios placeholder redactados en tono natural español

9. **FAQ**
   - Acordeón animado (Framer Motion AnimatePresence)
   - 5–6 preguntas frecuentes sobre uñas, lifting y proceso de reserva

10. **Contacto + Footer**
    - Teléfono (placeholder)
    - Email (placeholder)
    - Dirección/ciudad (placeholder)
    - Links redes: Instagram · WhatsApp
    - Copyright "© 2025 D Bonita — Todos los derechos reservados"

---

## 📱 Requisitos técnicos

- **100% responsive**: mobile-first design
- **Performance**: Lazy loading en imágenes, fonts con `display=swap`
- **SEO**: metadata básica en `layout.tsx` (title, description, og:image placeholder)
- **Accesibilidad**: alt en imágenes, aria-labels en botones, contraste suficiente
- **Smooth scroll**: anclas entre secciones con scroll suave
- **Animaciones**:
  - Fade-in + slide-up en secciones al hacer scroll (Framer Motion `whileInView`)
  - Hover states en tarjetas de servicios (ligero elevate + sombra)
  - Hero con animación de entrada (stagger entre headline, subheadline y botones)
  - Ticker horizontal en franja de confianza (CSS animation o GSAP)

---

## 🗂️ Estructura de archivos

```
d-bonita/
├── CLAUDE.md                    ← este archivo
├── .env.local                   ← variables de entorno
├── next.config.js
├── tailwind.config.js
├── package.json
├── public/
│   ├── images/
│   │   ├── hero-placeholder.jpg
│   │   ├── about-placeholder.jpg
│   │   └── gallery/
│   │       ├── result-01.jpg    ← placeholders (usar unsplash/picsum)
│   │       └── ...
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx           ← fonts, metadata global
    │   ├── page.tsx             ← página home (importa secciones)
    │   └── globals.css          ← variables CSS + reset + utilidades
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   └── sections/
    │       ├── Hero.tsx
    │       ├── Ticker.tsx
    │       ├── About.tsx
    │       ├── Services.tsx
    │       ├── Gallery.tsx
    │       ├── Booking.tsx      ← integración Calendly
    │       ├── Testimonials.tsx
    │       ├── FAQ.tsx
    │       └── Contact.tsx
    └── lib/
        └── constants.ts         ← datos de servicios, testimonios, FAQ
```

---

## ⚙️ Variables de entorno

Crear `.env.local` con:

```bash
# URL de Calendly (reemplazar cuando el cliente cree su cuenta)
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/dbonita

# WhatsApp fallback (con prefijo internacional, sin + ni espacios)
NEXT_PUBLIC_WHATSAPP_NUMBER=34600000000

# Instagram
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/dbonita
```

---

## 📦 Dependencias a instalar

```bash
npx create-next-app@14 d-bonita --typescript --tailwind --app --src-dir --import-alias "@/*"

cd d-bonita

npm install framer-motion gsap lucide-react
npm install react-calendly          # para embed/popup de Calendly
npm install @tailwindcss/typography # para texto enriquecido si se añade blog
```

---

## 🧠 Instrucciones de comportamiento para Claude Code

1. **Lee este archivo completo antes de empezar** cualquier tarea
2. **No inventes datos reales**: usa placeholders claros marcados con `[PLACEHOLDER]` o comentarios `// TODO:`
3. **Prioriza la sección Booking**: es el objetivo de conversión principal
4. **Calendly primero, WhatsApp como fallback**: si `NEXT_PUBLIC_CALENDLY_URL` está vacío, mostrar botón de WhatsApp con mensaje pre-escrito
5. **Animaciones con moderación**: elegantes y sutiles, no flashy. El usuario debe sentir calma, no sobrecarga visual
6. **Paleta estricta**: no uses colores fuera de las variables CSS definidas arriba
7. **Tipografía**: Cormorant Garamond solo para headings grandes (`text-4xl` en adelante). Jost para todo lo demás
8. **Imágenes placeholder**: usar `https://picsum.photos/seed/dbonita-[N]/800/600` con `next/image` y `blurDataURL` placeholder
9. **Componentes atómicos**: cada sección es su propio componente en `/components/sections/`
10. **`constants.ts`**: todos los textos de servicios, testimonios y FAQ van aquí, no hardcodeados en JSX

---

## 🎯 Objetivo final

Una web que cuando la vea una potencial clienta piense: *"Esto es exactamente donde quiero ir"* — y que el siguiente clic sea **Reservar cita**.

La conversión es el norte. El diseño es el vehículo.
