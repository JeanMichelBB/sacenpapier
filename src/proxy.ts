import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? request.nextUrl.hostname

  const knownSubdomains = ['www', 'x', 'poproom', 'botwhy', 'apercu']

  // Redirect unknown subdomains to the main site
  if (hostname.endsWith('.sacenpapier.org')) {
    const subdomain = hostname.replace('.sacenpapier.org', '')
    if (!knownSubdomains.includes(subdomain)) {
      return NextResponse.redirect(
        `https://sacenpapier.org?notfound=${encodeURIComponent(subdomain)}`,
        { status: 302 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
