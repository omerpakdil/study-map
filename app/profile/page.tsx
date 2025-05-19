import React from 'react';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { redirect } from 'next/navigation';
import { getUserData } from '@/lib/supabase';

export default async function ProfilePage() {
  // Get user data server-side to protect this page
  const user = await getUserData();
  
  // Redirect if not logged in
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Profil</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hesap bilgilerinizi yönetin
          </p>
        </div>
        <ProfileForm user={user} />
      </div>
    </div>
  );
} 