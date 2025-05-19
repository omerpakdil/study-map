import { NextRequest, NextResponse } from 'next/server';
import { getUserData, getServerSession } from '@/lib/supabase';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request cookies
    const authToken = request.cookies.get('sb-auth-token')?.value;
    const authStatus = request.cookies.get('auth-status')?.value;
    const userId = request.cookies.get('user-id')?.value;
    
    console.log('Session API - Cookie Check:', {
      hasAuthToken: !!authToken,
      hasAuthStatus: !!authStatus,
      hasUserId: !!userId,
      tokenLength: authToken ? authToken.length : 0,
    });
    
    // No token, return unauthenticated
    if (!authToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          reason: 'no_token',
          cookieCheck: {
            hasAuthStatus: !!authStatus,
            hasUserId: !!userId,
          }
        },
        { status: 200 }
      );
    }
    
    // Try to get user data with token param
    const user = await getUserData(authToken);
    
    if (!user) {
      return NextResponse.json(
        { 
          authenticated: false, 
          reason: 'invalid_user',
          error: 'No valid user'
        },
        { status: 200 }
      );
    }
    
    // Check session data with token param
    const session = await getServerSession(authToken);
    
    // User is authenticated, regardless of session status
    console.log('User is authenticated:', user.id);
    return NextResponse.json(
      { 
        authenticated: true,
        user: user,
        // Session bilgisi varsa ekle
        sessionExpires: session?.expires_at,
        hasValidSession: !!session
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session unexpected error:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'An unexpected error occurred',
        reason: 'server_error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 }
    );
  }
} 