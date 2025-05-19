import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import Link from "next/link";
import UserProfileClient from "@/components/UserProfileClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyMap - Kişiselleştirilmiş Çalışma Programı",
  description: "Sınav hazırlık sürecinde daha verimli çalışmanızı sağlayacak kişiselleştirilmiş çalışma programı oluşturun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="container max-w-7xl py-3 md:py-4 px-4 md:px-6 flex justify-between items-center mx-auto">
            <Link href="/" className="text-xl font-bold text-primary">
              StudyMap
            </Link>
            <nav className="flex-1 flex justify-end gap-6 items-center">
              <Link href="/analysis" className="text-sm font-medium hover:text-primary transition-all duration-300">
                Program Oluştur
              </Link>
              <Link href="/program" className="text-sm font-medium hover:text-primary transition-all duration-300">
                Programlarım
              </Link>
              <UserProfileClient />
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="border-t border-border py-6 mt-20">
          <div className="container max-w-7xl mx-auto px-4 md:px-6 text-sm text-muted-foreground">
            <p className="text-center">© {new Date().getFullYear()} StudyMap. Tüm hakları saklıdır.</p>
          </div>
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
