'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(`/order/table/${tableId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, tableId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiCheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Siparişiniz Alındı!
            </h1>
            <p className="text-gray-600">
              Masa {tableId} için sipariş başarıyla oluşturuldu
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-sm text-gray-600 mb-1">Sipariş No</div>
                <div className="font-bold text-gray-900">#{Math.floor(Math.random() * 10000)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Masa</div>
                <div className="font-bold text-gray-900">{tableId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  Tahmini Süre
                </div>
                <div className="font-bold text-orange-600">15-20 dk</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  Garson
                </div>
                <div className="font-bold text-gray-900">Ahmet</div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
            <div className="font-semibold text-blue-900 mb-2">Sonraki Adımlar:</div>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">1.</span>
                <span>Siparişiniz mutfağa iletildi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">2.</span>
                <span>Hazırlandıktan sonra garson getirecek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">3.</span>
                <span>Afiyet olsun! 🍽️</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/order/table/${tableId}`}
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              Yeni Sipariş Ver
            </Link>
            
            <div className="text-sm text-gray-500">
              {countdown} saniye sonra otomatik yönlendirileceksiniz...
            </div>
          </div>

          {/* QR Code Info */}
          <div className="mt-6 pt-6 border-t text-center">
            <div className="text-sm text-gray-600">
              Sipariş eklemek için QR kodu tekrar okutabilirsiniz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











