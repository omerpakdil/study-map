# StudyMap: Kişiselleştirilmiş Sınav Takvimi Oluşturucu

## Proje Özeti
StudyMap, öğrencilerin sınav hazırlıklarını optimize eden kişiselleştirilmiş çalışma programları oluşturan modern bir web uygulamasıdır. Kullanıcılar detaylı bir analiz formunu doldurduktan sonra yapay zeka tarafından oluşturulan kişisel çalışma takvimlerini satın alabilirler. Uygulama çoklu dil desteği ve farklı ülkelerdeki sınav sistemlerine uygun programlar oluşturabilme özelliklerine sahiptir. Minimalist, modern ve sezgisel bir arayüz tasarımıyla kullanıcılara akıcı bir deneyim sunmayı hedefler.

## Teknoloji Yığını
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion
- **UI Bileşenleri**: shadcn-ui
- **Form Yönetimi**: React Hook Form, Zod (form validasyonu için)
- **State Yönetimi**: Zustand
- **Ödeme İşlemleri**: Iyzico veya PayTR, Stripe (uluslararası ödemeler için)
- **PDF Oluşturma**: React-PDF
- **AI Entegrasyonu**: OpenAI API
- **Çoklu Dil Desteği**: i18n
- **Deployment**: Vercel
- **Analytics**: Google Analytics, Hotjar
- **Animasyonlar**: Lottie, Framer Motion, GSAP
- **3D Efektler**: Three.js (seçili alanlarda)
- **Görsel Zenginleştirme**: Glassmorphism, Neumorphism ve Microinteractions

## UI/UX Tasarım Prensipleri
- **Renk Paleti**: Dingin ve odaklanmayı teşvik eden bir ana renk (koyu mavi veya mor) ile enerjik aksan renkleri (turuncu, mint yeşili) kombinasyonu
- **Tipografi**: Modern, okunabilir ve hiyerarşik bir tipografi sistemi (Poppins, Montserrat veya Inter gibi sans-serif fontlar)
- **Micro-interactions**: Tüm butonlarda, geçişlerde ve form elemanlarında akıcı feedback animasyonları
- **Glassmorphism**: Özellikle kartlarda ve overlay elementlerinde buzlu cam efekti
- **Dark Mode**: Sistem tercihine göre otomatik değişen aydınlık/karanlık tema desteği
- **Görsel Hikaye Anlatımı**: İlerleme ve başarıyı görselleştiren animasyonlar ve infografikler
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünen kesintisiz bir deneyim

## Kurulum ve Geliştirme

### Başlangıç
```bash
# Projeyi oluştur
npx create-next-app studymap --typescript --tailwind --eslint

# Proje dizinine git
cd studymap

# Gerekli paketleri yükle
npm install framer-motion react-hook-form zod @hookform/resolvers @iyzico/iyzipay react-pdf zustand next-international three lottie-react gsap
```

### Klasör Yapısı

