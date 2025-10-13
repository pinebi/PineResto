'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiBell, FiShoppingBag, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'order' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationSystemProps {
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export default function NotificationSystem({ soundEnabled, pushEnabled }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState<Notification | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Notification sesi oluştur
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBg==');
    }

    // Test bildirimleri kaldırıldı - Sadece gerçek siparişler için bildirim gelecek
  }, []);

  const addNotification = (data: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...data,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Son 50 bildirimi tut

    // Toast göster
    if (pushEnabled) {
      setCurrentToast(notification);
      setShowToast(true);

      // Ses çal
      if (soundEnabled && audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // 5 saniye sonra kapat
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setCurrentToast(null);
      }, 5000);
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setCurrentToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <FiShoppingBag className="w-6 h-6" />;
      case 'success': return <FiCheckCircle className="w-6 h-6" />;
      case 'warning': return <FiAlertCircle className="w-6 h-6" />;
      case 'error': return <FiAlertCircle className="w-6 h-6" />;
      default: return <FiBell className="w-6 h-6" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-500 border-blue-600';
      case 'success': return 'bg-green-500 border-green-600';
      case 'warning': return 'bg-yellow-500 border-yellow-600';
      case 'error': return 'bg-red-500 border-red-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  // Test bildirimi gönderme devre dışı bırakıldı

  return (
    <>
      {/* Toast Notification - Sağ Alt */}
      {showToast && currentToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`${getColors(currentToast.type)} bg-opacity-95 backdrop-blur-sm text-white rounded-xl shadow-2xl border-2 p-4 min-w-[320px] max-w-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getIcon(currentToast.type)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{currentToast.title}</div>
                  <div className="text-sm opacity-95">{currentToast.message}</div>
                  <div className="text-xs opacity-75 mt-2">
                    {currentToast.timestamp.toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>
              <button
                onClick={closeToast}
                className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white animate-progress"
                style={{
                  animation: 'progress 5s linear forwards'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bildirim geçmişi (isteğe bağlı - daha sonra eklenebilir) */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
}

