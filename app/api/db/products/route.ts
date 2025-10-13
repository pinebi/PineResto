import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query<any>(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.purchase_price as purchasePrice,
        p.category_id as categoryId,
        p.brand_id as brandId,
        p.stock_code as stockCode,
        p.stock,
        p.image_url as imageUrl,
        p.is_active as isActive,
        p.is_new_product as isNewProduct,
        p.is_fast_shipping as isFastShipping,
        p.is_showcase as isShowcase,
        p.order_index as \`order\`,
        p.source,
        p.updated_at as updatedAt
      FROM products p
      WHERE p.is_active = TRUE
      ORDER BY p.order_index ASC
    `);

    // Her ürün için seçenekleri getir
    const products = await Promise.all(rows.map(async (row) => {
      const options = await query<any>(`
        SELECT 
          og.id,
          og.name,
          og.is_required as isRequired,
          GROUP_CONCAT(ov.name ORDER BY ov.order_index) as values
        FROM product_options_mapping pom
        JOIN product_option_groups og ON pom.option_group_id = og.id
        LEFT JOIN product_option_values ov ON ov.group_id = og.id
        WHERE pom.product_id = ?
        GROUP BY og.id, og.name, og.is_required
      `, [row.id]);

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        purchasePrice: row.purchasePrice ? parseFloat(row.purchasePrice) : undefined,
        categoryId: row.categoryId,
        brandId: row.brandId,
        stockCode: row.stockCode,
        stock: row.stock,
        imageUrl: row.imageUrl,
        isActive: Boolean(row.isActive),
        isNewProduct: Boolean(row.isNewProduct),
        isFastShipping: Boolean(row.isFastShipping),
        isShowcase: Boolean(row.isShowcase),
        order: row.order,
        source: row.source,
        updatedAt: row.updatedAt,
        options: options.map(opt => ({
          id: opt.id,
          name: opt.name,
          required: Boolean(opt.isRequired),
          values: opt.values ? opt.values.split(',') : []
        }))
      };
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = `prod-${Date.now()}`;
    
    await query(`
      INSERT INTO products (
        id, name, description, price, purchase_price, category_id, 
        brand_id, stock_code, stock, image_url, is_active, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, 
      data.name, 
      data.description, 
      data.price, 
      data.purchasePrice || null,
      data.categoryId, 
      data.brandId || null, 
      data.stockCode || null, 
      data.stock || 0, 
      data.imageUrl || null, 
      true, 
      data.order || 0
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Product Create Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}






