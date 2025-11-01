'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiPhone, FiClock, FiCheck, FiNavigation } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  estimatedTime: number;
  status: 'waiting' | 'picked-up' | 'on-the-way' | 'delivered';
  orderTime: string;
  totalAmount: number;
  items: { name: string; quantity: number }[];
}

export default function DeliveryPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'delivery']}>
      <DeliveryContent />
    </ProtectedRoute>
  );
}

function DeliveryContent() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'picked-up' | 'on-the-way'>('all');

  useEffect(() => {
    // Demo teslimat verileri
    const demoDeliveries: Delivery[] = [
      {
        id: '1',
        orderNumber: 'ONL-001',
        customerName: 'Ayşe Yılmaz',
        customerPhone: '0532 123 4567',
        address: 'Atatürk Cad. No:45, Kadıköy, İstanbul',
        distance: '2.3 km',
        estimatedTime: 15,
        status: 'waiting',
        orderTime: '14:30',
        totalAmount: 285,
        items: [
          { name: 'Adana Kebap', quantity: 2 },
          { name: 'Ayran', quantity: 2 }
        ]
      },
      {
        id: '2',
        orderNumber: 'ONL-002',
        customerName: 'Mehmet Kaya',
        customerPhone: '0533 987 6543',
        address: 'Bağdat Cad. No:123, Maltepe, İstanbul',
        distance: '4.1 km',
        estimatedTime: 25,
        status: 'on-the-way',
        orderTime: '14:15',
        totalAmount: 420,
        items: [
          { name: 'Pide', quantity: 3 },
          { name: 'Çay', quantity: 3 }
        ]
      },
      {
        id: '3',
        orderNumber: 'ONL-003',
        customerName: 'Fatma Demir',
        customerPhone: '0534 555 1234',
        address: 'İstiklal Cad. No:67, Beyoğlu, İstanbul',
        distance: '1.8 km',
        estimatedTime: 12,
        status: 'picked-up',
        orderTime: '14:25',
        totalAmount: 180,
        items: [
          { name: 'Lahmacun', quantity: 2 },
          { name: 'Ayran', quantity: 1 }
        ]
      }
    ];
    setDeliveries(demoDeliveries);
  }, []);

  const filteredDeliveries = deliveries.filter(delivery => 
    filter === 'all' ? delivery.status !== 'delivered' : delivery.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-orange-500';
      case 'picked-up': return 'bg-blue-500';
      case 'on-the-way': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Bekliyor';
      case 'picked-up': return 'Alındı';
      case 'on-the-way': return 'Yolda';
      case 'delivered': return 'Teslim Edildi';
      default: return status;
    }
  };

  const updateDeliveryStatus = (id: string, newStatus: Delivery['status']) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === id ? { ...delivery, status: newStatus } : delivery
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="p-2">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">🚚 Kurye Paneli</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-orange-600">
              {deliveries.filter(d => d.status === 'waiting').length}
            </div>
            <div className="text-xs text-gray-600">Bekliyor</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-blue-600">
              {deliveries.filter(d => d.status === 'picked-up').length}
            </div>
            <div className="text-xs text-gray-600">Alındı</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-green-600">
              {deliveries.filter(d => d.status === 'on-the-way').length}
            </div>
            <div className="text-xs text-gray-600">Yolda</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'waiting' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Bekliyor
          </button>
          <button
            onClick={() => setFilter('picked-up')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'picked-up' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Alındı
          </button>
          <button
            onClick={() => setFilter('on-the-way')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'on-the-way' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Yolda
          </button>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className={`${getStatusColor(delivery.status)} px-4 py-3 text-white flex justify-between items-center`}>
              <div>
                <div className="text-lg font-bold">{delivery.orderNumber}</div>
                <div className="text-sm opacity-90">{delivery.orderTime}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{getStatusText(delivery.status)}</div>
                <div className="text-xs opacity-90">{delivery.distance}</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Customer Info */}
              <div>
                <div className="font-semibold text-gray-900">{delivery.customerName}</div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <FiPhone className="w-4 h-4 mr-2" />
                  {delivery.customerPhone}
                </div>
                <div className="flex items-start text-sm text-gray-600 mt-1">
                  <FiMapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{delivery.address}</span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Sipariş İçeriği:</div>
                <div className="space-y-1">
                  {delivery.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 mt-2 pt-2 border-t">
                  <span>Toplam:</span>
                  <span>€{delivery.totalAmount}</span>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center justify-center text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
                <FiClock className="w-4 h-4 mr-2" />
                <span>Tahmini Teslimat: {delivery.estimatedTime} dk</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-2">
              {delivery.status === 'waiting' && (
                <>
                  <button
                    onClick={() => updateDeliveryStatus(delivery.id, 'picked-up')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Siparişi Al
                  </button>
                  <a
                    href={`tel:${delivery.customerPhone}`}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FiPhone className="w-5 h-5" />
                  </a>
                </>
              )}
              {delivery.status === 'picked-up' && (
                <>
                  <button
                    onClick={() => updateDeliveryStatus(delivery.id, 'on-the-way')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiNavigation className="w-5 h-5" />
                    Yola Çık
                  </button>
                  <a
                    href={`tel:${delivery.customerPhone}`}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FiPhone className="w-5 h-5" />
                  </a>
                </>
              )}
              {delivery.status === 'on-the-way' && (
                <>
                  <button
                    onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheck className="w-5 h-5" />
                    Teslim Edildi
                  </button>
                  <a
                    href={`tel:${delivery.customerPhone}`}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FiPhone className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(delivery.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FiMapPin className="w-5 h-5" />
                  </a>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚚</div>
            <div className="text-xl text-gray-600">Teslimat bulunmuyor</div>
          </div>
        )}
      </div>
    </div>
  );
}

