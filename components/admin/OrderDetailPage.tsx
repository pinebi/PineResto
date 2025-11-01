'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Order } from '@/types';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiPrinter, FiX, FiArrowLeft, FiClock, FiUser, FiMapPin, FiCreditCard, FiShoppingBag } from 'react-icons/fi';

interface OrderDetailPageProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailPage({ orderId, onClose }: OrderDetailPageProps) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          console.error('Sipariş bulunamadı:', orderId);
          setOrder(null);
        }
      } catch (error) {
        console.error('Sipariş detayları yüklenirken hata:', error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log('PDF export functionality');
    alert('PDF export özelliği yakında eklenecek!');
  };

  const handleDeleteOrder = async () => {
    if (confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Sipariş başarıyla silindi!');
          onClose();
          // Sayfayı yenile
          window.location.reload();
        } else {
          alert('Sipariş silinirken hata oluştu!');
        }
      } catch (error) {
        console.error('Sipariş silme hatası:', error);
        alert('Sipariş silinirken hata oluştu!');
      }
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setOrder({ ...order, status: newStatus });
        alert('Sipariş durumu güncellendi!');
      } else {
        alert('Sipariş durumu güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error);
      alert('Sipariş durumu güncellenirken hata oluştu!');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Sipariş detayları yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-gray-600">Sipariş bulunamadı</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'completed': return 'Tamamlandı';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Sipariş Detayı - #{(order.order_number || order.orderNumber || '0000').toString().padStart(4, '0')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiClock className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                  <p className="font-medium">{new Date(order.created_at || order.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiShoppingBag className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Sipariş Türü</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (order.order_type || order.orderType) === 'kiosk' ? 'bg-purple-100 text-purple-800' : 
                    (order.order_type || order.orderType) === 'online' ? 'bg-orange-100 text-orange-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {(order.order_type || order.orderType) === 'kiosk' ? 'Kiosk' : 
                     (order.order_type || order.orderType) === 'online' ? 'Online' : 'Masa'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status).split(' ')[0]}`}></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(order.customer_name || order.customerInfo) && (
                <>
                  <div className="flex items-center space-x-3">
                    <FiUser className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Müşteri</p>
                      <p className="font-medium">{order.customer_name || order.customerInfo?.name || 'Misafir'}</p>
                    </div>
                  </div>

                  {(order.customer_phone || order.customerInfo?.phone) && (
                    <div className="flex items-center space-x-3">
                      <FiUser className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p className="font-medium">{order.customer_phone || order.customerInfo?.phone}</p>
                      </div>
                    </div>
                  )}

                  {(order.customer_address || order.customerInfo?.address) && (
                    <div className="flex items-center space-x-3">
                      <FiMapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Adres</p>
                        <p className="font-medium">{order.customer_address || order.customerInfo?.address}</p>
                      </div>
                    </div>
                  )}

                  {(order.table_id || order.customerInfo?.tableNumber) && (
                    <div className="flex items-center space-x-3">
                      <FiMapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Masa</p>
                        <p className="font-medium">{order.table_id?.replace('table-', 'Masa ') || order.customerInfo?.tableNumber}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(order.payment_method || order.paymentMethod) && (
                <div className="flex items-center space-x-3">
                  <FiCreditCard className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Ödeme</p>
                    <p className="font-medium">
                      {(order.payment_method || order.paymentMethod) === 'cash' ? 'Nakit' : 
                       (order.payment_method || order.paymentMethod) === 'card' ? 'Kredi Kartı' : 'Online'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Durum Güncelle</h3>
            <div className="flex space-x-2">
              {['pending', 'preparing', 'ready', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    order.status === status
                      ? getStatusColor(status)
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş İçeriği</h3>
            <div className="space-y-3">
              {order.items && order.items.map((item: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product_name || item.product?.name}</h4>
                      
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Seçenekler:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => (
                              <span key={key} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {key}: {typeof value === 'object' && value?.name ? value.name : value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Notlar:</p>
                          <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Adet: {item.quantity}</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{(item.total_price || (item.unit_price * item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Toplam Tutar:</span>
              <span className="text-2xl font-bold text-gray-900">€{(order.total_amount || order.final_amount || order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPrinter size={16} />
              <span>Yazdır</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiDownload size={16} />
              <span>PDF İndir</span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteOrder}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Siparişi Sil</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}