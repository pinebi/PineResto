'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Product } from '@/types';
import { FiSave, FiX, FiUpload, FiImage } from 'react-icons/fi';

export default function AddProductPage() {
  const { categories, addProduct } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    categoryId: '',
    brand: 'Genel Markalar',
    stockCode: '',
    stock: 0,
    imageUrl: '',
    order: 1,
    isActive: true,
    isNewProduct: false,
    isFastShipping: false,
    isShowcase: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate unique stock code
    const stockCode = `PRD-${Date.now()}`;
    setFormData(prev => ({ ...prev, stockCode }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        purchasePrice: formData.purchasePrice,
        categoryId: formData.categoryId,
        brand: formData.brand,
        stockCode: formData.stockCode,
        stock: formData.stock,
        imageUrl: formData.imageUrl,
        order: formData.order,
        isActive: formData.isActive,
        isNewProduct: formData.isNewProduct,
        isFastShipping: formData.isFastShipping,
        isShowcase: formData.isShowcase,
        options: [],
        source: 'MANUAL',
        updatedAt: new Date(),
      };

      addProduct(newProduct);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        purchasePrice: 0,
        categoryId: '',
        brand: 'Genel Markalar',
        stockCode: `PRD-${Date.now()}`,
        stock: 0,
        imageUrl: '',
        order: 1,
        isActive: true,
        isNewProduct: false,
        isFastShipping: false,
        isShowcase: false,
      });
      setImagePreview(null);
      
      alert('Ürün başarıyla eklendi!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Ürün eklenirken bir hata oluştu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h2>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiX size={20} />
          <span>Geri</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ürün adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Açıklaması
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ürün açıklamasını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Marka adı"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Bilgileri</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alış Fiyatı (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
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
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {formData.price > 0 && formData.purchasePrice > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Kar Marjı:</strong> €{(formData.price - formData.purchasePrice).toFixed(2)} 
                      ({((formData.price - formData.purchasePrice) / formData.price * 100).toFixed(1)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stok Bilgileri</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Kodu
                  </label>
                  <input
                    type="text"
                    name="stockCode"
                    value={formData.stockCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Miktarı
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sıralama
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Resmi</h3>
              
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {imagePreview || formData.imageUrl ? (
                    <img 
                      src={imagePreview || formData.imageUrl} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FiImage size={48} className="mx-auto mb-2" />
                      <p className="text-sm">Resim yükleyin</p>
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className={`flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
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
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      handleInputChange(e);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Durumu</h3>
              
              <div className="space-y-4">
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
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-500 hover:bg-primary-600'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <FiSave size={16} />
                <span>Ürün Ekle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}










