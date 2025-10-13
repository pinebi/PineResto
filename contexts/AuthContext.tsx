'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: Permission['module'], action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Varsayılan izin şablonları
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { module: 'dashboard', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'catalog', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'tables', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'customers', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'reports', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'inventory', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'users', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'settings', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'mobile-waiter', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'mobile-kitchen', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'mobile-delivery', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'qr-codes', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'customization', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { module: 'ai', canView: true, canCreate: true, canEdit: true, canDelete: true },
  ],
  manager: [
    { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'catalog', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'tables', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'customers', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'reports', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'inventory', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'users', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { module: 'settings', canView: true, canCreate: false, canEdit: true, canDelete: false },
  ],
  waiter: [
    { module: 'mobile-waiter', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'tables', canView: true, canCreate: false, canEdit: true, canDelete: false },
  ],
  kitchen: [
    { module: 'mobile-kitchen', canView: true, canCreate: false, canEdit: true, canDelete: false },
    { module: 'orders', canView: true, canCreate: false, canEdit: true, canDelete: false },
  ],
  delivery: [
    { module: 'mobile-delivery', canView: true, canCreate: false, canEdit: true, canDelete: false },
    { module: 'orders', canView: true, canCreate: false, canEdit: true, canDelete: false },
  ],
  cashier: [
    { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { module: 'tables', canView: true, canCreate: false, canEdit: true, canDelete: false },
    { module: 'reports', canView: true, canCreate: false, canEdit: false, canDelete: false },
  ],
  customer: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // LocalStorage'dan kullanıcıyı yükle
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Demo kullanıcılar
    const demoUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@restaurant.com',
        fullName: 'Admin Kullanıcı',
        phone: '0532 000 0001',
        role: 'admin',
        permissions: rolePermissions.admin,
        isActive: true,
        avatar: '👨‍💼',
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: 'EMP-001',
        department: 'Yönetim',
      },
      {
        id: '2',
        username: 'garson1',
        email: 'ahmet@restaurant.com',
        fullName: 'Ahmet Yılmaz',
        phone: '0532 111 2222',
        role: 'waiter',
        permissions: rolePermissions.waiter,
        isActive: true,
        avatar: '👨‍🍳',
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: 'EMP-002',
        department: 'Servis',
        workShift: 'morning',
        hireDate: new Date('2023-01-15'),
        salary: 15000,
      },
      {
        id: '3',
        username: 'mutfak1',
        email: 'fatma@restaurant.com',
        fullName: 'Fatma Demir',
        phone: '0532 333 4444',
        role: 'kitchen',
        permissions: rolePermissions.kitchen,
        isActive: true,
        avatar: '👩‍🍳',
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: 'EMP-003',
        department: 'Mutfak',
        workShift: 'afternoon',
        hireDate: new Date('2023-03-20'),
        salary: 18000,
      },
      {
        id: '4',
        username: 'kurye1',
        email: 'mehmet@restaurant.com',
        fullName: 'Mehmet Kaya',
        phone: '0532 555 6666',
        role: 'delivery',
        permissions: rolePermissions.delivery,
        isActive: true,
        avatar: '🚴',
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: 'EMP-004',
        department: 'Teslimat',
        workShift: 'evening',
        hireDate: new Date('2023-06-10'),
        salary: 16000,
      },
      {
        id: '5',
        username: 'kasa1',
        email: 'ayse@restaurant.com',
        fullName: 'Ayşe Şahin',
        phone: '0532 777 8888',
        role: 'cashier',
        permissions: rolePermissions.cashier,
        isActive: true,
        avatar: '💰',
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: 'EMP-005',
        department: 'Kasa',
        workShift: 'afternoon',
        hireDate: new Date('2023-02-28'),
        salary: 14000,
      },
    ];

    // Basit auth - gerçek uygulamada API çağrısı yapılmalı
    const foundUser = demoUsers.find(u => u.username === username && password === '12345');
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (module: Permission['module'], action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user) return false;
    
    const permission = user.permissions.find(p => p.module === module);
    if (!permission) return false;

    switch (action) {
      case 'view': return permission.canView;
      case 'create': return permission.canCreate;
      case 'edit': return permission.canEdit;
      case 'delete': return permission.canDelete;
      default: return false;
    }
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}






