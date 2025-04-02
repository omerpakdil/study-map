"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProgramPreview } from "@/components/program/program-preview";
import { motion } from "framer-motion";

export default function ProgramPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const programId = params.id;
  
  const handlePurchase = () => {
    router.push(`/checkout/${programId}`);
  };
  
  return (
    <div className="w-full flex justify-center py-10">
      <div className="container max-w-5xl px-4 md:px-6">
        <div className="flex flex-col space-y-8">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-6">
              Program Önizleme
            </h1>
            <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
              Kişiselleştirilmiş çalışma programınızın bir önizlemesi. Satın alarak tüm detaylara erişebilirsiniz.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProgramPreview programId={programId} onPurchase={handlePurchase} />
          </motion.div>
        </div>
      </div>
    </div>
  );
} 