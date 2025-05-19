import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Profiles tablosunun yapısını kontrol et
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('Error fetching profiles table info:', profilesError);
    } else {
      console.log('Profiles table structure:', profilesData && profilesData.length > 0 ? Object.keys(profilesData[0]) : 'No records');
    }

    // Diğer ilgili tabloların yapısını da kontrol et
    const tableNames = ['profiles', 'purchases', 'programs'];
    const tableInfo: Record<string, any> = {};

    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          tableInfo[tableName] = { error: error.message };
        } else {
          tableInfo[tableName] = {
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            sample: data && data.length > 0 ? data[0] : null
          };
        }
      } catch (error) {
        tableInfo[tableName] = { error: 'Table might not exist' };
      }
    }

    return NextResponse.json(
      { 
        message: 'Table information fetched',
        tables: tableInfo
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 