import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const printers = await query(`
      SELECT * FROM printers 
      WHERE is_active = 1 
      ORDER BY name
    `);
    
    return NextResponse.json(printers);
  } catch (error) {
    console.error('Printers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch printers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, ip_address, port = 9100, type = 'thermal' } = body;
    
    const id = `printer-${Date.now()}`;
    
    await query(`
      INSERT INTO printers (id, name, type, location, ip_address, port, is_active)
      VALUES (@id, @name, @type, @location, @ip_address, @port, 1)
    `, { id, name, type, location: location || 'Yerel', ip_address: ip_address || 'localhost', port });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Printer Error:', error);
    return NextResponse.json({ error: 'Failed to create printer' }, { status: 500 });
  }
}
