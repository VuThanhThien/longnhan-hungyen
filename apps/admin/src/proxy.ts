import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_KEY, parseAuthTokens } from '@/lib/auth-token';

export function proxy(request: NextRequest) {
  const parsedAuth = parseAuthTokens(request.cookies.get(AUTH_TOKEN_KEY)?.value);
  const accessToken =
    (parsedAuth?.tokenExpires && parsedAuth.tokenExpires > Date.now() ? parsedAuth.accessToken : undefined) ||
    request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!accessToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (accessToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|api|favicon.ico).*)'] };
