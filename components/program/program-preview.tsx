"use client";

import { useState } from "react";
import { ProgramCalendar } from "@/components/program/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Demo program verileri
const createDemoProgram = () => {
  const examDate = new Date();
  examDate.setMonth(examDate.getMonth() + 3); // 3 ay sonra
  
  const startDate = new Date();
  
  const schedules = [];
  // 12 haftalık örnek program oluştur
  for (let i = 0; i < 84; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Cumartesi ve pazar günleri daha yoğun program
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const totalTime = isWeekend ? 360 : 240; // 4 veya 6 saat
    
    const subjects = [];
    
    if (date.getDay() % 7 === 1) { // Pazartesi
      subjects.push({
        name: "Matematik",
        duration: 90,
        topics: ["Fonksiyonlar", "Türev Uygulamaları", "Problem Çözümü"]
      });
      subjects.push({
        name: "Fizik",
        duration: 60,
        topics: ["Elektrik", "Manyetizma", "Problemler"]
      });
      subjects.push({
        name: "Tekrar ve Test",
        duration: 60,
        topics: ["Günlük test çözümü", "Hata analizi"]
      });
    } else if (date.getDay() % 7 === 2) { // Salı
      subjects.push({
        name: "Kimya",
        duration: 90,
        topics: ["Organik Kimya", "Reaksiyonlar", "Çözünürlük"]
      });
      subjects.push({
        name: "Biyoloji",
        duration: 60,
        topics: ["Hücre", "Sistemler", "Genetik"]
      });
      subjects.push({
        name: "Tekrar ve Test",
        duration: 60,
        topics: ["Günlük test çözümü", "Hata analizi"]
      });
    } else if (date.getDay() % 7 === 3) { // Çarşamba
      subjects.push({
        name: "Türkçe",
        duration: 90,
        topics: ["Paragraf", "Dil Bilgisi", "Anlam Bilgisi"]
      });
      subjects.push({
        name: "Coğrafya",
        duration: 60,
        topics: ["Türkiye Coğrafyası", "Dünya Coğrafyası"]
      });
      subjects.push({
        name: "Tekrar ve Test",
        duration: 60,
        topics: ["Günlük test çözümü", "Hata analizi"]
      });
    } else if (date.getDay() % 7 === 4) { // Perşembe
      subjects.push({
        name: "Matematik",
        duration: 90,
        topics: ["İntegral", "Limit", "Problemler"]
      });
      subjects.push({
        name: "Tarih",
        duration: 60,
        topics: ["Osmanlı Tarihi", "Cumhuriyet Tarihi"]
      });
      subjects.push({
        name: "Tekrar ve Test",
        duration: 60,
        topics: ["Günlük test çözümü", "Hata analizi"]
      });
    } else if (date.getDay() % 7 === 5) { // Cuma
      subjects.push({
        name: "Geometri",
        duration: 90,
        topics: ["Üçgenler", "Dörtgenler", "Katı Cisimler"]
      });
      subjects.push({
        name: "Felsefe",
        duration: 60,
        topics: ["Bilgi Felsefesi", "Ahlak", "Sanat"]
      });
      subjects.push({
        name: "Tekrar ve Test",
        duration: 60,
        topics: ["Günlük test çözümü", "Hata analizi"]
      });
    } else if (date.getDay() % 7 === 6) { // Cumartesi
      subjects.push({
        name: "Matematik",
        duration: 120,
        topics: ["Fonksiyonlar", "Türev", "İntegral", "Problemler"]
      });
      subjects.push({
        name: "Fizik",
        duration: 90,
        topics: ["Mekanik", "Elektrik", "Manyetizma"]
      });
      subjects.push({
        name: "Kimya",
        duration: 90,
        topics: ["Organik Kimya", "Karışımlar", "Asit-Baz"]
      });
      subjects.push({
        name: "Deneme Sınavı",
        duration: 60,
        topics: ["Haftalık mini deneme"]
      });
    } else { // Pazar
      subjects.push({
        name: "Türkçe",
        duration: 90,
        topics: ["Paragraf", "Dilbilgisi", "Anlam Bilgisi"]
      });
      subjects.push({
        name: "Biyoloji",
        duration: 90,
        topics: ["Hücre", "Sistemler", "Genetik"]
      });
      subjects.push({
        name: "Sosyal Bilimler",
        duration: 90,
        topics: ["Tarih", "Coğrafya", "Felsefe"]
      });
      subjects.push({
        name: "Haftalık Değerlendirme",
        duration: 60,
        topics: ["Eksik Kalan Konular", "Sonraki Hafta Planlaması"]
      });
    }
    
    schedules.push({
      date,
      subjects,
      totalStudyTime: totalTime
    });
  }
  
  return {
    examDate,
    startDate,
    examType: "YKS",
    schedules
  };
};

