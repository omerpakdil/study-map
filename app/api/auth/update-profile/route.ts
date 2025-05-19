import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, getUserData } from '@/lib/supabase';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getUserData();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = profileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    // Update user profile
    await updateUserProfile(user.id, {
      name: result.data.name,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 