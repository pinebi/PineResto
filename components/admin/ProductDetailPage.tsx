'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Product, ProductOption } from '@/types';
import { FiX, FiEdit, FiTrash2, FiPlus, FiMinus, FiSave, FiArrowLeft, FiUpload, FiImage, FiSettings } from 'react-icons/fi';
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

interface ProductDetailPageProps {
  productId: string;
  onClose: () => void;
}

export default function ProductDetailPage({ productId, onClose }: ProductDetailPageProps) {
  const { products, updateProduct, deleteProduct } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    categoryId: '',
    brand: '',
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

  useEffect(() => {
    const foundProduct = products.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setEditForm({
        name: foundProduct.name,
        description: foundProduct.description,
        price: foundProduct.price,
        purchasePrice: foundProduct.purchasePrice || 0,
        categoryId: foundProduct.categoryId,
        brand: foundProduct.brand || 'Genel Markalar',
        stockCode: foundProduct.stockCode || '',
        stock: foundProduct.stock || 0,
        imageUrl: foundProduct.imageUrl || '',
        order: foundProduct.order,
        isActive: foundProduct.isActive,
        isNewProduct: foundProduct.isNewProduct || false,
        isFastShipping: foundProduct.isFastShipping || false,
        isShowcase: foundProduct.isShowcase || false,
      });
      
      // Ürünün mevcut seçeneklerini yükle
      if (foundProduct.options) {
        const optionIds = foundProduct.options.map(opt => opt.id);
        setSelectedOptionGroupIds(optionIds);
      }
    }
  }, [products, productId]);

  // Seçenek gruplarını API'den yükle
  useEffect(() => {
    const fetchOptionGroups = async () => {
      try {
        const response = await fetch('/api/product-options');
        if (response.ok) {
          const data = await response.json();
          setAvailableOptionGroups(data);
        }
      } catch (error) {
        console.error('Seçenek grupları yüklenirken hata:', error);
      }
    };

    fetchOptionGroups();
  }, []);

  // Disable body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSave = async () => {
    if (!product) return;

    // Seçili seçenek gruplarını ProductOption formatına çevir
    const selectedOptions: ProductOption[] = availableOptionGroups
      .filter(group => selectedOptionGroupIds.includes(group.id))
      .map(group => ({
        id: group.id,
        name: group.name,
        values: group.values.map(v => v.name)
      }));

    const updatedProduct = {
      ...product,
      ...editForm,
      options: selectedOptions,
      updatedAt: new Date(),
    };

    updateProduct(product.id, updatedProduct);
    setProduct(updatedProduct);
    setIsEditing(false);
    console.log('Ürün güncellendi:', updatedProduct.name);
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

  const handleSaveOptions = () => {
    if (!product) return;

    // Seçili seçenek gruplarını ProductOption formatına çevir
    const selectedOptions: ProductOption[] = availableOptionGroups
      .filter(group => selectedOptionGroupIds.includes(group.id))
      .map(group => ({
        id: group.id,
        name: group.name,
        values: group.values.map(v => v.name)
      }));

    const updatedProduct = {
      ...product,
      options: selectedOptions,
      updatedAt: new Date(),
    };

    updateProduct(product.id, updatedProduct);
    setProduct(updatedProduct);
    setIsOptionsModalOpen(false);
    console.log('Ürün seçenekleri güncellendi:', selectedOptions);
  };

  const handleDelete = async () => {
    if (!product) return;

    if (confirm(`${product.name} ürününü silmek istediğinizden emin misiniz?`)) {
      deleteProduct(product.id);
      onClose();
    }
  };

  const handleToggleStatus = (field: keyof typeof editForm) => {
    setEditForm(prev => ({
      ...prev,
      [field]: !prev[field]
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
        setEditForm(prev => ({ ...prev, imageUrl }));
        setImagePreview(imageUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setIsUploading(false);
    }
  };

  const getImageUrl = () => {
    if (isEditing) {
      return imagePreview || editForm.imageUrl;
    }
    return product.imageUrl;
  };

  if (!product) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-gray-600">Ürün bulunamadı</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Ürün Düzenle' : 'Ürün Detayı'} - {product.name}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isEditing ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <FiEdit size={16} />
              <span>{isEditing ? 'İptal' : 'Düzenle'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün Adı *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün Açıklaması
                    </label>
                    <RichTextEditor
                      value={editForm.description}
                      onChange={(content) => setEditForm({...editForm, description: content})}
                      placeholder="Ürün hakkında detaylı açıklama yazın..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alış Fiyatı (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.purchasePrice}
                        onChange={(e) => setEditForm({...editForm, purchasePrice: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Satış Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marka
                    </label>
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok Kodu
                    </label>
                    <input
                      type="text"
                      value={editForm.stockCode}
                      onChange={(e) => setEditForm({...editForm, stockCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok Miktarı
                    </label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün Resmi
                    </label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                        {getImageUrl() ? (
                          <img 
                            src={getImageUrl()} 
                            alt="Product preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <FiImage size={32} className="mx-auto mb-2" />
                            <p className="text-xs">Resim yok</p>
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
                          value={editForm.imageUrl}
                          onChange={(e) => {
                            setEditForm({...editForm, imageUrl: e.target.value});
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
                      value={editForm.order}
                      onChange={(e) => setEditForm({...editForm, order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Ürün Durumu</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aktif</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus('isActive')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          editForm.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editForm.isActive ? 'translate-x-6' : 'translate-x-1'
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
                          editForm.isNewProduct ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editForm.isNewProduct ? 'translate-x-6' : 'translate-x-1'
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
                          editForm.isFastShipping ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editForm.isFastShipping ? 'translate-x-6' : 'translate-x-1'
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
                          editForm.isShowcase ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editForm.isShowcase ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Options Section */}
              <div className="col-span-2 space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Çeşni Ekle</h3>
                  <button
                    type="button"
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <FiSettings size={16} />
                    <span>Seçenekleri Yönet</span>
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
                    <p className="text-sm text-gray-600">Henüz seçenek eklenmemiş</p>
                    <p className="text-xs text-gray-500 mt-1">Ürüne seçenek eklemek için yukarıdaki butona tıklayın</p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="col-span-2 flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FiSave size={16} />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="w-full lg:w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative group">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="flex items-center justify-center text-6xl" style={{display: product.imageUrl ? 'none' : 'flex'}}>
                      📦
                    </div>
                    
                    {/* Overlay for image actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
                      >
                        <FiEdit size={14} />
                        <span>Düzenle</span>
                      </button>
                    </div>
                  </div>
                  <div className="w-full lg:flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div 
                      className="text-gray-600 mb-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                    
                    {/* Image Management Buttons */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="w-full text-sm font-medium text-gray-700 mb-2">Resim Yönetimi</h3>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <div className={`flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Yükleniyor...</span>
                            </>
                          ) : (
                            <>
                              <FiUpload size={16} />
                              <span>Resim Ekle</span>
                            </>
                          )}
                        </div>
                      </label>
                      
                      <button
                        onClick={() => {
                          const url = prompt('Resim URL\'sini girin:', product.imageUrl || '');
                          if (url !== null && url.trim()) {
                            const updatedProduct = { ...product, imageUrl: url.trim(), updatedAt: new Date() };
                            updateProduct(product.id, updatedProduct);
                            setProduct(updatedProduct);
                          }
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <FiImage size={16} />
                        <span>URL Ekle</span>
                      </button>
                      
                      {product.imageUrl && (
                        <button
                          onClick={() => {
                            if (confirm('Bu resmi kaldırmak istediğinizden emin misiniz?')) {
                              const updatedProduct = { ...product, imageUrl: '', updatedAt: new Date() };
                              updateProduct(product.id, updatedProduct);
                              setProduct(updatedProduct);
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiTrash2 size={16} />
                          <span>Resmi Kaldır</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Satış Fiyatı</p>
                        <p className="text-2xl font-bold text-green-600">₺{product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Alış Fiyatı</p>
                        <p className="text-xl font-semibold text-gray-700">₺{(product.purchasePrice || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.isActive && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                      )}
                      {product.isNewProduct && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Yeni Ürün</span>
                      )}
                      {product.isFastShipping && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Hızlı Kargo</span>
                      )}
                      {product.isShowcase && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Vitrin Ürünü</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Marka</p>
                      <p className="font-medium">{product.brand || 'Genel Markalar'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stok Kodu</p>
                      <p className="font-medium">{product.stockCode || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stok Miktarı</p>
                      <p className="font-medium">{product.stock || 0} Adet</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sıralama</p>
                      <p className="font-medium">{product.order}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kaynak</p>
                      <p className="font-medium">{product.source || 'Manuel'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Son Güncelleme</p>
                      <p className="font-medium">
                        {product.updatedAt ? new Date(product.updatedAt).toLocaleString('tr-TR') : 'Bilinmiyor'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Options */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Çeşni Ekle</h3>
                    <button
                      onClick={() => setIsOptionsModalOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    >
                      <FiSettings size={14} />
                      <span>Düzenle</span>
                    </button>
                  </div>
                  {product.options && product.options.length > 0 ? (
                    <div className="space-y-3">
                      {product.options.map((option) => (
                        <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{option.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value: any, index: number) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                              >
                                {typeof value === 'object' && value?.name ? value.name : value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                      <FiSettings size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Henüz seçenek eklenmemiş</p>
                      <button
                        onClick={() => setIsOptionsModalOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors text-sm"
                      >
                        <FiPlus size={14} />
                        <span>Seçenek Ekle</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <FiEdit size={16} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <FiTrash2 size={16} />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kar Marjı</span>
                      <span className="font-medium text-green-600">
                        ₺{(product.price - (product.purchasePrice || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kar Oranı</span>
                      <span className="font-medium text-green-600">
                        {((product.price - (product.purchasePrice || 0)) / product.price * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok Durumu</span>
                      <span className={`font-medium ${
                        (product.stock || 0) > 10 ? 'text-green-600' : 
                        (product.stock || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(product.stock || 0) > 10 ? 'Yeterli' : 
                         (product.stock || 0) > 0 ? 'Az' : 'Tükendi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Options Selection Modal */}
        {isOptionsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Çeşni Ekleni Yönet</h3>
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
                      Bu ürün için geçerli olacak seçenek gruplarını seçin. Müşteriler sipariş verirken bu seçenekleri görecek.
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
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
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
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                                  {group.values.length} seçenek
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
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
                                        ({value.priceModifier > 0 ? '+' : ''}₺{value.priceModifier.toFixed(2)})
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiSettings size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Seçenek Grubu Bulunamadı</h3>
                    <p className="text-gray-500 mb-4">
                      Öncelikle Katalog {">"} Çeşni Ekle bölümünden seçenek grupları oluşturmalısınız.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedOptionGroupIds.length > 0 ? (
                    <span className="font-medium text-blue-600">
                      {selectedOptionGroupIds.length} seçenek grubu seçildi
                    </span>
                  ) : (
                    <span>Seçenek grubu seçilmedi</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsOptionsModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveOptions}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FiSave size={16} />
                    <span>Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}