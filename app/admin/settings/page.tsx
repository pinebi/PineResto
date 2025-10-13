'use client';

import { useState } from 'react';
import { FiGlobe, FiMoon, FiSun, FiBell, FiLock, FiUser, FiSettings, FiSave } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { languages, LanguageKey } from '@/utils/translations';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useTheme();
  const { t } = useTranslations();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // LocalStorage'dan ayarları yükle
  useState(() => {
    const savedPush = localStorage.getItem('notificationPush');
    const savedSound = localStorage.getItem('notificationSound');
    const savedEmail = localStorage.getItem('notificationEmail');
    
    if (savedPush !== null) setNotifications(savedPush === 'true');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedEmail !== null) setEmailNotifications(savedEmail === 'true');
  });

  const handleLanguageChange = (lang: LanguageKey) => {
    setLanguage(lang);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleNotificationToggle = (type: 'push' | 'sound' | 'email', value: boolean) => {
    if (type === 'push') {
      setNotifications(value);
      localStorage.setItem('notificationPush', value.toString());
    } else if (type === 'sound') {
      setSoundEnabled(value);
      localStorage.setItem('notificationSound', value.toString());
    } else if (type === 'email') {
      setEmailNotifications(value);
      localStorage.setItem('notificationEmail', value.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
        <p className="text-gray-600 mt-1">{t('settings.general')}</p>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <FiGlobe className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.language')}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {t('settings.selectLanguage')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`p-6 border-2 rounded-xl transition-all ${
                language === lang.code
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-5xl mb-3">{lang.flag}</div>
              <div className={`text-lg font-semibold ${
                language === lang.code ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {lang.name}
              </div>
              {language === lang.code && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  ✓ Seçili
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <div className="font-semibold text-blue-900 mb-1">Dil değiştirme hakkında</div>
              <div className="text-sm text-blue-700">
                Seçtiğiniz dil tüm sistemde geçerli olacaktır: Admin Panel, Kiosk, Online Sipariş, Mobil Panel ve tüm raporlar.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <FiMoon className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.theme')}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {language === 'tr' && 'Arayüz temasını seçin'}
          {language === 'en' && 'Select interface theme'}
          {language === 'de' && 'Wählen Sie das Interface-Theme'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-6 border-2 rounded-xl transition-all ${
              theme === 'light'
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiSun className={`w-12 h-12 mb-3 mx-auto ${
              theme === 'light' ? 'text-purple-600' : 'text-gray-400'
            }`} />
            <div className={`text-lg font-semibold ${
              theme === 'light' ? 'text-purple-700' : 'text-gray-900'
            }`}>
              {language === 'tr' && 'Açık Tema'}
              {language === 'en' && 'Light Theme'}
              {language === 'de' && 'Helles Theme'}
            </div>
            {theme === 'light' && (
              <div className="mt-2 text-xs text-purple-600 font-medium">
                ✓ {language === 'tr' ? 'Aktif' : language === 'en' ? 'Active' : 'Aktiv'}
              </div>
            )}
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-6 border-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiMoon className={`w-12 h-12 mb-3 mx-auto ${
              theme === 'dark' ? 'text-purple-600' : 'text-gray-400'
            }`} />
            <div className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-purple-700' : 'text-gray-900'
            }`}>
              {language === 'tr' && 'Karanlık Tema'}
              {language === 'en' && 'Dark Theme'}
              {language === 'de' && 'Dunkles Theme'}
            </div>
            {theme === 'dark' && (
              <div className="mt-2 text-xs text-purple-600 font-medium">
                ✓ {language === 'tr' ? 'Aktif' : language === 'en' ? 'Active' : 'Aktiv'}
              </div>
            )}
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={`p-6 border-2 rounded-xl transition-all ${
              theme === 'system'
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiSettings className={`w-12 h-12 mb-3 mx-auto ${
              theme === 'system' ? 'text-purple-600' : 'text-gray-400'
            }`} />
            <div className={`text-lg font-semibold ${
              theme === 'system' ? 'text-purple-700' : 'text-gray-900'
            }`}>
              {language === 'tr' && 'Sistem Teması'}
              {language === 'en' && 'System Theme'}
              {language === 'de' && 'System-Theme'}
            </div>
            {theme === 'system' && (
              <div className="mt-2 text-xs text-purple-600 font-medium">
                ✓ {language === 'tr' ? 'Aktif' : language === 'en' ? 'Active' : 'Aktiv'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <FiBell className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.notifications')}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiBell className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'tr' && 'Push Bildirimleri'}
                  {language === 'en' && 'Push Notifications'}
                  {language === 'de' && 'Push-Benachrichtigungen'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'tr' && 'Yeni siparişler için bildirim al'}
                  {language === 'en' && 'Get notifications for new orders'}
                  {language === 'de' && 'Benachrichtigungen für neue Bestellungen erhalten'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('push', !notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiBell className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'tr' && 'Ses Bildirimleri'}
                  {language === 'en' && 'Sound Notifications'}
                  {language === 'de' && 'Tonbenachrichtigungen'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'tr' && 'Bildirim sesi çal'}
                  {language === 'en' && 'Play notification sound'}
                  {language === 'de' && 'Benachrichtigungston abspielen'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('sound', !soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiBell className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'tr' && 'E-posta Bildirimleri'}
                  {language === 'en' && 'Email Notifications'}
                  {language === 'de' && 'E-Mail-Benachrichtigungen'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'tr' && 'Günlük raporları e-posta ile al'}
                  {language === 'en' && 'Receive daily reports via email'}
                  {language === 'de' && 'Tägliche Berichte per E-Mail erhalten'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('email', !emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <FiLock className="w-6 h-6 text-red-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Güvenlik</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiLock className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Şifreyi Değiştir</div>
                <div className="text-sm text-gray-500">Hesap şifrenizi güncelleyin</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiUser className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Profil Ayarları</div>
                <div className="text-sm text-gray-500">Kişisel bilgilerinizi düzenleyin</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
          <FiSave className="w-5 h-5" />
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
}
