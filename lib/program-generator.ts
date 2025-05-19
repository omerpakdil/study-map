import { addDays, format, startOfDay, differenceInDays, addWeeks, isWeekend } from "date-fns";
import { tr } from "date-fns/locale";

// Gün isimleri
const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Program tipi tanımı
export interface StudyProgram {
  id: string;
  title: string;
  examType: string;
  examDate: string;
  studentName: string;
  email: string;
  createdAt: string;
  totalWeeks: number;
  topicRatings: Record<string, Record<string, number>>; // Ders > Konu > Değerlendirme
  weeks: Week[];
  notes: string[];
  subjectPriorities?: string[]; // Konu öncelik sıralaması
}

export interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: Day[];
}

export interface Day {
  date: string;
  dayName: string;
  subjects: Subject[];
}

export interface Subject {
  name: string;
  duration: number;
  topics: string[];
}

// Sınav türleri
export enum ExamType {
  SAT = "SAT",
  ACT = "ACT",
  GRE = "GRE",
  GMAT = "GMAT",
  MCAT = "MCAT",
  PSAT = "PSAT",
  LSAT = "LSAT",
  TOEFL = "TOEFL",
  IELTS = "IELTS",
  AP = "AP",
  IB = "IB"
}

// Sınav türlerine göre dersler ve konular
export const examSubjects: Record<ExamType, { name: string, difficulty: number, topics: string[] }[]> = {
  [ExamType.SAT]: [
    {
      name: "Matematik",
      difficulty: 4,
      topics: [
        "Cebir", "Doğrusal Denklemler", "Karmaşık Sayılar", "Polinomlar",
        "Fonksiyonlar", "İkinci Derece Denklemler", "Rasyonel İfadeler",
        "Radikaller", "Üçgenler", "Katı Cisimler", "İstatistik", "Olasılık",
        "Veri Analizi", "Trigonometri", "Koordinat Geometrisi"
      ]
    },
    {
      name: "Okuma ve Yazma",
      difficulty: 3,
      topics: [
        "Gramer", "Kelime Bilgisi", "Cümle Yapısı", "Okuma Anlama",
        "Ana Fikir Bulma", "Çıkarım Yapma", "Yazarın Amacı", "Metin Yapısı",
        "Noktalama İşaretleri", "Makale Analizi", "Tarz ve Ton", "Retorik"
      ]
    },
    {
      name: "Essay",
      difficulty: 3,
      topics: [
        "Giriş Yazma", "Tez Oluşturma", "Argüman Geliştirme", "Delilleri Kullanma",
        "Sonuç Yazma", "Düzenleme", "Dilbilgisi", "Kelime Seçimi", "Akıcılık"
      ]
    }
  ],
  [ExamType.ACT]: [
    {
      name: "Matematik",
      difficulty: 4,
      topics: [
        "Cebir", "Geometri", "Trigonometri", "İstatistik", "Olasılık", 
        "Sayılar", "Koordinat Düzlemi", "Matrisler", "Eşitsizlikler",
        "Fonksiyonlar", "Logaritmalar", "Permütasyon ve Kombinasyon"
      ]
    },
    {
      name: "İngilizce",
      difficulty: 3,
      topics: [
        "Gramer", "Cümle Yapısı", "Noktalama", "Retorik Beceriler",
        "Yazım Kuralları", "Paragraf Organizasyonu", "Üslup"
      ]
    },
    {
      name: "Okuma",
      difficulty: 3,
      topics: [
        "Ana Fikir Bulma", "Detay Sorular", "Çıkarım", "Referans Soruları",
        "Kelime Bilgisi", "Metin Analizi", "Yazarın Amacı ve Bakış Açısı"
      ]
    },
    {
      name: "Fen Bilimleri",
      difficulty: 3,
      topics: [
        "Biyoloji", "Kimya", "Fizik", "Dünya Bilimleri", "Bilimsel Araştırma",
        "Veri Yorumlama", "Deney Tasarımı", "Bilimsel Modeller"
      ]
    },
    {
      name: "Essay",
      difficulty: 2,
      topics: [
        "Perspektif Analizi", "Argüman Geliştirme", "Tez Oluşturma", "Düzenleme",
        "Dilbilgisi ve Kelime Kullanımı"
      ]
    }
  ],
  [ExamType.GRE]: [
    {
      name: "Sözel Akıl Yürütme",
      difficulty: 4,
      topics: [
        "Okuma Kavrama", "Metin Tamamlama", "Cümle Eşleştirme", "Kelime Bilgisi",
        "Analitik Akıl Yürütme", "Çıkarım Yapma", "Yazarın Amacını Belirleme"
      ]
    },
    {
      name: "Niceliksel Akıl Yürütme",
      difficulty: 4,
      topics: [
        "Aritmetik", "Cebir", "Geometri", "Veri Analizi", "İstatistik",
        "Olasılık", "Problem Çözme Stratejileri", "Matematiksel Modelleme"
      ]
    },
    {
      name: "Analitik Yazma",
      difficulty: 4,
      topics: [
        "Argüman Analizi", "Konu Analizi", "Yazı Organizasyonu", "Kritik Düşünme",
        "Tez Geliştirme", "Kanıt Kullanımı", "Dilbilgisi ve Mekanik"
      ]
    }
  ],
  [ExamType.GMAT]: [
    {
      name: "Niceliksel Bölüm",
      difficulty: 5,
      topics: [
        "Problem Çözme", "Veri Yeterliliği", "Aritmetik", "Cebir", "Geometri",
        "İstatistik", "Olasılık", "Kombinasyon ve Permütasyon", "Optimizasyon"
      ]
    },
    {
      name: "Sözel Bölüm",
      difficulty: 4,
      topics: [
        "Okuduğunu Anlama", "Kritik Akıl Yürütme", "Cümle Düzeltme",
        "Mantıksal Çıkarım", "Argüman Değerlendirme", "Analitik Düşünme"
      ]
    },
    {
      name: "Entegre Akıl Yürütme",
      difficulty: 4,
      topics: [
        "Grafik Yorumlama", "Çoklu Kaynak Analizi", "Tablo Analizi",
        "İstatistiksel Akıl Yürütme", "Sözel ve Niceliksel Sentez"
      ]
    },
    {
      name: "Analitik Yazı",
      difficulty: 3,
      topics: [
        "Argüman Analizi", "Organizasyon", "Kanıt Kullanımı",
        "Mantıksal Tutarlılık", "Dilbilgisi ve Üslup"
      ]
    }
  ],
  [ExamType.MCAT]: [
    {
      name: "Biyolojik ve Biyokimyasal Temeller",
      difficulty: 5,
      topics: [
        "Biyokimya", "Organik Kimya", "Genel Kimya", "Biyoloji",
        "Hücre Biyolojisi", "Genetik", "Anatomi", "Fizyoloji"
      ]
    },
    {
      name: "Fiziksel Bilimler",
      difficulty: 4,
      topics: [
        "Fizik", "Genel Kimya", "Organik Kimya", "Biyofizik",
        "Termodinamik", "Elektrokimya", "Mekanik", "Dalgalar ve Optik"
      ]
    },
    {
      name: "Psikolojik ve Sosyal Temeller",
      difficulty: 4,
      topics: [
        "Psikoloji", "Sosyoloji", "Davranış Bilimleri", "Beyin ve Sinir Sistemi",
        "Algı ve Bilinç", "Kimlik ve Kişilik", "Sosyal Etkileşim"
      ]
    },
    {
      name: "Kritik Analiz ve Akıl Yürütme",
      difficulty: 4,
      topics: [
        "Metin Analizi", "Bilimsel Akıl Yürütme", "Çıkarım Yapma",
        "Argüman Değerlendirme", "Araştırma Tasarımı", "Veri Yorumlama"
      ]
    }
  ],
  [ExamType.LSAT]: [
    {
      name: "Mantıksal Akıl Yürütme",
      difficulty: 5,
      topics: [
        "Mantık Oyunları", "Grup Oluşturma", "Sıralama", "Sınıflandırma",
        "Doğru/Yanlış Eşleştirme", "Koşullu Mantık", "Tümdengelim"
      ]
    },
    {
      name: "Okuma Kavrama",
      difficulty: 4,
      topics: [
        "Hukuki Metinler", "Bilimsel Metinler", "Ana Fikir Bulma", "Çıkarım Yapma",
        "Yazarın Tutumu", "Analoji ve Metafor Anlama", "Metin Yapısı"
      ]
    },
    {
      name: "Mantıksal Akıl Yürütme",
      difficulty: 5,
      topics: [
        "Argüman Analizi", "Mantık Hataları", "Varsayımları Belirleme",
        "Argümanı Güçlendirme/Zayıflatma", "Paralel Akıl Yürütme"
      ]
    },
    {
      name: "Yazma Bölümü",
      difficulty: 4,
      topics: [
        "Argüman Geliştirme", "Tez Oluşturma", "Kanıt Kullanımı",
        "Karşı Argümanları Ele Alma", "Yapısal Organizasyon"
      ]
    }
  ],
  [ExamType.PSAT]: [
    {
      name: "Matematik",
      difficulty: 3,
      topics: [
        "Cebir", "Problem Çözme", "Veri Analizi", "Geometri", "Trigonometri",
        "Fonksiyonlar", "Polinomlar", "Denklemler", "Eşitsizlikler"
      ]
    },
    {
      name: "Okuma ve Yazma",
      difficulty: 3,
      topics: [
        "Okuma Anlama", "Kelime Bilgisi", "Gramer", "Cümle Yapısı",
        "Makale Analizi", "Yazım Kuralları", "Dilbilgisi Kullanımı"
      ]
    }
  ],
  [ExamType.TOEFL]: [
    {
      name: "Okuma",
      difficulty: 3,
      topics: [
        "Akademik Metinler", "Ana Fikir Bulma", "Detay Sorular",
        "Kelime Bilgisi", "Çıkarım Yapma", "Retorik Amaç", "Metin Organizasyonu"
      ]
    },
    {
      name: "Dinleme",
      difficulty: 3,
      topics: [
        "Akademik Dersler", "Diyaloglar", "Ana Fikir Bulma", "Detay Sorular",
        "Konuşmacının Tutumu", "Organizasyon", "Dinleme Stratejileri"
      ]
    },
    {
      name: "Konuşma",
      difficulty: 4,
      topics: [
        "Bağımsız Konuşma", "Entegre Konuşma", "Açıklama Yapma",
        "Fikir Savunma", "Bilgi Sentezleme", "Telaffuz", "Akıcılık"
      ]
    },
    {
      name: "Yazma",
      difficulty: 4,
      topics: [
        "Entegre Yazma", "Bağımsız Yazma", "Tez Geliştirme", "Destekleyici Detaylar",
        "Organizasyon", "Dilbilgisi", "Kelime Kullanımı", "Tutarlılık"
      ]
    }
  ],
  [ExamType.IELTS]: [
    {
      name: "Dinleme",
      difficulty: 3,
      topics: [
        "Günlük Konuşmalar", "Akademik Konuşmalar", "Ana Fikir", "Detay Sorular",
        "Konuşmacının Tutumu", "Tamamlama Soruları", "Eşleştirme Soruları"
      ]
    },
    {
      name: "Okuma",
      difficulty: 3,
      topics: [
        "Akademik Metinler", "Başlık Eşleştirme", "Bilgi Yerleştirme", 
        "Çoktan Seçmeli", "Cümle Tamamlama", "Kelime Bilgisi", "Çıkarım"
      ]
    },
    {
      name: "Yazma",
      difficulty: 4,
      topics: [
        "Task 1 (Grafik/Tablo Analizi)", "Task 2 (Makale Yazma)", "Organizasyon",
        "Paragraf Yapısı", "Kelime Çeşitliliği", "Dilbilgisi Doğruluğu"
      ]
    },
    {
      name: "Konuşma",
      difficulty: 4,
      topics: [
        "Kişisel Sorular", "Uzun Konuşma", "Tartışma", "Telaffuz",
        "Akıcılık", "Dilbilgisi", "Kelime Kullanımı", "Tutarlılık"
      ]
    }
  ],
  [ExamType.AP]: [
    {
      name: "Calculus AB/BC",
      difficulty: 4,
      topics: [
        "Limitler", "Türevler", "İntegraller", "Diferansiyel Denklemler",
        "Seri", "Parametrik Denklemler", "Kutupsal Koordinatlar"
      ]
    },
    {
      name: "Fizik",
      difficulty: 4,
      topics: [
        "Mekanik", "Elektrik ve Manyetizma", "Termodinamik", "Dalgalar ve Optik",
        "Modern Fizik", "Akışkanlar", "Kinetik Teori"
      ]
    },
    {
      name: "Biyoloji",
      difficulty: 4,
      topics: [
        "Hücre", "Genetik", "Evrim", "Ekoloji", "Fizyoloji",
        "Moleküler Biyoloji", "Laboratuvar Teknikleri"
      ]
    },
    {
      name: "Kimya",
      difficulty: 4,
      topics: [
        "Atom Yapısı", "Kimyasal Bağlar", "Termodinamik", "Kinetik", "Denge",
        "Elektrokimya", "Organik Kimya", "Analitik Teknikler"
      ]
    },
    {
      name: "İngilizce Edebiyatı",
      difficulty: 3,
      topics: [
        "Edebi Analiz", "Retorik Analiz", "Kompozisyon", "Şiir Analizi",
        "Düzyazı Analizi", "Drama Analizi", "Edebi Eleştiri"
      ]
    },
    {
      name: "ABD Tarihi",
      difficulty: 3,
      topics: [
        "Kolonyal Dönem", "Amerikan Devrimi", "İç Savaş", "Yeniden Yapılanma",
        "Sanayi Devrimi", "Dünya Savaşları", "Soğuk Savaş", "Modern ABD"
      ]
    }
  ],
  [ExamType.IB]: [
    {
      name: "Matematik",
      difficulty: 4,
      topics: [
        "Cebir", "Fonksiyonlar", "Trigonometri", "Matematik İstatistik ve Olasılık",
        "Kalkülüs", "Geometri", "Ayrık Matematik", "Matematiksel Modelleme"
      ]
    },
    {
      name: "Fizik",
      difficulty: 4,
      topics: [
        "Ölçümler", "Mekanik", "Termal Fizik", "Dalgalar", "Elektrik ve Manyetizma",
        "Dairesel Hareket", "Atom Fiziği", "Enerji", "Kuantum Fiziği"
      ]
    },
    {
      name: "Kimya",
      difficulty: 4,
      topics: [
        "Stokiyometri", "Atom Teorisi", "Periyodik", "Bağlanma", "Enerjetik",
        "Kinetik", "Denge", "Asitler ve Bazlar", "Redoks", "Organik Kimya"
      ]
    },
    {
      name: "Biyoloji",
      difficulty: 4,
      topics: [
        "Hücre Biyolojisi", "Moleküler Biyoloji", "Genetik", "Ekoloji",
        "Evrim", "İnsan Fizyolojisi", "Bitki Biyolojisi", "Nörobiyoloji"
      ]
    },
    {
      name: "İngilizce A",
      difficulty: 4,
      topics: [
        "Edebi Analiz", "Yorumlama", "Karşılaştırmalı Analiz", "Yaratıcı Yazı",
        "Dil Kullanımı", "Edebi Eleştiri", "Kültürel Bağlam"
      ]
    },
    {
      name: "Tarih",
      difficulty: 3,
      topics: [
        "Otoriterlik", "Savaşlar", "Soğuk Savaş", "Dekolonizasyon", "Emperyalizm",
        "Milliyetçilik", "Devrimler", "20. Yüzyıl Tarihi", "Bölgesel Tarih"
      ]
    },
    {
      name: "Ekonomi",
      difficulty: 3,
      topics: [
        "Mikroekonomi", "Makroekonomi", "Uluslararası Ekonomi", "Kalkınma Ekonomisi",
        "Piyasa Başarısızlıkları", "Ekonomik Büyüme", "İstihdam", "Fiyat İstikrarı"
      ]
    }
  ]
};

