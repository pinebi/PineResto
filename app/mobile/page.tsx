'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiTruck, FiSettings } from 'react-icons/fi';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-center">🍽️ Restoran Mobil</h1>
          <p className="text-center text-blue-100 mt-1">Mobil Yönetim Paneli</p>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <Link 
          href="/mobile/waiter"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <FiUser className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Garson Paneli</h2>
              <p className="text-gray-600 text-sm mt-1">Sipariş alma ve masa yönetimi</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/mobile/kitchen"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <FiShoppingBag className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Mutfak Ekranı</h2>
              <p className="text-gray-600 text-sm mt-1">Sipariş takip ve hazırlık</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/mobile/delivery"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-4 rounded-full">
              <FiTruck className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Kurye Paneli</h2>
              <p className="text-gray-600 text-sm mt-1">Teslimat takibi</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/mobile/settings"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <FiSettings className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Ayarlar</h2>
              <p className="text-gray-600 text-sm mt-1">Uygulama ayarları</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Özet</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600 mt-1">Aktif Sipariş</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">₺12,450</div>
              <div className="text-sm text-gray-600 mt-1">Günlük Ciro</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-600 mt-1">Hazırlanan</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">16</div>
              <div className="text-sm text-gray-600 mt-1">Tamamlanan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Link href="/mobile" className="flex flex-col items-center text-blue-600">
              <FiUser className="w-6 h-6" />
              <span className="text-xs mt-1">Ana Sayfa</span>
            </Link>
            <Link href="/mobile/waiter" className="flex flex-col items-center text-gray-600">
              <FiShoppingBag className="w-6 h-6" />
              <span className="text-xs mt-1">Garson</span>
            </Link>
            <Link href="/mobile/kitchen" className="flex flex-col items-center text-gray-600">
              <FiTruck className="w-6 h-6" />
              <span className="text-xs mt-1">Mutfak</span>
            </Link>
            <Link href="/mobile/settings" className="flex flex-col items-center text-gray-600">
              <FiSettings className="w-6 h-6" />
              <span className="text-xs mt-1">Ayarlar</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}






