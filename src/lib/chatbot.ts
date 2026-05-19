import { SERVICIOS, CATEGORIAS_SERVICIOS, PREGUNTAS_FAQ } from './constants'

export interface ChatResponse {
  text: string
  quickReplies?: string[]
  showWhatsApp?: boolean
}

interface KnowledgeEntry {
  keywords: string[]
  response: string
  quickReplies?: string[]
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'hey', 'hi'],
    response: '¡Hola! 👋 Soy el asistente de D Bonita. ¿En qué puedo ayudarte? Puedo informarte sobre nuestros servicios, precios, horarios o ayudarte a elegir el tratamiento perfecto para ti.',
    quickReplies: ['¿Qué servicios ofrecéis?', '¿Cuáles son los precios?', '¿Cuál es el mejor tratamiento para mí?', '¿Cómo reservo cita?'],
  },
  {
    keywords: ['servicio', 'servicios', 'tratamiento', 'tratamientos', 'que haceis', 'que ofrecen', 'que teneis', 'catalogo', 'menu'],
    response: `En D Bonita ofrecemos estos tratamientos:\n\n💅 **Uñas**: Manicura, Manicura DBonita, Manicura Renaissance, Extensiones\n👁️ **Cejas y Pestañas**: Lifting coreano, Laminado de cejas, Tinte\n💆 **Faciales**: Higiene facial, Radiofrecuencia, Detox, Vitamina C, Glow Skin, Skin Balance\n🦶 **Pedicura**: Renaissance y Renaissance Semi\n🌿 **Corporales**: Maderoterapia, Drenaje linfático\n✨ **Extras**: Francesa, Decoración básica y elaborada\n\n¿Te interesa alguno en particular?`,
    quickReplies: ['¿Cuánto cuesta la manicura?', '¿Qué es el lifting de pestañas?', '¿Me recomiendas un tratamiento facial?'],
  },
  {
    keywords: ['precio', 'precios', 'cuanto cuesta', 'cuanto vale', 'coste', 'cuanto es', 'tarifa', 'tarifas'],
    response: `Aquí tienes nuestros precios más populares:\n\n• Manicura DBonita — **25€** (60 min)\n• Lifting Coreano Pestañas — **45€** (90 min)\n• Laminado de Cejas — **40€** (60 min)\n• Glow Skin Therapy — **59€** (90 min)\n• Manicura clásica — **15€** (30 min)\n• Higiene Facial — **35€** (45 min)\n\nLos precios completos los tienes en la sección de reservas. ¿Quieres saber más de algún tratamiento?`,
    quickReplies: ['¿Qué incluye la Manicura DBonita?', '¿Cuánto dura el lifting?', 'Quiero reservar cita'],
  },
  {
    keywords: ['manicura', 'uñas', 'unas', 'esmalte', 'semipermanente', 'dbonita', 'renaissance', 'extension'],
    response: `Tenemos varios tipos de manicura:\n\n• **Manicura clásica** — 15€ (30 min)\n• **Manicura DBonita** ⭐ — 25€ (60 min) — Semipermanente con nivelación, nuestra favorita\n• **Manicura Renaissance** — 25€ (60 min)\n• **Manicura Renaissance Semi** — 35€ (90 min)\n• **Retirado + Manicura** — 10€ (40 min)\n• **Extensión con Soft Gel** — Desde 45€ (90 min)\n• **Extensión con Gel** — Desde 45€ (90 min)\n\nLa **Manicura DBonita** es la más pedida. ¿Te animas?`,
    quickReplies: ['¿Qué es la Manicura DBonita?', '¿Cuánto duran las uñas semipermanentes?', 'Quiero reservar Manicura DBonita'],
  },
  {
    keywords: ['lifting', 'pestana', 'pestañas', 'pestanas', 'rizar', 'curvar', 'lifting coreano'],
    response: `El **Lifting Coreano de Pestañas** es uno de nuestros tratamientos estrella:\n\n• **Precio**: 45€\n• **Duración**: 90 min\n• **Resultado**: hasta 8 semanas\n• Riza y levanta tus pestañas naturales desde la raíz\n• Ojos más abiertos y expresivos sin necesidad de máscara\n\nEs completamente seguro para las pestañas naturales. ¡A nuestras clientas les encanta!`,
    quickReplies: ['¿El lifting daña las pestañas?', '¿Puedo combinarlo con laminado de cejas?', 'Quiero reservar lifting'],
  },
  {
    keywords: ['ceja', 'cejas', 'laminado', 'tinte', 'depilar'],
    response: `Para cejas y pestañas tenemos:\n\n• **Laminado de Cejas** — 40€ (60 min)\n  Cejas perfectas, voluminosas y definidas sin maquillaje\n\n• **Tinte de Cejas** — 10€\n• **Tinte de Pestañas** — 10€\n• **Cejas con Cera** — 10€\n• **Cejas con Hilo** — 15€\n\nEl laminado de cejas combinado con el lifting de pestañas es un combo espectacular. ¡Te lo recomendamos!`,
    quickReplies: ['¿Cuánto cuesta lifting + laminado?', 'Quiero reservar laminado de cejas', '¿Qué es el laminado de cejas?'],
  },
  {
    keywords: ['facial', 'faciales', 'cara', 'piel', 'limpieza', 'higiene', 'radiofrecuencia', 'detox', 'vitamina', 'glow', 'skin', 'balance'],
    response: `Nuestros tratamientos faciales:\n\n• **Higiene Facial** — 35€ (45 min)\n• **Radiofrecuencia** — 49€ (45 min)\n• **Detox Facial** — 39€ (70 min)\n• **Vitamina C** — 59€ (70 min)\n• **Glow Skin Therapy** ⭐ — 59€ (90 min)\n• **Skin Balance Therapy** — 59€ (90 min)\n\nSi buscas luminosidad, te recomendamos el **Glow Skin Therapy**. Si tu piel es sensible, el **Skin Balance** es ideal. ¿Qué necesitas?`,
    quickReplies: ['¿Qué tratamiento facial me recomiendas?', '¿Qué es el Glow Skin?', 'Quiero reservar un facial'],
  },
  {
    keywords: ['pedicura', 'pie', 'pies'],
    response: `Para los pies:\n\n• **Pedicura Renaissance** — 25€ (45 min)\n• **Pedicura Renaissance Semi** — 35€ (60 min)\n\nAmbas incluyen lima, cutículas y esmaltado. La versión Semi incluye esmalte semipermanente de larga duración.`,
    quickReplies: ['¿Cuánto cuesta la pedicura?', 'Quiero reservar pedicura'],
  },
  {
    keywords: ['corporal', 'corporales', 'madera', 'maderoterapia', 'drenaje', 'linfatico', 'masaje'],
    response: `Tratamientos corporales:\n\n• **Maderoterapia** — Desde 55€ (90 min)\n  Masaje con instrumentos de madera para moldear y tonificar\n\n• **Drenaje Linfático** — Desde 45€ (90 min)\n  Masaje suave que reduce retención de líquidos y mejora la circulación`,
    quickReplies: ['¿Qué es la maderoterapia?', 'Quiero reservar maderoterapia'],
  },
  {
    keywords: ['recomienda', 'recomiend', 'aconseja', 'mejor', 'cual elegir', 'que me pongo', 'no se que', 'primer', 'primera vez', 'novata', 'principiante'],
    response: `¡Te ayudo a elegir! Cuéntame qué buscas:\n\n💅 **Si es tu primera vez**: La **Manicura DBonita** (25€) es perfecta para empezar.\n\n👁️ **Si quieres destacar la mirada**: El **Lifting de Pestañas** (45€) cambia la cara.\n\n✨ **Si quieres un regalo para ti**: El combo **Lifting + Laminado de Cejas** es espectacular.\n\n💆 **Si necesitas desconectar**: El **Glow Skin Therapy** (59€) te dejará la piel radiante.\n\n¿Qué te llama más la atención?`,
    quickReplies: ['Manicura DBonita', 'Lifting de pestañas', 'Glow Skin Therapy', '¿Puedo combinar tratamientos?'],
  },
  {
    keywords: ['combinar', 'juntos', 'a la vez', 'dos', 'varios', 'combo', 'paquete'],
    response: `¡Por supuesto! Puedes combinar varios servicios en una misma cita. Algunos combos populares:\n\n⭐ **Lifting de Pestañas + Laminado de Cejas** — 85€ (150 min)\n⭐ **Manicura DBonita + Lifting de Pestañas** — 70€ (150 min)\n⭐ **Manicura DBonita + Pedicura Renaissance** — 50€ (105 min)\n\nLa duración total se calcula automáticamente al reservar. Solo tienes que seleccionar los servicios que quieras en el sistema de reservas.`,
    quickReplies: ['Quiero reservar un combo', '¿Cómo reservo varios servicios?'],
  },
  {
    keywords: ['reservar', 'reserva', 'cita', 'turno', 'horario', 'hora', 'agendar', 'appointment', 'booking'],
    response: `Reservar tu cita es muy fácil:\n\n1️⃣ Ve a la sección **"Reserva tu cita"** en la web\n2️⃣ Selecciona los servicios que quieras\n3️⃣ Elige la fecha y hora disponibles\n4️⃣ Rellena tus datos y confirma\n\nSe requiere una **señal de 10€** para confirmar. La cancelación es gratuita hasta 24h antes.\n\n¿Quieres que te lleve directo a la reserva?`,
    quickReplies: ['Ir a reservar', '¿Cuánto cuesta la señal?', '¿Puedo cancelar?'],
  },
  {
    keywords: ['horario', 'horarios', 'cuando', 'que dias', 'abri', 'abierto', 'atendeis', 'horario de apertura', 'apertura'],
    response: `Nuestro horario es:\n\n📅 **Lunes a viernes**: 10:00 – 14:00 y 16:00 – 20:00\n📅 **Sábados**: 10:00 – 14:00\n📅 **Domingos**: Cerrado\n\nPuedes reservar tu cita directamente desde la web en cualquier momento.`,
    quickReplies: ['Quiero reservar cita', '¿Dónde estáis ubicados?'],
  },
  {
    keywords: ['cancelar', 'cancelacion', 'anular', 'devolucion', 'reembolso', 'señal', 'deposito', 'dinero'],
    response: `Política de cancelación:\n\n✅ **Cancelación gratuita** hasta 24 horas antes de la cita\n❌ **Menos de 24h**: la señal de 10€ no es reembolsable\n\nPara cancelar, usa el enlace que recibes en tu email de confirmación.\n\nSi tienes un imprevisto, llámanos directamente.`,
    quickReplies: ['¿Cuánto es la señal?', 'Necesito cancelar mi cita', 'Quiero reservar'],
  },
  {
    keywords: ['duracion', 'cuanto dura', 'cuanto tiempo', 'tardo', 'tiempo'],
    response: `La duración depende del tratamiento:\n\n• Manicura — 30-90 min\n• Lifting de Pestañas — 90 min\n• Laminado de Cejas — 60 min\n• Faciales — 45-90 min\n• Pedicura — 45-60 min\n• Maderoterapia — 90 min\n\nSi combinas servicios, se suman las duraciones. El sistema calcula automáticamente el tiempo total al reservar.`,
    quickReplies: ['¿Puedo combinar tratamientos?', 'Quiero reservar'],
  },
  {
    keywords: ['donde', 'ubicacion', 'direccion', 'lugar', 'sitio', 'denia', 'javea', 'xabia', 'oliva', 'como llegar'],
    response: `Estamos en **Dénia** (Alicante). Puedes contactarnos por:\n\n📱 **WhatsApp** para cualquier consulta rápida\n📧 **Email** para consultas más detalladas\n\n¡Te esperamos!`,
    quickReplies: ['Quiero reservar cita', '¿Cuáles son los precios?'],
  },
  {
    keywords: ['semipermanente', 'dura', 'cuanto tiempo dura', 'se mantiene', 'resiste'],
    response: `El esmalte semipermanente dura entre **2 y 3 semanas** dependiendo del cuidado y del tipo de uña. Para prolongar su duración:\n\n• Aplica aceite de cutículas a diario\n• Protege las manos con guantes al limpiar\n• Evita usar las uñas como herramienta\n\nEl **Lifting de Pestañas** dura hasta **8 semanas**, y el **Laminado de Cejas** sobre **4-6 semanas**.`,
    quickReplies: ['Quiero reservar uñas semipermanentes', 'Cuidados después del lifting'],
  },
  {
    keywords: ['duelo', 'daño', 'danha', 'rompe', 'seguro', 'dañar', 'estraga'],
    response: `Todos nuestros tratamientos son seguros cuando se realizan con productos profesionales:\n\n• El **Lifting de Pestañas** no daña las pestañas naturales — suaviza el pelo sin romperlo\n• La **Manicura DBonita** con nivelación protege la uña natural\n• Usamos formulaciones **cruelty-free** y **veganas** cuando es posible\n\nSi tienes alergias o sensibilidad, consúltanos antes de tu cita.`,
    quickReplies: ['Quiero reservar cita', '¿Qué productos usáis?'],
  },
  {
    keywords: ['primera', 'primera vez', 'nunca', 'novata', 'estrenar', 'no he ido'],
    response: `¡Bienvenida! Para tu primera visita te recomendamos:\n\n⭐ **Manicura DBonita** (25€) — si te gustan las uñas bonitas\n⭐ **Lifting de Pestañas** (45€) — si quieres destacar la mirada\n⭐ **Higiene Facial** (35€) — si quieres probar un facial\n\nNo hace falta llegar con las uñas limpias — nosotras nos encargamos de todo. ¡Te van a encantar los resultados!`,
    quickReplies: ['Quiero reservar Manicura DBonita', 'Quiero reservar Lifting', '¿Cuánto cuesta?'],
  },
  {
    keywords: ['producto', 'productos', 'marca', 'marcas', 'cruelty', 'vegano', 'vegan'],
    response: `Trabajamos principalmente con formulaciones **cruelty-free** y **veganas** cuando es posible. Si tienes alguna alergia o sensibilidad específica, consúltanos antes de tu cita para asegurarnos de usar los productos más adecuados para ti.`,
    quickReplies: ['Quiero reservar cita', '¿Son seguros los tratamientos?'],
  },
  {
    keywords: ['whatsapp', 'telefono', 'llamar', 'contacto', 'contactar', 'hablar', 'persona'],
    response: `Puedes contactarnos por **WhatsApp** para cualquier consulta. Te responderemos lo antes posible.\n\nTambién puedes reservar directamente desde esta web — es rápido y seguro.`,
    quickReplies: ['Ir a reservar', '¿Cuáles son los precios?'],
  },
]

