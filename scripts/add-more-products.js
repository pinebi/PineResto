const sql = require('mssql');

const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

const products = [
  // Sıcak Yemekler
  { name: 'Kuzu Şiş', description: 'Özel marine edilmiş kuzu şiş', price: 140, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400' },
  { name: 'Tavuk Şiş', description: 'Marine edilmiş tavuk göğsü şiş', price: 95, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { name: 'Karışık Izgara', description: 'Adana, tavuk, kuzu karışık', price: 160, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { name: 'Köfte', description: 'El yapımı ızgara köfte', price: 100, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
  { name: 'İskender', description: 'Yoğurtlu iskender kebap', price: 130, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
  { name: 'Margarita Pizza', description: 'Domates sos, mozzarella', price: 85, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { name: 'Karışık Pizza', description: 'Sucuk, salam, mantar, biber', price: 95, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
  { name: 'Vejeteryan Pizza', description: 'Sebze karışımlı pizza', price: 80, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400' },
  { name: 'Mantı', description: 'Ev yapımı mantı', price: 75, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400' },
  { name: 'Lahmacun', description: 'İnce hamur lahmacun', price: 35, category: 'Sıcak Yemekler', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400' },
  
  // Kahvaltı
  { name: 'Serpme Kahvaltı', description: 'Zengin kahvaltı tabağı', price: 120, category: 'Kahvaltı', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400' },
  { name: 'Menemen', description: 'Yumurtalı menemen', price: 55, category: 'Kahvaltı', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400' },
  { name: 'Omlet', description: 'Kaşarlı omlet', price: 50, category: 'Kahvaltı', image: 'https://images.unsplash.com/photo-1586940551231-62f4d9424c87?w=400' },
  { name: 'Sütlaç', description: 'Fırın sütlaç', price: 45, category: 'Kahvaltı', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  
  // İçecekler
  { name: 'Ayran', description: 'Ev yapımı ayran', price: 15, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
  { name: 'Kola', description: 'Coca Cola 330ml', price: 20, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
  { name: 'Fanta', description: 'Fanta 330ml', price: 20, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400' },
  { name: 'Su', description: 'İçme suyu 500ml', price: 8, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
  { name: 'Limonata', description: 'Taze sıkım limonata', price: 25, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0d?w=400' },
  { name: 'Türk Kahvesi', description: 'Sade/Orta/Şekerli', price: 22, category: 'İçecekler', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
  
  // Tatlılar
  { name: 'Künefe', description: 'Sıcak künefe', price: 70, category: 'Tatlılar', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400' },
  { name: 'Kemalpaşa', description: 'Kemalpaşa tatlısı', price: 55, category: 'Tatlılar', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400' },
  { name: 'Tiramisu', description: 'İtalyan tiramisu', price: 65, category: 'Tatlılar', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
  { name: 'Profiterol', description: 'Çikolatalı profiterol', price: 60, category: 'Tatlılar', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
];

async function addProducts() {
  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    await sql.connect(config);
    console.log('✅ Bağlantı başarılı!\n');

    // Get category IDs
    const categoryMap = {};
    const categoryResult = await sql.query`SELECT id, name FROM categories`;
    categoryResult.recordset.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('📦 20 yeni ürün ekleniyor...\n');

    for (const product of products) {
      const categoryId = categoryMap[product.category];
      
      if (!categoryId) {
        console.log(`⚠️  Kategori bulunamadı: ${product.category} - ${product.name} atlanıyor`);
        continue;
      }

      await sql.query`
        INSERT INTO products (id, name, description, price, category_id, image_url, is_active)
        VALUES (NEWID(), ${product.name}, ${product.description}, ${product.price}, ${categoryId}, ${product.image}, 1)
      `;

      console.log(`✅ ${product.name} - ₺${product.price} (${product.category})`);
    }

    console.log(`\n🎉 ${products.length} ürün başarıyla eklendi!`);
    console.log('\n📊 Toplam ürün sayısı:');
    
    const totalResult = await sql.query`SELECT COUNT(*) as total FROM products WHERE is_active = 1`;
    console.log(`   Aktif ürünler: ${totalResult.recordset[0].total}`);

    await sql.close();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

addProducts();

