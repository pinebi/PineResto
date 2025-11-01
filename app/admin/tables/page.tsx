'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiGrid } from 'react-icons/fi';

interface Table {
  id: string;
  number: number;
  capacity: number;
  shape: string;
  position_x: number;
  position_y: number;
  status: 'empty' | 'occupied' | 'reserved';
  current_order_id?: string;
  waiter_id?: string;
  reservation_name?: string;
  reservation_time?: string;
  created_at: string;
  updated_at: string;
}

interface Region {
  id: string;
  name: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddRegionModal, setShowAddRegionModal] = useState(false);
  const [newTable, setNewTable] = useState({
    number: 0, // 0 olarak başlat, API otomatik bulacak
    capacity: 4,
    shape: 'round',
    position_x: 0,
    position_y: 0,
    status: 'empty'
  });
  const [newRegion, setNewRegion] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchTables();
    fetchRegions();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Masalar yüklenirken hata:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/tables/regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Bölgeler yüklenirken hata:', error);
      setRegions([]);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
      try {
        await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
        fetchTables();
      } catch (error) {
        console.error('Masa silinirken hata:', error);
      }
    }
  };

  const handleDeleteRegion = async (id: string) => {
    if (confirm('Bu bölgeyi silmek istediğinizden emin misiniz?')) {
      try {
        await fetch(`/api/tables/regions?id=${id}`, { method: 'DELETE' });
        fetchRegions();
      } catch (error) {
        console.error('Bölge silinirken hata:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'empty':
        return 'Müsait';
      case 'occupied':
        return 'Dolu';
      case 'reserved':
        return 'Rezerve';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleAddTable = async () => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      });

      if (response.ok) {
        setShowAddTableModal(false);
        setNewTable({
          number: 0,
          capacity: 4,
          shape: 'round',
          position_x: 0,
          position_y: 0,
          status: 'empty'
        });
        fetchTables();
      }
    } catch (error) {
      console.error('Masa eklenirken hata:', error);
    }
  };

  const openAddTableModal = () => {
    // Bir sonraki masa numarasını hesapla
    const maxNumber = Math.max(...tables.map(t => t.number), 0);
    setNewTable(prev => ({ ...prev, number: maxNumber + 1 }));
    setShowAddTableModal(true);
  };

  const handleAddRegion = async () => {
    try {
      const response = await fetch('/api/tables/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRegion),
      });

      if (response.ok) {
        setShowAddRegionModal(false);
        setNewRegion({ name: '', description: '' });
        fetchRegions();
      }
    } catch (error) {
      console.error('Bölge eklenirken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FiMapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Masa Yönetimi</h2>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddRegionModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Yeni Bölge Ekle</span>
          </button>
          <button 
            onClick={openAddTableModal}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Yeni Masa Ekle</span>
          </button>
        </div>
      </div>

      {/* Regions Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiMapPin className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Masa Bölgeleri</h3>
            </div>
            <button 
              onClick={() => setShowAddRegionModal(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Yeni Bölge</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BÖLGE ADI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İŞLEMLER
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regions.map((region) => (
                <tr key={region.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {region.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                        onClick={() => handleDeleteRegion(region.id)}
                        className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                </div>
              </div>

      {/* Tables Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiGrid className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Masalar</h3>
            </div>
            <button 
              onClick={openAddTableModal}
              className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Yeni Masa</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MASA NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KAPASİTE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ŞEKİL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DURUM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İŞLEMLER
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : tables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Henüz masa eklenmemiş
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Masa {table.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.capacity} kişi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.shape === 'round' ? 'Yuvarlak' : 'Kare'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                        {getStatusText(table.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Region Modal */}
      {showAddRegionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Yeni Bölge Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bölge Adı
                </label>
                <input
                  type="text"
                  value={newRegion.name}
                  onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bölge adını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={newRegion.description}
                  onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bölge açıklaması"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRegionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleAddRegion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Yeni Masa Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Masa Numarası
                </label>
                <input
                  type="number"
                  value={newTable.number}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Masa numarası otomatik olarak atanır</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şekil
                </label>
                <select
                  value={newTable.shape}
                  onChange={(e) => setNewTable({ ...newTable, shape: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="round">Yuvarlak</option>
                  <option value="square">Kare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={newTable.status}
                  onChange={(e) => setNewTable({ ...newTable, status: e.target.value as 'empty' | 'occupied' | 'reserved' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="empty">Müsait</option>
                  <option value="occupied">Dolu</option>
                  <option value="reserved">Rezerve</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddTableModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleAddTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}