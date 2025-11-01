import { NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 30000,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionId = searchParams.get('regionId');
  const status = searchParams.get('status');

  try {
    await sql.connect(config);
    
    let query = 'SELECT * FROM tables';
    const conditions = [];
    
    if (regionId) {
      conditions.push(`region_id = ${regionId}`);
    }
    
    if (status) {
      conditions.push(`status = '${status}'`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const result = await sql.query(query);
    await sql.close();
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Masalar yüklenirken hata:', error);
    return NextResponse.json({ error: 'Masalar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { number, capacity, shape, position_x, position_y, status } = body;

    await sql.connect(config);
    
    // Mevcut masa numaralarını kontrol et ve bir sonraki boş numarayı bul
    const existingNumbers = await sql.query('SELECT number FROM tables ORDER BY number');
    const usedNumbers = existingNumbers.recordset.map(row => row.number);
    
    let nextNumber = number || 1;
    while (usedNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    
    const newId = `table-${Date.now()}`;
    const query = `
      INSERT INTO tables (id, number, capacity, shape, position_x, position_y, status, created_at, updated_at)
      VALUES ('${newId}', ${nextNumber}, ${capacity || 4}, '${shape || 'round'}', ${position_x || 0}, ${position_y || 0}, '${status || 'empty'}', GETDATE(), GETDATE())
    `;
    
    await sql.query(query);
    await sql.close();
    
    return NextResponse.json({ id: newId, number: nextNumber, capacity, shape, position_x, position_y, status }, { status: 201 });
  } catch (error) {
    console.error('Masa oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Masa oluşturulamadı' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, number, capacity, shape, position_x, position_y, status } = body;

    // Undefined değerleri kontrol et
    if (!id) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    await sql.connect(config);
    
    // Sadece gönderilen alanları güncelle
    const updateFields = [];
    
    if (number !== undefined) {
      updateFields.push(`number = ${number}`);
    }
    if (capacity !== undefined) {
      updateFields.push(`capacity = ${capacity}`);
    }
    if (shape !== undefined) {
      updateFields.push(`shape = '${shape}'`);
    }
    if (position_x !== undefined) {
      updateFields.push(`position_x = ${position_x}`);
    }
    if (position_y !== undefined) {
      updateFields.push(`position_y = ${position_y}`);
    }
    if (status !== undefined) {
      updateFields.push(`status = '${status}'`);
    }
    
    updateFields.push('updated_at = GETDATE()');
    
    const query = `
      UPDATE tables 
      SET ${updateFields.join(', ')}
      WHERE id = '${id}'
    `;
    
    const result = await sql.query(query);
    await sql.close();
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ id, number, capacity, shape, position_x, position_y, status });
  } catch (error) {
    console.error('Masa güncellenirken hata:', error);
    return NextResponse.json({ error: 'Masa güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    await sql.connect(config);
    
    const query = `DELETE FROM tables WHERE id = '${id}'`;
    const result = await sql.query(query);
    await sql.close();
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Masa silindi' });
  } catch (error) {
    console.error('Masa silinirken hata:', error);
    return NextResponse.json({ error: 'Masa silinemedi' }, { status: 500 });
  }
}