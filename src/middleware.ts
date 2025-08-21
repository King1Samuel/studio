
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
 
  // If no session and trying to access a protected route, redirect to login
  if (!session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
 
  // If session exists and trying to access login/signup, redirect to home
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/', '/login', '/signup'],
}
