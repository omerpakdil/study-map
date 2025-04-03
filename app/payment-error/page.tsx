"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorReason, setErrorReason] = useState<string>("Bilinmeyen hata");
  
  useEffect(() => {
    if (searchParams) {
      const reason = searchParams.get("reason");
      if (reason) {
        setErrorReason(decodeURIComponent(reason));
      }
    }
  }, [searchParams]);
  
  return (
    <div className="w-full flex justify-center py-10">
      <div className="container max-w-4xl px-4 md:px-6">
        <motion.div 
          className="max-w-md mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-destructive/30">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Ödeme Hatası</CardTitle>
            </CardHeader>
            
            <CardContent className="pb-4">
              <p className="mb-6 text-muted-foreground">
                Ödeme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyiniz veya farklı bir ödeme yöntemi kullanınız.
              </p>
              
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 text-sm">
                <p><strong>Hata Detayı:</strong> {errorReason}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Olası Çözümler:</h3>
                <ul className="text-sm text-left list-disc pl-5 space-y-2">
                  <li>Kart bilgilerinizi kontrol edin ve tekrar deneyin</li>
                  <li>Farklı bir ödeme yöntemi veya kart kullanın</li>
                  <li>Bankanız ile iletişime geçerek online ödemelere izin verildiğinden emin olun</li>
                  <li>Internet bağlantınızı kontrol edin</li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                onClick={() => router.back()}
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ödeme Sayfasına Dön
              </Button>
              
              <Button 
                className="w-full" 
                onClick={() => router.push("/")}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 