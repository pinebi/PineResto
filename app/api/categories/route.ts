import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const categories = await query(`
      SELECT * FROM categories 
      WHERE is_active = 1 
      ORDER BY order_index, name
    `);
    
    // Convert snake_case to camelCase for frontend
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parent_id,
      order: category.order_index,
      imageUrl: category.icon || category.image_url, // Use icon as imageUrl for backward compatibility
      printerId: category.printer_id,
      isActive: category.is_active,
    }));
    
    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, parentId, imageUrl, printerId, order, isActive } = body;
    
    const id = `cat-${Date.now()}`;
    
    await query(`
      INSERT INTO categories (id, name, description, parent_id, image_url, printer_id, is_active, order_index)
      VALUES (@id, @name, @description, @parentId, @imageUrl, @printerId, @isActive, @order)
    `, { 
      id, 
      name, 
      description: description || '', 
      parentId: parentId || null, 
      imageUrl: imageUrl || null, 
      printerId: printerId || null,
      isActive: isActive ? 1 : 0,
      order: order || 999
    });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Category Error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, parentId, imageUrl, printerId, order, isActive } = body;
    
    await query(`
      UPDATE categories 
      SET name = @name, 
          description = @description, 
          parent_id = @parentId,
          image_url = @imageUrl,
          printer_id = @printerId,
          is_active = @isActive,
          order_index = @order
      WHERE id = @id
    `, { 
      id,
      name, 
      description: description || '', 
      parentId: parentId || null, 
      imageUrl: imageUrl || null, 
      printerId: printerId || null,
      isActive: isActive ? 1 : 0,
      order: order || 999
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Category Error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    await query(`DELETE FROM categories WHERE id = @id`, { id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
