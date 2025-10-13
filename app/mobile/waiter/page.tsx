'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiCheck, FiClock, FiDollarSign, FiUser } from 'react-icons/fi';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'empty' | 'occupied' | 'reserved';
  currentOrder?: string;
  waiter?: string;
  amount?: number;
}

export default function WaiterPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState<'all' | 'empty' | 'occupied' | 'reserved'>('all');

  useEffect(() => {
    // localStorage'dan masaları yükle
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      const parsedTables = JSON.parse(savedTables);
      // Masa durumları için demo verileri ekle
      const tablesWithStatus = parsedTables.map((table: any) => ({
        ...table,
        status: table.status || (Math.random() > 0.5 ? 'occupied' : 'empty'),
        currentOrder: table.status === 'occupied' ? `ORD-${Math.floor(Math.random() * 100)}` : undefined,
        waiter: table.status === 'occupied' ? ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Ali'][Math.floor(Math.random() * 5)] : undefined,
        amount: table.status === 'occupied' ? Math.floor(Math.random() * 500) + 100 : undefined,
      }));
      setTables(tablesWithStatus);
    } else {
      // Demo masa verileri
      const demoTables: Table[] = [
        { id: '1', number: 1, capacity: 2, status: 'empty' },
        { id: '2', number: 2, capacity: 4, status: 'occupied', currentOrder: 'ORD-001', waiter: 'Ahmet', amount: 250 },
        { id: '3', number: 3, capacity: 4, status: 'occupied', currentOrder: 'ORD-002', waiter: 'Ayşe', amount: 420 },
        { id: '4', number: 4, capacity: 6, status: 'reserved', waiter: 'Mehmet' },
        { id: '5', number: 5, capacity: 2, status: 'empty' },
        { id: '6', number: 6, capacity: 4, status: 'occupied', currentOrder: 'ORD-003', waiter: 'Fatma', amount: 180 },
        { id: '7', number: 7, capacity: 4, status: 'empty' },
        { id: '8', number: 8, capacity: 8, status: 'occupied', currentOrder: 'ORD-004', waiter: 'Ali', amount: 650 },
      ];
      setTables(demoTables);
    }
  }, []);

  const filteredTables = tables.filter(table => 
    filter === 'all' ? true : table.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-300';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'empty': return 'Boş';
      case 'occupied': return 'Dolu';
      case 'reserved': return 'Rezerve';
      default: return status;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'waiter']}>
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="p-2">
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">Garson Paneli</h1>
            <Link href="/mobile/waiter/new-order" className="p-2">
              <FiPlus className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-green-600">{tables.filter(t => t.status === 'empty').length}</div>
            <div className="text-xs text-gray-600">Boş Masa</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-red-600">{tables.filter(t => t.status === 'occupied').length}</div>
            <div className="text-xs text-gray-600">Dolu Masa</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-yellow-600">{tables.filter(t => t.status === 'reserved').length}</div>
            <div className="text-xs text-gray-600">Rezerve</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('empty')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'empty' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Boş
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'occupied' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Dolu
          </button>
          <button
            onClick={() => setFilter('reserved')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'reserved' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Rezerve
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredTables.map((table) => (
            <Link
              key={table.id}
              href={`/mobile/waiter/table/${table.id}`}
              className={`bg-white rounded-xl shadow-md p-4 border-2 ${getStatusColor(table.status)} hover:shadow-lg transition-shadow`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">Masa {table.number}</div>
                  <div className="text-sm text-gray-600">{table.capacity} Kişilik</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                  {getStatusText(table.status)}
                </span>
              </div>
              
              {table.status === 'occupied' && (
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="w-4 h-4 mr-2" />
                    <span>{table.waiter}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiDollarSign className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-green-600">₺{table.amount}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>{table.currentOrder}</span>
                  </div>
                </div>
              )}

              {table.status === 'reserved' && (
                <div className="pt-3 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="w-4 h-4 mr-2" />
                    <span>Garson: {table.waiter}</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Link href="/mobile" className="flex flex-col items-center text-gray-600">
              <FiUser className="w-6 h-6" />
              <span className="text-xs mt-1">Ana Sayfa</span>
            </Link>
            <Link href="/mobile/waiter" className="flex flex-col items-center text-blue-600">
              <FiCheck className="w-6 h-6" />
              <span className="text-xs mt-1">Garson</span>
            </Link>
            <Link href="/mobile/kitchen" className="flex flex-col items-center text-gray-600">
              <FiClock className="w-6 h-6" />
              <span className="text-xs mt-1">Mutfak</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
    </ProtectedRoute>
  );
}

