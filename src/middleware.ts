
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This middleware is currently not enforcing any routes and is just a placeholder.
// In a real application, you would add logic here
// to protect routes based on the presence and validity of a session token.
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // If no session cookie, and trying to access a protected page, redirect to login
  if (!session && request.nextUrl.pathname.startsWith('/')) {
     if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
         return NextResponse.next();
     }
     // Redirect to login for any other page if not authenticated.
     // return NextResponse.redirect(new URL('/login', request.url));
  }
 
  // If there is a session, and they are trying to access login/signup, redirect to home
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
 
export const config = {
  // This matcher applies the middleware to all routes except for the API routes,
  // static files, and image optimization routes.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
