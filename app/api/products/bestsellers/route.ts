import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    // En çok satan 10 ürünü getir (order_items tablosundan)
    const topProducts = await query(`
      SELECT TOP 10
        p.id,
        p.name,
        p.description,
        p.price,
        p.category_id as categoryId,
        p.image_url as imageUrl,
        p.stock_code as stockCode,
        p.order_index as [order],
        SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.is_active = 1
        AND o.created_at >= DATEADD(day, -90, GETDATE())
      GROUP BY 
        p.id, p.name, p.description, p.price, p.category_id, 
        p.image_url, p.stock_code, p.order_index
      ORDER BY total_sold DESC, p.order_index ASC
    `);

    // Her ürün için seçenekleri yükle (products API'deki gibi)
    const productsWithOptions = await Promise.all(topProducts.map(async (product: any) => {
      try {
        const flavorGroups = await query(`
          SELECT DISTINCT fg.id, fg.name, fg.type, fg.is_required, fg.display_order
          FROM flavor_groups fg
          INNER JOIN product_flavors_mapping pfm ON fg.id = pfm.flavor_group_id
          WHERE pfm.product_id = @productId AND fg.is_active = 1
          ORDER BY fg.display_order
        `, { productId: product.id });

        const options = await Promise.all(flavorGroups.map(async (group: any) => {
          const values = await query(`
            SELECT name as value, price_modifier
            FROM flavor_values
            WHERE flavor_group_id = @groupId AND is_active = 1
            ORDER BY display_order
          `, { groupId: group.id });

          return {
            id: group.id,
            name: group.name,
            type: group.type,
            isRequired: group.is_required,
            values: values.map((v: any) => ({
              name: v.value,
              priceModifier: v.price_modifier
            }))
          };
        }));

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          stockCode: product.stockCode,
          order: product.order || 0,
          isActive: true,
          options: options
        };
      } catch (error) {
        console.error(`Error loading options for product ${product.id}:`, error);
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          stockCode: product.stockCode,
          order: product.order || 0,
          isActive: true,
          options: []
        };
      }
    }));

    return NextResponse.json(productsWithOptions);
  } catch (error) {
    console.error('Best Sellers API Error:', error);
    // Hata durumunda boş array döndür
    return NextResponse.json([]);
  }
}

