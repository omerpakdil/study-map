"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from "@react-pdf/renderer";
import { differenceInDays, addDays, format, parse } from 'date-fns';

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
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    color: "#7856FF",
    fontWeight: "bold",
  },
  dateTitle: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
    color: "#3F3D56",
  },
  countdown: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#FF6384",
    fontWeight: "bold",
  },
  programContainer: {
    marginTop: 20,
    marginBottom: 20,
    border: "1pt solid #E6E1FF",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#FAFAFA",
  },
  programTitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#7856FF",
    fontWeight: 500,
    textAlign: "center",
  },
  taskItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    borderLeft: "3pt solid #7856FF",
  },
  checkbox: {
    width: 16,
    height: 16,
    border: "1pt solid #7856FF",
    borderRadius: 3,
    marginRight: 10,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 12,
    fontWeight: 500,
    color: "#3F3D56",
    marginBottom: 4,
  },
  taskTopics: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 2,
  },
  taskDuration: {
    fontSize: 9,
    color: "#7856FF",
    fontWeight: 500,
  },
  noTasks: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  notesSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 5,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#3F3D56",
    marginBottom: 10,
  },
  notesContent: {
    fontSize: 10,
    color: "#555555",
    padding: 5,
    minHeight: 100,
    border: "1pt dotted #CCCCCC",
    borderRadius: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    textAlign: "center",
    color: "#999999",
    borderTop: "1pt solid #e0e0e0",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: "#777777",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E6E1FF",
    borderRadius: 4,
    marginTop: 5,
    marginBottom: 15,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#7856FF",
    borderRadius: 4,
  },
  subjectIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  infoBox: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "48%",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 9,
    color: "#666666",
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 500,
    color: "#333333",
  },
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

// Konu için icon seçme
const getSubjectIcon = (subjectName: string) => {
  // Basit bir hashing yöntemi ile konu adına göre renk belirleme
  const hash = subjectName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
  const color = colors[hash % colors.length];
  
  // İcon adını belirle (varsayılan "book" olsun)
  let iconPath = "";
  const subjectLower = subjectName.toLowerCase();
  
  if (subjectLower.includes("matematik") || subjectLower.includes("math")) {
    iconPath = "M4 4v16h16V4H4zm2 2h12v12H6V6zm9.5 1.5a.5.5 0 00-.5.5v7.5a.5.5 0 001 0V8a.5.5 0 00-.5-.5zM8.5 9a.5.5 0 00-.5.5v5.5a.5.5 0 001 0V9.5a.5.5 0 00-.5-.5zm3 2a.5.5 0 00-.5.5v3.5a.5.5 0 001 0V11.5a.5.5 0 00-.5-.5z";
  } else if (subjectLower.includes("fizik") || subjectLower.includes("physics")) {
    iconPath = "M10,2.5A7.5,7.5 0 0,0 2.5,10A7.5,7.5 0 0,0 10,17.5A7.5,7.5 0 0,0 17.5,10A7.5,7.5 0 0,0 10,2.5M10,4A6,6 0 0,1 16,10A6,6 0 0,1 10,16A6,6 0 0,1 4,10A6,6 0 0,1 10,4M7,6V14H9V6H7M11,6V14H13V6H11Z";
  } else if (subjectLower.includes("kimya") || subjectLower.includes("chemistry")) {
    iconPath = "M5,19A1,1 0 0,0 6,20H18A1,1 0 0,0 19,19C19,18.79 18.93,18.59 18.82,18.43L13,8.35V4H11V8.35L5.18,18.43C5.07,18.59 5,18.79 5,19M6,22A3,3 0 0,1 3,19C3,18.4 3.18,17.84 3.5,17.37L9,7.81V6A1,1 0 0,1 8,5V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V5A1,1 0 0,1 15,6V7.81L20.5,17.37C20.82,17.84 21,18.4 21,19A3,3 0 0,1 18,22H6M13,10A1,1 0 0,1 12,11A1,1 0 0,1 11,10A1,1 0 0,1 12,9A1,1 0 0,1 13,10Z";
  } else if (subjectLower.includes("biyoloji") || subjectLower.includes("biology")) {
    iconPath = "M20,10C22,13 17,22 15,22C13,22 13,21 12,21C11,21 11,22 9,22C7,22 2,13 4,10C6,7 9,7 11,8V5C5.38,8.07 4.11,3.78 4.11,3.78C4.11,3.78 6.77,0.19 11,5V3H13V8C15,7 18,7 20,10Z";
  } else if (subjectLower.includes("tarih") || subjectLower.includes("history")) {
    iconPath = "M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3";
  } else if (subjectLower.includes("ingilizce") || subjectLower.includes("english")) {
    iconPath = "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z";
  } else if (subjectLower.includes("geometri") || subjectLower.includes("geometry")) {
    iconPath = "M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z";
  } else if (subjectLower.includes("edebiyat") || subjectLower.includes("literature")) {
    iconPath = "M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V6.5C10.55,5.4 8.45,5 6.5,5V5Z";
  } else {
    // Varsayılan kitap ikonu
    iconPath = "M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z";
  }
  
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path d={iconPath} fill={color} />
    </Svg>
  );
};

