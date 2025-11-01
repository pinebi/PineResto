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

async function checkCategoryImage() {
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
    console.log('📋 Kategori bilgileri:');
    console.log(`   ID: ${category.id}`);
    console.log(`   Adı: ${category.name}`);
    console.log(`   Resim URL: ${category.image_url || 'YOK'}\n`);

    await pool.close();

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkCategoryImage();

