import { cookies } from 'next/headers';

// Function to set cookie
export const setCookie = async (name: string, value: string, options: any = {}) => {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week by default
    ...options,
  });
};

// Function to get cookie
export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name);
};

// Function to delete cookie
export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
};

// Function to set auth cookie
export const setAuthCookie = async (token: string) => {
  if (!token || token.length === 0) {
    console.error('setAuthCookie çağrıldı fakat token boş!');
    return;
  }
  
  try {
    console.log(`Auth cookie ayarlanıyor. Token uzunluğu: ${token.length}`);
    
    const cookieStore = await cookies();
    cookieStore.set('sb-auth-token', token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
    });
    
    // Ayrıca client-side kullanım için bir flag cookie oluştur
    cookieStore.set('auth-status', 'true', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: false,
    });
    
    console.log('Auth cookie başarıyla ayarlandı');
  } catch (error) {
    console.error('Auth cookie ayarlanırken hata oluştu:', error);
  }
};

// Function to get auth token
export const getAuthToken = async () => {
  const cookie = await getCookie('sb-auth-token');
  return cookie?.value ? cookie : null;
};

// Function to clear auth cookie
export const clearAuthCookie = async () => {
  await deleteCookie('sb-auth-token');
  await deleteCookie('auth-status');
}; 