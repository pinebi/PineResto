'use client';

import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiGrid, FiList, FiX, FiSave } from 'react-icons/fi';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'empty' | 'occupied' | 'reserved';
  position: { x: number; y: number };
  shape: 'square' | 'round';
  currentOrder?: string;
  waiter?: string;
  reservationName?: string;
  reservationTime?: string;
}

interface NewTableForm {
  number: number;
  capacity: number;
  shape: 'square' | 'round';
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const [newTable, setNewTable] = useState<NewTableForm>({
    number: 1,
    capacity: 4,
    shape: 'round'
  });

  useEffect(() => {
    // localStorage'dan masaları yükle
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      // Demo masa verileri
      const demoTables: Table[] = [
        { id: '1', number: 1, capacity: 2, status: 'empty', position: { x: 50, y: 50 }, shape: 'square' },
        { id: '2', number: 2, capacity: 4, status: 'occupied', position: { x: 200, y: 50 }, shape: 'round', currentOrder: 'ORD-001', waiter: 'Ahmet' },
        { id: '3', number: 3, capacity: 4, status: 'occupied', position: { x: 350, y: 50 }, shape: 'round', currentOrder: 'ORD-002', waiter: 'Ayşe' },
        { id: '4', number: 4, capacity: 6, status: 'reserved', position: { x: 500, y: 50 }, shape: 'square', reservationName: 'Mehmet Yılmaz', reservationTime: '19:00' },
        { id: '5', number: 5, capacity: 2, status: 'empty', position: { x: 50, y: 200 }, shape: 'square' },
        { id: '6', number: 6, capacity: 4, status: 'occupied', position: { x: 200, y: 200 }, shape: 'round', currentOrder: 'ORD-003', waiter: 'Fatma' },
        { id: '7', number: 7, capacity: 4, status: 'empty', position: { x: 350, y: 200 }, shape: 'round' },
        { id: '8', number: 8, capacity: 8, status: 'occupied', position: { x: 500, y: 200 }, shape: 'square', currentOrder: 'ORD-004', waiter: 'Ali' },
      ];
      setTables(demoTables);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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

  const handleMouseDown = (tableId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!planRef.current) return;
    
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = planRef.current.getBoundingClientRect();
    
    // Masa merkezine göre offset hesapla (64 = masa boyutunun yarısı)
    setDragOffset({
      x: e.clientX - rect.left - table.position.x - 64,
      y: e.clientY - rect.top - table.position.y - 64
    });
    
    setDraggingTable(tableId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTable || !planRef.current) return;

    const rect = planRef.current.getBoundingClientRect();
    
    // Masa merkezini cursor'a hizala (64 = masa boyutunun yarısı)
    let x = e.clientX - rect.left - dragOffset.x - 64;
    let y = e.clientY - rect.top - dragOffset.y - 64;
    
    // Sınırları kontrol et (0 ile alan genişliği - masa boyutu arasında)
    x = Math.max(0, Math.min(x, rect.width - 128));
    y = Math.max(0, Math.min(y, rect.height - 128));

    setTables(tables.map(table =>
      table.id === draggingTable
        ? { ...table, position: { x, y } }
        : table
    ));
    setHasUnsavedChanges(true);
  };

  const handleMouseUp = () => {
    setDraggingTable(null);
  };

  // Touch events için destek
  const handleTouchStart = (tableId: string, e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!planRef.current) return;
    
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = planRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    setDragOffset({
      x: touch.clientX - rect.left - table.position.x - 64,
      y: touch.clientY - rect.top - table.position.y - 64
    });
    
    setDraggingTable(tableId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingTable || !planRef.current) return;

    e.preventDefault();
    const rect = planRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    let x = touch.clientX - rect.left - dragOffset.x - 64;
    let y = touch.clientY - rect.top - dragOffset.y - 64;
    
    x = Math.max(0, Math.min(x, rect.width - 128));
    y = Math.max(0, Math.min(y, rect.height - 128));

    setTables(tables.map(table =>
      table.id === draggingTable
        ? { ...table, position: { x, y } }
        : table
    ));
    setHasUnsavedChanges(true);
  };

  const handleTouchEnd = () => {
    setDraggingTable(null);
  };

