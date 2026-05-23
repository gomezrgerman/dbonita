import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mismo algoritmo que auth/route.ts — HMAC si PANEL_HMAC_SECRET está configurado,
// SHA-256 puro como fallback para compatibilidad.
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

  const data = encoder.encode('dbonita-panel:' + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPanelCookie(request: NextRequest): Promise<boolean> {
  const cookieValue = request.cookies.get('dbonita_panel')?.value
  const secret = process.env.PANEL_PASSWORD
  if (!secret || !cookieValue) return false
  const expected = await computeToken(secret)
  return cookieValue === expected
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Panel — protección por cookie httpOnly (independiente de SITE_ENABLED)
  if (pathname.startsWith('/panel')) {
    if (pathname.startsWith('/panel/login')) return NextResponse.next()
    const authenticated = await verifyPanelCookie(request)
    if (!authenticated) {
      return NextResponse.redirect(new URL('/panel/login', request.url))
    }
    return NextResponse.next()
  }

  // Rutas de panel API que requieren autenticación
  if (pathname.startsWith('/api/panel/') &&
      !pathname.startsWith('/api/panel/auth') &&
      !pathname.startsWith('/api/panel/logout')) {
    const authenticated = await verifyPanelCookie(request)
    if (!authenticated) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.next()
  }

  // Las rutas API nunca se bloquean por SITE_ENABLED
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // SITE_ENABLED gate para el sitio público
  if (process.env.SITE_ENABLED === 'true') return NextResponse.next()

  // Preview bypass — ?preview=TOKEN activa cookie y permite ver la web real
  const previewToken = process.env.PREVIEW_TOKEN
  if (previewToken) {
    const paramToken = request.nextUrl.searchParams.get('preview')
    if (paramToken === previewToken) {
      const dest = new URL(pathname, request.url)
      const res = NextResponse.redirect(dest)
      res.cookies.set('dbonita_preview', previewToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return res
    }
    if (request.cookies.get('dbonita_preview')?.value === previewToken) {
      return NextResponse.next()
    }
  }

  if (pathname.startsWith('/proximamente')) return NextResponse.next()
  return NextResponse.redirect(new URL('/proximamente', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
}
