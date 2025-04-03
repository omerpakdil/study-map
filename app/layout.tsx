import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyMap | Kişiselleştirilmiş Sınav Takvimi Oluşturucu",
  description: "Yapay zeka destekli kişiselleştirilmiş sınav çalışma programları ile hedefinize daha hızlı ulaşın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" closeButton richColors />
      </body>
    </html>
  );
}
