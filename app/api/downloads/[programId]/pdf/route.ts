import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateRandomProgram } from "@/lib/dummy-data";
import puppeteer from 'puppeteer-core';

// Node.js Runtime kullanacağımızı belirt
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Her istekte yeniden oluşturmak için

// Programı getiren fonksiyon (gerçek uygulamada API veya veritabanından)
const getProgramData = async (programId: string) => {
  // Bu örnekte dummy veri kullanıyoruz
  // Gerçek uygulamada veritabanından veya API'den programı almak gerekir
  return generateRandomProgram(programId);
};

// Programı HTML formatına dönüştür
const generateProgramHtml = (program: any) => {
  // Program haftalık verilerini HTML'e çevir
  let weeklyContent = '';
  
  program.weeks.forEach((week: any) => {
    weeklyContent += `
      <div class="week">
        <h3>Hafta ${week.weekNumber} (${week.startDate} - ${week.endDate})</h3>
        
        <div class="days">
    `;
    
    week.days.forEach((day: any) => {
      weeklyContent += `
        <div class="day">
          <h4>${day.dayName} - ${day.date}</h4>
          
          ${day.subjects.length > 0 
            ? `<ul class="subjects">
                ${day.subjects.map((subject: any) => `
                  <li>
                    <strong>${subject.name}</strong> (${subject.duration} dk) - 
                    ${subject.topics.join(', ')}
                  </li>
                `).join('')}
              </ul>`
            : '<p class="no-subjects">Bu gün için planlanmış çalışma yok.</p>'
          }
        </div>
      `;
    });
    
    weeklyContent += `
        </div>
      </div>
    `;
  });
  
  // Notlar bölümünü ekle
  const notesContent = program.notes && program.notes.length > 0
    ? `
      <div class="notes">
        <h2>Notlar</h2>
        <ul>
          ${program.notes.map((note: string) => `<li>${note}</li>`).join('')}
        </ul>
      </div>
    `
    : '';
  
  // HTML şablonu
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${program.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        .title {
          color: #7c3aed;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #4b5563;
          font-size: 16px;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        h2 {
          color: #7c3aed;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        h3 {
          color: #7c3aed;
          margin-top: 20px;
        }
        h4 {
          color: #4b5563;
          margin-bottom: 10px;
        }
        .days {
          margin-left: 20px;
        }
        .day {
          margin-bottom: 15px;
        }
        .subjects {
          margin-top: 5px;
          padding-left: 20px;
        }
        .subjects li {
          margin-bottom: 5px;
        }
        .no-subjects {
          color: #6b7280;
          font-style: italic;
          margin-left: 20px;
        }
        .notes {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 5px;
          margin-top: 30px;
        }
        .notes h2 {
          margin-top: 0;
        }
        .notes ul {
          padding-left: 20px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          margin-top: 50px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        .student-info, .program-summary {
          margin-bottom: 20px;
        }
        .student-info p, .program-summary p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">${program.title}</h1>
          <p class="subtitle">${program.examType} Sınavı için Çalışma Programı</p>
          <p class="subtitle">Hazırlanma Tarihi: ${program.createdAt}</p>
          <p class="subtitle">Sınav Tarihi: ${program.examDate}</p>
        </div>
        
        <div class="section student-info">
          <h2>Öğrenci Bilgileri</h2>
          <p><strong>İsim:</strong> ${program.studentName || 'Belirtilmedi'}</p>
          <p><strong>E-posta:</strong> ${program.email}</p>
        </div>
        
        <div class="section program-summary">
          <h2>Program Özeti</h2>
          <p><strong>Toplam Hafta:</strong> ${program.totalWeeks}</p>
          <p><strong>Sınav Türü:</strong> ${program.examType}</p>
        </div>
        
        <div class="section program-content">
          <h2>Program İçeriği</h2>
          ${weeklyContent}
        </div>
        
        ${notesContent}
        
        <div class="footer">
          <p>${program.title} - StudyMap.app tarafından oluşturulmuştur.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Chrome Executable Path - Chrome binarylerinin yolu
// Vercel gibi sunucularda Chrome AWS Lambda Layer üzerinden erişilebilir
// https://github.com/alixaxel/chrome-aws-lambda/blob/master/source/index.js 
// yolunu referans alabilirsiniz
async function getBrowserInstance() {
  // Vercel benzeri ortamlar için 
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    // AWS Lambda için Chrome bulunuyor olabilir
    return puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
      executablePath: "/opt/chrome/chrome",
      headless: true,
    });
  }

  // Localhost geliştirme ortamları için (Chrome yolu uygun şekilde belirtilmeli)
  // Linux için örnek
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', 
    headless: true,
  });
}

// HEAD isteklerini desteklemek için (client tarafında durum kontrolü için)
export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ programId: string }> | { programId: string } }
) {
  return new Response(null, { status: 200 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ programId: string }> | { programId: string } }
) {
  try {
    // params nesnesini await ile çöz (Next.js 14 ile uyumlu)
    const resolvedParams = 'then' in params ? await params : params;
    const { programId } = resolvedParams;
    
    if (!programId) {
      return new Response("Program ID eksik veya geçersiz", { 
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }

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

    try {
      // Program HTML'ini oluştur
      const htmlContent = generateProgramHtml(program);
      
      // Puppeteer ile PDF oluştur
      let browser = null;
      try {
        browser = await getBrowserInstance();
        const page = await browser.newPage();
        
        // HTML içeriğini sayfaya yükle
        await page.setContent(htmlContent, { 
          waitUntil: 'networkidle0' 
        });
        
        // PDF'i oluştur
        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
          printBackground: true
        });
        
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