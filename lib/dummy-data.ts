import { addDays, format, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

// Türkçe gün isimleri
const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Rastgele dersler ve konular
const subjects = [
  {
    name: "Matematik",
    topics: [
      "Türev", "İntegral", "Limit", "Fonksiyonlar", "Karmaşık Sayılar",
      "Trigonometri", "Logaritma", "Üslü Sayılar", "Polinomlar", "Denklem Sistemleri"
    ]
  },
  {
    name: "Fizik",
    topics: [
      "Mekanik", "Elektrik", "Manyetizma", "Optik", "Dalgalar",
      "Termodinamik", "Kuantum Fiziği", "Modern Fizik", "Hareket", "Enerji"
    ]
  },
  {
    name: "Kimya",
    topics: [
      "Atomun Yapısı", "Periyodik Tablo", "Kimyasal Bağlar", "Organik Kimya",
      "Asitler ve Bazlar", "Reaksiyonlar", "Gaz Kanunları", "Karışımlar", "Çözeltiler", "Katılar"
    ]
  },
  {
    name: "Biyoloji",
    topics: [
      "Hücre", "Kalıtım", "Evrim", "Ekoloji", "Bitki Fizyolojisi",
      "Hayvan Fizyolojisi", "Sinir Sistemi", "Dolaşım Sistemi", "Solunum", "Boşaltım"
    ]
  },
  {
    name: "Türkçe",
    topics: [
      "Paragraf", "Dil Bilgisi", "Sözcük Türleri", "Cümle Türleri", "Söz Sanatları",
      "Anlatım Bozuklukları", "Noktalama İşaretleri", "Yazım Kuralları", "Metin Türleri", "Anlam Bilgisi"
    ]
  },
  {
    name: "Tarih",
    topics: [
      "İlk Çağ Uygarlıkları", "Orta Çağ", "Osmanlı Tarihi", "İnkılap Tarihi", "Dünya Savaşları",
      "Soğuk Savaş", "Türk Devletleri", "Modern Dünya Tarihi", "Siyasi Tarih", "Kültür Tarihi"
    ]
  },
  {
    name: "Coğrafya",
    topics: [
      "Fiziki Coğrafya", "Beşeri Coğrafya", "Ekonomik Coğrafya", "Türkiye Coğrafyası",
      "İklim Bilgisi", "Haritalar", "Nüfus", "Yerleşme", "Ulaşım", "Doğal Afetler"
    ]
  }
];

// Rastgele sınav türleri
const examTypes = ["YKS", "KPSS", "ALES", "YDS", "DGS", "TYT", "AYT"];

// Rastgele bir program oluşturan fonksiyon
export const generateRandomProgram = (programId: string) => {
  // Rastgele 1 ila 3 ay arası bir sınav süresi belirle
  const examDateMonths = Math.floor(Math.random() * 3) + 1;
  const examDate = addDays(new Date(), examDateMonths * 30);
  
  // Program oluşturulma tarihini şimdi olarak belirle
  const createdAt = new Date();
  
  // Rastgele bir sınav türü seç
  const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
  
  // Haftaların sayısını hesapla
  const weekCount = Math.ceil(examDateMonths * 4);
  
  // Haftaları oluştur
  const weeks = [];
  let currentDate = startOfDay(new Date());
  
  for (let weekNumber = 1; weekNumber <= weekCount; weekNumber++) {
    const weekStartDate = new Date(currentDate);
    const weekEndDate = addDays(currentDate, 6);
    
    // Günleri oluştur
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentDate, i);
      // Tarihi string olarak biçimlendir - YYYY-MM-DD formatında
      const dateStr = format(date, "yyyy-MM-dd");
      // Haftanın gününü al (0: Pazartesi, 6: Pazar)
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const dayName = dayNames[dayIndex];
      
      // Günün derslerini oluştur - hafta içi 2-4 arası, hafta sonu 1-2 arası
      const subjectCount = dayIndex < 5 
        ? Math.floor(Math.random() * 3) + 2 // Hafta içi 2-4
        : Math.floor(Math.random() * 2) + 1; // Hafta sonu 1-2
      
      const daySubjects = [];
      for (let j = 0; j < subjectCount; j++) {
        // Rastgele bir ders seç
        const randomSubjectIndex = Math.floor(Math.random() * subjects.length);
        const subject = subjects[randomSubjectIndex];
        
        // Rastgele konu sayısı (1-3 arası)
        const topicCount = Math.floor(Math.random() * 3) + 1;
        
        // Konuları karıştır ve seç
        const shuffledTopics = [...subject.topics].sort(() => 0.5 - Math.random());
        const selectedTopics = shuffledTopics.slice(0, topicCount);
        
        // Rastgele çalışma süresi (30 ile 120 dakika arası, 15'in katları)
        const duration = (Math.floor(Math.random() * 7) + 2) * 15;
        
        daySubjects.push({
          name: subject.name,
          duration: duration,
          topics: selectedTopics
        });
      }
      
      days.push({
        date: dateStr,
        dayName: dayName,
        subjects: daySubjects
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
  
  // Rastgele notlar
  const noteCount = Math.floor(Math.random() * 3) + 1;
  const notes = [
    "Her gün düzenli olarak çalışmaya özen gösterin.",
    "Zor konuları tekrar etmeyi unutmayın.",
    "Soru çözmeye vakit ayırın.",
    "Deneme sınavları yaparak kendinizi test edin.",
    "Çalışma süresinden çok, verimli çalışmaya odaklanın.",
    "Her hafta önceki konuları tekrar edin."
  ].sort(() => 0.5 - Math.random()).slice(0, noteCount);
  
  return {
    id: programId,
    title: `${examType} Çalışma Programı`,
    examType,
    examDate: format(examDate, "yyyy-MM-dd"),
    studentName: "Ömer Sercan",
    email: "omersercan@example.com",
    createdAt: format(createdAt, "yyyy-MM-dd"),
    totalWeeks: weekCount,
    weeks,
    notes
  };
}; 