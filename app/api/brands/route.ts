import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const brands = await query(`
      SELECT * FROM brands 
      WHERE is_active = 1
      ORDER BY name
    `);
    
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, logo_url, website, is_active } = body;
    
    const id = `brand-${Date.now()}`;
    
    await query(`
      INSERT INTO brands (id, name, description, logo_url, website, is_active)
      VALUES (@id, @name, @description, @logo_url, @website, @is_active)
    `, { id, name, description, logo_url, website, is_active });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Brand Error:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}