const FALLBACK_RESPONSE: ChatResponse = {
  text: 'No estoy segura de entender tu pregunta. ¿Puedo ayudarte con algo de esto?',
  quickReplies: ['¿Qué servicios ofrecéis?', '¿Cuáles son los precios?', '¿Cómo reservo cita?', 'Hablar por WhatsApp'],
  showWhatsApp: true,
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,;:]/g, '')
    .trim()
}

function scoreEntry(entry: KnowledgeEntry, input: string): number {
  const normalizedInput = normalize(input)
  const words = normalizedInput.split(/\s+/)
  let score = 0

  for (const keyword of entry.keywords) {
    const normalizedKw = normalize(keyword)
    if (normalizedInput.includes(normalizedKw)) {
      score += normalizedKw.length
    }
    for (const word of words) {
      if (word.length > 2 && normalizedKw.includes(word)) {
        score += word.length * 0.5
      }
    }
  }

  return score
}

export function getChatResponse(input: string): ChatResponse {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      text: '¡Escríbeme tu pregunta y te ayudo! 😊',
      quickReplies: ['¿Qué servicios ofrecéis?', '¿Cuáles son los precios?', '¿Cómo reservo cita?'],
    }
  }

  let bestScore = 0
  let bestEntry: KnowledgeEntry | null = null

  for (const entry of KNOWLEDGE) {
    const score = scoreEntry(entry, trimmed)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  if (bestEntry && bestScore >= 2) {
    return {
      text: bestEntry.response,
      quickReplies: bestEntry.quickReplies,
    }
  }

  const specificService = findServiceMention(trimmed)
  if (specificService) {
    return {
      text: formatServiceResponse(specificService),
      quickReplies: ['¿Cuánto cuesta?', 'Quiero reservar', 'Ver todos los servicios'],
    }
  }

  return FALLBACK_RESPONSE
}

