'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Category, ProductOption } from '@/types';
import { FiSave, FiX, FiUpload, FiImage, FiSettings } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

interface OptionGroup {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  orderIndex: number;
}

interface AddProductPageProps {
  onSuccess?: () => void;
}

export default function AddProductPage({ onSuccess }: AddProductPageProps) {
  const { addProduct, categories } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    categoryId: '',
    printerId: '',
    brand: 'Genel Markalar',
    stockCode: '',
    stock: 0,
    imageUrl: '',
    order: 0,
    isActive: true,
    isNewProduct: false,
    isFastShipping: false,
    isShowcase: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [availableOptionGroups, setAvailableOptionGroups] = useState<OptionGroup[]>([]);
  const [selectedOptionGroupIds, setSelectedOptionGroupIds] = useState<string[]>([]);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [printers, setPrinters] = useState<any[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);

  // Çeşni gruplarını ve yazıcıları yükle
  useEffect(() => {
    const fetchOptionGroups = async () => {
      try {
        const response = await fetch('/api/flavors');
        if (response.ok) {
          const data = await response.json();
          setAvailableOptionGroups(data);
        }
      } catch (error) {
        console.error('Çeşni grupları yüklenirken hata:', error);
      }
    };

    const fetchPrinters = async () => {
      try {
        const response = await fetch('/api/printers');
        if (response.ok) {
          const data = await response.json();
          setPrinters(data);
        }
      } catch (error) {
        console.error('Yazıcılar yüklenirken hata:', error);
      }
    };

    fetchOptionGroups();
    fetchPrinters();
  }, []);

  const loadSystemPrinters = async () => {
    try {
      setIsLoadingPrinters(true);
      const res = await fetch('/api/printers/system');
      const data = await res.json();
      setSystemPrinters(data);
    } catch (err) {
      console.error('Sistem yazıcıları yükleme hatası:', err);
      alert('Sistem yazıcıları yüklenemedi!');
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  const addSystemPrinter = async (printer: any) => {
    try {
      await fetch('/api/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: printer.name,
          type: printer.type,
          location: 'Sistem Yazıcısı',
          ip_address: 'localhost',
          port: 9100
        })
      });
      
      // Yazıcıları yeniden yükle
      const response = await fetch('/api/printers');
      if (response.ok) {
        const data = await response.json();
        setPrinters(data);
      }
      
      alert(`${printer.name} sisteme eklendi!`);
      setSystemPrinters([]);
    } catch (err) {
      console.error('Yazıcı ekleme hatası:', err);
      alert('Yazıcı eklenirken hata oluştu!');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl }));
        setImagePreview(imageUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setIsUploading(false);
    }
  };

  const handleToggleStatus = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleToggleOptionGroup = (groupId: string) => {
    setSelectedOptionGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı zorunludur';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Kategori seçimi zorunludur';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Satış fiyatı 0\'dan büyük olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Seçili çeşni gruplarını ProductOption formatına çevir
    const selectedOptions: ProductOption[] = availableOptionGroups
      .filter(group => selectedOptionGroupIds.includes(group.id))
      .map(group => ({
        id: group.id,
        name: group.name,
        values: group.values.map(v => v.name)
      }));

    const newProduct = {
      id: Date.now().toString(),
      ...formData,
      options: selectedOptions,
      updatedAt: new Date(),
    };

    try {
      // Ürünü veritabanına kaydet
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          purchasePrice: formData.purchasePrice,
          categoryId: formData.categoryId,
          stockCode: formData.stockCode,
          stock: formData.stock,
          imageUrl: formData.imageUrl,
          printerId: formData.printerId || null,
          order: formData.order,
          isActive: formData.isActive ? 1 : 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Ürün kaydedilemedi');
      }

      const result = await response.json();
      const productId = result.id;

      // Çeşnileri product_options_mapping tablosuna kaydet
      if (selectedOptionGroupIds.length > 0) {
        await fetch('/api/flavors/mapping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            flavorGroupIds: selectedOptionGroupIds,
          }),
        });
      }

      // Store'u güncelle
      addProduct(newProduct);
      
      // Form sıfırlama
      setFormData({
        name: '',
        description: '',
        price: 0,
        purchasePrice: 0,
        categoryId: '',
        printerId: '',
        brand: 'Genel Markalar',
        stockCode: '',
        stock: 0,
        imageUrl: '',
        order: 0,
        isActive: true,
        isNewProduct: false,
        isFastShipping: false,
        isShowcase: false,
      });
      setImagePreview(null);
      setSelectedOptionGroupIds([]);
      setErrors({});

      alert('✅ Ürün başarıyla eklendi!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert('❌ Ürün eklenirken bir hata oluştu!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Örn: Adana Kebap"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Açıklaması
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData({...formData, description: content})}
                  placeholder="Ürün hakkında detaylı açıklama yazın..."
                  className="min-h-[250px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yazıcı
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.printerId}
                    onChange={(e) => setFormData({...formData, printerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Yazıcı Seçin (Boş = Kategori Yazıcısı)</option>
                    {printers.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.type}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={loadSystemPrinters}
                    disabled={isLoadingPrinters}
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:bg-gray-300"
                  >
                    {isLoadingPrinters ? 'Yükleniyor...' : '🖨️ Bilgisayardan Yazıcı Ekle'}
                  </button>
                  
                  {systemPrinters.length > 0 && (
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Bilgisayarınızdaki Yazıcılar:</p>
                      {systemPrinters.map((sp, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 text-xs">
                          <span className="text-gray-700">{sp.name} ({sp.type})</span>
                          <button
                            type="button"
                            onClick={() => addSystemPrinter(sp)}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                          >
                            Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Yazıcı seçilmezse, kategorinin yazıcısı kullanılır
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alış Fiyatı (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satış Fiyatı (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Coca Cola"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.stockCode}
                    onChange={(e) => setFormData({...formData, stockCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Miktarı
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Resmi
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {imagePreview || formData.imageUrl ? (
                      <img 
                        src={imagePreview || formData.imageUrl} 
                        alt="Product preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <FiImage size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Ürün resmi yükleyin</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className={`flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}>
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-gray-600">Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload size={16} />
                          <span className="text-sm text-gray-600">Resim Yükle</span>
                        </>
                      )}
                    </div>
                  </label>
                  
                  {/* URL Input */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Veya URL girin
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({...formData, imageUrl: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Status Toggles */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700">Ürün Durumu</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aktif</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('isActive')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yeni Ürün</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('isNewProduct')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isNewProduct ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isNewProduct ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hızlı Kargo</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('isFastShipping')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isFastShipping ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isFastShipping ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vitrin Ürünü</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('isShowcase')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isShowcase ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isShowcase ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Options Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Çeşniler</h3>
              <button
                type="button"
                onClick={() => setIsOptionsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
              >
                <FiSettings size={16} />
                <span>Çeşnileri Yönet</span>
              </button>
            </div>
            
            {selectedOptionGroupIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableOptionGroups
                  .filter(group => selectedOptionGroupIds.includes(group.id))
                  .map(group => (
                    <div key={group.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{group.name}</h4>
                        {group.isRequired && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                            Zorunlu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{group.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.values.slice(0, 3).map(value => (
                          <span key={value.id} className="px-2 py-1 text-xs bg-white text-gray-700 rounded-full border border-gray-200">
                            {value.name}
                          </span>
                        ))}
                        {group.values.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{group.values.length - 3} daha
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <FiSettings size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Henüz çeşni eklenmemiş</p>
                <p className="text-xs text-gray-500 mt-1">Ürüne çeşni eklemek için yukarıdaki butona tıklayın</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                if (confirm('Formu sıfırlamak istediğinizden emin misiniz?')) {
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    purchasePrice: 0,
                    categoryId: '',
                    printerId: '',
                    brand: 'Genel Markalar',
                    stockCode: '',
                    stock: 0,
                    imageUrl: '',
                    order: 0,
                    isActive: true,
                    isNewProduct: false,
                    isFastShipping: false,
                    isShowcase: false,
                  });
                  setImagePreview(null);
                  setSelectedOptionGroupIds([]);
                  setErrors({});
                }
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Sıfırla
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiSave size={16} />
              <span>Ürünü Kaydet</span>
            </button>
          </div>
        </form>
      </div>

      {/* Options Selection Modal */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Çeşnilerni Seç</h3>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {availableOptionGroups.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Bu ürün için geçerli olacak çeşni gruplarını seçin.
                  </p>
                  {availableOptionGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedOptionGroupIds.includes(group.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => handleToggleOptionGroup(group.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedOptionGroupIds.includes(group.id)}
                            onChange={() => handleToggleOptionGroup(group.id)}
                            className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            {group.isRequired && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                Zorunlu
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {group.values.map((value) => (
                              <span
                                key={value.id}
                                className="px-3 py-1 text-xs bg-white text-gray-700 rounded-full border border-gray-200"
                              >
                                {value.name}
                                {value.priceModifier !== 0 && (
                                  <span className={`ml-1 font-medium ${
                                    value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ({value.priceModifier > 0 ? '+' : ''}€{value.priceModifier.toFixed(2)})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiSettings size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Çeşni Grubu Bulunamadı</h3>
                  <p className="text-gray-500">
                    Öncelikle çeşni grupları oluşturmalısınız.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedOptionGroupIds.length > 0 ? (
                  <span className="font-medium text-blue-600">
                    {selectedOptionGroupIds.length} çeşni grubu seçildi
                  </span>
                ) : (
                  <span>Çeşni grubu seçilmedi</span>
                )}
              </div>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

