import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let sql = `
      SELECT 
        id, username, email, full_name as fullName, phone, role,
        is_active as isActive, avatar, created_at as createdAt,
        employee_id as employeeId, department, salary, hire_date as hireDate,
        work_shift as workShift, customer_type as customerType,
        loyalty_points as loyaltyPoints, membership_level as membershipLevel,
        total_spent as totalSpent, order_count as orderCount, address, birth_date as birthDate
      FROM users
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const users = await query<any>(sql, params);
    
    return NextResponse.json(users.map(u => ({
      ...u,
      isActive: Boolean(u.isActive),
      createdAt: new Date(u.createdAt),
      hireDate: u.hireDate ? new Date(u.hireDate) : undefined,
      birthDate: u.birthDate ? new Date(u.birthDate) : undefined,
      permissions: [] // Permissions ayrı tablodan çekilebilir
    })));
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = `user-${Date.now()}`;
    
    await query(`
      INSERT INTO users (
        id, username, email, password_hash, full_name, phone, role,
        is_active, avatar, employee_id, department, salary, work_shift,
        customer_type, loyalty_points, membership_level, address, birth_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.username,
      data.email,
      '$2a$10$demo_hash', // Gerçek uygulamada bcrypt hash kullanın
      data.fullName,
      data.phone,
      data.role,
      true,
      data.avatar || '👤',
      data.employeeId || null,
      data.department || null,
      data.salary || null,
      data.workShift || null,
      data.customerType || 'regular',
      0,
      'bronze',
      data.address || null,
      data.birthDate || null
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('User Create Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}






