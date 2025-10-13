'use client';

import { useState } from 'react';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import { FiWifi, FiMenu, FiCreditCard, FiGrid } from 'react-icons/fi';

export default function QRCodesPage() {
  const [activeCategory, setActiveCategory] = useState<'tables' | 'menu' | 'payment' | 'wifi'>('tables');
  const baseURL = 'http://localhost:3100';

  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Kod Yönetimi</h2>
        <p className="text-gray-600 mt-1">Masa, menü ve ödeme QR kodlarını oluşturun</p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveCategory('tables')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeCategory === 'tables' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiGrid className="w-5 h-5" />
            Masa QR Kodları
          </button>
          <button
            onClick={() => setActiveCategory('menu')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeCategory === 'menu' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiMenu className="w-5 h-5" />
            Menü QR Kodu
          </button>
          <button
            onClick={() => setActiveCategory('payment')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeCategory === 'payment' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiCreditCard className="w-5 h-5" />
            Ödeme QR Kodu
          </button>
          <button
            onClick={() => setActiveCategory('wifi')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeCategory === 'wifi' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiWifi className="w-5 h-5" />
            Wi-Fi QR Kodu
          </button>
        </div>
      </div>

      {/* Tables QR Codes */}
      {activeCategory === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((tableNum) => (
            <QRCodeGenerator
              key={tableNum}
              data={`${baseURL}/order/table/${tableNum}`}
              title={`Masa ${tableNum}`}
              description="Müşteriler bu QR kodu okutarak sipariş verebilir"
            />
          ))}
        </div>
      )}

      {/* Menu QR Code */}
      {activeCategory === 'menu' && (
        <div className="max-w-md mx-auto">
          <QRCodeGenerator
            data={`${baseURL}/menu`}
            title="Menü QR Kodu"
            description="Müşteriler bu QR kodu okutarak menüyü görüntüleyebilir"
            size={300}
          />
        </div>
      )}

      {/* Payment QR Code */}
      {activeCategory === 'payment' && (
        <div className="max-w-md mx-auto">
          <QRCodeGenerator
            data={`${baseURL}/payment`}
            title="Ödeme QR Kodu"
            description="Müşteriler bu QR kodu okutarak ödeme yapabilir"
            size={300}
          />
        </div>
      )}

      {/* WiFi QR Code */}
      {activeCategory === 'wifi' && (
        <div className="max-w-md mx-auto">
          <QRCodeGenerator
            data="WIFI:T:WPA;S:RestaurantWiFi;P:12345678;;"
            title="Wi-Fi QR Kodu"
            description="Müşteriler bu QR kodu okutarak Wi-Fi'ye bağlanabilir"
            size={300}
          />
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <strong>Wi-Fi Bilgileri:</strong>
              <div className="mt-2 space-y-1">
                <div>Ağ Adı: RestaurantWiFi</div>
                <div>Şifre: 12345678</div>
                <div>Şifreleme: WPA/WPA2</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






