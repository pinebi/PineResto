'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { FiCheck, FiArrowLeft, FiUser, FiPhone } from 'react-icons/fi';

export default function TableCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const { cart, clearCart } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.09; // %9 KDV
  const total = subtotal + tax;

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      alert('Lütfen adınızı girin');
      return;
    }

    setIsProcessing(true);

    // Sipariş simülasyonu
    setTimeout(() => {
      alert(`✅ Siparişiniz alındı!\n\nMasa: ${tableId}\nAd: ${customerName}\nToplam: €${total.toFixed(2)}\n\nGarson en kısa sürede gelecek!`);
      clearCart();
      router.push(`/order/table/${tableId}/success`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Sipariş Özeti</h1>
              <p className="text-orange-100 text-sm mt-1">Masa {tableId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Müşteri Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline w-4 h-4 mr-2" />
                Adınız *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Adınızı girin"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline w-4 h-4 mr-2" />
                Telefon (İsteğe Bağlı)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0532 123 4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Detayı</h2>
          
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="flex justify-between items-start py-3 border-b last:border-0">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.product.name}</div>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                        <span key={key} className="bg-gray-100 px-2 py-1 rounded mr-1">
                          {typeof value === 'object' && value?.name ? value.name : value}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs text-orange-600 mt-1">📝 {item.notes}</div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="font-semibold text-gray-900">
                    {item.quantity} × €{item.product.price}
                  </div>
                  <div className="text-sm font-bold text-orange-600">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>KDV (%9)</span>
              <span>€{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t">
              <span>Toplam</span>
              <span className="text-orange-600">€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmOrder}
          disabled={isProcessing}
          className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-5 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <FiCheck className="w-6 h-6" />
              <span>Siparişi Onayla</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

