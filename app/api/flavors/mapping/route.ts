import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

// Ürün-Çeşni Eşleştirme Kaydet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, flavorGroupIds } = body;
    
    if (!productId || !flavorGroupIds || !Array.isArray(flavorGroupIds)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Önce mevcut eşleştirmeleri sil
    await query(`
      DELETE FROM product_flavors_mapping WHERE product_id = @productId
    `, { productId: productId });

    // Yeni eşleştirmeleri ekle
    for (const flavorGroupId of flavorGroupIds) {
      const mappingId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await query(`
        INSERT INTO product_flavors_mapping (id, product_id, flavor_group_id)
        VALUES (@id, @productId, @flavorGroupId)
      `, { 
        id: mappingId,
        productId: productId, 
        flavorGroupId: flavorGroupId 
      });
    }
    
    return NextResponse.json({ success: true, message: 'Çeşni eşleştirmeleri kaydedildi' });
  } catch (error) {
    console.error('Flavors Mapping POST Error:', error);
    return NextResponse.json({ error: 'Failed to save flavor mapping' }, { status: 500 });
  }
}

// Ürüne ait çeşni eşleştirmelerini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const mappings = await query(`
      SELECT pfm.id, pfm.flavor_group_id, fg.name as flavor_group_name
      FROM product_flavors_mapping pfm
      INNER JOIN flavor_groups fg ON pfm.flavor_group_id = fg.id
      WHERE pfm.product_id = @productId
    `, { productId });
    
    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Flavors Mapping GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch flavor mapping' }, { status: 500 });
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
      DELETE FROM product_flavors_mapping WHERE product_id = @productId
    `, { productId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flavors Mapping DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete flavor mapping' }, { status: 500 });
  }
}
