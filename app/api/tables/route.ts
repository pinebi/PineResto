import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const tables = await query(`
      SELECT * FROM [tables] 
      ORDER BY number
    `);
    
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Tables API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { number, capacity, shape, position_x, position_y, status } = body;
    
    const id = `table-${Date.now()}`;
    
    await query(`
      INSERT INTO [tables] (id, number, capacity, shape, position_x, position_y, status)
      VALUES (@id, @number, @capacity, @shape, @position_x, @position_y, @status)
    `, { id, number, capacity, shape, position_x, position_y, status });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Table Error:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, position_x, position_y } = body;
    
    await query(`
      UPDATE [tables] 
      SET position_x = @position_x, position_y = @position_y
      WHERE id = @id
    `, { id, position_x, position_y });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Table Error:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}






