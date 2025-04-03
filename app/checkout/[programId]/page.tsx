"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { PaymentOptions } from "@/components/checkout/payment-options";
import { Button } from "@/components/ui/button";

// Next.js dinamik rotalı sayfaların prop tipini tanımlayalım
type CheckoutPageProps = {
  params: Promise<{
    programId: string;
  }>;
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const [programId, setProgramId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // params Promise'ini çözmek için useEffect kullanıyoruz
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProgramId(resolvedParams.programId);
      setIsLoading(false);
    };
    resolveParams();
  }, [params]);
  
  // Demo program verileri (normalde API'den çekilir)
  const [programData, setProgramData] = useState({
    id: "",
    name: "YKS Çalışma Programı",
    price: 99,
    currency: "₺",
    discountedPrice: undefined as number | undefined,
    features: [
      "12 haftalık detaylı çalışma programı",
      "Kişiselleştirilmiş ders planı",
      "Günlük çalışma programı",
      "Haftalık hedefler ve değerlendirme",
      "Deneme sınavı planlaması",
      "PDF olarak indirme",
      "E-posta ile teslimat",
      "Zayıf alanlarınıza odaklı yaklaşım"
    ]
  });
  
  // programId güncellendiğinde programData'yı güncelle
  useEffect(() => {
    if (programId) {
      setProgramData(prev => ({
        ...prev,
        id: programId
      }));
    }
  }, [programId]);
  
  // İndirim uygulama fonksiyonu
  const handleApplyDiscount = async (code: string) => {
    // Burada normalde API çağrısı yapılır
    return new Promise<{ valid: boolean; discountedPrice?: number; message?: string }>((resolve) => {
      setTimeout(() => {
        if (code.toUpperCase() === "WELCOME10") {
          // %10 indirim
          const discountedPrice = programData.price * 0.9;
          resolve({
            valid: true,
            discountedPrice,
            message: "%10 indirim uygulandı!"
          });
        } else if (code.toUpperCase() === "STUDENT20") {
          // %20 indirim
          const discountedPrice = programData.price * 0.8;
          resolve({
            valid: true,
            discountedPrice,
            message: "%20 öğrenci indirimi uygulandı!"
          });
        } else {
          resolve({
            valid: false,
            message: "Geçersiz indirim kodu."
          });
        }
      }, 1000);
    });
  };

  // Satın alma sonrası e-posta gönderimi
  const sendPurchaseEmail = async (email: string) => {
    try {
      setEmailStatus("sending");
      
      // PDF ve ICS dosyaları için API yolları
      const pdfUrl = `/api/downloads/${programId}/pdf`;
      const icsUrl = `/api/downloads/${programId}/ics`;
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'purchase',
          email,
          programName: programData.name,
          programId,
          pdfUrl,
          icsUrl,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEmailStatus("success");
        console.log("E-posta başarıyla gönderildi:", result);
        
        // Test ortamında e-posta ön izleme URL'sini konsola yazdır
        if (result.previewUrl) {
          console.log("E-posta ön izleme URL'si:", result.previewUrl);
        }
      } else {
        setEmailStatus("error");
        console.error("E-posta gönderimi başarısız:", result.message);
      }
    } catch (error) {
      setEmailStatus("error");
      console.error("E-posta gönderimi sırasında hata:", error);
    }
  };
  
  // Ödeme işlemi
  const handleCheckoutSubmit = async (data: any) => {
    setError("");
    setIsProcessing(true);
    
    try {
      // Form verileri
      console.log("Form verileri:", data);
      
      // Ülke koduna göre hangi ödeme sağlayıcısını kullanacağımızı belirle
      // Türkiye için İyzico, diğer ülkeler için Stripe
      const countryCode = data.countryCode || "TR";
      
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: countryCode,
          programId: programId,
          programName: programData.name,
          price: programData.discountedPrice || programData.price,
          currency: programData.currency,
          customerInfo: {
            id: `user_${Date.now()}`,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || "+905555555555", // Telefon formatı: +90XXXXXXXXXX
            address: data.address,
            city: data.city,
            postalCode: data.postalCode || "34000",
            country: countryCode === "TR" ? "Turkey" : data.country || "Turkey",
            identityNumber: data.identityNumber // TC Kimlik No
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ödeme işlemi başlatılamadı");
      }
      
      const result = await response.json();
      
      // Sonuçları sakla
      setPaymentData(result);
      
      if (result.provider === 'iyzico' && result.checkoutFormContent) {
        // İyzico - ödeme formunu göster
        setFormSubmitted(true);
        // İşlemi tamamla - iframe üzerinden devam edecek
        setIsProcessing(false);
        
      } else if (result.provider === 'stripe') {
        // Stripe - Ödeme sayfasına yönlendir
        // Not: Gerçek uygulamada, Stripe.js ile ödeme form entegrasyonu yapılmalıdır
        // Bu demo için basitleştirilmiş sürüm kullanıyoruz
        
        // Ödeme başarılıysa e-posta gönder
        await sendPurchaseEmail(data.email);
        
        // Başarılı ödeme sonrası başarı sayfasına yönlendir
        router.push(`/success?id=${programId}`);
      }
      
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      setIsProcessing(false);
      setError(error.message || "Ödeme işlemi sırasında beklenmeyen bir hata oluştu.");
    }
  };
  
  // İyzico iframe bileşeni
  const IyzicoFormComponent = ({ formContent }: { formContent: string }) => {
    return (
      <motion.div 
        className="w-full max-w-3xl mx-auto mt-6 rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div dangerouslySetInnerHTML={{ __html: formContent }} />
      </motion.div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Sayfa Yükleniyor</h2>
          <p className="text-muted-foreground max-w-md">
            Lütfen bekleyin, program bilgileri hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }
  
  if (isProcessing) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Ödeme İşleniyor</h2>
          <p className="text-muted-foreground max-w-md">
            Lütfen sayfadan ayrılmayın. Ödemeniz işleniyor ve kısa süre içinde tamamlanacak.
          </p>
          
          {emailStatus === "sending" && (
            <p className="text-sm text-primary">
              Programınız hazırlanıyor ve e-posta adresinize gönderiliyor...
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full flex justify-center py-10">
      <div className="container max-w-5xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary mb-4">
            Ödeme
          </h1>
          <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
            Çalışma programınızı satın almak için aşağıdaki formu doldurun.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Program bilgileri yükleniyor...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 border rounded-lg bg-destructive/10 text-destructive">
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Ana Sayfaya Dön
            </Button>
          </div>
        ) : formSubmitted && paymentData?.provider === 'iyzico' && paymentData?.checkoutFormContent ? (
          // İyzico formunu göster
          <IyzicoFormComponent formContent={paymentData.checkoutFormContent} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <CheckoutForm
                programId={programId}
                price={programData.price}
                currency={programData.currency}
                discountedPrice={programData.discountedPrice}
                onSubmit={handleCheckoutSubmit}
              />
            </div>
            <div className="md:col-span-1">
              <PaymentOptions
                programName={programData.name}
                price={programData.price}
                currency={programData.currency}
                features={programData.features}
                onApplyDiscount={handleApplyDiscount}
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 