interface ProgramParams {
  id: string;
  examType: ExamType;
  examDate: Date;
  startDate: Date;
  studentName: string;
  email: string;
  topicRatings: Record<string, Record<string, number>>;
  subjectPriorities?: string[]; // Konu öncelik sıralaması
  dailyStudyHours: number;
  weekendStudyHours: number;
  includeBreaks: boolean;
}

/**
 * Kişiselleştirilmiş çalışma programı oluşturan fonksiyon
 * @param params Program parametreleri
 * @returns Oluşturulan çalışma programı
 */
export function generateStudyProgram(params: ProgramParams): StudyProgram {
  const {
    id,
    examType,
    examDate,
    startDate,
    studentName,
    email,
    topicRatings,
    subjectPriorities = [],
    dailyStudyHours,
    weekendStudyHours,
    includeBreaks
  } = params;

  // Sınav ve başlangıç tarihi arasındaki gün sayısını hesapla
  const daysBetween = differenceInDays(examDate, startDate);
  
  // Toplam hafta sayısını hesapla
  const totalWeeks = Math.ceil(daysBetween / 7);
  
  // Ders ağırlıklarını belirleme (konulardaki değerlendirmeye göre)
  const subjectWeights = calculateSubjectWeights(examType, topicRatings, subjectPriorities);
  
  // Haftaları oluştur
  const weeks: Week[] = [];
  let currentDate = startOfDay(startDate);
  
  for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
    const weekStartDate = new Date(currentDate);
    const weekEndDate = addDays(currentDate, 6);
    
    // Günleri oluştur
    const days: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentDate, i);
      
      // Sınav tarihini geçtiyse boş gün ekle
      if (date > examDate) {
        days.push({
          date: format(date, "yyyy-MM-dd"),
          dayName: getDayName(date),
          subjects: []
        });
        continue;
      }
      
      // Tarihi string olarak biçimlendir
      const dateStr = format(date, "yyyy-MM-dd");
      
      // Günün zamanlamasını belirle (hafta içi/hafta sonu)
      const isWeekendDay = isWeekend(date);
      const dailyHours = isWeekendDay ? weekendStudyHours : dailyStudyHours;
      
      // Günlük toplam dakika
      const totalMinutes = dailyHours * 60;
      
      // Günün derslerini oluştur
      const subjects = generateDailySubjects(
        examType,
        subjectWeights,
        totalMinutes,
        weekNumber,
        totalWeeks,
        includeBreaks
      );
      
      days.push({
        date: dateStr,
        dayName: getDayName(date),
        subjects
      });
    }
    
    weeks.push({
      weekNumber,
      startDate: format(weekStartDate, "yyyy-MM-dd"),
      endDate: format(weekEndDate, "yyyy-MM-dd"),
      days
    });
    
    // Sonraki haftanın başlangıcına git
    currentDate = addDays(currentDate, 7);
  }
  
  // Program notlarını oluştur - zayıf konuları belirle
  const weakAreas = findWeakAreas(topicRatings);
  const notes = generateProgramNotes(examType, weakAreas, totalWeeks);
  
  return {
    id,
    title: `${examType} Çalışma Programı`,
    examType,
    examDate: format(examDate, "yyyy-MM-dd"),
    studentName,
    email,
    createdAt: format(new Date(), "yyyy-MM-dd"),
    totalWeeks,
    topicRatings,
    weeks,
    notes,
    subjectPriorities
  };
}

