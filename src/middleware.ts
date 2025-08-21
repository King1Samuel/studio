
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No-op middleware, allows all requests to pass through.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/recommendations'],
};
