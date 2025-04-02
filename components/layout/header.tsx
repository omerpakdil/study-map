"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export function Header() {
  const router = useRouter();
  const [language, setLanguage] = useState<string>("tr");
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Scroll olayını dinleyerek header'ın görünümünü değiştirelim
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // Dil değişikliği işlemi burada yapılacak
  };

  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-md flex justify-center ${
        scrolled 
          ? "bg-background/85 shadow-md" 
          : "bg-background/60"
      }`}
      initial="initial"
      animate="animate"
      variants={headerVariants}
    >
      <div className="container max-w-5xl flex h-16 items-center justify-between px-4 md:px-6">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">StudyMap</span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            {["faq", "contact"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link href={`/${item}`} className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
                  {item === "faq" ? "SSS" : "İletişim"}
                  <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[80px] border-primary/20 hover:bg-primary/5 transition-colors duration-300">
                <SelectValue placeholder="Dil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">TR</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => router.push("/analysis")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-md transition-all duration-300"
            >
              Başla
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header; 