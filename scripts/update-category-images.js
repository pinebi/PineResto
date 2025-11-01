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

// Kategori adları ve uygun görsel URL'leri
const categoryImages = {
  'Alkoholische Getränke': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
  'Diverse': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  'Döner Kebap': 'https://images.unsplash.com/photo-1633613286991-611fe299c097?w=400&h=400&fit=crop',
  'Extras': 'https://images.unsplash.com/photo-1615367426107-6e3fefa07e93?w=400&h=400&fit=crop',
  'Gutschein Scheck': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop',
  'Leergut': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=400&fit=crop',
  'Pfand': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=400&fit=crop',
  'Pfannengerichte': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
  'Pide_TürkischePizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
  'Salate_Vorspeisen': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  'Softdrinks': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop',
  'Suppen_Frühstück': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop',
  'Tee_Kaffee': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
  'Teigröllchen': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
  'Vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  'Vom Grill': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop',
};

async function updateCategoryImages() {
  console.log('🚀 Kategori resimleri güncelleniyor...\n');

  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');

    // Tüm kategorileri al
    const categoriesResult = await pool.request().query(`
      SELECT id, name, image_url FROM categories ORDER BY name
    `);

    console.log(`📋 ${categoriesResult.recordset.length} kategori bulundu\n`);

    let updated = 0;
    let notFound = 0;

    for (const category of categoriesResult.recordset) {
      const categoryName = category.name;
      const imageUrl = categoryImages[categoryName];

      if (imageUrl) {
        try {
          // Kategori resmini güncelle
          await pool.request().query(`
            UPDATE categories 
            SET image_url = '${imageUrl.replace(/'/g, "''")}' 
            WHERE id = '${category.id}'
          `);
          console.log(`✓ ${categoryName}: Resim güncellendi`);
          updated++;
        } catch (error) {
          console.error(`❌ ${categoryName}: Güncelleme hatası - ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${categoryName}: Görsel URL bulunamadı`);
        notFound++;
      }
    }

    await pool.close();

    console.log('\n✅ İşlem tamamlandı!');
    console.log(`   ✓ Güncellenen: ${updated}`);
    console.log(`   ⏭️  Görsel bulunamayan: ${notFound}`);
    console.log(`   📦 Toplam: ${categoriesResult.recordset.length}\n`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  }
}

updateCategoryImages().catch(console.error);

