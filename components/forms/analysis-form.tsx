"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ExamType, examSubjects } from "@/lib/program-generator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DragHandleDots2Icon, PlusIcon, MinusIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { tr } from "date-fns/locale";

// Form şeması
const analysisFormSchema = z.object({
  // Kişisel bilgiler
  name: z.string().optional(),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  examType: z.string().min(1, { message: "Lütfen bir sınav türü seçin" }),
  examDate: z.string().min(1, { message: "Lütfen sınav tarihini seçin" }),
  
  // Çalışma alışkanlıkları
  hoursPerDay: z.number().min(1).max(12),
  availableDays: z.array(z.string()),
  preferredTime: z.enum(["morning", "afternoon", "evening"]),
  concentrationSpan: z.number().min(10).max(120),
  breakFrequency: z.number().min(10).max(120),
  breakDuration: z.number().min(5).max(30),
  
  // Konu analizi - yeni model
  topicRatings: z.record(z.record(z.number().min(1).max(5))),
  
  // Konu öncelik sıralaması
  subjectPriorities: z.array(z.string()).optional(),
  
  // Hedefler
  overallGoal: z.string().min(1, { message: "Lütfen genel hedefinizi belirtin" }),
  targetScore: z.number().optional(),
  targetRanking: z.number().optional(),
  motivationFactors: z.array(z.string()).default([]),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

const defaultValues: Partial<AnalysisFormValues> = {
  hoursPerDay: 4,
  availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  preferredTime: "afternoon",
  concentrationSpan: 45,
  breakFrequency: 45,
  breakDuration: 10,
  topicRatings: {},
  subjectPriorities: [], // Varsayılan boş öncelik listesi
  motivationFactors: [],
};

// Ülkeler
const countries = [
  { code: "US", name: "Amerika Birleşik Devletleri" }
];

// Sınav türleri - Sadece Amerika sınavları
const examTypes = {
  US: [
    { code: "SAT", name: "SAT" },
    { code: "ACT", name: "ACT" },
    { code: "GRE", name: "Graduate Record Examination (GRE)" },
    { code: "GMAT", name: "Graduate Management Admission Test (GMAT)" },
    { code: "MCAT", name: "Medical College Admission Test (MCAT)" },
    { code: "PSAT", name: "Preliminary SAT (PSAT)" },
    { code: "LSAT", name: "Law School Admission Test (LSAT)" },
    { code: "TOEFL", name: "Test of English as a Foreign Language (TOEFL)" },
    { code: "IELTS", name: "International English Language Testing System (IELTS)" },
    { code: "AP", name: "Advanced Placement (AP) Sınavları" },
    { code: "IB", name: "International Baccalaureate (IB) Sınavları" },
  ]
};

// Subject icon helper function
// Bu fonksiyon ders ismine göre uygun simge döndürür
function getSubjectIcon(subject: string) {
  // Türkçe ve İngilizce ders isimleri için eşleştirme
  switch (subject.toLowerCase()) {
    case "matematik":
    case "math":
    case "mathematics":
    case "calculus":
      return "M";
    case "fizik":
    case "physics":
    case "fiziksel bilimler":
      return "F";
    case "kimya":
    case "chemistry":
      return "K";
    case "biyoloji":
    case "biology":
    case "biyolojik":
      return "B";
    case "türkçe":
    case "turkish":
      return "T";
    case "ingilizce":
    case "english":
    case "reading":
    case "writing":
    case "okuma":
    case "yazma":
    case "essay":
    case "dinleme":
    case "listening":
    case "konuşma":
    case "speaking":
      return "E";
    case "tarih":
    case "history":
    case "abd tarihi":
      return "T";
    case "coğrafya":
    case "geography":
      return "C";
    case "fen bilimleri":
    case "science":
    case "fen":
      return "F";
    case "mantıksal akıl yürütme":
    case "niceliksel akıl yürütme":
    case "sözel akıl yürütme":
    case "sözel bölüm":
    case "niceliksel bölüm":
    case "verbal reasoning":
    case "quantitative reasoning":
    case "analytical writing":
    case "entegre akıl yürütme":
    case "analitik yazma":
    case "kritik analiz":
    case "analytical":
      return "A";
    case "ekonomi":
    case "economics":
      return "E";
    case "psikolojik ve sosyal temeller":
    case "psychology":
    case "sociology":
      return "P";
    default:
      // İlk harfini büyük olarak döndür
      return subject.charAt(0).toUpperCase();
  }
}

export function AnalysisForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("personal-info");
  const [selectedCountry] = useState<string>("US"); // Sabit olarak US
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Öncelikli konu sıralaması için state
  const [prioritizedSubjects, setPrioritizedSubjects] = useState<string[]>([]);
  const [draggedSubject, setDraggedSubject] = useState<string | null>(null);

  const form = useForm({
    // @ts-ignore - TypeScript errors with Zod schema inference
    resolver: zodResolver(analysisFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleExamTypeChange = (value: string) => {
    setSelectedExamType(value);
    form.setValue("examType", value);
    
    // Sınav tipine göre konuları belirleme
    let examSubjectsList: string[] = [];
    
    if (Object.values(ExamType).includes(value as ExamType)) {
      // Eğer desteklenen bir sınav türüyse, kütüphaneden konuları al
      const subjectData = examSubjects[value as ExamType];
      examSubjectsList = subjectData.map(subject => subject.name);
      
      // Konuların değerlendirmelerini form state'e ekleme
      const topicRatings: Record<string, Record<string, number>> = {};
      
      subjectData.forEach(subject => {
        topicRatings[subject.name] = {};
        // Her konu için varsayılan değerlendirme: 3 (orta)
        subject.topics.forEach(topic => {
          topicRatings[subject.name][topic] = 3;
        });
      });
      
      form.setValue("topicRatings", topicRatings);
    } else {
      // Desteklenmeyen bir sınav türü için örnek konular - Amerika sınavlarına göre güncellendi
      if (value === "PSAT") {
        examSubjectsList = ["Matematik", "Okuma ve Yazma"];
      } else if (value === "SAT") {
        examSubjectsList = ["Matematik", "Okuma ve Yazma", "Essay"];
      } else if (value === "ACT") {
        examSubjectsList = ["Matematik", "İngilizce", "Okuma", "Fen Bilimleri", "Essay"];
      } else if (value === "GRE") {
        examSubjectsList = ["Sözel Akıl Yürütme", "Niceliksel Akıl Yürütme", "Analitik Yazma"];
      } else if (value === "GMAT") {
        examSubjectsList = ["Niceliksel Bölüm", "Sözel Bölüm", "Entegre Akıl Yürütme", "Analitik Yazı"];
      } else if (value === "MCAT") {
        examSubjectsList = ["Biyolojik ve Biyokimyasal Temeller", "Fiziksel Bilimler", "Psikolojik ve Sosyal Temeller", "Kritik Analiz ve Akıl Yürütme"];
      } else if (value === "LSAT") {
        examSubjectsList = ["Mantıksal Akıl Yürütme", "Okuma Kavrama", "Yazma Bölümü"];
      } else if (value === "TOEFL") {
        examSubjectsList = ["Okuma", "Dinleme", "Konuşma", "Yazma"];
      } else if (value === "IELTS") {
        examSubjectsList = ["Dinleme", "Okuma", "Yazma", "Konuşma"];
      } else if (value === "AP") {
        examSubjectsList = ["Calculus AB/BC", "Fizik", "Biyoloji", "Kimya", "İngilizce Edebiyatı", "ABD Tarihi"];
      } else if (value === "IB") {
        examSubjectsList = ["Matematik", "Fizik", "Kimya", "Biyoloji", "İngilizce A", "Tarih", "Ekonomi"];
      } else {
        examSubjectsList = ["Konu 1", "Konu 2", "Konu 3", "Konu 4"];
      }
      
      // Örnek konular için boş bir değerlendirme oluştur
      const topicRatings: Record<string, Record<string, number>> = {};
      examSubjectsList.forEach(subject => {
        topicRatings[subject] = {
          "Genel": 3  // Desteklenmeyen sınavlar için sadece genel değerlendirme
        };
      });
      
      form.setValue("topicRatings", topicRatings);
    }
    
    setSubjects(examSubjectsList);
    // Konular değiştiğinde, öncelik listesini de güncelle
    setPrioritizedSubjects(examSubjectsList);
    form.setValue("subjectPriorities", examSubjectsList);
  };

  // Konu sürükleme başlangıcını işle
  const handleDragStart = (subject: string) => {
    setDraggedSubject(subject);
  };

  // Konu sürükleme bitişini işle
  const handleDragEnd = () => {
    setDraggedSubject(null);
  };

  // Sürüklenen konunun yeni konumunu hesapla
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSubject === null) return;
    
    const currentList = [...prioritizedSubjects];
    const draggedIndex = currentList.indexOf(draggedSubject);
    
    if (draggedIndex === index) return;
    
    const newList = [...currentList];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedSubject);
    
    setPrioritizedSubjects(newList);
    form.setValue("subjectPriorities", newList);
  };

  const handleSubmit = async (values: AnalysisFormValues) => {
    setIsSubmitting(true);
    console.log("Form gönderiliyor...", values);
    
    try {
      // API'ye gönderilecek verileri hazırla
      const programData = {
        examType: values.examType,
        examDate: values.examDate,
        studentName: values.name || "Adsız Öğrenci",
        email: values.email,
        topicRatings: values.topicRatings || {},
        subjectPriorities: values.subjectPriorities || prioritizedSubjects,
        dailyStudyHours: values.hoursPerDay || 3,
        weekendStudyHours: (values.hoursPerDay || 3) + 1,
        includeBreaks: true
      };
      
      console.log("Program verileri:", JSON.stringify(programData, null, 2));
      
      // Program oluşturma API'sine istek gönder
      console.log("API isteği gönderiliyor: /api/program/generate");
      
      try {
      const response = await fetch('/api/program/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });
        
        console.log("API yanıtı:", response.status, response.statusText);
        
        const errorText = await response.text();
        console.log("API yanıt metni:", errorText);
      
      if (!response.ok) {
          console.error("API hata yanıtı:", errorText);
          throw new Error(`Program oluşturulurken bir hata oluştu: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
        try {
          const result = JSON.parse(errorText);
          console.log("API başarılı yanıt (parsed):", result);
      
      if (result.success && result.programId) {
        // Başarılı olursa önizleme sayfasına yönlendir
            console.log("Yönlendiriliyor:", `/preview/${result.programId}`);
        router.push(`/preview/${result.programId}`);
      } else {
            console.error("Beklenmeyen API yanıtı:", result);
            throw new Error("Program ID bulunamadı");
          }
        } catch (parseError) {
          console.error("JSON parse hatası:", parseError);
          throw new Error("API yanıtı geçerli bir JSON değil");
        }
      } catch (fetchError: any) {
        console.error("Fetch hatası:", fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Form gönderim hatası:", error);
      console.error("Hata detayları:", error.stack);
      alert(`Program oluşturma hatası: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full">
      <Tabs defaultValue="personal-info" value={currentStep} onValueChange={setCurrentStep}>
        <div className="flex justify-center w-full mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-4xl">
            <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="study-habits">Çalışma Alışkanlıkları</TabsTrigger>
            <TabsTrigger value="subject-analysis">Konu Analizi</TabsTrigger>
            <TabsTrigger value="goals">Hedefler</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex justify-center w-full">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>
                {currentStep === "personal-info" && "Kişisel Bilgiler ve Sınav Seçimi"}
                {currentStep === "study-habits" && "Çalışma Alışkanlıkları"}
                {currentStep === "subject-analysis" && "Konu Analizi"}
                {currentStep === "goals" && "Hedefler"}
              </CardTitle>
            </CardHeader>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Form doğrulama hatalarını kontrol et
                if (Object.keys(form.formState.errors).length > 0) {
                  console.error("Form hataları:", form.formState.errors);
                  alert("Lütfen form alanlarını kontrol edin ve tekrar deneyin.");
                  return;
                }
                
                // Gerekli alanların doldurulduğundan emin ol
                if (!form.getValues("examType") || !form.getValues("examDate") || !form.getValues("email")) {
                  alert("Lütfen gerekli alanları doldurun: Sınav Türü, Sınav Tarihi ve E-posta");
                  return;
                }
                
                // Form verilerini al ve gönder
                const values = form.getValues();
                handleSubmit(values as AnalysisFormValues);
              }}
            >
              <CardContent className="space-y-6">
                <TabsContent value="personal-info" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        İsim (Opsiyonel)
                      </label>
                      <Input
                        id="name"
                        placeholder="İsminiz"
                        {...form.register("name")}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        E-posta <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        placeholder="ornek@email.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="examType" className="block text-sm font-medium mb-2">
                        Sınav Türü <span className="text-red-500">*</span>
                      </label>
                      <Select
                        onValueChange={handleExamTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sınav türü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes[selectedCountry as keyof typeof examTypes]?.map((exam) => (
                            <SelectItem key={exam.code} value={exam.code}>
                              {exam.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.examType && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.examType.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="examDate" className="block text-sm font-medium mb-2">
                        Sınav Tarihi <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="examDate"
                        type="date"
                        {...form.register("examDate")}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {form.formState.errors.examDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.examDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep("study-habits")}
                    >
                      İleri
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="study-habits" className="space-y-6">
                  <div className="space-y-6">
                    {/* Günlük çalışma saati */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Günde kaç saat çalışabilirsiniz? <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">1 saat</span>
                            <span className="text-sm">{form.watch("hoursPerDay") || 4} saat</span>
                            <span className="text-sm">12 saat</span>
                          </div>
                          <Slider
                            defaultValue={[form.watch("hoursPerDay") || 4]}
                            min={1}
                            max={12}
                            step={1}
                            onValueChange={(value: number[]) => form.setValue("hoursPerDay", value[0])}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Müsait günler */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium mb-1">
                        Haftanın hangi günleri müsaitsiniz? <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { id: "monday", label: "Pazartesi" },
                          { id: "tuesday", label: "Salı" },
                          { id: "wednesday", label: "Çarşamba" },
                          { id: "thursday", label: "Perşembe" },
                          { id: "friday", label: "Cuma" },
                          { id: "saturday", label: "Cumartesi" },
                          { id: "sunday", label: "Pazar" }
                        ].map((day) => (
                          <div key={day.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.id}`}
                              checked={form.watch("availableDays")?.includes(day.id)}
                              onCheckedChange={(checked) => {
                                const currentDays = form.watch("availableDays") || [];
                                if (checked) {
                                  form.setValue("availableDays", [...currentDays, day.id]);
                                } else {
                                  form.setValue(
                                    "availableDays",
                                    currentDays.filter((d) => d !== day.id)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`day-${day.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tercih edilen çalışma zamanı */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium mb-1">
                        Hangi zaman diliminde daha verimli çalışırsınız? <span className="text-red-500">*</span>
                      </label>
                      <RadioGroup
                        defaultValue={form.watch("preferredTime")}
                        onValueChange={(value) => form.setValue("preferredTime", value as "morning" | "afternoon" | "evening")}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="morning" id="morning" />
                          <Label htmlFor="morning">Sabah</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="afternoon" id="afternoon" />
                          <Label htmlFor="afternoon">Öğleden Sonra</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evening" id="evening" />
                          <Label htmlFor="evening">Akşam</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Konsantrasyon ve mola bilgileri */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Konsantrasyon süresi */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                          Konsantrasyon süreniz (dk) <span className="text-red-500">*</span>
                        </label>
                        <Select
                          defaultValue={String(form.watch("concentrationSpan"))}
                          onValueChange={(value) => form.setValue("concentrationSpan", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 25, 30, 45, 60, 90, 120].map((time) => (
                              <SelectItem key={time} value={String(time)}>
                                {time} dakika
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Kesintisiz konsantre olabildiğiniz süre
                        </p>
                      </div>
                      
                      {/* Mola sıklığı */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                          Mola sıklığı (dk) <span className="text-red-500">*</span>
                        </label>
                        <Select
                          defaultValue={String(form.watch("breakFrequency"))}
                          onValueChange={(value) => form.setValue("breakFrequency", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sıklık seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 25, 30, 45, 60, 90, 120].map((time) => (
                              <SelectItem key={time} value={String(time)}>
                                {time} dakika
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Mola verme sıklığınız
                        </p>
                      </div>
                      
                      {/* Mola süresi */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                          Mola süresi (dk) <span className="text-red-500">*</span>
                        </label>
                        <Select
                          defaultValue={String(form.watch("breakDuration"))}
                          onValueChange={(value) => form.setValue("breakDuration", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20, 30].map((time) => (
                              <SelectItem key={time} value={String(time)}>
                                {time} dakika
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Tercih ettiğiniz mola süresi
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("personal-info")}
                    >
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep("subject-analysis")}
                    >
                      İleri
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="subject-analysis" className="space-y-6">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Konu Analizi ve Önceliklendirme</h3>
                      <p className="text-sm text-muted-foreground">
                        Bu adımda, çalışacağınız konuları önceliklendirip, her birindeki yetkinlik seviyenizi belirleyeceksiniz.
                        Bu bilgiler, programınızın kişiselleştirilmesinde kullanılacaktır.
                      </p>
                      
                      {subjects.length === 0 ? (
                        <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
                          <div className="text-center">
                            <p className="text-muted-foreground mb-2">
                              Konu analizi için lütfen önce kişisel bilgiler adımından sınav türünüzü seçin.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCurrentStep("personal-info")}
                            >
                              Kişisel Bilgilere Dön
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* 1. Konu Önceliklendirme Sistemi */}
                          <div className="mb-8">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium mb-4">1. Ders Öncelik Sıralaması</h3>
                              <div className="text-xs text-muted-foreground italic">
                                Sürükle & bırak ile yeniden sıralayın
                            </div>
                            </div>
                            
                            <div className="bg-white/30 dark:bg-white/5 p-4 rounded-xl border border-border shadow-sm">
                              <p className="text-sm text-muted-foreground mb-4">
                                Dersleri öncelik sırasına göre düzenleyin. Listede en üstte yer alan ders programda en çok öncelik verilecek derstir.
                              </p>
                              <div className="space-y-2">
                                {prioritizedSubjects.map((subject, index) => (
                                  <div
                                    key={subject}
                                    draggable
                                    onDragStart={() => handleDragStart(subject)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    className={clsx(
                                      "flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border cursor-move transition-all",
                                      draggedSubject === subject ? "opacity-50 border-primary" : "border-border",
                                      "hover:border-primary hover:shadow-md"
                                    )}
                                  >
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted mr-3">
                                        {index + 1}
                            </div>
                                      <span>{subject}</span>
                            </div>
                                    <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* 2. Konu Yetkinlik Analizi */}
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium mb-4">2. Ders Yetkinlik Analizi</h3>
                            </div>
                            
                            {/* Değerlendirme Ölçeği */}
                            <div className="grid grid-cols-5 gap-2 text-center text-sm font-medium mb-6">
                              <div className="p-2.5 bg-red-100 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800/30 hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-1">
                                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                                </div>
                                <span>Hiç Bilmiyorum</span>
                              </div>  
                              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/20 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800/30 hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-1">
                                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                                </div>
                                <span>Az Biliyorum</span>
                              </div>
                              <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg shadow-sm border border-yellow-200 dark:border-yellow-800/30 hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-1">
                                  <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">3</div>
                                </div>
                                <span>Orta Seviye</span>
                              </div>
                              <div className="p-2.5 bg-teal-100 dark:bg-teal-900/20 rounded-lg shadow-sm border border-teal-200 dark:border-teal-800/30 hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-1">
                                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">4</div>
                                </div>
                                <span>İyi Biliyorum</span>
                              </div>
                              <div className="p-2.5 bg-green-100 dark:bg-green-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-800/30 hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-1">
                                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">5</div>
                                </div>
                                <span>Çok İyi Biliyorum</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">
                              Her bir konu için yetkinlik seviyenizi 1'den 5'e kadar değerlendirin.
                              Bu değerlendirme, zayıf olduğunuz konulara daha fazla zaman ayırmanızı sağlayacaktır.
                            </p>
                          
                          <div className="space-y-3">
                            <Accordion type="multiple" className="w-full">
                              {subjects.map((subject) => {
                                // Desteklenen bir sınav türü mü kontrol et
                                const isInExamSubjects = Object.values(ExamType).includes(selectedExamType as ExamType) && 
                                                       examSubjects[selectedExamType as ExamType].some(s => s.name === subject);
                                  
                                // Eğer desteklenen bir sınav türüyse, dersin konularını al  
                                const subjectTopics = isInExamSubjects 
                                  ? examSubjects[selectedExamType as ExamType].find(s => s.name === subject)?.topics || []
                                  : ["Genel"];
                                    
                                  // Dersin zorluk derecesini al
                                  const difficulty = isInExamSubjects
                                    ? examSubjects[selectedExamType as ExamType].find(s => s.name === subject)?.difficulty || 3
                                    : 3;
                                    
                                  // Dersin simgesini belirle
                                  const icon = getSubjectIcon(subject);
                                  
                                  // Değerlendirmelerin ortalamasını hesapla
                                  let avgRating = 3;
                                  let totalRatings = 0;
                                  let ratingsCount = 0;
                                  
                                  const topicRatings = form.getValues("topicRatings");
                                  if (topicRatings && subject in topicRatings) {
                                    const ratings = topicRatings[subject] || {};
                                    for (const topic in ratings) {
                                      if (ratings[topic]) {
                                        totalRatings += ratings[topic];
                                        ratingsCount++;
                                      }
                                    }
                                    if (ratingsCount > 0) {
                                      avgRating = Math.round(totalRatings / ratingsCount);
                                    }
                                  }
                                  
                                  // Progress göstergesi için renk
                                  const progressColor = 
                                    avgRating <= 2 ? "bg-red-500" :
                                    avgRating === 3 ? "bg-yellow-500" :
                                    "bg-green-500";
                                  
                                return (
                                    <AccordionItem key={subject} value={subject} className="border-border rounded-lg mb-3 overflow-hidden shadow-sm border bg-white/30 dark:bg-white/5">
                                      <AccordionTrigger className="px-4 py-3 hover:bg-accent hover:no-underline data-[state=open]:bg-accent flex items-center">
                                        <div className="flex flex-1 items-center">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                            {icon}
                                          </div>
                                          <div className="flex-1">
                                            <span className="text-base font-medium">{subject}</span>
                                            <div className="flex items-center mt-1">
                                              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                  className={`h-full ${progressColor} transition-all`} 
                                                  style={{ width: `${(avgRating / 5) * 100}%` }} 
                                                />
                                              </div>
                                              <span className="text-xs text-muted-foreground ml-2">
                                                Zorluk: {difficulty}/5
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <PlusIcon className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:hidden" />
                                        <MinusIcon className="h-4 w-4 shrink-0 transition-transform duration-200 hidden data-[state=open]:block" />
                                    </AccordionTrigger>
                                      
                                      <AccordionContent className="pb-3 px-4">
                                        <div className="pt-2 pb-1 space-y-4">
                                          {subjectTopics.map((topic, topicIndex) => (
                                            <div key={`${subject}-${topic}`} className="space-y-1">
                                              <div className="flex justify-between items-center">
                                                <label 
                                                  htmlFor={`${subject}-${topic}-rating`} 
                                                  className="text-sm font-medium"
                                                >
                                                  {topic}
                                                </label>
                                                <div className="text-xs text-muted-foreground">
                                                  Yetkinlik: {form.getValues(`topicRatings.${subject}.${topic}`) || 3}/5
                                                  </div>
                                              </div>
                                              
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs font-medium text-muted-foreground">Düşük</span>
                                                <Slider
                                                  id={`${subject}-${topic}-rating`}
                                                  min={1}
                                                  max={5}
                                                  step={1}
                                                  defaultValue={[form.getValues(`topicRatings.${subject}.${topic}`) || 3]}
                                                  onValueChange={(value) => {
                                                    form.setValue(`topicRatings.${subject}.${topic}`, value[0], { shouldDirty: true });
                                                  }}
                                                  className="flex-1"
                                                />
                                                <span className="text-xs font-medium text-muted-foreground">Yüksek</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                );
                              })}
                            </Accordion>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("study-habits")}
                    >
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep("goals")}
                    >
                      İleri
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="goals" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="overallGoal" className="block text-sm font-medium mb-2">
                        Genel Hedef <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="overallGoal"
                        placeholder="Örnek: Üniversiteye giriş"
                        {...form.register("overallGoal")}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="targetScore" className="block text-sm font-medium mb-2">
                        Hedef Puanı (Opsiyonel)
                      </label>
                      <Input
                        id="targetScore"
                        type="number"
                        {...form.register("targetScore", {
                          valueAsNumber: true,
                          setValueAs: (v) => v === "" ? undefined : isNaN(parseInt(v)) ? undefined : parseInt(v, 10)
                        })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="targetRanking" className="block text-sm font-medium mb-2">
                        Hedef Sıralaması (Opsiyonel)
                      </label>
                      <Input
                        id="targetRanking"
                        type="number"
                        {...form.register("targetRanking", {
                          valueAsNumber: true,
                          setValueAs: (v) => v === "" ? undefined : isNaN(parseInt(v)) ? undefined : parseInt(v, 10)
                        })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="motivationFactors" className="block text-sm font-medium mb-2">
                        Motivasyon Faktörleri (Opsiyonel)
                      </label>
                      <Input
                        id="motivationFactors"
                        placeholder="Örnek: Sınav hazırlığı, okul işleri"
                        defaultValue=""
                        {...form.register("motivationFactors", {
                          setValueAs: (v: any) => {
                            if (!v) return [];
                            if (Array.isArray(v)) return v;
                            if (typeof v === 'string') {
                              // Boş string kontrolü
                              if (v.trim() === '') return [];
                              return v.split(',').map((item: string) => item.trim());
                            }
                            return [];
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep("subject-analysis")}
                    >
                      Geri
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⚙️</span>
                          Program Oluşturuluyor...
                        </>
                      ) : "Program Oluştur"}
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </form>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}