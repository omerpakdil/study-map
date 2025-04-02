"use client";

import { useState, useMemo } from "react";
import { 
  addDays, 
  format, 
  isSameDay, 
  isWithinInterval, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
  addMonths,
  getDay,
  getDate,
  eachDayOfInterval
} from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailySchedule {
  date: Date;
  subjects: {
    name: string;
    duration: number; // dakika cinsinden
    topics: string[];
  }[];
  totalStudyTime: number;
}

interface ProgramCalendarProps {
  examDate: Date;
  examType: string;
  startDate: Date;
  schedules: DailySchedule[];
  // Önizleme modu - sadece ilk hafta tam görünür
  previewMode?: boolean;
}

// Özel takvim bileşeni
const SimpleCalendar = ({ 
  value, 
  onChange, 
  fromDate, 
  toDate,
  markedDates
}: { 
  value: Date; 
  onChange: (date: Date) => void;
  fromDate?: Date;
  toDate?: Date;
  markedDates?: Date[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value));
  
  // Önceki aya geç
  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };
  
  // Sonraki aya geç
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Ayın günlerini hesapla
  const monthDays = useMemo(() => {
    // Ayın ilk ve son günü
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Haftanın ilk günü (pazartesi) ve son günü (pazar)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    // Tüm takvim günlerini döndür (önceki ve sonraki ayların görünen günleri dahil)
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);
  
  // Haftanın günleri
  const weekDays = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
  
  return (
    <div className="w-full">
      {/* Ay navigasyonu */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary"
          onClick={prevMonth}
          disabled={fromDate && isSameMonth(currentMonth, fromDate)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-medium">
          {format(currentMonth, "MMMM yyyy", { locale: tr })}
        </h2>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary"
          onClick={nextMonth}
          disabled={toDate && isSameMonth(currentMonth, toDate)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Haftanın günleri başlıkları */}
      <div className="grid grid-cols-7 text-center mb-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Takvim günleri ızgarası */}
      <div className="grid grid-cols-7 gap-1.5">
        {monthDays.map((day) => {
          // Gün bu ay içinde mi?
          const isCurrentMonth = isSameMonth(day, currentMonth);
          // Gün bugün mü?
          const isSelectedDay = isSameDay(day, value);
          // Gün işaretli mi? (programlanmış günler)
          const isMarked = markedDates?.some(markedDate => isSameDay(markedDate, day));
          // Gün geçerli aralık içinde mi?
          const isInRange = 
            (!fromDate || day >= fromDate) &&
            (!toDate || day <= toDate);
            
          return (
            <Button
              key={day.toString()}
              variant="ghost"
              className={cn(
                "h-10 w-full rounded-md flex items-center justify-center p-0",
                !isCurrentMonth && "text-muted-foreground/30",
                isToday(day) && !isSelectedDay && "text-primary font-semibold",
                isSelectedDay && "bg-primary/10 text-primary font-medium",
                isMarked && !isSelectedDay && "text-primary",
                !isInRange && "opacity-20 cursor-not-allowed",
                "transition-all duration-200 hover:bg-primary/5"
              )}
              disabled={!isInRange || !isCurrentMonth}
              onClick={() => onChange(day)}
            >
              <span className="text-sm">
                {getDate(day)}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export function ProgramCalendar({
  examDate,
  examType,
  startDate,
  schedules,
  previewMode = false,
}: ProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startDate);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(startDate, { weekStartsOn: 1 })
  );
  const [showDetails, setShowDetails] = useState(false);

  // Seçilen günün programını bul
  const selectedDaySchedule = schedules.find((schedule) =>
    isSameDay(schedule.date, selectedDate)
  );

  // Önizleme modunda, sadece ilk haftanın içeriğini tam olarak göster
  const isWithinPreviewPeriod = (date: Date) => {
    if (!previewMode) return true;
    
    const previewEndDate = addDays(startDate, 7); // İlk hafta
    return isWithinInterval(date, { start: startDate, end: previewEndDate });
  };

  // Tarihin program kapsamında olup olmadığını kontrol et
  const isWithinProgram = (date: Date) => {
    return schedules.some((schedule) => isSameDay(schedule.date, date));
  };

  // Programlı günlerin tarihlerini al
  const programDates = useMemo(() => {
    return schedules.map(schedule => schedule.date);
  }, [schedules]);

  // Tarih seçimini işle
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDetails(true); // Tarihe tıklandığında detayları göster
  };

  // Önceki haftaya git
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Sonraki haftaya git
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Takvime geri dön
  const backToCalendar = () => {
    setShowDetails(false);
  };

  // Seçilen gün detayı bileşeni
  const SelectedDayDetail = () => {
    if (!selectedDaySchedule) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <p className="text-muted-foreground">
            {isWithinProgram(selectedDate)
              ? "Bu tarih için program detayı bulunmuyor."
              : "Lütfen program içerisindeki bir tarih seçin."}
          </p>
        </div>
      );
    }
    
    if (!isWithinPreviewPeriod(selectedDate)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="py-8 px-6 bg-muted/50 backdrop-blur-sm rounded-lg relative overflow-hidden w-full max-w-md">
            {/* Blur effect */}
            <div className="blur-sm">
              <p className="font-medium mb-4">Toplam Çalışma: 6 saat 30 dakika</p>
              <ul className="space-y-3 text-left pl-4">
                <li className="pl-2">• Matematik - Fonksiyonlar (2 saat)</li>
                <li className="pl-2">• Fizik - Kuvvet ve Hareket (2 saat)</li>
                <li className="pl-2">• İngilizce - Kelime Çalışması (1.5 saat)</li>
                <li className="pl-2">• Deneme Testi (1 saat)</li>
              </ul>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <p className="font-medium text-center px-4">
                Bu günün detaylarını görmek için programı satın alın
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 w-full max-w-xs border-primary text-primary hover:bg-primary/5"
          >
            Programı Satın Al
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 p-1">
        {selectedDaySchedule.subjects.map((subject, index) => (
          <div key={index} className="border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <h4 className="font-medium text-primary">{subject.name}</h4>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
                {Math.floor(subject.duration / 60)}s {subject.duration % 60}dk
              </span>
            </div>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              {subject.topics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!showDetails && (
        <div className="flex justify-between items-center p-3 border rounded-lg bg-card shadow-sm mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={previewMode && isSameDay(currentWeekStart, startOfWeek(startDate, { weekStartsOn: 1 }))}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Önceki
          </Button>
          <h3 className="text-sm md:text-base font-medium text-center">
            {format(currentWeekStart, "d MMMM", { locale: tr })} - {format(addDays(currentWeekStart, 6), "d MMMM yyyy", { locale: tr })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextWeek}
            disabled={previewMode && !isWithinPreviewPeriod(addDays(currentWeekStart, 7))}
          >
            Sonraki <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
      
      {showDetails ? (
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b flex flex-row items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={backToCalendar}
              className="mr-2 h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>
                {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
              </CardTitle>
              {selectedDaySchedule && (
                <CardDescription>
                  Toplam: {Math.floor(selectedDaySchedule.totalStudyTime / 60)} saat {selectedDaySchedule.totalStudyTime % 60} dk
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 max-h-[500px] overflow-y-auto">
            <SelectedDayDetail />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 pb-2 flex flex-row items-center border-b">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary/70" />
            <div>
              <CardTitle className="text-lg">Program Takvimi</CardTitle>
              <CardDescription>Gün seçmek için tıklayın</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <SimpleCalendar
              value={selectedDate}
              onChange={handleDateSelect}
              fromDate={startDate}
              toDate={examDate}
              markedDates={programDates}
            />
          </CardContent>
          
          <div className="px-4 py-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <p className="font-medium text-foreground">Sınav:</p>
              <p>{format(examDate, "dd MMMM yyyy", { locale: tr })}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <p className="font-medium text-foreground">Kalan:</p>
              <p>{Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <p className="font-medium text-foreground">Tür:</p>
              <p>{examType}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ProgramCalendar; 