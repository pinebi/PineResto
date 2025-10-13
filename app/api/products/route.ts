import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const products = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.order_index, p.name
    `);
    
    // Her ürün için seçenekleri yükle
    const productsWithOptions = await Promise.all(products.map(async (product: any) => {
      try {
        // Ürüne bağlı seçenek gruplarını getir
        const flavorGroups = await query(`
          SELECT DISTINCT fg.id, fg.name, fg.type, fg.is_required, fg.display_order
          FROM flavor_groups fg
          INNER JOIN product_flavors_mapping pfm ON fg.id = pfm.flavor_group_id
          WHERE pfm.product_id = @productId AND fg.is_active = 1
          ORDER BY fg.display_order
        `, { productId: product.id });

        // Her çeşni grubu için değerleri getir
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
            description: null, // TEXT kolonunu kaldırdık
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
          description: product.description,
          price: product.price,
          purchasePrice: product.purchase_price,
          categoryId: product.category_id,
          categoryName: product.category_name,
          brandId: product.brand_id,
          stockCode: product.stock_code,
          stock: product.stock,
          imageUrl: product.image_url,
          printerId: product.printer_id,
          isActive: product.is_active,
          order: product.order_index,
          options: options
        };
      } catch (optionError) {
        console.error(`Error loading options for product ${product.id}:`, optionError);
        // Hata olursa ürünü seçeneksiz döndür
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          purchasePrice: product.purchase_price,
          categoryId: product.category_id,
          categoryName: product.category_name,
          brandId: product.brand_id,
          stockCode: product.stock_code,
          stock: product.stock,
          imageUrl: product.image_url,
          printerId: product.printer_id,
          isActive: product.is_active,
          order: product.order_index,
          options: []
        };
      }
    }));
    
    return NextResponse.json(productsWithOptions);
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, purchasePrice, categoryId, stockCode, stock, imageUrl, printerId, order, isActive } = body;
    
    const id = `prod-${Date.now()}`;
    
    await query(`
      INSERT INTO products (id, name, description, price, purchase_price, category_id, stock_code, stock, image_url, printer_id, is_active, order_index)
      VALUES (@id, @name, @description, @price, @purchasePrice, @categoryId, @stockCode, @stock, @imageUrl, @printerId, @isActive, @order)
    `, { 
      id, 
      name, 
      description, 
      price, 
      purchasePrice: purchasePrice || 0, 
      categoryId, 
      stockCode: stockCode || id, 
      stock: stock || 0, 
      imageUrl, 
      printerId: printerId || null,
      isActive: isActive ? 1 : 0,
      order: order || 999 
    });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, purchasePrice, categoryId, stockCode, stock, imageUrl, printerId, order, isActive } = body;
    
    await query(`
      UPDATE products 
      SET name = @name, 
          description = @description, 
          price = @price, 
          purchase_price = @purchasePrice,
          category_id = @categoryId,
          stock_code = @stockCode,
          stock = @stock,
          image_url = @imageUrl,
          printer_id = @printerId,
          is_active = @isActive,
          order_index = @order
      WHERE id = @id
    `, { 
      id,
      name, 
      description, 
      price, 
      purchasePrice: purchasePrice || 0, 
      categoryId, 
      stockCode: stockCode || id, 
      stock: stock || 0, 
      imageUrl, 
      printerId: printerId || null,
      isActive: isActive ? 1 : 0,
      order: order || 999 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Product Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    await query(`DELETE FROM products WHERE id = @id`, { id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
