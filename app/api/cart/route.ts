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

// GET - Sepeti getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const orderType = searchParams.get('orderType') || 'kiosk';

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await sql.connect(config);

    const result = await sql.query`
      SELECT 
        c.id,
        c.session_id,
        c.product_id,
        c.product_name,
        c.product_price,
        c.quantity,
        c.notes,
        c.order_type,
        c.created_at,
        c.updated_at
      FROM cart c
      WHERE c.session_id = ${sessionId} 
        AND c.order_type = ${orderType}
        AND c.is_active = 1
      ORDER BY c.created_at ASC
    `;

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  } finally {
    await sql.close();
  }
}

// POST - Sepete ürün ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, product, quantity, notes, orderType } = body;

    if (!sessionId || !product || !quantity) {
      return NextResponse.json({ error: 'Session ID, product, and quantity are required' }, { status: 400 });
    }

    await sql.connect(config);

    // Aynı ürün zaten sepette var mı kontrol et
    const existingItem = await sql.query`
      SELECT id, quantity FROM cart 
      WHERE session_id = ${sessionId} 
        AND product_id = ${product.id}
        AND order_type = ${orderType || 'kiosk'}
        AND is_active = 1
    `;

    if (existingItem.recordset.length > 0) {
      // Mevcut ürünün miktarını güncelle
      const newQuantity = existingItem.recordset[0].quantity + quantity;
      await sql.query`
        UPDATE cart 
        SET quantity = ${newQuantity}, 
            updated_at = GETDATE(),
            notes = ${notes || null}
        WHERE id = ${existingItem.recordset[0].id}
      `;
    } else {
      // Yeni ürün ekle
      await sql.query`
        INSERT INTO cart (
          session_id,
          product_id,
          product_name,
          product_price,
          quantity,
          notes,
          order_type
        )
        VALUES (
          ${sessionId},
          ${product.id},
          ${product.name},
          ${product.price},
          ${quantity},
          ${notes || null},
          ${orderType || 'kiosk'}
        )
      `;
    }

    return NextResponse.json({ success: true, message: 'Product added to cart' });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to add product to cart' }, { status: 500 });
  } finally {
    await sql.close();
  }
}

// PUT - Sepetteki ürünü güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId, quantity, notes, orderType } = body;

    if (!sessionId || !productId || quantity === undefined) {
      return NextResponse.json({ error: 'Session ID, product ID, and quantity are required' }, { status: 400 });
    }

    await sql.connect(config);

    if (quantity <= 0) {
      // Ürünü sepetten kaldır
      await sql.query`
        UPDATE cart 
        SET is_active = 0, updated_at = GETDATE()
        WHERE session_id = ${sessionId} 
          AND product_id = ${productId}
          AND order_type = ${orderType || 'kiosk'}
          AND is_active = 1
      `;
    } else {
      // Ürün miktarını güncelle
      await sql.query`
        UPDATE cart 
        SET quantity = ${quantity}, 
            updated_at = GETDATE(),
            notes = ${notes || null}
        WHERE session_id = ${sessionId} 
          AND product_id = ${productId}
          AND order_type = ${orderType || 'kiosk'}
          AND is_active = 1
      `;
    }

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  } finally {
    await sql.close();
  }
}

// DELETE - Sepeti temizle
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const orderType = searchParams.get('orderType') || 'kiosk';

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await sql.connect(config);

    await sql.query`
      UPDATE cart 
      SET is_active = 0, updated_at = GETDATE()
      WHERE session_id = ${sessionId} 
        AND order_type = ${orderType}
        AND is_active = 1
    `;

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  } finally {
    await sql.close();
  }
}



