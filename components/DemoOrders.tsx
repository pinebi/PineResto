'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Order, CartItem } from '@/types';

export default function AddDemoOrders() {
  const { orders, setOrders, products } = useStore();
  
  console.log('DemoOrders - Products:', products.length, 'Orders:', orders.length);

  useEffect(() => {
    // Add demo orders immediately if products exist and no orders
    if (products.length > 0 && orders.length === 0) {
      console.log('Adding demo orders...');
      const demoOrders: Order[] = [
        {
          id: '1',
          items: [
            { product: products[0], quantity: 2, selectedOptions: { 'Acılık Derecesi': 'Normal' } },
            { product: products[1], quantity: 1, selectedOptions: { 'Şeker': 'Az Şekerli' } }
          ],
          total: 190.00,
          status: 'completed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          orderNumber: 1001,
          orderType: 'kiosk',
          customerInfo: { name: 'Masa 3', tableNumber: '3' },
          paymentMethod: 'cash',
          estimatedTime: 25
        },
        {
          id: '2',
          items: [
            { product: products[1], quantity: 1, selectedOptions: { 'Şeker': 'Şekersiz' } },
            { product: products[2], quantity: 1 }
          ],
          total: 105.00,
          status: 'ready',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          orderNumber: 1002,
          orderType: 'online',
          customerInfo: { 
            name: 'Ahmet Yılmaz', 
            phone: '+90 555 123 4567',
            address: 'İstanbul, Kadıköy'
          },
          paymentMethod: 'card',
          estimatedTime: 20
        },
        {
          id: '3',
          items: [
            { product: products[0], quantity: 1 },
            { product: products[3], quantity: 2 }
          ],
          total: 125.00,
          status: 'preparing',
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
          orderNumber: 1003,
          orderType: 'kiosk',
          customerInfo: { name: 'Masa 7', tableNumber: '7' },
          paymentMethod: 'cash',
          estimatedTime: 18
        },
        {
          id: '4',
          items: [
            { product: products[2], quantity: 1 },
            { product: products[4], quantity: 1 }
          ],
          total: 75.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
          orderNumber: 1004,
          orderType: 'online',
          customerInfo: { 
            name: 'Fatma Demir', 
            phone: '+90 555 987 6543',
            address: 'Ankara, Çankaya'
          },
          paymentMethod: 'online',
          estimatedTime: 15
        },
        {
          id: '5',
          items: [
            { product: products[1], quantity: 3, selectedOptions: { 'Şeker': 'Normal' } },
            { product: products[0], quantity: 1 }
          ],
          total: 115.00,
          status: 'completed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
          orderNumber: 1005,
          orderType: 'kiosk',
          customerInfo: { name: 'Masa 2', tableNumber: '2' },
          paymentMethod: 'card',
          estimatedTime: 22
        },
        {
          id: '6',
          items: [
            { product: products[3], quantity: 1 },
            { product: products[4], quantity: 2 }
          ],
          total: 85.00,
          status: 'preparing',
          createdAt: new Date(Date.now() - 1000 * 60 * 45),
          orderNumber: 1006,
          orderType: 'online',
          customerInfo: { 
            name: 'Mehmet Kaya', 
            phone: '+90 555 456 7890',
            address: 'İzmir, Konak'
          },
          paymentMethod: 'card',
          estimatedTime: 20
        },
        {
          id: '7',
          items: [
            { product: products[0], quantity: 2, selectedOptions: { 'Acılık Derecesi': 'Çok Acılı' } },
            { product: products[2], quantity: 1 }
          ],
          total: 195.00,
          status: 'ready',
          createdAt: new Date(Date.now() - 1000 * 60 * 25),
          orderNumber: 1007,
          orderType: 'kiosk',
          customerInfo: { name: 'Masa 5', tableNumber: '5' },
          paymentMethod: 'cash',
          estimatedTime: 25
        },
        {
          id: '8',
          items: [
            { product: products[1], quantity: 2, selectedOptions: { 'Şeker': 'Az Şekerli' } },
            { product: products[4], quantity: 1 }
          ],
          total: 35.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 10),
          orderNumber: 1008,
          orderType: 'online',
          customerInfo: { 
            name: 'Ayşe Özkan', 
            phone: '+90 555 789 0123',
            address: 'Bursa, Osmangazi'
          },
          paymentMethod: 'online',
          estimatedTime: 12
        },
        {
          id: '9',
          items: [
            { product: products[2], quantity: 1 },
            { product: products[3], quantity: 3 }
          ],
          total: 175.00,
          status: 'completed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
          orderNumber: 1009,
          orderType: 'kiosk',
          customerInfo: { name: 'Masa 1', tableNumber: '1' },
          paymentMethod: 'card',
          estimatedTime: 30
        },
        {
          id: '10',
          items: [
            { product: products[0], quantity: 1, selectedOptions: { 'Acılık Derecesi': 'Az Acılı' } },
            { product: products[1], quantity: 1, selectedOptions: { 'Şeker': 'Normal' } },
            { product: products[4], quantity: 2 }
          ],
          total: 120.00,
          status: 'preparing',
          createdAt: new Date(Date.now() - 1000 * 60 * 35),
          orderNumber: 1010,
          orderType: 'online',
          customerInfo: { 
            name: 'Zeynep Arslan', 
            phone: '+90 555 321 0987',
            address: 'Antalya, Muratpaşa'
          },
          paymentMethod: 'card',
          estimatedTime: 22
        }
      ];

      setOrders(demoOrders);
      console.log('✅ 10 demo sipariş başarıyla eklendi!');
      console.log('📊 Toplam sipariş sayısı:', demoOrders.length);
    }
  }, [products, orders, setOrders]);

  return null;
}