/**
 * Konu değerlendirmelerine göre ağırlık hesaplama
 */
function calculateSubjectWeights(
  examType: ExamType,
  topicRatings: Record<string, Record<string, number>>,
  subjectPriorities: string[] = []
): Record<string, Record<string, number>> {
  const subjects = examSubjects[examType];
  const weights: Record<string, Record<string, number>> = {};
  
  // Tüm dersler ve konuları için temel ağırlıkları belirle
  subjects.forEach(subject => {
    weights[subject.name] = {};
    
    subject.topics.forEach(topic => {
      // Varsayılan olarak konu zorluğunu kullan
      weights[subject.name][topic] = subject.difficulty;
      
      // Eğer kullanıcı değerlendirmesi varsa, onu kullan
      if (topicRatings && 
          topicRatings[subject.name] && 
          topicRatings[subject.name][topic] !== undefined) {
        
        // Değerlendirmeyi direkt kullan (1: zayıf, 5: güçlü)
        // 1 değerlendirmesi = yüksek ağırlık, 5 değerlendirmesi = düşük ağırlık
        const rating = topicRatings[subject.name][topic];
        
        // Değerlendirmeye göre katsayı belirle (3.0x - 1.0x)
        // 1 (çok zayıf) -> 3.0x, 2 -> 2.5x, 3 -> 2.0x, 4 -> 1.5x, 5 (çok iyi) -> 1.0x
        const factor = 3.5 - (rating * 0.5); // 3.0, 2.5, 2.0, 1.5, 1.0
        
        // Ağırlığı güncelle
        weights[subject.name][topic] = subject.difficulty * factor;
      }
    });
    
    // Öncelik sıralamasını dikkate al ve ağırlık ekle
    if (subjectPriorities && subjectPriorities.length > 0) {
      const priorityIndex = subjectPriorities.indexOf(subject.name);
      if (priorityIndex !== -1) {
        // Öncelik sıralamasına göre bir çarpan ekle (öncelik arttıkça çarpan da artar)
        // priorityIndex 0 (en yüksek öncelik) = 1.5x, 1 = 1.4x, 2 = 1.3x, ...
        const priorityFactor = Math.max(1, 1.5 - (priorityIndex * 0.1));
        
        // Her konu için ağırlıkları çarp
        Object.keys(weights[subject.name]).forEach(topic => {
          weights[subject.name][topic] *= priorityFactor;
        });
      }
    }
  });
  
  return weights;
}

