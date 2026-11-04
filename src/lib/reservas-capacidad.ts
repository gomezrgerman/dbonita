import { NUM_PERSONAL } from './constants'

// Cuántas citas caben a la vez. Sin dependencias de servidor:
// lo usan el calendario del navegador y las rutas API.
//
// Reglas del estudio (2 trabajadoras):
//  - Hasta 2 citas a la vez, una por trabajadora.
//  - Una tercera cita solo si es "solo cejas": mientras actúa el producto
//    la misma trabajadora puede atender a otra clienta.
//  - Los corporales solo los hace Valeria: nunca dos a la vez.

export type TipoCita = 'normal' | 'cejas' | 'corporal'
export type TipoBloqueo = 'cierre' | 'trabajadora'

export interface RangoOcupado {
  inicio: number
  fin: number
  tipo: TipoCita | TipoBloqueo
}

const SERVICIOS_CEJAS = new Set(['laminado-cejas', 'tinte-cejas', 'cejas-cera', 'cejas-hilo'])
const SERVICIOS_CORPORALES = new Set(['maderoterapia', 'drenaje-linfatico', 'corporal-personalizado'])

export function tipoDeServicios(servicios: string[]): TipoCita {
  if (servicios.some((id) => SERVICIOS_CORPORALES.has(id))) return 'corporal'
  if (servicios.length > 0 && servicios.every((id) => SERVICIOS_CEJAS.has(id))) return 'cejas'
  return 'normal'
}

function cabeEnInstante(activos: RangoOcupado['tipo'][]): boolean {
  if (activos.includes('cierre')) return false
  const plazas = NUM_PERSONAL - activos.filter((t) => t === 'trabajadora').length
  if (plazas <= 0) return false
  const citas = activos.filter((t) => t !== 'trabajadora')
  const noCejas = citas.filter((t) => t !== 'cejas').length
  const corporales = citas.filter((t) => t === 'corporal').length
  return noCejas <= plazas && citas.length <= plazas + 1 && corporales <= 1
}

/** ¿Cabe una cita nueva de [inicio, fin) con lo que ya hay ocupado ese día? */
export function cabeEnHueco(
  ocupado: RangoOcupado[],
  inicio: number,
  fin: number,
  tipo: TipoCita
): boolean {
  const solapados = ocupado.filter((o) => inicio < o.fin && fin > o.inicio)
  // La ocupación máxima siempre se alcanza al empezar alguna cita
  const instantes = [inicio, ...solapados.map((o) => o.inicio).filter((t) => t > inicio && t < fin)]
  return instantes.every((t) =>
    cabeEnInstante([tipo, ...solapados.filter((o) => o.inicio <= t && t < o.fin).map((o) => o.tipo)])
  )
}
