'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Users, LogOut, Plus, Trash2, Check, X,
  Clock, Phone, Mail, ChevronLeft, ChevronRight, Ban,
  BarChart2, ExternalLink, AlertTriangle,
} from 'lucide-react'
import { NUM_PERSONAL } from '@/lib/store'
import {
  getBookingsAsync, updateBookingEstadoAsync, createBookingAsync,
  getClientesAsync, getHistorialClienteAsync,
  getSlotsBloqueadosAsync, crearBloqueoAsync, eliminarBloqueoAsync,
} from '@/lib/supabase-store'
import { SERVICIOS } from '@/lib/constants'
import type { Booking, Cliente, SlotBloqueado, EstadoCita } from '@/lib/types'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function toFechaStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
function getDiasDelMes(y: number, m: number): (number | null)[] {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const total = new Date(y, m + 1, 0).getDate()
  const dias: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) dias.push(d)
  while (dias.length % 7 !== 0) dias.push(null)
  return dias
}
function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1].slice(0,3)} ${y}`
}
function resolverServiciosStr(ids: string[]): string {
  return ids.map((id) => SERVICIOS.find((s) => s.id === id)?.nombre ?? id).join(', ')
}

const ESTADO_ESTILOS: Record<EstadoCita, string> = {
  pendiente:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmada: 'bg-green-50 text-green-700 border-green-200',
  cancelada:  'bg-red-50 text-red-600 border-red-200',
  completada: 'bg-blue-50 text-blue-700 border-blue-200',
}
const ESTADO_LABEL: Record<EstadoCita, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada',
}

// ─── Diálogo de confirmación para cancelar ────────────────
interface ConfirmCancelDialogProps {
  booking: Booking
  onConfirm: () => void
  onCerrar: () => void
}

function ConfirmCancelDialog({ booking, onConfirm, onCerrar }: ConfirmCancelDialogProps) {
  const tienePago = booking.importePagado > 0
  return (
    <div className="fixed inset-0 bg-text/50 z-50 flex items-center justify-center px-4" onClick={onCerrar}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <h2 className="font-display text-xl font-light text-text">Cancelar cita</h2>
        </div>
        <p className="font-sans text-sm font-light text-text-muted leading-relaxed">
          ¿Confirmas que quieres cancelar la cita de{' '}
          <strong className="text-text font-medium">{booking.clienteNombre}</strong> el{' '}
          {formatFecha(booking.fecha)} a las {booking.hora}?
        </p>
        {tienePago && (
          <div className="bg-orange-50 border border-orange-200 p-4 flex flex-col gap-1">
            <p className="font-sans text-xs font-medium text-orange-700">
              Esta clienta pagó {booking.importePagado}€ de señal
            </p>
            <p className="font-sans text-xs font-light text-orange-600 leading-relaxed">
              El reembolso no es automático. Si corresponde, procésalo manualmente desde tu{' '}
              <a
                href="https://dashboard.stripe.com/payments"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 font-medium"
              >
                cuenta de Stripe
              </a>.
            </p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white font-sans text-xs font-light tracking-widest uppercase hover:bg-red-600 transition-colors"
          >
            Sí, cancelar
          </button>
          <button
            onClick={onCerrar}
            className="px-5 py-2.5 border border-accent font-sans text-xs font-light text-text-muted hover:border-primary hover:text-primary transition-colors"
          >
            Volver
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Modal nueva cita (creada desde el panel, sin pago online) ────
interface ModalNuevaCitaProps {
  fechaInicial: string
  onGuardar: () => void
  onCerrar: () => void
}

function ModalNuevaCita({ fechaInicial, onGuardar, onCerrar }: ModalNuevaCitaProps) {
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', notas: '',
    fecha: fechaInicial, hora: '10:00',
    servicioId: SERVICIOS[0].id,
    pagado: false, importePagado: 0,
  })
  const [guardando, setGuardando] = useState(false)

  const servicioSel = SERVICIOS.find((s) => s.id === form.servicioId) ?? SERVICIOS[0]

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await createBookingAsync({
        clienteNombre: form.nombre,
        clienteEmail: form.email,
        clienteTelefono: form.telefono,
        servicios: [servicioSel.id],
        duracionMinutos: servicioSel.duracionMinutos,
        fecha: form.fecha,
        hora: form.hora,
        notas: form.notas,
        pagado: form.pagado,
        importePagado: form.pagado ? form.importePagado : 0,
        estado: 'pendiente',
      })
      onGuardar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-text/50 z-50 flex items-center justify-center px-4" onClick={onCerrar}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-light text-text">Nueva cita</h2>
          <button onClick={onCerrar} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="font-sans text-xs font-light text-yellow-700 leading-relaxed">
            Las citas añadidas manualmente quedan en estado <strong>Pendiente</strong> hasta que confirmes el pago o el acuerdo con la clienta.
          </p>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Nombre *</label>
              <input type="text" required value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre completo"
                className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Teléfono</label>
              <input type="tel" value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="+34 600 000 000"
                className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Servicio *</label>
            <select value={form.servicioId}
              onChange={(e) => setForm((f) => ({ ...f, servicioId: e.target.value }))}
              className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors">
              {SERVICIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre} — {s.duracion}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Fecha *</label>
              <input type="date" required value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Hora *</label>
              <input type="time" required value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Notas</label>
            <textarea rows={2} value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              placeholder="Observaciones, alergias, preferencias..."
              className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>

          <div className="border border-accent p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="pagado-check" checked={form.pagado}
                onChange={(e) => setForm((f) => ({ ...f, pagado: e.target.checked }))}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="pagado-check" className="font-sans text-sm font-light text-text cursor-pointer">
                Ha realizado pago de señal
              </label>
            </div>
            {form.pagado && (
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Importe (€)</label>
                <input type="number" min={0} step={1} value={form.importePagado}
                  onChange={(e) => setForm((f) => ({ ...f, importePagado: Number(e.target.value) }))}
                  className="bg-surface border border-accent px-3 py-2.5 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors w-32" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={guardando || !form.nombre}
              className="flex-1 py-3 bg-primary text-white font-sans text-sm font-light tracking-widest uppercase hover:bg-primary-dark transition-colors disabled:bg-accent disabled:text-text-muted">
              Guardar cita
            </button>
            <button type="button" onClick={onCerrar}
              className="px-6 py-3 border border-accent font-sans text-sm font-light text-text-muted hover:border-primary hover:text-primary transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Vista Citas ──────────────────────────────────────────
function VistaCitas({ onRefresh }: { onRefresh: () => void }) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [año, setAño] = useState(hoy.getFullYear())
  const [diaFiltro, setDiaFiltro] = useState<string>(toFechaStr(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [actualizando, setActualizando] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null)

  const cargar = useCallback(async () => {
    setBookings(await getBookingsAsync())
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const citasDelDia = bookings
    .filter((b) => b.fecha === diaFiltro)
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const citasPorFecha = bookings.reduce<Record<string, number>>((acc, b) => {
    if (b.estado !== 'cancelada') acc[b.fecha] = (acc[b.fecha] ?? 0) + 1
    return acc
  }, {})

  const getColorCarga = (cantidad: number) => {
    if (cantidad === 0) return ''
    const ratio = cantidad / NUM_PERSONAL
    if (ratio < 0.5) return 'bg-green-400'
    if (ratio < 1) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const cambiarEstado = async (id: string, estado: EstadoCita) => {
    setActualizando(id)
    await updateBookingEstadoAsync(id, estado)
    await cargar()
    onRefresh()
    setTimeout(() => setActualizando(null), 400)
  }

  const diasMes = getDiasDelMes(año, mes)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Calendario mini */}
      <div className="md:col-span-4 bg-white border border-accent p-5 self-start">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (mes === 0) { setMes(11); setAño(a => a - 1) } else setMes(m => m - 1) }}
            className="w-8 h-8 border border-accent flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all">
            <ChevronLeft size={14} />
          </button>
          <span className="font-display text-lg font-light text-text">{MESES[mes]} {año}</span>
          <button onClick={() => { if (mes === 11) { setMes(0); setAño(a => a + 1) } else setMes(m => m + 1) }}
            className="w-8 h-8 border border-accent flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DIAS.map(d => <div key={d} className="text-center font-sans text-[10px] font-medium tracking-wider uppercase text-text-muted py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {diasMes.map((dia, i) => {
            if (!dia) return <div key={`e-${i}`} />
            const fecha = toFechaStr(año, mes, dia)
            const cantidad = citasPorFecha[fecha] ?? 0
            const esHoy = fecha === toFechaStr(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
            const seleccionado = fecha === diaFiltro
            return (
              <button key={dia} onClick={() => setDiaFiltro(fecha)}
                title={cantidad > 0 ? `${cantidad} cita${cantidad !== 1 ? 's' : ''} (${NUM_PERSONAL} plazas)` : undefined}
                className={`aspect-square flex flex-col items-center justify-center text-xs font-sans font-light transition-all duration-150 relative
                  ${seleccionado ? 'bg-primary text-white' : esHoy ? 'border border-primary text-primary hover:bg-primary/10' : 'text-text hover:bg-surface'}`}
              >
                {dia}
                {cantidad > 0 && (
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${seleccionado ? 'bg-white' : getColorCarga(cantidad)}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de citas del día */}
      <div className="md:col-span-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-light text-text">{formatFecha(diaFiltro)}</h2>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs font-light text-text-muted">
              {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 font-sans text-xs font-light tracking-widest uppercase hover:bg-primary-dark transition-colors"
            >
              <Plus size={12} />
              Añadir cita
            </button>
          </div>
        </div>

        {citasDelDia.length > 0 && (
          <div className="bg-white border border-accent px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: NUM_PERSONAL }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${i < citasDelDia.length ? 'bg-primary' : 'bg-accent'}`}
                  title={i < citasDelDia.length ? 'Empleada ocupada' : 'Empleada libre'}
                />
              ))}
            </div>
            <p className="font-sans text-xs font-light text-text-muted">
              {Math.min(citasDelDia.length, NUM_PERSONAL)} de {NUM_PERSONAL} plazas ocupadas hoy
            </p>
          </div>
        )}

        {citasDelDia.length === 0 ? (
          <div className="bg-white border border-accent p-8 text-center">
            <p className="font-sans text-sm font-light text-text-muted">No hay citas para este día</p>
          </div>
        ) : (
          citasDelDia.map((b) => (
            <motion.div
              key={b.id}
              layout
              className="bg-white border border-accent p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-2xl font-light text-primary">{b.hora}</span>
                    <span className={`font-sans text-xs px-2 py-0.5 border ${ESTADO_ESTILOS[b.estado]}`}>
                      {ESTADO_LABEL[b.estado]}
                    </span>
                    {b.importePagado > 0 && (
                      <span className="font-sans text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200">
                        {b.importePagado}€ pagados
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm font-medium text-text">{b.clienteNombre}</p>
                  <p className="font-sans text-xs font-light text-text-muted">
                    {resolverServiciosStr(b.servicios)} · {b.duracionMinutos} min
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <a href={`tel:${b.clienteTelefono}`} className="flex items-center gap-1.5 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors">
                    <Phone size={11} />
                    {b.clienteTelefono}
                  </a>
                  <a href={`mailto:${b.clienteEmail}`} className="flex items-center gap-1.5 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors">
                    <Mail size={11} />
                    {b.clienteEmail}
                  </a>
                  {b.notas && (
                    <p className="font-sans text-xs font-light text-text-muted italic max-w-[200px]">{b.notas}</p>
                  )}
                </div>
              </div>

              {b.estado !== 'cancelada' && b.estado !== 'completada' && (
                <div className="flex items-center gap-2 pt-3 border-t border-accent">
                  {b.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(b.id, 'confirmada')}
                      disabled={actualizando === b.id}
                      className="flex items-center gap-1.5 font-sans text-xs font-light px-3 py-1.5 border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <Check size={12} />
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => cambiarEstado(b.id, 'completada')}
                    disabled={actualizando === b.id}
                    className="flex items-center gap-1.5 font-sans text-xs font-light px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Check size={12} />
                    Completada
                  </button>
                  <button
                    onClick={() => setConfirmCancel(b)}
                    disabled={actualizando === b.id}
                    className="flex items-center gap-1.5 font-sans text-xs font-light px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X size={12} />
                    Cancelar
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {modalAbierto && (
          <ModalNuevaCita
            fechaInicial={diaFiltro}
            onGuardar={() => { cargar(); onRefresh(); setModalAbierto(false) }}
            onCerrar={() => setModalAbierto(false)}
          />
        )}
        {confirmCancel && (
          <ConfirmCancelDialog
            booking={confirmCancel}
            onConfirm={() => {
              cambiarEstado(confirmCancel.id, 'cancelada')
              setConfirmCancel(null)
            }}
            onCerrar={() => setConfirmCancel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Vista Clientes ───────────────────────────────────────
function VistaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteActivo, setClienteActivo] = useState<Cliente | null>(null)
  const [historial, setHistorial] = useState<Booking[]>([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { getClientesAsync().then(setClientes) }, [])

  const seleccionarCliente = async (c: Cliente) => {
    setClienteActivo(c)
    const h = await getHistorialClienteAsync(c.email)
    setHistorial(h)
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4 flex flex-col gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="bg-white border border-accent px-4 py-3 font-sans text-sm font-light text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
        {clientesFiltrados.length === 0 ? (
          <p className="font-sans text-sm font-light text-text-muted text-center py-8">No hay clientas registradas</p>
        ) : (
          clientesFiltrados.map((c) => (
            <button
              key={c.email}
              onClick={() => seleccionarCliente(c)}
              className={`text-left bg-white border p-4 transition-all duration-200
                ${clienteActivo?.email === c.email ? 'border-primary' : 'border-accent hover:border-primary/50'}`}
            >
              <p className="font-sans text-sm font-medium text-text">{c.nombre}</p>
              <p className="font-sans text-xs font-light text-text-muted mt-0.5">{c.email}</p>
              <p className="font-sans text-xs font-light text-text-muted">{c.reservaIds.length} reserva{c.reservaIds.length !== 1 ? 's' : ''}</p>
            </button>
          ))
        )}
      </div>

      <div className="md:col-span-8">
        {!clienteActivo ? (
          <div className="bg-white border border-accent p-8 text-center h-full flex items-center justify-center">
            <p className="font-sans text-sm font-light text-text-muted">Selecciona una clienta para ver su historial</p>
          </div>
        ) : (
          <div className="bg-white border border-accent p-6 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-light text-text">{clienteActivo.nombre}</h2>
                <div className="flex flex-col gap-1 mt-2">
                  <a href={`mailto:${clienteActivo.email}`} className="flex items-center gap-2 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors">
                    <Mail size={12} />{clienteActivo.email}
                  </a>
                  <a href={`tel:${clienteActivo.telefono}`} className="flex items-center gap-2 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors">
                    <Phone size={12} />{clienteActivo.telefono}
                  </a>
                </div>
              </div>
              <span className="font-sans text-xs font-light text-text-muted">
                Clienta desde {formatFecha(clienteActivo.creadoEn.split('T')[0])}
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xs font-light tracking-widest uppercase text-text-muted mb-3">Historial de citas</h3>
              {historial.length === 0 ? (
                <p className="font-sans text-sm font-light text-text-muted">Sin historial</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {historial
                    .sort((a, b) => b.fecha.localeCompare(a.fecha))
                    .map((b) => (
                      <div key={b.id} className="flex items-center justify-between border-b border-accent pb-2">
                        <div>
                          <p className="font-sans text-sm font-light text-text">{resolverServiciosStr(b.servicios)}</p>
                          <p className="font-sans text-xs font-light text-text-muted">
                            {formatFecha(b.fecha)} · {b.hora}
                          </p>
                        </div>
                        <span className={`font-sans text-xs px-2 py-0.5 border ${ESTADO_ESTILOS[b.estado]}`}>
                          {ESTADO_LABEL[b.estado]}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vista Bloqueos ───────────────────────────────────────
function VistaBloqueos() {
  const [bloqueos, setBloqueos] = useState<SlotBloqueado[]>([])
  const [form, setForm] = useState({
    fecha: '', horaInicio: '', horaFin: '', motivo: '',
    todoDia: false,
    afecta: 'negocio' as 'negocio' | 'trabajadora',
  })
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setBloqueos(await getSlotsBloqueadosAsync())
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await crearBloqueoAsync({
        fecha: form.fecha,
        horaInicio: form.todoDia ? 'todo-el-dia' : form.horaInicio,
        horaFin: form.todoDia ? 'todo-el-dia' : form.horaFin,
        motivo: form.motivo,
        afecta: form.todoDia ? form.afecta : undefined,
      })
      await cargar()
      setForm({ fecha: '', horaInicio: '', horaFin: '', motivo: '', todoDia: false, afecta: 'negocio' })
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id: string) => {
    await eliminarBloqueoAsync(id)
    await cargar()
  }

  const bloqueosFuturos = bloqueos
    .filter((b) => b.fecha >= toFechaStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-accent p-6">
        <h2 className="font-display text-xl font-light text-text mb-6">Bloquear horario</h2>
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Fecha</label>
            <input
              type="date" required
              value={form.fecha}
              min={toFechaStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              className="bg-surface border border-accent px-4 py-3 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="todo-dia"
              checked={form.todoDia}
              onChange={(e) => setForm((f) => ({ ...f, todoDia: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="todo-dia" className="font-sans text-sm font-light text-text cursor-pointer">
              Día completo
            </label>
          </div>

          {form.todoDia && (
            <div className="border border-accent p-4 flex flex-col gap-3">
              <p className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">¿A quién afecta?</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio" name="afecta" value="trabajadora"
                  checked={form.afecta === 'trabajadora'}
                  onChange={() => setForm((f) => ({ ...f, afecta: 'trabajadora' }))}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="font-sans text-sm font-light text-text">Una trabajadora ausente</p>
                  <p className="font-sans text-xs font-light text-text-muted mt-0.5">
                    El negocio sigue abierto con capacidad para 1 cita simultánea.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio" name="afecta" value="negocio"
                  checked={form.afecta === 'negocio'}
                  onChange={() => setForm((f) => ({ ...f, afecta: 'negocio' }))}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="font-sans text-sm font-light text-text">Negocio cerrado</p>
                  <p className="font-sans text-xs font-light text-text-muted mt-0.5">
                    Ambas trabajadoras ausentes. No se aceptan reservas ese día.
                  </p>
                </div>
              </label>
            </div>
          )}

          {!form.todoDia && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Desde</label>
                <input
                  type="time" required={!form.todoDia}
                  value={form.horaInicio}
                  onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
                  className="bg-surface border border-accent px-4 py-3 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Hasta</label>
                <input
                  type="time" required={!form.todoDia}
                  value={form.horaFin}
                  onChange={(e) => setForm((f) => ({ ...f, horaFin: e.target.value }))}
                  className="bg-surface border border-accent px-4 py-3 font-sans text-sm font-light text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">Motivo (opcional)</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              placeholder="Vacaciones, baja, formación..."
              className="bg-surface border border-accent px-4 py-3 font-sans text-sm font-light text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={guardando || !form.fecha}
            className="flex items-center justify-center gap-2 bg-primary text-white py-3 font-sans text-sm font-light tracking-widest uppercase hover:bg-primary-dark transition-colors disabled:bg-accent disabled:text-text-muted disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Bloquear horario
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-light text-text">Bloqueos activos</h2>
        {bloqueosFuturos.length === 0 ? (
          <div className="bg-white border border-accent p-8 text-center">
            <p className="font-sans text-sm font-light text-text-muted">No hay bloqueos programados</p>
          </div>
        ) : (
          bloqueosFuturos.map((b) => {
            const esCierre = b.afecta === 'negocio' || b.afecta === undefined
            return (
              <div key={b.id} className="bg-white border border-accent p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Ban size={16} className={`shrink-0 mt-0.5 ${esCierre ? 'text-red-400' : 'text-yellow-500'}`} />
                  <div>
                    <p className="font-sans text-sm font-medium text-text">{formatFecha(b.fecha)}</p>
                    <p className="font-sans text-xs font-light text-text-muted">
                      {b.horaInicio === 'todo-el-dia'
                        ? esCierre ? 'Negocio cerrado' : 'Trabajadora ausente (cap. 1)'
                        : `${b.horaInicio} – ${b.horaFin}`}
                    </p>
                    {b.motivo && (
                      <p className="font-sans text-xs font-light text-text-muted italic mt-0.5">{b.motivo}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => eliminar(b.id)}
                  className="text-text-muted hover:text-red-500 transition-colors shrink-0"
                  aria-label="Eliminar bloqueo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Vista Estadísticas ───────────────────────────────────
function VistaEstadisticas() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getBookingsAsync().then((b) => { setBookings(b); setCargando(false) })
  }, [])

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-sans text-sm font-light text-text-muted">Cargando estadísticas...</p>
      </div>
    )
  }

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const delMes        = bookings.filter((b) => b.fecha >= inicioMes && b.fecha <= finMes)
  const delMesActivas = delMes.filter((b) => b.estado !== 'cancelada')
  const canceladas    = delMes.filter((b) => b.estado === 'cancelada')
  const ingresosMes   = delMesActivas.reduce((sum, b) => sum + (b.importePagado ?? 0), 0)
  const clientasUnicas = new Set(
    bookings.filter((b) => b.estado !== 'cancelada').map((b) => b.clienteEmail)
  ).size

  const conteoServicios: Record<string, number> = {}
  bookings
    .filter((b) => b.estado !== 'cancelada')
    .forEach((b) => {
      b.servicios.forEach((id) => {
        conteoServicios[id] = (conteoServicios[id] ?? 0) + 1
      })
    })
  const topServicios = Object.entries(conteoServicios)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxConteo = topServicios[0]?.[1] ?? 1

  const KPI = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div className="bg-white border border-accent p-6 flex flex-col gap-2">
      <p className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">{label}</p>
      <p className="font-display text-4xl font-light text-text">{value}</p>
      {sub && <p className="font-sans text-xs font-light text-text-muted">{sub}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-light text-text mb-1">Resumen</h2>
        <p className="font-sans text-xs font-light text-text-muted tracking-widest uppercase">
          {MESES[hoy.getMonth()]} {hoy.getFullYear()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI
          label="Citas este mes"
          value={delMesActivas.length}
          sub={`${canceladas.length} cancelada${canceladas.length !== 1 ? 's' : ''}`}
        />
        <KPI
          label="Ingresos (señales)"
          value={`${ingresosMes}€`}
          sub="Señales cobradas online"
        />
        <KPI
          label="Clientas totales"
          value={clientasUnicas}
          sub="Emails únicos"
        />
        <KPI
          label="Tasa cancelación"
          value={delMes.length > 0 ? `${Math.round((canceladas.length / delMes.length) * 100)}%` : '—'}
          sub={`${delMes.length} citas recibidas`}
        />
      </div>

      {topServicios.length > 0 && (
        <div className="bg-white border border-accent p-6 flex flex-col gap-5">
          <h3 className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">
            Servicios más solicitados (histórico total)
          </h3>
          <div className="flex flex-col gap-3">
            {topServicios.map(([id, count]) => {
              const nombre = SERVICIOS.find((s) => s.id === id)?.nombre ?? id
              const pct = Math.round((count / maxConteo) * 100)
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="font-sans text-xs font-light text-text w-48 shrink-0 truncate">{nombre}</span>
                  <div className="flex-1 bg-surface h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs font-light text-text-muted w-8 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="bg-white border border-accent p-12 text-center">
          <p className="font-sans text-sm font-light text-text-muted">
            Aún no hay reservas registradas. Las estadísticas aparecerán aquí cuando lleguen las primeras citas.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────
type PanelVista = 'citas' | 'clientes' | 'bloqueos' | 'estadisticas'

export default function PanelPage() {
  const [vista, setVista] = useState<PanelVista>('citas')
  const [refreshKey, setRefreshKey] = useState(0)

  const logout = async () => {
    await fetch('/api/panel/logout', { method: 'POST' })
    window.location.href = '/panel/login'
  }

  const NAV: { key: PanelVista; label: string; icon: React.ReactNode }[] = [
    { key: 'citas',        label: 'Citas',         icon: <Calendar size={16} /> },
    { key: 'clientes',     label: 'Clientas',      icon: <Users size={16} /> },
    { key: 'bloqueos',     label: 'Bloqueos',      icon: <Clock size={16} /> },
    { key: 'estadisticas', label: 'Estadísticas',  icon: <BarChart2 size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-accent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="font-display text-xl font-light">
              <span className="text-primary">D</span>
              <span className="text-blue"> Bonita</span>
              <span className="font-sans text-xs font-light text-text-muted ml-2 tracking-widest uppercase">Panel</span>
            </h1>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setVista(n.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-sans text-xs font-light tracking-widest uppercase transition-all duration-200
                    ${vista === n.key ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-primary'}`}
                >
                  {n.icon}
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors"
            >
              <ExternalLink size={13} />
              Ver web
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 font-sans text-xs font-light text-text-muted hover:text-primary transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
        {/* Nav mobile — overflow-x-auto para 4 tabs */}
        <nav className="sm:hidden flex border-t border-accent overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setVista(n.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 font-sans text-[10px] font-light tracking-widest uppercase transition-all min-w-[64px]
                ${vista === n.key ? 'text-primary' : 'text-text-muted'}`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={vista}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {vista === 'citas'        && <VistaCitas onRefresh={() => setRefreshKey((k) => k + 1)} />}
            {vista === 'clientes'     && <VistaClientes key={refreshKey} />}
            {vista === 'bloqueos'     && <VistaBloqueos />}
            {vista === 'estadisticas' && <VistaEstadisticas />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
