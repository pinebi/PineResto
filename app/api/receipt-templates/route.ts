import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const templates = await query(`
      SELECT rt.*, p.name as printer_name 
      FROM receipt_templates rt
      LEFT JOIN printers p ON rt.printer_id = p.id
      ORDER BY rt.name
    `);
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Receipt Templates API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      printer_id, 
      template_type = 'order',
      header_text,
      footer_text,
      item_format,
      show_logo = false,
      show_qr_code = false,
      show_table_info = true,
      show_order_time = true,
      show_estimated_time = true
    } = body;
    
    const id = `template-${Date.now()}`;
    
    await query(`
      INSERT INTO receipt_templates (
        id, name, printer_id, template_type, header_text, footer_text, 
        item_format, show_logo, show_qr_code, show_table_info, 
        show_order_time, show_estimated_time, is_active
      ) VALUES (
        @id, @name, @printer_id, @template_type, @header_text, @footer_text,
        @item_format, @show_logo, @show_qr_code, @show_table_info,
        @show_order_time, @show_estimated_time, 1
      )
    `, {
      id, name, printer_id, template_type, header_text, footer_text,
      item_format, show_logo, show_qr_code, show_table_info,
      show_order_time, show_estimated_time
    });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create Template Error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}









