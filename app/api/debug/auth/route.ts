import { NextRequest, NextResponse } from 'next/server';
import { getUserData, getServerSession, createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Tüm cookie'leri listele
    const cookieStore = request.cookies;
    const cookieNames: string[] = [];
    cookieStore.getAll().forEach(cookie => {
      cookieNames.push(cookie.name);
    });
    
    // Auth token cookie'sini kontrol et
    const authToken = cookieStore.get('sb-auth-token')?.value;
    
    // Oturum bilgisini al (tokeni parametre olarak ver)
    const session = authToken ? await getServerSession(authToken) : null;
    
    // Kullanıcı bilgisini al (tokeni parametre olarak ver)
    const user = authToken ? await getUserData(authToken) : null;
    
    // Supabase client üzerinden aktif oturumu al
    const supabase = await createServerSupabaseClient(authToken || undefined);
    const { data: supabaseSession } = await supabase.auth.getSession();
    
    return NextResponse.json({
      debug: true,
      cookieCount: cookieStore.getAll().length,
      hasAuthTokenCookie: !!authToken,
      authTokenValue: authToken ? `${authToken.substring(0, 10)}...` : null,
      sessionExists: !!session,
      sessionData: session ? {
        expires: session.expires_at,
        userId: session.user.id,
      } : null,
      userExists: !!user,
      userData: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      } : null,
      supabaseSessionExists: !!supabaseSession?.session,
      supabaseSessionData: supabaseSession?.session ? {
        expires: supabaseSession.session.expires_at,
        userId: supabaseSession.session.user.id
      } : null,
      allCookieNames: cookieNames
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      debug: true,
      error: true,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : null
    });
  }
} 