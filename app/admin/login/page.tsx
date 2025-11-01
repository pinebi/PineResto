'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiLock, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [firmaNo, setFirmaNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Admin paneli için özel giriş kontrolü
      if (firmaNo === '1234' && password === '123456') {
        // Admin kullanıcısı olarak giriş yap
        const success = await login('admin', '12345');
        
        if (success) {
          router.push('/admin');
        } else {
          setError('Giriş yapılırken bir hata oluştu');
        }
      } else {
        setError('Firma numarası veya şifre hatalı!');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Pine Resto - Yönetim Paneli</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {/* Firma Numarası */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma Numarası
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={firmaNo}
                  onChange={(e) => setFirmaNo(e.target.value)}
                  placeholder="Firma numaranızı girin"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş Yapılıyor...</span>
                </div>
              ) : (
                'Admin Paneline Giriş'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-white font-semibold mb-4 text-center">🔑 Demo Bilgiler</div>
          <div className="space-y-3 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white font-medium mb-1">Firma Numarası:</div>
              <div className="text-blue-100 font-mono">1234</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white font-medium mb-1">Şifre:</div>
              <div className="text-blue-100 font-mono">123456</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setFirmaNo('1234');
                setPassword('123456');
              }}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Demo bilgileri doldur
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white text-sm flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}





