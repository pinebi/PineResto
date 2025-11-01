import { NextResponse } from 'next/server';

// Tip tanımları
interface OptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  orderIndex: number;
}

interface OptionGroup {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  values: OptionValue[];
}

// Demo veri
const demoOptionGroups: OptionGroup[] = [
  {
    id: 'spice_level',
    name: 'Acılık Derecesi',
    description: 'Ürünün acılık seviyesini belirler',
    isRequired: true,
    values: [
      { id: 'spice_mild', name: 'Az Acılı', priceModifier: 0, isDefault: true, orderIndex: 1 },
      { id: 'spice_medium', name: 'Normal', priceModifier: 0, isDefault: false, orderIndex: 2 },
      { id: 'spice_hot', name: 'Çok Acılı', priceModifier: 2, isDefault: false, orderIndex: 3 },
    ]
  },
  {
    id: 'size',
    name: 'Porsiyon Boyutu',
    description: 'Ürünün porsiyon boyutunu belirler',
    isRequired: false,
    values: [
      { id: 'size_small', name: 'Küçük', priceModifier: -10, isDefault: false, orderIndex: 1 },
      { id: 'size_medium', name: 'Orta', priceModifier: 0, isDefault: true, orderIndex: 2 },
      { id: 'size_large', name: 'Büyük', priceModifier: 15, isDefault: false, orderIndex: 3 },
    ]
  },
  {
    id: 'bread_type',
    name: 'Ekmek Türü',
    description: 'Ekmeğin türünü belirler',
    isRequired: false,
    values: [
      { id: 'bread_white', name: 'Beyaz Ekmek', priceModifier: 0, isDefault: true, orderIndex: 1 },
      { id: 'bread_wheat', name: 'Tam Buğday', priceModifier: 1, isDefault: false, orderIndex: 2 },
      { id: 'bread_corn', name: 'Mısır Ekmeği', priceModifier: 1.5, isDefault: false, orderIndex: 3 },
    ]
  },
  {
    id: 'drink_type',
    name: 'İçecek Türü',
    description: 'İçeceğin türünü belirler',
    isRequired: false,
    values: [
      { id: 'drink_tea', name: 'Çay', priceModifier: 0, isDefault: true, orderIndex: 1 },
      { id: 'drink_coffee', name: 'Kahve', priceModifier: 5, isDefault: false, orderIndex: 2 },
      { id: 'drink_juice', name: 'Meyve Suyu', priceModifier: 8, isDefault: false, orderIndex: 3 },
    ]
  },
  {
    id: 'sugar_level',
    name: 'Şeker Seviyesi',
    description: 'İçeceğin şeker seviyesini belirler',
    isRequired: false,
    values: [
      { id: 'sugar_none', name: 'Şekersiz', priceModifier: 0, isDefault: false, orderIndex: 1 },
      { id: 'sugar_light', name: 'Az Şekerli', priceModifier: 0, isDefault: false, orderIndex: 2 },
      { id: 'sugar_medium', name: 'Orta Şekerli', priceModifier: 0, isDefault: true, orderIndex: 3 },
      { id: 'sugar_heavy', name: 'Çok Şekerli', priceModifier: 0, isDefault: false, orderIndex: 4 },
    ]
  },
  {
    id: 'extras',
    name: 'Ekstra Malzemeler',
    description: 'Ürüne eklenebilecek ekstra malzemeler',
    isRequired: false,
    values: [
      { id: 'extra_cheese', name: 'Peynir', priceModifier: 5, isDefault: false, orderIndex: 1 },
      { id: 'extra_olive', name: 'Zeytin', priceModifier: 3, isDefault: false, orderIndex: 2 },
      { id: 'extra_pickle', name: 'Turşu', priceModifier: 2, isDefault: false, orderIndex: 3 },
      { id: 'extra_sauce', name: 'Ekstra Sos', priceModifier: 2, isDefault: false, orderIndex: 4 },
    ]
  }
];

// GET - Tüm seçenek gruplarını listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (groupId) {
      const group = demoOptionGroups.find(g => g.id === groupId);
      if (!group) {
        return NextResponse.json(
          { error: 'Seçenek grubu bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(group);
    }

    return NextResponse.json(demoOptionGroups);
  } catch (error) {
    return NextResponse.json(
      { error: 'Veri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni seçenek grubu oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isRequired } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Grup adı zorunludur' },
        { status: 400 }
      );
    }

    const newGroup: OptionGroup = {
      id: Date.now().toString(),
      name,
      description: description || '',
      isRequired: isRequired || false,
      values: []
    };

    // Gerçek uygulamada SQL'e kaydedilecek
    demoOptionGroups.push(newGroup);

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Seçenek grubu oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Seçenek grubunu güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, isRequired, values } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Grup ID zorunludur' },
        { status: 400 }
      );
    }

    const groupIndex = demoOptionGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Seçenek grubu bulunamadı' },
        { status: 404 }
      );
    }

    // Gerçek uygulamada SQL'de güncellenecek
    demoOptionGroups[groupIndex] = {
      ...demoOptionGroups[groupIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(isRequired !== undefined && { isRequired }),
      ...(values && { values })
    };

    return NextResponse.json(demoOptionGroups[groupIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Seçenek grubu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Seçenek grubunu sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Grup ID zorunludur' },
        { status: 400 }
      );
    }

    const groupIndex = demoOptionGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Seçenek grubu bulunamadı' },
        { status: 404 }
      );
    }

    // Gerçek uygulamada SQL'den silinecek
    demoOptionGroups.splice(groupIndex, 1);

    return NextResponse.json({ message: 'Seçenek grubu silindi' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Seçenek grubu silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}











