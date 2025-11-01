'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Product, Category } from '@/types';
import { FiSave, FiX, FiEye, FiEdit2, FiTrash2, FiUpload, FiLink, FiTag, FiPackage, FiDollarSign, FiImage, FiGlobe, FiSettings } from 'react-icons/fi';

type TabType = 'general' | 'options' | 'images' | 'marketplace';
type LanguageType = 'tr' | 'en' | 'de';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, categories, updateProduct, deleteProduct } = useStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [activeLanguage, setActiveLanguage] = useState<LanguageType>('tr');
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availableOptionGroups, setAvailableOptionGroups] = useState<any[]>([]);
  const [selectedOptionGroupIds, setSelectedOptionGroupIds] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    categoryId: '',
    brand: '',
    stockCode: '',
    stock: 0,
    imageUrl: '',
    isActive: true,
    isNewProduct: false,
    isFastShipping: false,
    isShowcase: false,
    order: 0,
    source: '',
  });

  useEffect(() => {
    if (params.id && products.length > 0) {
      const foundProduct = products.find(p => p.id === params.id);
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description,
          price: foundProduct.price,
          purchasePrice: foundProduct.purchasePrice || 0,
          categoryId: foundProduct.categoryId,
          brand: foundProduct.brand || '',
          stockCode: foundProduct.stockCode || '',
          stock: foundProduct.stock || 0,
          imageUrl: foundProduct.imageUrl || '',
          isActive: foundProduct.isActive,
          isNewProduct: foundProduct.isNewProduct || false,
          isFastShipping: foundProduct.isFastShipping || false,
          isShowcase: foundProduct.isShowcase || false,
          order: foundProduct.order || 0,
          source: foundProduct.source || '',
        });
      }
    }
  }, [params.id, products]);

  // Çeşni gruplarını yükle
  const loadOptionGroups = async () => {
    setIsLoadingOptions(true);
    try {
      const response = await fetch('/api/flavors');
      if (response.ok) {
        const data = await response.json();
        setAvailableOptionGroups(data);
      }
    } catch (error) {
      console.error('Çeşni grupları yüklenemedi:', error);
    }
    setIsLoadingOptions(false);
  };

  // Ürünün mevcut çeşnilerini yükle
  const loadProductOptions = async (productId: string) => {
    console.log('🔄 Ürün çeşnileri yükleniyor:', productId);
    try {
      const response = await fetch(`/api/flavors/mapping?productId=${productId}`);
      console.log('📡 API Response:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Yüklenen çeşni eşleştirmeleri:', data);
        const optionIds = data.map((mapping: any) => mapping.flavor_group_id);
        console.log('🎯 Seçili çeşni ID\'leri:', optionIds);
        setSelectedOptionGroupIds(optionIds);
      } else {
        console.error('❌ API hatası:', response.status);
      }
    } catch (error) {
      console.error('❌ Ürün çeşnileri yüklenemedi:', error);
    }
  };

  // Çeşnileri kaydet
  const saveProductOptions = async (productId: string) => {
    try {
      await fetch('/api/flavors/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          flavorGroupIds: selectedOptionGroupIds,
        }),
      });
      alert('✅ Çeşniler kaydedildi!');
    } catch (error) {
      console.error('Çeşni kaydetme hatası:', error);
      alert('❌ Çeşniler kaydedilemedi!');
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect çalıştı, product:', product?.id);
    loadOptionGroups();
    if (product?.id) {
      console.log('✅ Product ID var, çeşniler yükleniyor:', product.id);
      loadProductOptions(product.id);
    } else {
      console.log('❌ Product ID yok');
    }
  }, [product?.id]);

  const handleToggleOptionGroup = (groupId: string) => {
    setSelectedOptionGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      const updatedProduct = {
        ...product,
        ...formData,
        updatedAt: new Date(),
      };

      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      updateProduct(product.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await fetch(`/api/products?id=${product.id}`, { method: 'DELETE' });
      deleteProduct(product.id);
      router.push('/admin/catalog');
    } catch (error) {
      console.error('Ürün silme hatası:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Kategorisiz';
  };

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'İngilizce' },
    { code: 'de', name: 'Almanca' },
  ];

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün bulunamadı</h2>
          <p className="text-gray-500 mb-4">Aradığınız ürün mevcut değil.</p>
          <button
            onClick={() => router.push('/admin/catalog')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Kataloga Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-bold text-red-600">REDBUL</h1>
              <div className="text-sm text-gray-500">
                Ürünler &gt; Kategoriler
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiEdit2 size={16} />
                <span>{isEditing ? 'Düzenlemeyi Bitir' : 'Düzenle'}</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiTrash2 size={16} />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'options'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Çeşniler
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'images'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Görseller
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pazaryeri Fiyatlandırma
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Language Selector */}
            <div className="flex justify-end mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLanguage(lang.code as LanguageType)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      activeLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Ürünü Düzenle</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ürün Adı
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Kategori Seçin</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {getCategoryName(formData.categoryId)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marka
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ürün Açıklaması
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        disabled={!isEditing}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Ürün açıklamasını buraya yazın..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alış Fiyatı (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Satış Fiyatı (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stok Kodu
                      </label>
                      <input
                        type="text"
                        value={formData.stockCode}
                        onChange={(e) => setFormData({...formData, stockCode: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İkon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                          Aktif
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isNewProduct"
                          checked={formData.isNewProduct}
                          onChange={(e) => setFormData({...formData, isNewProduct: e.target.checked})}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                        />
                        <label htmlFor="isNewProduct" className="ml-2 text-sm font-medium text-gray-700">
                          Yeni Ürün
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isFastShipping"
                          checked={formData.isFastShipping}
                          onChange={(e) => setFormData({...formData, isFastShipping: e.target.checked})}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                        />
                        <label htmlFor="isFastShipping" className="ml-2 text-sm font-medium text-gray-700">
                          Hızlı Kargo
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isShowcase"
                          checked={formData.isShowcase}
                          onChange={(e) => setFormData({...formData, isShowcase: e.target.checked})}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                        />
                        <label htmlFor="isShowcase" className="ml-2 text-sm font-medium text-gray-700">
                          Vitrin Ürünü
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <FiSave size={16} />
                      <span>Kaydet</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'options' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Çeşniler</h2>
                  <button
                    onClick={() => product?.id && saveProductOptions(product.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FiSettings size={16} />
                    <span>Çeşnileri Kaydet</span>
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Mevcut Çeşni Grupları</h3>
                    
                    {isLoadingOptions ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Çeşniler yükleniyor...</p>
                      </div>
                    ) : availableOptionGroups.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FiSettings size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Henüz çeşni grubu oluşturulmamış.</p>
                        <p className="text-sm mt-2">
                          <a href="/admin/catalog/options" className="text-blue-500 hover:underline">
                            Çeşni grupları oluşturmak için tıklayın
                          </a>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableOptionGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedOptionGroupIds.includes(group.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleToggleOptionGroup(group.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{group.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {group.type === 'single' ? 'Tek Seçim' : 'Çoklu Seçim'}
                                  {group.is_required && ' • Zorunlu'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {group.values?.length || 0} çeşni
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedOptionGroupIds.includes(group.id)}
                                onChange={() => handleToggleOptionGroup(group.id)}
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedOptionGroupIds.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Seçili Çeşni Grupları:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedOptionGroupIds.map((groupId) => {
                            const group = availableOptionGroups.find(g => g.id === groupId);
                            return group ? (
                              <span
                                key={groupId}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {group.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Görseller</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Görsel Yönetimi</h3>
                  <p className="text-gray-500">Ürün görselleri burada yönetilecek.</p>
                </div>
              </div>
            )}

            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Pazaryeri Fiyatlandırma</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiDollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Pazaryeri Fiyatları</h3>
                  <p className="text-gray-500">Farklı pazaryerleri için fiyatlandırma burada yönetilecek.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






