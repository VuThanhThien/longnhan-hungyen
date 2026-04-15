import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Next.js 16+ edge entry (formerly middleware). Keep matcher tight so static
 * assets and RSC payloads skip this layer.
 */
export function proxy(request: NextRequest) {
  void request.nextUrl;
  const res = NextResponse.next();

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|monitoring|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|ttf)$).*)',
  ],
};
