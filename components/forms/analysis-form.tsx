"use client";

import React from "react";
import { useState } from "react";
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

// Form şeması
const analysisFormSchema = z.object({
  // Kişisel bilgiler
  name: z.string().optional(),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  country: z.string().min(1, { message: "Lütfen bir ülke seçin" }),
  examType: z.string().min(1, { message: "Lütfen bir sınav türü seçin" }),
  examDate: z.string().min(1, { message: "Lütfen sınav tarihini seçin" }),
  
  // Çalışma alışkanlıkları
  hoursPerDay: z.number().min(1).max(12),
  availableDays: z.array(z.string()),
  preferredTime: z.enum(["morning", "afternoon", "evening"]),
  concentrationSpan: z.number().min(10).max(120),
  breakFrequency: z.number().min(10).max(120),
  breakDuration: z.number().min(5).max(30),
  
  // Konu analizi
  subjectAnalysis: z.record(z.object({
    level: z.enum(["strong", "medium", "weak"]),
    difficulty: z.number().min(1).max(5),
    priority: z.number().min(1).max(5),
    notes: z.string().optional(),
  })),
  
  // Hedefler
  overallGoal: z.string().min(1, { message: "Lütfen genel hedefinizi belirtin" }),
  targetScore: z.number().optional(),
  targetRanking: z.number().optional(),
  motivationFactors: z.array(z.string()),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

const defaultValues: Partial<AnalysisFormValues> = {
  country: "TR",
  hoursPerDay: 4,
  availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  preferredTime: "afternoon",
  concentrationSpan: 45,
  breakFrequency: 45,
  breakDuration: 10,
  subjectAnalysis: {},
  motivationFactors: [],
};

// Ülkeler
const countries = [
  { code: "TR", name: "Türkiye" },
  { code: "US", name: "Amerika Birleşik Devletleri" },
  { code: "GB", name: "İngiltere" },
  { code: "DE", name: "Almanya" },
  { code: "FR", name: "Fransa" },
  { code: "IT", name: "İtalya" },
  { code: "ES", name: "İspanya" },
  { code: "IN", name: "Hindistan" },
];

// Sınav türleri (Ülkeye göre filtrelenir)
const examTypes = {
  TR: [
    { code: "YKS", name: "YKS (AYT, TYT)" },
    { code: "LGS", name: "LGS" },
    { code: "KPSS", name: "KPSS" },
    { code: "ALES", name: "ALES" },
    { code: "YDS", name: "YDS/YÖKDİL" },
  ],
  US: [
    { code: "SAT", name: "SAT" },
    { code: "ACT", name: "ACT" },
    { code: "GRE", name: "GRE" },
    { code: "GMAT", name: "GMAT" },
    { code: "MCAT", name: "MCAT" },
  ],
  GB: [
    { code: "A_Levels", name: "A-Levels" },
    { code: "GCSE", name: "GCSE" },
    { code: "IELTS", name: "IELTS" },
    { code: "Cambridge", name: "Cambridge Exams" },
  ],
  DE: [
    { code: "Abitur", name: "Abitur" },
    { code: "TestAS", name: "TestAS" },
    { code: "DSH", name: "DSH" },
    { code: "TestDaF", name: "TestDaF" },
  ],
  IN: [
    { code: "JEE", name: "JEE (Main & Advanced)" },
    { code: "NEET", name: "NEET" },
    { code: "CAT", name: "CAT" },
    { code: "GATE", name: "GATE" },
  ],
};

export function AnalysisForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("personal-info");
  const [selectedCountry, setSelectedCountry] = useState<string>("TR");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setValue("country", value);
    form.setValue("examType", ""); // Ülke değişince sınav tipi sıfırlanır
    setSelectedExamType("");
    setSubjects([]);
  };

  const handleExamTypeChange = (value: string) => {
    setSelectedExamType(value);
    form.setValue("examType", value);
    
    // Sınav tipine göre konuları belirleme
    let examSubjects: string[] = [];
    
    if (value === "YKS") {
      examSubjects = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih", "Coğrafya", "Felsefe"];
    } else if (value === "LGS") {
      examSubjects = ["Matematik", "Fen Bilimleri", "Türkçe", "İnkılap Tarihi", "İngilizce", "Din Kültürü"];
    } else if (value === "KPSS") {
      examSubjects = ["Genel Kültür", "Genel Yetenek", "Eğitim Bilimleri", "Alan Bilgisi"];
    } else if (value === "YDS") {
      examSubjects = ["Kelime Bilgisi", "Dilbilgisi", "Okuma-Anlama", "Çeviri"];
    } else if (value === "SAT") {
      examSubjects = ["Reading", "Writing", "Math", "Essay"];
    } else if (value === "GRE") {
      examSubjects = ["Verbal Reasoning", "Quantitative Reasoning", "Analytical Writing"];
    } else {
      examSubjects = ["Konu 1", "Konu 2", "Konu 3", "Konu 4"];
    }
    
    setSubjects(examSubjects);
    
    // Konuları form state'e ekleme
    const subjectAnalysis: Record<string, any> = {};
    examSubjects.forEach(subject => {
      subjectAnalysis[subject] = {
        level: "medium",
        difficulty: 3,
        priority: 3,
        notes: ""
      };
    });
    
    form.setValue("subjectAnalysis", subjectAnalysis);
  };

  const handleSubmit = async (values: AnalysisFormValues) => {
    setIsSubmitting(true);
    
    try {
      // API'ye veri gönderme işlemi burada yapılacak
      console.log(values);
      
      // Başarılı olursa önizleme sayfasına yönlendir
      // Normalde API'den dönen program ID'si ile yönlendirilecek
      router.push(`/preview/12345`);
    } catch (error) {
      console.error("Form submission error:", error);
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
            
            <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                      <label htmlFor="country" className="block text-sm font-medium mb-2">
                        Ülke <span className="text-red-500">*</span>
                      </label>
                      <Select defaultValue={selectedCountry} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ülke seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <h3 className="text-lg font-medium">Konu Yetkinlik Analizi</h3>
                      <p className="text-sm text-muted-foreground">
                        Konularınızdaki yetkinlik seviyenizi belirleyin.
                        Bu bilgi, programınızın eksik olduğunuz konulara daha fazla zaman ayırmasını sağlayacaktır.
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
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-medium">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                              Zayıf Olduğunuz Konular
                            </div>
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                              Orta Seviyede Olduğunuz Konular
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              Güçlü Olduğunuz Konular
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {subjects.map((subject) => (
                              <div 
                                key={subject} 
                                className="p-4 border rounded-lg hover:border-primary transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="font-medium">{subject}</div>
                                  <div className="w-full sm:w-auto">
                                    <RadioGroup
                                      defaultValue={form.watch(`subjectAnalysis.${subject}.level`) || "medium"}
                                      onValueChange={(value) => 
                                        form.setValue(`subjectAnalysis.${subject}.level`, value as "strong" | "medium" | "weak")
                                      }
                                      className="flex w-full"
                                    >
                                      <div className="flex items-center flex-1">
                                        <RadioGroupItem value="weak" id={`${subject}-weak`} className="sr-only" />
                                        <Label
                                          htmlFor={`${subject}-weak`}
                                          className={`flex-1 cursor-pointer rounded-l-md border px-3 py-2 text-center text-sm ${
                                            form.watch(`subjectAnalysis.${subject}.level`) === "weak"
                                              ? "border-red-500 bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100"
                                              : "border-muted bg-background hover:bg-muted/50"
                                          }`}
                                        >
                                          Zayıf
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center flex-1">
                                        <RadioGroupItem value="medium" id={`${subject}-medium`} className="sr-only" />
                                        <Label
                                          htmlFor={`${subject}-medium`}
                                          className={`flex-1 cursor-pointer border-y px-3 py-2 text-center text-sm ${
                                            form.watch(`subjectAnalysis.${subject}.level`) === "medium"
                                              ? "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                                              : "border-muted bg-background hover:bg-muted/50"
                                          }`}
                                        >
                                          Orta
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center flex-1">
                                        <RadioGroupItem value="strong" id={`${subject}-strong`} className="sr-only" />
                                        <Label
                                          htmlFor={`${subject}-strong`}
                                          className={`flex-1 cursor-pointer rounded-r-md border px-3 py-2 text-center text-sm ${
                                            form.watch(`subjectAnalysis.${subject}.level`) === "strong"
                                              ? "border-green-500 bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100"
                                              : "border-muted bg-background hover:bg-muted/50"
                                          }`}
                                        >
                                          Güçlü
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>
                                
                                <div className="mt-4 space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Zorluk Derecesi</span>
                                      <span>{form.watch(`subjectAnalysis.${subject}.difficulty`) || 3}/5</span>
                                    </div>
                                    <Slider
                                      defaultValue={[form.watch(`subjectAnalysis.${subject}.difficulty`) || 3]}
                                      min={1}
                                      max={5}
                                      step={1}
                                      onValueChange={(value: number[]) => 
                                        form.setValue(`subjectAnalysis.${subject}.difficulty`, value[0])
                                      }
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Öncelik Sırası</span>
                                      <span>{form.watch(`subjectAnalysis.${subject}.priority`) || 3}/5</span>
                                    </div>
                                    <Slider
                                      defaultValue={[form.watch(`subjectAnalysis.${subject}.priority`) || 3]}
                                      min={1}
                                      max={5}
                                      step={1}
                                      onValueChange={(value: number[]) => 
                                        form.setValue(`subjectAnalysis.${subject}.priority`, value[0])
                                      }
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label htmlFor={`${subject}-notes`} className="text-sm font-medium">
                                      Notlar (Opsiyonel)
                                    </label>
                                    <Input
                                      id={`${subject}-notes`}
                                      placeholder="Bu konu hakkında eklemek istediğiniz notlar..."
                                      value={form.watch(`subjectAnalysis.${subject}.notes`) || ""}
                                      onChange={(e) => 
                                        form.setValue(`subjectAnalysis.${subject}.notes`, e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
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
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Hedefleriniz</h3>
                      <p className="text-sm text-muted-foreground">
                        Hedefleriniz, çalışma programınızın şekillenmesinde önemli bir rol oynayacaktır.
                        Lütfen gerçekçi ve ulaşılabilir hedefler belirleyin.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="overallGoal" className="block text-sm font-medium mb-2">
                          Genel Hedefiniz <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="overallGoal"
                          placeholder="Örn: Tıp fakültesine girmek, İlk 10.000'e girmek, vb."
                          {...form.register("overallGoal")}
                        />
                        {form.formState.errors.overallGoal && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.overallGoal.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="targetScore" className="block text-sm font-medium mb-2">
                            Hedef Puan (Opsiyonel)
                          </label>
                          <Input
                            id="targetScore"
                            type="number"
                            placeholder="Hedeflediğiniz puan"
                            value={form.watch("targetScore") || ""}
                            onChange={(e) => form.setValue("targetScore", 
                              e.target.value ? Number(e.target.value) : undefined
                            )}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="targetRanking" className="block text-sm font-medium mb-2">
                            Hedef Sıralama (Opsiyonel)
                          </label>
                          <Input
                            id="targetRanking"
                            type="number"
                            placeholder="Hedeflediğiniz sıralama"
                            value={form.watch("targetRanking") || ""}
                            onChange={(e) => form.setValue("targetRanking", 
                              e.target.value ? Number(e.target.value) : undefined
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                          Motivasyon Faktörleri
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { id: "career", label: "Kariyer hedefleri" },
                            { id: "family", label: "Aile desteği" },
                            { id: "personal", label: "Kişisel tatmin" },
                            { id: "competition", label: "Rekabet duygusu" },
                            { id: "academic", label: "Akademik başarı" },
                            { id: "financial", label: "Finansal fırsatlar" },
                            { id: "future", label: "Geleceği güvence altına alma" },
                            { id: "passion", label: "İlgi alanlarına yönelme" },
                            { id: "social", label: "Sosyal statü" }
                          ].map((factor) => (
                            <div key={factor.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`factor-${factor.id}`}
                                checked={form.watch("motivationFactors")?.includes(factor.id)}
                                onCheckedChange={(checked) => {
                                  const currentFactors = form.watch("motivationFactors") || [];
                                  if (checked) {
                                    form.setValue("motivationFactors", [...currentFactors, factor.id]);
                                  } else {
                                    form.setValue(
                                      "motivationFactors",
                                      currentFactors.filter((f) => f !== factor.id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`factor-${factor.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {factor.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("subject-analysis")}
                    >
                      Geri
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <span className="mr-2">Gönderiliyor...</span>
                          <svg
                            className="animate-spin h-4 w-4 text-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </div>
                      ) : (
                        "Program Oluştur"
                      )}
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

export default AnalysisForm; 