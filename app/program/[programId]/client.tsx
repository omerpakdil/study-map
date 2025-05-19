"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, addDays, isSameDay, parse } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, CalendarIcon, Clock, Book, ArrowRight, BookText, CheckCircle2 } from 'lucide-react';

export default function ProgramCalendarPage({ programId }: { programId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Program verisini getir
  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Program API'sinden verileri al
        const response = await fetch(`/api/program/${programId}`);
        
        if (!response.ok) {
          throw new Error('Program yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        const programData = data.program;
        
        setProgram(programData);
        
        // İlk gün bilgisini al
        if (programData.weeks && programData.weeks.length > 0 && programData.weeks[0].days.length > 0) {
          const firstDay = programData.weeks[0].days[0];
          setSelectedDay(firstDay);
          setSelectedDate(new Date(firstDay.date));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Program verisi alınırken hata:', error);
        setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu');
        toast.error('Program verisi yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };
    
    fetchProgramData();
  }, [programId]);

  // Gün seçimi
  const handleSelectDay = (date: Date) => {
    if (!program) return;
    
    try {
    // Seçilen tarihe ait günü bul
    const formattedDate = format(date, 'yyyy-MM-dd');
    const allDays = program.weeks.flatMap((week: any) => week.days);
    
    const day = allDays.find((d: any) => {
        if (!d.date) return false;
      const dayDate = d.date.includes('T') ? d.date.split('T')[0] : d.date;
      return dayDate === formattedDate;
    });
    
    if (day) {
      setSelectedDay(day);
      setSelectedDate(date);
      }
    } catch (error) {
      console.error('Error handling date selection:', error);
    }
  };

  // Günlük program sayfasına git
  const goToDailyProgram = (date: string) => {
    router.push(`/program/day/${programId}/${date}`);
  };

  // Tüm programı kapsayan tarih aralığını oluştur
  const getProgramDates = () => {
    if (!program || !program.weeks) return [];
    
    return program.weeks.flatMap((week: any) => 
      week.days.map((day: any) => {
        try {
          if (typeof day.date === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(day.date)) {
            // Türkçe tarih formatı (3 Temmuz 2025)
            return parse(day.date, 'd MMMM yyyy', new Date(), { locale: tr });
          }
          return new Date(day.date);
        } catch (error) {
          console.error('Invalid date format:', day.date, error);
          return null;
        }
      }).filter(Boolean)
    );
  };

  // Tarih değerlerini güvenli şekilde dönüştüren yardımcı fonksiyon
  const safelyParseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    
    try {
      // Eğer zaten Date objesi ise
      if (dateValue instanceof Date) return dateValue;
      
      // Eğer ISO string ise
      if (typeof dateValue === 'string' && dateValue.includes('T')) {
        return new Date(dateValue);
      }
      
      // Eğer sadece YYYY-MM-DD formatında ise
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(dateValue);
      }
      
      // Eğer Türkçe formatta bir string ise (örn: "3 Temmuz 2025")
      if (typeof dateValue === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(dateValue)) {
        return parse(dateValue, 'd MMMM yyyy', new Date(), { locale: tr });
      }
      
      // Son çare olarak normal Date constructor'ı dene
      return new Date(dateValue);
    } catch (error) {
      console.error('Invalid date format:', dateValue, error);
      return undefined;
    }
  };

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-4">
            <div className="h-9 w-80 mx-auto mb-2">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="h-6 w-64 mx-auto">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Hata ekranı
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
          <div className="bg-red-50 text-red-800 p-6 rounded-lg shadow-sm max-w-lg text-center">
            <h2 className="text-xl font-semibold mb-3">Bir Hata Oluştu</h2>
            <p>{error}</p>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="mt-4 flex items-center gap-2"
            >
              <ArrowRight size={16} />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Başlık ve açıklama */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-primary">
            {program?.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {program?.examType} Sınavı için Çalışma Programı
            {program?.studentName && ` - ${program.studentName}`}
          </p>
        </div>
        
        {/* Program içeriği */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol taraf - Takvim */}
              <div className="border-r-0 md:border-r border-border pr-0 md:pr-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  <span>Program Takvimi</span>
                </h2>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <CalendarPicker 
                      selectedDate={selectedDate}
                      programDates={getProgramDates()}
                      onSelectDate={handleSelectDay}
                      fromDate={safelyParseDate(program?.startDate)}
                      toDate={safelyParseDate(program?.examDate)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Programlı Gün</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-primary"></div>
                      <span>Programsız Gün</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sağ taraf - Seçilen Gün Detayı */}
              <div className="pl-0 md:pl-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookText size={20} className="text-primary" />
                  <span>Günlük Program</span>
                </h2>
                
                {selectedDay ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {selectedDay?.date ? (() => {
                            try {
                              // Türkçe tarih formatını kontrol et
                              if (typeof selectedDay.date === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(selectedDay.date)) {
                                // Tarihi çözümle ve daha detaylı format ekle
                                const parsedDate = parse(selectedDay.date, 'd MMMM yyyy', new Date(), { locale: tr });
                                return format(parsedDate, 'd MMMM yyyy, EEEE', { locale: tr });
                              }
                              
                              // Diğer formatlarda date-fns kullan
                              const parsedDate = safelyParseDate(selectedDay.date);
                              if (parsedDate) {
                                return format(parsedDate, 'd MMMM yyyy, EEEE', { locale: tr });
                              }
                              return '-';
                            } catch (error) {
                              console.error('Invalid date format:', selectedDay.date);
                              return '-';
                            }
                          })() : '-'}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => goToDailyProgram(selectedDay.date)}
                        className="ml-auto flex items-center gap-1"
                      >
                        <span>İnteraktif Görüntüle</span>
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                    
                    {selectedDay.subjects.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {selectedDay.subjects.map((subject: any, index: number) => (
                          <div 
                            key={index}
                            className="p-3 bg-muted/50 rounded-md border border-border"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-foreground">{subject.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {subject.topics.join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock size={14} className="mr-1" />
                                {subject.duration} dakika
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-2 border-t border-border mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Toplam Çalışma Süresi</span>
                            <span className="font-medium">
                              {selectedDay.subjects.reduce((total: number, subject: any) => total + subject.duration, 0)} dakika
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground bg-muted/50 rounded-md">
                        <p>Bu gün için planlanmış çalışma bulunmamaktadır.</p>
                      </div>
                    )}
                    
                    <div className="text-right mt-6">
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => goToDailyProgram(selectedDay.date)}
                      >
                        İnteraktif Programa Git
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground bg-muted/50 rounded-md">
                    <p>Lütfen takvimden bir gün seçin.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Program bilgileri */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Book size={18} className="text-primary" />
              Program Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="text-sm text-muted-foreground">Sınav Tipi</div>
                <div className="font-medium mt-1">{program?.examType}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="text-sm text-muted-foreground">Sınav Tarihi</div>
                <div className="font-medium mt-1">
                  {program?.examDate ? (() => {
                    try {
                      // Türkçe tarih formatını kontrol et
                      if (typeof program.examDate === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(program.examDate)) {
                        // Zaten uygun formatta, direk göster
                        return program.examDate;
                      }
                      
                      // Diğer formatlarda date-fns kullan
                      const parsedDate = safelyParseDate(program.examDate);
                      if (parsedDate) {
                        return format(parsedDate, 'd MMMM yyyy', { locale: tr });
                      }
                      return '-';
                    } catch (error) {
                      console.error('Invalid date format:', program.examDate);
                      return '-';
                    }
                  })() : '-'}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="text-sm text-muted-foreground">Başlangıç Tarihi</div>
                <div className="font-medium mt-1">
                  {program?.startDate ? (() => {
                    try {
                      // Türkçe tarih formatını kontrol et
                      if (typeof program.startDate === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(program.startDate)) {
                        // Zaten uygun formatta, direk göster
                        return program.startDate;
                      }
                      
                      // Diğer formatlarda date-fns kullan
                      const parsedDate = safelyParseDate(program.startDate);
                      if (parsedDate) {
                        return format(parsedDate, 'd MMMM yyyy', { locale: tr });
                      }
                      return '-';
                    } catch (error) {
                      console.error('Invalid date format:', program.startDate);
                      return '-';
                    }
                  })() : '-'}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="text-sm text-muted-foreground">Toplam Gün</div>
                <div className="font-medium mt-1">
                  {program?.weeks.reduce((total: number, week: any) => total + week.days.length, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Erişim Seçenekleri */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Program Erişimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                className="flex-1 flex items-center gap-2" 
                onClick={() => {
                  // API ile program verilerini PDF veya uygun format olarak indirme
                  window.open(`/api/program/${programId}/download`, '_blank');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Programı İndir
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  // Programı paylaşma veya kalıcı link oluşturma
                  const programUrl = `${window.location.origin}/program/${programId}`;
                  navigator.clipboard.writeText(programUrl);
                  toast.success('Program linki kopyalandı!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Programı Paylaş
              </Button>
              
              <Button 
                variant="secondary" 
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  // Programı favori/kayıtlı programlara ekleme
                  fetch(`/api/user/save-program`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ programId })
                  })
                  .then(response => {
                    if (response.ok) {
                      toast.success('Program kaydedildi!');
                    } else {
                      toast.error('Program kaydedilemedi');
                    }
                  });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Programı Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Basit takvim gösterimi için bir bileşen
function CalendarPicker({ 
  selectedDate, 
  onSelectDate, 
  programDates = [], 
  fromDate,
  toDate
}: { 
  selectedDate: Date; 
  onSelectDate: (date: Date) => void; 
  programDates: Date[];
  fromDate: Date | undefined;
  toDate: Date | undefined;
}) {
  // Tarih formatını kontrol eden yardımcı fonksiyon
  const safelyParseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    
    try {
      // Eğer zaten Date objesi ise
      if (dateValue instanceof Date) return dateValue;
      
      // Eğer ISO string ise
      if (typeof dateValue === 'string' && dateValue.includes('T')) {
        return new Date(dateValue);
      }
      
      // Eğer sadece YYYY-MM-DD formatında ise
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(dateValue);
      }
      
      // Eğer Türkçe formatta bir string ise (örn: "3 Temmuz 2025")
      if (typeof dateValue === 'string' && /^\d{1,2}\s[\wÇçĞğİıÖöŞşÜü]+\s\d{4}$/.test(dateValue)) {
        return parse(dateValue, 'd MMMM yyyy', new Date(), { locale: tr });
      }
      
      // Son çare olarak normal Date constructor'ı dene
      return new Date(dateValue);
    } catch (error) {
      console.error('Invalid date format:', dateValue, error);
      return undefined;
    }
  };

  // fromDate ve toDate için güvenli dönüşüm
  const safeParsedFromDate = safelyParseDate(fromDate);
  const safeParsedToDate = safelyParseDate(toDate);
  
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // Ayı değiştirme işleyicileri
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Ayın günlerini oluştur
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Ayın ilk gününün haftanın hangi günü olduğunu belirle (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
    let firstDayOfWeek = date.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Pazartesi: 0, Salı: 1, ..., Pazar: 6 olacak şekilde dönüştür
    
    // Önceki aydan görünen günleri ekle
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, currentMonth: false });
    }
    
    // Geçerli ayın günlerini ekle
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, currentMonth: true });
    }
    
    // Sonraki aydan görünen günleri ekle (toplam 42 gün olacak şekilde - 6 satır x 7 gün)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, currentMonth: false });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  // Gün bir program gününe denk geliyorsa true döner
  const isProgramDate = (date: Date) => {
    return programDates.some(programDate => isSameDay(programDate, date));
  };

  // Günün tarih aralığında olup olmadığını kontrol eder
  const isInRange = (date: Date) => {
    if (!safeParsedFromDate && !safeParsedToDate) return true;
    if (safeParsedFromDate && !safeParsedToDate) return date >= safeParsedFromDate;
    if (!safeParsedFromDate && safeParsedToDate) return date <= safeParsedToDate;
    if (safeParsedFromDate && safeParsedToDate) return date >= safeParsedFromDate && date <= safeParsedToDate;
    return true;
  };

  return (
    <div className="w-full max-w-sm">
      {/* Ay navigasyonu */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePrevMonth}
        >
          &lt; Önceki Ay
        </Button>
        
        <h3 className="text-base font-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h3>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNextMonth}
        >
          Sonraki Ay &gt;
        </Button>
      </div>
      
      {/* Haftanın günleri */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Takvim günleri */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, currentMonth }, index) => {
          const isToday = isSameDay(date, new Date());
          const isSelected = isSameDay(date, selectedDate);
          const programDate = isProgramDate(date);
          const inRange = isInRange(date);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`
                h-8 w-full p-0 flex items-center justify-center text-xs
                ${!currentMonth ? 'text-muted-foreground/40' : ''}
                ${isToday ? 'text-primary font-medium' : ''}
                ${isSelected ? 'bg-primary/10 text-primary font-medium' : ''}
                ${programDate && !isSelected ? 'bg-primary/5 text-primary-foreground' : ''}
                ${!inRange ? 'opacity-30 cursor-not-allowed' : ''}
              `}
              disabled={!inRange || !currentMonth}
              onClick={() => onSelectDate(date)}
            >
              <div className="relative flex items-center justify-center">
                {date.getDate()}
                {programDate && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 