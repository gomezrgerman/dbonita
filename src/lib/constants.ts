// ============================================================
// CONSTANTES DEL SITIO — D Bonita
// ============================================================

export const SITE_NAME = 'D Bonita'

export const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Sobre mí', href: '#sobre-mi' },
  { label: 'Reservar', href: '#reservar' },
]

// ============================================================
// SERVICIOS — Lista completa por categorías (menú de precios)
// ============================================================

export interface ServicioItem {
  nombre: string
  precio: string
  duracion?: string
  nota?: string
}

export interface CategoriaServicio {
  id: string
  nombre: string
  items: ServicioItem[]
}

export const CATEGORIAS_SERVICIOS: CategoriaServicio[] = [
  {
    id: 'manicura',
    nombre: 'Manicura',
    items: [
      { nombre: 'Manicura', precio: '15€', duracion: '30 min' },
      { nombre: 'Manicura DBonita', precio: '25€', duracion: '60 min', nota: 'Semipermanente con nivelación' },
      { nombre: 'Manicura Renaissance', precio: '25€', duracion: '60 min' },
      { nombre: 'Manicura Renaissance Semi', precio: '35€', duracion: '90 min' },
      { nombre: 'Retirado + Manicura', precio: '10€', duracion: '40 min' },
    ],
  },
  {
    id: 'extension',
    nombre: 'Extensión de Uñas',
    items: [
      { nombre: 'Extensión con Soft Gel', precio: 'Desde 45€', duracion: '90 min' },
      { nombre: 'Extensión con Gel', precio: 'Desde 45€', duracion: '90 min' },
    ],
  },
  {
    id: 'pedicura',
    nombre: 'Pedicura',
    items: [
      { nombre: 'Pedicura Renaissance', precio: '25€', duracion: '45 min' },
      { nombre: 'Pedicura Renaissance Semi', precio: '35€', duracion: '60 min' },
    ],
  },
  {
    id: 'extras',
    nombre: 'Extras',
    items: [
      { nombre: 'Francesa', precio: '5€' },
      { nombre: 'Decoración básica', precio: '3€' },
      { nombre: 'Decoración elaborada', precio: 'A consultar' },
    ],
  },
  {
    id: 'depilaciones',
    nombre: 'Depilaciones',
    items: [
      { nombre: 'Ingles cera', precio: 'Desde 15€' },
      { nombre: 'Pierna completa cera', precio: '20€' },
      { nombre: 'Medias piernas cera', precio: '15€' },
      { nombre: 'Axilas cera', precio: '10€' },
      { nombre: 'Cejas cera', precio: '10€' },
      { nombre: 'Bigote cera', precio: '5€' },
      { nombre: 'Cejas hilo', precio: '15€' },
      { nombre: 'Labio superior hilo', precio: '8€' },
    ],
  },
  {
    id: 'cejas-pestanas',
    nombre: 'Cejas y Pestañas',
    items: [
      { nombre: 'Lifting coreano pestañas', precio: '45€', duracion: '90 min' },
      { nombre: 'Laminado de cejas', precio: '40€', duracion: '60 min' },
      { nombre: 'Tinte de cejas', precio: '10€' },
      { nombre: 'Tinte de pestañas', precio: '10€' },
    ],
  },
  {
    id: 'faciales',
    nombre: 'Faciales',
    items: [
      { nombre: 'Higiene facial', precio: '35€', duracion: '45 min' },
      { nombre: 'Radiofrecuencia', precio: '49€', duracion: '45 min' },
      { nombre: 'Detox', precio: '39€', duracion: '70 min' },
      { nombre: 'Vitamina C', precio: '59€', duracion: '70 min' },
      { nombre: 'Glow Skin Therapy', precio: '59€', duracion: '90 min' },
      { nombre: 'Skin Balance Therapy', precio: '59€', duracion: '90 min' },
    ],
  },
  {
    id: 'corporales',
    nombre: 'Corporales',
    items: [
      { nombre: 'Maderoterapia', precio: 'Desde 55€', duracion: '90 min' },
      { nombre: 'Drenaje linfático', precio: 'Desde 45€', duracion: '90 min' },
      { nombre: 'Corporal personalizado', precio: 'A consultar' },
    ],
  },
]

