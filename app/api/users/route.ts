import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    const users = await query(`
      SELECT * FROM users 
      ORDER BY full_name
    `);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password_hash, full_name, phone, role, employee_id, department, avatar } = body;
    
    const id = `user-${Date.now()}`;
    
    await query(`
      INSERT INTO users (id, username, email, password_hash, full_name, phone, role, employee_id, department, avatar)
      VALUES (@id, @username, @email, @password_hash, @full_name, @phone, @role, @employee_id, @department, @avatar)
    `, { id, username, email, password_hash, full_name, phone, role, employee_id, department, avatar });
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}






