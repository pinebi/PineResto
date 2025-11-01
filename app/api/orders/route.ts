import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// GET - Tüm siparişleri getir
export async function GET(request: NextRequest) {
  let pool;
  try {
    pool = await sql.connect(config);
    
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.table_id,
        o.order_type,
        o.total_amount,
        o.final_amount,
        o.status,
        o.payment_method,
        o.notes,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE 1=1
    `;
    
    if (tableId) {
      query += ` AND o.table_id = '${tableId}'`;
    }
    
    if (status) {
      query += ` AND o.status = '${status}'`;
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await pool.query(query);
    
    // Her sipariş için ürünleri de getir
    const ordersWithItems = [];
    for (const order of result.recordset) {
      const itemsResult = await pool.query`
        SELECT 
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          notes
        FROM order_items 
        WHERE order_id = ${order.id}
      `;
      
      ordersWithItems.push({
        ...order,
        items: itemsResult.recordset
      });
    }
    
    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// POST - Yeni sipariş oluştur
export async function POST(request: NextRequest) {
  let pool;
  try {
    const body = await request.json();
    const {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      tableNumber,
      tableId,
      orderType,
      items,
      totalAmount,
      paymentMethod,
      notes
    } = body;

    console.log('Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Database connected successfully');

    // Test connection with a simple query first
    const testResult = await pool.query`SELECT COUNT(*) as count FROM orders`;
    console.log('✅ Test query successful, orders count:', testResult.recordset[0].count);

    // Sipariş oluştur
    console.log('Creating order with data:', { orderNumber, orderType, totalAmount });
    
    const orderResult = await pool.query`
      INSERT INTO orders (
        customer_name,
        customer_phone,
        customer_address,
        table_id,
        order_type,
        total_amount,
        final_amount,
        payment_method,
        notes,
        status
      ) 
      OUTPUT INSERTED.id, INSERTED.order_number
      VALUES (
        ${customerName || null},
        ${customerPhone || null},
        ${customerAddress || null},
        ${tableId || tableNumber || null},
        ${orderType || 'kiosk'},
        ${totalAmount},
        ${totalAmount},
        ${paymentMethod || null},
        ${notes || null},
        'pending'
      )
    `;

    console.log('✅ Order created successfully:', orderResult.recordset);
    const order = orderResult.recordset[0];
    const orderId = order.id;

    // Sipariş kalemlerini ekle
    console.log('Adding order items:', items.length);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Adding item ${i + 1}:`, item.product.name);
      
      await pool.query`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          unit_price,
          total_price,
          quantity,
          notes
        )
        VALUES (
          ${orderId},
          ${item.product.id},
          ${item.product.name},
          ${item.product.price},
          ${item.product.price * item.quantity},
          ${item.quantity},
          ${item.notes || null}
        )
      `;
    }

    console.log('✅ All order items added successfully');

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber: order.order_number,
        message: 'Sipariş başarıyla oluşturuldu'
      }
    });

  } catch (error) {
    console.error('Orders POST error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message
    }, { status: 500 });
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}