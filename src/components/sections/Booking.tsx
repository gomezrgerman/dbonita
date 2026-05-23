'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle, ArrowLeft,
  ArrowRight, Plus, Minus, X, Sparkles, ShoppingCart, AlertCircle, CreditCard,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  SERVICIOS, CATEGORIAS_SERVICIOS, SUGERENCIAS, MENSAJES_CRUZADA,
  type Servicio,
} from '@/lib/constants'
import { useLang } from '@/lib/i18n'
import { NUM_PERSONAL } from '@/lib/constants'
import { createBookingAsync, getHorasOcupadasByFechaAsync, getSlotsBloqueadosAsync } from '@/lib/supabase-store'
import { enviarConfirmacion, enviarNotificacionNegocio } from '@/lib/email'
import type { Booking as BookingType } from '@/lib/types'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const HORARIO = [
  { apertura: 10 * 60, cierre: 19 * 60 },
]
const DIAS_CERRADO = [0, 6]

function toFechaStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function generarSlots(duracionMin: number): string[] {
  const slots: string[] = []
  for (const { apertura, cierre } of HORARIO) {
    let cursor = apertura
    while (cursor + duracionMin <= cierre) {
      const h = Math.floor(cursor / 60).toString().padStart(2, '0')
      const m = (cursor % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
      cursor += duracionMin
    }
  }
  return slots
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getDiasDelMes(year: number, month: number): (number | null)[] {
  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const offset = (primerDia.getDay() + 6) % 7
  const dias: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(d)
  while (dias.length % 7 !== 0) dias.push(null)
  return dias
}

function esPasado(y: number, m: number, d: number) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return new Date(y, m, d) < hoy
}

function esCerrado(y: number, m: number, d: number) {
  return DIAS_CERRADO.includes(new Date(y, m, d).getDay())
}

function formatDuracion(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function parsePrecio(precio: string): number {
  const num = parseFloat(precio.replace(/[^0-9.,]/g, '').replace(',', '.'))
  return isNaN(num) ? 0 : num
}

type Paso = 'servicios' | 'calendario' | 'datos' | 'pago' | 'confirmado'

interface FormData {
  nombre: string
  telefono: string
  email: string
  notas: string
}

const PASO_KEYS = ['servicios', 'calendario', 'datos', 'pago']

function StepIndicator({ paso, steps }: { paso: Paso; steps: string[] }) {
  const orden = ['servicios', 'calendario', 'datos', 'pago', 'confirmado']
  const actual = orden.indexOf(paso)
  return (
    <div className="flex items-center gap-0 mb-10 lg:mb-12" role="list" aria-label="Pasos del proceso de reserva">
      {PASO_KEYS.map((key, i) => {
        const completado = i < actual
        const enCurso = i === actual
        return (
          <div key={key} className="flex items-center" role="listitem">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-card flex items-center justify-center text-xs font-sans transition-colors duration-300"
                style={{
                  fontWeight: 700,
                  background: completado ? '#000' : enCurso ? 'var(--color-pomegranate)' : 'var(--color-accent)',
                  color: completado || enCurso ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: enCurso ? 'var(--shadow-clay)' : 'none',
                }}
                aria-current={enCurso ? 'step' : undefined}
              >
                {completado ? '✓' : i + 1}
              </div>
              <span
                className="label-upper hidden sm:block"
                style={{ color: enCurso ? '#000' : completado ? 'var(--color-text-muted)' : 'var(--color-accent)' }}
              >
                {steps[i]}
              </span>
            </div>
            {i < PASO_KEYS.length - 1 && (
              <div
                className="h-px w-10 sm:w-16 mx-1 mb-5 transition-colors duration-300"
                style={{ background: i < actual ? '#000' : 'var(--color-accent)' }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── PagoForm — debe estar dentro de <Elements> para usar useStripe/useElements ──

interface PagoFormProps {
  form: FormData
  carrito: string[]
  fechaStr: string
  horaSeleccionada: string
  duracionTotal: number
  clientSecret: string
  onExito: (booking: BookingType) => void
  tPayment: { paying: string; payBtn: string; errorPayment: string; errorSave: string }
}

function PagoForm({ form, carrito, fechaStr, horaSeleccionada, duracionTotal, clientSecret, onExito, tPayment }: PagoFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [pagando, setPagando] = useState(false)
  const [errorPago, setErrorPago] = useState<string | null>(null)
  const [elementoCompleto, setElementoCompleto] = useState(false)

  const pagar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPagando(true)
    setErrorPago(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined' ? window.location.origin : '',
        payment_method_data: {
          billing_details: {
            name: form.nombre,
            email: form.email || undefined,
            phone: form.telefono || undefined,
          },
        },
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorPago(error.message ?? tPayment.errorPayment)
      setPagando(false)
      return
    }

    // Extraemos el paymentIntentId del clientSecret (formato: pi_xxx_secret_xxx)
    const paymentIntentId = clientSecret.split('_secret_')[0]

    // Pago confirmado — crear reserva en Supabase (vía rápida para el usuario)
    // El webhook de Stripe actúa como red de seguridad si esto falla
    try {
      const booking = await createBookingAsync({
        clienteNombre: form.nombre,
        clienteEmail: form.email,
        clienteTelefono: form.telefono,
        servicios: carrito,
        duracionMinutos: duracionTotal,
        fecha: fechaStr,
        hora: horaSeleccionada,
        notas: form.notas,
        importePagado: 10,
        pagado: true,
        estado: 'confirmada',
        stripePaymentIntentId: paymentIntentId,
      })
      onExito(booking)
    } catch {
      setErrorPago(tPayment.errorSave)
      setPagando(false)
    }
  }

  return (
    <form onSubmit={pagar} className="flex flex-col gap-5">
      <PaymentElement
        options={{ layout: 'tabs' }}
        onChange={(e) => setElementoCompleto(e.complete)}
      />

      {errorPago && (
        <div
          className="clay-card p-4 flex items-start gap-3"
          style={{ borderRadius: '12px', borderColor: 'var(--color-pomegranate)' }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-pomegranate)' }} />
          <p className="text-sm text-black" style={{ fontWeight: 400 }}>{errorPago}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pagando || !stripe || !elements || !elementoCompleto}
        className="w-full py-4 rounded-card text-sm transition-all duration-300"
        style={{
          fontWeight: 700,
          background: pagando || !stripe || !elements || !elementoCompleto ? 'var(--color-accent)' : '#000',
          color: pagando || !stripe || !elements || !elementoCompleto ? 'var(--color-text-muted)' : '#fff',
          cursor: pagando || !stripe || !elements || !elementoCompleto ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!pagando && stripe && elements && elementoCompleto) {
            e.currentTarget.style.transform = 'rotateZ(-2deg) translateY(-3px)'
            e.currentTarget.style.boxShadow = 'rgb(0,0,0) -5px 5px'
            e.currentTarget.style.background = 'var(--color-pomegranate)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = ''
          e.currentTarget.style.background = pagando || !stripe || !elements || !elementoCompleto ? 'var(--color-accent)' : '#000'
        }}
      >
        {pagando ? tPayment.paying : tPayment.payBtn}
      </button>
    </form>
  )
}

export default function Booking() {
  const { t, lang } = useLang()
  const cal = t.booking.calendar
  const hoy = new Date()
  const sectionRef = useRef<HTMLElement>(null)
  const [paso, setPaso] = useState<Paso>('servicios')
  const [carrito, setCarrito] = useState<string[]>([])
  const [mes, setMes] = useState(hoy.getMonth())
  const [año, setAño] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ nombre: '', telefono: '', email: '', notas: '' })
  const [enviando, setEnviando] = useState(false)
  const [reservaGuardada, setReservaGuardada] = useState<BookingType | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [horasOcupadas, setHorasOcupadas] = useState<Array<{ inicio: number; fin: number }>>([])
  const [diaCompletoSupa, setDiaCompletoSupa] = useState(false)
  const [diasBloqueadosMes, setDiasBloqueadosMes] = useState<Set<string>>(new Set())
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [catAbierta, setCatAbierta] = useState<string | null>(null)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [mostrarHojaCarrito, setMostrarHojaCarrito] = useState(false)

  const serviciosEnCarrito = useMemo(
    () => SERVICIOS.filter((s) => carrito.includes(s.id)),
    [carrito]
  )

  const duracionTotal = useMemo(
    () => serviciosEnCarrito.reduce((acc, s) => acc + s.duracionMinutos, 0),
    [serviciosEnCarrito]
  )

  const precioTotal = useMemo(
    () => serviciosEnCarrito.reduce((acc, s) => acc + parsePrecio(s.precio), 0),
    [serviciosEnCarrito]
  )

  const sugerencias = useMemo(() => {
    const ids = new Set<string>()
    carrito.forEach((id) => {
      const sug = SUGERENCIAS[id] ?? []
      sug.forEach((s) => { if (!carrito.includes(s)) ids.add(s) })
    })
    return SERVICIOS.filter((s) => ids.has(s.id)).slice(0, 3)
  }, [carrito])

  const mensajePersonalizado = useMemo(
    () => (carrito.length > 0 ? (MENSAJES_CRUZADA[carrito[0]] ?? null) : null),
    [carrito]
  )

  // Familias de servicios que no tiene sentido cruzar entre sí.
  // Si el carrito mezcla 2+ familias distintas, el modal de venta cruzada se omite.
  const FAMILIAS: Record<string, string> = {
    manicura: 'unas', 'manicura-dbonita': 'unas', 'manicura-renaissance': 'unas',
    'manicura-renaissance-semi': 'unas', 'retirado-manicura': 'unas',
    'extension-soft-gel': 'unas', 'extension-gel': 'unas',
    'pedicura-renaissance': 'unas', 'pedicura-renaissance-semi': 'unas',
    francesa: 'unas', 'decoracion-basica': 'unas', 'decoracion-elaborada': 'unas',
    'ingles-cera': 'depilacion', 'pierna-completa-cera': 'depilacion',
    'medias-piernas-cera': 'depilacion', 'axilas-cera': 'depilacion',
    'cejas-cera': 'depilacion', 'bigote-cera': 'depilacion',
    'cejas-hilo': 'depilacion', 'labio-hilo': 'depilacion',
    'lifting-pestanas': 'cara', 'laminado-cejas': 'cara',
    'tinte-cejas': 'cara', 'tinte-pestanas': 'cara',
    'higiene-facial': 'facial', radiofrecuencia: 'facial', detox: 'facial',
    'vitamina-c': 'facial', 'glow-skin': 'facial', 'skin-balance': 'facial',
    maderoterapia: 'corporal', 'drenaje-linfatico': 'corporal',
    'corporal-personalizado': 'corporal',
  }

  const carritoMezclado = useMemo(() => {
    const familias = new Set(carrito.map((id) => FAMILIAS[id]).filter(Boolean))
    return familias.size > 1
  }, [carrito])

  const fechaStr = diaSeleccionado ? toFechaStr(año, mes, diaSeleccionado) : ''
  const monthName = cal.months[mes]

  useEffect(() => {
    getSlotsBloqueadosAsync().then((bloqueos) => {
      const fechaInicio = toFechaStr(año, mes, 1)
      const ultimoDia = new Date(año, mes + 1, 0).getDate()
      const fechaFin = toFechaStr(año, mes, ultimoDia)
      const cerrados = new Set(
        bloqueos
          .filter((b) => b.fecha >= fechaInicio && b.fecha <= fechaFin)
          .filter((b) => b.horaInicio === 'todo-el-dia' && (b.afecta === 'negocio' || !b.afecta))
          .map((b) => b.fecha)
      )
      setDiasBloqueadosMes(cerrados)
    })
  }, [mes, año])

  useEffect(() => {
    if (!fechaStr) { setHorasOcupadas([]); setDiaCompletoSupa(false); return }
    setCargandoSlots(true)
    getHorasOcupadasByFechaAsync(fechaStr)
      .then(({ rangos, diaCompleto }) => {
        setHorasOcupadas(rangos)
        setDiaCompletoSupa(diaCompleto)
      })
      .finally(() => setCargandoSlots(false))
  }, [fechaStr])

  useEffect(() => {
    if (paso === 'servicios') return
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [paso])

  const slotsBase = useMemo(
    () => (duracionTotal > 0 ? generarSlots(duracionTotal) : []),
    [duracionTotal]
  )

  const slotsDisponibles = useMemo(() => {
    if (duracionTotal === 0 || !fechaStr) return slotsBase
    if (diaCompletoSupa) return []
    if (cargandoSlots) return []
    return slotsBase.filter((slot) => {
      const inicio = timeToMin(slot)
      const fin = inicio + duracionTotal
      const ocupados = horasOcupadas.filter((o) => inicio < o.fin && fin > o.inicio).length
      return ocupados < NUM_PERSONAL
    })
  }, [duracionTotal, fechaStr, slotsBase, horasOcupadas, diaCompletoSupa, cargandoSlots])

  const diasMes = getDiasDelMes(año, mes)
  const fechaFormateada = diaSeleccionado
    ? cal.dateFormatted
        .replace('{day}', String(diaSeleccionado))
        .replace('{month}', monthName)
        .replace('{year}', String(año))
    : ''

  const toggleCarrito = (id: string) => {
    setCarrito((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const eliminarDelCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((x) => x !== id))
  }

  const mesPrevio = () => {
    if (mes === 0) { setMes(11); setAño((a) => a - 1) } else setMes((m) => m - 1)
    setDiaSeleccionado(null)
  }
  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAño((a) => a + 1) } else setMes((m) => m + 1)
    setDiaSeleccionado(null)
  }

  const elegirDia = (dia: number) => {
    if (esPasado(año, mes, dia) || esCerrado(año, mes, dia)) return
    setDiaSeleccionado(dia)
    setHoraSeleccionada(null)
  }

  const volver = () => {
    if (paso === 'calendario') setPaso('servicios')
    else if (paso === 'datos') setPaso('calendario')
    else if (paso === 'pago') { setClientSecret(null); setPaso('datos') }
  }

  const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const telefonoValido = (v: string) => v.replace(/[\s\-().+]/g, '').length >= 9

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (carrito.length === 0 || !diaSeleccionado || !horaSeleccionada) return

    if (!emailValido(form.email)) {
      setError(t.booking.form.errorEmail)
      return
    }
    if (!telefonoValido(form.telefono)) {
      setError(t.booking.form.errorPhone)
      return
    }

    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          servicios: carrito,
          servicioDesc: serviciosEnCarrito.map((s) => s.nombre).join(' + '),
          fecha: fechaStr,
          hora: horaSeleccionada,
          duracionMinutos: duracionTotal,
          notas: form.notas,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) throw new Error(data.error ?? t.booking.form.errorInit)
      setClientSecret(data.clientSecret)
      setPaso('pago')
    } catch {
      setError(t.booking.form.errorInit)
    } finally {
      setEnviando(false)
    }
  }

  const handlePagoExito = async (booking: BookingType) => {
    setReservaGuardada(booking)
    await Promise.allSettled([
      enviarConfirmacion(booking),
      enviarNotificacionNegocio(booking),
    ])
    setPaso('confirmado')
  }

  const resetear = () => {
    setPaso('servicios'); setCarrito([])
    setDiaSeleccionado(null); setHoraSeleccionada(null)
    setForm({ nombre: '', telefono: '', email: '', notas: '' })
    setMes(hoy.getMonth()); setAño(hoy.getFullYear())
    setReservaGuardada(null); setClientSecret(null)
  }

  return (
    <section ref={sectionRef} id="servicios" className="section-padding bg-bg" aria-label="Reservar cita">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Cabecera */}
        <div className="flex flex-col gap-4 mb-10">
          <motion.span
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="label-upper text-text-muted"
          >
            {t.booking.eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans leading-tight text-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            {t.booking.headlinePre}{' '}
            <span style={{ color: 'var(--color-pomegranate)' }}>{t.booking.headlineAccent}</span>
          </motion.h2>
        </div>

        {paso !== 'confirmado' && <StepIndicator paso={paso} steps={t.booking.steps} />}

        {(paso === 'calendario' || paso === 'datos' || paso === 'pago') && (
          <button
            onClick={volver}
            className="flex items-center gap-2 text-xs text-text-muted mb-6 transition-colors duration-200 hover:text-black"
            style={{ fontFamily: '"Space Mono", monospace' }}
            aria-label={t.booking.back}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {t.booking.back}
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* ── PASO 1: Selección de servicios ── */}
          {paso === 'servicios' && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-28 lg:pb-0"
            >
              {/* Left: category accordion */}
              <div className="lg:col-span-2">
                <p className="text-sm text-text-muted mb-5 leading-relaxed" style={{ fontWeight: 400 }}>
                  {t.booking.cart.intro}
                </p>

                <div className="flex flex-col gap-2">
                  {CATEGORIAS_SERVICIOS.map((cat) => {
                    const catServicios = SERVICIOS.filter((s) => s.categoriaId === cat.id)
                    const seleccionadosEnCat = catServicios.filter((s) => carrito.includes(s.id)).length
                    return (
                      <div
                        key={cat.id}
                        className="clay-card overflow-hidden"
                        style={{ borderRadius: '16px' }}
                      >
                        <button
                          onClick={() => setCatAbierta((p) => (p === cat.id ? null : cat.id))}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                          aria-expanded={catAbierta === cat.id}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-black" style={{ fontWeight: 700 }}>
                              {cat.nombre}
                            </span>
                            {seleccionadosEnCat > 0 && (
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                                style={{ background: 'var(--color-pomegranate)', fontWeight: 700 }}
                              >
                                {seleccionadosEnCat}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="label-upper text-text-muted hidden sm:block">
                              {catServicios.length} {catServicios.length === 1 ? t.booking.serviceSingular : t.booking.servicePlural}
                            </span>
                            <span
                              className="w-6 h-6 rounded-card flex items-center justify-center transition-colors duration-200"
                              style={{ background: catAbierta === cat.id ? '#000' : 'var(--color-accent)' }}
                              aria-hidden="true"
                            >
                              {catAbierta === cat.id
                                ? <Minus size={12} color="#fff" />
                                : <Plus size={12} color="var(--color-text-muted)" />
                              }
                            </span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {catAbierta === cat.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-black/5">
                                {catServicios.map((s, idx) => {
                                  const enCarrito = carrito.includes(s.id)
                                  return (
                                    <button
                                      key={s.id}
                                      onClick={() => toggleCarrito(s.id)}
                                      className="w-full flex items-start justify-between gap-4 px-5 py-3 text-left transition-colors duration-150"
                                      style={{ background: enCarrito ? 'var(--color-pomegranate)' + '12' : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-sm text-black" style={{ fontWeight: enCarrito ? 700 : 500 }}>
                                          {s.nombre}
                                        </span>
                                        <p className="text-xs text-text-muted leading-relaxed line-clamp-1" style={{ fontWeight: 400 }}>
                                          {s.descripcion}
                                        </p>
                                        <span
                                          className="text-xs text-text-muted flex items-center gap-1"
                                          style={{ fontFamily: '"Space Mono", monospace' }}
                                        >
                                          <Clock size={9} aria-hidden="true" />
                                          {s.duracion}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span
                                          className="text-sm"
                                          style={{ fontWeight: 700, color: enCarrito ? 'var(--color-pomegranate)' : '#000' }}
                                        >
                                          {s.precio}
                                        </span>
                                        <span
                                          className="w-6 h-6 rounded-card flex items-center justify-center transition-all duration-200"
                                          style={{
                                            background: enCarrito ? 'var(--color-pomegranate)' : 'var(--color-brand)',
                                            color: '#000',
                                          }}
                                        >
                                          {enCarrito ? <CheckCircle size={14} /> : <Plus size={14} />}
                                        </span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>

              </div>

              {/* Right: Cart (desktop only — mobile uses bottom bar) */}
              <div className="hidden lg:block lg:col-span-1">
                <div
                  className="clay-card p-6 sticky top-24 flex flex-col gap-4"
                  style={{ borderRadius: '20px' }}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} aria-hidden="true" />
                    <h3 className="text-base text-black" style={{ fontWeight: 700 }}>{t.booking.cart.title}</h3>
                    {carrito.length > 0 && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ml-auto"
                        style={{ background: 'var(--color-pomegranate)', fontWeight: 700 }}
                      >
                        {carrito.length}
                      </span>
                    )}
                  </div>

                  {carrito.length === 0 ? (
                    <p className="text-sm text-text-muted" style={{ fontWeight: 400 }}>
                      {t.booking.cart.empty}
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        {serviciosEnCarrito.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-start justify-between gap-2 p-3 rounded-xl"
                            style={{ background: 'rgba(0,0,0,0.02)' }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-sm text-black leading-tight" style={{ fontWeight: 600 }}>
                                {s.nombre}
                              </span>
                              <span className="text-xs text-text-muted" style={{ fontFamily: '"Space Mono", monospace' }}>
                                {s.duracion}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm" style={{ fontWeight: 700 }}>{s.precio}</span>
                              <button
                                onClick={() => eliminarDelCarrito(s.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-text-muted hover:text-black transition-colors"
                                style={{ background: 'var(--color-accent)' }}
                                aria-label={`Quitar ${s.nombre}`}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-black/10 pt-3 flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted" style={{ fontWeight: 400 }}>{t.booking.totalDuration}</span>
                          <span className="text-black" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>
                            {formatDuracion(duracionTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted" style={{ fontWeight: 400 }}>{t.booking.total}</span>
                          <span className="text-black" style={{ fontWeight: 800 }}>
                            {precioTotal > 0 ? `${precioTotal}€` : t.booking.toConsult}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (sugerencias.length > 0 && !carritoMezclado) {
                            setMostrarSugerencias(true)
                          } else {
                            setDiaSeleccionado(null)
                            setHoraSeleccionada(null)
                            setPaso('calendario')
                          }
                        }}
                        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                      >
                        {t.booking.cart.chooseDate}
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PASO 2: Fecha y hora (combinado) ── */}
          {paso === 'calendario' && (
            <motion.div
              key="calendario"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
            >
              {/* Columna izquierda: resumen + calendario */}
              <div className="flex flex-col gap-5">
                <div
                  className="clay-card p-4 flex flex-col gap-1"
                  style={{ borderRadius: '16px', background: '#f5f0ff', borderColor: 'var(--color-ube-light)' }}
                >
                  <span className="label-upper text-text-muted">{cal.servicesSelected}</span>
                  {serviciosEnCarrito.map((s) => (
                    <p key={s.id} className="text-sm text-black" style={{ fontWeight: 600 }}>
                      {s.nombre} <span className="text-text-muted" style={{ fontWeight: 400, fontFamily: '"Space Mono", monospace' }}>· {s.duracion}</span>
                    </p>
                  ))}
                  <div className="flex justify-between pt-2 mt-1 border-t border-black/10">
                    <span className="label-upper text-text-muted">Total</span>
                    <span className="text-sm" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>
                      {formatDuracion(duracionTotal)} · {precioTotal > 0 ? `${precioTotal}€` : t.booking.toConsult}
                    </span>
                  </div>
                </div>

                <div className="clay-card p-5" style={{ borderRadius: '20px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={mesPrevio}
                      aria-label={cal.prevMonth}
                      className="w-9 h-9 rounded-card border border-accent flex items-center justify-center text-text-muted transition-all duration-200"
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-2px)'; e.currentTarget.style.boxShadow = 'rgb(0,0,0) -3px 3px' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h3 className="text-base text-black" style={{ fontWeight: 700 }}>
                      {monthName} {año}
                    </h3>
                    <button
                      onClick={mesSiguiente}
                      aria-label={cal.nextMonth}
                      className="w-9 h-9 rounded-card border border-accent flex items-center justify-center text-text-muted transition-all duration-200"
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateZ(-4deg) translateY(-2px)'; e.currentTarget.style.boxShadow = 'rgb(0,0,0) -3px 3px' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-2">
                    {cal.days.map((d) => (
                      <div key={d} className="text-center label-upper text-text-muted py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {diasMes.map((dia, i) => {
                      if (!dia) return <div key={`e-${i}`} />
                      const bloqueado = diasBloqueadosMes.has(toFechaStr(año, mes, dia))
                      const noDisp = esPasado(año, mes, dia) || esCerrado(año, mes, dia) || bloqueado
                      const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()
                      const esSeleccionado = dia === diaSeleccionado
                      return (
                        <button
                          key={dia}
                          onClick={() => elegirDia(dia)}
                          disabled={noDisp}
                          aria-label={`${dia} ${monthName}${noDisp ? cal.notAvailable : ''}`}
                          className="aspect-square flex items-center justify-center text-sm rounded-card transition-all duration-200"
                          style={{
                            fontWeight: esSeleccionado ? 700 : 400,
                            background: esSeleccionado ? '#000' : 'transparent',
                            color: noDisp ? 'var(--color-accent)' : esSeleccionado ? '#fff' : esHoy ? 'var(--color-pomegranate)' : '#000',
                            cursor: noDisp ? 'not-allowed' : 'pointer',
                            textDecoration: noDisp ? 'line-through' : 'none',
                            border: esHoy && !esSeleccionado ? '1.5px solid var(--color-pomegranate)' : 'none',
                          }}
                        >
                          {dia}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-accent">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sharp" style={{ border: '1.5px solid var(--color-pomegranate)' }} />
                      <span className="label-upper text-text-muted">{cal.today}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sharp bg-accent" />
                      <span className="label-upper text-text-muted">{cal.unavailable}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha: info del estudio → slots al seleccionar día */}
              <div className="flex flex-col gap-4 lg:pt-2">
                <AnimatePresence mode="wait">
                  {!diaSeleccionado ? (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                      className="flex flex-col gap-4"
                    >
                      <p className="text-xl text-black" style={{ fontWeight: 700 }}>{cal.whichDay}</p>
                      <p className="text-sm text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                        {cal.slotsAdjust.replace('{dur}', formatDuracion(duracionTotal))}
                      </p>
                      <div className="clay-card p-4" style={{ borderRadius: '16px' }}>
                        <span className="label-upper text-text-muted block mb-2">{cal.studioHours}</span>
                        <p className="text-sm text-black mb-0.5" style={{ fontWeight: 400 }}>{cal.hoursWeekday}</p>
                        <p className="text-xs text-text-muted" style={{ fontWeight: 400 }}>{cal.hoursClosed}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={fechaStr}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col gap-4"
                    >
                      <p className="text-xl text-black" style={{ fontWeight: 700 }}>{fechaFormateada}</p>

                      {slotsDisponibles.length === 0 ? (
                        <div className="clay-card p-5 flex items-start gap-3" style={{ borderRadius: '16px' }}>
                          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-pomegranate)' }} aria-hidden="true" />
                          <div>
                            <p className="text-sm text-black mb-1" style={{ fontWeight: 700 }}>{cal.noSlots}</p>
                            <p className="text-xs text-text-muted" style={{ fontWeight: 400 }}>
                              {cal.noSlotsDesc}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                            {cal.slotsHint.replace('{dur}', formatDuracion(duracionTotal))}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slotsDisponibles.map((hora) => {
                              const [h, m] = hora.split(':').map(Number)
                              const finMin = h * 60 + m + duracionTotal
                              const fin = `${Math.floor(finMin / 60).toString().padStart(2, '0')}:${(finMin % 60).toString().padStart(2, '0')}`
                              const seleccionada = horaSeleccionada === hora
                              return (
                                <button
                                  key={hora}
                                  onClick={() => setHoraSeleccionada(hora)}
                                  aria-pressed={seleccionada}
                                  aria-label={`${hora} hasta ${fin}`}
                                  className="clay-card flex flex-col items-center py-3 px-2 transition-all duration-200"
                                  style={{
                                    borderRadius: '12px',
                                    background: seleccionada ? '#000' : '#fff',
                                    color: seleccionada ? '#fff' : '#000',
                                    boxShadow: seleccionada ? 'rgb(0,0,0) -4px 4px' : undefined,
                                    transform: seleccionada ? 'rotateZ(-2deg) translateY(-2px)' : '',
                                  }}
                                >
                                  <span className="text-sm" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>{hora}</span>
                                  <span className="text-xs mt-0.5" style={{ fontFamily: '"Space Mono", monospace', opacity: seleccionada ? 0.6 : 0.4 }}>{fin}</span>
                                </button>
                              )
                            })}
                          </div>
                          <button
                            onClick={() => horaSeleccionada && setPaso('datos')}
                            disabled={!horaSeleccionada}
                            className="w-full py-4 rounded-card text-sm transition-all duration-300"
                            style={{
                              fontWeight: 700,
                              background: horaSeleccionada ? '#000' : 'var(--color-accent)',
                              color: horaSeleccionada ? '#fff' : 'var(--color-text-muted)',
                              cursor: horaSeleccionada ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={(e) => {
                              if (horaSeleccionada) {
                                e.currentTarget.style.transform = 'rotateZ(-2deg) translateY(-3px)'
                                e.currentTarget.style.boxShadow = 'rgb(0,0,0) -5px 5px'
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = ''
                              e.currentTarget.style.boxShadow = ''
                            }}
                          >
                            {horaSeleccionada
                              ? `${cal.continueBtnPre}${fechaFormateada} · ${horaSeleccionada}`
                              : cal.selectTime}
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── PASO 4: Datos personales ── */}
          {paso === 'datos' && (
            <motion.div
              key="datos"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="max-w-2xl"
            >
              <div
                className="clay-card p-4 flex flex-col gap-2 mb-8"
                style={{ borderRadius: '16px', background: '#f5f0ff', borderColor: 'var(--color-ube-light)' }}
              >
                <span className="label-upper text-text-muted">{t.booking.form.yourAppointment}</span>
                <p className="text-base text-black" style={{ fontWeight: 700 }}>
                  {fechaFormateada} · {horaSeleccionada}
                </p>
                <div className="flex flex-col gap-0.5">
                  {serviciosEnCarrito.map((s) => (
                    <p key={s.id} className="text-xs text-text-muted" style={{ fontWeight: 400 }}>
                      {s.nombre} · {s.duracion} · {s.precio}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between pt-2 mt-1 border-t border-black/10">
                  <span className="text-xs text-text-muted" style={{ fontWeight: 400 }}>{t.booking.totalDuration}</span>
                  <span className="text-xs text-black" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>{formatDuracion(duracionTotal)}</span>
                </div>
                <button
                  onClick={() => setPaso('servicios')}
                  className="text-xs text-text-muted underline underline-offset-2 hover:text-black transition-colors self-start mt-1"
                  style={{ fontWeight: 500 }}
                >
                  {t.booking.form.changeServices}
                </button>
              </div>

              {error && (
                <div className="clay-card p-4 flex items-start gap-3 mb-6" style={{ borderRadius: '12px', borderColor: 'var(--color-pomegranate)' }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-pomegranate)' }} />
                  <p className="text-sm text-black" style={{ fontWeight: 400 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nombre" className="label-upper text-text-muted">{t.booking.form.nameLabel}</label>
                    <input
                      id="nombre" type="text" required
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      placeholder={t.booking.form.namePlaceholder}
                      className="w-full px-4 py-3 rounded-card border border-accent bg-white text-sm text-black placeholder:text-text-muted/50 focus:outline-none transition-colors duration-200"
                      style={{ fontWeight: 400, boxShadow: 'var(--shadow-clay)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#000' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="telefono" className="label-upper text-text-muted">{t.booking.form.phoneLabel}</label>
                    <input
                      id="telefono" type="tel" required
                      value={form.telefono}
                      onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-3 rounded-card border border-accent bg-white text-sm text-black placeholder:text-text-muted/50 focus:outline-none transition-colors duration-200"
                      style={{ fontWeight: 400, boxShadow: 'var(--shadow-clay)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#000' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                    />
                    <p className="text-xs text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                      {t.booking.form.phoneHint}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="label-upper text-text-muted">{t.booking.form.emailLabel}</label>
                  <input
                    id="email" type="email" required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-card border border-accent bg-white text-sm text-black placeholder:text-text-muted/50 focus:outline-none transition-colors duration-200"
                    style={{ fontWeight: 400, boxShadow: 'var(--shadow-clay)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#000' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                  />
                  <p className="text-xs text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                    {t.booking.form.emailHint}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="notas" className="label-upper text-text-muted">{t.booking.form.notesLabel}</label>
                  <textarea
                    id="notas" rows={3}
                    value={form.notas}
                    onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                    placeholder={t.booking.form.notesPlaceholder}
                    className="w-full px-4 py-3 rounded-card border border-accent bg-white text-sm text-black placeholder:text-text-muted/50 focus:outline-none transition-colors duration-200 resize-none"
                    style={{ fontWeight: 400, boxShadow: 'var(--shadow-clay)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#000' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                  />
                </div>

                <div className="clay-card p-4 flex flex-col gap-1.5" style={{ borderRadius: '12px' }}>
                  <p className="text-xs text-black" style={{ fontWeight: 700 }}>{t.booking.form.policyTitle}</p>
                  <p className="text-xs text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                    {t.booking.form.policyBody}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={enviando || !form.nombre || !form.telefono || !form.email}
                  className="w-full py-4 rounded-card text-sm mt-2 transition-all duration-300"
                  style={{
                    fontWeight: 700,
                    background: enviando || !form.nombre || !form.telefono || !form.email ? 'var(--color-accent)' : '#000',
                    color: enviando || !form.nombre || !form.telefono || !form.email ? 'var(--color-text-muted)' : '#fff',
                    cursor: enviando || !form.nombre || !form.telefono || !form.email ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!enviando && form.nombre && form.telefono && form.email) {
                      e.currentTarget.style.transform = 'rotateZ(-2deg) translateY(-3px)'
                      e.currentTarget.style.boxShadow = 'rgb(0,0,0) -5px 5px'
                      e.currentTarget.style.background = 'var(--color-pomegranate)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = ''
                    e.currentTarget.style.background = enviando || !form.nombre || !form.telefono || !form.email ? 'var(--color-accent)' : '#000'
                  }}
                >
                  {enviando ? t.booking.form.submitPreparing : t.booking.form.submitBtn}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── PASO 4: Pago ── */}
          {paso === 'pago' && clientSecret && stripePromise && (
            <motion.div
              key="pago"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="max-w-2xl flex flex-col gap-6"
            >
              {/* Resumen de la cita */}
              <div
                className="clay-card p-4 flex flex-col gap-2"
                style={{ borderRadius: '16px', background: '#f5f0ff', borderColor: 'var(--color-ube-light)' }}
              >
                <span className="label-upper text-text-muted">{t.booking.form.yourAppointment}</span>
                <p className="text-base text-black" style={{ fontWeight: 700 }}>
                  {fechaFormateada} · {horaSeleccionada}
                </p>
                <div className="flex flex-col gap-0.5">
                  {serviciosEnCarrito.map((s) => (
                    <p key={s.id} className="text-xs text-text-muted" style={{ fontWeight: 400 }}>
                      {s.nombre} · {s.duracion} · {s.precio}
                    </p>
                  ))}
                </div>
              </div>

              {/* Info de la señal */}
              <div className="clay-card p-4 flex items-start gap-3" style={{ borderRadius: '14px' }}>
                <CreditCard size={18} className="shrink-0 mt-0.5 text-black" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-black" style={{ fontWeight: 700 }}>{t.booking.payment.depositTitle}</p>
                  <p className="text-xs text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                    {t.booking.payment.depositBody}
                  </p>
                </div>
              </div>

              {/* Stripe Payment Element */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: lang === 'es' ? 'es' : 'en',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#000000',
                      colorBackground: '#ffffff',
                      colorText: '#2C2420',
                      colorDanger: '#E63946',
                      fontFamily: '"Jost", "DM Sans", sans-serif',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <PagoForm
                  form={form}
                  carrito={carrito}
                  fechaStr={fechaStr}
                  horaSeleccionada={horaSeleccionada!}
                  duracionTotal={duracionTotal}
                  clientSecret={clientSecret}
                  onExito={handlePagoExito}
                  tPayment={{
                    ...t.booking.payment,
                    errorPayment: t.booking.form.errorPayment,
                    errorSave: t.booking.form.errorSave,
                  }}
                />
              </Elements>

              <p className="text-xs text-text-muted text-center" style={{ fontWeight: 400 }}>
                {t.booking.payment.helpText}{' '}
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34600000000'}?text=${encodeURIComponent(t.booking.payment.helpWaMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline underline-offset-2"
                  style={{ fontWeight: 600 }}
                >
                  {t.booking.payment.helpLink}
                </a>
              </p>
            </motion.div>
          )}

          {/* ── PASO 5: Confirmado ── */}
          {paso === 'confirmado' && reservaGuardada && (
            <motion.div
              key="confirmado"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl flex flex-col items-center text-center gap-6 py-12 mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-feature flex items-center justify-center"
                style={{ background: '#000', boxShadow: 'rgb(0,0,0) -5px 5px' }}
              >
                <CheckCircle size={32} color="#fff" aria-hidden="true" />
              </motion.div>

              <div className="flex flex-col gap-2">
                <h3 className="text-black" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  {t.booking.confirmed.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                  {t.booking.confirmed.body
                    .replace('{fecha}', fechaFormateada)
                    .replace('{hora}', horaSeleccionada ?? '')
                    .replace('{email}', form.email)}
                </p>
              </div>

              <div className="clay-card w-full text-left p-6 flex flex-col gap-2" style={{ borderRadius: '20px' }}>
                <span className="label-upper text-text-muted block mb-1">{t.booking.confirmed.summary}</span>
                <p className="text-sm text-black" style={{ fontWeight: 700 }}>{form.nombre}</p>
                <div className="flex flex-col gap-0.5">
                  {serviciosEnCarrito.map((s) => (
                    <p key={s.id} className="text-sm text-text-muted" style={{ fontWeight: 400 }}>
                      {s.nombre} · {s.duracion} · {s.precio}
                    </p>
                  ))}
                </div>
                <p className="text-base text-black mt-1" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {fechaFormateada} · {horaSeleccionada}
                </p>
                <div className="pt-3 mt-1 border-t border-accent">
                  <span className="label-upper text-text-muted">{t.booking.confirmed.bookingRef}</span>
                  <p className="text-xs text-black mt-0.5" style={{ fontFamily: '"Space Mono", monospace', fontWeight: 400 }}>
                    {reservaGuardada.id}
                  </p>
                </div>
              </div>

              <div className="clay-card w-full text-left p-4" style={{ borderRadius: '16px' }}>
                <p className="text-xs text-text-muted leading-relaxed" style={{ fontWeight: 400 }}>
                  {t.booking.confirmed.cancelInfo}{' '}
                  <a
                    href={`/cancelar/${reservaGuardada.id}`}
                    className="text-black underline underline-offset-2"
                    style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700 }}
                  >
                    {t.booking.confirmed.cancelLink}
                  </a>
                </p>
              </div>

              <button onClick={resetear} className="btn-secondary text-sm">
                {t.booking.confirmed.bookAgain}
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Modal de sugerencias ── */}
        <AnimatePresence>
          {mostrarSugerencias && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => {
                setMostrarSugerencias(false)
                setDiaSeleccionado(null)
                setHoraSeleccionada(null)
                setPaso('calendario')
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
                style={{ background: 'var(--color-bg)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--color-pomegranate)' }}
                  >
                    <Sparkles size={16} color="#fff" aria-hidden="true" />
                  </div>
                  <p
                    className="text-base text-black leading-snug flex-1"
                    style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
                  >
                    {mensajePersonalizado ?? t.booking.upsell.defaultMsg}
                  </p>
                  <button
                    onClick={() => setMostrarSugerencias(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-accent)' }}
                    aria-label="Cerrar"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Carrito actual */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  {serviciosEnCarrito.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-black" style={{ fontWeight: 600 }}>{s.nombre}</span>
                      <span className="text-xs text-text-muted" style={{ fontFamily: '"Space Mono", monospace' }}>{s.duracion}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1.5 mt-1 border-t border-black/10">
                    <span className="text-xs text-text-muted" style={{ fontWeight: 400 }}>{t.booking.upsell.totalDuration}</span>
                    <span className="text-xs text-black" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>
                      {formatDuracion(duracionTotal)}
                    </span>
                  </div>
                </div>

                {/* Sugerencias */}
                <div className="flex flex-col gap-3">
                  {sugerencias.map((s) => {
                    const yaEnCarrito = carrito.includes(s.id)
                    return (
                      <div
                        key={s.id}
                        className="clay-card flex items-start gap-3 p-4 text-left"
                        style={{ borderRadius: '16px' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black" style={{ fontWeight: 700 }}>{s.nombre}</p>
                          <p className="text-xs text-text-muted line-clamp-2 mt-0.5" style={{ fontWeight: 400 }}>{s.descripcion}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-text-muted flex items-center gap-1" style={{ fontFamily: '"Space Mono", monospace' }}>
                              <Clock size={10} />{s.duracion}
                            </span>
                            <span className="text-sm" style={{ fontWeight: 700, color: 'var(--color-pomegranate)' }}>{s.precio}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!yaEnCarrito) toggleCarrito(s.id)
                          }}
                          disabled={yaEnCarrito}
                          className="shrink-0 px-4 py-2 rounded-xl text-xs transition-all duration-200"
                          style={{
                            fontWeight: 700,
                            background: yaEnCarrito ? 'var(--color-accent)' : 'var(--color-brand)',
                            color: yaEnCarrito ? 'var(--color-text-muted)' : '#000',
                            cursor: yaEnCarrito ? 'default' : 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            if (!yaEnCarrito) {
                              e.currentTarget.style.transform = 'rotateZ(-2deg) translateY(-2px)'
                              e.currentTarget.style.boxShadow = 'rgb(0,0,0) -3px 3px'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = ''
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          {yaEnCarrito ? t.booking.upsell.added : t.booking.upsell.add}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Actualización del total si se añadieron sugerencias */}
                <div
                  className="flex justify-between items-center p-3 rounded-xl"
                  style={{ background: '#f5f0ff' }}
                >
                  <div>
                    <span className="label-upper text-text-muted block">{t.booking.upsell.updatedTotal}</span>
                    <span className="text-base text-black" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                      {formatDuracion(duracionTotal)} · {precioTotal > 0 ? `${precioTotal}€` : t.booking.toConsult}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {carrito.length === 1
                      ? t.booking.upsell.selectedSingular.replace('{n}', String(carrito.length))
                      : t.booking.upsell.selectedPlural.replace('{n}', String(carrito.length))}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setMostrarSugerencias(false)
                    setDiaSeleccionado(null)
                    setHoraSeleccionada(null)
                    setPaso('calendario')
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {t.booking.upsell.continueBtn}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>

                <button
                  onClick={() => setMostrarSugerencias(false)}
                  className="text-xs text-text-muted text-center hover:text-black transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  {t.booking.upsell.skipBtn}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile: barra fija inferior ── */}
        <AnimatePresence>
          {carrito.length > 0 && paso === 'servicios' && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderTop: '1px solid var(--color-accent)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
              } as React.CSSProperties}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => setMostrarHojaCarrito(true)}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                  aria-label="Ver servicios seleccionados"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
                    style={{ background: '#000' }}
                  >
                    <ShoppingCart size={16} color="#fff" aria-hidden="true" />
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ fontSize: '0.6rem', fontWeight: 800, background: 'var(--color-pomegranate)' }}
                    >
                      {carrito.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0 min-w-0">
                    <span className="text-sm text-black leading-tight" style={{ fontWeight: 700 }}>
                      {carrito.length === 1
                        ? t.booking.upsell.selectedSingular.replace('{n}', String(carrito.length))
                        : t.booking.upsell.selectedPlural.replace('{n}', String(carrito.length))}
                    </span>
                    <span className="text-xs text-text-muted" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {formatDuracion(duracionTotal)} · {precioTotal > 0 ? `${precioTotal}€` : t.booking.toConsult}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (sugerencias.length > 0 && !carritoMezclado) {
                      setMostrarSugerencias(true)
                    } else {
                      setDiaSeleccionado(null)
                      setHoraSeleccionada(null)
                      setPaso('calendario')
                    }
                  }}
                  className="shrink-0 flex items-center gap-1.5 text-black text-sm px-4 py-2.5"
                  style={{ fontWeight: 700, background: 'var(--color-brand)', borderRadius: '12px' }}
                  aria-label="Elegir fecha y hora"
                >
                  {t.booking.cart.chooseDate}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile: hoja de carrito (bottom sheet) ── */}
        <AnimatePresence>
          {mostrarHojaCarrito && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setMostrarHojaCarrito(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-0 left-0 right-0 flex flex-col"
                style={{
                  background: 'var(--color-bg)',
                  borderRadius: '24px 24px 0 0',
                  maxHeight: '85vh',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0" aria-hidden="true">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-accent)' }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} aria-hidden="true" />
                    <h3 className="text-base text-black" style={{ fontWeight: 700 }}>{t.booking.cart.title}</h3>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ background: 'var(--color-pomegranate)', fontWeight: 700 }}
                    >
                      {carrito.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setMostrarHojaCarrito(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}
                    aria-label="Cerrar"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Services list — scrollable */}
                <div className="overflow-y-auto px-5 flex flex-col gap-2 pb-2" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                  {serviciosEnCarrito.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start justify-between gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.03)' }}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm text-black leading-tight" style={{ fontWeight: 600 }}>
                          {s.nombre}
                        </span>
                        <span className="text-xs text-text-muted" style={{ fontFamily: '"Space Mono", monospace' }}>
                          {s.duracion} · {s.precio}
                        </span>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(s.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'var(--color-accent)' }}
                        aria-label={`Quitar ${s.nombre}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="px-5 pt-4 pb-8 flex flex-col gap-3 shrink-0"
                  style={{ borderTop: '1px solid var(--color-accent)' }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted" style={{ fontWeight: 400 }}>{t.booking.totalDuration}</span>
                    <span className="text-black" style={{ fontWeight: 700, fontFamily: '"Space Mono", monospace' }}>
                      {formatDuracion(duracionTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted" style={{ fontWeight: 400 }}>{t.booking.total}</span>
                    <span className="text-black" style={{ fontWeight: 800 }}>
                      {precioTotal > 0 ? `${precioTotal}€` : t.booking.toConsult}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMostrarHojaCarrito(false)
                      if (sugerencias.length > 0 && !carritoMezclado) {
                        setMostrarSugerencias(true)
                      } else {
                        setDiaSeleccionado(null)
                        setHoraSeleccionada(null)
                        setPaso('calendario')
                      }
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
                  >
                    {t.booking.cart.chooseDate}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}