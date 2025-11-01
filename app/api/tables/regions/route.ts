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
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM table_regions ORDER BY name');
    await sql.close();
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Bölgeler yüklenirken hata:', error);
    return NextResponse.json({ error: 'Bölgeler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    await sql.connect(config);
    
    const newId = `region-${Date.now()}`;
    const query = `
      INSERT INTO table_regions (id, name, description, created_at, updated_at)
      VALUES ('${newId}', N'${name}', N'${description || ''}', GETDATE(), GETDATE())
    `;
    
    await sql.query(query);
    await sql.close();
    
    return NextResponse.json({ id: newId, name, description }, { status: 201 });
  } catch (error) {
    console.error('Bölge oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Bölge oluşturulamadı' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    await sql.connect(config);
    
    const query = `
      UPDATE table_regions 
      SET name = N'${name}', description = N'${description || ''}', updated_at = GETDATE()
      WHERE id = '${id}'
    `;
    
    const result = await sql.query(query);
    await sql.close();
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ id, name, description });
  } catch (error) {
    console.error('Bölge güncellenirken hata:', error);
    return NextResponse.json({ error: 'Bölge güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bölge ID gerekli' }, { status: 400 });
    }

    await sql.connect(config);
    
    const query = `DELETE FROM table_regions WHERE id = '${id}'`;
    const result = await sql.query(query);
    await sql.close();
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Bölge silindi' });
  } catch (error) {
    console.error('Bölge silinirken hata:', error);
    return NextResponse.json({ error: 'Bölge silinemedi' }, { status: 500 });
  }
}


