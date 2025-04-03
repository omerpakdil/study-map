import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payment-providers';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
import Stripe from 'stripe';

// Bu route, headers gönderimini engellememeli (Stripe imzalarını doğrulamak için)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Raw body alımı
    const rawBody = await req.text();
    
    // Stripe-Signature header'ını kontrol et
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('Stripe imzası bulunamadı.', { status: 400 });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      // @ts-ignore - Stripe API sürüm hatalarını görmezden gel
      apiVersion: '2023-08-16' as any,
    });
    
    let event: Stripe.Event;
    
    try {
      // Webhook imzasını doğrula
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error(`Webhook imza doğrulama hatası: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    // Event tipine göre işlem yap
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} başarıyla ödendi!`);
        
        // Metadata'dan program bilgilerini çıkar
        const programId = paymentIntent.metadata.programId;
        const programName = paymentIntent.metadata.programName || 'Çalışma Programı';
        const customerEmail = paymentIntent.receipt_email;
        
        if (programId && customerEmail) {
          // Kullanıcıya e-posta gönder
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const pdfUrl = `${baseUrl}/api/downloads/${programId}/pdf`;
          const icsUrl = `${baseUrl}/api/downloads/${programId}/ics`;
          
          await sendPurchaseConfirmationEmail(
            customerEmail,
            programName,
            programId,
            pdfUrl,
            icsUrl
          );
          
          console.log(`E-posta gönderildi: ${customerEmail}`);
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Ödeme başarısız: ${paymentIntent.id}`);
        
        const message = paymentIntent.last_payment_error?.message;
        console.error(`Ödeme hatası: ${message}`);
        break;
      }
      
      default:
        console.log(`İşlenmeyen event tipi: ${event.type}`);
    }
    
    // Başarılı yanıt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error: any) {
    console.error('Stripe webhook hatası:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
} 