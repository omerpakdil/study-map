import { NextRequest, NextResponse } from 'next/server';
import { getUserData, createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get('sb-auth-token')?.value;
    
    if (!authToken) {
      console.error('API: Token bulunamadı');
      return NextResponse.json(
        { error: 'Unauthorized', reason: 'missing_token' },
        { status: 401 }
      );
    }
    
    // Get user with token
    const user = await getUserData(authToken);
    
    if (!user) {
      console.error('API: Token var ancak kullanıcı bilgisi bulunamadı');
      return NextResponse.json(
        { error: 'Unauthorized', reason: 'invalid_user' },
        { status: 401 }
      );
    }

    console.log(`${user.id} kullanıcısı için programlar getiriliyor`);
    
    // Create supabase client with token
    const supabase = await createServerSupabaseClient(authToken);
    
    // İlk olarak, tabloyu ve sütunları keşfetmek için bir deneme yapalım
    try {
      console.log('Tablo şemasını keşfediyorum...');
      // Önce bir programı (sütun adlarını görmek için) getirelim
      const { data: sampleProgram, error: sampleError } = await supabase
        .from('programs')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Örnek program alınamadı:', sampleError);
      } else if (sampleProgram && sampleProgram.length > 0) {
        console.log('Bulunan program sütunları:', Object.keys(sampleProgram[0]));
        
        // Kullanıcı ID için olası sütun adları
        const possibleUserIdColumns = ['user_id', 'userId', 'created_by', 'createdBy', 'owner_id', 'ownerId', 'user'];
        
        // Hangi sütunun var olduğunu kontrol et
        const userIdColumn = possibleUserIdColumns.find(colName => 
          Object.keys(sampleProgram[0]).includes(colName)
        );
        
        if (userIdColumn) {
          console.log(`Kullanıcı ID sütunu bulundu: ${userIdColumn}`);
          
          // Bu sütun adıyla programları getir
          const { data: programs, error } = await supabase
            .from('programs')
            .select('*')
            .eq(userIdColumn, user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error(`${userIdColumn} sütunuyla programlar alınırken hata oluştu:`, error);
            return NextResponse.json(
              { error: 'Failed to fetch programs', details: error.message },
              { status: 500 }
            );
          }
          
          console.log(`${programs?.length || 0} program bulundu`);
          return NextResponse.json({ programs });
        } else {
          console.log('Kullanıcı ID sütunu bulunamadı. Tüm programları getiriyorum...');
          
          // Kullanıcı ID sütunu bulunamadıysa, tüm programları getir (test için)
          const { data: allPrograms, error: allError } = await supabase
            .from('programs')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (allError) {
            console.error('Tüm programlar alınırken hata oluştu:', allError);
            return NextResponse.json(
              { error: 'Failed to fetch any programs', details: allError.message },
              { status: 500 }
            );
          }
          
          console.log(`Toplam ${allPrograms?.length || 0} program bulundu (filtrelenmemiş)`);
          return NextResponse.json({ programs: allPrograms });
        }
      } else {
        console.log('Programlar tablosunda kayıt bulunamadı');
        return NextResponse.json({ programs: [] });
      }
    } catch (schemaError) {
      console.error('Tablo şeması keşfedilirken hata oluştu:', schemaError);
    }
    
    // Standart sorgu ile devam et (şema keşfi başarısız olursa)
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Programlar alınırken hata oluştu:', error);
      return NextResponse.json(
        { error: 'Failed to fetch programs', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`Toplam ${programs?.length || 0} program bulundu (filtresiz)`);
    return NextResponse.json({ programs });
    
  } catch (error) {
    console.error('Program API unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 