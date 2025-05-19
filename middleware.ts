import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/supabase';

// Define routes that require authentication
const protectedRoutes = ['/profile', '/program/create'];

export async function middleware(request: NextRequest) {
  // Get the path of the current request
  const path = request.nextUrl.pathname;

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // Get session using server-side Supabase client
    const session = await getServerSession();

    // Redirect to login if session doesn't exist
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match any request path except for static files, api routes, etc.
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
}; 