/**
 * Zayıf alanları belirle (1 ve 2 değerlendirmeler)
 */
function findWeakAreas(topicRatings: Record<string, Record<string, number>>): string[] {
  const weakAreas: string[] = [];
  
  // Zayıf konuları belirle ve dersleri ekle
  Object.entries(topicRatings).forEach(([subject, topics]) => {
    let hasWeakTopic = false;
    
    Object.entries(topics).forEach(([topic, rating]) => {
      // 1 ve 2 değerlendirmeler zayıf kabul edilir
      if (rating <= 2) {
        hasWeakTopic = true;
      }
    });
    
    if (hasWeakTopic && !weakAreas.includes(subject)) {
      weakAreas.push(subject);
    }
  });
  
  return weakAreas;
}

/**
 * Günlük dersleri oluşturma
 */
function generateDailySubjects(
  examType: ExamType,
  subjectWeights: Record<string, Record<string, number>>,
  totalMinutes: number,
  weekNumber: number,
  totalWeeks: number,
  includeBreaks: boolean
): Subject[] {
  const subjects = examSubjects[examType];
  const dailySubjects: Subject[] = [];
  
  // Mola zamanını hesapla (eğer molalar dahilse)
  const breakTimeMinutes = includeBreaks ? Math.floor(totalMinutes * 0.15) : 0;
  const studyTimeMinutes = totalMinutes - breakTimeMinutes;
  
  // Ağırlıkların toplamını hesapla
  const totalWeight = Object.values(subjectWeights).reduce((sum, weights) => sum + Object.values(weights).reduce((subSum, weight) => subSum + weight, 0), 0);
  
  // Çalışma zamanını ağırlıklara göre dağıt
  const subjectMinutes: Record<string, Record<string, number>> = {};
  
  subjects.forEach(subject => {
    subjectMinutes[subject.name] = {};
    subject.topics.forEach(topic => {
      const weight = subjectWeights[subject.name][topic] || subject.difficulty;
      subjectMinutes[subject.name][topic] = Math.floor((weight / totalWeight) * studyTimeMinutes);
    });
  });
  
  // Sınava yaklaştıkça, zayıf alanlara daha fazla zaman ayır
  const progressRatio = weekNumber / totalWeeks;
  
  // Dersleri oluştur
  for (const subject of subjects) {
    // Sınava yaklaştıkça, zayıf alanlara daha fazla zaman ayır
    const subjectTopics = Object.keys(subjectWeights[subject.name]);
    let subjectTime = subjectTopics.reduce((sum, topic) => sum + subjectMinutes[subject.name][topic], 0);
    
    // Son 1/3 süreçte, zayıf alanlara %20 daha fazla zaman ayır
    if (progressRatio > 0.66) {
      subjectTime = Math.floor(subjectTime * 1.2);
    }
    
    // Minimum çalışma süresi (30dk)
    if (subjectTime < 30) {
      subjectTime = 30;
    }
    
    // 15 dakikanın katlarına yuvarla
    subjectTime = Math.floor(subjectTime / 15) * 15;
    
    // Konular arasından o haftaya uygun olanları seç
    const topicCount = Math.floor(Math.random() * 2) + 1; // 1-2 konu
    const topics = selectTopicsForWeek(subjectTopics, weekNumber, totalWeeks, progressRatio);
    
    dailySubjects.push({
      name: subject.name,
      duration: subjectTime,
      topics: topics.slice(0, topicCount)
    });
  }
  
  // Eğer molalar dahil edilecekse, mola ekle
  if (includeBreaks && breakTimeMinutes > 0) {
    dailySubjects.push({
      name: "Mola",
      duration: breakTimeMinutes,
      topics: ["Dinlenme", "Zihin Tazeleme"]
    });
  }
  
  return dailySubjects;
}