// ============================================================
// SERVICIOS — Reservables online (con duracionMinutos)
// ============================================================

export interface Servicio {
  id: string
  numero: string
  nombre: string
  descripcion: string
  duracion: string
  duracionMinutos: number
  precio: string
  categoriaId: string
}

export const SERVICIOS: Servicio[] = [
  // ── Manicura ─────────────────────────────────────────────
  {
    id: 'manicura',
    numero: '01',
    nombre: 'Manicura',
    descripcion: 'Manicura clásica con esmaltado tradicional. Incluye lima, cutículas y esmaltado.',
    duracion: '30 min',
    duracionMinutos: 30,
    precio: '15€',
    categoriaId: 'manicura',
  },
  {
    id: 'manicura-dbonita',
    numero: '02',
    nombre: 'Manicura DBonita',
    descripcion: 'Manicura semipermanente con nivelación. Larga duración y acabado perfecto.',
    duracion: '60 min',
    duracionMinutos: 60,
    precio: '25€',
    categoriaId: 'manicura',
  },
  {
    id: 'manicura-renaissance',
    numero: '03',
    nombre: 'Manicura Renaissance',
    descripcion: 'Tratamiento completo con productos Renaissance de alta gama.',
    duracion: '60 min',
    duracionMinutos: 60,
    precio: '25€',
    categoriaId: 'manicura',
  },
  {
    id: 'manicura-renaissance-semi',
    numero: '04',
    nombre: 'Manicura Renaissance Semi',
    descripcion: 'Manicura Renaissance con esmalte semipermanente de larga duración.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: '35€',
    categoriaId: 'manicura',
  },
  {
    id: 'retirado-manicura',
    numero: '05',
    nombre: 'Retirado + Manicura',
    descripcion: 'Retirado de esmalte anterior más manicura completa.',
    duracion: '40 min',
    duracionMinutos: 40,
    precio: '10€',
    categoriaId: 'manicura',
  },
  // ── Extensión ─────────────────────────────────────────────
  {
    id: 'extension-soft-gel',
    numero: '06',
    nombre: 'Extensión con Soft Gel',
    descripcion: 'Extensiones con soft gel flexible. Aspecto natural y mayor durabilidad.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: 'Desde 45€',
    categoriaId: 'extension',
  },
  {
    id: 'extension-gel',
    numero: '07',
    nombre: 'Extensión con Gel',
    descripcion: 'Extensiones con gel duro. Personalizables en forma, longitud y diseño.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: 'Desde 45€',
    categoriaId: 'extension',
  },
  // ── Pedicura ──────────────────────────────────────────────
  {
    id: 'pedicura-renaissance',
    numero: '08',
    nombre: 'Pedicura Renaissance',
    descripcion: 'Tratamiento completo para los pies con productos Renaissance.',
    duracion: '45 min',
    duracionMinutos: 45,
    precio: '25€',
    categoriaId: 'pedicura',
  },
  {
    id: 'pedicura-renaissance-semi',
    numero: '09',
    nombre: 'Pedicura Renaissance Semi',
    descripcion: 'Pedicura Renaissance con esmalte semipermanente de larga duración.',
    duracion: '60 min',
    duracionMinutos: 60,
    precio: '35€',
    categoriaId: 'pedicura',
  },
  // ── Extras ────────────────────────────────────────────────
  {
    id: 'francesa',
    numero: '10',
    nombre: 'Francesa',
    descripcion: 'Acabado francés clásico o con variante de color sobre cualquier manicura.',
    duracion: '15 min',
    duracionMinutos: 15,
    precio: '5€',
    categoriaId: 'extras',
  },
  {
    id: 'decoracion-basica',
    numero: '11',
    nombre: 'Decoración básica',
    descripcion: 'Diseño sencillo en una o varias uñas: puntos, líneas, formas geométricas.',
    duracion: '10 min',
    duracionMinutos: 10,
    precio: '3€',
    categoriaId: 'extras',
  },
  {
    id: 'decoracion-elaborada',
    numero: '12',
    nombre: 'Decoración elaborada',
    descripcion: 'Diseño artístico personalizado. Precio según complejidad, consúltanos antes.',
    duracion: '30 min',
    duracionMinutos: 30,
    precio: 'A consultar',
    categoriaId: 'extras',
  },
  // ── Depilaciones ──────────────────────────────────────────
  {
    id: 'ingles-cera',
    numero: '13',
    nombre: 'Ingles cera',
    descripcion: 'Depilación con cera de la zona de las ingles. Resultado limpio y duradero.',
    duracion: '30 min',
    duracionMinutos: 30,
    precio: 'Desde 15€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'pierna-completa-cera',
    numero: '14',
    nombre: 'Pierna completa cera',
    descripcion: 'Depilación con cera de piernas completas. Piel suave y sin vello.',
    duracion: '30 min',
    duracionMinutos: 30,
    precio: '20€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'medias-piernas-cera',
    numero: '15',
    nombre: 'Medias piernas cera',
    descripcion: 'Depilación con cera de la mitad de la pierna.',
    duracion: '20 min',
    duracionMinutos: 20,
    precio: '15€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'axilas-cera',
    numero: '16',
    nombre: 'Axilas cera',
    descripcion: 'Depilación con cera de la zona de las axilas. Rápida y efectiva.',
    duracion: '15 min',
    duracionMinutos: 15,
    precio: '10€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'cejas-cera',
    numero: '17',
    nombre: 'Cejas cera',
    descripcion: 'Depilación y definición de cejas con cera. Diseño personalizado.',
    duracion: '15 min',
    duracionMinutos: 15,
    precio: '10€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'bigote-cera',
    numero: '18',
    nombre: 'Bigote cera',
    descripcion: 'Depilación con cera del labio superior.',
    duracion: '10 min',
    duracionMinutos: 10,
    precio: '5€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'cejas-hilo',
    numero: '19',
    nombre: 'Cejas hilo',
    descripcion: 'Definición de cejas con hilo. Precisión milimétrica para un trazo perfecto.',
    duracion: '20 min',
    duracionMinutos: 20,
    precio: '15€',
    categoriaId: 'depilaciones',
  },
  {
    id: 'labio-hilo',
    numero: '20',
    nombre: 'Labio superior hilo',
    descripcion: 'Depilación con hilo del labio superior. Resultado preciso y duradero.',
    duracion: '10 min',
    duracionMinutos: 10,
    precio: '8€',
    categoriaId: 'depilaciones',
  },
  // ── Cejas y Pestañas ──────────────────────────────────────
  {
    id: 'lifting-pestanas',
    numero: '21',
    nombre: 'Lifting Coreano Pestañas',
    descripcion: 'Riza y levanta tus pestañas naturales. Ojos más abiertos y expresivos. Resultado hasta 8 semanas.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: '45€',
    categoriaId: 'cejas-pestanas',
  },
  {
    id: 'laminado-cejas',
    numero: '22',
    nombre: 'Laminado de Cejas',
    descripcion: 'Cejas voluminosas y definidas sin maquillaje. Efecto saludable y natural.',
    duracion: '60 min',
    duracionMinutos: 60,
    precio: '40€',
    categoriaId: 'cejas-pestanas',
  },
  {
    id: 'tinte-cejas',
    numero: '23',
    nombre: 'Tinte de Cejas',
    descripcion: 'Color y definición para tus cejas. Complemento ideal para el laminado.',
    duracion: '15 min',
    duracionMinutos: 15,
    precio: '10€',
    categoriaId: 'cejas-pestanas',
  },
  {
    id: 'tinte-pestanas',
    numero: '24',
    nombre: 'Tinte de Pestañas',
    descripcion: 'Intensifica el color de tus pestañas. Complemento perfecto para el lifting.',
    duracion: '15 min',
    duracionMinutos: 15,
    precio: '10€',
    categoriaId: 'cejas-pestanas',
  },
  // ── Faciales ──────────────────────────────────────────────
  {
    id: 'higiene-facial',
    numero: '25',
    nombre: 'Higiene Facial',
    descripcion: 'Limpieza profunda adaptada a tu piel. Elimina impurezas, hidrata y aporta luminosidad.',
    duracion: '45 min',
    duracionMinutos: 45,
    precio: '35€',
    categoriaId: 'faciales',
  },
  {
    id: 'radiofrecuencia',
    numero: '26',
    nombre: 'Radiofrecuencia',
    descripcion: 'Tratamiento para reafirmar y rejuvenecer la piel con radiofrecuencia.',
    duracion: '45 min',
    duracionMinutos: 45,
    precio: '49€',
    categoriaId: 'faciales',
  },
  {
    id: 'detox',
    numero: '27',
    nombre: 'Detox Facial',
    descripcion: 'Tratamiento desintoxicante que purifica y revitaliza la piel en profundidad.',
    duracion: '70 min',
    duracionMinutos: 70,
    precio: '39€',
    categoriaId: 'faciales',
  },
  {
    id: 'vitamina-c',
    numero: '28',
    nombre: 'Vitamina C',
    descripcion: 'Vitamina C de alta concentración. Ilumina y unifica el tono de la piel.',
    duracion: '70 min',
    duracionMinutos: 70,
    precio: '59€',
    categoriaId: 'faciales',
  },
  {
    id: 'glow-skin',
    numero: '29',
    nombre: 'Glow Skin Therapy',
    descripcion: 'Terapia facial para un efecto glow luminoso y radiante duradero.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: '59€',
    categoriaId: 'faciales',
  },
  {
    id: 'skin-balance',
    numero: '30',
    nombre: 'Skin Balance Therapy',
    descripcion: 'Terapia equilibrante para pieles mixtas o sensibles. Regula y calma.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: '59€',
    categoriaId: 'faciales',
  },
  // ── Corporales ────────────────────────────────────────────
  {
    id: 'maderoterapia',
    numero: '31',
    nombre: 'Maderoterapia',
    descripcion: 'Masaje corporal con instrumentos de madera para moldear y tonificar el cuerpo.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: 'Desde 55€',
    categoriaId: 'corporales',
  },
  {
    id: 'drenaje-linfatico',
    numero: '32',
    nombre: 'Drenaje Linfático',
    descripcion: 'Masaje que activa el sistema linfático, reduce retención de líquidos y mejora la circulación.',
    duracion: '90 min',
    duracionMinutos: 90,
    precio: 'Desde 45€',
    categoriaId: 'corporales',
  },
  {
    id: 'corporal-personalizado',
    numero: '33',
    nombre: 'Corporal Personalizado',
    descripcion: 'Tratamiento corporal a medida según tus necesidades. Consulta disponibilidad.',
    duracion: '60 min',
    duracionMinutos: 60,
    precio: 'A consultar',
    categoriaId: 'corporales',
  },
]

