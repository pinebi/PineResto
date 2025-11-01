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
  },
  connectionTimeout: 30000,
};

async function createRegionsTable() {
  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    await sql.connect(config);
    console.log('✅ Bağlantı başarılı!');

    // Bölgeler tablosunu oluştur
    console.log('📝 Bölgeler tablosu oluşturuluyor...');
    await sql.query(`
      CREATE TABLE table_regions (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    console.log('✅ Bölgeler tablosu oluşturuldu!');

    // Örnek veriler ekle
    console.log('📊 Örnek veriler ekleniyor...');
    await sql.query(`
      INSERT INTO table_regions (id, name, description) VALUES 
      ('1', N'Ön Taraf', N'Restoranın ön kısmındaki masalar'),
      ('2', N'Arka Taraf', N'Restoranın arka kısmındaki masalar'),
      ('3', N'Teras', N'Teras bölümündeki masalar'),
      ('4', N'ÖN2', N'İkinci ön bölüm')
    `);
    console.log('✅ Örnek veriler eklendi!');

    // Verileri kontrol et
    const result = await sql.query('SELECT * FROM table_regions');
    console.log('📋 Bölgeler:', result.recordset);

    await sql.close();
    console.log('✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.message.includes('already an object named')) {
      console.log('ℹ️  Bölgeler tablosu zaten mevcut.');
    }
  }
}

createRegionsTable();



