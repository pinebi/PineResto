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

async function clearProductImages() {
  console.log('🚀 Ürün resimleri siliniyor...\n');
  const pool = await sql.connect(mssqlConfig);
  console.log('✅ MSSQL bağlantısı başarılı\n');

  try {
    // Önce kaç ürünün resmi olduğunu kontrol et
    const countResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE is_active = 1 AND image_url IS NOT NULL AND image_url != ''
    `);
    const countBefore = countResult.recordset[0].count;
    console.log(`📊 Resimli ürün sayısı: ${countBefore}\n`);

    // Tüm ürünlerin resimlerini sil
    const updateResult = await pool.request().query(`
      UPDATE products 
      SET image_url = NULL
      WHERE is_active = 1
    `);

    console.log(`✅ ${updateResult.rowsAffected[0]} ürünün resmi silindi\n`);

    // Kontrol et
    const countAfterResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE is_active = 1 AND image_url IS NOT NULL AND image_url != ''
    `);
    const countAfter = countAfterResult.recordset[0].count;
    console.log(`📊 Kalan resimli ürün sayısı: ${countAfter}\n`);

    console.log('✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    throw error;
  } finally {
    await pool.close();
  }
}

clearProductImages().catch(console.error);