// ============================================================
// SUGERENCIAS — Venta cruzada por servicio
// ============================================================

export const SUGERENCIAS: Record<string, string[]> = {
  // Manicura → añadir francesa o subir a pedicura (manos+pies)
  'manicura':                  ['francesa', 'decoracion-basica'],
  'manicura-dbonita':          ['francesa', 'pedicura-renaissance'],
  'manicura-renaissance':      ['francesa', 'pedicura-renaissance'],
  'manicura-renaissance-semi': ['francesa', 'decoracion-basica'],
  'retirado-manicura':         ['manicura-dbonita'],
  // Extensiones → diseño encima
  'extension-soft-gel':        ['francesa', 'decoracion-basica', 'decoracion-elaborada'],
  'extension-gel':             ['francesa', 'decoracion-basica', 'decoracion-elaborada'],
  // Pedicura → manos + piernas
  'pedicura-renaissance':      ['manicura-dbonita', 'medias-piernas-cera'],
  'pedicura-renaissance-semi': ['manicura-dbonita', 'medias-piernas-cera'],
  // Extras → combinan entre sí
  'francesa':                  ['decoracion-basica'],
  'decoracion-basica':         ['francesa', 'decoracion-elaborada'],
  'decoracion-elaborada':      ['francesa'],
  // Depilaciones → zonas cercanas en una misma visita
  'ingles-cera':               ['axilas-cera', 'medias-piernas-cera'],
  'pierna-completa-cera':      ['axilas-cera', 'ingles-cera'],
  'medias-piernas-cera':       ['pierna-completa-cera', 'axilas-cera'],
  'axilas-cera':               ['pierna-completa-cera', 'ingles-cera'],
  'cejas-cera':                ['laminado-cejas', 'tinte-cejas'],
  'bigote-cera':               ['cejas-cera', 'labio-hilo'],
  'cejas-hilo':                ['laminado-cejas', 'tinte-cejas'],
  'labio-hilo':                ['cejas-hilo'],
  // Cejas + Pestañas → combos naturales del área
  'lifting-pestanas':          ['tinte-pestanas', 'laminado-cejas'],
  'laminado-cejas':            ['tinte-cejas', 'lifting-pestanas'],
  'tinte-cejas':               ['laminado-cejas', 'tinte-pestanas'],
  'tinte-pestanas':            ['lifting-pestanas', 'tinte-cejas'],
  // Faciales → potenciar resultado en la misma sesión
  'higiene-facial':            ['vitamina-c', 'tinte-cejas'],
  'radiofrecuencia':           ['vitamina-c', 'higiene-facial'],
  'detox':                     ['glow-skin', 'vitamina-c'],
  'vitamina-c':                ['glow-skin', 'radiofrecuencia'],
  'glow-skin':                 ['radiofrecuencia', 'vitamina-c'],
  'skin-balance':              ['higiene-facial', 'detox'],
  // Corporales → sesión completa
  'maderoterapia':             ['drenaje-linfatico'],
  'drenaje-linfatico':         ['maderoterapia'],
  'corporal-personalizado':    ['drenaje-linfatico', 'maderoterapia'],
}

