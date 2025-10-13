'use client';

import { useState } from 'react';
import { User, UserRole } from '@/types';
import { FiX, FiSave, FiUser } from 'react-icons/fi';

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function AddUserModal({ onClose, onSave }: AddUserModalProps) {
  const [userType, setUserType] = useState<'management' | 'customer'>('management');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'waiter' as UserRole,
    password: '',
    avatar: '👤',
    // Management fields
    employeeId: '',
    department: '',
    salary: 0,
    workShift: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    // Customer fields
    customerType: 'regular' as 'regular' | 'vip' | 'corporate',
    address: '',
    birthDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.fullName || !formData.phone || !formData.password) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone,
      role: userType === 'customer' ? 'customer' : formData.role,
      permissions: [],
      isActive: true,
      avatar: formData.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(userType === 'management' && {
        employeeId: formData.employeeId || `EMP-${Date.now().toString().slice(-3)}`,
        department: formData.department,
        salary: formData.salary,
        workShift: formData.workShift,
        hireDate: new Date(),
      }),
      ...(userType === 'customer' && {
        customerType: formData.customerType,
        loyaltyPoints: 0,
        membershipLevel: 'bronze',
        totalSpent: 0,
        orderCount: 0,
        favoriteProducts: [],
        address: formData.address,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      }),
    };

    onSave(newUser);
  };

  const avatarOptions = ['👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '🚴', '💰', '👤', '👨', '👩', '🧑'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-2xl font-bold">Yeni Kullanıcı Ekle</h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Kullanıcı Tipi *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('management')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  userType === 'management'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">👨‍💼</div>
                <div className="font-semibold">Yönetim Ekibi</div>
                <div className="text-xs text-gray-600">Garson, Mutfak, Kurye, vb.</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  userType === 'customer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-semibold">Müşteri</div>
                <div className="text-xs text-gray-600">Normal müşteri hesabı</div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="kullanici123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0532 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar })}
                    className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                      formData.avatar === avatar
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Management Specific Fields */}
          {userType === 'management' && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Yönetim Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="waiter">👨‍🍳 Garson</option>
                    <option value="kitchen">👩‍🍳 Mutfak</option>
                    <option value="delivery">🚴 Kurye</option>
                    <option value="cashier">💰 Kasa</option>
                    <option value="manager">👔 Müdür</option>
                    <option value="admin">👨‍💼 Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Servis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personel ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vardiya</label>
                  <select
                    value={formData.workShift}
                    onChange={(e) => setFormData({ ...formData, workShift: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="morning">Sabah (08:00-16:00)</option>
                    <option value="afternoon">Öğle (12:00-20:00)</option>
                    <option value="evening">Akşam (16:00-00:00)</option>
                    <option value="night">Gece (20:00-04:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maaş (₺)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="15000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Specific Fields */}
          {userType === 'customer' && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri Tipi</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="regular">Normal Müşteri</option>
                    <option value="vip">VIP Müşteri</option>
                    <option value="corporate">Kurumsal Müşteri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tam adres"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              Kullanıcı Ekle
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






