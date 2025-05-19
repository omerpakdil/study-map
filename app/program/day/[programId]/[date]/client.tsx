"use client";

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Calendar, CheckCircle, Timer, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

// Görev tipi tanımı
interface Task {
  id: string;
  name: string;
  duration: number;
  topics: string[];
  color: string;
}

// Görev kategorileri
type TaskCategory = 'todo' | 'inProgress' | 'done';

// Ana veri modeli
interface TaskState {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

// Program verisi
interface ProgramData {
  title: string;
  examType: string;
  examDate: string;
  studentName?: string;
  dayInfo: {
    date: string;
    dayName: string;
    subjects: Array<{
      name: string;
      duration: number;
      topics: string[];
    }>;
  };
}

// İstemci tarafı bileşeni - isim değiştiriyoruz
export function DailyProgramClient({ programId, date }: { programId: string, date: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [tasks, setTasks] = useState<TaskState>({
    todo: [],
    inProgress: [],
    done: []
  });
  
  // Renk oluşturucu yardımcı fonksiyon
  const getSubjectColor = (subjectName: string) => {
    const hash = subjectName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    return colors[hash % colors.length];
  };
  
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
        const program = data.program;
        
        // Tarihi normalize et (2025-05-03 formatına dönüştür)
        const normalizedDate = date.includes('T') 
          ? date.split('T')[0] 
          : date;
        
        console.log('Aranılan tarih:', normalizedDate);
        
        // Tarihi seçilen günün verisini bul
        const allDays = program.weeks.flatMap((week: any) => week.days);
        
        console.log('Tüm tarihler:', allDays.map((d: any) => d.date));
        
        // Gün bulma mantığını düzelt, tarih formatlarını normalize et
        const selectedDay = allDays.find((day: any) => {
          const dayDate = day.date.includes('T') 
            ? day.date.split('T')[0] 
            : day.date;
          return dayDate === normalizedDate;
        });
        
        if (!selectedDay) {
          console.error('Tarih bulunamadı:', normalizedDate, 'Mevcut tarihler:', allDays.map((d: any) => d.date));
          throw new Error('Seçilen gün için veri bulunamadı');
        }
        
        // ProgramData nesnesini oluştur
        const programInfo: ProgramData = {
          title: program.title,
          examType: program.examType,
          examDate: program.examDate,
          studentName: program.studentName,
          dayInfo: {
            date: selectedDay.date,
            dayName: selectedDay.dayName,
            subjects: selectedDay.subjects
          }
        };
        
        setProgramData(programInfo);
        
        // Görevleri oluştur ve todo kategorisine ekle
        const initialTasks: TaskState = {
          todo: [],
          inProgress: [],
          done: []
        };
        
        // LocalStorage'dan görev durumlarını kontrol et
        const storageKey = `tasks-${programId}-${normalizedDate}`;
        const savedTasks = localStorage.getItem(storageKey);
        
        if (savedTasks) {
          try {
            // Kaydedilmiş görev durumları varsa onları kullan
            setTasks(JSON.parse(savedTasks));
          } catch (err) {
            console.error('LocalStorage verisi parse edilemedi:', err);
            // Varsayılan görevleri oluştur
            createInitialTasks(selectedDay, initialTasks);
          }
        } else {
          // Yoksa görevleri "Yapılacaklar" listesine ekle
          createInitialTasks(selectedDay, initialTasks);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Program verisi alınırken hata:', error);
        setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu');
        toast.error('Program verisi yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };
    
    const createInitialTasks = (selectedDay: any, initialTasks: TaskState) => {
      selectedDay.subjects.forEach((subject: any, index: number) => {
        initialTasks.todo.push({
          id: `task-${index}`,
          name: subject.name,
          duration: subject.duration,
          topics: subject.topics,
          color: getSubjectColor(subject.name)
        });
      });
      
      setTasks(initialTasks);
    };
    
    fetchProgramData();
  }, [programId, date]);
  
  // Sürükle bırak işleyicisi
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Sürükleme işlemi hedefi yoksa işlem yapma
    if (!destination) return;
    
    // Aynı listedeki aynı konuma sürükleniyorsa işlem yapma
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Kaynak listeyi belirle
    const sourceList = tasks[source.droppableId as TaskCategory];
    // Hedef listeyi belirle
    const destinationList = tasks[destination.droppableId as TaskCategory];
    
    // Yeni görev listeleri oluştur
    const newTasks = { ...tasks };
    
    // Sürüklenen görev
    const [movedTask] = sourceList.splice(source.index, 1);
    
    // Görevi hedef listeye ekle
    destinationList.splice(destination.index, 0, movedTask);
    
    // State'i güncelle
    setTasks(newTasks);
    
    // LocalStorage'a kaydet
    const normalizedDate = date.includes('T') ? date.split('T')[0] : date;
    const storageKey = `tasks-${programId}-${normalizedDate}`;
    localStorage.setItem(storageKey, JSON.stringify(newTasks));
    
    // Bildirim göster
    toast.success(`"${movedTask.name}" görevi ${
      destination.droppableId === 'todo' ? 'Yapılacaklar' : 
      destination.droppableId === 'inProgress' ? 'Devam Edenler' : 
      'Yapılanlar'
    } listesine taşındı.`, {
      duration: 2000
    });
  };
  
  // Formatlı tarih string'i oluştur
  const formattedDate = date ? 
    (() => {
      try {
        return format(new Date(date), 'd MMMM yyyy, EEEE', { locale: tr });
      } catch (err) {
        console.error('Tarih formatlanırken hata:', err);
        return date; // Hata durumunda orijinal tarihi dön
      }
    })() : '';
  
  // Program sayfasına dön
  const goBackToProgram = () => {
    router.push(`/program/${programId}`);
  };
  
  // Hata durumunda göster
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
          <div className="bg-red-50 text-red-800 p-6 rounded-lg shadow-sm max-w-lg text-center">
            <h2 className="text-xl font-semibold mb-3">Bir Hata Oluştu</h2>
            <p>{error}</p>
            <Button 
              onClick={goBackToProgram} 
              variant="outline"
              className="mt-4 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Ana Programa Dön</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Üst kısım */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={goBackToProgram} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Ana Programa Dön</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={18} />
            <span className="font-medium text-lg">{formattedDate}</span>
          </div>
        </div>
        
        {/* Başlık ve açıklama */}
        <div className="text-center mb-4">
          {loading ? (
            <>
              <div className="h-9 w-80 mx-auto mb-2">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="h-6 w-64 mx-auto">
                <Skeleton className="h-full w-full" />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-primary">{programData?.title}</h1>
              <p className="text-muted-foreground mt-2">
                {programData?.examType} Sınavı için Günlük Çalışma Programı
                {programData?.studentName && ` - ${programData.studentName}`}
              </p>
            </>
          )}
        </div>
        
        {/* İlerleme göstergesi */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <HelpCircle size={18} />
                  <span className="font-semibold">Yapılacaklar</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.todo.length}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                  <Timer size={18} />
                  <span className="font-semibold">Devam Edenler</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {tasks.inProgress.length}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle size={18} />
                  <span className="font-semibold">Tamamlananlar</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {tasks.done.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sürükle Bırak Alanı */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Yapılacaklar Listesi */}
            <TaskList 
              id="todo" 
              title="Yapılacaklar" 
              tasks={tasks.todo} 
              icon={<HelpCircle className="text-blue-600" size={18} />}
              loading={loading}
              color="bg-blue-50"
              borderColor="border-blue-200"
              emptyText="Yapılacak görev yok"
            />
            
            {/* Devam Edenler Listesi */}
            <TaskList 
              id="inProgress" 
              title="Devam Edenler" 
              tasks={tasks.inProgress} 
              icon={<Timer className="text-amber-600" size={18} />}
              loading={loading}
              color="bg-amber-50"
              borderColor="border-amber-200"
              emptyText="Devam eden görev yok"
            />
            
            {/* Yapılanlar Listesi */}
            <TaskList 
              id="done" 
              title="Tamamlananlar" 
              tasks={tasks.done} 
              icon={<CheckCircle className="text-green-600" size={18} />}
              loading={loading}
              color="bg-green-50"
              borderColor="border-green-200"
              emptyText="Tamamlanan görev yok"
            />
          </div>
        </DragDropContext>
        
        {/* Yardım bilgisi */}
        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>Görevleri sürükleyip bırakarak listeler arasında taşıyabilirsiniz.</p>
          <p className="mt-1">Çalışma durumunuz otomatik olarak kaydedilir.</p>
        </div>
      </div>
    </div>
  );
}

