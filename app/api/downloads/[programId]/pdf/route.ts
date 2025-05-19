import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateRandomProgram } from "@/lib/dummy-data";
import puppeteer from 'puppeteer-core';
import { programCache } from "../../../program/[programId]/route";

// Node.js Runtime kullanacağımızı belirt
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Her istekte yeniden oluşturmak için

// Programı getiren fonksiyon (gerçek uygulamada API veya veritabanından)
const getProgramData = async (programId: string) => {
  // Önce önbellekte program var mı kontrol et
  if (programCache[programId]) {
    console.log(`Program ${programId} önbellekten alındı (PDF)`);
    return programCache[programId];
  }

  // Önbellekte yoksa API'den getirmeyi dene
  try {
    // Program oluşturma API'sine istek göndererek var olan programı alma
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/program/${programId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Eğer program bulunamazsa, dummy veri kullan
      console.log(`Program ID ${programId} bulunamadı, dummy veri kullanılıyor...`);
      return generateRandomProgram(programId);
    }
    
    const data = await response.json();
    return data.program;
  } catch (error) {
    console.error('Program verisi alınırken hata:', error);
    // Hata durumunda dummy veri kullan
    return generateRandomProgram(programId);
  }
};

// Programı HTML formatına dönüştür - Günlük sayfa yapısı
const generateProgramHtml = (program: any) => {
  // Tüm günleri düz bir diziye dönüştür
  const allDays = program.weeks.flatMap((week: any) => week.days);
  
  // Sınav tarihini Date nesnesine çevir
  const examDateObj = new Date(program.examDate);
  
  // Sadece sınav tarihinden önceki günleri filtrele
  const daysUntilExam = allDays.filter((day: any) => {
    const dayDate = new Date(day.date);
    return dayDate <= examDateObj;
  });
  
  // Gün sayısını hesapla
  const daysCount = daysUntilExam.length;
  
  // Her gün için HTML içeriği oluştur
  let pagesHTML = '';
  
  daysUntilExam.forEach((day: any, index: number) => {
    // Bu güne kadar geçen gün sayısı (program ilerlemesi)
    const progress = ((index + 1) / daysCount) * 100;
    
    // Sınava kalan gün sayısı
    const daysLeft = daysCount - index - 1;
    
    // Tarih formatlama
    const date = new Date(day.date);
    const formattedDate = new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    
    // API'de kullanmak için ISO formatında tarih (YYYY-MM-DD)
    const isoDate = day.date;
    
    // Günlük program sayfası URL'i
    const dailyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/program/day/${program.id}/${isoDate}`;
    
    // Dersleri HTML formatına dönüştür
    let subjectsHTML = '';
    
    if (day.subjects.length > 0) {
      day.subjects.forEach((subject: any) => {
        const topics = subject.topics.join(', ');
        
        // Renk kodu oluştur (basit hash)
        const hash = subject.name.split('').reduce((acc: number, char: string) => char.charCodeAt(0) + acc, 0);
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
        const color = colors[hash % colors.length];
        
        subjectsHTML += `
          <div class="task-item">
            <div class="checkbox"></div>
            <div class="task-content">
              <div class="task-header">
                <div class="subject-icon" style="background-color: ${color};">
                  ${subject.name.charAt(0).toUpperCase()}
                </div>
                <div class="task-name">${subject.name}</div>
              </div>
              <div class="task-topics">Konular: ${topics}</div>
              <div class="task-duration">Süre: ${subject.duration} dakika</div>
            </div>
          </div>
        `;
      });
    } else {
      subjectsHTML = `<div class="no-tasks">Bu gün için planlanmış çalışma bulunmamaktadır.</div>`;
    }
    
    // Sayfa HTML'i
    pagesHTML += `
      <div class="page">
        <div class="header">
          <h1>${program.title}</h1>
          <h2>${day.dayName}, ${formattedDate}</h2>
          <div class="countdown">Sınava Kalan Süre: ${daysLeft} Gün</div>
          
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
          
          <div class="daily-link">
            <a href="${dailyUrl}" target="_blank" class="program-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Günlük Programı İnteraktif Görüntüle
            </a>
          </div>
          
          <div class="info-box">
            <div class="info-item">
              <div class="info-label">Sınav Türü:</div>
              <div class="info-value">${program.examType}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Sınav Tarihi:</div>
              <div class="info-value">${new Intl.DateTimeFormat('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).format(new Date(program.examDate))}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">İlerleme:</div>
              <div class="info-value">%${Math.round(progress)}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Sayfa:</div>
              <div class="info-value">${index + 1} / ${daysCount}</div>
            </div>
          </div>
        </div>
        
        <div class="program-container">
          <h3 class="program-title">Günün Çalışma Programı</h3>
          ${subjectsHTML}
        </div>
        
        <div class="notes-section">
          <h3 class="notes-title">Notlar</h3>
          <div class="notes-content"></div>
        </div>
    
        <div class="footer">
          © ${new Date().getFullYear()} StudyMap. Bu program ${program.email} için oluşturulmuştur.
        </div>
        
        <div class="page-number">${index + 1} / ${daysCount}</div>
      </div>
    `;
  });
  
  // Ana HTML şablonu
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${program.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        
        .page {
          width: 210mm;
          height: 297mm;
          padding: 20mm;
          margin: 10mm auto;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          position: relative;
          page-break-after: always;
          box-sizing: border-box;
        }
        
        h1 {
          font-size: 24px;
          color: #7856FF;
          text-align: center;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        h2 {
          font-size: 18px;
          color: #3F3D56;
          text-align: center;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        h3 {
          font-size: 16px;
          color: #7856FF;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .countdown {
          font-size: 16px;
          color: #FF6384;
          text-align: center;
          margin-bottom: 12px;
          font-weight: bold;
        }
        
        .daily-link {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .program-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background-color: #7856FF;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          transition: background-color 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .program-link svg {
          margin-right: 8px;
        }
        
        .program-link:hover {
          background-color: #6545DB;
        }
        
        .progress-container {
          height: 8px;
          background-color: #E6E1FF;
          border-radius: 4px;
          margin-top: 5px;
          margin-bottom: 15px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 8px;
          background-color: #7856FF;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .info-box {
          background-color: #F5F5F5;
          padding: 12px;
          margin-top: 10px;
          margin-bottom: 20px;
          border-radius: 8px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .info-item {
          width: 48%;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-size: 12px;
          color: #666666;
          margin-bottom: 2px;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #333333;
        }
        
        .program-container {
          margin: 25px 0;
          border: 1px solid #E6E1FF;
          border-radius: 10px;
          padding: 20px;
          background-color: #FAFAFA;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        
        .program-title {
          text-align: center;
          margin-bottom: 20px;
          color: #7856FF;
          position: relative;
        }
        
        .program-title:after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background-color: #7856FF;
          border-radius: 2px;
        }
        
        .task-item {
          display: flex;
          margin-bottom: 16px;
          padding: 14px;
          background-color: white;
          border-radius: 8px;
          border-left: 4px solid #7856FF;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #7856FF;
          border-radius: 4px;
          margin-right: 12px;
          margin-top: 2px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .checkbox:hover {
          background-color: rgba(120, 86, 255, 0.1);
        }
        
        .task-content {
          flex: 1;
        }
        
        .task-header {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .subject-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .task-name {
          font-size: 16px;
          font-weight: 600;
          color: #3F3D56;
        }
        
        .task-topics {
          font-size: 13px;
          color: #666666;
          margin-bottom: 4px;
          padding-left: 38px;
        }
        
        .task-duration {
          font-size: 12px;
          color: #7856FF;
          font-weight: 500;
          padding-left: 38px;
        }
        
        .no-tasks {
          font-size: 15px;
          color: #666666;
          font-style: italic;
          text-align: center;
          padding: 30px;
        }
        
        .notes-section {
          margin-top: 25px;
          padding: 16px;
          background-color: #F9F9F9;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .notes-title {
          margin-bottom: 12px;
          color: #3F3D56;
          position: relative;
        }
        
        .notes-title:after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 40px;
          height: 2px;
          background-color: #7856FF;
          border-radius: 1px;
        }
        
        .notes-content {
          min-height: 120px;
          border: 1px dashed #CCCCCC;
          border-radius: 6px;
          padding: 12px;
          background-color: white;
        }
        
        .footer {
          position: absolute;
          bottom: 20mm;
          left: 20mm;
          right: 20mm;
          font-size: 11px;
          text-align: center;
          color: #999999;
          border-top: 1px solid #e0e0e0;
          padding-top: 10px;
        }
        
        .page-number {
          position: absolute;
          bottom: 20mm;
          right: 20mm;
          font-size: 11px;
          color: #777777;
          font-weight: 500;
        }
        
        @media print {
          body {
            background-color: white;
          }
          
          .page {
            margin: 0;
            box-shadow: none;
          }
          
          .page:not(:last-child) {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      ${pagesHTML}
    </body>
    </html>
  `;
};

// Chrome Executable Path - Chrome binarylerinin yolu
async function getBrowserInstance() {
  // Mac OS için Chrome yolu
  const isMacOS = process.platform === 'darwin';
  if (isMacOS) {
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    ];
    
    console.log("MacOS için Chrome yolu kullanılacak");
    
    return puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      executablePath: process.env.CHROME_PATH || possiblePaths[0]
    });
  }

  // Diğer işletim sistemleri için (Linux, Windows)
  console.log("Varsayılan Chrome yolu kullanılacak");
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_PATH || 
      (process.platform === 'win32' 
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
        : '/usr/bin/google-chrome'),
    headless: true,
  });
}

