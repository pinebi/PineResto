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

// Extras kategorisi için alternatif görseller
const extrasImageUrls = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', // Yemek tabağı
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=400&fit=crop', // Garnitür
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', // Salata/ekstra
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop', // Garnitürler
  'https://images.unsplash.com/photo-1546835419-44a0dba2b847?w=400&h=400&fit=crop', // Ekstra malzemeler
];

async function updateExtrasImage() {
  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');

    // Extras kategorisini bul
    const categoryResult = await pool.request().query(`
      SELECT id, name, image_url FROM categories WHERE name = 'Extras'
    `);

    if (categoryResult.recordset.length === 0) {
      console.log('❌ Extras kategorisi bulunamadı');
      await pool.close();
      return;
    }

    const category = categoryResult.recordset[0];
    console.log(`📋 Kategori: ${category.name}`);
    console.log(`📸 Mevcut resim: ${category.image_url || 'YOK'}\n`);

    // Daha uygun bir görsel seç (garnitür/ekstra malzeme)
    const newImageUrl = extrasImageUrls[3]; // Garnitürler görseli
    
    await pool.request().query(`
      UPDATE categories 
      SET image_url = '${newImageUrl.replace(/'/g, "''")}' 
      WHERE id = '${category.id}'
    `);

    console.log(`✓ Extras görseli güncellendi:`);
    console.log(`  ${newImageUrl}\n`);

    // Güncellenmiş kategoriyi kontrol et
    const updatedResult = await pool.request().query(`
      SELECT id, name, image_url FROM categories WHERE id = '${category.id}'
    `);
    
    console.log('✅ Güncellenmiş kategori:');
    console.log(`   Adı: ${updatedResult.recordset[0].name}`);
    console.log(`   Resim URL: ${updatedResult.recordset[0].image_url}\n`);

    await pool.close();
    console.log('✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

updateExtrasImage();

