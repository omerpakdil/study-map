import { NextResponse } from 'next/server';
import { verifyIyzicoNotification, getIyzicoPaymentResult } from '@/lib/payment-providers';
import { sendPurchaseConfirmationEmail } from '@/lib/email';

// Node.js runtime kullanıyoruz
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Form verilerini al
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    // İyzico'dan gelen parametreleri al
    const token = data.token;
    const status = data.status;
    const conversationId = data.conversationId;
    const programId = new URL(req.url).searchParams.get('programId');
    
    if (!programId) {
      return NextResponse.json({ success: false, message: 'Program ID bulunamadı' }, { status: 400 });
    }
    
    console.log('İyzico ödeme callback bilgileri:', {
      token,
      status,
      conversationId,
      programId
    });
    
    // Token ile ödeme sonucunu sorgula (CF Sorgulama)
    if (token) {
      try {
        const paymentResult = await getIyzicoPaymentResult(token);
        console.log('İyzico ödeme sonucu sorgulandı:', paymentResult);
        
        // Ödeme başarılı ise
        if (paymentResult.status === 'success' && paymentResult.paymentStatus === 'SUCCESS') {
          // Kullanıcının e-posta adresini al
          const customerEmail = paymentResult.buyer?.email || data.email || '';
          const programName = 'Çalışma Programı';
          
          // E-posta gönderimi
          if (customerEmail) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const pdfUrl = `${baseUrl}/api/downloads/${programId}/pdf`;
            const icsUrl = `${baseUrl}/api/downloads/${programId}/ics`;
            
            try {
              await sendPurchaseConfirmationEmail(
                customerEmail,
                programName,
                programId,
                pdfUrl,
                icsUrl
              );
              console.log('Satın alma onay e-postası gönderildi:', customerEmail);
            } catch (emailError) {
              console.error('E-posta gönderim hatası:', emailError);
              // E-posta hatası ödeme başarısını etkilememeli
            }
          }
          
          // İyzico'ya başarılı yanıt gönder
          return NextResponse.json({ status: 'success' });
        } else {
          // Başarısız ödeme 
          console.error('Ödeme başarısız:', paymentResult.errorCode, paymentResult.errorMessage);
          return NextResponse.json({ 
            status: 'error', 
            message: paymentResult.errorMessage || 'Ödeme işlemi başarısız oldu' 
          });
        }
      } catch (queryError) {
        console.error('İyzico ödeme sorgulama hatası:', queryError);
        return NextResponse.json(
          { success: false, message: 'Ödeme sonucu sorgulanırken hata oluştu' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Token bilgisi eksik' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('İyzico callback işleme hatası:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Ödeme sonucu işlenemedi' },
      { status: 500 }
    );
  }
}

// İyzico, başarılı ödeme sonrası müşteriyi yönlendirmek için GET isteği de yapabilir
export async function GET(req: Request) {
  const url = new URL(req.url);
  const programId = url.searchParams.get('programId');
  const token = url.searchParams.get('token');
  
  console.log("İyzico Callback - GET:", { programId, token });
  
  // Token mevcutsa, ödeme sonucunu sorgula
  if (token) {
    try {
      const paymentResult = await getIyzicoPaymentResult(token);
      console.log('İyzico ödeme GET sonucu:', paymentResult);
      
      // Ödeme başarılı ise
      if (paymentResult.status === 'success' && paymentResult.paymentStatus === 'SUCCESS' && programId) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `/success?id=${programId}`
          }
        });
      } else {
        // Başarısız ödeme
        const errorMessage = paymentResult.errorMessage || 'Ödeme işlemi başarısız oldu';
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `/payment-error?reason=${encodeURIComponent(errorMessage)}`
          }
        });
      }
    } catch (error: any) {
      console.error('İyzico GET sorgulama hatası:', error);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `/payment-error?reason=${encodeURIComponent('Ödeme sonucu sorgulanırken hata oluştu')}`
        }
      });
    }
  } else if (programId) {
    // Token yoksa ama programId varsa, başarılı kabul et (eski davranış korundu)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `/success?id=${programId}`
      }
    });
  } else {
    // İkisi de yoksa hata sayfasına yönlendir
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `/payment-error?reason=${encodeURIComponent('Ödeme işlemi başarısız oldu veya program ID bulunamadı.')}`
      }
    });
  }
} 