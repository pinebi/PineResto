import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query<any>(`
      SELECT 
        id,
        name,
        description,
        parent_id as parentId,
        order_index as \`order\`,
        icon,
        image_url as imageUrl,
        is_active as isActive
      FROM categories
      WHERE is_active = TRUE
      ORDER BY order_index ASC
    `);

    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parentId,
      order: row.order,
      imageUrl: row.icon || row.imageUrl,
      isActive: Boolean(row.isActive),
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = `cat-${Date.now()}`;
    
    await query(`
      INSERT INTO categories (id, name, description, parent_id, icon, is_active, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.name, data.description || null, data.parentId || null, data.icon || null, true, data.order || 0]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Category Create Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}











