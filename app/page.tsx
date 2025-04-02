"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useScroll, useTransform, useInView, useAnimation, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Zarif, hover edilebilir 3D kartları SSR olmadan yüklemek için dynamic import kullanıyoruz
const HoverCards = dynamic(() => import("@/components/ui/3d-hover-cards"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] md:h-[350px] lg:h-[380px] w-full flex items-center justify-center">
      <div className="animate-pulse text-primary text-opacity-70">Yükleniyor...</div>
    </div>
  )
});

// Ana Sayfa
export default function Home() {
  const controlsHowItWorks = useAnimation();
  const controlsFeatures = useAnimation();
  const controlsTestimonials = useAnimation();
  
  const ref = useRef(null);
  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialRef = useRef(null);
  
  // Hero bölümünde paralaks efekt
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Görünürlüğe göre animasyonları tetikleme
  const isHowItWorksInView = useInView(howItWorksRef, { once: false, amount: 0.2 });
  const isFeaturesInView = useInView(featuresRef, { once: false, amount: 0.2 });
  const isTestimonialInView = useInView(testimonialRef, { once: false, amount: 0.2 });
  
  useEffect(() => {
    if (isHowItWorksInView) {
      controlsHowItWorks.start("visible");
    }
    if (isFeaturesInView) {
      controlsFeatures.start("visible");
    }
    if (isTestimonialInView) {
      controlsTestimonials.start("visible");
    }
  }, [isHowItWorksInView, isFeaturesInView, isTestimonialInView, controlsHowItWorks, controlsFeatures, controlsTestimonials]);

  // Framer Motion Varyantları
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const floatingAnimation = {
    y: ["-5px", "5px"],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center overflow-hidden">
      {/* Hero Bölümü - Paralaks efekt, interaktif arka plan ve 3D parçacıklar */}
      <motion.section 
        ref={heroRef}
        className="w-full py-12 md:py-24 lg:py-32 flex justify-center relative"
        style={{ 
          background: "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--background-rgb), 1) 70%)"
        }}
      >
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-[15%] w-40 h-40 rounded-full bg-primary/5 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="container max-w-5xl px-4 md:px-6 space-y-10 flex flex-col items-center relative z-10">
          <motion.div
            style={{ opacity }}
            className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full relative"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Kişiselleştirilmiş Sınav Takvimi
              </h1>
              <motion.p 
                className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Yapay zeka destekli özel çalışma programı ile hedefinize daha hızlı ulaşın. Sınavlara hazırlanmak hiç bu kadar verimli olmamıştı.
              </motion.p>
            </motion.div>

            {/* 3D Hover Kartları - Zarif ve interaktif */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="w-full mt-2"
            >
              <HoverCards />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="text-base bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300">
                  <Link href="/analysis">Hemen Başla</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" variant="outline" className="text-base border-primary/20 hover:bg-primary/5">
                  <Link href="#how-it-works">Nasıl Çalışır?</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Yönlendirici Ok Animasyonu */}
            <motion.div
              className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary opacity-70">
                <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Nasıl Çalışır - Stagger Animasyonu ile Kartlar */}
      <motion.section 
        id="how-it-works" 
        ref={howItWorksRef}
        className="w-full py-12 md:py-24 lg:py-32 flex justify-center"
        variants={sectionVariants}
        initial="hidden"
        animate={controlsHowItWorks}
      >
        <div className="container max-w-5xl px-4 md:px-6 space-y-8 md:space-y-14 flex flex-col items-center">
          <motion.div 
            className="flex flex-col items-center space-y-4 text-center max-w-3xl"
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              Nasıl Çalışır?
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Üç adımda kişiselleştirilmiş çalışma programınıza ulaşın
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 w-full">
            {[
              {
                step: 1,
                title: "Analiz",
                content: "Ayrıntılı sınav analiz formunu doldurun. Güçlü ve zayıf olduğunuz konuları, çalışma alışkanlıklarınızı ve hedeflerinizi belirleyin."
              },
              {
                step: 2,
                title: "Yapay Zeka Analizi",
                content: "Yapay zeka, verilerinizi analiz ederek size özel çalışma programını oluşturur. Zayıf olduğunuz konulara daha fazla zaman ayırır."
              },
              {
                step: 3,
                title: "Program Teslimi",
                content: "Ödemenizi tamamlayın ve kişiselleştirilmiş çalışma programınızı anında indirin. E-posta adresinize de gönderilir."
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                variants={cardVariants}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 10px 30px -10px rgba(var(--primary-rgb), 0.2)",
                  scale: 1.02
                }}
                className="h-full"
              >
                <Card className="bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <motion.div 
                        className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3 text-primary font-bold"
                        animate={floatingAnimation}
                      >
                        {item.step}
                      </motion.div>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{item.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Öne Çıkan Özellikler - Grid Animasyonu */}
      <motion.section 
        ref={featuresRef}
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex justify-center"
        variants={sectionVariants}
        initial="hidden"
        animate={controlsFeatures}
      >
        <div className="container max-w-5xl px-4 md:px-6 space-y-8 md:space-y-12 flex flex-col items-center">
          <motion.div 
            className="flex flex-col items-center space-y-4 text-center max-w-3xl"
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              Özellikler
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              StudyMap'in benzersiz özellikleri ile sınavlara hazırlanmak çok daha kolay
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {[
              {
                title: "Kişiselleştirilmiş Program",
                content: "Güçlü ve zayıf yönlerinize göre tamamen size özel hazırlanmış çalışma programı."
              },
              {
                title: "Akıllı Zaman Yönetimi",
                content: "Çalışma alışkanlıklarınıza ve müsaitlik durumunuza göre optimize edilmiş program."
              },
              {
                title: "Çoklu Dil Desteği",
                content: "Türkçe ve İngilizce dil seçenekleri ile global kullanım imkanı."
              },
              {
                title: "Farklı Sınav Sistemleri",
                content: "YKS, LGS, KPSS, ALES, YDS gibi Türkiye sınavları ve global sınav sistemleri desteği."
              },
              {
                title: "PDF ve İnteraktif Format",
                content: "Programınızı PDF olarak indirin veya çevrimiçi interaktif olarak takip edin."
              },
              {
                title: "Detaylı İlerleme Analizi",
                content: "Haftalık ve aylık ilerleme özetleri ile motivasyonunuzu yüksek tutun."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "rgba(var(--card-rgb), 0.8)" 
                }}
              >
                <Card className="backdrop-blur border-primary/5 h-full shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{feature.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Kullanıcı Yorumları - Fade-in Animasyonu */}
      <motion.section 
        ref={testimonialRef}
        className="w-full py-12 md:py-24 lg:py-32 flex justify-center"
        variants={sectionVariants}
        initial="hidden"
        animate={controlsTestimonials}
      >
        <div className="container max-w-5xl px-4 md:px-6 space-y-8 md:space-y-12 flex flex-col items-center">
          <motion.div 
            className="flex flex-col items-center space-y-4 text-center max-w-3xl"
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              StudyMap ile başarıya ulaşan öğrencilerin hikayelerini dinleyin
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {[
              {
                name: "Ayşe Y.",
                title: "YKS - Tıp Fakültesi",
                content: "StudyMap ile oluşturduğum program sayesinde zayıf olduğum konulara daha fazla odaklandım ve hedeflediğim puanın üzerinde bir sonuç elde ettim."
              },
              {
                name: "Mehmet K.",
                title: "KPSS",
                content: "Çalışırken zamanımı nasıl yönetmem gerektiğini bilmiyordum. StudyMap bana çok iyi bir yol haritası sundu ve ilk denemede başarılı oldum."
              },
              {
                name: "Zeynep A.",
                title: "YDS",
                content: "Yoğun iş temposu arasında sınava hazırlanmak zordu. Kısıtlı zamanımı en verimli şekilde kullanmamı sağlayan bu program için teşekkürler!"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 15px 30px -10px rgba(var(--primary-rgb), 0.15)",
                }}
                className="h-full"
              >
                <Card className="border-primary/10 hover:border-primary/30 bg-background/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-lg h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Bölümü - Gradient ve Glow Efekti*/}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground flex justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/3 w-60 h-60 rounded-full bg-white/5 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          />
        </div>
        
        <motion.div 
          className="container max-w-5xl px-4 md:px-6 space-y-8 md:space-y-12 flex flex-col items-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col items-center space-y-4 text-center max-w-3xl">
            <motion.h2 
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Başarıya Giden Yolda İlk Adımı Atın
            </motion.h2>
            <motion.p 
              className="max-w-[700px] md:text-xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Kişiselleştirilmiş çalışma programınızı oluşturmak için hemen başlayın
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6"
            >
              <Button asChild size="lg" variant="secondary" className="text-base text-primary bg-white hover:bg-white/90 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg">
                <Link href="/analysis">Hemen Başla</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SSS Bölümü */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
        <div className="container max-w-5xl px-4 md:px-6 space-y-8 md:space-y-12 flex flex-col items-center">
          <motion.div 
            className="flex flex-col items-center space-y-4 text-center max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              Sıkça Sorulan Sorular
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              StudyMap hakkında merak edilenler
            </p>
          </motion.div>

          <motion.div 
            className="space-y-4 max-w-[800px] w-full mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* FAQ öğeleri burada olacak - Daha sonra interaktif accordion bileşeniyle geliştirilecek */}
            {[
              {
                question: "Programı nasıl edinebilirim?",
                answer: "Analiz formunu doldurduktan sonra kişiselleştirilmiş programınızı önizleyebilir ve satın alma işlemini gerçekleştirebilirsiniz. Ödeme sonrası program size anında e-posta ile gönderilir."
              },
              {
                question: "Hangi sınavlar için program oluşturabiliyorsunuz?",
                answer: "Şu anda Türkiye'deki YKS, LGS, KPSS, ALES, YDS sınavları için ve ayrıca SAT, GMAT, GRE, TOEFL gibi uluslararası sınavlar için program oluşturabiliyoruz."
              },
              {
                question: "Oluşturulan program ne kadar kişiselleştirilmiş?",
                answer: "Program tamamen sizin analiz formunda belirttiğiniz güçlü/zayıf yönlerinize, çalışma alışkanlıklarınıza ve hedeflerinize göre yapay zeka tarafından özel olarak oluşturulur."
              },
              {
                question: "Ücretlendirme nasıl yapılıyor?",
                answer: "Şu anda tek seferlik 99₺ ödeme ile kişiselleştirilmiş programınızı satın alabilirsiniz. Ayrıca dönem dönem kampanyalar ve indirim kodları sunulmaktadır."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                className="border border-primary/10 rounded-lg p-6 bg-background/30 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-lg font-medium mb-2 text-primary/90">{faq.question}</h3>
                <p>{faq.answer}</p>
              </motion.div>
            ))}

            <div className="text-center mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button asChild variant="outline" className="border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                  <Link href="/faq">Tüm Soruları Görüntüle</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