// Eski export adını koruyoruz, yeni ada yönlendirme yapıyoruz
export const DailyProgramContent = DailyProgramClient;

// Görev listesi bileşeni
function TaskList({ 
  id, 
  title, 
  tasks, 
  icon, 
  loading, 
  color, 
  borderColor,
  emptyText 
}: { 
  id: TaskCategory; 
  title: string; 
  tasks: Task[]; 
  icon: React.ReactNode;
  loading: boolean;
  color: string;
  borderColor: string;
  emptyText: string;
}) {
  return (
    <div className={`${color} rounded-lg p-4 border ${borderColor} min-h-[400px] flex flex-col`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
        <Badge variant="outline" className="ml-auto">{tasks.length}</Badge>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 transition-colors rounded-md p-2 ${
              snapshot.isDraggingOver ? 'bg-accent/50' : ''
            }`}
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-24 w-full"><Skeleton className="h-full w-full" /></div>
                <div className="h-24 w-full"><Skeleton className="h-full w-full" /></div>
                <div className="h-24 w-full"><Skeleton className="h-full w-full" /></div>
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-3 bg-white rounded-md mb-3 shadow-sm border border-gray-100 ${
                        snapshot.isDragging ? 'shadow-md' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        borderLeft: `4px solid ${task.color}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                          style={{ backgroundColor: task.color }}
                        >
                          {task.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium">{task.name}</div>
                      </div>
                      
                      {task.topics.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2 pl-8">
                          {task.topics.join(', ')}
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 pl-8">
                        <Clock size={12} className="mr-1" />
                        {task.duration} dakika
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">{emptyText}</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 