export const ProgramPDF: React.FC<ProgramPDFProps> = ({ 
  programName,
  examType,
  examDate,
  studentName,
  email,
  createdAt,
  weeks,
  notes = []
}) => {
  // Tüm günleri düz bir diziye dönüştür
  const allDays = weeks.flatMap(week => week.days);
  
  // Sınav tarihini Date nesnesine çevir
  const examDateObj = new Date(examDate);
  
  // Sadece sınav tarihinden önceki günleri filtrele
  const daysUntilExam = allDays.filter(day => {
    const dayDate = new Date(day.date);
    return dayDate <= examDateObj;
  });
  
  // Gün sayısını hesapla
  const daysCount = daysUntilExam.length;
  
  // Varsayılan notları oluştur (her sayfa için boş)
  const defaultPageNotes = Array(daysCount).fill("");
  
  return (
    <Document>
      {/* Her gün için ayrı bir sayfa oluştur */}
      {daysUntilExam.map((day, index) => {
        // Bu güne kadar geçen gün sayısı (program ilerlemesi)
        const progress = ((index + 1) / daysCount) * 100;
        
        // Sınava kalan gün sayısı
        const daysLeft = daysCount - index - 1;
        
        return (
          <Page size="A4" style={styles.page} key={index}>
            {/* Header */}
            <Text style={styles.header}>{programName}</Text>
            <Text style={styles.dateTitle}>{day.dayName}, {formatDate(day.date)}</Text>
            <Text style={styles.countdown}>
              Sınava Kalan Süre: {daysLeft} Gün
            </Text>
            
            {/* İlerleme çubuğu */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            
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
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>İlerleme:</Text>
                <Text style={styles.infoValue}>%{Math.round(progress)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sayfa:</Text>
                <Text style={styles.infoValue}>{index + 1} / {daysCount}</Text>
              </View>
            </View>
            
            {/* Günün Programı */}
            <View style={styles.programContainer}>
              <Text style={styles.programTitle}>Günün Çalışma Programı</Text>
              
              {day.subjects.length > 0 ? (
                day.subjects.map((subject, subjectIndex) => (
                  <View key={subjectIndex} style={styles.taskItem}>
                    <View style={styles.checkbox} />
                    <View style={styles.taskContent}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {getSubjectIcon(subject.name)}
                        <Text style={styles.taskName}>{subject.name}</Text>
                      </View>
                      <Text style={styles.taskTopics}>
                        Konular: {subject.topics.join(", ")}
                      </Text>
                      <Text style={styles.taskDuration}>
                        Süre: {subject.duration} dakika
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noTasks}>
                  Bu gün için planlanmış çalışma bulunmamaktadır.
                </Text>
              )}
            </View>
            
            {/* Notlar Bölümü */}
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notlar</Text>
              <View style={styles.notesContent}>
                <Text>{notes[index] || defaultPageNotes[index]}</Text>
              </View>
            </View>
            
            {/* Footer */}
            <Text style={styles.footer}>
              © {new Date().getFullYear()} StudyMap. Bu program {email} için {formatDate(createdAt)} tarihinde oluşturulmuştur.
            </Text>
            
            {/* Sayfa Numarası */}
            <Text style={styles.pageNumber}>
              {index + 1} / {daysCount}
            </Text>
          </Page>
        );
      })}
    </Document>
  );
}; 