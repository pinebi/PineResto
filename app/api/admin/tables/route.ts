import { NextResponse } from 'next/server';

interface TableInfo {
  name: string;
  columns: number;
  rows: number;
  size: string;
  lastModified: string;
}

// Demo data for database tables
const demoTables: TableInfo[] = [
  { name: 'users', columns: 8, rows: 1500, size: '1.2 MB', lastModified: '2023-10-20T10:00:00Z' },
  { name: 'products', columns: 12, rows: 5000, size: '5.8 MB', lastModified: '2023-10-20T11:30:00Z' },
  { name: 'orders', columns: 10, rows: 25000, size: '20.1 MB', lastModified: '2023-10-20T14:45:00Z' },
  { name: 'order_items', columns: 5, rows: 75000, size: '30.5 MB', lastModified: '2023-10-20T14:45:00Z' },
  { name: 'tables', columns: 4, rows: 50, size: '0.1 MB', lastModified: '2023-10-19T09:00:00Z' },
  { name: 'table_sessions', columns: 9, rows: 1200, size: '1.5 MB', lastModified: '2023-10-20T16:00:00Z' },
  { name: 'customers', columns: 7, rows: 3000, size: '2.3 MB', lastModified: '2023-10-18T17:00:00Z' },
  { name: 'payments', columns: 6, rows: 20000, size: '10.2 MB', lastModified: '2023-10-20T15:30:00Z' },
  { name: 'inventory', columns: 7, rows: 1000, size: '0.8 MB', lastModified: '2023-10-17T10:00:00Z' },
  { name: 'suppliers', columns: 5, rows: 100, size: '0.05 MB', lastModified: '2023-10-16T11:00:00Z' },
  { name: 'promotions', columns: 6, rows: 20, size: '0.02 MB', lastModified: '2023-10-15T12:00:00Z' },
  { name: 'system_settings', columns: 3, rows: 10, size: '0.01 MB', lastModified: '2023-10-14T13:00:00Z' },
];

// Demo data for table content
const demoTableData: { [key: string]: any[] } = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
    { id: 2, username: 'john.doe', email: 'john@example.com', role: 'waiter' },
  ],
  products: [
    { id: 101, name: 'Burger', price: 50, stock: 100 },
    { id: 102, name: 'Pizza', price: 80, stock: 50 },
  ],
  orders: [
    { id: 1001, customerId: 1, total: 130, status: 'completed' },
    { id: 1002, customerId: 2, total: 75, status: 'pending' },
  ],
  order_items: [
    { id: 1, orderId: 1001, productId: 101, quantity: 2, unitPrice: 50 },
    { id: 2, orderId: 1001, productId: 102, quantity: 1, unitPrice: 80 },
  ],
  tables: [
    { id: 1, tableNumber: '1', capacity: 4, status: 'occupied' },
    { id: 2, tableNumber: '2', capacity: 2, status: 'available' },
  ],
  table_sessions: [
    { id: 1, tableId: 1, waiterId: 2, startTime: '2023-10-20T10:00:00Z', status: 'active' },
    { id: 2, tableId: 2, waiterId: 2, startTime: '2023-10-20T11:00:00Z', status: 'completed' },
  ],
  customers: [
    { id: 1, fullName: 'Ahmet Yılmaz', phone: '05551234567', email: 'ahmet@example.com' },
    { id: 2, fullName: 'Fatma Demir', phone: '05559876543', email: 'fatma@example.com' },
  ],
  payments: [
    { id: 1, orderId: 1001, paymentMethod: 'card', amount: 130, status: 'completed' },
    { id: 2, orderId: 1002, paymentMethod: 'cash', amount: 75, status: 'pending' },
  ],
  inventory: [
    { id: 1, productId: 101, quantity: 100, unitCost: 25 },
    { id: 2, productId: 102, quantity: 50, unitCost: 40 },
  ],
  suppliers: [
    { id: 1, name: 'ABC Gıda', contactPerson: 'Mehmet Ali', phone: '02121234567' },
    { id: 2, name: 'XYZ Market', contactPerson: 'Ayşe Kaya', phone: '02129876543' },
  ],
  promotions: [
    { id: 1, name: 'Yeni Müşteri İndirimi', discountType: 'percentage', discountValue: 10 },
    { id: 2, name: 'Hafta Sonu Özel', discountType: 'fixed_amount', discountValue: 20 },
  ],
  system_settings: [
    { id: 1, settingKey: 'restaurant_name', settingValue: 'Pine Resto' },
    { id: 2, settingKey: 'currency', settingValue: 'TL' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');

  if (tableName) {
    // Simulate fetching data for a specific table
    const data = demoTableData[tableName] || [];
    return NextResponse.json(data);
  }

  // Simulate fetching list of all tables
  return NextResponse.json(demoTables);
}





