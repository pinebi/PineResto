import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const variables = await query(`
      SELECT * FROM receipt_variables ORDER BY variable_name
    `);
    return NextResponse.json(variables);
  } catch (error) {
    console.error('Receipt Variables API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch variables' }, { status: 500 });
  }
}






