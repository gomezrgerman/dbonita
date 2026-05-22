import { NextResponse } from 'next/server'

// ─── Rate limiting (in-memory, per-instance) ──────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutos

function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isBlocked(ip: string): boolean {
  const record = loginAttempts.get(ip)
  if (!record) return false
  if (Date.now() > record.resetAt) { loginAttempts.delete(ip); return false }
  return record.count >= MAX_ATTEMPTS
}

function recordFailure(ip: string): void {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    record.count++
  }
}

// ─── Token HMAC-SHA256 ─────────────────────────────────────
// Si PANEL_HMAC_SECRET está configurado usa HMAC (seguro).
// Si no, cae en SHA-256 puro (compatible con versiones anteriores).
async function computeToken(password: string): Promise<string> {
  const hmacSecret = process.env.PANEL_HMAC_SECRET
  const encoder = new TextEncoder()

  if (hmacSecret) {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(hmacSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode('dbonita-panel:' + password)
    )
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback legacy — añade PANEL_HMAC_SECRET en Vercel para mayor seguridad
  const data = encoder.encode('dbonita-panel:' + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: Request) {
  const ip = getClientIP(req)

  if (isBlocked(ip)) {
    return NextResponse.json(
      { ok: false, message: 'Demasiados intentos fallidos. Inténtalo en 15 minutos.' },
      { status: 429 }
    )
  }

  const { password } = await req.json()
  const correct = process.env.PANEL_PASSWORD

  if (!correct) {
    console.error('panel auth: PANEL_PASSWORD no configurada')
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  if (password === correct) {
    loginAttempts.delete(ip)
    const token = await computeToken(correct)
    const response = NextResponse.json({ ok: true })
    response.cookies.set('dbonita_panel', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  }

  recordFailure(ip)
  await new Promise((r) => setTimeout(r, 800))
  return NextResponse.json({ ok: false }, { status: 401 })
}
