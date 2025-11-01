'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Category, Product } from '@/types';
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiMaximize, FiMinimize, FiSearch, FiStar, FiTrendingUp, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';

export default function KioskPage() {
  const router = useRouter();
  const { language, setLanguage } = useTheme();
  const { t } = useTranslations();
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
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [wantDrink, setWantDrink] = useState<boolean | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showLanguageScreen, setShowLanguageScreen] = useState(false);
  const [showInitialWelcome, setShowInitialWelcome] = useState(true);
  const [showOrderTypeScreen, setShowOrderTypeScreen] = useState(false);
  const [orderLocation, setOrderLocation] = useState<'eat-in' | 'take-away' | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const searchInputElementRef = useRef<HTMLInputElement>(null);

  // Dil değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

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
        const [categoriesResponse, productsResponse, bestSellersResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch('/api/products/bestsellers')
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        const bestSellersData = await bestSellersResponse.json();
        
        // Array kontrolü yap
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setBestSellers(Array.isArray(bestSellersData) ? bestSellersData : []);
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
    setWantDrink(null); // Her yeni ürün için sıfırla
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
    setWantDrink(null);
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

  // Sepet toplam tutarını hesapla
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      let itemPrice = item.product.price;
      let optionPriceModifier = 0;

      // Seçili seçeneklerin fiyat modifikasyonlarını hesapla
      if (item.selectedOptions && item.product.options) {
        item.product.options.forEach(option => {
          const selectedValue = item.selectedOptions?.[option.id];
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

      return total + (itemPrice + optionPriceModifier) * item.quantity;
    }, 0);
  };

  const handleAddToCart = async () => {
    if (selectedProduct) {
      await addToCart(selectedProduct, quantity, selectedOptions, notes.trim() || undefined);
      
      // Eğer içecek isteniyorsa Softdrinks kategorisini aç
      if (wantDrink === true) {
        const softdrinksCategory = Array.isArray(categories) 
          ? categories.find(c => c.name.toLowerCase().includes('softdrink') || c.name.toLowerCase() === 'softdrinks')
          : null;
        
        if (softdrinksCategory) {
          setSelectedCategory(softdrinksCategory.id);
        }
      }
      
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

  // Initial Welcome Screen - Sultans-Kiel style (https://sultans-kiel.de/#home)
  if (showInitialWelcome) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 cursor-pointer"
        onClick={() => {
          setShowInitialWelcome(false);
          setShowOrderTypeScreen(true);
        }}
      >
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://sultans-kiel.de/wp-content/uploads/2021/11/sultanfinal_576p.webm" type="video/webm" />
        </video>
        
        {/* Overlay with filter */}
        <div className="absolute inset-0 bg-black/35 z-10"></div>
        
        <div className="text-center space-y-8 max-w-4xl relative z-20">
          {/* Main Welcome Text */}
          <div className="space-y-4">
            <div className="flex justify-center mb-6 animate-fadeIn">
              <img 
                src="https://sultans-kiel.de/wp-content/uploads/2022/08/sultanslogo-1-768x367.png.webp" 
                alt="Sultans Logo" 
                className="h-32 md:h-40 w-auto object-contain filter drop-shadow-2xl"
              />
            </div>
            <p className="text-3xl md:text-5xl font-bold text-white/95 mb-4">
              Willkommen im besten türkischen Restaurant
            </p>
            <p className="text-xl md:text-3xl font-semibold text-white/80">
              im Herzen von Kiel
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <div className="w-24 h-1 bg-white/60"></div>
            <div className="text-4xl text-white/70">🍽️</div>
            <div className="w-24 h-1 bg-white/60"></div>
          </div>

          {/* Tap to Continue Hint */}
          <div className="mt-16 animate-pulse">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <p className="text-xl md:text-2xl font-semibold text-white">
                👆 Zum Starten berühren
              </p>
              <p className="text-lg text-white/80 mt-2">
                Touch to start
              </p>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="mt-12 text-white/70 text-sm md:text-base">
            <p>Familiengeführtes türkisches Restaurant seit 2003</p>
            <p className="mt-2">Sophienblatt, im Hauptbahnhof 25 - 24103 Kiel</p>
          </div>
        </div>
      </div>
    );
  }

  // Order Type Selection Screen - McDonald's style (Where will you be eating today?)
  if (showOrderTypeScreen) {
    const languages = [
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    return (
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="w-full max-w-3xl">
            {/* Main Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
              {t('kiosk.whereToEat')}
            </h2>

            {/* Order Type Selection - Eat In / Take Away */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Eat In */}
              <button
                onClick={() => {
                  setOrderLocation('eat-in');
                  setOrderType('kiosk');
                }}
                className={`group relative bg-white rounded-xl p-4 shadow-lg transition-all transform hover:scale-105 active:scale-100 border-2 ${
                  orderLocation === 'eat-in' 
                    ? 'border-primary-500 shadow-xl' 
                    : 'border-transparent hover:border-primary-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    🍽️
                  </div>
                  <div className={`text-xl font-bold mb-1 ${
                    orderLocation === 'eat-in' ? 'text-primary-600' : 'text-gray-800'
                  }`}>
                    {t('kiosk.eatIn')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('kiosk.eatInDesc')}
                  </div>
                </div>
                {orderLocation === 'eat-in' && (
                  <div className="absolute top-2 right-2 text-xl text-primary-600">✓</div>
                )}
              </button>

              {/* Take Away */}
              <button
                onClick={() => {
                  setOrderLocation('take-away');
                  setOrderType('kiosk');
                }}
                className={`group relative bg-white rounded-xl p-4 shadow-lg transition-all transform hover:scale-105 active:scale-100 border-2 ${
                  orderLocation === 'take-away' 
                    ? 'border-primary-500 shadow-xl' 
                    : 'border-transparent hover:border-primary-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    🛍️
                  </div>
                  <div className={`text-xl font-bold mb-1 ${
                    orderLocation === 'take-away' ? 'text-primary-600' : 'text-gray-800'
                  }`}>
                    {t('kiosk.takeAway')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('kiosk.takeAwayDesc')}
                  </div>
                </div>
                {orderLocation === 'take-away' && (
                  <div className="absolute top-2 right-2 text-xl text-primary-600">✓</div>
                )}
              </button>
            </div>

            {/* Continue Button - Only show when order location is selected */}
            {orderLocation && (
              <div className="text-center mb-3">
                <button
                  onClick={() => {
                    setShowOrderTypeScreen(false);
                    // Skip welcome screen, go directly to menu
                    setShowWelcomeScreen(false);
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('kiosk.continue')} →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Languages Section - Bottom */}
        <div className="bg-white border-t-2 border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
              {t('kiosk.languages')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as 'tr' | 'en' | 'de');
                  }}
                  className={`group relative bg-gray-50 rounded-lg p-3 shadow-sm transition-all transform hover:scale-105 active:scale-95 border-2 ${
                      language === lang.code
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-transparent hover:border-primary-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                      {lang.flag}
                    </div>
                    <div className={`text-sm font-bold ${
                      language === lang.code ? 'text-primary-600' : 'text-gray-800'
                    }`}>
                      {lang.name}
                    </div>
                  </div>
                  {language === lang.code && (
                    <div className="absolute top-1 right-1 text-sm text-primary-600">✓</div>
                  )}
                </button>
              ))}
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
                className="cursor-pointer"
                title="Ana Sayfaya Dön"
              >
                <img 
                  src="https://sultans-kiel.de/wp-content/uploads/2022/08/sultanslogo-1-768x367.png.webp" 
                  alt="Sultans Logo" 
                  className="h-12 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </button>
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
                title={t('kiosk.bestSellers')}
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
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">
                    {t('kiosk.cart')} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span className="font-bold text-xs opacity-90">
                    €{calculateCartTotal().toFixed(2)}
                  </span>
                </div>
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

        {/* Right Content - Products */}
        <div className="flex-1 min-w-0">
          {/* Products */}
            <div>
              {/* Kategori seçili değilse ve arama yoksa En Çok Satanlar göster */}
              {!selectedCategory && !searchQuery ? (
                <>
                  <h2 className={`text-3xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🔥 {t('kiosk.bestSellers')}
                  </h2>
                  
                  {bestSellers.length === 0 ? (
                    <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="text-6xl mb-4">📊</div>
                      <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('kiosk.noSalesData')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                      {bestSellers.map((product) => (
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
                                {t('common.add')}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCategory 
                      ? (Array.isArray(categories) ? categories.find(c => c.id === selectedCategory)?.name : '') || t('kiosk.categories')
                      : searchQuery 
                      ? `${t('kiosk.searchResults')} (${filteredProducts.length})`
                      : t('kiosk.allProducts')}
                  </h2>
                  
                  {filteredProducts.length === 0 ? (
                    <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="text-6xl mb-4">🔍</div>
                      <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {searchQuery ? t('kiosk.noSearchResults') : t('kiosk.noProducts')}
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
                                {t('common.add')}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
        </div>
      </div>

      {/* Product Detail Modal - Compact & Cute */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden flex flex-col animate-slideUp ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header - Compact */}
            <div className={`relative p-4 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <button
                onClick={closeModal}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-90 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FiX size={20} />
              </button>
              <h2 className={`text-xl font-black pr-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedProduct.name}
              </h2>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {/* Product Image - Compact */}
              <div className="mb-4 -mx-4">
                {selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith('http') ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-primary-100 to-primary-200">🍽️</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <div className="text-7xl">{selectedProduct.imageUrl || '🍽️'}</div>
                  </div>
                )}
              </div>

              {/* Product Info - Compact */}
              <div className="mb-4">
                {selectedProduct.description && (
                  <p className={`text-sm mb-3 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedProduct.description}
                  </p>
                )}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100">
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-700' : 'text-gray-700'}`}>
                    {t('product.price')}:
                  </span>
                  <span className="text-3xl font-black text-primary-600">
                    €{selectedProduct.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quantity - Compact */}
              <div className="mb-4">
                <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('kiosk.quantity')}
                </label>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    -
                  </button>
                  <div className={`min-w-[50px] text-center px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white border-2 border-gray-200'}`}>
                    <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all transform hover:scale-110 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Product Options - Compact */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-4">
                  <h3 className={`text-base font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🔧 {t('kiosk.selectOptions')}
                  </h3>
                  <div className="space-y-3">
                    {selectedProduct.options.map(option => (
                      <div key={option.id} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {option.name}
                        </label>
                        <div className="space-y-2">
                          {option.values?.map((valueObj: any) => {
                            const valueName = typeof valueObj === 'string' ? valueObj : valueObj.name;
                            const valuePriceModifier = typeof valueObj === 'string' ? 0 : (valueObj.priceModifier || 0);
                            const isSelected = selectedOptions[option.id] === valueName;

                            return (
                              <label
                                key={valueName}
                                className={`flex items-center justify-between p-2.5 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${
                                  isSelected
                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                    : theme === 'dark'
                                    ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
                                    : 'border-gray-300 bg-white hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="radio"
                                    name={option.id}
                                    value={valueName}
                                    checked={isSelected}
                                    onChange={() => {
                                      handleOptionChange(option.id, valueName);
                                    }}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {valueName}
                                  </span>
                                </div>
                                {valuePriceModifier !== 0 && (
                                  <span className={`text-xs font-bold ml-2 ${
                                    valuePriceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {valuePriceModifier > 0 ? '+' : ''}{valuePriceModifier}€
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes - Compact */}
              <div className="mb-4">
                <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  📝 {t('kiosk.notes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder=""
                  rows={2}
                  className={`w-full px-3 py-2 text-sm border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Modal Footer - Fixed Bottom */}
            <div className={`border-t-2 pt-3 pb-4 px-4 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200'}`}>
              {/* İçecek Seçimi Sorusu - Sadece içecek kategorisinde değilse göster */}
              {(() => {
                // Ürünün kategorisini bul
                const productCategory = Array.isArray(categories) 
                  ? categories.find(c => c.id === selectedProduct.categoryId)
                  : null;
                const categoryName = productCategory?.name?.toLowerCase() || '';
                
                // Eğer ürün zaten bir içecek kategorisindeyse soruyu gösterme
                const isDrinkCategory = categoryName.includes('softdrink') || 
                                        categoryName.includes('alkoholische') ||
                                        categoryName.includes('getränke') ||
                                        categoryName === 'softdrinks' ||
                                        categoryName === 'alkoholische getränke';
                
                if (isDrinkCategory) {
                  return null; // İçecek kategorisindeyse soruyu gösterme
                }
                
                return (
                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      🥤 {t('kiosk.drinkQuestion')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWantDrink(true)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 active:scale-95 ${
                          wantDrink === true
                            ? 'bg-primary-500 text-white shadow-lg'
                            : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300'
                        }`}
                      >
                        ✓ {t('kiosk.yes')}
                      </button>
                      <button
                        onClick={() => setWantDrink(false)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 active:scale-95 ${
                          wantDrink === false
                            ? 'bg-gray-500 text-white shadow-lg'
                            : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300'
                        }`}
                      >
                        ✗ {t('kiosk.no')}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Toplam Fiyat */}
              <div className="flex justify-between items-center mb-3">
                <span className={`text-base font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('kiosk.total')}:
                </span>
                <span className="text-3xl font-black text-primary-600">
                  €{calculateTotalPrice().toFixed(2)}
                </span>
              </div>
            
              {/* Sepete Ekle Butonu */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3.5 rounded-xl text-lg font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl"
              >
                🛒 {t('kiosk.addToCart').toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

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
