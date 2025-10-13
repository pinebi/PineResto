'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiPlus, FiFolder, FiLink, FiLayers, FiTag, FiSettings } from 'react-icons/fi';
import ProductListPage from '@/components/admin/ProductListPage';
import BulkOperationsPage from '@/components/admin/BulkOperationsPage';
import CategoriesPage from '@/components/admin/CategoriesPage';
import ProductOptionsPage from '@/components/admin/ProductOptionsPage';
import AddProductPage from '@/components/admin/AddProductPage';
import BrandsPage from '@/components/admin/BrandsPage';

type CatalogTabType = 'products' | 'add-product' | 'categories' | 'product-options' | 'marketplace-mapping' | 'collections' | 'brands' | 'bulk-operations';

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTabType>('products');

  const menuItems = [
    { id: 'products', label: 'Ürün Listesi', icon: FiPackage },
    { id: 'add-product', label: 'Yeni Ürün Ekle', icon: FiPlus },
    { id: 'categories', label: 'Kategoriler', icon: FiFolder },
    { id: 'product-options', label: 'Çeşniler', icon: FiSettings },
    { id: 'marketplace-mapping', label: 'Pazaryeri Kategori Eşleştirme', icon: FiLink },
    { id: 'collections', label: 'Koleksiyonlar', icon: FiLayers },
    { id: 'brands', label: 'Markalar', icon: FiTag },
    { id: 'bulk-operations', label: 'Toplu Ürün İşlemleri', icon: FiSettings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductListPage />;

      case 'add-product':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h2>
              <button
                onClick={() => setActiveTab('products')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Geri Dön
              </button>
            </div>
            
            <AddProductPage onSuccess={() => setActiveTab('products')} />
          </div>
        );

          case 'categories':
            return <CategoriesPage />;

          case 'product-options':
            return <ProductOptionsPage />;

      case 'marketplace-mapping':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Pazaryeri Kategori Eşleştirme</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <FiLink size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Pazaryeri Entegrasyonu</h3>
                <p className="text-gray-500">Pazaryeri kategorilerini sistem kategorilerinizle eşleştirin.</p>
              </div>
            </div>
          </div>
        );

      case 'collections':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Koleksiyonlar</h2>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FiPlus size={20} />
                <span>Yeni Koleksiyon</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <FiLayers size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Koleksiyon Yönetimi</h3>
                <p className="text-gray-500">Ürün koleksiyonlarınızı burada oluşturun ve yönetin.</p>
              </div>
            </div>
          </div>
        );

      case 'brands':
        return <BrandsPage />;

      case 'bulk-operations':
        return <BulkOperationsPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Katalog Yönetimi
            </h1>
            <Link 
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Menu */}
          <div className="w-80 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Katalog Menüsü</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as CatalogTabType)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
