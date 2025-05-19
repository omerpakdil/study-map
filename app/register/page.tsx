'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const email = searchParams.get('email') || '';

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hesap oluştur ve programlarını yönet
          </p>
        </div>
        <RegisterForm 
          defaultEmail={email}
          redirectPath={`/login?redirect=${redirect}`}
        />
        <div className="text-center text-sm">
          Zaten hesabın var mı?{" "}
          <Link href={`/login?redirect=${redirect}`} className="underline">
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
} 