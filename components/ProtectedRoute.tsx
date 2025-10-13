'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      alert(`⛔ Erişim Reddedildi!\n\nBu sayfaya erişim yetkiniz yok.\nRolünüz: ${user.role}\nİzin verilen roller: ${allowedRoles.join(', ')}`);
      router.push('/dashboard');
    }
  }, [user, allowedRoles, redirectTo, router]);

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Yetkilendiriliyor...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}






