import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase, createProfile } from '@/lib/supabase';

// Schema for validating request body
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Get the site URL for the email redirect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (request.headers.get('origin') || 'http://localhost:3000');
    
    // Register the user with Supabase with email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
        // Where to redirect after email confirmation
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create profile record in profiles table
    if (data.user?.id) {
      try {
        console.log("Creating profile for user:", data.user.id);
        await createProfile(data.user.id, { 
          name: name || '', 
          email 
        });
        console.log("Profile created successfully!");
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, as the user was created successfully
      }
    }

    return NextResponse.json(
      { 
        message: 'Registration successful. Please check your email for confirmation.',
        user: data.user,
        emailConfirmation: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 