/**
 * O haftaya uygun konuları seçer
 */
function selectTopicsForWeek(
  allTopics: string[], 
  weekNumber: number, 
  totalWeeks: number,
  progressRatio: number
): string[] {
  // İlerleme oranına göre konuları seç
  const topicIndex = Math.floor(progressRatio * allTopics.length);
  
  // Sınav tarihine yaklaşırken tekrar konularını da dahil et
  if (progressRatio > 0.7) {
    // Son dönemde tekrar ve pratik yap
    return ["Tekrar ve Pekiştirme", "Test Çözümü", "Deneme Sınavı"];
  } else if (progressRatio > 0.5) {
    // Orta dönemde hem yeni konular hem tekrar
    const selectedTopics = allTopics.slice(topicIndex, topicIndex + 2);
    return [...selectedTopics, "Önceki Konuların Tekrarı"];
  } else {
    // İlk dönemde temel konulara odaklan
    return allTopics.slice(topicIndex, topicIndex + 3);
  }
}

/**
 * Çalışma programı için notlar oluşturur
 */
function generateProgramNotes(examType: ExamType, weakAreas: string[], totalWeeks: number): string[] {
  const notes = [
    "Her gün düzenli olarak çalışmaya özen gösterin.",
    "Anlamadığınız konuları not alın ve ertesi gün tekrar edin."
  ];
  
  // Zayıf alanlar için tavsiyeler
  if (weakAreas.length > 0) {
    notes.push(`Zayıf alanlarınız olan ${weakAreas.join(', ')} konularına daha fazla zaman ayırın.`);
  }
  
  // Sınav türüne göre özel notlar
  switch (examType) {
    case ExamType.SAT:
      notes.push("Deneme sınavları çözerek eksik konularınızı belirleyin.");
      notes.push("Günde en az 20-30 soru çözmeye çalışın.");
      break;
    case ExamType.ACT:
      notes.push("Mantık sorularına özel zaman ayırın.");
      notes.push("Süre yönetimi için zamanlı testler çözün.");
      break;
    case ExamType.GRE:
      notes.push("Sözel ve niceliksel bölümler arasında dengeli çalışın.");
      notes.push("Geometri konularına ayrıca önem verin.");
      break;
    case ExamType.GMAT:
      notes.push("Sözel ve niceliksel bölümler arasında dengeli çalışın.");
      notes.push("Geometri konularına ayrıca önem verin.");
      break;
    case ExamType.MCAT:
      notes.push("Fiziksel ve biyolojik konular arasında dengeli çalışın.");
      notes.push("Bilimsel araştırma ve veri analizine önem verin.");
      break;
    case ExamType.LSAT:
      notes.push("Mantık ve okuma kavramına özel zaman ayırın.");
      notes.push("Sınav türüne uygun testler çözün.");
      break;
    case ExamType.PSAT:
      notes.push("Matematik ve okuma konularına özel zaman ayırın.");
      notes.push("Sınav türüne uygun testler çözün.");
      break;
    case ExamType.TOEFL:
      notes.push("Okuma ve dinleme konularına özel zaman ayırın.");
      notes.push("Sınav türüne uygun testler çözün.");
      break;
    case ExamType.IELTS:
      notes.push("Dinleme ve okuma konularına özel zaman ayırın.");
      notes.push("Sınav türüne uygun testler çözün.");
      break;
    case ExamType.AP:
      notes.push("Temel konulara odaklanın ve genişletilmiş konuları da içeren çalışma programı oluşturun.");
      notes.push("Genişletilmiş konularınızı öncelikle çalışın.");
      break;
    case ExamType.IB:
      notes.push("Temel konulara odaklanın ve genişletilmiş konuları da içeren çalışma programı oluşturun.");
      notes.push("Genişletilmiş konularınızı öncelikle çalışın.");
      break;
  }
  
  // Zaman planlaması ile ilgili not
  if (totalWeeks < 8) {
    notes.push("Sınava hazırlık süreniz kısıtlı. Verimli çalışmaya odaklanın ve öncelikli konuları belirleyin.");
  } else if (totalWeeks > 16) {
    notes.push("Uzun hazırlık sürecinde motivasyonunuzu korumak için küçük hedefler belirleyin.");
  }
  
  return notes;
}

/**
 * Gün adını döndüren yardımcı fonksiyon
 */
function getDayName(date: Date): string {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return dayNames[dayIndex];
} 