import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function generateId(): string {
  // Edge runtime supports global crypto.randomUUID()
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  // Fallback lightweight RFC4122 v4-ish generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Middleware adds a stable x-request-id header if not present.
 * This ID can then be used in logging for correlation across layers.
 */
export function middleware(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') || generateId();
  const response = NextResponse.next();
  response.headers.set('x-request-id', reqId);
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