```
studymap/
├── app/ # App Router sayfaları
│ ├── layout.tsx # Ana layout
│ ├── page.tsx # Ana sayfa
│ ├── analysis/ # Analiz formu sayfası
│ │ └── page.tsx
│ ├── preview/ # Program önizleme
│ │ └── [id]/
│ │    └── page.tsx
│ ├── checkout/ # Ödeme sayfası
│ │ └── [programId]/
│ │    └── page.tsx
│ ├── success/
│ │ └── page.tsx
│ ├── faq/
│ │ └── page.tsx
│ ├── contact/
│ │ └── page.tsx
│ └── api/ # API rotaları
│   ├── programs/ # Program yönetimi
│   │   ├── generate/
│   │   │   └── route.ts
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── download/
│   │       └── [id]/
│   │           └── route.ts
│   ├── payments/ # Ödeme yönetimi
│   │   ├── create/
│   │   │   └── route.ts
│   │   ├── verify/
│   │   │   └── route.ts
│   │   └── webhook/
│   │       └── route.ts
│   └── analytics/ # Analitik
│       └── track/
│           └── route.ts
├── components/ # Yeniden kullanılabilir bileşenler
│ ├── layout/ # Sayfa düzeni bileşenleri
│ │ ├── header.tsx
│ │ ├── footer.tsx
│ │ └── sidebar.tsx
│ ├── ui/ # Genel UI bileşenleri (shadcn bileşenleri)
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── input.tsx
│ │ ├── select.tsx
│ │ ├── checkbox.tsx
│ │ ├── radio-group.tsx
│ │ └── tabs.tsx
│ ├── forms/ # Form bileşenleri
│ │ ├── analysis-form.tsx
│ │ ├── subject-selector.tsx
│ │ ├── exam-type-selector.tsx
│ │ ├── drag-drop-subject-area.tsx
│ │ └── study-preferences.tsx
│ ├── checkout/ # Ödeme bileşenleri
│ │ ├── pricing-card.tsx
│ │ ├── payment-options.tsx
│ │ └── checkout-form.tsx
│ └── program/ # Program oluşturma bileşenleri
│   ├── program-preview.tsx
│   ├── calendar.tsx
│   ├── daily-schedule.tsx
│   └── program-download.tsx
├── lib/ # Yardımcı fonksiyonlar
│ ├── openai.ts # OpenAI API wrapper
│ ├── iyzico.ts # Iyzico API wrapper
│ ├── pdf-generator.ts # PDF oluşturma fonksiyonları
│ ├── validators.ts # Form validasyon şemaları
│ ├── date-utils.ts # Tarih işleme fonksiyonları
│ ├── token-generator.ts # Erişim token oluşturma
│ └── analytics.ts # Analitik fonksiyonları
├── hooks/ # Özel React hooks
│ ├── use-analysis-form.ts
│ ├── use-program.ts
│ └── use-local-storage.ts
├── public/ # Statik dosyalar
│ ├── images/
│ │ ├── logo.svg
│ │ ├── hero-bg.jpg
│ │ ├── testimonials/
│ │ └── icons/
│ └── fonts/
├── store/ # Zustand global state
│ ├── analysis-store.ts
│ ├── program-store.ts
│ └── ui-store.ts
├── types/ # TypeScript type tanımlamaları
│ ├── analysis.ts
│ ├── program.ts
│ └── payment.ts
├── i18n/ # Çoklu dil desteği
│ ├── locales/
│ │ ├── tr.json
│ │ └── en.json
│ └── index.ts
├── middleware.ts # Next.js middleware
├── next.config.mjs # Next.js konfigürasyonu
├── tailwind.config.js # Tailwind konfigürasyonu
└── tsconfig.json # TypeScript konfigürasyonu
```

## Sayfa İçerikleri ve Akış

### 1. Ana Sayfa (app/page.tsx)
- Hero bölümü: Başlık, alt başlık ve CTA buton
- Dil seçimi dropdown'u (sağ üst köşede)
- Nasıl Çalışır bölümü (3 adımlı süreç animasyonu)
- Öne çıkan özellikler (ikon ve açıklamalarla)
- Kullanıcı yorumları (kaydırılabilir carousel)
- Demo program örneği
- SSS (Sıkça Sorulan Sorular - accordions kullanarak)
- CTA bölümü: "Hemen Başla" butonu
- Footer: İletişim bilgileri, sosyal medya bağlantıları ve yasal bilgiler

### 2. Analiz Formu Sayfası (app/analysis/page.tsx)
- Çok adımlı form yapısı (Progress bar ile ilerleme gösterimi)
- Adım 1: Kişisel bilgiler ve sınav seçimi
  - İsim (opsiyonel)
  - E-posta (program teslimi için zorunlu)
  - Ülke seçimi (dropdown ile)
  - Hazırlanılan sınav (ülkeye göre dinamik olarak listelenir)
    - Türkiye: YKS, LGS, KPSS, ALES, YDS vb.
    - ABD: SAT, ACT, GRE, GMAT, MCAT vb.
    - İngiltere: A-Levels, GCSE, IELTS vb.
    - Almanya: TestAS, DSH, TestDaF vb.
    - Hindistan: JEE, NEET, CAT, GATE vb.
    - Fransa: Baccalauréat, DELF/DALF vb.
    - Diğer ülkeler için ilgili sınavlar
  - Sınav tarihi (date picker ile)