// Mensaje personalizado que aparece en el modal de venta cruzada,
// basado en el primer servicio que ha añadido la clienta al carrito.
export const MENSAJES_CRUZADA: Partial<Record<string, string>> = {
  'manicura':                  'Tu manicura quedaría genial con una francesa — un toque clásico que nunca falla.',
  'manicura-dbonita':          'La Manicura DBonita queda perfecta con una francesa. Solo 5€ más y el resultado es de revista.',
  'manicura-renaissance':      'Un acabado francés elevaría tu Renaissance a otro nivel. Un pequeño detalle que lo cambia todo.',
  'manicura-renaissance-semi': 'Añade una decoración básica y convierte tu Renaissance en algo verdaderamente especial.',
  'retirado-manicura':         'Ya que estás, la Manicura DBonita es el siguiente paso natural — semipermanente y de larga duración.',
  'extension-soft-gel':        'Una francesa sobre tus extensiones de soft gel es una combinación imbatible. 5€ por un acabado de lujo.',
  'extension-gel':             'Añade una francesa o decoración y convierte tus extensiones en algo realmente especial.',
  'pedicura-renaissance':      'Mientras cuidas los pies, ¿qué tal también las manos? La Manicura DBonita es el complemento perfecto.',
  'pedicura-renaissance-semi': 'Pies y manos perfectas en una sola visita. La Manicura DBonita completa el look.',
  'lifting-pestanas':          'El tinte de pestañas y el lifting coreano son el combo estrella del estudio. Juntos potencian el efecto al máximo.',
  'laminado-cejas':            'El tinte de cejas es imprescindible junto al laminado — el resultado dura el doble visualmente.',
  'tinte-cejas':               'Si te tines las cejas, el laminado las deja perfectas todo el día. Es el upgrade que todas repiten.',
  'tinte-pestanas':            'El lifting coreano hace que el tinte dure mucho más y el efecto sea espectacular.',
  'pierna-completa-cera':      'Mientras estás aquí, las axilas se hacen en 15 minutos — una visita y todo listo.',
  'medias-piernas-cera':       'Por poco más puedes hacer la pierna completa hoy y olvidarte durante semanas.',
  'axilas-cera':               'Combina con pierna completa y aprovechas la visita al máximo. Piel perfecta de una sola vez.',
  'ingles-cera':               'Aprovecha y añade axilas — 15 minutos más y sales con todo hecho.',
  'cejas-cera':                'El laminado de cejas después de la cera las define aún más. Es uno de los combos más pedidos.',
  'cejas-hilo':                'El laminado de cejas complementa el hilo a la perfección — cejas definidas todo el día.',
  'higiene-facial':            'La vitamina C potencia el resultado de tu higiene y añade esa luminosidad extra que se nota.',
  'radiofrecuencia':           'La vitamina C junto a la radiofrecuencia multiplica el efecto. El dúo antiedad favorito del estudio.',
  'detox':                     'El Glow Skin después del detox es la combinación perfecta para una piel visiblemente radiante.',
  'vitamina-c':                'El Glow Skin Therapy combina de maravilla con la vitamina C para un efecto luminoso que dura.',
  'maderoterapia':             'El drenaje linfático junto a la maderoterapia potencia el resultado de modelado notablemente.',
  'drenaje-linfatico':         'La maderoterapia complementa el drenaje y ayuda a definir el contorno corporal desde la primera sesión.',
}

