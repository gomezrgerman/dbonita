'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ConsentStatus = 'accepted' | 'rejected' | null

interface ConsentCtx {
  consent: ConsentStatus
  accept: () => void
  reject: () => void
}

const ConsentContext = createContext<ConsentCtx>({
  consent: null,
  accept: () => {},
  reject: () => {},
})

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentStatus>(null)

  useEffect(() => {
    const saved = localStorage.getItem('dbonita_cookies_consent') as ConsentStatus | null
    if (saved === 'accepted' || saved === 'rejected') setConsent(saved)
  }, [])

  const accept = () => {
    localStorage.setItem('dbonita_cookies_consent', 'accepted')
    setConsent('accepted')
  }

  const reject = () => {
    localStorage.setItem('dbonita_cookies_consent', 'rejected')
    setConsent('rejected')
  }

  return (
    <ConsentContext.Provider value={{ consent, accept, reject }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useCookieConsent() {
  return useContext(ConsentContext)
}