- Adım 2: Çalışma alışkanlıkları
  - Günde kaç saat çalışabilir? (slider ile seçim)
  - Haftanın hangi günleri müsait? (çoklu seçim)
  - Sabah/Akşam tercihi (radio buttons)
  - Konsantrasyon süresi (pomodoro tercih eder mi?)
  - Mola süreleri ve sıklıkları
- Adım 3: Konu analizi
  - Sürükle bırak arayüzü ile konuların durumunu belirleme:
    - Tam hâkim olunan konular (yeşil bölge)
    - Kısmen bilinen konular (sarı bölge)
    - Hiç bilmediği/zayıf olduğu konular (kırmızı bölge)
  - Her ders için zorluk derecesi belirleme (1-5 arası yıldız)
  - Ders bazında ayrıntılı not ekleme imkanı
- Adım 4: Hedefler
  - Genel sınav hedefi (puan/sıralama)
  - Ders bazında hedefler
  - Motivasyon faktörleri (çoklu seçim)
- Form Gönderimi
  - "Program Oluştur" butonu
  - Yapay zeka analiz gösterim animasyonu (3-5 saniye)
  - İlerleme göstergesi

### 3. Program Önizleme Sayfası (app/preview/[id]/page.tsx)
- Program özeti ve genel bilgiler kartı
- Sınırlı önizleme (tam versiyonu göremez, blur effect ile)
- İnteraktif takvim ön gösterimi (ilk hafta tam görünür)
- Önerilen çalışma programının avantajları
- Fiyat bilgisi: Standart Paket (99₺)
- "Satın Al" butonu
- İndirim kuponu giriş alanı

### 4. Ödeme Sayfası (app/checkout/[programId]/page.tsx)
- Paket bilgisi özeti
- İndirim kuponu uygulama (varsa)
- E-posta doğrulama (program gönderimi için)
- Ödeme seçenekleri (kredi kartı, havale, vb)
- Iyzico ödeme formu entegrasyonu
  - Kredi kartı bilgileri
  - Fatura bilgileri
- Taksit seçenekleri (varsa)
- Gizlilik politikası ve şartlar onay kutusu
- "Ödemeyi Tamamla" butonu
- Güvenli ödeme göstergeleri

### 5. Başarılı Ödeme Sayfası (app/success/page.tsx)
- Animasyonlu teşekkür mesajı
- Program indirme linki (PDF)
- Bonus materyal linkleri
- E-posta bilgilendirmesi (program gönderildi)
- Sosyal medya paylaşım butonları 
- Referans arkadaş davet linki
- Sonraki adımlar için öneriler
- Destek iletişim bilgileri

## API Rotaları

### Program Yönetimi (app/api/programs/)
- Program oluşturma (app/api/programs/generate/route.ts)
  - OpenAI API entegrasyonu
  - Analiz verilerine göre program oluşturma
  - Oluşturulan programın formatlanması ve depolanması
- Program detayları (app/api/programs/[id]/route.ts)
- Program indirme (app/api/programs/download/[id]/route.ts)
  - Ödeme doğrulama
  - PDF dosyasının oluşturulması ve sunulması

### Ödeme Yönetimi (app/api/payments/)
- Ödeme oluşturma (app/api/payments/create/route.ts)
  - Iyzico API entegrasyonu
  - Ödeme intent oluşturma
- Ödeme doğrulama (app/api/payments/verify/route.ts)
  - Başarılı ödeme sonrası program erişim izni verme
  - E-posta ile program gönderimi
