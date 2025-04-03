import { NextResponse } from 'next/server';
import { sendEmail, sendPurchaseConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, email, programName, programId, pdfUrl, icsUrl, ...emailData } = body;
    
    // Güvenlik kontrolü: Gerekli alanları kontrol et
    if (!email || (type === 'purchase' && !programId)) {
      return NextResponse.json(
        { success: false, message: 'Eksik parametreler: email veya programId' },
        { status: 400 }
      );
    }
    
    let result;
    
    // E-posta türüne göre farklı işlem
    if (type === 'purchase') {
      // Satın alma onay e-postası
      result = await sendPurchaseConfirmationEmail(
        email,
        programName || 'Çalışma Programı',
        programId,
        pdfUrl,
        icsUrl
      );
    } else if (type === 'custom' && emailData.subject && emailData.html) {
      // Özel e-posta
      result = await sendEmail({
        to: email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments,
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Geçersiz e-posta türü veya eksik içerik' },
        { status: 400 }
      );
    }
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'E-posta gönderiminde hata oluştu' },
      { status: 500 }
    );
  }
}

// Rate limiter eklenebilir
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // PDF eklerinin boyutu için yeterli limitkp
    },
  },
}; 