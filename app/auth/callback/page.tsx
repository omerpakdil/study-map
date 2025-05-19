'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Doğrulama işlemi gerçekleştiriliyor...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Search params should contain token information from Supabase redirect
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Doğrulama sırasında bir hata oluştu.');
          return;
        }
        
        // If no error, assume the email was confirmed successfully
        setStatus('success');
        setMessage('E-posta adresiniz başarıyla doğrulandı!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Error during auth callback:', error);
        setStatus('error');
        setMessage('Doğrulama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            <span>E-posta Doğrulama</span>
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'E-posta doğrulamanız kontrol ediliyor...'}
            {status === 'success' && 'Hesabınız başarıyla doğrulandı!'}
            {status === 'error' && 'E-posta doğrulamasında bir sorun oluştu.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-md ${
            status === 'loading' ? 'bg-blue-50 text-blue-700' : 
            status === 'success' ? 'bg-green-50 text-green-700' : 
            'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Giriş sayfasına otomatik olarak yönlendirileceksiniz...
              </p>
              <Button asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-2">
              <Button asChild variant="outline">
                <Link href="/register">Tekrar Kayıt Ol</Link>
              </Button>
              <Button asChild variant="link">
                <Link href="/">Ana Sayfaya Dön</Link>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 