// ============================================================
// GALERÍA
// ============================================================

export interface GaleriaItem {
  id: string
  src: string
  alt: string
  tratamiento: string
}

export const GALERIA_ITEMS: GaleriaItem[] = [
  { id: 'g1',  src: '/img/nail-art-flores.png',   alt: 'Nail art con diseño floral sobre uñas nude, exterior',      tratamiento: 'Nail Art' },
  { id: 'g2',  src: '/img/manicura-nude.png',      alt: 'Manicura semipermanente en tono nude natural',              tratamiento: 'Manicura Semipermanente' },
  { id: 'g3',  src: '/img/nail-art-rojo.png',      alt: 'Nail art en rojo con rayas, sosteniendo un café',           tratamiento: 'Nail Art' },
  { id: 'g4',  src: '/img/lifting-pestanas.png',   alt: 'Resultado de lifting de pestañas, vista closeup',           tratamiento: 'Lifting de Pestañas' },
  { id: 'g5',  src: '/img/nail-art-cherry.png',    alt: 'Cherry Nails — diseños en rojo cereza',                     tratamiento: 'Nail Art' },
  { id: 'g6',  src: '/img/nail-art-cocoa.png',     alt: 'Cocoa Nails — diseños en tonos chocolate',                  tratamiento: 'Nail Art' },
  { id: 'g7',  src: '/img/nail-art-aura.png',      alt: 'Aura Nails — degradado azul y morado',                      tratamiento: 'Nail Art' },
  { id: 'g8',  src: '/img/nail-art-french.png',    alt: 'French Nails — francesa clásica y variantes',               tratamiento: 'Manicura Semipermanente' },
  { id: 'g9',  src: '/img/semi-refuerzo.png',      alt: 'Semipermanente con refuerzo y decoración a mano alzada',    tratamiento: 'Manicura Semipermanente' },
  { id: 'g10', src: '/img/dual-system.png',        alt: 'Dual System — francesa y cat eye con decoración',           tratamiento: 'Extensión de Uñas' },
  { id: 'g11', src: '/img/extension-natural.png',  alt: 'Extensión de uñas acabado natural',                         tratamiento: 'Extensión de Uñas' },
  { id: 'g12', src: '/img/manicura-oscura.png',    alt: 'Manicura semipermanente en tono chocolate oscuro',          tratamiento: 'Manicura Semipermanente' },
]

