'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { FiCheck } from 'react-icons/fi';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, getCartTotal, addOrder } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const total = getCartTotal();

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    // Simulate order processing
    const orderData = {
      items: cart,
      total,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const order = await response.json();
      addOrder(order);
      setOrderNumber(order.orderNumber);
      
      // Wait a bit for effect
      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Order failed:', error);
      setIsProcessing(false);
    }
  };

  if (orderNumber !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiCheck size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Siparişiniz Alındı!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Siparişiniz hazırlanıyor
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 mb-8">
            <p className="text-white text-lg mb-2">Sipariş Numaranız</p>
            <div className="text-7xl font-bold text-white">
              #{orderNumber.toString().padStart(3, '0')}
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Lütfen numaranızı not alın. <br/>
            Siparişiniz hazır olduğunda çağrılacaksınız.
          </p>

          <button
            onClick={() => router.push('/kiosk')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors shadow-lg w-full"
          >
            Yeni Sipariş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Sipariş Onayı
        </h1>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Detayları</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{item.product.imageUrl}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x ₺{item.product.price.toFixed(2)}
                    </p>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-xs text-blue-700 mt-1">
                        {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                          <span key={key} className="mr-2">
                            {item.product.options?.find(o => o.id === key)?.name}: {typeof value === 'object' && value?.name ? value.name : value}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-yellow-700 mt-1">Not: {item.notes}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-primary-600">
                  ₺{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-900">Toplam Tutar:</span>
            <span className="text-4xl font-bold text-primary-600">
              ₺{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl text-xl font-bold transition-colors shadow-lg flex items-center justify-center space-x-2 ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <FiCheck size={24} />
                <span>Siparişi Onayla</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl text-xl font-bold transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}

