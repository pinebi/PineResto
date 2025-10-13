'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Category, Product } from '@/types';
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiMaximize, FiMinimize, FiSearch, FiStar, FiTrendingUp } from 'react-icons/fi';
import VoiceOrderButton from '@/components/VoiceOrderButton';

export default function KioskPage() {
  const router = useRouter();
  const { categories, setCategories, products, setProducts, cart, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useEffect(() => {
    // Load data from API in parallel for better performance
    setIsLoading(true);
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([categoriesData, productsData]) => {
      setCategories(categoriesData);
      setProducts(productsData);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setIsLoading(false);
    });
  }, []);

  // Fullscreen toggle with PIN
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Show PIN modal before entering fullscreen
      setShowPinModal(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle PIN verification
  const handlePinSubmit = () => {
    const CORRECT_PIN = '4109';
    
    if (pinInput === CORRECT_PIN) {
      // Correct PIN - enter fullscreen
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowPinModal(false);
      setPinInput('');
    } else {
      // Wrong PIN - shake animation and clear
      alert('❌ Yanlış şifre!');
      setPinInput('');
    }
  };

  // Handle numpad button click
  const handleNumpadClick = (num: string) => {
    if (pinInput.length < 4) {
      setPinInput(prev => prev + num);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  // Close PIN modal
  const closePinModal = () => {
    setShowPinModal(false);
    setPinInput('');
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Get best sellers (mock data - top 6 products)
  const getBestSellers = () => {
    return products.filter(p => p.isActive).slice(0, 6);
  };

  const activeCategories = categories.filter(c => c.isActive && c.parentId === null);
  const activeProducts = products.filter(p => 
    p.isActive && (!selectedCategory || p.categoryId === selectedCategory)
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryWithChildren = (categoryId: string): string[] => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [categoryId];
    
    const childIds = categories
      .filter(c => c.parentId === categoryId)
      .map(c => c.id);
    
    return [categoryId, ...childIds];
  };

  // Search and filter products
  const filteredProducts = (() => {
    let result = products.filter(p => p.isActive);
    
    // Filter by category
    if (selectedCategory) {
        const categoryIds = getCategoryWithChildren(selectedCategory);
      result = result.filter(p => categoryIds.includes(p.categoryId));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  })();


  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
    // Initialize default options
    const defaultOptions: { [key: string]: string } = {};
    product.options?.forEach(option => {
      if (option.values.length > 0) {
        defaultOptions[option.id] = option.values[0];
      }
    });
    setSelectedOptions(defaultOptions);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity, selectedOptions, notes);
      setSelectedProduct(null);
      setQuantity(1);
      setNotes('');
      setSelectedOptions({});
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-md sticky top-0 z-10 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Best Sellers Toggle */}
              <button
                onClick={() => setShowBestSellers(!showBestSellers)}
                className={`px-4 py-3 rounded-lg flex items-center space-x-2 transition-all shadow-lg ${
                  showBestSellers 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FiTrendingUp size={20} />
                <span className="hidden md:inline font-semibold">En Çok Satanlar</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`px-4 py-3 rounded-lg transition-all shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`px-4 py-3 rounded-lg transition-all shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
              >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
            
              {/* Cart Button */}
            <button
                onClick={() => router.push('/online/cart')}
                className="relative bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all shadow-lg transform hover:scale-105"
            >
              <FiShoppingCart size={24} />
                <span className="font-semibold hidden md:inline">Sepet</span>
              {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="rounded-xl shadow-md overflow-hidden bg-white">
                    <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Best Sellers Section */}
            {showBestSellers && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <FiTrendingUp className={`${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} size={28} />
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🔥 En Çok Satanlar
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {getBestSellers().map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`rounded-xl shadow-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl animate-slideInUp ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Best Seller Badge */}
                      <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <FiStar size={12} />
                        #{index + 1}
                      </div>

                      {/* Product Image */}
                      {product.imageUrl && product.imageUrl.startsWith('http') ? (
                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            loading="eager"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary-50 to-primary-100">🍽️</div>';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                          <div className="text-6xl">{product.imageUrl || '🍽️'}</div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-600">
                            ₺{product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-semibold">{filteredProducts.length}</span> ürün bulundu: 
                  <span className="ml-2 font-bold text-primary-600">"{searchQuery}"</span>
                </p>
              </div>
            )}

        {/* Categories */}
        <div className="mb-8">
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`p-6 rounded-xl shadow-md transition-all transform hover:scale-105 animate-fadeIn ${
                selectedCategory === null
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg'
                  : 'bg-white text-gray-800 hover:shadow-lg'
              }`}
            >
              <div className="text-4xl mb-2">🍽️</div>
              <div className="font-semibold">Tümü</div>
            </button>
            
            {activeCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-xl shadow-md transition-all transform hover:scale-105 overflow-hidden animate-fadeIn ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg'
                    : 'bg-white text-gray-800 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Category Image or Emoji */}
                {category.imageUrl && category.imageUrl.startsWith('http') ? (
                  <div className="w-full h-32 overflow-hidden bg-gray-100">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🍽️</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <div className="text-4xl">{category.imageUrl || '🍽️'}</div>
                  </div>
                )}
                <div className="p-4">
                <div className="font-semibold">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name 
              : searchQuery 
              ? `Arama Sonuçları (${filteredProducts.length})`
              : 'Tüm Ürünler'}
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-6xl mb-4">🔍</div>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {searchQuery ? 'Aradığınız ürün bulunamadı' : 'Bu kategoride ürün bulunamadı'}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                  className={`rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden text-left animate-fadeIn ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Product Image or Emoji */}
                  {product.imageUrl && product.imageUrl.startsWith('http') ? (
                    <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary-50 to-primary-100">🍽️</div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <div className="text-6xl">{product.imageUrl || '🍽️'}</div>
                    </div>
                  )}
                  
                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      ₺{product.price.toFixed(2)}
                    </span>
                      <span className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`border-b flex justify-between items-center p-4 rounded-t-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ürün Detayı</h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Product Image */}
            {selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith('http') ? (
              <div className="w-full h-64 overflow-hidden bg-gray-100">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  loading="eager"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary-100 to-primary-200">🍽️</div>';
                  }}
                />
              </div>
            ) : (
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 text-center">
                <div className="text-6xl">{selectedProduct.imageUrl || '🍽️'}</div>
            </div>
            )}

            {/* Product Info */}
            <div className="p-4">
              <h1 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedProduct.name}
              </h1>
              <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedProduct.description}
              </p>
              
              <div className="text-2xl font-bold text-primary-600 mb-3">
                ₺{selectedProduct.price.toFixed(2)}
              </div>

              {/* Product Options */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-4 space-y-3">
                  {selectedProduct.options.map(option => (
                    <div key={option.id} className={`border rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
                      <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.name}
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                        {option.values.map(value => (
                          <button
                            key={value}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [option.id]: value }))}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all transform hover:scale-105 ${
                              selectedOptions[option.id] === value
                                ? 'bg-primary-500 text-white shadow-md'
                                : theme === 'dark'
                                ? 'bg-gray-800 text-white hover:bg-gray-600 border border-gray-600'
                                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-3">
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Adet
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 ${
                      quantity <= 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    disabled={quantity <= 1}
                  >
                    <FiMinus size={16} />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
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
              <div className="mb-4">
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Özel Notlar (İsteğe Bağlı)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Soğansız..."
                  rows={2}
                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Total and Add Button */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Toplam:</span>
                  <span className="text-xl font-bold text-primary-600">
                    ₺{(selectedProduct.price * quantity).toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg hover:shadow-xl"
                >
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal for Fullscreen */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`border-b p-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🔒 Tam Ekran Kilidi
                  </h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Lütfen 4 haneli şifrenizi girin
                  </p>
                </div>
                <button
                  onClick={closePinModal}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* PIN Display */}
            <div className="p-6">
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold transition-all ${
                      pinInput.length > i
                        ? 'bg-primary-500 text-white shadow-lg scale-110'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-500'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {pinInput.length > i ? '●' : '○'}
                  </div>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumpadClick(num.toString())}
                    className={`h-16 rounded-xl text-2xl font-bold transition-all transform active:scale-95 hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } shadow-md hover:shadow-lg`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Bottom row: Clear, 0, Submit */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleBackspace}
                  className={`h-16 rounded-xl text-lg font-semibold transition-all transform active:scale-95 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } shadow-md hover:shadow-lg`}
                >
                  ⌫ Sil
                </button>
                <button
                  onClick={() => handleNumpadClick('0')}
                  className={`h-16 rounded-xl text-2xl font-bold transition-all transform active:scale-95 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } shadow-md hover:shadow-lg`}
                >
                  0
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4}
                  className={`h-16 rounded-xl text-lg font-semibold transition-all transform active:scale-95 hover:scale-105 shadow-md hover:shadow-lg ${
                    pinInput.length === 4
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ✓ Onayla
                </button>
              </div>

              {/* Info Text */}
              <p className={`text-center text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Varsayılan şifre: 4109
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Order Button */}
      <VoiceOrderButton
        onOrderDetected={(text) => {
          alert(`Sesli sipariş algılandı: ${text}`);
          // Burada sesli siparişi işleyebilirsiniz
        }}
      />
    </div>
  );
}

