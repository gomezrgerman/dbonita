import { NextResponse } from 'next/server'

async function computeToken(secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode('dbonita-panel:' + secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.PANEL_PASSWORD

  if (!correct) {
    console.error('panel auth: PANEL_PASSWORD no configurada')
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  if (password === correct) {
    const token = await computeToken(correct)
    const response = NextResponse.json({ ok: true })
    response.cookies.set('dbonita_panel', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })
    return response
  }

  await new Promise((r) => setTimeout(r, 800))
  return NextResponse.json({ ok: false }, { status: 401 })
}
