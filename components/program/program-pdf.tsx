"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";

// Türkçe karakter desteği için yazı tipi
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

// Stiller
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#7856FF",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 15,
    marginTop: 25,
    color: "#3F3D56",
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#7856FF",
    fontWeight: 500,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
    color: "#333333",
  },
  infoBox: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  infoItem: {
    fontSize: 11,
    marginBottom: 5,
    flexDirection: "row",
  },
  infoLabel: {
    fontWeight: 500,
    marginRight: 5,
    color: "#555555",
  },
  infoValue: {
    color: "#333333",
  },
  weekItem: {
    marginBottom: 15,
    borderBottom: "1pt solid #e0e0e0",
    paddingBottom: 10,
  },
  weekHeader: {
    fontSize: 14,
    fontWeight: 500,
    color: "#3F3D56",
    marginBottom: 5,
  },
  dayItem: {
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: 500,
    color: "#7856FF",
    marginBottom: 3,
  },
  subjectItem: {
    marginLeft: 10,
    fontSize: 10,
    color: "#555555",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#777777",
    borderTop: "1pt solid #e0e0e0",
    paddingTop: 10,
  },
  logo: {
    width: 120,
    marginBottom: 15,
    alignSelf: "center",
  },
  badge: {
    backgroundColor: "#7856FF",
    color: "#ffffff",
    padding: "3 6",
    borderRadius: 3,
    fontSize: 8,
    marginLeft: 5,
    textTransform: "uppercase",
  },
  calendarView: {
    marginTop: 10,
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 5,
    color: "#3F3D56",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  calendarDay: {
    width: "13.6%",
    height: 20,
    margin: "0 1%",
    marginBottom: 5,
    textAlign: "center",
    fontSize: 9,
    padding: 2,
  },
  calendarDayHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: 500,
  },
  calendarDayWithContent: {
    backgroundColor: "#E6E1FF",
    borderRadius: 2,
  },
  calendarDate: {
    width: "13.6%",
    height: 20,
    margin: "0 1%",
    marginBottom: 5,
    textAlign: "center",
    fontSize: 9,
    padding: 2,
    borderRadius: 2,
  },
  notesSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 5,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#3F3D56",
    marginBottom: 5,
  },
  noteItem: {
    fontSize: 10,
    marginBottom: 3,
    color: "#555555",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: "#777777",
  }
});

// Program PDF bileşeni
interface ProgramPDFProps {
  programName: string;
  examType: string;
  examDate: string;
  studentName?: string;
  email: string;
  createdAt: string;
  weeks: Array<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    days: Array<{
      date: string;
      dayName: string;
      subjects: Array<{
        name: string;
        duration: number;
        topics: string[];
      }>;
    }>;
  }>;
  notes?: string[];
}

// Türkçe gün isimleri
const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Türkçe ay isimleri
const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// Tarih formatı (01 Ocak 2023)
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const ProgramPDF: React.FC<ProgramPDFProps> = ({ 
  programName,
  examType,
  examDate,
  studentName,
  email,
  createdAt,
  weeks,
  notes
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{programName}</Text>
        
        {/* Temel Bilgiler */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sınav Türü:</Text>
            <Text style={styles.infoValue}>{examType}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sınav Tarihi:</Text>
            <Text style={styles.infoValue}>{formatDate(examDate)}</Text>
          </View>
          
          {studentName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Öğrenci Adı:</Text>
              <Text style={styles.infoValue}>{studentName}</Text>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>E-posta:</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Oluşturulma Tarihi:</Text>
            <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
          </View>
        </View>
        
        {/* Program Özeti */}
        <Text style={styles.subHeader}>Program Özeti</Text>
        <Text style={styles.paragraph}>
          Bu çalışma programı {formatDate(examDate)} tarihinde gerçekleşecek olan {examType} sınavı için özel olarak hazırlanmıştır.
          Program {weeks.length} haftalık bir süreyi kapsamaktadır ve günlük çalışma süresi ve konuları detaylı bir şekilde belirlenmiştir.
        </Text>
        
        {/* Her Hafta */}
        <Text style={styles.subHeader}>Haftalık Program</Text>
        
        {weeks.map((week, index) => (
          <View key={index} style={styles.weekItem}>
            <Text style={styles.weekHeader}>
              Hafta {week.weekNumber}: {formatDate(week.startDate)} - {formatDate(week.endDate)}
            </Text>
            
            {week.days.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayItem}>
                <Text style={styles.dayHeader}>
                  {day.dayName}, {formatDate(day.date)}
                </Text>
                
                {day.subjects.length > 0 ? (
                  day.subjects.map((subject, subjectIndex) => (
                    <Text key={subjectIndex} style={styles.subjectItem}>
                      • {subject.name} ({subject.duration} dk) - {subject.topics.join(", ")}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.subjectItem}>• Bugün için planlanmış çalışma bulunmamaktadır.</Text>
                )}
              </View>
            ))}
          </View>
        ))}
        
        {/* Notlar Bölümü */}
        {notes && notes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Önemli Notlar</Text>
            {notes.map((note, index) => (
              <Text key={index} style={styles.noteItem}>• {note}</Text>
            ))}
          </View>
        )}
        
        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} StudyMap. Bu program {email} için özel olarak hazırlanmıştır.
          Bu belgeyi paylaşmak veya çoğaltmak için izin almanız gerekmektedir.
        </Text>
        
        {/* Sayfa Numarası */}
        <Text 
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
}; 