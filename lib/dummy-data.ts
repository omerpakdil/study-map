import { addDays, format, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

// Türkçe gün isimleri
const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Amerikan sınavları için rastgele dersler ve konular
const subjects = [
  {
    name: "Matematik",
    topics: [
      "Cebir", "Doğrusal Denklemler", "Fonksiyonlar", "Geometri", "Trigonometri",
      "Veri Analizi", "İstatistik", "Olasılık", "Problem Çözme", "Koordinat Geometrisi"
    ]
  },
  {
    name: "Okuma",
    topics: [
      "Ana Fikir Bulma", "Detay Sorular", "Çıkarım Yapma", "Referans İfadeleri", 
      "Yazarın Amacı", "Retorik Teknikler", "Metin Analizi", "Kelime Bilgisi", 
      "Metin Karşılaştırma", "Bilimsel Metinler"
    ]
  },
  {
    name: "Yazma",
    topics: [
      "Gramer", "Cümle Yapısı", "Makale Yazma", "Tez Geliştirme", "Argüman Oluşturma",
      "Kanıt Kullanımı", "Retorik Beceriler", "Düzenleme", "Açıklayıcı Yazı", "İkna Edici Yazı"
    ]
  },
  {
    name: "Fen Bilimleri",
    topics: [
      "Fizik", "Kimya", "Biyoloji", "Dünya Bilimleri", "Bilimsel Yöntem",
      "Veri Yorumlama", "Deney Tasarımı", "Bilimsel Modeller", "Enerji", "Termodinamik"
    ]
  },
  {
    name: "Fizik",
    topics: [
      "Mekanik", "Elektrik ve Manyetizma", "Termodinamik", "Dalgalar ve Optik",
      "Modern Fizik", "Akışkanlar", "Enerji", "Kuvvet ve Hareket", "Kuantum Fiziği", "Nükleer Fizik"
    ]
  },
  {
    name: "Kimya",
    topics: [
      "Atom Yapısı", "Kimyasal Bağlar", "Periyodik Tablo", "Asitler ve Bazlar",
      "Redoks Reaksiyonları", "Organik Kimya", "Termodinamik", "Kinetik", "Denge", "Elektrokimya"
    ]
  },
  {
    name: "ABD Tarihi",
    topics: [
      "Kolonyal Dönem", "Amerikan Devrimi", "İç Savaş", "Yeniden Yapılanma",
      "Sanayi Devrimi", "Dünya Savaşları", "Soğuk Savaş", "Sivil Haklar Hareketi", "Modern ABD", "Küresel İlişkiler"
    ]
  }
];

// Amerikan sınav türleri
const examTypes = ["SAT", "ACT", "GRE", "GMAT", "MCAT", "PSAT", "LSAT", "AP", "IB"];

// Haftalık program oluşturma
function generateDummyWeeklyProgram() {
  const programStartDate = startOfDay(new Date());
  const weeks = [];
  
  for (let week = 0; week < 8; week++) {
    const weekStartDate = addDays(programStartDate, week * 7);
    const days = [];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayDate = addDays(weekStartDate, dayOffset);
      const formattedDate = format(dayDate, "d MMMM", { locale: tr });
      const dayNameIndex = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;
      
      const dailySubjects = [];
      
      // Hafta içi 2-3 ders, hafta sonu 3-4 ders
      const subjectCount = dayOffset < 5 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 3;
      
      for (let s = 0; s < subjectCount; s++) {
        const randomSubjectIndex = Math.floor(Math.random() * subjects.length);
        const subject = subjects[randomSubjectIndex];
        
        // Her ders için 2-3 konu seç
        const selectedTopics: string[] = [];
        const topicCount = Math.floor(Math.random() * 2) + 1;
        
        for (let t = 0; t < topicCount; t++) {
          const randomTopicIndex = Math.floor(Math.random() * subject.topics.length);
          const topic = subject.topics[randomTopicIndex];
          
          if (!selectedTopics.includes(topic)) {
            selectedTopics.push(topic);
          }
        }
        
        // Ders çalışma süresi (dakika)
        const duration = (Math.floor(Math.random() * 5) + 5) * 10; // 50-90 dakika arası
        
        dailySubjects.push({
          name: subject.name,
          duration,
          topics: selectedTopics
        });
      }
      
      days.push({
        date: formattedDate,
        dayName: dayNames[dayNameIndex],
        subjects: dailySubjects
      });
    }
    
    weeks.push({
      weekNumber: week + 1,
      startDate: format(weekStartDate, "d MMMM", { locale: tr }),
      endDate: format(addDays(weekStartDate, 6), "d MMMM", { locale: tr }),
      days
    });
  }
  
  return {
    title: "Örnek SAT Çalışma Programı",
    examType: "SAT",
    examDate: format(addDays(programStartDate, 60), "d MMMM yyyy", { locale: tr }),
    studentName: "Örnek Öğrenci",
    createdAt: format(new Date(), "d MMMM yyyy", { locale: tr }),
    totalWeeks: 8,
    weeks,
    notes: [
      "Her çalışma oturumu arasında 10-15 dakika ara vermeyi unutmayın.",
      "Hafta sonları extra pratik testler çözmeye çalışın.",
      "Her hafta en az bir deneme sınavı çözmeye özen gösterin.",
      "Reading ve Writing bölümleri için günlük okuma alışkanlığı edinmeye çalışın.",
      "Math bölümü için formül ve konseptleri ayrıca çalışın."
    ]
  };
}

export const dummyProgram = generateDummyWeeklyProgram(); 

// Function to generate a random program with a specific ID
export function generateRandomProgram(programId: string) {
  const program = generateDummyWeeklyProgram();
  return {
    ...program,
    id: programId,
    createdAt: format(new Date(), "d MMMM yyyy", { locale: tr })
  };
} 