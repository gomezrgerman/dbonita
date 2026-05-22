'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations } from './translations'

export type Lang = 'es' | 'en'

type T = typeof translations.es

interface LangCtxType {
  lang: Lang
  setLang: (l: Lang) => void
  t: T
}

const LangCtx = createContext<LangCtxType>({
  lang: 'es',
  setLang: () => {},
  t: translations.es,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    const saved = localStorage.getItem('dbonita_lang') as Lang | null
    if (saved === 'es' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('dbonita_lang', l)
  }

  return (
    <LangCtx.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang() {
  return useContext(LangCtx)
}