- Ödeme webhook'u (app/api/payments/webhook/route.ts)
  - Ödeme sağlayıcısından gelen bildirimleri işleme

### Analitik (app/api/analytics/)
- Kullanıcı davranışlarını izleme (app/api/analytics/track/route.ts)
- Dönüşüm oranı ölçümü
- A/B test sonuçları

## Veri Modelleri

### Analiz Veri Modeli

```typescript
interface AnalysisData {
  id: string;
  email: string;
  createdAt: Date;
  language: string; // 'tr', 'en', 'de', 'fr', 'es', 'hi', etc.
  
  personalInfo: {
    name?: string;
    country: string; // 'TR', 'US', 'GB', 'DE', 'IN', etc.
    examType: string; // 'YKS', 'SAT', 'A-Levels', etc.
    examDate: string; // ISO format
  };
  
  studyHabits: {
    hoursPerDay: number;
    availableDays: string[]; // ['monday', 'tuesday', etc.]
    preferredTime: 'morning' | 'afternoon' | 'evening';
    concentrationSpan: number; // dakika cinsinden
    breakFrequency: number; // dakika cinsinden
    breakDuration: number; // dakika cinsinden
  };
  
  subjectAnalysis: {
    [subject: string]: {
      level: 'strong' | 'medium' | 'weak';
      difficulty: number; // 1-5 arası
      priority: number; // 1-5 arası
      notes?: string;
    };
  };
  
  goals: {
    overallGoal: string;
    targetScore?: number;
    targetRanking?: number;
    subjectGoals: {
      [subject: string]: string;
    };
    motivationFactors: string[];
  };
}
```

### Program Veri Modeli

```typescript
interface Program {
  id: string;
  analysisId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  language: string; // 'tr', 'en', 'de', 'fr', 'es', 'hi', etc.
  
  // Program detayları
  country: string; // 'TR', 'US', 'GB', 'DE', 'IN', etc.
  examType: string;
  examDate: string;
  totalWeeks: number;
  isPaid: boolean;
  paymentId?: string;
  downloadCount: number; // İndirme sayısı takibi
  
  // Program içeriği
  overview: {
    keyAreas: string[];
    focusStrategy: string;
    estimatedProgress: string;
  };
  
  dailySchedule: {
    [date: string]: {
      subjects: Array<{
        name: string;
        duration: number; // dakika cinsinden
        topics: string[];
        resources?: string[];
        priority: 'high' | 'medium' | 'low';
      }>;
      totalStudyTime: number;
      breaks: number;
    };
  };
  
  weeklySummary: Array<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    totalStudyHours: number;
    keyFocus: string[];
    progress: number; // 0-100 arası
  }>;
  
  monthlyOverview: Array<{
    month: string;
    progress: string;
    adjustments: string[];
    assessment: string;
  }>;
}
```

### Ödeme Veri Modeli

```typescript
interface Payment {
  id: string;
  email: string;
  programId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'iyzico' | 'paytr';
  providerTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  discountCode?: string;
  discountAmount?: number;
}
```

## Uygulama Özellikleri ve Yol Haritası

### MVP (Minimum Viable Product) Özellikleri
- Analiz formu ile kullanıcı verilerinin toplanması
- Çoklu dil desteği (başlangıçta Türkçe ve İngilizce)
- Ülke ve sınav tipi seçimi
- OpenAI API ile sınav programı oluşturulması 
- Basit program önizlemesi
- Tek paket ödeme işlemi
- PDF olarak program indirme
- E-posta ile program gönderimi

### Gelişmiş Özellikler (İkinci Aşama)
- Program düzenleme ve yeniden oluşturma seçeneği
- Mobil uyumlu takvim görünümü
- Gelişmiş analitik ve dönüşüm optimizasyonu
- Daha fazla dil desteği (Almanca, Fransızca, İspanyolca)
- Daha fazla ülke ve sınav tipi eklenmesi

