'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiCheck, FiAlertCircle, FiBell } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  table: number;
  items: { name: string; quantity: number; notes?: string }[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'preparing' | 'ready';
  orderTime: string;
  estimatedTime: number;
  waiter: string;
}

export default function KitchenPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}>
      <KitchenContent />
    </ProtectedRoute>
  );
}

function KitchenContent() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Demo mutfak siparişleri
    const demoOrders: KitchenOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        table: 2,
        items: [
          { name: 'Adana Kebap', quantity: 2, notes: 'Az acılı' },
          { name: 'Çay', quantity: 2 }
        ],
        priority: 'high',
        status: 'pending',
        orderTime: '14:30',
        estimatedTime: 15,
        waiter: 'Ahmet'
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        table: 3,
        items: [
          { name: 'Serpme Kahvaltı', quantity: 1 },
          { name: 'Çay', quantity: 2 }
        ],
        priority: 'medium',
        status: 'preparing',
        orderTime: '14:25',
        estimatedTime: 20,
        waiter: 'Ayşe'
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        table: 6,
        items: [
          { name: 'İskender', quantity: 1 }
        ],
        priority: 'low',
        status: 'ready',
        orderTime: '14:20',
        estimatedTime: 0,
        waiter: 'Fatma'
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        table: 8,
        items: [
          { name: 'Pide', quantity: 3 },
          { name: 'Ayran', quantity: 3 }
        ],
        priority: 'high',
        status: 'pending',
        orderTime: '14:35',
        estimatedTime: 12,
        waiter: 'Ali'
      }
    ];
    setOrders(demoOrders);
  }, []);

  const filteredOrders = orders.filter(order => 
    filter === 'all' ? true : order.status === filter
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      default: return status;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: 'pending' | 'preparing' | 'ready') => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (soundEnabled) {
      // Ses efekti buraya eklenebilir
      console.log('🔔 Status updated!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="p-2">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">🍳 Mutfak Ekranı</h1>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg ${soundEnabled ? 'bg-white/20' : 'bg-white/5'}`}
            >
              <FiBell className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-orange-200 text-sm mt-1">Bekliyor</div>
          </div>
          <div className="bg-blue-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{orders.filter(o => o.status === 'preparing').length}</div>
            <div className="text-blue-200 text-sm mt-1">Hazırlanıyor</div>
          </div>
          <div className="bg-green-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{orders.filter(o => o.status === 'ready').length}</div>
            <div className="text-green-200 text-sm mt-1">Hazır</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Bekliyor
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'preparing' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Hazırlanıyor
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Hazır
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-gray-700"
            >
              {/* Order Header */}
              <div className={`${getStatusColor(order.status)} px-4 py-3 flex justify-between items-center`}>
                <div>
                  <div className="text-lg font-bold">{order.orderNumber}</div>
                  <div className="text-sm opacity-90">Masa {order.table} • {order.waiter}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{order.orderTime}</div>
                  {order.estimatedTime > 0 && (
                    <div className="text-xs opacity-90 flex items-center justify-end mt-1">
                      <FiClock className="w-3 h-3 mr-1" />
                      {order.estimatedTime} dk
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              {order.priority === 'high' && (
                <div className="bg-red-600 px-4 py-2 flex items-center text-sm font-medium">
                  <FiAlertCircle className="w-4 h-4 mr-2" />
                  ÖNCELİKLİ SİPARİŞ!
                </div>
              )}

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-700 pb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          {item.notes && (
                            <div className="text-sm text-yellow-400 mt-1 flex items-start">
                              <FiAlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                              <span>{item.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold ml-4">×{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-900 flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Hazırlamaya Başla
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <FiCheck className="w-5 h-5 inline mr-2" />
                    Hazır
                  </button>
                )}
                {order.status === 'ready' && (
                  <div className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium text-center">
                    <FiCheck className="w-5 h-5 inline mr-2" />
                    Servis Bekliyor
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🍳</div>
          <div className="text-xl text-gray-400">Sipariş bulunmuyor</div>
        </div>
      )}
    </div>
  );
}