// ============================================================
// TESTIMONIOS
// ============================================================

export interface Testimonio {
  id: string
  nombre: string
  ciudad: string
  resena: string
  estrellas: number
  tratamiento: string
}

export const TESTIMONIOS: Testimonio[] = [
  {
    id: 't1',
    nombre: 'Carlotta Von Restorff',
    ciudad: 'Dénia',
    resena: 'Ir a hacerse las uñas a D Bonita es, además de disfrutar de un servicio creativo y profesional, una terapia personal. El buen ambiente que hay siempre, la amabilidad de Diana y Valeria, las risas, las conversaciones y la buena energía que se respira en el local son sin duda de diez.',
    estrellas: 5,
    tratamiento: 'Manicura',
  },
  {
    id: 't2',
    nombre: 'Magalí Torre',
    ciudad: 'Dénia',
    resena: 'Llevo casi un año haciéndome las uñas con Diana y Valeria y son las mejores sin duda. En mi día a día uso mucho las manos y nunca se me han caído o roto. Un servicio de 10.',
    estrellas: 5,
    tratamiento: 'Manicura',
  },
  {
    id: 't3',
    nombre: 'Alba Lozano',
    ciudad: 'Dénia',
    resena: 'Son increíbles haciendo las uñas. Desde el primer momento fueron súper amables y profesionales, cuidando cada detalle para que el resultado fuera perfecto. El ambiente es muy guay y se nota que aman lo que hacen.',
    estrellas: 5,
    tratamiento: 'Uñas',
  },
  {
    id: 't4',
    nombre: 'Estela Pérez',
    ciudad: 'Dénia',
    resena: 'Trato muy agradable, materiales resistentes y resultados increíbles. Diana y Valeria son muy atentas y profesionales. Totalmente recomendable.',
    estrellas: 5,
    tratamiento: 'Manicura',
  },
  {
    id: 't5',
    nombre: 'Llanos Ygarza',
    ciudad: 'Dénia',
    resena: 'Siempre estoy en buenas manos. Me dejan las manos y los pies bellísimos. Un trato excelente y resultados que duran. Mi centro de confianza en Dénia.',
    estrellas: 5,
    tratamiento: 'Manicura & Pedicura',
  },
]

