import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const promotions = await query(`
      SELECT * FROM promotions 
      WHERE is_active = 1 AND (end_date IS NULL OR end_date > GETDATE())
      ORDER BY start_date DESC
    `);
    
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Promotions API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, discount_type, discount_value, start_date, end_date, is_active } = body;
    
    const id = `promo-${Date.now()}`;
    
    await query(`
      INSERT INTO promotions (id, name, description, discount_type, discount_value, start_date, end_date, is_active)
      VALUES (@id, @name, @description, @discount_type, @discount_value, @start_date, @end_date, @is_active)
    `, { id, name, description, discount_type, discount_value, start_date, end_date, is_active });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Promotion Error:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}











