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

// Ürün adlarına göre spesifik resim mapping (öncelikli)
const productSpecificMap = {
  // Döner ve Kebap
  'adana dürüm': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'adana kebap': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop',
  'ali nazik': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'dönerli salata': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'dönerteller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'dürüm döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'iskender kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'pide ici döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'pomm döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  
  // Grill / Izgara
  'adana': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop',
  'beyti': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'dana sis': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'izgara köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'kuzu': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'tavuk': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'pirzola': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'sis': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'filet': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'mevlana köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'patlican kebap': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'yogurtlu kebap': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  
  // Pide
  'lahmacun': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kiymali pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kasarli pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'tavuklu pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'mevlana pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  
  // Salatalar ve Mezeler
  'salat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'cacik': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'coban salatasi': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'ezme': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'humus': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'kisir': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'yaprak sarma': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'karisik': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'meze': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  
  // Çorbalar ve Kahvaltı
  'çorba': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'corbasi': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'mercimek': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'menemen': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'frühstück': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'kelle paca': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  
  // İçecekler
  'coca-cola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop',
  'cola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop',
  'fanta': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'sprite': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'ayran': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'wasser': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'saft': 'https://images.unsplash.com/photo-1570654621852-d0de13ee8e3b?w=400&h=400&fit=crop',
  'schorle': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'eistee': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'redbull': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  
  // Alkol
  'bier': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'wein': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'rakı': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'raki': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'pilsener': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'weissbier': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'efes': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  
  // Kahve ve Çay
  'kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'kahve': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'cappuccino': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'espresso': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'latte': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'tee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'cay': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'mokka': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'crema': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  
  // Tatlılar
  'baklava': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'künefe': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'sütlac': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'lokum': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  
  // Diğer
  'falafel': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'pilav': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'reis': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'patates': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pommes': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'sote': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'börek': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'sigara': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
};

// Kategori bazlı fallback resimler
const categoryMap = {
  'döner kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'softdrinks': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'alkoholische getränke': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'pfannengerichte': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pide_türkischepizza': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'salate_vorspeisen': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'suppen_frühstück': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'tee_kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'desserts': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'vom grill': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'extras': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop',
  'vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'teigröllchen': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
};

function findImageUrl(productName, categoryName) {
  if (!productName) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop';
  }
  
  const searchText = productName.toLowerCase().trim();
  
  // 1. Önce ürün adına göre spesifik eşleştirme (tam eşleşme)
  // Tüm kelimeleri ayrı ayrı ve birlikte kontrol et
  const words = searchText.split(/[\s\-_,()]+/).filter(w => w.length > 2);
  
  // Önce tam isim eşleşmesi kontrol et
  if (productSpecificMap[searchText]) {
    return productSpecificMap[searchText];
  }
  
  // Her kelimeyi kontrol et (uzun kelimeler öncelikli)
  const sortedWords = words.sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (productSpecificMap[word]) {
      return productSpecificMap[word];
    }
  }
  
  // Kısmi eşleşme kontrol et
  for (const [key, url] of Object.entries(productSpecificMap)) {
    if (searchText.includes(key) || key.includes(searchText)) {
      return url;
    }
  }
  
  // 2. Kategori bazlı fallback
  if (categoryName) {
    const categoryKey = categoryName.toLowerCase().trim().replace(/\s+/g, '_');
    if (categoryMap[categoryKey]) {
      return categoryMap[categoryKey];
    }
  }
  
  // 3. Varsayılan resim
  return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop';
}

async function updateProductImages() {
  console.log('🚀 Ürün resimleri güncelleniyor (ürün adlarına göre)...\n');
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

    for (const product of products.recordset) {
      // Resim URL'ini bul (ürün adına göre öncelikli)
      const imageUrl = findImageUrl(product.name || '', product.category_name || '');
      
      // Veritabanını güncelle
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
    console.log(`   📦 Toplam: ${products.recordset.length}\n`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    throw error;
  } finally {
    await pool.close();
  }
}

updateProductImages().catch(console.error);