### Premium Özellikler (Üçüncü Aşama)
- Mobil uygulama (React Native)
- Canlı danışmanlık hizmeti (ayrı ücretlendirme)
- Grup çalışma programları
- Öğretmen/ebeveyn için paylaşım seçeneği
- İstatistik ve analiz raporları
- Ülkeye özgü eğitim kaynakları ve materyalleri
- Yapay zeka destekli sınav stratejisi önerileri

## Desteklenen Ülkeler ve Sınavlar

### Öncelikli Ülkeler (İlk Aşama)
1. **Türkiye**
   - YKS (AYT, TYT)
   - LGS
   - KPSS
   - ALES
   - YDS/YÖKDİL

2. **Amerika Birleşik Devletleri**
   - SAT
   - ACT
   - GRE
   - GMAT
   - MCAT

3. **İngiltere**
   - A-Levels
   - GCSE
   - IELTS
   - Cambridge Exams

4. **Almanya**
   - Abitur
   - TestAS
   - DSH
   - TestDaF

5. **Hindistan**
   - JEE (Main & Advanced)
   - NEET
   - CAT
   - GATE

### İkinci Aşamada Eklenecek Ülkeler
- Fransa
- İspanya
- İtalya
- Kanada
- Avustralya
- Güney Kore
- Japonya

## Çoklu Dil Desteği

### İlk Aşamada Desteklenecek Diller
- Türkçe
- İngilizce

### İkinci Aşamada Eklenecek Diller
- Almanca
- Fransızca
- İspanyolca
- Hintçe

### Çeviri Yönetimi
- Statik çeviriler için JSON dosyaları
- Dinamik içerik için OpenAI API yardımıyla otomatik çeviri
- Ülke ve sınav sistemlerine özgü terminoloji uyumluluğu

## Uluslararası Ödeme Sistemleri
- Türkiye ödemeleri için Iyzico veya PayTR
- Uluslararası ödemeler için Stripe entegrasyonu
- Çoklu para birimi desteği
- Ülkeye özgü ödeme yöntemleri

## E-posta Bildirimleri
- Ödeme tamamlandığında e-posta ile program PDF olarak gönderilir
- Ek destek ve bonus materyal linkleri e-posta ile paylaşılır
- Kullanım önerileri ve takip edilecek adımlar için bilgilendirme

## Test ve Kalite Kontrol

### Birim Testler
- Form validasyonları
- API rotaları
- Ödeme işlemleri
- PDF oluşturma ve gönderim

### Entegrasyon Testleri
- Form-API entegrasyonu 
- Ödeme entegrasyonu
- PDF oluşturma
- E-posta gönderimi

## Pazarlama ve Kullanıcı Kazanımı

### SEO Stratejisi
- Sınav odaklı içerik
- Eğitim blogu
- Anahtar kelime optimizasyonu

### Sosyal Medya
- Instagram
- TikTok
- YouTube eğitim içerikleri

### Ortaklıklar
- Eğitim kurumları işbirlikleri
- İnfluencer pazarlama
- Öğrenci toplulukları

