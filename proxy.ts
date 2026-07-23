import { NextRequest, NextResponse } from 'next/server'
import { decryptSession, SESSION_COOKIE } from '@/lib/session'

const PUBLIC_ROUTES = ['/login']
const ADMIN_ONLY_ROUTES = ['/reports', '/settings']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = decryptSession(request.cookies.get(SESSION_COOKIE)?.value)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/orders', request.url))
  }

  if (session && session.role !== 'admin' && ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/orders', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
