// Client bileşenlerini import et
import { DailyProgramClient, DailyProgramContent } from "./client";

// Türleri yükleme
type DailyProgramContentProps = {
  programId: string;
  date: string;
};

export default async function DailyProgramPage({ params }: { params: { programId: string; date: string } }) {
  // Next.js 14'te params'ı await etmemiz gerekiyor
  const resolvedParams = await params;
  const programId = resolvedParams.programId;
  const date = resolvedParams.date;
  
  // Client bileşenine props geçerek renderla
  return <DailyProgramClient programId={programId} date={date} />;
} 