interface ProgramPreviewProps {
  programId: string;
  onPurchase: () => void;
}

export function ProgramPreview({ programId, onPurchase }: ProgramPreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [isApplying, setIsApplying] = useState<boolean>(false);
  
  // Demo program verileri
  const demoProgram = createDemoProgram();
  
  // Örnek önizleme verileri
  const previewData = {
    name: "YKS Çalışma Programı",
    examType: "YKS",
    examDate: demoProgram.examDate.toISOString(),
    totalWeeks: 12,
    keyAreas: ["Matematik", "Fizik", "Kimya", "Biyoloji"],
    focusStrategy: "Zayıf olduğunuz alanlara daha fazla zaman ayıran denge odaklı program",
    price: 99,
    currency: "₺",
    features: [
      "Detaylı günlük çalışma programı",
      "Haftalık ve aylık ilerleme planı",
      "Konu tekrar zamanları",
      "Düzenli test çözüm seansları",
      "PDF olarak indirme imkanı",
      "Öğrenme analizi ve takibi",
      "E-posta ile program gönderimi",
      "Güncellenebilir program"
    ]
  };
  
  const handleApplyDiscount = () => {
    if (!discountCode) return;
    
    setIsApplying(true);
    // Normalde bir API isteği yapılırdı
    setTimeout(() => {
      // Sadece "WELCOME10" indirim kodunu kabul ediyoruz
      if (discountCode.toUpperCase() === "WELCOME10") {
        alert("İndirim kodu uygulandı! %10 indirim kazandınız.");
      } else {
        alert("Geçersiz indirim kodu.");
      }
      setIsApplying(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{previewData.name}</CardTitle>
                  <CardDescription>
                    Sınav: {previewData.examType} | Tarih: {new Date(previewData.examDate).toLocaleDateString("tr-TR")}
                  </CardDescription>
                </div>
                <Badge className="bg-primary/90">{previewData.totalWeeks} Haftalık Program</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Program Özeti</h3>
                <p>
                  Bu program, {previewData.examType} sınavına hazırlık için {previewData.totalWeeks} haftalık 
                  bir çalışma planı sunmaktadır. {previewData.focusStrategy}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Odaklanılan Alanlar</h3>
                <div className="flex flex-wrap gap-2">
                  {previewData.keyAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="bg-primary/10">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                    <TabsTrigger value="calendar">Takvim</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Zayıf alanlarınız için</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Programınız zayıf olduğunuz konulara daha fazla zaman ayırır.</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">12 Haftalık Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Günlük, haftalık ve aylık çalışma planı içerir.</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Özelleştirilmiş</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Çalışma alışkanlıklarınıza ve tercihlerinize göre özelleştirilmiştir.</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-md relative overflow-hidden">
                      <div className="blur-sm">
                        <h4 className="font-medium mb-2">Haftalık İlerleme Planı</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Hafta 1</span>
                            <span>Temel Konular</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: "10%" }}></div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Hafta 2</span>
                            <span>Asal Konular</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: "20%" }}></div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Hafta 3</span>
                            <span>Genişletilmiş Konular</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
                        <p className="font-medium text-center px-4">
                          İlerleme planını görmek için programı satın alın
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="calendar" className="mt-4">
                    <ProgramCalendar 
                      examDate={demoProgram.examDate}
                      examType={demoProgram.examType}
                      startDate={demoProgram.startDate}
                      schedules={demoProgram.schedules}
                      previewMode={true}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programı Satın Al</CardTitle>
              <CardDescription>
                Kişiselleştirilmiş çalışma programınızı satın alarak tüm detaylara erişebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Standart Program</span>
                <span className="font-bold text-xl">{previewData.price} {previewData.currency}</span>
              </div>
              
              <ul className="space-y-2">
                {previewData.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4 mt-4 border-t">
                <label htmlFor="discount" className="block text-sm font-medium mb-2">
                  İndirim Kuponu
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="discount"
                    placeholder="İndirim kodu giriniz..."
                    className="flex-1"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyDiscount}
                    disabled={isApplying || !discountCode}
                  >
                    {isApplying ? "Uygulanıyor..." : "Uygula"}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button onClick={onPurchase} className="w-full">
                Satın Al
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ekstra Avantajlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 text-primary">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Verimli Zaman Kullanımı:</span> Çalışma saatlerinizden maksimum fayda sağlayın.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 text-primary">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Stres Azaltma:</span> Planlı çalışma stresi azaltır ve motivasyonu arttırır.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 text-primary">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Güncellenebilir Plan:</span> Gelişiminize göre programınızı güncelleyebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProgramPreview; 