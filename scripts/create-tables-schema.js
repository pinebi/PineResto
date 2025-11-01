const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Veritabanı konfigürasyonu
const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'PineResto',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function createTablesSchema() {
  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    await sql.connect(config);
    console.log('✅ Veritabanına bağlandı!');

    // SQL dosyasını oku
    const sqlFile = path.join(__dirname, 'tables-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL dosyası okundu, tablolar oluşturuluyor...');

    // SQL komutlarını çalıştır
    await sql.query(sqlContent);

    console.log('✅ Masalar ve bölgeler tabloları başarıyla oluşturuldu!');
    console.log('📊 Oluşturulan tablolar:');
    console.log('   - table_regions (Masa Bölgeleri)');
    console.log('   - tables (Masalar)');
    console.log('   - İndeksler ve trigger\'lar');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await sql.close();
    console.log('🔌 Veritabanı bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
createTablesSchema();





