import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    let sql = `
      SELECT 
        o.id,
        o.order_number as orderNumber,
        o.order_type as orderType,
        o.status,
        o.total_amount as totalAmount,
        o.tax_amount as taxAmount,
        o.final_amount as finalAmount,
        o.table_id as tableId,
        o.customer_name as customerName,
        o.customer_phone as customerPhone,
        o.payment_method as paymentMethod,
        o.payment_status as paymentStatus,
        o.estimated_time as estimatedTime,
        o.notes,
        o.created_at as createdAt,
        t.number as tableNumber
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    if (type) {
      sql += ' AND o.order_type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY o.created_at DESC LIMIT 100';
    
    const orders = await query<any>(sql, params);

    // Her sipariş için ürünleri getir
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await query<any>(`
        SELECT 
          oi.id,
          oi.product_id as productId,
          oi.product_name as productName,
          oi.quantity,
          oi.unit_price as unitPrice,
          oi.total_price as totalPrice,
          oi.notes,
          p.image_url as imageUrl
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      return {
        ...order,
        items: items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
          price: parseFloat(item.unitPrice),
          total: parseFloat(item.totalPrice),
          notes: item.notes,
          imageUrl: item.imageUrl
        }))
      };
    }));

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Orders API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const result = await transaction(async (conn) => {
      const orderId = `ord-${Date.now()}`;
      const orderNumber = Date.now() % 10000;
      
      // Sipariş oluştur
      await conn.execute(`
        INSERT INTO orders (
          id, order_number, order_type, status, total_amount, tax_amount, 
          final_amount, table_id, customer_name, customer_phone, 
          payment_method, estimated_time, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        orderNumber,
        data.orderType,
        'pending',
        data.totalAmount,
        data.taxAmount || 0,
        data.finalAmount,
        data.tableId || null,
        data.customerName || null,
        data.customerPhone || null,
        data.paymentMethod || 'cash',
        data.estimatedTime || 15,
        data.notes || null
      ]);

      // Sipariş ürünlerini ekle
      for (const item of data.items) {
        const itemId = `item-${Date.now()}-${Math.random()}`;
        await conn.execute(`
          INSERT INTO order_items (
            id, order_id, product_id, product_name, quantity, unit_price, total_price, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          itemId,
          orderId,
          item.productId,
          item.name,
          item.quantity,
          item.price,
          item.price * item.quantity,
          item.notes || null
        ]);
      }

      return { orderId, orderNumber };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Order Create Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}











