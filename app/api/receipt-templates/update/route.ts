import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await query(`
      UPDATE receipt_templates 
      SET name = @name, header_text = @header_text, footer_text = @footer_text,
          item_format = @item_format, show_logo = @show_logo, show_qr_code = @show_qr_code,
          show_table_info = @show_table_info, show_order_time = @show_order_time,
          show_estimated_time = @show_estimated_time, updated_at = GETDATE()
      WHERE id = @id
    `, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Receipt Template Update API Error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}






