import React from 'react';
import ProgramCalendarPage from './client';

export default async function ProgramPage({ params }: { params: { programId: string } }) {
  // Next.js 14'te params'ı await etmemiz gerekiyor
  const resolvedParams = await params;
  const programId = resolvedParams.programId;
  
  return <ProgramCalendarPage programId={programId} />;
} 