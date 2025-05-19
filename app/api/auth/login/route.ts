import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase, createProfile } from '@/lib/supabase';

// Schema for validating request body
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error from Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Check if a profile exists for this user, create one if not
    if (data.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        // Profile doesn't exist, create one
        try {
          console.log("No profile found for user:", data.user.id, "Creating one now.");
          await createProfile(data.user.id, { 
            email: data.user.email || '', 
            name: data.user.user_metadata?.name || ''
          });
          console.log("Profile created successfully during login!");
        } catch (createProfileError) {
          console.error('Error creating profile during login:', createProfileError);
          // Continue anyway, as the user was authenticated successfully
        }
      } else {
        console.log("Existing profile found for user:", data.user.id);
      }
    }

    // Response with cookies
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: data.user,
        success: true,
        session: data.session ? {
          expires_at: data.session.expires_at
        } : null
      },
      { status: 200 }
    );

    if (data.session?.access_token) {
      // Set auth token cookie
      response.cookies.set({
        name: 'sb-auth-token',
        value: data.session.access_token,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      });

      // Set non-httpOnly flag cookie for client-side auth check
      response.cookies.set({
        name: 'auth-status',
        value: 'true',
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      });

      // Set user ID cookie for client-side identification
      response.cookies.set({
        name: 'user-id',
        value: data.user?.id || '',
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      });

      console.log('Auth cookies set in response');
    } else {
      console.error('No access token in session data!');
    }

    // Ensure correct headers for cookie handling
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Login unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 