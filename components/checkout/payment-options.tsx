"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";

interface PaymentOptionsProps {
  programName: string;
  price: number;
  currency: string;
  features: string[];
  onApplyDiscount: (code: string) => Promise<{
    valid: boolean;
    discountedPrice?: number;
    message?: string;
  }>;
}

export function PaymentOptions({
  programName,
  price,
  currency,
  features,
  onApplyDiscount,
}: PaymentOptionsProps) {
  const [discountCode, setDiscountCode] = useState<string>("");
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [discountStatus, setDiscountStatus] = useState<{
    applied: boolean;
    valid?: boolean;
    message?: string;
    discountedPrice?: number;
  }>({ applied: false });

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplying(true);
    
    try {
      const result = await onApplyDiscount(discountCode);
      
      setDiscountStatus({
        applied: true,
        valid: result.valid,
        message: result.message || (result.valid ? "İndirim uygulandı!" : "Geçersiz indirim kodu."),
        discountedPrice: result.discountedPrice,
      });
    } catch (error) {
      setDiscountStatus({
        applied: true,
        valid: false,
        message: "İndirim kodu uygulanırken bir hata oluştu.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sipariş Özeti</CardTitle>
        <CardDescription>{programName}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Program İçeriği</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="border-t pt-4">
          <label htmlFor="discount-code" className="block text-sm font-medium mb-2">
            İndirim Kuponu
          </label>
          <div className="flex space-x-2">
            <Input
              id="discount-code"
              placeholder="İndirim kodu giriniz..."
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1"
              disabled={discountStatus.applied && discountStatus.valid}
            />
            <Button 
              variant="outline" 
              onClick={handleApplyDiscount}
              disabled={isApplying || !discountCode || (discountStatus.applied && discountStatus.valid)}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : discountStatus.applied && discountStatus.valid ? (
                "Uygulandı"
              ) : (
                "Uygula"
              )}
            </Button>
          </div>
          
          {discountStatus.applied && (
            <div className={`mt-2 text-sm flex items-center gap-1.5 ${
              discountStatus.valid ? "text-green-600" : "text-destructive"
            }`}>
              {discountStatus.valid ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{discountStatus.message}</span>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Program fiyatı</span>
            <span>{price} {currency}</span>
          </div>
          
          {discountStatus.valid && discountStatus.discountedPrice && (
            <>
              <div className="flex justify-between text-green-600">
                <span>İndirim</span>
                <span>-{(price - discountStatus.discountedPrice).toFixed(2)} {currency}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Toplam</span>
                <span>{discountStatus.discountedPrice.toFixed(2)} {currency}</span>
              </div>
            </>
          )}
          
          {(!discountStatus.valid || !discountStatus.discountedPrice) && (
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Toplam</span>
              <span>{price.toFixed(2)} {currency}</span>
            </div>
          )}
        </div>
        
        <div className="pt-4 space-y-4">
          <h3 className="font-medium">Güvenli Ödeme</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="p-2 border rounded-md">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="#016FD0"/>
                <path d="M18.5 16H13.5V8H18.5V16Z" fill="white"/>
                <path d="M14 12C14 10.3 14.8 8.8 16 8C15.1 7.4 14 7 12.9 7C10.2 7 8 9.2 8 12C8 14.8 10.2 17 12.9 17C14 17 15.1 16.6 16 16C14.8 15.2 14 13.7 14 12Z" fill="white"/>
                <path d="M32 12C32 14.8 29.8 17 27.1 17C26 17 24.9 16.6 24 16C25.2 15.1 26 13.7 26 12C26 10.3 25.2 8.8 24 8C24.9 7.4 26 7 27.1 7C29.8 7 32 9.3 32 12Z" fill="white"/>
                <path d="M26.5 8H21.5V16H26.5V8Z" fill="white"/>
              </svg>
            </div>
            <div className="p-2 border rounded-md">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="#EB001B"/>
                <circle cx="16" cy="12" r="6" fill="#EB001B"/>
                <circle cx="24" cy="12" r="6" fill="#F79E1B"/>
                <path d="M20 7.5C21.3 8.5 22 10.1 22 12C22 13.9 21.3 15.5 20 16.5C18.7 15.5 18 13.9 18 12C18 10.1 18.7 8.5 20 7.5Z" fill="#FF5F00"/>
              </svg>
            </div>
            <div className="p-2 border rounded-md">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="#2557D6"/>
                <path d="M20.5 15L18 10H16V14.5L14 10H12L10 15H11.5L12.5 12.5L13.5 15H15V11L17 15H20.5Z" fill="white"/>
                <path d="M24 10H21V15H22.5V13.5H23.8C24.8 13.5 26 13 26 11.8C26 10.5 25 10 24 10ZM23.8 12.2H22.5V11.2H23.8C24.3 11.2 24.5 11.5 24.5 11.7C24.5 11.9 24.3 12.2 23.8 12.2Z" fill="white"/>
                <path d="M29.6 13.2C29.6 12.8 29.3 12.5 28.7 12.3C28.2 12.1 28.1 12 28.1 11.8C28.1 11.6 28.3 11.4 28.7 11.4C29 11.4 29.2 11.5 29.4 11.8L30 11C29.6 10.6 29.1 10.4 28.6 10.4C27.8 10.4 27 10.9 27 11.8C27 12.7 27.7 13 28.1 13.1C28.6 13.3 28.6 13.5 28.6 13.6C28.6 13.9 28.3 14 28 14C27.6 14 27.2 13.8 27 13.5L26.4 14.3C26.8 14.8 27.3 15 28 15C28.9 15.1 29.6 14.4 29.6 13.2Z" fill="white"/>
              </svg>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            256-bit SSL güvenli ödeme. Kredi kartı bilgileriniz bizimle paylaşılmaz ve güvenli ödeme altyapısı üzerinden işlenir.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentOptions; 