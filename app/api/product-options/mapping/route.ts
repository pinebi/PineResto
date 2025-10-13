import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

// Ürün-Seçenek Eşleştirme Kaydet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, optionGroupIds } = body;
    
    if (!productId || !optionGroupIds || !Array.isArray(optionGroupIds)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Önce mevcut eşleştirmeleri sil
    await query(`
      DELETE FROM product_options_mapping WHERE product_id = @productId
    `, { productId });

    // Yeni eşleştirmeleri ekle
    for (const optionGroupId of optionGroupIds) {
      const mappingId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await query(`
        INSERT INTO product_options_mapping (id, product_id, option_group_id)
        VALUES (@id, @productId, @optionGroupId)
      `, { 
        id: mappingId,
        productId, 
        optionGroupId 
      });
    }
    
    return NextResponse.json({ success: true, message: 'Seçenek eşleştirmeleri kaydedildi' });
  } catch (error) {
    console.error('Product Options Mapping POST Error:', error);
    return NextResponse.json({ error: 'Failed to save product options mapping' }, { status: 500 });
  }
}

// Ürüne ait seçenek eşleştirmelerini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const mappings = await query(`
      SELECT pom.id, pom.option_group_id, og.name as option_group_name
      FROM product_options_mapping pom
      INNER JOIN product_option_groups og ON pom.option_group_id = og.id
      WHERE pom.product_id = @productId
    `, { productId });
    
    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Product Options Mapping GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch product options mapping' }, { status: 500 });
  }
}

// Eşleştirme sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await query(`
      DELETE FROM product_options_mapping WHERE product_id = @productId
    `, { productId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product Options Mapping DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete product options mapping' }, { status: 500 });
  }
}