// ============================================================
// PREGUNTAS FRECUENTES
// ============================================================

export interface PreguntaFAQ {
  id: string
  pregunta: string
  respuesta: string
}

export const PREGUNTAS_FAQ: PreguntaFAQ[] = [
  {
    id: 'faq1',
    pregunta: '¿Cuánto dura el esmalte semipermanente?',
    respuesta: 'El esmalte semipermanente tiene una duración de entre 2 y 3 semanas dependiendo del cuidado y del tipo de uña. Para prolongar su duración, te recomendamos aplicar aceite de cutículas a diario y proteger las manos con guantes al limpiar.',
  },
  {
    id: 'faq2',
    pregunta: '¿El lifting de pestañas daña las pestañas naturales?',
    respuesta: 'No, el lifting de pestañas es un tratamiento completamente seguro para las pestañas naturales cuando se realiza correctamente con productos profesionales. El proceso suaviza el pelo sin romperlo y el efecto dura entre 6 y 8 semanas.',
  },
  {
    id: 'faq3',
    pregunta: '¿Cómo puedo reservar mi cita?',
    respuesta: 'Puedes reservar directamente a través de nuestro sistema de reservas online en esta misma página. Solo tienes que elegir el servicio, la fecha y hora disponible, y recibirás una confirmación de forma inmediata. También puedes contactarnos por WhatsApp.',
  },
  {
    id: 'faq4',
    pregunta: '¿Tengo que llegar con las uñas limpias?',
    respuesta: 'Te pedimos que llegues sin esmalte en las uñas para aprovechar al máximo el tiempo de tu cita. Si tienes esmalte semipermanente de otro centro, avísanos al reservar y podemos incluir el tiempo de retirada en tu sesión.',
  },
  {
    id: 'faq5',
    pregunta: '¿Con cuánta antelación debo cancelar una cita?',
    respuesta: 'Te pedimos que canceles o modifiques tu cita con al menos 24 horas de antelación. Las cancelaciones de última hora dificultan que otras clientas puedan aprovechar ese hueco. Puedes cancelar desde el mismo enlace que recibes en tu email de confirmación.',
  },
  {
    id: 'faq6',
    pregunta: '¿Usáis productos veganos y libres de crueldad animal?',
    respuesta: 'Sí, trabajamos principalmente con marcas que priorizan formulaciones veganas y cruelty-free. Si tienes alguna alergia o sensibilidad específica, consúltanos antes de tu cita para asegurarnos de usar los productos más adecuados para ti.',
  },
]