// HEAD isteği için yanıt (özellikle download için kullanılır)
export async function HEAD(
  request: Request,
  { params: paramsPromise }: { params: { programId: string } }
) {
  return new Response(null, { status: 200 });
}

// GET isteği için yanıt
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: { programId: string } }
) {
  try {
    // Params objesinin kendisini bekle
    const params = await paramsPromise;
    const programId = params.programId;
    
    if (!programId) {
      return new Response("Program ID eksik veya geçersiz", { 
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }

    console.log(`PDF oluşturma başladı: ${programId}`);

    // Program verisini getir
    const program = await getProgramData(programId);
    
    if (!program) {
      return new Response("Program bulunamadı", {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }
    
    console.log(`Program verisi alındı. PDF oluşturuluyor...`);

    try {
      // Program HTML'ini oluştur
      const htmlContent = generateProgramHtml(program);
      
      // Puppeteer ile PDF oluştur
      let browser = null;
      try {
        browser = await getBrowserInstance();
        const page = await browser.newPage();
        
        // Viewport'u A4 boyutuna ayarla
        await page.setViewport({
          width: 794, // A4 genişliği (px)
          height: 1123, // A4 yüksekliği (px)
          deviceScaleFactor: 1.5
        });
        
        // HTML içeriğini sayfaya yükle
        await page.setContent(htmlContent, { 
          waitUntil: 'networkidle0' 
        });
        
        // PDF'i oluştur
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        
        console.log(`PDF oluşturuldu. Boyut: ${pdfBuffer.length} bytes`);
        
        // PDF'i binary olarak döndür
        return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(program.title)}.pdf"`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
        });
      } finally {
        if (browser) {
          await browser.close();
          console.log('Browser kapatıldı');
        }
      }
    } catch (pdfError) {
      console.error("PDF oluşturma hatası:", pdfError);
      
      // Hata olmasa bile PDF oluşturulamazsa, düz HTML sayfası döndür
      const htmlContent = generateProgramHtml(program);
      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }
  } catch (error) {
    console.error("İşlem hatası:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Genel hata sayfası
    const errorHTML = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İşlem Hatası</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .error-container {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 5px;
            padding: 20px;
            margin: 40px 0;
          }
          h1 {
            color: #e53e3e;
            margin-top: 0;
          }
          .error-details {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 10px;
            font-family: monospace;
            overflow-x: auto;
            margin-top: 20px;
          }
          .back-button {
            display: inline-block;
            background-color: #7c3aed;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>İşlem Hatası</h1>
          <p>
            İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin veya 
            sistem yöneticisi ile iletişime geçin.
          </p>
          <div class="error-details">
            <strong>Hata Mesajı:</strong><br>
            ${errorMessage}
          </div>
          <a href="/" class="back-button">Ana Sayfaya Dön</a>
        </div>
      </body>
      </html>
    `;
    
    return new Response(errorHTML, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }
} 