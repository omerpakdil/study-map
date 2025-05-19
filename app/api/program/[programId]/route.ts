import { NextResponse } from "next/server";
import { generateRandomProgram } from "@/lib/dummy-data";

// Node.js Runtime kullanacağımızı belirt
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Her istekte yeniden oluşturmak için

// Geçici önbellek (gerçek uygulamada Redis veya veritabanı kullanılmalı)
export let programCache: Record<string, any> = {};

// Programı getiren fonksiyon
export async function GET(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    const programId = params.programId;
    
    if (!programId) {
      return NextResponse.json(
        { error: "Program ID gereklidir" },
        { status: 400 }
      );
    }
    
    // Önbellekten programı getir
    const cachedProgram = programCache[programId];
    
    // Programı önbellekte var mı kontrol et
    if (cachedProgram) {
      return NextResponse.json({ program: cachedProgram });
    }
    
    // Program önbellekte yoksa, demo program oluştur
    const demoProgram = {
      id: programId,
      title: "YKS Hazırlık Programı",
      examType: "YKS",
      examDate: "2024-06-15",
      startDate: "2023-09-01",
      weeks: [
        {
          id: "week-1",
          name: "1. Hafta",
          days: [
            {
              id: "day-1",
              date: "2023-09-01",
              subjects: [
                { name: "Matematik", topics: ["Sayılar", "Üslü Sayılar"], duration: 120 },
                { name: "Türkçe", topics: ["Paragraf", "Dil Bilgisi"], duration: 90 }
              ]
            },
            {
              id: "day-2",
              date: "2023-09-02",
              subjects: [
                { name: "Fizik", topics: ["Kuvvet", "Hareket"], duration: 90 },
                { name: "Kimya", topics: ["Atomlar", "Bağlar"], duration: 90 }
              ]
            }
          ]
        }
      ]
    };
    
    // Demo programı önbelleğe ekle
    programCache[programId] = demoProgram;
    
    return NextResponse.json({ program: demoProgram });
  } catch (error) {
    console.error("Program alınırken hata oluştu:", error);
    return NextResponse.json(
      { error: "Program yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Programı sil
export async function DELETE(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    const programId = params.programId;

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID gereklidir" },
        { status: 400 }
      );
    }
    
    // Önbellekten programı sil
    if (programCache[programId]) {
      delete programCache[programId];
    } else {
      return NextResponse.json(
        { error: "Program bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Program başarıyla silindi", 
      programId 
    });
  } catch (error) {
    console.error("Program silinirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Program silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Program oluşturma API'sinden gelen verileri önbelleğe ekleyen fonksiyon
export async function POST(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    const programId = params.programId;
    
    if (!programId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Program ID belirtilmedi' 
        }, 
        { status: 400 }
      );
    }
    
    // Request'ten program verisini al
    const body = await request.json();
    const { program } = body;
    
    if (!program) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Program verisi bulunamadı' 
        }, 
        { status: 400 }
      );
    }
    
    // Programı önbelleğe ekle
    programCache[programId] = program;
    
    // Başarılı cevap
    return NextResponse.json({
      success: true,
      message: 'Program başarıyla kaydedildi'
    });
    
  } catch (error: any) {
    console.error('Program kaydetme hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Program kaydedilirken bir hata oluştu.' 
      }, 
      { status: 500 }
    );
  }
} 