import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { 
  getPaymentProvider, 
  initializeIyzicoCheckout,
  createStripePaymentIntent 
} from '@/lib/payment-providers';

// Node.js runtime kullanıyoruz
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // İstem gövdesini parse et
    const body = await req.json();
    const { 
      countryCode, 
      programId, 
      programName,
      price, 
      currency,
      customerInfo
    } = body;
    
    // API isteğinde gerekli alanları kontrol et
    if (!programId || !price || !currency || !customerInfo) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Eksik ödeme bilgileri. Lütfen tüm alanları doldurun.' 
        }, 
        { status: 400 }
      );
    }
    
    // İstemci IP'sini al - Next.js 14 için req.headers kullanarak
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Ülke koduna göre ödeme sağlayıcısını belirle (varsayılan: 'TR')
    const paymentProvider = getPaymentProvider(countryCode || 'TR');
    
    let result;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Ödeme sağlayıcısına göre işlem yap
    if (paymentProvider === 'iyzico') {
      // İyzico ödeme işlemi başlat
      const callbackUrl = `${baseUrl}/api/payment/iyzico-callback?programId=${programId}`;
      
      // Benzersiz sipariş ID'si oluştur
      const timestamp = Date.now();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const basketId = `order_${programId}_${timestamp}_${randomPart}`;
      
      console.log("Müşteri bilgileri:", customerInfo);
      
      // Telefon numarasını düzenle - tireler ve boşlukları kaldır, +90 ile başlamazsa ekle
      const phoneNumber = customerInfo.phone ? 
            customerInfo.phone.replace(/[-\s]/g, "") :  // Tire ve boşlukları kaldır
            "+905555555555";
      
      const formattedPhone = phoneNumber.startsWith("+90") ? 
            phoneNumber : 
            `+90${phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber}`;
            
      console.log("Düzenlenmiş telefon:", formattedPhone);
      
      // TC Kimlik numarası kontrolü - boş ise test değeri kullan
      const identityNumber = customerInfo.identityNumber || "11111111111";
      console.log("TC Kimlik Numarası:", identityNumber);
      
      // İyzico ödeme başlatma
      result = await initializeIyzicoCheckout({
        programId: programId,
        price: parseFloat(price),
        currency: currency === '₺' ? 'TRY' : currency === '$' ? 'USD' : currency,
        customerName: customerInfo.firstName || "Test",
        customerSurname: customerInfo.lastName || "User", 
        email: customerInfo.email || "test@example.com",
        phoneNumber: formattedPhone,
        address: customerInfo.address || "Test Address",
        city: customerInfo.city || "Istanbul",
        country: customerInfo.country || "Turkey",
        zipCode: customerInfo.postalCode || "34000",
        ip: clientIp,
        identityNumber: identityNumber
      });
      
      return NextResponse.json({
        success: true,
        provider: 'iyzico',
        token: result.token,
        checkoutFormContent: result.checkoutFormContent,
        redirectUrl: null
      });
      
    } else {
      // Stripe ödeme işlemi başlat
      // Stripe'da fiyat cent cinsinden olmalı (1 USD = 100 cent)
      const stripeAmount = Math.round(price * 100);
      
      result = await createStripePaymentIntent({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        receiptEmail: customerInfo.email,
        metadata: {
          programId: programId,
          programName: programName || 'Study Program',
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`
        }
      });
      
      return NextResponse.json({
        success: true,
        provider: 'stripe',
        clientSecret: (result as any).clientSecret,
        paymentIntentId: (result as any).paymentIntentId
      });
    }
    
  } catch (error: any) {
    console.error('Ödeme başlatma hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Ödeme işlemi başlatılırken bir hata oluştu.' 
      }, 
      { status: 500 }
    );
  }
} 