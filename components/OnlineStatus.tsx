'use client';

import { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // İlk durum
    setIsOnline(navigator.onLine);

    // Online/Offline event listener'ları
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Sağ Üst Köşe - Sabit İndikatör */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border-2 transition-all ${
            isOnline
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-red-50 border-red-500 text-red-700 animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <FiWifi className="w-5 h-5" />
              <span className="text-sm font-semibold">Online</span>
            </>
          ) : (
            <>
              <FiWifiOff className="w-5 h-5" />
              <span className="text-sm font-semibold">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Toast Bildirimi */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl ${
              isOnline
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <FiWifi className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Bağlantı Kuruldu</div>
                  <div className="text-xs opacity-90">İnternet bağlantısı yeniden aktif</div>
                </div>
              </>
            ) : (
              <>
                <FiWifiOff className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Bağlantı Kesildi</div>
                  <div className="text-xs opacity-90">Offline modda çalışmaya devam edebilirsiniz</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}











