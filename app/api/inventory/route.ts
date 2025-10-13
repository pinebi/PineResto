import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const inventory = await query(`
      SELECT i.*, s.name as supplier_name
      FROM inventory_items i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      ORDER BY i.name
    `);
    
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Inventory API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id } = body;
    
    const id = `inv-${Date.now()}`;
    
    await query(`
      INSERT INTO inventory_items (id, name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id)
      VALUES (@id, @name, @category, @current_stock, @min_stock, @max_stock, @unit, @unit_price, @supplier_id)
    `, { id, name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Inventory Item Error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}






