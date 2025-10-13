'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiStar, FiGift, FiMapPin, FiClock, FiHeart } from 'react-icons/fi';

export default function CustomerAppPage() {
  const [user] = useState({
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    phone: '0532 123 4567',
    points: 1250,
    level: 'Gold',
    orderCount: 47,
  });

  const orderHistory = [
    { id: '1', date: '2024-01-09', items: 'Adana Kebap x2, Ayran x2', total: 285, status: 'delivered' },
    { id: '2', date: '2024-01-07', items: 'İskender x1', total: 160, status: 'delivered' },
    { id: '3', date: '2024-01-05', items: 'Pide x3, Çay x3', total: 195, status: 'delivered' },
  ];

  const favorites = [
    { id: '1', name: 'Adana Kebap', price: 120, image: '🌶️' },
    { id: '2', name: 'İskender', price: 160, image: '🍖' },
    { id: '3', name: 'Pide', price: 60, image: '🥟' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Merhaba, {user.name.split(' ')[0]}!</h1>
              <p className="text-sm opacity-90 mt-1">{user.level} Üye</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <FiUser className="w-8 h-8" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90">Toplam Puanınız</div>
              <div className="text-4xl font-bold mt-1">{user.points}</div>
            </div>
            <FiStar className="w-16 h-16 opacity-30" />
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Bir sonraki seviyeye</div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="text-xs mt-1">750 puan daha</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.orderCount}</div>
            <div className="text-xs text-gray-600 mt-1">Sipariş</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{favorites.length}</div>
            <div className="text-xs text-gray-600 mt-1">Favori</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-xs text-gray-600 mt-1">Kupon</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/online"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="font-semibold text-gray-900">Sipariş Ver</div>
            <div className="text-xs text-gray-600 mt-1">Yeni sipariş oluştur</div>
          </Link>

          <Link
            href="/customer/tracking"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <FiMapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="font-semibold text-gray-900">Siparişi Takip Et</div>
            <div className="text-xs text-gray-600 mt-1">Canlı konum</div>
          </Link>
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Favori Ürünler</h3>
            <FiHeart className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {favorites.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{item.image}</div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">₺{item.price}</div>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Ekle
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Geçmişi</h3>
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <div key={order.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-600">{order.date}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">₺{order.total}</div>
                </div>
                <div className="text-sm text-gray-900 mb-2">{order.items}</div>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Tekrar Sipariş Ver
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Link href="/customer" className="flex flex-col items-center text-blue-600">
              <FiUser className="w-6 h-6" />
              <span className="text-xs mt-1">Profil</span>
            </Link>
            <Link href="/online" className="flex flex-col items-center text-gray-600">
              <FiShoppingBag className="w-6 h-6" />
              <span className="text-xs mt-1">Sipariş</span>
            </Link>
            <Link href="/customer/favorites" className="flex flex-col items-center text-gray-600">
              <FiHeart className="w-6 h-6" />
              <span className="text-xs mt-1">Favoriler</span>
            </Link>
            <Link href="/customer/rewards" className="flex flex-col items-center text-gray-600">
              <FiGift className="w-6 h-6" />
              <span className="text-xs mt-1">Ödüller</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}






