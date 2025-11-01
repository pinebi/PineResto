'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiMail, FiPhone, FiCalendar, FiStar } from 'react-icons/fi';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate: Date;
  registrationDate: Date;
  isActive: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 555 123 4567',
      address: 'İstanbul, Türkiye',
      totalOrders: 15,
      totalSpent: 1250.50,
      loyaltyPoints: 250,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      isActive: true,
    },
    {
      id: '2',
      name: 'Fatma Demir',
      email: 'fatma@example.com',
      phone: '+90 555 987 6543',
      address: 'Ankara, Türkiye',
      totalOrders: 8,
      totalSpent: 680.25,
      loyaltyPoints: 136,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      isActive: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customerData = {
      id: editingCustomer?.id || Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      totalOrders: editingCustomer?.totalOrders || 0,
      totalSpent: editingCustomer?.totalSpent || 0,
      loyaltyPoints: editingCustomer?.loyaltyPoints || 0,
      lastOrderDate: editingCustomer?.lastOrderDate || new Date(),
      registrationDate: editingCustomer?.registrationDate || new Date(),
      isActive: formData.get('isActive') === 'on',
    };

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData as Customer : c));
    } else {
      setCustomers([...customers, customerData as Customer]);
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h2>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus size={20} />
          <span>Yeni Müşteri</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {customer.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Toplam Sipariş:</span>
                <span className="font-medium">{customer.totalOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Toplam Harcama:</span>
                <span className="font-medium text-green-600">€{customer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sadakat Puanı:</span>
                <span className="font-medium text-blue-600">{customer.loyaltyPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Son Sipariş:</span>
                <span className="font-medium">{customer.lastOrderDate.toLocaleDateString('tr-TR')}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingCustomer(customer);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center justify-center space-x-1"
              >
                <FiEdit2 size={12} />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => handleDelete(customer.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center justify-center space-x-1"
              >
                <FiTrash2 size={12} />
                <span>Sil</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinize uygun müşteri bulunmamaktadır.</p>
        </div>
      )}

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCustomer?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingCustomer?.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingCustomer?.phone}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  name="address"
                  defaultValue={editingCustomer?.address}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingCustomer?.isActive ?? true}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}










