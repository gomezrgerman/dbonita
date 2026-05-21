'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PanelLoginPage() {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await fetch('/api/panel/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      })
      if (res.ok) {
        router.push('/panel')
      } else {
        setError(true)
        setPass('')
      }
    } catch {
      setError(true)
      setPass('')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-8"
      >
        <div>
          <h1 className="font-display text-4xl font-light text-text">
            <span className="text-primary">D</span>
            <span className="text-blue"> Bonita</span>
          </h1>
          <p className="font-sans text-sm font-light text-text-muted mt-1">Panel de administración</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-sans text-xs font-light tracking-widest uppercase text-text-muted">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type="password"
                autoFocus
                required
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(false) }}
                className={`w-full bg-surface border px-4 py-3 pl-10 font-sans text-sm font-light text-text focus:outline-none transition-colors duration-200 ${
                  error ? 'border-red-300 focus:border-red-400' : 'border-accent focus:border-primary'
                }`}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="font-sans text-xs font-light text-red-500">Contraseña incorrecta</p>
            )}
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="bg-primary text-white py-3 font-sans text-sm font-light tracking-widest uppercase hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
