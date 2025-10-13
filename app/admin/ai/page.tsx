'use client';

import { useState } from 'react';
import { FiMessageSquare, FiTrendingUp, FiShoppingCart, FiDollarSign, FiZap } from 'react-icons/fi';

export default function AIPage() {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; message: string }[]>([
    { role: 'ai', message: 'Merhaba! Size nasıl yardımcı olabilirim?' }
  ]);

  const aiPredictions = {
    todaySales: 45680,
    predictedSales: 52300,
    topProducts: [
      { name: 'Adana Kebap', predicted: 95, current: 89, trend: 'up' },
      { name: 'İskender', predicted: 78, current: 67, trend: 'up' },
      { name: 'Pide', predicted: 62, current: 54, trend: 'up' },
    ],
    recommendations: [
      { product: 'Lahmacun', reason: 'Hava sıcak, talep artabilir', confidence: 85 },
      { product: 'Çay', reason: 'Öğleden sonra yoğun dönem', confidence: 92 },
      { product: 'Tatlı', reason: 'Hafta sonu yüksek talep', confidence: 78 },
    ],
    stockAlerts: [
      { item: 'Ayran', action: 'Sipariş ver', urgency: 'high', quantity: 50 },
      { item: 'Kuzu Eti', action: 'Stok kontrol', urgency: 'medium', quantity: 20 },
    ],
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory, { role: 'user', message: chatMessage }]);
    
    // AI yanıtı simülasyonu
    setTimeout(() => {
      const responses = [
        'Bu bilgiyi size sağlayabilirim. Raporlar bölümünden detaylı analiz görebilirsiniz.',
        'Anlıyorum. En çok satan ürünleriniz: Adana Kebap, İskender ve Pide.',
        'Bugünkü satışlarınız geçen haftaya göre %15 artış gösteriyor.',
        'Stok durumunuz normal. Sadece Ayran için yeniden sipariş öneriyorum.',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatHistory(prev => [...prev, { role: 'ai', message: response }]);
    }, 1000);

    setChatMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">🤖 AI Asistan & Tahminler</h2>
        <p className="text-gray-600 mt-1">Yapay zeka destekli analiz ve öneriler</p>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Tahmin Doğruluğu</div>
              <div className="text-3xl font-bold mt-1">87%</div>
            </div>
            <FiZap className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Bugün Tahmini</div>
              <div className="text-3xl font-bold mt-1">₺{aiPredictions.predictedSales.toLocaleString()}</div>
            </div>
            <FiTrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Aktif Öneri</div>
              <div className="text-3xl font-bold mt-1">{aiPredictions.recommendations.length}</div>
            </div>
            <FiShoppingCart className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Stok Uyarısı</div>
              <div className="text-3xl font-bold mt-1">{aiPredictions.stockAlerts.length}</div>
            </div>
            <FiDollarSign className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chatbot */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <FiMessageSquare className="w-6 h-6" />
              <div>
                <div className="font-bold">AI Asistan</div>
                <div className="text-xs opacity-90">Sorularınızı sorun</div>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    chat.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Bir şey sorun..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          {/* Sales Prediction */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
              Satış Tahminleri
            </h3>
            <div className="space-y-3">
              {aiPredictions.topProducts.map((product, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className={`text-sm font-semibold ${
                      product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.current} → {product.predicted}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(product.predicted / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiZap className="w-5 h-5 text-yellow-600" />
              Akıllı Öneriler
            </h3>
            <div className="space-y-3">
              {aiPredictions.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">{rec.product}</div>
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      %{rec.confidence} güven
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{rec.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5 text-red-600" />
              Stok Uyarıları
            </h3>
            <div className="space-y-3">
              {aiPredictions.stockAlerts.map((alert, idx) => (
                <div key={idx} className={`rounded-lg p-4 border-2 ${
                  alert.urgency === 'high' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{alert.item}</div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      alert.urgency === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {alert.urgency === 'high' ? 'ACİL' : 'DİKKAT'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{alert.action}</div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    {alert.quantity} {alert.item} Sipariş Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






