import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

// Çeşni gruplarını getir
export async function GET() {
  try {
    const flavorGroups = await query(`
      SELECT fg.id, fg.name, fg.type, fg.is_required, fg.display_order, fg.is_active, fg.created_at, fg.updated_at,
             COUNT(fv.id) as values_count
      FROM flavor_groups fg
      LEFT JOIN flavor_values fv ON fg.id = fv.flavor_group_id AND fv.is_active = 1
      WHERE fg.is_active = 1
      GROUP BY fg.id, fg.name, fg.type, fg.is_required, fg.display_order, fg.is_active, fg.created_at, fg.updated_at
      ORDER BY fg.display_order, fg.name
    `);

    // Her grup için değerleri getir
    const groupsWithValues = await Promise.all(
      flavorGroups.map(async (group: any) => {
        const values = await query(`
          SELECT id, name, price_modifier, is_default, display_order
          FROM flavor_values 
          WHERE flavor_group_id = @groupId AND is_active = 1
          ORDER BY display_order, name
        `, { groupId: group.id });

        return {
          id: group.id,
          name: group.name,
          description: null, // TEXT kolonunu kaldırdık
          type: group.type,
          isRequired: group.is_required,
          displayOrder: group.display_order,
          valuesCount: group.values_count,
          values: values.map((v: any) => ({
            id: v.id,
            name: v.name,
            priceModifier: v.price_modifier,
            isDefault: v.is_default,
            displayOrder: v.display_order
          }))
        };
      })
    );

    return NextResponse.json(groupsWithValues);
  } catch (error) {
    console.error('Flavors API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch flavor groups' }, { status: 500 });
  }
}

// Yeni çeşni grubu oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, type, isRequired, displayOrder, values } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const groupId = `flavor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Çeşni grubunu oluştur
    await query(`
      INSERT INTO flavor_groups (id, name, description, type, is_required, display_order)
      VALUES (@id, @name, @description, @type, @isRequired, @displayOrder)
    `, { 
      id: groupId, 
      name, 
      description: description || null, 
      type: type || 'single',
      isRequired: isRequired ? 1 : 0,
      displayOrder: displayOrder || 0
    });

    // Çeşni değerlerini oluştur
    if (values && values.length > 0) {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const valueId = `value-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
        
        await query(`
          INSERT INTO flavor_values (id, flavor_group_id, name, price_modifier, is_default, display_order)
          VALUES (@id, @groupId, @name, @priceModifier, @isDefault, @displayOrder)
        `, {
          id: valueId,
          groupId,
          name: value.name,
          priceModifier: value.priceModifier || 0,
          isDefault: value.isDefault ? 1 : 0,
          displayOrder: value.displayOrder || i + 1
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: groupId,
      message: 'Çeşni grubu başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Flavors POST Error:', error);
    return NextResponse.json({ error: 'Failed to create flavor group' }, { status: 500 });
  }
}
