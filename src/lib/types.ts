export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export interface Booking {
  id: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  servicios: string[]
  duracionMinutos: number
  fecha: string        // YYYY-MM-DD
  hora: string         // HH:MM
  notas: string
  estado: EstadoCita
  pagado: boolean
  importePagado: number
  creadoEn: string     // ISO timestamp
  canceladoEn?: string
}

export interface Cliente {
  email: string
  nombre: string
  telefono: string
  reservaIds: string[]
  creadoEn: string
}

export interface SlotBloqueado {
  id: string
  fecha: string        // YYYY-MM-DD
  horaInicio: string   // HH:MM — 'todo-el-dia' si es jornada completa
  horaFin: string      // HH:MM
  motivo: string
  creadoEn: string
  // 'negocio' → cierra el día entero (ambas ausentes)
  // 'trabajadora' → solo reduce capacidad en 1 (la otra sigue disponible)
  afecta?: 'negocio' | 'trabajadora'
}