## Kaynaklar ve Araçlar
- **Iyzico API Dokümantasyonu**: [Iyzico API](https://dev.iyzipay.com/tr/)
- **OpenAI API Dokümantasyonu**: [OpenAI API](https://beta.openai.com/docs/)
- **Next.js Dokümantasyonu**: [Next.js](https://nextjs.org/docs)
- **Tailwind CSS Dokümantasyonu**: [Tailwind CSS](https://tailwindcss.com/docs)
- **React Hook Form Dokümantasyonu**: [React Hook Form](https://react-hook-form.com/)
- **Framer Motion Dokümantasyonu**: [Framer Motion](https://www.framer.com/motion/)
- **Zustand Dokümantasyonu**: [Zustand](https://github.com/pmndrs/zustand)
- **React-PDF Dokümantasyonu**: [React-PDF](https://react-pdf.org/)

## Takım ve Görev Dağılımı

### Roller
- **Proje Yöneticisi**: Genel koordinasyon ve takip
- **Frontend Geliştirici**: UI/UX implementasyonu
- **Backend Geliştirici**: API ve entegrasyonlar
- **UI/UX Tasarımcı**: Kullanıcı arayüzü ve deneyimi
- **İçerik Uzmanı**: Eğitim içeriği ve program algoritması

### Sprint Planlaması
- **Sprint 1** (2 hafta): Ana sayfa ve analiz formu
- **Sprint 2** (2 hafta): AI entegrasyonu ve program oluşturma
- **Sprint 3** (2 hafta): Ödeme sistemi ve PDF oluşturma
- **Sprint 4** (1 hafta): Test ve hata düzeltme
- **Sprint 5** (1 hafta): Launch ve pazarlama

## Sonuç ve Değerlendirme
Bu rehber, kullanıcı hesapları olmadan çalışabilen, çoklu dil desteğine sahip ve uluslararası kullanıma uygun StudyMap projesini başlatmak ve geliştirmek için gerekli tüm bilgileri içermektedir. Kullanıcılar, kendi dillerinde, kendi ülkelerindeki sınav sistemlerine uygun programlar oluşturabilecek ve ödeme sonrası programlarını doğrudan indirebileceklerdir. Projeyi hayata geçirirken bu adımları takip ederek modern, kapsayıcı ve kullanıcı dostu bir uygulama oluşturabilirsiniz. Düzenli gözden geçirmeler ve kullanıcı geri bildirimleri ile ürünü sürekli iyileştirmek hedeflenmelidir.

## Tamamlanan İşler ve İlerleme Kaydı

### Analiz Formu
- ✅ Form şeması ve yapısı oluşturuldu
- ✅ Çok adımlı form yapısı tamamlandı
- ✅ Kişisel bilgiler adımı tamamlandı (ülke seçimi, sınav tipi, vb.)
- ✅ Konu analizi bölümü oluşturuldu (konuların seviyelerini belirlemek için)
- ✅ Hedefler bölümü tamamlandı (genel hedef, motivasyon faktörleri, vb.)
- ✅ Formdan alınan veriler state'te düzgün şekilde yönetiliyor

### Program Önizleme Sayfası
- ✅ Temel sayfa yapısı oluşturuldu
- ✅ ProgramPreview bileşeni eklendi ve yapılandırıldı
- ✅ Demo program verileri oluşturma fonksiyonu eklendi
- ✅ Program özeti ve genel bilgiler kartı tamamlandı
- ✅ İnteraktif takvim ön gösterimi tamamlandı
- ✅ Sınırlı önizleme (tam versiyon için satın alma yönlendirmesi)
- ✅ Fiyat bilgisi ve "Satın Al" düğmesi eklenmiş durumda
- ✅ İndirim kuponu uygulaması eklendi

### Program Takvimi
- ✅ Özel takvim bileşeni (SimpleCalendar) tamamlandı
- ✅ Programlı günlerin görsel olarak işaretlenmesi sağlandı
- ✅ Takvimden gün seçimi ve detay görünümü çalışıyor
- ✅ Sade ve minimal takvim tasarımı uygulandı
- ✅ Önizleme modu için sınırlı içerik gösterimi ayarlandı
- ✅ Takvim ve program detayları arasında geçiş yapısı uygulandı

### Genel Geliştirmeler
- ✅ UI bileşenleri (shadcn) entegrasyonu tamamlandı
- ✅ Responsive tasarım uygulandı
- ✅ Error handling ve kullanıcı geri bildirimi mekanizmaları eklendi
- ✅ Modern ve temiz bir arayüz tasarımı uygulandı

### Sonraki Adımlar
- Ödeme sayfası oluşturulması
- Satın alma işlemi tamamlandıktan sonraki akış
- E-posta gönderim entegrasyonu
- PDF oluşturma ve indirme fonksiyonları
- Farklı ülkeler ve sınavlar için içerik genişletmesi
- Genel performans optimizasyonu