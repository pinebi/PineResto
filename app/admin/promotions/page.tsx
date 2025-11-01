'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGift, FiPercent, FiClock, FiTag } from 'react-icons/fi';

interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'coupon' | 'combo' | 'happy-hour' | 'bogo';
  value: number;
  code?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  minOrderAmount?: number;
  applicableProducts?: string[];
  description: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Demo promosyon verileri
    const demoPromotions: Promotion[] = [
      {
        id: '1',
        name: 'Yaz İndirimi',
        type: 'discount',
        value: 20,
        code: 'YAZ20',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        isActive: true,
        usageCount: 145,
        usageLimit: 500,
        minOrderAmount: 100,
        description: '%20 indirim - En az 100 TL siparişte geçerli'
      },
      {
        id: '2',
        name: 'Happy Hour',
        type: 'happy-hour',
        value: 30,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        usageCount: 567,
        description: '14:00-17:00 arası %30 indirim'
      },
      {
        id: '3',
        name: 'Combo Menü',
        type: 'combo',
        value: 50,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        usageCount: 234,
        description: 'Kebap + İçecek + Tatlı = 50 TL indirim'
      },
      {
        id: '4',
        name: '1+1 Tatlı',
        type: 'bogo',
        value: 100,
        code: 'TATLI1',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        isActive: false,
        usageCount: 89,
        usageLimit: 200,
        description: 'Bir tatlı al, bir tatlı bedava'
      },
      {
        id: '5',
        name: 'İlk Sipariş İndirimi',
        type: 'coupon',
        value: 50,
        code: 'ILKSIPARIS',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        usageCount: 423,
        minOrderAmount: 150,
        description: 'İlk siparişinize 50 TL indirim'
      }
    ];
    setPromotions(demoPromotions);
  }, []);

  const filteredPromotions = promotions.filter(promo => {
    if (filter === 'all') return true;
    if (filter === 'active') return promo.isActive;
    return !promo.isActive;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <FiPercent className="w-5 h-5" />;
      case 'coupon': return <FiTag className="w-5 h-5" />;
      case 'combo': return <FiGift className="w-5 h-5" />;
      case 'happy-hour': return <FiClock className="w-5 h-5" />;
      case 'bogo': return <FiGift className="w-5 h-5" />;
      default: return <FiGift className="w-5 h-5" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'discount': return 'İndirim';
      case 'coupon': return 'Kupon';
      case 'combo': return 'Combo';
      case 'happy-hour': return 'Happy Hour';
      case 'bogo': return '1+1';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-blue-100 text-blue-800';
      case 'coupon': return 'bg-green-100 text-green-800';
      case 'combo': return 'bg-purple-100 text-purple-800';
      case 'happy-hour': return 'bg-orange-100 text-orange-800';
      case 'bogo': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const togglePromoStatus = (id: string) => {
    setPromotions(promotions.map(promo =>
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promosyon & Kampanyalar</h2>
          <p className="text-gray-600 mt-1">İndirimler, kuponlar ve kampanyaları yönetin</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <FiPlus className="w-4 h-4" />
          Yeni Promosyon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Promosyon</div>
              <div className="text-3xl font-bold mt-1">{promotions.length}</div>
            </div>
            <FiGift className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Aktif Kampanya</div>
              <div className="text-3xl font-bold mt-1">{promotions.filter(p => p.isActive).length}</div>
            </div>
            <FiPercent className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Kullanım</div>
              <div className="text-3xl font-bold mt-1">{promotions.reduce((sum, p) => sum + p.usageCount, 0)}</div>
            </div>
            <FiTag className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Tasarruf Sağlanan</div>
              <div className="text-3xl font-bold mt-1">€12,450</div>
            </div>
            <FiGift className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tümü ({promotions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Aktif ({promotions.filter(p => p.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pasif ({promotions.filter(p => !p.isActive).length})
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className={`p-4 ${promo.isActive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-400'} text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    {getTypeIcon(promo.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{promo.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(promo.type)} bg-white/20`}>
                      {getTypeText(promo.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => togglePromoStatus(promo.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    promo.isActive ? 'bg-white/20' : 'bg-white/30'
                  }`}
                >
                  {promo.isActive ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-gray-700">{promo.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Değer</div>
                  <div className="text-lg font-bold text-gray-900">
                    {promo.type === 'discount' || promo.type === 'happy-hour' ? `%${promo.value}` : `€${promo.value}`}
                  </div>
                </div>
                {promo.code && (
                  <div>
                    <div className="text-sm text-gray-600">Kod</div>
                    <div className="text-lg font-bold text-blue-600">{promo.code}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600">Başlangıç</div>
                  <div className="text-sm font-medium text-gray-900">{promo.startDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bitiş</div>
                  <div className="text-sm font-medium text-gray-900">{promo.endDate}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600">Kullanım</div>
                  <div className="text-lg font-bold text-gray-900">
                    {promo.usageCount}
                    {promo.usageLimit && <span className="text-sm text-gray-600"> / {promo.usageLimit}</span>}
                  </div>
                </div>
                {promo.usageLimit && (
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(promo.usageCount / promo.usageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {promo.minOrderAmount && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <strong>Min. Sipariş:</strong> €{promo.minOrderAmount}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <FiEdit2 className="w-4 h-4" />
                Düzenle
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <FiTrash2 className="w-4 h-4" />
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}











