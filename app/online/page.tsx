'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useStore } from '@/store/useStore';
import { Product, ProductOption } from '@/types';


interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function OnlinePage() {
  const { 
    cart, addToCart, 
    sessionId, setSessionId, 
    orderType, setOrderType, 
    loadCart 
  } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    // Session ID oluştur
    let savedSessionId = localStorage.getItem('online-session-id');
    if (!savedSessionId) {
      savedSessionId = `online-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('online-session-id', savedSessionId);
    }
    setSessionId(savedSessionId);
    setOrderType('online');
    
    loadData();
  }, []);

  // Sepeti yükle (sessionId değiştiğinde)
  useEffect(() => {
    if (sessionId) {
      loadCart();
    }
  }, [sessionId]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? (Array.isArray(products) ? products : []).filter(product => product.categoryId === selectedCategory)
    : (Array.isArray(products) ? products : []);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
  };

  // Çeşni seçimini işle
  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  // Toplam fiyatı hesapla (çeşniler dahil)
  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;
    
    let basePrice = selectedProduct.price;
    let optionPriceModifier = 0;

    // Seçili çeşnilerin fiyat değişikliklerini topla
    if (selectedProduct.options) {
      selectedProduct.options.forEach(option => {
        const selectedValue = selectedOptions[option.id];
        if (selectedValue && option.values) {
          option.values.forEach((value: any) => {
            const valueName = typeof value === 'string' ? value : value.name;
            if (valueName === selectedValue && typeof value === 'object' && value.priceModifier) {
              optionPriceModifier += value.priceModifier;
            }
          });
        }
      });
    }

    return (basePrice + optionPriceModifier) * quantity;
  };

  const handleAddToCart = async () => {
    if (selectedProduct) {
      await addToCart(
        selectedProduct,
        quantity,
        selectedOptions,
        notes.trim() || undefined
      );
      closeModal();
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Online Sipariş</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {cart.length} ürün
              </span>
              <button
                onClick={() => window.location.href = '/online/cart'}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Sepet ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center ${
                selectedCategory === null
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-900'
              }`}
            >
              <div className="text-3xl mb-2">🍽️</div>
              <div className="text-sm font-semibold">Tümü</div>
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white text-gray-900'
                }`}
              >
                <div className="text-3xl mb-2">
                  {category.imageUrl && category.imageUrl.startsWith('http') ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-8 h-8 mx-auto object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    category.imageUrl || '🍽️'
                  )}
                </div>
                <div className="text-sm font-semibold">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name 
              : 'Tüm Ürünler'}
          </h2>
          
            {/* Pagination - Top */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Önceki
                </button>
                
                <span className="text-sm font-semibold text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg text-gray-600">Bu kategoride ürün bulunamadı</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {paginatedProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 overflow-hidden text-left"
              >
                {/* Product Image or Emoji */}
                {product.imageUrl && product.imageUrl.startsWith('http') ? (
                  <div className="w-full h-32 overflow-hidden bg-gray-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🍽️</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <div className="text-6xl">{product.imageUrl || '🍽️'}</div>
                  </div>
                )}
                
                <div className="p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary-600">
                      ₺{product.price.toFixed(2)}
                    </span>
                    <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      Ekle
                    </span>
                  </div>
                </div>
              </button>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white border-b p-4 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Ürün Detay Bilgileri</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Product Content - No Scroll */}
            <div className="p-4 flex-1">
              <div className="flex gap-3 mb-2">
                {/* Product Image - Left Side */}
                <div className="w-20 h-20 flex-shrink-0">
                  {selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith('http') ? (
                    <div className="w-full h-full overflow-hidden bg-gray-100 rounded-lg shadow-md">
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name}
                        loading="eager"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">🍽️</div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-md">
                      <div className="text-4xl">{selectedProduct.imageUrl || '🍽️'}</div>
                    </div>
                  )}
            </div>

                {/* Product Info - Right Side */}
                <div className="flex-1">
                  <h1 className="text-base font-bold text-gray-900 mb-1">
                {selectedProduct.name}
              </h1>
                  <p className="text-xs mb-1 leading-relaxed text-gray-600">
                {selectedProduct.description}
              </p>
              
                  <div className="text-lg font-bold text-primary-600 mb-1">
                ₺{selectedProduct.price.toFixed(2)}
                  </div>

                  {/* Product Tags */}
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Taze
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Lezzetli
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs font-bold mb-1 text-gray-900">
                    Çeşniler
                  </h3>
                  <div className="space-y-1">
                  {selectedProduct.options.map(option => (
                    <div key={option.id} className="border rounded-lg p-1 bg-gray-50">
                        <label className="block text-xs font-semibold mb-1 text-gray-900">
                        {option.name}
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                          {option.values.map((value: any, index: number) => (
                            <label key={index} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={option.id}
                                value={typeof value === 'string' ? value : value.name}
                                checked={selectedOptions[option.id] === (typeof value === 'string' ? value : value.name)}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="mr-2 w-3 h-3"
                              />
                              <span className="text-xs text-gray-700">
                                {typeof value === 'string' ? value : value.name}
                                {typeof value === 'object' && value.priceModifier !== 0 && (
                                  <span className={`ml-1 ${value.priceModifier > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ({value.priceModifier > 0 ? '+' : ''}{value.priceModifier}₺)
                                  </span>
                                )}
                              </span>
                            </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-1">
                <label className="block text-xs font-bold mb-1 text-gray-900">
                  Adet
                </label>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                    disabled={quantity <= 1}
                  >
                    <FiMinus size={16} />
                  </button>
                  
                  <div className="min-w-[40px] text-center">
                    <span className="text-xl font-bold text-gray-900">{quantity}</span>
                  </div>
                  
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-1">
                <label className="block text-xs font-bold mb-1 text-gray-900">
                  Özel Notlar (İsteğe Bağlı)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Soğansız..."
                  rows={1}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white border-gray-300 text-gray-900"
                />
              </div>

            </div>
            
            {/* Total and Add Button - Fixed at bottom */}
            <div className="border-t-2 border-gray-200 pt-4 pb-4 bg-gray-50 flex-shrink-0 px-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-gray-700">Toplam:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₺{calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🛒 SEPETE EKLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}