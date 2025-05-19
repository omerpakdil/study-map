import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Authentication features may not work properly.');
}

// Create a Supabase client for server components with auth token (if available)
export const createServerSupabaseClient = async (token?: string) => {
  try {
    // Eğer token parametre olarak verilmişse kullan
    if (token) {
      console.log('Verilen token ile Client oluşturuluyor');
      
      // Client'ı token ile oluştur
      return createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });
    }
    
    console.log('Token bulunamadı, Anonim client oluşturuluyor');
    
    // Anonim client oluştur
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    });
  } catch (error) {
    console.error('Server supabase client oluşturulurken hata:', error);
    
    // Hata durumunda temel client oluştur
    return createClient(supabaseUrl, supabaseKey);
  }
};

// Regular Supabase client for client components
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get user session (server-side)
export const getServerSession = async (token?: string) => {
  try {
    // Client'ı oluştur
    const serverClient = await createServerSupabaseClient(token);
    
    // Oturum bilgisini al
    const { data, error } = await serverClient.auth.getSession();
    
    if (error) {
      console.error('Session alınırken hata:', error);
      return null;
    }
    
    if (!data.session) {
      console.log('Geçerli oturum bulunamadı');
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('getServerSession fonksiyonunda beklenmeyen hata:', error);
    return null;
  }
};

// Function to get user data (server-side)
export const getUserData = async (token?: string) => {
  try {
    // Client'ı oluştur
    const serverClient = await createServerSupabaseClient(token);
    
    // Kullanıcı bilgisini al
    const { data, error } = await serverClient.auth.getUser();
    
    if (error) {
      console.error('Kullanıcı bilgisi alınırken hata:', error);
      return null;
    }
    
    if (!data.user) {
      console.log('Kullanıcı bulunamadı');
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('getUserData fonksiyonunda beklenmeyen hata:', error);
    return null;
  }
};

// Function to get user data (client-side)
export const getClientUserData = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user data (client):', error);
    return null;
  }
  
  return data.user;
};

// Function to update user profile
export const updateUserProfile = async (userData: { name: string }) => {
  const { error } = await supabase.auth.updateUser({
    data: userData
  });

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return true;
};

// Function to create profile in profiles table
export const createProfile = async (userId: string, userData: { name?: string, email: string }) => {
  // First, let's check the structure of the profiles table
  const { data: tableInfo, error: tableError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  // Prepare the profile data based on table columns
  const profileData: Record<string, any> = {
    id: userId,
    email: userData.email,
    name: userData.name || '',
  };
  
  // Only add created_at if not already in table structure
  if (!tableInfo || !tableInfo[0] || !tableInfo[0].created_at) {
    profileData.created_at = new Date().toISOString();
  }
  
  // Perform the upsert operation
  const { error } = await supabase
    .from('profiles')
    .upsert([profileData], { onConflict: 'id' });

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return true;
};

export default supabase; 