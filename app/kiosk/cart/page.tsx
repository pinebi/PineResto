'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
// Printing is triggered via server API to avoid bundling Node modules in client

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, addOrder,
    sessionId, orderType, loadCart
  } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);

  const total = getCartTotal();

  useEffect(() => {
    // Sepeti yükle
    loadCart();
  }, []);

  const getEstimatedTime = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const baseTime = 15;
    const additionalTime = totalItems * 2;
    return baseTime + additionalTime;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Generate order number
      const orderNum = Math.floor(Math.random() * 9000) + 1000;
      setOrderNumber(orderNum);
      
      // Create order object for database
      const orderData = {
        orderNumber: orderNum.toString(),
        customerName: null,
        customerPhone: null,
        customerAddress: null,
        tableNumber: null,
        orderType: 'kiosk',
        items: cart.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity,
          notes: item.notes
        })),
        totalAmount: total,
        paymentMethod: 'cash',
        notes: null
      };

      // Save to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to save order to database');
      }

      const result = await response.json();
      console.log('✅ Order saved to database:', result);

      // Create order object for store (for local state)
      const order = {
        id: result.order.id,
        items: cart,
        total: total,
        status: 'preparing' as const,
        createdAt: new Date(),
        orderNumber: orderNum,
        orderType: 'kiosk' as const,
        estimatedTime: getEstimatedTime()
      };
      
      // Add order to store
      addOrder(order);
      
      setIsProcessing(false);
      setShowSuccess(true);
      setCountdown(5);
      
      // Send to printer via server API
      try {
        await fetch('/api/orders/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
      } catch (error) {
        console.error('Yazıcı hatası:', error);
      }
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        clearInterval(countdownInterval);
        // Clear cart after showing success message
        clearCart();
        setShowSuccess(false);
        setOrderNumber(null);
        setCountdown(5);
        router.push('/kiosk');
      }, 5000);

    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Sipariş kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => router.push('/kiosk')}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FiArrowLeft size={24} />
              <span className="text-lg font-semibold">Menüye Dön</span>
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sepetiniz Boş
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sipariş vermek için ürün ekleyin
            </p>
            <button
              onClick={() => router.push('/kiosk')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
            >
              Ürünlere Göz At
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/kiosk')}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FiArrowLeft size={24} />
              <span className="text-lg font-semibold">Alışverişe Devam</span>
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">Sepetim</h1>
            
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
            >
              Temizle
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image or Emoji */}
                  {item.product.imageUrl && item.product.imageUrl.startsWith('http') ? (
                    <div className="w-20 h-20 overflow-hidden bg-gray-100 rounded-lg flex-shrink-0">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🍽️</div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-3xl">{item.product.imageUrl || '🍽️'}</div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {item.product.description}
                    </p>
                    
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                        <div className="text-xs text-blue-800">
                          {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <strong>{item.product.options?.find(o => o.id === key)?.name}:</strong> {typeof value === 'object' && value?.name ? value.name : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Not:</strong> {item.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={20} />
                        </button>
                        
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <FiPlus size={20} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-primary-600">
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Ürün Sayısı:</span>
                <span className="font-semibold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} adet
                </span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Toplam:</span>
                <span className="text-3xl font-bold text-primary-600">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-xl font-bold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
              <FiCheck size={24} />
              <span>Siparişi Tamamla</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sipariş Mutfağa Gönderildi!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Sipariş No: <span className="font-bold text-primary-600">#{orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              {countdown} saniye sonra ana ekrana dönülecek...
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