// ============================================================
// TRATAMIENTOS DESTACADOS — Sticky Cards (escritorio)
// ============================================================

export interface TratamientoDestacado {
  id: string
  numero: string
  nombre: string
  descripcion: string
  duracion: string
  precio: string
  color: string
  bg: string
  imagen: string
}

export const TRATAMIENTOS_DESTACADOS: TratamientoDestacado[] = [
  {
    id: 'td-1',
    numero: '01',
    nombre: 'Manicura DBonita',
    descripcion: 'Semipermanente con nivelación. La favorita de nuestras clientas.',
    duracion: '60 min',
    precio: '25€',
    color: '#fc7981',
    bg: '#fff0f1',
    imagen: '/img/manicura-nude.png',
  },
  {
    id: 'td-2',
    numero: '02',
    nombre: 'Lifting Coreano Pestañas',
    descripcion: 'Riza y levanta tus pestañas naturales. Resultado hasta 8 semanas.',
    duracion: '90 min',
    precio: '45€',
    color: '#43089f',
    bg: '#f5f0ff',
    imagen: '/img/lifting-pestanas.png',
  },
  {
    id: 'td-3',
    numero: '03',
    nombre: 'Laminado de Cejas',
    descripcion: 'Cejas perfectas, voluminosas y definidas sin maquillaje.',
    duracion: '60 min',
    precio: '40€',
    color: '#078a52',
    bg: '#f0fdf4',
    imagen: '/img/nail-art-french.png',
  },
  {
    id: 'td-4',
    numero: '04',
    nombre: 'Glow Skin Therapy',
    descripcion: 'Tratamiento facial para una piel luminosa y radiante duradera.',
    duracion: '90 min',
    precio: '59€',
    color: '#d08a11',
    bg: '#fffbeb',
    imagen: '/img/nail-art-aura.png',
  },
]

// ============================================================
// STATS
// ============================================================

export const STATS = [
  { valor: '500+', etiqueta: 'Clientas felices' },
  { valor: '100%', etiqueta: 'Resultados naturales' },
  { valor: '5+',   etiqueta: 'Años de experiencia' },
  { valor: '5.0',  etiqueta: 'Valoración Google' },
]

// ============================================================
// TICKER
// ============================================================

export const TICKER_ITEMS = [
  '✦ Uñas',
  '✦ Lifting de Pestañas',
  '✦ Manicura',
  '✦ Pedicura',
  '✦ Nail Art',
  '✦ Laminado de Cejas',
  '✦ D Bonita',
]
