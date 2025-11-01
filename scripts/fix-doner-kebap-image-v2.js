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

// Daha spesifik döner kebabı görselleri
const donerImageUrls = [
  'https://images.unsplash.com/photo-1626082918486-6d77be3e5d32?w=400&h=400&fit=crop', // Döner kebabı
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', // Türk mutfağı
  'https://images.unsplash.com/photo-1579941029145-35907a0a5b8a?w=400&h=400&fit=crop', // Kebap
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop', // Türk yemeği
  'https://images.unsplash.com/photo-1574654413956-62f3e4c78995?w=400&h=400&fit=crop', // Alternatif
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
    console.log(`📋 Kategori: ${category.name}\n`);

    // En iyi görseli seç (ikinci alternatif)
    const newImageUrl = donerImageUrls[1]; // Türk mutfağı görseli
    
    await pool.request().query(`
      UPDATE categories 
      SET image_url = '${newImageUrl.replace(/'/g, "''")}' 
      WHERE id = '${category.id}'
    `);

    console.log(`✓ Döner Kebap görseli güncellendi:`);
    console.log(`  ${newImageUrl}\n`);

    await pool.close();
    console.log('✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

fixDonerKebapImage();

