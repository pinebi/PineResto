'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiPrinter, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface Order {
  id: string;
  order_number: number;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  table_id?: string;
  order_type: string;
  total_amount: number;
  final_amount: number;
  status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        console.error('Siparişler yüklenemedi');
      }
    } catch (error) {
      console.error('Siparişler yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setSelectedOrder(orderData);
        setShowOrderDetail(true);
      }
    } catch (error) {
      console.error('Sipariş detayı yükleme hatası:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Sipariş listesini güncelle
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Detay modal'ı varsa güncelle
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error);
    }
  };

  const printOrder = async (order: Order) => {
    try {
      const response = await fetch('/api/orders/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      if (response.ok) {
        alert('Sipariş yazıcıya gönderildi!');
      }
    } catch (error) {
      console.error('Yazdırma hatası:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const getOrderTypeText = (orderType: string) => {
    switch (orderType) {
      case 'kiosk': return 'Kiosk';
      case 'online': return 'Online';
      case 'waiter': return 'Garson';
      default: return orderType;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h2>
          <button
            onClick={loadOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>

        {/* Filtreler */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tümü ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bekliyor ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('preparing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'preparing' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hazırlanıyor ({orders.filter(o => o.status === 'preparing').length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'ready' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hazır ({orders.filter(o => o.status === 'ready').length})
          </button>
        </div>
      </div>

      {/* Siparişler Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p>Henüz sipariş bulunmuyor</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getOrderTypeText(order.order_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer_name || 'Müşteri Bilgisi Yok'}
                      </div>
                      {order.customer_phone && (
                        <div className="text-sm text-gray-500">
                          {order.customer_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{order.final_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Detayları Görüntüle"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printOrder(order)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Yazdır"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Hazırlanıyor Olarak İşaretle"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Hazır Olarak İşaretle"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="İptal Et"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sipariş Detay Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Sipariş Detayı #{selectedOrder.order_number}</h3>
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sipariş Tipi</label>
                  <p className="text-sm text-gray-900">{getOrderTypeText(selectedOrder.order_type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Müşteri</label>
                  <p className="text-sm text-gray-900">{selectedOrder.customer_name || 'Müşteri Bilgisi Yok'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="text-sm text-gray-900">{selectedOrder.customer_phone || 'Telefon Bilgisi Yok'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Toplam Tutar</label>
                  <p className="text-sm font-bold text-gray-900">€{selectedOrder.final_amount.toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Notlar</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Sipariş Kalemleri */}
              <div>
                <h4 className="text-md font-semibold mb-3">Sipariş Kalemleri</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × €{item.unit_price.toFixed(2)} = €{item.total_price.toFixed(2)}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">Not: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => printOrder(selectedOrder)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiPrinter className="w-4 h-4" />
                  Yazdır
                </button>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Hazırlanıyor Olarak İşaretle
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Hazır Olarak İşaretle
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}