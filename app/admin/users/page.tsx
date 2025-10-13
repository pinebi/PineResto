'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUser, FiShield, FiUsers } from 'react-icons/fi';
import AddUserModal from '@/components/admin/AddUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'management' | 'customer'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    // Demo kullanıcılar
    const demoUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@restaurant.com',
        fullName: 'Admin Kullanıcı',
        phone: '0532 000 0001',
        role: 'admin',
        permissions: [],
        isActive: true,
        avatar: '👨‍💼',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
        employeeId: 'EMP-001',
        department: 'Yönetim',
        salary: 25000,
        hireDate: new Date('2023-01-01'),
      },
      {
        id: '2',
        username: 'garson1',
        email: 'ahmet@restaurant.com',
        fullName: 'Ahmet Yılmaz',
        phone: '0532 111 2222',
        role: 'waiter',
        permissions: [],
        isActive: true,
        avatar: '👨‍🍳',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date(),
        employeeId: 'EMP-002',
        department: 'Servis',
        workShift: 'morning',
        salary: 15000,
        hireDate: new Date('2023-01-15'),
      },
      {
        id: '3',
        username: 'mutfak1',
        email: 'fatma@restaurant.com',
        fullName: 'Fatma Demir',
        phone: '0532 333 4444',
        role: 'kitchen',
        permissions: [],
        isActive: true,
        avatar: '👩‍🍳',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date(),
        employeeId: 'EMP-003',
        department: 'Mutfak',
        workShift: 'afternoon',
        salary: 18000,
        hireDate: new Date('2023-03-20'),
      },
      {
        id: '4',
        username: 'kurye1',
        email: 'mehmet@restaurant.com',
        fullName: 'Mehmet Kaya',
        phone: '0532 555 6666',
        role: 'delivery',
        permissions: [],
        isActive: true,
        avatar: '🚴',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date(),
        employeeId: 'EMP-004',
        department: 'Teslimat',
        workShift: 'evening',
        salary: 16000,
        hireDate: new Date('2023-06-10'),
      },
      {
        id: '5',
        username: 'kasa1',
        email: 'ayse@restaurant.com',
        fullName: 'Ayşe Şahin',
        phone: '0532 777 8888',
        role: 'cashier',
        permissions: [],
        isActive: true,
        avatar: '💰',
        createdAt: new Date('2023-02-28'),
        updatedAt: new Date(),
        employeeId: 'EMP-005',
        department: 'Kasa',
        workShift: 'afternoon',
        salary: 14000,
        hireDate: new Date('2023-02-28'),
      },
      // Müşteri örnekleri
      {
        id: '101',
        username: 'customer1',
        email: 'zeynep@example.com',
        fullName: 'Zeynep Arslan',
        phone: '0533 999 0001',
        role: 'customer',
        permissions: [],
        isActive: true,
        avatar: '👩',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date(),
        customerType: 'vip',
        loyaltyPoints: 1250,
        membershipLevel: 'gold',
        totalSpent: 5420,
        orderCount: 47,
        favoriteProducts: ['1', '2'],
        address: 'Kadıköy, İstanbul',
        birthDate: new Date('1990-05-15'),
      },
      {
        id: '102',
        username: 'customer2',
        email: 'ali@example.com',
        fullName: 'Ali Yıldız',
        phone: '0534 888 0002',
        role: 'customer',
        permissions: [],
        isActive: true,
        avatar: '👨',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date(),
        customerType: 'regular',
        loyaltyPoints: 320,
        membershipLevel: 'silver',
        totalSpent: 1280,
        orderCount: 12,
        favoriteProducts: ['3'],
        address: 'Beşiktaş, İstanbul',
        birthDate: new Date('1985-08-22'),
      },
    ];

    setUsers(demoUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const typeMatch = filter === 'all' || 
      (filter === 'management' && ['admin', 'manager', 'waiter', 'kitchen', 'delivery', 'cashier'].includes(user.role)) ||
      (filter === 'customer' && user.role === 'customer');
    
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    
    return typeMatch && roleMatch;
  });

  const getRoleBadge = (role: UserRole) => {
    const badges: Record<UserRole, { label: string; color: string; icon: string }> = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800', icon: '👨‍💼' },
      manager: { label: 'Müdür', color: 'bg-purple-100 text-purple-800', icon: '👔' },
      waiter: { label: 'Garson', color: 'bg-blue-100 text-blue-800', icon: '👨‍🍳' },
      kitchen: { label: 'Mutfak', color: 'bg-orange-100 text-orange-800', icon: '👩‍🍳' },
      delivery: { label: 'Kurye', color: 'bg-green-100 text-green-800', icon: '🚴' },
      cashier: { label: 'Kasa', color: 'bg-yellow-100 text-yellow-800', icon: '💰' },
      customer: { label: 'Müşteri', color: 'bg-gray-100 text-gray-800', icon: '👤' },
    };
    return badges[role];
  };

  const managementCount = users.filter(u => u.role !== 'customer').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  const handleSaveUser = (newUser: User) => {
    setUsers([...users, newUser]);
    setIsAddingUser(false);
    alert('✅ Kullanıcı başarıyla eklendi!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('✅ Kullanıcı silindi!');
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600 mt-1">Yönetim ekibi ve müşteri kullanıcılarını yönetin</p>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Yeni Kullanıcı
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Kullanıcı</div>
              <div className="text-3xl font-bold mt-1">{users.length}</div>
            </div>
            <FiUsers className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Yönetim Ekibi</div>
              <div className="text-3xl font-bold mt-1">{managementCount}</div>
            </div>
            <FiShield className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Müşteriler</div>
              <div className="text-3xl font-bold mt-1">{customerCount}</div>
            </div>
            <FiUser className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Tümü ({users.length})
            </button>
            <button
              onClick={() => setFilter('management')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'management' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Yönetim Ekibi ({managementCount})
            </button>
            <button
              onClick={() => setFilter('customer')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'customer' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Müşteriler ({customerCount})
            </button>
          </div>

          <div className="flex-1"></div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="manager">Müdür</option>
            <option value="waiter">Garson</option>
            <option value="kitchen">Mutfak</option>
            <option value="delivery">Kurye</option>
            <option value="cashier">Kasa</option>
            <option value="customer">Müşteri</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departman/Bilgi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{user.avatar || '👤'}</div>
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          {user.employeeId && (
                            <div className="text-xs text-gray-400">{user.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.department && <div className="font-medium text-gray-900">{user.department}</div>}
                        {user.workShift && (
                          <div className="text-gray-600 capitalize">Vardiya: {user.workShift}</div>
                        )}
                        {user.membershipLevel && (
                          <div className="text-gray-600">
                            <span className="capitalize">{user.membershipLevel}</span> Üye
                          </div>
                        )}
                        {user.loyaltyPoints !== undefined && (
                          <div className="text-yellow-600 font-medium">{user.loyaltyPoints} Puan</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-gray-600">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Görüntüle">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Düzenle">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <AddUserModal
          onClose={() => setIsAddingUser(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
