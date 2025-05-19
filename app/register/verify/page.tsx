'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // Get email from query params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResendEmail = async () => {
    if (resendDisabled) return;
    
    setResendDisabled(true);
    setCountdown(60); // 60 second countdown
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Doğrulama e-postası gönderilemedi');
      }
      
      // Success notification in a real app would show a toast here
    } catch (error) {
      console.error('Error resending verification email:', error);
      // Error notification in a real app would show a toast here
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-center">E-postanızı Doğrulayın</CardTitle>
          <CardDescription className="text-center">
            Kayıt işleminizi tamamlamak için e-postanızı doğrulamanız gerekiyor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-md bg-muted space-y-4">
            <p className="text-sm">
              <span className="font-medium">{email}</span> adresine bir doğrulama e-postası gönderdik.
            </p>
            <p className="text-sm">
              Lütfen gelen kutunuzu (ve spam klasörünüzü) kontrol edin ve e-postadaki doğrulama bağlantısına tıklayın.
            </p>
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>E-posta gelmediyse:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Spam klasörünüzü kontrol edin</li>
              <li>E-posta adresinizi doğru girdiğinizden emin olun</li>
              <li>Birkaç dakika bekleyin ve yenilemek için resend butonunu kullanın</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={resendDisabled}
            variant="outline"
            className="w-full"
          >
            {resendDisabled ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {countdown} saniye sonra tekrar deneyin
              </>
            ) : (
              'Doğrulama E-postasını Yeniden Gönder'
            )}
          </Button>
          
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Giriş Sayfasına Dön
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 