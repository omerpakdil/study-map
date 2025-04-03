"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Mail, ArrowRight, Share, FileDown, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Share2, Calendar, RefreshCw } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [programId, setProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [emailResending, setEmailResending] = useState(false);
  
  // searchParams'dan programId'yi güvenli bir şekilde al
  useEffect(() => {
    if (searchParams) {
      setProgramId(searchParams.get("id"));
      setIsLoading(false);
    }
  }, [searchParams]);
  
  // Sayfa yüklendiğinde konfeti efekti
  useEffect(() => {
    if (!isLoading) {
      const confettiScript = document.createElement("script");
      confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
      confettiScript.async = true;
      document.body.appendChild(confettiScript);
      
      confettiScript.onload = () => {
        // @ts-ignore
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      };
      
      return () => {
        document.body.removeChild(confettiScript);
      };
    }
  }, [isLoading]);
  
  // Otomatik e-posta yönlendirme sayacı
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Program verisi (normalde API'den alınır)
  const programData = {
    name: "YKS Çalışma Programı",
    emailSent: true,
    emailAddress: "kullanici@example.com",
  };
  
  // E-postayı yeniden gönderme
  const handleResendEmail = async () => {
    if (!programId) return;
    
    setEmailResending(true);
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'purchase',
          email: programData.emailAddress,
          programName: programData.name,
          programId,
          pdfUrl: `/api/downloads/${programId}/pdf`,
          icsUrl: `/api/downloads/${programId}/ics`,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("E-posta başarıyla yeniden gönderildi!");
        
        // Test ortamında e-posta ön izleme URL'sini konsola yazdır
        if (result.previewUrl) {
          console.log("E-posta ön izleme URL'si:", result.previewUrl);
        }
      } else {
        toast.error("E-posta gönderimi başarısız oldu. Lütfen daha sonra tekrar deneyin.");
        console.error("E-posta gönderimi başarısız:", result.message);
      }
    } catch (error) {
      toast.error("E-posta gönderiminde bir hata oluştu.");
      console.error("E-posta gönderimi sırasında hata:", error);
    } finally {
      setEmailResending(false);
    }
  };
  
  // PDF indirme fonksiyonu
  const handleDownload = async () => {
    if (!programId) return;
    
    try {
      toast.info('PDF hazırlanıyor, lütfen bekleyin...');
      
      // PDF URL'si
      const pdfUrl = `/api/downloads/${programId}/pdf`;
      
      // PDF dosyasını indir
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${programData.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF indiriliyor...');
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      toast.error('PDF indirilemedi. Lütfen tekrar deneyin.');
    }
  };
  
  // Takvim indirme fonksiyonu
  const handleCalendarDownload = async () => {
    if (!programId) return;
    
    try {
      toast.info('Takvim hazırlanıyor, lütfen bekleyin...');
      
      // ICS formatındaki dosyayı almak için API URL'sini oluştur
      const icsApiUrl = `/api/downloads/${programId}/ics`;
      
      // Takvim dosyasını indirme işlemi için gizli bir a elementi oluştur
      const link = document.createElement('a');
      link.href = icsApiUrl;
      link.download = `Program_${programId}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Takvim dosyası indiriliyor...');
    } catch (error) {
      console.error('Takvim oluşturma hatası:', error);
      toast.error('Takvim oluşturulurken bir hata oluştu');
    }
  };
  
  // E-posta paylaşım fonksiyonu
  const handleEmailShare = () => {
    if (programId) {
      window.location.href = `mailto:?subject=Size özel çalışma programı&body=StudyMap üzerinden oluşturduğum kişisel çalışma programını incelemek ister misiniz? https://studymap.app/preview/${programId}`;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Sayfa Yükleniyor</h2>
          <p className="text-muted-foreground max-w-md">
            Lütfen bekleyin, işlem sonucu hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-10">
      <div className="container max-w-4xl px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center space-y-4 mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
            Ödeme Başarılı!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-[700px]">
            Çalışma programınız başarıyla oluşturuldu ve <span className="font-medium">{programData.emailAddress}</span> 
            adresine gönderildi!
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              <span>PDF İndir</span>
            </Button>
            <Button onClick={handleCalendarDownload} className="gap-2">
              <Clock className="w-4 h-4" />
              <span>Takvim İndir</span>
            </Button>
            <Button onClick={handleEmailShare} variant="outline" className="gap-2">
              <Share className="w-4 h-4" />
              <span>Paylaş</span>
            </Button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  E-posta Bildirimi
                </CardTitle>
                <CardDescription>
                  Programınızın detayları e-posta adresinize gönderildi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gelen kutunuzu kontrol etmeyi unutmayın. Bazen e-postalar spam klasörüne düşebilir.
                  E-postanızı {countdown > 0 ? `${countdown} saniye içinde` : "şimdi"} açmak için aşağıdaki butona tıklayın.
                </p>
              </CardContent>
              <CardFooter className="flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(`https://mail.google.com`, "_blank")}
                >
                  E-postanı Aç
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full gap-1" 
                  onClick={handleResendEmail}
                  disabled={emailResending}
                >
                  {emailResending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3" />
                      <span>E-postayı Yeniden Gönder</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="w-5 h-5" />
                  Program Dosyaları
                </CardTitle>
                <CardDescription>
                  Programınızı farklı formatlarda indirin ve kullanın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <FileDown className="w-4 h-4 text-primary" />
                    </div>
                    <span>{programData.name}.pdf</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleDownload}>İndir</Button>
                </div>
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <span>Takvim Formatı (.ics)</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleCalendarDownload}>İndir</Button>
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Önemli Not</p>
                    <p>
                      Program dosyalarınız her zaman e-postanızda mevcut olacaktır. 
                      İndirme sorunu yaşarsanız e-postanızı kontrol edin veya yeniden gönder butonunu kullanın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sonraki Adımlar</h2>
            <p className="text-muted-foreground">
              Programınızdan en iyi şekilde faydalanmak için aşağıdaki adımları takip edin.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Programı İnceleyin",
                description: "Çalışma programınızı detaylıca inceleyerek hedeflerinizi ve ders programınızı anlamaya çalışın.",
                icon: <FileDown className="w-8 h-8" />,
              },
              {
                title: "Takviminize Ekleyin",
                description: "Programın takvim formatını indirerek dijital takviminize ekleyin ve bildirimleri açın.",
                icon: <Clock className="w-8 h-8" />,
              },
              {
                title: "Düzenli Tekrar Edin",
                description: "Programınıza göre belirli aralıklarla düzenli tekrarlar yaparak bilgilerin kalıcılığını artırın.",
                icon: <ArrowRight className="w-8 h-8" />,
              }
            ].map((step, index) => (
              <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-10">
            <Link href="/" passHref>
              <Button variant="outline" className="gap-2">
                Ana Sayfaya Dön
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 