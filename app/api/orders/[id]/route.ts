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

// GET - Belirli bir siparişin detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let pool;
  try {
    const orderId = params.id;
    
    pool = await sql.connect(config);
    
    // Sipariş bilgilerini getir
    const orderResult = await pool.query`
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
      WHERE o.id = ${orderId}
    `;

    if (orderResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult.recordset[0];

    // Sipariş kalemlerini getir
    const itemsResult = await pool.query`
      SELECT 
        oi.id,
        oi.product_id,
        oi.product_name,
        oi.unit_price,
        oi.total_price,
        oi.quantity,
        oi.notes,
        oi.created_at
      FROM order_items oi
      WHERE oi.order_id = ${orderId}
      ORDER BY oi.created_at
    `;

    const orderWithItems = {
      ...order,
      items: itemsResult.recordset
    };

    return NextResponse.json(orderWithItems);

  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// PUT - Sipariş durumunu veya kalemlerini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let pool;
  try {
    const orderId = params.id;
    const body = await request.json();
    const { status, notes, items, totalAmount } = body;
    
    pool = await sql.connect(config);
    
    if (items && totalAmount) {
      // Sipariş kalemlerini güncelle
      
      // Önce mevcut kalemleri sil
      await pool.query`
        DELETE FROM order_items WHERE order_id = ${orderId}
      `;
      
      // Yeni kalemleri ekle
      for (const item of items) {
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
      
      // Sipariş toplamını güncelle
      await pool.query`
        UPDATE orders 
        SET 
          total_amount = ${totalAmount},
          final_amount = ${totalAmount},
          notes = ${notes || null},
          updated_at = GETDATE()
        WHERE id = ${orderId} AND is_active = 1
      `;
      
      return NextResponse.json({
        success: true,
        message: 'Sipariş kalemleri güncellendi'
      });
      
    } else {
      // Sadece durum güncelle
      const result = await pool.query`
        UPDATE orders 
        SET 
          status = ${status || 'pending'},
          notes = ${notes || null},
          updated_at = GETDATE()
        WHERE id = ${orderId} AND is_active = 1
        OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.status
      `;

      if (result.recordset.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: result.recordset[0],
        message: 'Sipariş durumu güncellendi'
      });
    }

  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
