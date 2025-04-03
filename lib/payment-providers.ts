import Stripe from 'stripe';
import { createHash } from 'crypto';

// @ts-ignore - Stripe sürüm uyumsuzluğunu görmezden gel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16' as any, // Stripe tarafından desteklenen bir sürüm
});

// PaymentDetails türünü tanımla
export interface PaymentDetails {
  programId: string;
  price: number;
  currency: string;
  customerName: string;
  customerSurname: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  ip: string;
  identityNumber?: string; // TC Kimlik No, opsiyonel
}

// Ülke koduna göre ödeme sağlayıcısını belirle
export const getPaymentProvider = (countryCode: string): 'iyzico' | 'stripe' => {
  // Türkiye için İyzico kullan, diğer ülkeler için Stripe
  return countryCode === 'TR' ? 'iyzico' : 'stripe';
};

// İyzico ödeme başlatma fonksiyonu
export async function initializeIyzicoCheckout(paymentDetails: PaymentDetails): Promise<{
  token: string;
  checkoutFormContent: string;
  status: string;
}> {
  try {
    const apiKey = process.env.IYZIPAY_API_KEY || '';
    const secretKey = process.env.IYZIPAY_SECRET_KEY || '';
    const baseUrl = process.env.IYZIPAY_BASE_URL || '';

    console.log("İyzico Başlatma - Anahtarlar:", {
      apiKeyLength: apiKey.length,
      secretKeyLength: secretKey.length,
      baseUrl
    });

    // İyzico test kartı bilgileri
    console.log("İyzico Gerçek Test Kartları:", {
      basarili_odeme: {
        kart_no: '5528 7900 0000 0008',
        son_kullanim_ay_yil: '12/30',
        cvc: '123',
        kart_sahibi: 'John Doe',
        secureThreeDSifre: '123456'
      },
      basarisiz_odeme: {
        kart_no: '4111 1111 1111 1111',
        son_kullanim_ay_yil: '12/30',
        cvc: '123',
        secureThreeDSifre: '000000'
      }
    });
    
    // Şu anki Türkiye saati
    const now = new Date();
    const registrationDate = new Date(now.getTime());
    registrationDate.setDate(now.getDate() - 1); // 1 gün önce kayıt olmuş
    
    const lastLoginDate = new Date(now.getTime());

    // İyzico API bilgilerini kontrol et
    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error('İyzico API bilgileri eksik. API Key, Secret Key ve Base URL .env.local dosyasında tanımlanmalıdır.');
    }
    
    console.log("İyzico API ile gerçek ödeme entegrasyonu başlatılıyor...");

    // Rastgele bir sipariş ID'si oluştur
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const basketId = `order_${paymentDetails.programId}_${timestamp}_${randomPart}`;
    const conversationId = `order_${paymentDetails.programId}_${timestamp + 1}_${randomPart + 1}`;
    
    // Fiyat bilgileri (indirim, vergi, taksit komisyonları gibi değerlerin dahil olduğu tutar)
    const price = paymentDetails.price.toString();
    const paidPrice = paymentDetails.price.toString();
    
    // API için sepet oluştur
    const basketItems = [{
      id: paymentDetails.programId,
      name: "Çalışma Programı",
      category1: "Eğitim",
      category2: "Çalışma Programı",
      itemType: "VIRTUAL",
      price: price
    }];
    
    // İyzico için API çağrı parametreleri - güncel dokümantasyona göre
    const requestBody = {
      locale: "tr",
      conversationId: conversationId,
      price: price,
      paidPrice: paidPrice,
      currency: paymentDetails.currency === 'TRY' ? 'TRY' : 
                paymentDetails.currency === 'USD' ? 'USD' : 
                paymentDetails.currency === '₺' ? 'TRY' : 
                paymentDetails.currency === '$' ? 'USD' : 
                paymentDetails.currency,
      basketId: basketId,
      paymentGroup: "PRODUCT",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/iyzico-callback?programId=${paymentDetails.programId}`,
      buyer: {
        id: `user_${timestamp}`,
        name: paymentDetails.customerName,
        surname: paymentDetails.customerSurname,
        gsmNumber: paymentDetails.phoneNumber,
        email: paymentDetails.email,
        identityNumber: paymentDetails.identityNumber || "11111111111", // TC kimlik no
        lastLoginDate: lastLoginDate.toISOString().split('.')[0],
        registrationDate: registrationDate.toISOString().split('.')[0],
        registrationAddress: paymentDetails.address,
        ip: paymentDetails.ip,
        city: paymentDetails.city,
        country: paymentDetails.country,
        zipCode: paymentDetails.zipCode
      },
      shippingAddress: {
        contactName: `${paymentDetails.customerName} ${paymentDetails.customerSurname}`,
        city: paymentDetails.city,
        country: paymentDetails.country,
        address: paymentDetails.address,
        zipCode: paymentDetails.zipCode
      },
      billingAddress: {
        contactName: `${paymentDetails.customerName} ${paymentDetails.customerSurname}`,
        city: paymentDetails.city,
        country: paymentDetails.country,
        address: paymentDetails.address,
        zipCode: paymentDetails.zipCode
      },
      basketItems: basketItems,
      enabledInstallments: [1, 2, 3, 6, 9]
    };
    
    console.log("İyzico Başlatma - İstek:", JSON.stringify(requestBody, null, 2));
    
    // API için random nonce değeri oluştur 
    const randomString = Date.now().toString();
    
    // Authorization Header ve diğer gerekli headerlar
    const authorizationHeader = generateAuthorizationHeader(apiKey, secretKey, randomString, requestBody);
    
    // İyzico API'sine istek gönder - doğru header ve endpointlerle
    const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authorizationHeader,
        'x-iyzi-rnd': randomString // Random string burada gönderildi
      },
      body: JSON.stringify(requestBody)
    });
    
    // Hatayı teşhis etmek için ham yanıtı önce bir text olarak alalım
    const rawResponse = await response.text();
    console.log("İyzico Ham API Yanıtı:", rawResponse);
    
    try {
      // Sonra JSON olarak parse edelim
      const result = JSON.parse(rawResponse);
      console.log("İyzico API Yanıtı (Başarılı JSON):", result);
      
      if (result.status === 'success') {
        return {
          token: result.token || '',
          checkoutFormContent: result.checkoutFormContent || '',
          status: 'success'
        };
      } else {
        throw new Error(result.errorMessage || 'İyzico ödeme formu başlatılamadı');
      }
    } catch (jsonError: any) {
      console.error("İyzico JSON parse hatası:", jsonError);
      console.error("Dönen ham yanıt (ilk 500 karakter):", rawResponse.substring(0, 500));
      throw new Error(`İyzico API yanıtını işlenirken hata oluştu: ${jsonError.message}`);
    }
  } catch (error) {
    console.error("İyzico entegrasyon hatası:", error);
    throw error;
  }
}

// İyzico için authorization header oluştur
function generateAuthorizationHeader(apiKey: string, secretKey: string, randomString: string, requestBody: any): string {
  const pkiString = generatePkiString(requestBody);
  console.log("İyzico PKI String:", pkiString);
  
  // API Key + random string + secret key + request string
  const hashStr = apiKey + randomString + secretKey + pkiString;
  const hashInBase64 = createHash('sha256').update(hashStr).digest('base64');
  
  return 'IYZWS ' + apiKey + ':' + hashInBase64;
}

// İyzico için PKI string oluştur
function generatePkiString(request: any): string {
  let pki = '[';
  
  // Ana parametreler
  pki += requestToHash('locale', request.locale || '');
  pki += requestToHash('conversationId', request.conversationId || '');
  pki += requestToHash('price', request.price || '');
  pki += requestToHash('paidPrice', request.paidPrice || '');
  pki += requestToHash('installment', request.installment || '');
  pki += requestToHash('paymentChannel', request.paymentChannel || '');
  pki += requestToHash('basketId', request.basketId || '');
  pki += requestToHash('paymentGroup', request.paymentGroup || '');
  pki += requestToHash('paymentCard', request.paymentCard || '');
  
  // Buyer parametresi
  if (request.buyer) {
    pki += 'buyer=[';
    pki += requestToHash('id', request.buyer.id || '');
    pki += requestToHash('name', request.buyer.name || '');
    pki += requestToHash('surname', request.buyer.surname || '');
    pki += requestToHash('identityNumber', request.buyer.identityNumber || '');
    pki += requestToHash('email', request.buyer.email || '');
    pki += requestToHash('gsmNumber', request.buyer.gsmNumber || '');
    pki += requestToHash('registrationDate', request.buyer.registrationDate || '');
    pki += requestToHash('lastLoginDate', request.buyer.lastLoginDate || '');
    pki += requestToHash('registrationAddress', request.buyer.registrationAddress || '');
    pki += requestToHash('city', request.buyer.city || '');
    pki += requestToHash('country', request.buyer.country || '');
    pki += requestToHash('zipCode', request.buyer.zipCode || '');
    pki += requestToHash('ip', request.buyer.ip || '');
    pki = pki.replace(/,$/, '');
    pki += ']';
  }
  
  // Shipping address parametresi
  if (request.shippingAddress) {
    pki += ', shippingAddress=[';
    pki += requestToHash('address', request.shippingAddress.address || '');
    pki += requestToHash('zipCode', request.shippingAddress.zipCode || '');
    pki += requestToHash('contactName', request.shippingAddress.contactName || '');
    pki += requestToHash('city', request.shippingAddress.city || '');
    pki += requestToHash('country', request.shippingAddress.country || '');
    pki = pki.replace(/,$/, '');
    pki += ']';
  }
  
  // Billing address parametresi
  if (request.billingAddress) {
    pki += ', billingAddress=[';
    pki += requestToHash('address', request.billingAddress.address || '');
    pki += requestToHash('zipCode', request.billingAddress.zipCode || '');
    pki += requestToHash('contactName', request.billingAddress.contactName || '');
    pki += requestToHash('city', request.billingAddress.city || '');
    pki += requestToHash('country', request.billingAddress.country || '');
    pki = pki.replace(/,$/, '');
    pki += ']';
  }
  
  // Basket items parametresi
  if (request.basketItems && request.basketItems.length > 0) {
    pki += ', basketItems=[';
    for (let i = 0; i < request.basketItems.length; i++) {
      const item = request.basketItems[i];
      pki += '[';
      pki += requestToHash('id', item.id || '');
      pki += requestToHash('name', item.name || '');
      pki += requestToHash('category1', item.category1 || '');
      pki += requestToHash('category2', item.category2 || '');
      pki += requestToHash('itemType', item.itemType || '');
      pki += requestToHash('price', item.price || '');
      pki = pki.replace(/,$/, '');
      pki += ']';
      if (i < request.basketItems.length - 1) {
        pki += ', ';
      }
    }
    pki += ']';
  }
  
  // Diğer parametreler
  pki += requestToHash('callbackUrl', request.callbackUrl || '');
  pki += requestToHash('currency', request.currency || '');
  
  // Temizleme
  pki = pki.replace(/,$/, '');
  pki += ']';
  
  return pki;
}

// Hash için yardımcı fonksiyon
function requestToHash(key: string, value: any): string {
  if (!value || value === '') {
    return '';
  }
  
  if (typeof value === 'object') {
    return `${key}=${JSON.stringify(value)}, `;
  }
  
  return `${key}=${value}, `;
}

// İyzico ödeme bildirimlerini doğrulama
export const verifyIyzicoNotification = (data: any, secretKey: string): boolean => {
  try {
    // İyzico callback imza doğrulama kodu
    // İyzico dokümantasyonuna göre implementasyon yapılacak
    const crypto = require('crypto');
    
    // İyzico'dan alınan parametreler ile hash oluştur
    const hashStr = data.status + data.conversationId + data.price + data.paymentId + secretKey;
    const hash = crypto.createHmac('sha256', secretKey).update(hashStr).digest('base64');
    
    // Oluşturulan hash ile gelen hash'i karşılaştır
    return hash === data.hash;
  } catch (error) {
    console.error('İyzico bildirim doğrulama hatası:', error);
    return false;
  }
};

// İyzico CF Sorgulama - Ödeme sonucunu almak için
export async function getIyzicoPaymentResult(token: string): Promise<any> {
  try {
    const apiKey = process.env.IYZIPAY_API_KEY || '';
    const secretKey = process.env.IYZIPAY_SECRET_KEY || '';
    const baseUrl = process.env.IYZIPAY_BASE_URL || '';

    // API bilgilerini kontrol et
    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error('İyzico API bilgileri eksik. API Key, Secret Key ve Base URL .env.local dosyasında tanımlanmalıdır.');
    }

    // İstek parametreleri
    const requestBody = {
      locale: "tr",
      conversationId: `query_${Date.now()}`,
      token: token
    };

    // API için random nonce değeri oluştur 
    const randomString = Date.now().toString();
    
    // Authorization Header oluştur
    const authorizationHeader = generateAuthorizationHeader(apiKey, secretKey, randomString, requestBody);

    // İyzico API'sine istek gönder
    console.log("İyzico Sorgulama - İstek Gönderiliyor:", requestBody);
    const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authorizationHeader,
        'x-iyzi-rnd': randomString // Random string burada gönderildi
      },
      body: JSON.stringify(requestBody)
    });

    // Ham yanıtı al
    const rawResponse = await response.text();
    console.log("İyzico Sorgulama Ham Yanıt:", rawResponse);

    try {
      // JSON olarak parse et
      const result = JSON.parse(rawResponse);
      console.log("İyzico Sorgulama Yanıtı:", result);
      return result;
    } catch (jsonError: any) {
      console.error("İyzico Sorgulama JSON parse hatası:", jsonError);
      throw new Error(`İyzico sorgulama yanıtını işlerken hata oluştu: ${jsonError.message}`);
    }
  } catch (error) {
    console.error("İyzico sorgulama hatası:", error);
    throw error;
  }
}

// Stripe ödeme niyeti oluşturma
export const createStripePaymentIntent = async (
  paymentDetails: {
    amount: number; // Kuruş cinsinden tutar (1 USD = 100 cent)
    currency: string;
    customerId?: string;
    receiptEmail: string;
    metadata: Record<string, string>;
  }
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentDetails.amount,
      currency: paymentDetails.currency.toLowerCase(),
      receipt_email: paymentDetails.receiptEmail,
      metadata: paymentDetails.metadata,
      customer: paymentDetails.customerId,
      payment_method_types: ['card'],
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe ödeme niyeti oluşturma hatası:', error);
    throw error;
  }
};

// Stripe ödeme durumunu kontrol etme
export const checkStripePaymentStatus = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe ödeme durumu kontrol hatası:', error);
    throw error;
  }
};

// Stripe webhook işleyicisi
export const handleStripeWebhook = async (event: any) => {
  const signature = event.headers['stripe-signature'] as string;
  
  try {
    // Webhook olayını doğrula
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
    
    // Olay türüne göre işle
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        // Ödeme başarılı işlemleri
        console.log('Payment succeeded:', paymentIntent.id);
        // Veritabanı güncelleme, e-posta gönderme vb.
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        // Ödeme başarısız işlemleri
        console.log('Payment failed:', failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    return { success: true };
  } catch (err) {
    console.error('Stripe webhook error:', err);
    throw err;
  }
};

// Para birimi formatlaması
export const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'TRY' || currency === '₺') {
    return `${amount.toFixed(2)} ₺`;
  } else if (currency === 'USD' || currency === '$') {
    return `$${amount.toFixed(2)}`;
  } else if (currency === 'EUR' || currency === '€') {
    return `€${amount.toFixed(2)}`;
  } else {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Ödeme durumu çevirmeni
export const translatePaymentStatus = (status: string, locale: string = 'tr'): string => {
  const translations: Record<string, Record<string, string>> = {
    success: {
      tr: 'Başarılı',
      en: 'Successful'
    },
    failure: {
      tr: 'Başarısız',
      en: 'Failed'
    },
    pending: {
      tr: 'Beklemede',
      en: 'Pending'
    }
  };
  
  return translations[status]?.[locale] || status;
}; 