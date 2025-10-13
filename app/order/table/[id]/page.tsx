'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Category, Product, CartItem } from '@/types';
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiCheck } from 'react-icons/fi';

export default function TableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const { categories, setCategories, products, setProducts, cart, addToCart, removeFromCart, updateCartItemQuantity, setSessionId, setOrderType, loadCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Session ID'yi table için ayarla
    const tableSessionKey = `table-${tableId}-session-id`;
    let sessionId = localStorage.getItem(tableSessionKey);
    if (!sessionId) {
      sessionId = `table-${tableId}-${Date.now()}`;
      localStorage.setItem(tableSessionKey, sessionId);
    }
    setSessionId(sessionId);
    setOrderType('online'); // Table orders için 'online' kullanıyoruz
    
    // Cart'ı yükle
    loadCart();
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
    
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [setCategories, setProducts, tableId, setSessionId, setOrderType, loadCart]);

  const activeCategories = categories.filter(c => c.isActive && c.parentId === null);
  const activeProducts = products.filter(p => 
    p.isActive && 
    (!selectedCategory || p.categoryId === selectedCategory)
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
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

  const handleOptionChange = (groupName: string, value: string) => {
    setSelectedOptions({ ...selectedOptions, [groupName]: value });
  };

  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;
    
    let total = selectedProduct.price;
    
    // Çeşni fiyat modifiyerlerini ekle
    Object.values(selectedOptions).forEach((value: any) => {
      if (typeof value === 'object' && value?.priceModifier) {
        total += value.priceModifier;
      }
    });
    
    return total * quantity;
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }
    
    setIsCheckoutProcessing(true);
    
    try {
      // Sipariş oluştur
      const orderData = {
        tableNumber: `table-${tableId}`,
        customerName: `Masa ${tableId}`,
        orderType: 'table',
        items: cart.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          notes: item.notes
        })),
        totalAmount: getTotalPrice(),
        status: 'pending'
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Siparişiniz alındı!\n\nMasa ${tableId}\nSipariş No: ${result.orderNumber || 'N/A'}\nToplam: ₺${getTotalPrice().toFixed(2)}\n\nSiparişiniz hazırlanıyor!`);
        
        // Sepeti temizle
        await fetch(`/api/cart?sessionId=${localStorage.getItem(`table-${tableId}-session-id`)}&orderType=online`, {
          method: 'DELETE'
        });
        
        // Sayfayı yenile
        window.location.reload();
      } else {
        alert('❌ Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCheckoutProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">🍽️ Masa {tableId}</h1>
              <p className="text-orange-100 mt-1">QR Menüden Sipariş Verin</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleCheckout}
                disabled={isCheckoutProcessing}
                className={`bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 ${isCheckoutProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>{getTotalItems()} Ürün</span>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-lg ml-2">
                  ₺{getTotalPrice().toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-orange-50'
            }`}
          >
            Tümü
          </button>
          {activeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden group"
            >
              {product.imageUrl && product.imageUrl.startsWith('http') ? (
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-orange-100 to-yellow-100">🍽️</div>';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                  {product.imageUrl || '🍽️'}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">₺{product.price}</span>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    Ekle
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary - Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl z-20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FiShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Sepetiniz</div>
                  <div className="font-bold text-gray-900">{getTotalItems()} Ürün</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Toplam</div>
                  <div className="text-2xl font-bold text-orange-600">₺{getTotalPrice().toFixed(2)}</div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutProcessing}
                  className={`bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all ${isCheckoutProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCheckoutProcessing ? 'İşleniyor...' : 'Siparişi Tamamla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold">Ürün Detay Bilgileri</h3>
                <p className="text-sm text-orange-100">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4 space-y-2">
              {/* Product Info */}
              <div className="flex items-start gap-3">
                {selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith('http') ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-100 to-yellow-100">🍽️</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    {selectedProduct.imageUrl || '🍽️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 line-clamp-2">{selectedProduct.description}</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">₺{selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-sm font-medium text-gray-700">Adet:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-white hover:bg-gray-100 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-white hover:bg-gray-100 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Çeşniler</h4>
                  {selectedProduct.options.map((option, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-600 mb-1 flex items-center justify-between">
                        <span>{option.name}</span>
                        {option.required && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                            Zorunlu
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {option.values.map((value: any, vIdx: number) => {
                          const displayValue = typeof value === 'object' && value?.name ? value.name : value;
                          const priceModifier = typeof value === 'object' && value?.priceModifier ? value.priceModifier : 0;
                          return (
                          <button
                            key={vIdx}
                            onClick={() => handleOptionChange(option.name, value)}
                            className={`w-full p-2 rounded-lg text-left transition-all text-sm ${
                              selectedOptions[option.name] === value
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-white hover:bg-orange-50 border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{displayValue}</span>
                              <div className="flex items-center gap-1">
                                {priceModifier > 0 && <span className="text-xs">+₺{priceModifier}</span>}
                                {selectedOptions[option.name] === value && (
                                  <FiCheck className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Özel Not (İsteğe Bağlı)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Az acılı olsun"
                  rows={1}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Total and Add Button - Fixed at Bottom */}
            <div className="flex-shrink-0 bg-gray-50 px-4 py-3 border-t-2 border-gray-200 rounded-b-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Toplam:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ₺{calculateTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg font-bold transition-all shadow-lg uppercase"
              >
                SEPETE EKLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeProducts.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h2>
          <p className="text-gray-600">Başka bir kategori deneyin</p>
        </div>
      )}
    </div>
  );
}

