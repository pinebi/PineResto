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

// Daha iyi çalışan döner kebabı görselleri
const donerImages = [
  'https://images.unsplash.com/photo-1574654413956-62f3e4c78995?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1626082918486-6d77be3e5d32?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1579941029145-35907a0a5b8a?w=400&h=400&fit=crop',
];

async function fixDonerKebapImage() {
  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');

    // Döner Kebap kategorisini bul
    const categoryResult = await pool.request().query(`
      SELECT id, name, image_url FROM categories WHERE name = 'Döner Kebap'
    `);

    if (categoryResult.recordset.length === 0) {
      console.log('❌ Döner Kebap kategorisi bulunamadı');
      await pool.close();
      return;
    }

    const category = categoryResult.recordset[0];
    console.log(`📋 Kategori bulundu: ${category.name} (${category.id})`);
    console.log(`📸 Mevcut resim: ${category.image_url || 'YOK'}\n`);

    // Yeni resim URL'ini güncelle
    const newImageUrl = donerImages[0]; // İlk alternatifi kullan
    
    await pool.request().query(`
      UPDATE categories 
      SET image_url = '${newImageUrl.replace(/'/g, "''")}' 
      WHERE id = '${category.id}'
    `);

    console.log(`✓ Yeni resim URL güncellendi:`);
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

fixDonerKebapImage();

