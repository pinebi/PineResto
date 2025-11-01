const sql = require('mssql');

const mssqlConfig = {
  server: process.env.DB_HOST || '185.210.92.248',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'EDonusum',
  password: process.env.DB_PASSWORD || '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: process.env.DB_NAME || 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// Ürün kategorilerine ve isimlerine göre resim mapping
const imageMap = {
  // Kategoriler
  'döner kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'doner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'softdrinks': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'alkoholische getränke': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'alkohol': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'pfannengerichte': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pide_türkischepizza': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'salate_vorspeisen': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'salat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'suppen_frühstück': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'tee_kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'desserts': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'vom grill': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'grill': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'extras': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop',
  'vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  
  // Ürün anahtar kelimeleri
  'döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'durum': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'lahmacun': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'pizza': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'salat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'cola': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'fanta': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'sprite': 'https://images.unsplash.com/photo-1543253687-ff91d4c588?w=400&h=400&fit=crop',
  'ayran': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'wasser': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'bier': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'wein': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'soup': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'çorba': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'kahve': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'tea': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'tee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'kuchen': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'tatlı': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'baklava': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'grill': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'şiş': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'pilav': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'reis': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'patates': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pommes': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  
  // Varsayılan
  'default': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop'
};

function findImageUrl(productName, categoryName) {
  const searchText = `${productName} ${categoryName}`.toLowerCase();
  
  // Önce tam kategori ismini kontrol et
  if (categoryName) {
    const categoryKey = categoryName.toLowerCase().trim();
    if (imageMap[categoryKey]) {
      return imageMap[categoryKey];
    }
  }
  
  // Ürün adındaki anahtar kelimeleri kontrol et
  const keywords = Object.keys(imageMap);
  for (const keyword of keywords) {
    if (searchText.includes(keyword)) {
      return imageMap[keyword];
    }
  }
  
  // Varsayılan resim
  return imageMap['default'];
}

async function updateProductImages() {
  console.log('🚀 Ürün resimleri güncelleniyor...\n');
  const pool = await sql.connect(mssqlConfig);
  console.log('✅ MSSQL bağlantısı başarılı\n');

  try {
    // Tüm ürünleri kategori bilgisiyle birlikte al
    const products = await pool.request().query(`
      SELECT 
        p.id,
        p.name,
        p.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.name
    `);

    console.log(`📦 ${products.recordset.length} ürün bulundu\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products.recordset) {
      // Resim URL'ini bul (ürün adına göre)
      const imageUrl = findImageUrl(product.name || '', product.category_name || '');
      
      // Veritabanını güncelle (tüm ürünleri güncelle)
      const request = pool.request();
      request.input('imageUrl', sql.NVarChar, imageUrl);
      request.input('productId', sql.NVarChar, product.id);
      await request.query(`
        UPDATE products 
        SET image_url = @imageUrl
        WHERE id = @productId
      `);

      console.log(`✓ ${product.name} (${product.category_name || 'Kategori yok'}): ${imageUrl.substring(0, 60)}...`);
      updatedCount++;

      // Her 10 üründe bir ilerleme göster
      if (updatedCount % 10 === 0) {
        console.log(`\n📊 İlerleme: ${updatedCount}/${products.recordset.length} ürün güncellendi\n`);
      }
    }

    console.log('\n✅ İşlem tamamlandı!');
    console.log(`   ✓ Güncellenen: ${updatedCount}`);
    console.log(`   ⏭️  Atlanan (zaten resmi var): ${skippedCount}`);
    console.log(`   📦 Toplam: ${products.recordset.length}\n`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    throw error;
  } finally {
    await pool.close();
  }
}

updateProductImages().catch(console.error);

