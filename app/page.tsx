'use client';

import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

export default function Home() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      {/* Login Button - Top Right */}
      <Link
        href="/login"
        className="fixed top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/30 flex items-center gap-2 z-10"
      >
        <span>🔐</span>
        <span>Personel Girişi</span>
      </Link>

      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          {t('nav.welcome')}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12">
          {t('nav.description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <Link 
            href="/kiosk"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-6xl mb-4">🖥️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.kiosk')}</h2>
            <p className="text-gray-600">Self-servis</p>
          </Link>
          
          <Link 
            href="/online"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.online')}</h2>
            <p className="text-gray-600">İnternet</p>
          </Link>

          <Link 
            href="/mobile"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.mobile')}</h2>
            <p className="text-gray-600">Garson</p>
          </Link>

          <Link 
            href="/customer"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Müşteri</h2>
            <p className="text-gray-600">Hesabım</p>
          </Link>
          
          <Link 
            href="/admin"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.admin')}</h2>
            <p className="text-gray-600">Yönetim</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

