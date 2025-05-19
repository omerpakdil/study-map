import { NextResponse } from "next/server";
import { ExamType, generateStudyProgram } from "@/lib/program-generator";
import { v4 as uuidv4 } from "uuid";
import { addDays } from "date-fns";

// Node.js Runtime kullanacağımızı belirt (PDF oluşturma için gerekli)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Her istekte yeniden oluşturmak için

// Geçici program önbelleği (modül kapsamında tutulur)
// Bu dış modül kapsamında bir değişken olarak programCache'i tutarak
// API'ler arasında veri paylaşımı sağlanır
import { programCache } from "../[programId]/route";

// Programı oluşturan fonksiyon
export async function POST(request: Request) {
  try {
    // İstem gövdesini parse et
    const body = await request.json();
    const {
      examType,
      examDate,
      studentName,
      email,
      topicRatings = {},
      subjectPriorities = [],
      dailyStudyHours = 3,
      weekendStudyHours = 4,
      includeBreaks = true
    } = body;
    
    // Gerekli alanları kontrol et
    if (!examType || !examDate) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sınav türü ve sınav tarihi zorunludur.' 
        }, 
        { status: 400 }
      );
    }
    
    // Geçerli bir ExamType mi kontrol et
    if (!Object.values(ExamType).includes(examType as ExamType)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz sınav türü.' 
        }, 
        { status: 400 }
      );
    }
    
    // Sınav tarihini Date objesine çevir
    const examDateObj = new Date(examDate);
    
    // Sınav tarihi geçmiş mi kontrol et
    if (examDateObj < new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sınav tarihi gelecekte olmalıdır.' 
        }, 
        { status: 400 }
      );
    }
    
    // Programın benzersiz ID'sini oluştur
    const programId = uuidv4();
    
    // Başlangıç tarihini bugün olarak ayarla
    const startDate = new Date();
    
    // Kişiselleştirilmiş programı oluştur
    const program = generateStudyProgram({
      id: programId,
      examType: examType as ExamType,
      examDate: examDateObj,
      startDate,
      studentName: studentName || "Adsız Öğrenci",
      email: email || "",
      topicRatings,
      subjectPriorities,
      dailyStudyHours,
      weekendStudyHours,
      includeBreaks
    });
    
    // Programı önbelleğe kaydet
    programCache[programId] = program;
    console.log(`Program ${programId} önbelleğe kaydedildi (${program.examType})`);
    
    // Başarılı cevap
    return NextResponse.json({
      success: true,
      programId,
      program
    });
    
  } catch (error: any) {
    console.error('Program oluşturma hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Program oluşturulurken bir hata oluştu.' 
      }, 
      { status: 500 }
    );
  }
} 