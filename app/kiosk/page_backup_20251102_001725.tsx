'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Category, Product } from '@/types';
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiMaximize, FiMinimize, FiSearch, FiStar, FiTrendingUp, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import VirtualKeyboard from '@/components/VirtualKeyboard';

export default function KioskPage() {
  const router = useRouter();
  const { 
    categories, setCategories, 
    products, setProducts, 
    cart, addToCart, 
    sessionId, setSessionId, 
    orderType, setOrderType, 
    loadCart,
    clearCart
  } = useStore();
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
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showLanguageScreen, setShowLanguageScreen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('de');
  const searchInputRef = useRef<HTMLDivElement>(null);
  const searchInputElementRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializePage = async () => {
      // Session ID oluştur
      let savedSessionId = localStorage.getItem('kiosk-session-id');
      if (!savedSessionId) {
        savedSessionId = `kiosk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('kiosk-session-id', savedSessionId);
      }
      setSessionId(savedSessionId);
      setOrderType('kiosk');
      
      // Verileri yükle
      setIsLoading(true);
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        
        // Array kontrolü yap
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, []);

  // Dokunmatik ekran için: Input dışına tıklayınca klavyeyi kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const inputElement = searchInputElementRef.current;
      const containerElement = searchInputRef.current;
      const target = event.target as Node;
      
      // Sanal klavyeye tıklanmışsa kapatma
      const keyboardElement = document.querySelector('.virtual-keyboard-container');
      if (keyboardElement && keyboardElement.contains(target)) {
        return;
      }
      
      if (inputElement && containerElement && !containerElement.contains(target)) {
        inputElement.blur();
        // Input dışına tıklayınca klavyeyi kapat
        setShowKeyboard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Sepeti yükle (sessionId değiştiğinde)
  useEffect(() => {
    if (sessionId) {
      loadCart();
    }
  }, [sessionId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      setShowPinModal(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === '4109') {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert('Hatalı PIN!');
      setPinInput('');
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPinInput('');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          option.values.forEach((valueObj: any) => {
            const valueName = typeof valueObj === 'string' ? valueObj : valueObj.name;
            if (valueName === selectedValue && typeof valueObj === 'object' && valueObj.priceModifier) {
              optionPriceModifier += valueObj.priceModifier;
            }
          });
        }
      });
    }

    return (basePrice + optionPriceModifier) * quantity;
  };

  const handleAddToCart = async () => {
    if (selectedProduct) {
      await addToCart(selectedProduct, quantity, selectedOptions, notes.trim() || undefined);
      closeModal();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollUp = () => {
    window.scrollBy({ top: -500, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollBy({ top: 500, behavior: 'smooth' });
  };


  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4`}></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Language Selection Screen - First screen (Germany McDonald's style)
  if (showLanguageScreen) {
    const languages = [
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700">
        <div className="w-full max-w-5xl px-8 py-12">
          {/* McDonald's Logo Area */}
          <div className="text-center mb-16">
            <div className="text-9xl font-black text-white mb-6 tracking-tight">
              McDonald's
            </div>
            <div className="text-3xl font-semibold text-white/90">
              Bitte wählen Sie Ihre Sprache
            </div>
            <div className="text-xl text-white/80 mt-2">
              Please select your language
            </div>
          </div>

          {/* Language Buttons Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguageScreen(false);
                  setShowWelcomeScreen(true);
                }}
                className="group relative bg-white rounded-3xl p-8 shadow-2xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-3xl"
              >
                <div className="text-center">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
                    {lang.flag}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {lang.name}
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-red-600">
                  →
                </div>
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="text-white/70 text-sm">
              Berühren Sie den Bildschirm, um zu beginnen
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen - Main options (Germany McDonald's style)
  if (showWelcomeScreen) {
    const translations: { [key: string]: { start: string; continue: string; menu: string; help: string } } = {
      de: {
        start: 'Bestellung starten',
        continue: 'Bestellung fortsetzen',
        menu: 'Menü ansehen',
        help: 'Hilfe'
      },
      en: {
        start: 'Start Order',
        continue: 'Continue Order',
        menu: 'Browse Menu',
        help: 'Help'
      },
      tr: {
        start: 'Siparişe Başla',
        continue: 'Siparişe Devam Et',
        menu: 'Menüyü İncele',
        help: 'Yardım'
      },
      ar: {
        start: 'بدء الطلب',
        continue: 'متابعة الطلب',
        menu: 'تصفح القائمة',
        help: 'مساعدة'
      }
    };

    const t = translations[selectedLanguage] || translations.de;

    return (
      <div className="min-h-screen bg-white">
        {/* Top Bar - Red */}
        <div className="bg-red-600 h-24 flex items-center justify-center">
          <div className="text-6xl font-black text-white tracking-tight">
            McDonald's
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-8 py-12">
          <div className="w-full max-w-6xl">
            {/* Welcome Text */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {selectedLanguage === 'de' && 'Willkommen!'}
                {selectedLanguage === 'en' && 'Welcome!'}
                {selectedLanguage === 'tr' && 'Hoş Geldiniz!'}
                {selectedLanguage === 'ar' && 'مرحباً!'}
              </h1>
              <p className="text-2xl text-gray-600">
                {selectedLanguage === 'de' && 'Womit möchten Sie beginnen?'}
                {selectedLanguage === 'en' && 'How would you like to start?'}
                {selectedLanguage === 'tr' && 'Nasıl başlamak istersiniz?'}
                {selectedLanguage === 'ar' && 'كيف تريد البدء؟'}
              </p>
            </div>

            {/* Main Options - Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Start Order - Red Card */}
              <button
                onClick={() => {
                  setShowWelcomeScreen(false);
                  clearCart();
                }}
                className="group relative bg-red-600 rounded-3xl p-16 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-100 hover:shadow-3xl"
              >
                <div className="text-center">
                  <div className="text-8xl mb-8 text-white group-hover:scale-110 transition-transform">
                    🛒
                  </div>
                  <div className="text-5xl font-bold text-white mb-4">
                    {t.start}
                  </div>
                  <div className="text-xl text-white/90">
                    {selectedLanguage === 'de' && 'Neue Bestellung aufgeben'}
                    {selectedLanguage === 'en' && 'Place a new order'}
                    {selectedLanguage === 'tr' && 'Yeni sipariş ver'}
                    {selectedLanguage === 'ar' && 'تقديم طلب جديد'}
                  </div>
                </div>
                <div className="absolute bottom-8 right-8 text-4xl text-white/50 group-hover:text-white transition-colors">
                  →
                </div>
              </button>

              {/* Continue Order - Yellow Card */}
              <button
                onClick={() => {
                  setShowWelcomeScreen(false);
                  loadCart();
                }}
                className={`group relative rounded-3xl p-16 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-100 hover:shadow-3xl ${
                  cart.length > 0 
                    ? 'bg-yellow-400' 
                    : 'bg-gray-300 cursor-not-allowed opacity-60'
                }`}
                disabled={cart.length === 0}
              >
                <div className="text-center">
                  <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <div className={`text-5xl font-bold mb-4 ${
                    cart.length > 0 ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {t.continue}
                  </div>
                  <div className={`text-xl ${
                    cart.length > 0 ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {cart.length > 0 ? (
                      <>
                        {selectedLanguage === 'de' && `${cart.reduce((sum, item) => sum + item.quantity, 0)} Artikel im Warenkorb`}
                        {selectedLanguage === 'en' && `${cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart`}
                        {selectedLanguage === 'tr' && `Sepette ${cart.reduce((sum, item) => sum + item.quantity, 0)} ürün`}
                        {selectedLanguage === 'ar' && `${cart.reduce((sum, item) => sum + item.quantity, 0)} عناصر في السلة`}
                      </>
                    ) : (
                      <>
                        {selectedLanguage === 'de' && 'Keine aktive Bestellung'}
                        {selectedLanguage === 'en' && 'No active order'}
                        {selectedLanguage === 'tr' && 'Aktif sipariş yok'}
                        {selectedLanguage === 'ar' && 'لا يوجد طلب نشط'}
                      </>
                    )}
                  </div>
                </div>
                {cart.length > 0 && (
                  <div className="absolute bottom-8 right-8 text-4xl text-gray-600/50 group-hover:text-gray-900 transition-colors">
                    →
                  </div>
                )}
              </button>
            </div>

            {/* Secondary Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Browse Menu */}
              <button
                onClick={() => {
                  setShowWelcomeScreen(false);
                }}
                className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:border-red-600"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {t.menu}
                  </div>
                </div>
              </button>

              {/* Help */}
              <button
                onClick={() => {
                  alert(
                    selectedLanguage === 'de' ? 'Hilfe wird geladen...' :
                    selectedLanguage === 'en' ? 'Loading help...' :
                    selectedLanguage === 'tr' ? 'Yardım yükleniyor...' :
                    'جاري تحميل المساعدة...'
                  );
                }}
                className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:border-red-600"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">❓</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {t.help}
                  </div>
                </div>
              </button>
            </div>

            {/* Language Change Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowLanguageScreen(true)}
                className="text-gray-500 hover:text-gray-700 text-lg underline"
              >
                {selectedLanguage === 'de' && 'Sprache ändern'}
                {selectedLanguage === 'en' && 'Change Language'}
                {selectedLanguage === 'tr' && 'Dili Değiştir'}
                {selectedLanguage === 'ar' && 'تغيير اللغة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-md sticky top-0 z-10 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowWelcomeScreen(true);
                  setShowLanguageScreen(false);
                }}
                className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
                title="Ana Sayfaya Dön"
              >
                <span className="text-2xl">🏠</span>
              </button>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Sipariş Menüsü
              </h1>
              {searchQuery && (
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  "{searchQuery}" için {filteredProducts.length} sonuç
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative" ref={searchInputRef}>
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  inputMode="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter tuşuna basınca klavyeyi kapat
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  onTouchStart={(e) => {
                    // Input'a tıklayınca sanal klavyeyi aç
                    setShowKeyboard(true);
                    const input = e.currentTarget;
                    input.focus();
                    if (input.setSelectionRange) {
                      const len = input.value.length;
                      input.setSelectionRange(len, len);
                    }
                  }}
                  onClick={(e) => {
                    // Input'a tıklayınca sanal klavyeyi aç
                    setShowKeyboard(true);
                    e.currentTarget.focus();
                    if (e.currentTarget.setSelectionRange) {
                      const len = e.currentTarget.value.length;
                      e.currentTarget.setSelectionRange(len, len);
                    }
                  }}
                  onFocus={(e) => {
                    // Chrome'da focus olduğunda cursor'u sona al ve klavye açılmasını tetikle
                    const input = e.currentTarget;
                    requestAnimationFrame(() => {
                      if (input && document.body.contains(input) && input.setSelectionRange) {
                        const len = input.value.length;
                        input.setSelectionRange(len, len);
                      }
                    });
                  }}
                  ref={searchInputElementRef}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  readOnly={false}
                  disabled={false}
                  tabIndex={0}
                  style={{ 
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    touchAction: 'manipulation',
                    minHeight: '44px',
                    WebkitTapHighlightColor: 'transparent',
                    outline: 'none', // Focus outline'ı kaldır
                    boxShadow: 'none' // Focus shadow'u kaldır
                  }}
                  className={`pl-10 pr-4 py-2 border rounded-lg transition-colors w-full cursor-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
            </div>
            
              {/* Best Sellers Toggle */}
              <button
                onClick={() => setShowBestSellers(!showBestSellers)}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                title="En Çok Satanlar"
              >
                <FiTrendingUp size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                title="Tema Değiştir"
              >
                <FiStar size={20} />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                title="Tam Ekran"
              >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>

              {/* Cart */}
            <button
              onClick={() => router.push('/kiosk/cart')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-primary-600 hover:bg-primary-500 text-white' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                <FiShoppingCart size={20} />
                <span className="font-semibold">
                  Sepet ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
            </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-row gap-4 px-4 py-6">
        {/* Left Sidebar - Categories */}
        <div className="w-64 flex-shrink-0">
          <div className={`sticky top-24 rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Kategoriler
            </h2>
            <div className="space-y-2 max-h-[calc(100vh-10rem)] overflow-y-auto">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left ${
                  selectedCategory === null
                    ? (theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white')
                    : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900')
                }`}
              >
                <span className="text-2xl">🍽️</span>
                <span className="font-semibold text-sm">Tümü</span>
              </button>
              
              {/* Category List */}
              {Array.isArray(categories) && categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left ${
                    selectedCategory === category.id
                      ? (theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white')
                      : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900')
                  }`}
                >
                  {category.imageUrl && category.imageUrl.startsWith('http') ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl flex-shrink-0">{category.imageUrl || '🍽️'}</span>
                  )}
                  <span className={`font-semibold text-sm ${
                    selectedCategory === category.id ? 'text-white' : ''
                  }`}>
                    {category.name}
                  </span>
                  {selectedCategory === category.id && (
                    <span className="ml-auto text-yellow-300">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - Best Sellers & Products */}
        <div className="flex-1 min-w-0">
          {/* Best Sellers Section */}
          {showBestSellers && (
            <div className={`mb-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🔥 En Çok Satanlar
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {products.slice(0, 6).map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden text-left ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    {product.imageUrl && product.imageUrl.startsWith('http') ? (
                      <div className="relative w-full h-24 overflow-hidden bg-gray-100">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-50 to-primary-100">🍽️</div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <div className="text-4xl">{product.imageUrl || '🍽️'}</div>
                      </div>
                    )}
                    
                    <div className="p-2">
                      <h3 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary-600">
                          €{product.price.toFixed(2)}
                        </span>
                        <span className="bg-primary-500 hover:bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors">
                          Ekle
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedCategory 
                ? (Array.isArray(categories) ? categories.find(c => c.id === selectedCategory)?.name : '') || 'Kategori'
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {filteredProducts.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden text-left ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    {/* Product Image or Emoji */}
                    {product.imageUrl && product.imageUrl.startsWith('http') ? (
                      <div className="relative w-full h-32 overflow-hidden bg-gray-100">
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
                      <div className="w-full h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <div className="text-6xl">{product.imageUrl || '🍽️'}</div>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <h3 className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h3>
                      <p className={`text-xs mb-2 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary-600">
                          €{product.price.toFixed(2)}
                        </span>
                        <span className="bg-primary-500 hover:bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-semibold transition-colors">
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
      </div>

      {/* Scroll Buttons for Touchscreen */}
      <div className="fixed right-6 bottom-24 flex flex-col gap-3 z-50">
        {/* Scroll Up Button */}
        <button
          onClick={scrollUp}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300'
          }`}
          title="Yukarı Kaydır"
        >
          <FiChevronUp size={32} />
        </button>

        {/* Scroll Down Button */}
        <button
          onClick={scrollDown}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300'
          }`}
          title="Aşağı Kaydır"
        >
          <FiChevronDown size={32} />
        </button>

        {/* Scroll to Top Button (Small) */}
        <button
          onClick={scrollToTop}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 text-xs font-bold ${
            theme === 'dark'
              ? 'bg-primary-600 hover:bg-primary-500 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
          title="Başa Dön"
        >
          ⬆️
        </button>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`border-b p-4 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ürün Detay Bilgileri</h2>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-lg transition-colors hover:scale-110 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Product Content - No Scroll */}
            <div className="p-4 flex-1">
              <div className="flex gap-3 mb-3">
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
                  <h1 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedProduct.name}
              </h1>
                  <p className={`text-xs mb-1 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedProduct.description}
              </p>
              
                  <div className="text-xl font-bold text-primary-600 mb-1">
                €{selectedProduct.price.toFixed(2)}
                  </div>

                  {/* Product Tags */}
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      Taze
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      Lezzetli
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-2">
                <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Adet
                </label>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    disabled={quantity <= 1}
                  >
                    <FiMinus size={16} />
                  </button>
                  
                  <div className="min-w-[40px] text-center">
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

              {/* Product Flavors - Çeşniler */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-2">
                  <h3 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Çeşniler
                  </h3>
                  <div className="space-y-1">
                  {selectedProduct.options.map(option => (
                      <div key={option.id} className={`border rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.name}
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                          {option.values.map((valueObj, index) => {
                            const valueName = typeof valueObj === 'string' ? valueObj : valueObj.name;
                            const valuePriceModifier = typeof valueObj === 'string' ? 0 : valueObj.priceModifier;
                            return (
                            <label key={index} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={option.id}
                                value={valueName}
                                checked={selectedOptions[option.id] === valueName}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="mr-2 w-3 h-3"
                              />
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {valueName}
                                {valuePriceModifier !== 0 && (
                                  <span className={`ml-1 ${valuePriceModifier > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ({valuePriceModifier > 0 ? '+' : ''}{valuePriceModifier}€)
                                  </span>
                                )}
                              </span>
                            </label>
                            );
                        })}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-2">
                <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Özel Notlar (İsteğe Bağlı)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Soğansız..."
                  rows={1}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

            </div>
            
            {/* Total and Add Button - Fixed at bottom */}
            <div className={`border-t-2 border-gray-200 pt-4 pb-4 flex-shrink-0 px-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Toplam:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    €{calculateTotalPrice().toFixed(2)}
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

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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
                        ? (theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white')
                        : (theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400')
                    }`}
                  >
                    {pinInput.length > i ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => setPinInput(prev => prev.length < 4 ? prev + num : prev)}
                    className={`p-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPinInput(prev => prev.slice(0, -1))}
                  className={`p-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  ⌫
                </button>
                <button
                  onClick={() => setPinInput(prev => prev.length < 4 ? prev + '0' : prev)}
                  className={`p-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  0
                </button>
                <button
                  onClick={handlePinSubmit}
                  className={`p-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-primary-600 hover:bg-primary-500 text-white' 
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onKeyPress={(key) => {
          setSearchQuery(prev => prev + key);
          // Input'a focus yap ve cursor'u sona al
          const input = searchInputElementRef.current;
          if (input) {
            setTimeout(() => {
              input.focus();
              if (input.setSelectionRange) {
                const len = input.value.length;
                input.setSelectionRange(len, len);
              }
            }, 0);
          }
        }}
        onBackspace={() => {
          setSearchQuery(prev => prev.slice(0, -1));
          // Input'a focus yap ve cursor'u sona al
          const input = searchInputElementRef.current;
          if (input) {
            setTimeout(() => {
              input.focus();
              if (input.setSelectionRange) {
                const len = input.value.length;
                input.setSelectionRange(len, len);
              }
            }, 0);
          }
        }}
        onEnter={() => {
          // Enter'a basınca klavyeyi kapat
          setShowKeyboard(false);
          const input = searchInputElementRef.current;
          if (input) {
            input.blur();
          }
        }}
        theme={theme}
      />
    </div>
  );
}
