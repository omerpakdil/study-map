"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 md:py-12 border-t bg-background flex flex-col items-center">
      <div className="container max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6 px-4 md:px-6">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-xl font-bold">
            StudyMap
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            Kişiselleştirilmiş sınav takvimi oluşturucu ile hedefinize daha hızlı ulaşın.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Bağlantılar</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                SSS
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                İletişim
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Yasal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Kullanım Şartları
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">İletişim</h3>
            <a
              href="mailto:info@studymap.app"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              info@studymap.app
            </a>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mt-8 pt-8 border-t px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} StudyMap. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default Footer; 