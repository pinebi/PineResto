'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Kullanıcı adı veya şifre hatalı!');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', role: '👨‍💼 Admin', access: 'Tüm Sistem' },
    { username: 'garson1', role: '👨‍🍳 Garson', access: 'Garson Ekranı' },
    { username: 'mutfak1', role: '👩‍🍳 Mutfak', access: 'Mutfak Ekranı' },
    { username: 'kurye1', role: '🚴 Kurye', access: 'Kurye Ekranı' },
    { username: 'kasa1', role: '💰 Kasa', access: 'Kasa & Raporlar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold text-white mb-2">Restoran Sistemi</h1>
          <p className="text-blue-200">Kullanıcı Girişi</p>
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

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
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
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-white font-semibold mb-4 text-center">📝 Demo Hesaplar</div>
          <div className="space-y-2 text-sm">
            {demoAccounts.map((account, idx) => (
              <div
                key={idx}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between hover:bg-white/30 transition-colors cursor-pointer"
                onClick={() => {
                  setUsername(account.username);
                  setPassword('12345');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-white font-medium">{account.role}</div>
                </div>
                <div className="text-blue-100 text-xs">{account.access}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-white/80 text-xs">
            Tüm şifreler: <span className="font-bold">12345</span>
          </div>
        </div>
      </div>
    </div>
  );
}











