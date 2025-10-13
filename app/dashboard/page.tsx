'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isRole } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Rol bazlı yönlendirme
    if (isRole('admin') || isRole('manager')) {
      router.push('/admin');
    } else if (isRole('waiter')) {
      router.push('/mobile/waiter');
    } else if (isRole('kitchen')) {
      router.push('/mobile/kitchen');
    } else if (isRole('delivery')) {
      router.push('/mobile/delivery');
    } else if (isRole('cashier')) {
      router.push('/admin'); // Kasa da admin paneline gider ama sınırlı erişim
    } else if (isRole('customer')) {
      router.push('/customer');
    } else {
      router.push('/login');
    }
  }, [user, router, isRole]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl font-semibold text-gray-700">Yönlendiriliyor...</div>
      </div>
    </div>
  );
}






