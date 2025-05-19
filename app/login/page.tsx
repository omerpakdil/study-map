'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hesabınıza giriş yapın
          </p>
        </div>
        <LoginForm redirectPath={redirect} />
        <div className="text-center text-sm">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
} 