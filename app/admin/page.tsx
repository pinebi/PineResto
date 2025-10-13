'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import NotificationSystem from '@/components/admin/NotificationSystem';
import DashboardPage from './dashboard/page';
import CatalogPage from './catalog/page';
import OrdersPage from './orders/page';
import CustomersPage from './customers/page';
import ReportsPage from './reports/page';
import InventoryPage from './inventory/page';
import UsersPage from './users/page';
import SettingsPage from './settings/page';
import TablesPage from './tables/page';
import QRCodesPage from './qr-codes/page';
import CustomizationPage from './customization/page';
import AIPage from './ai/page';
import ReceiptDesignPage from './receipt-design/page';

type TabType = 'dashboard' | 'catalog' | 'orders' | 'tables' | 'customers' | 'reports' | 'inventory' | 'users' | 'qr-codes' | 'customization' | 'ai' | 'receipt-design' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { t } = useTranslations();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  // LocalStorage'dan bildirim ayarlarını yükle
  useEffect(() => {
    const savedSound = localStorage.getItem('notificationSound');
    const savedPush = localStorage.getItem('notificationPush');
    
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedPush !== null) setPushEnabled(savedPush === 'true');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('admin.title')}
            </h1>
            <Link 
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('nav.home')}
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'dashboard'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 {t('admin.dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'catalog'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📦 {t('admin.catalog')}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'orders'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 {t('admin.orders')}
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'tables'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🪑 {t('admin.tables')}
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'customers'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 {t('admin.customers')}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'reports'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 {t('admin.reports')}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'inventory'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📦 {t('admin.inventory')}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'users'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              👤 {t('admin.users')}
            </button>
            <button
              onClick={() => setActiveTab('qr-codes')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'qr-codes'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📱 QR Kodlar
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'customization'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎨 Özelleştir
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'ai'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🤖 AI Asistan
            </button>
            <button
              onClick={() => setActiveTab('receipt-design')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'receipt-design'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🧾 Fiş Tasarım
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors text-sm ${
                activeTab === 'settings'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚙️ {t('admin.settings')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'catalog' && <CatalogPage />}
            {activeTab === 'orders' && <OrdersPage />}
            {activeTab === 'tables' && <TablesPage />}
            {activeTab === 'customers' && <CustomersPage />}
            {activeTab === 'reports' && <ReportsPage />}
            {activeTab === 'inventory' && <InventoryPage />}
            {activeTab === 'users' && <UsersPage />}
            {activeTab === 'qr-codes' && <QRCodesPage />}
            {activeTab === 'customization' && <CustomizationPage />}
            {activeTab === 'ai' && <AIPage />}
            {activeTab === 'receipt-design' && <ReceiptDesignPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </div>
      </div>

      {/* Notification System - Sadece Admin'de */}
      <NotificationSystem soundEnabled={soundEnabled} pushEnabled={pushEnabled} />
    </div>
  );
}

