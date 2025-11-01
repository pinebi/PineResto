'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiBell, FiGlobe, FiMoon, FiLock, FiInfo, FiLogOut } from 'react-icons/fi';

export default function MobileSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('tr');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="p-2">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">Ayarlar</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-4">
              <FiUser className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ahmet Yılmaz</h2>
              <p className="text-gray-600">Garson</p>
              <p className="text-sm text-gray-500">ID: #12345</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 p-4 border-b">Bildirimler</h3>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiBell className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Push Bildirimleri</div>
                  <div className="text-sm text-gray-500">Yeni siparişler için bildirim al</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiBell className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Ses Bildirimleri</div>
                  <div className="text-sm text-gray-500">Bildirim sesi çal</div>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 p-4 border-b">Görünüm</h3>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiMoon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Karanlık Mod</div>
                  <div className="text-sm text-gray-500">Gözlerinizi koruyun</div>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiGlobe className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Dil</div>
                  <div className="text-sm text-gray-500">Türkçe</div>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 p-4 border-b">Güvenlik</h3>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <FiLock className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Şifreyi Değiştir</div>
                <div className="text-sm text-gray-500">Hesap şifrenizi güncelleyin</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 p-4 border-b">Hakkında</h3>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <FiInfo className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Uygulama Bilgisi</div>
                <div className="text-sm text-gray-500">Versiyon 1.0.0</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        {/* Logout */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl shadow-md font-medium flex items-center justify-center space-x-2 transition-colors">
          <FiLogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Link href="/mobile" className="flex flex-col items-center text-gray-600">
              <FiUser className="w-6 h-6" />
              <span className="text-xs mt-1">Ana Sayfa</span>
            </Link>
            <Link href="/mobile/waiter" className="flex flex-col items-center text-gray-600">
              <FiBell className="w-6 h-6" />
              <span className="text-xs mt-1">Garson</span>
            </Link>
            <Link href="/mobile/kitchen" className="flex flex-col items-center text-gray-600">
              <FiGlobe className="w-6 h-6" />
              <span className="text-xs mt-1">Mutfak</span>
            </Link>
            <Link href="/mobile/settings" className="flex flex-col items-center text-blue-600">
              <FiLock className="w-6 h-6" />
              <span className="text-xs mt-1">Ayarlar</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}











