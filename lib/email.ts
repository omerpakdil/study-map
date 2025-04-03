import nodemailer from 'nodemailer';

// E-posta gönderimi için gerekli veri türü
export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

// Geliştirme ortamında kullanılacak test hesabı
let testAccount: nodemailer.TestAccount | null = null;

// Nodemailer transporter oluşturma fonksiyonu
async function createTransporter() {
  // Üretim ortamında SMTP ayarlarınızı kullanın
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } 
  
  // Yerel geliştirme ortamında Ethereal test hesabı kullanın
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
  }
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// E-posta gönderme fonksiyonu
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"StudyMap" <${process.env.EMAIL_FROM || 'info@studymap.app'}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments,
    });
    
    console.log('Email sent: %s', info.messageId);
    
    // Geliştirme ortamında, e-posta ön izleme URL'sini gönderir
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return { 
        success: true, 
        message: `Email sent: ${info.messageId}`,
        previewUrl: nodemailer.getTestMessageUrl(info) as string
      };
    }
    
    return { success: true, message: `Email sent: ${info.messageId}` };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
}

// Program satın alımı sonrası e-posta gönderimi
export async function sendPurchaseConfirmationEmail(
  email: string,
  programName: string,
  programId: string,
  pdfUrl?: string,
  icsUrl?: string,
): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymap.app';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Çalışma Programı Satın Alımı</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          border: 1px solid #e5e5e5;
          border-radius: 5px;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7c3aed;
        }
        .button {
          display: inline-block;
          background-color: #7c3aed;
          color: white !important;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .attachment {
          background-color: #f5f5f5;
          border-radius: 5px;
          padding: 10px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">StudyMap</div>
        </div>
        
        <p>Merhaba,</p>
        
        <p>
          <strong>${programName}</strong> çalışma programınızı başarıyla satın aldınız. 
          Kişiselleştirilmiş çalışma programınız artık hazır!
        </p>
        
        <p>
          Çalışma programınızı PDF olarak indirmek ve takvim formatında kullanmak için
          aşağıdaki bağlantıyı kullanabilirsiniz.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/success?id=${programId}" class="button">Programı Görüntüle ve İndir</a>
        </div>
        
        <p>
          Başarılar dileriz!<br>
          StudyMap Ekibi
        </p>
        
        <div class="footer">
          <p>
            Bu e-posta ${email} adresine StudyMap tarafından gönderilmiştir.<br>
            © ${new Date().getFullYear()} StudyMap. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `Çalışma Programınız Hazır: ${programName}`,
    html
  });
} 