function findServiceMention(input: string): string | null {
  const normalized = normalize(input)
  for (const s of SERVICIOS) {
    const nameNorm = normalize(s.nombre)
    if (normalized.includes(nameNorm) || normalized.includes(s.id)) {
      return s.id
    }
  }

  const catKeywords: Record<string, string[]> = {
    manicura: ['manicura', 'uñas', 'unas', 'esmalte'],
    extension: ['extension', 'extensiones', 'soft gel', 'gel'],
    pedicura: ['pedicura', 'pies', 'pie'],
    'cejas-pestanas': ['lifting', 'pestana', 'pestanas', 'ceja', 'cejas', 'laminado'],
    faciales: ['facial', 'faciales', 'cara', 'piel', 'radiofrecuencia', 'detox', 'vitamina', 'glow', 'balance'],
    corporales: ['corporal', 'madera', 'maderoterapia', 'drenaje', 'linfatico', 'masaje'],
  }

  for (const [catId, keywords] of Object.entries(catKeywords)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        const cat = CATEGORIAS_SERVICIOS.find((c) => c.id === catId)
        if (cat) return cat.items[0]?.nombre ?? null
      }
    }
  }

  return null
}

function formatServiceResponse(serviceIdOrName: string): string {
  const service = SERVICIOS.find(
    (s) => s.id === serviceIdOrName || normalize(s.nombre) === normalize(serviceIdOrName)
  )
  if (!service) return FALLBACK_RESPONSE.text

  const parts = [
    '**' + service.nombre + '**',
    '',
    '\uD83D\uDCB0 Precio: ' + service.precio,
    '\u23F1\uFE0F Duraci\u00F3n: ' + service.duracion,
    '',
    service.descripcion,
    '',
    '\u00BFQuieres reservar tu cita?',
  ]
  return parts.join('\n')
}

export const INITIAL_MESSAGE: ChatResponse = {
  text: '¡Hola! 👋 Soy el asistente de D Bonita. ¿En qué puedo ayudarte?\n\nPuedo informarte sobre servicios, precios, horarios o ayudarte a elegir el tratamiento perfecto.',
  quickReplies: ['¿Qué servicios ofrecéis?', '¿Cuáles son los precios?', 'Recomiéndame un tratamiento', '¿Cómo reservo cita?'],
}

export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'}`