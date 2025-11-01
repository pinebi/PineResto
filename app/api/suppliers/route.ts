import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const suppliers = await query(`
      SELECT * FROM suppliers 
      WHERE is_active = 1
      ORDER BY name
    `);
    
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Suppliers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact_person, email, phone, address, is_active } = body;
    
    const id = `sup-${Date.now()}`;
    
    await query(`
      INSERT INTO suppliers (id, name, contact_person, email, phone, address, is_active)
      VALUES (@id, @name, @contact_person, @email, @phone, @address, @is_active)
    `, { id, name, contact_person, email, phone, address, is_active });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Supplier Error:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}











