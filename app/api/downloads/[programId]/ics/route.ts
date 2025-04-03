import { NextResponse } from "next/server";
import { generateRandomProgram } from "@/lib/dummy-data";
import { headers } from "next/headers";
import { createEvents, EventAttributes } from "ics";
import { parseISO, addMinutes } from "date-fns";

// Programı getiren fonksiyon (gerçek uygulamada API veya veritabanından)
const getProgramData = async (programId: string) => {
  // Bu örnekte dummy veri kullanıyoruz
  // Gerçek uygulamada veritabanından veya API'den programı almak gerekir
  return generateRandomProgram(programId);
};

// String tarihini Date nesnesine dönüştürme
const parseDate = (dateStr: string): Date => {
  return parseISO(dateStr);
};

// ICS formatına dönüştürme fonksiyonu
const convertProgramToICS = (program: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const events: EventAttributes[] = [];

      // Her haftanın her günü ve her konusu için bir takvim olayı oluştur
      program.weeks.forEach((week: any) => {
        week.days.forEach((day: any) => {
          const dayDate = parseDate(day.date);
          
          // Her ders için bir olay oluştur
          day.subjects.forEach((subject: any, index: number) => {
            // Derslerin başlangıç saatini hesapla
            // Sabah 9'dan başlasın ve önceki derslerin sürelerini hesaba kat
            let startTime = new Date(dayDate);
            startTime.setHours(9, 0, 0, 0); // 09:00 başlangıç
            
            // Önceki derslerin sürelerini ekle
            for (let i = 0; i < index; i++) {
              startTime = addMinutes(startTime, day.subjects[i].duration + 15); // Her ders arasında 15 dk ara
            }
            
            // Bitiş zamanı
            const endTime = addMinutes(startTime, subject.duration);
            
            // ICS olayı oluştur
            const event: EventAttributes = {
              start: [
                startTime.getFullYear(),
                startTime.getMonth() + 1,
                startTime.getDate(),
                startTime.getHours(),
                startTime.getMinutes()
              ],
              end: [
                endTime.getFullYear(),
                endTime.getMonth() + 1,
                endTime.getDate(),
                endTime.getHours(),
                endTime.getMinutes()
              ],
              title: `${subject.name} (${program.examType} Çalışma)`,
              description: `Konular: ${subject.topics.join(", ")}\nSüre: ${subject.duration} dakika`,
              location: "Çalışma Alanı",
              url: `https://studymap.app/program/${program.id}`,
              categories: ["study", subject.name],
              status: "CONFIRMED",
              busyStatus: "BUSY",
              organizer: { name: "StudyMap", email: "info@studymap.app" }
            };
            
            events.push(event);
          });
        });
      });
      
      // ICS oluştur
      createEvents(events, (error: Error | undefined, value: string | undefined) => {
        if (error) {
          reject(error);
        } else if (value) {
          resolve(value);
        } else {
          reject(new Error("ICS oluşturulamadı"));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export async function GET(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    // params nesnesinden programId'yi al
    const { programId } = params;
    
    if (!programId) {
      return NextResponse.json(
        { error: "Program ID eksik veya geçersiz" },
        { status: 400 }
      );
    }

    // Program verisini getir
    const program = await getProgramData(programId);
    
    if (!program) {
      return NextResponse.json(
        { error: "Program bulunamadı" },
        { status: 404 }
      );
    }

    // Program verisini ICS formatına dönüştür
    const icsContent = await convertProgramToICS(program);

    // ICS dosyasını response olarak gönder
    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(program.title)}.ics"`,
      },
    });
  } catch (error) {
    console.error("ICS oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Takvim dosyası oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 