  const handleAddTable = () => {
    if (newTable.number && newTable.capacity) {
      const table: Table = {
        id: Date.now().toString(),
        number: newTable.number,
        capacity: newTable.capacity,
        shape: newTable.shape,
        status: 'empty',
        position: { x: 100, y: 100 }
      };
      setTables([...tables, table]);
      setNewTable({ number: newTable.number + 1, capacity: 4, shape: 'round' });
      setIsAdding(false);
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteTable = (id: string) => {
    if (confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
      setTables(tables.filter(t => t.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveLayout = () => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
    setHasUnsavedChanges(false);
    alert('✅ Masa düzeni kaydedildi! Garson ekranında güncel düzen görüntülenecek.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Masa Yönetimi</h2>
          <p className="text-gray-600 mt-1">Masaları yönetin ve durumlarını takip edin</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Yeni Masa Ekle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Toplam Masa</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{tables.length}</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FiGrid className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Boş Masa</div>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {tables.filter(t => t.status === 'empty').length}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Dolu Masa</div>
              <div className="text-3xl font-bold text-red-600 mt-1">
                {tables.filter(t => t.status === 'occupied').length}
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Rezerve</div>
              <div className="text-3xl font-bold text-yellow-600 mt-1">
                {tables.filter(t => t.status === 'reserved').length}
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Yeni Masa Ekle</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masa Numarası
                </label>
                <input
                  type="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasite (Kişi)
                </label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 2 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masa Şekli
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'square' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      newTable.shape === 'square'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2"></div>
                    <div className="text-sm font-medium text-center">Kare</div>
                  </button>
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'round' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      newTable.shape === 'round'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-medium text-center">Yuvarlak</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTable}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiSave className="w-5 h-5" />
                Masa Ekle
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tables View */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Masa Planı</h3>
            <div className="flex items-center gap-4">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 font-medium">
                    ⚠️ Kaydedilmemiş değişiklikler var
                  </div>
                  <button
                    onClick={handleSaveLayout}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    Düzeni Kaydet
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-700">💡 İpucu:</span>
                <span className="ml-2">Masaya tıklayıp tutarak istediğiniz yere sürükleyin</span>
              </div>
            </div>
          </div>
          <div 
            ref={planRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative bg-gray-50 rounded-lg p-8 min-h-[600px] border-2 border-dashed select-none touch-none"
            style={{ cursor: draggingTable ? 'grabbing' : 'default' }}
          >
            {tables.map((table) => (
              <div
                key={table.id}
                onMouseDown={(e) => handleMouseDown(table.id, e)}
                onTouchStart={(e) => handleTouchStart(table.id, e)}
                style={{
                  position: 'absolute',
                  left: `${table.position.x}px`,
                  top: `${table.position.y}px`,
                  cursor: 'grab',
                  transition: draggingTable === table.id ? 'none' : 'transform 0.2s ease',
                  transform: draggingTable === table.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: draggingTable === table.id ? 50 : 1,
                  pointerEvents: 'auto',
                }}
                className={`w-32 h-32 ${table.shape === 'round' ? 'rounded-full' : 'rounded-lg'} ${getStatusColor(table.status)} text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl group`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTable(table.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 shadow-lg"
                  style={{ cursor: 'pointer' }}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <div className="text-2xl font-bold pointer-events-none">Masa {table.number}</div>
                <div className="text-sm mt-1 pointer-events-none">{table.capacity} Kişi</div>
                {table.waiter && <div className="text-xs mt-1 pointer-events-none">{table.waiter}</div>}
              </div>
            ))}
            
            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🪑</div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">Henüz masa eklenmemiş</h3>
                  <p className="text-gray-500 mb-4">Masa eklemek için yukarıdaki butonu kullanın</p>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    İlk Masayı Ekle
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Boş</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Dolu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Rezerve</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapasite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rezervasyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${getStatusColor(table.status)} rounded-full mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900">Masa {table.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <FiUsers className="w-4 h-4 inline mr-1" />
                    {table.capacity} Kişi
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(table.status)} bg-opacity-10 text-gray-900`}>
                      {getStatusText(table.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.waiter || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.currentOrder || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.reservationName ? (
                      <div>
                        <div>{table.reservationName}</div>
                        <div className="text-xs text-gray-500">{table.reservationTime}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

