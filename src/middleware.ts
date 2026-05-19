import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (process.env.SITE_ENABLED === 'true') return NextResponse.next()

  const { pathname } = request.nextUrl
  if (pathname.startsWith('/proximamente')) return NextResponse.next()

  return NextResponse.redirect(new URL('/proximamente', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
}
