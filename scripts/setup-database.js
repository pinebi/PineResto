const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function setupDatabase() {
  console.log('🚀 PineResto Veritabanı Kurulumu Başlıyor...\n');

  let connection;

  try {
    // 1. MySQL'e bağlan
    console.log('📡 MySQL sunucusuna bağlanılıyor...');
    connection = await mysql.createConnection(config);
    console.log('✅ MySQL bağlantısı başarılı\n');

    // 2. PineResto veritabanını oluştur
    console.log('🗄️  PineResto veritabanı oluşturuluyor...');
    await connection.query('CREATE DATABASE IF NOT EXISTS PineResto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ PineResto veritabanı oluşturuldu\n');

    // 3. PineResto'ya bağlan
    await connection.query('USE PineResto');
    console.log('✅ PineResto veritabanına geçildi\n');

    // 4. SQL dosyasını oku ve çalıştır
    console.log('📄 SQL şeması yükleniyor...');
    const sqlPath = path.join(__dirname, '..', 'database', 'PineResto-full.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // SQL'i satırlara böl ve boş satırları temizle
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

    console.log(`📝 ${statements.length} SQL komutu bulundu\n`);

    // Her komutu sırayla çalıştır
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Tablo oluşturma ve veri ekleme komutlarını ayır
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
        console.log(`📋 Tablo oluşturuluyor: ${tableName}...`);
        await connection.query(statement);
        console.log(`✅ ${tableName} tablosu oluşturuldu`);
      } else if (statement.includes('INSERT INTO')) {
        const tableName = statement.match(/INSERT INTO (\w+)/i)?.[1];
        try {
          await connection.query(statement);
          console.log(`✅ ${tableName} - Veri eklendi`);
        } catch (err) {
          console.log(`⚠️  ${tableName} - Veri ekleme atlandı (zaten var olabilir)`);
        }
      } else if (statement.includes('CREATE INDEX') || statement.includes('DROP TABLE')) {
        try {
          await connection.query(statement);
        } catch (err) {
          // Index veya drop hataları sessizce geç
        }
      }
    }

    console.log('\n🎉 Veritabanı kurulumu tamamlandı!\n');

    // 5. Oluşturulan tabloları listele
    console.log('📊 Oluşturulan Tablolar:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    console.log('\n📈 Veri İstatistikleri:');
    
    // Her tablo için kayıt sayısını göster
    const tableNames = ['users', 'categories', 'products', 'tables', 'orders', 'inventory_items', 'suppliers'];
    for (const tableName of tableNames) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${result[0].count} kayıt`);
      } catch (err) {
        // Tablo yoksa geç
      }
    }

    console.log('\n✅ Kurulum başarıyla tamamlandı!');
    console.log('\n📝 Varsayılan Admin Kullanıcısı:');
    console.log('   Kullanıcı Adı: admin');
    console.log('   Şifre: 12345');
    console.log('   Email: admin@pineresto.com\n');

    console.log('🚀 Şimdi "npm run dev" ile uygulamayı başlatabilirsiniz!\n');

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    console.error('\n💡 Kontrol Listesi:');
    console.log('   1. MySQL servisi çalışıyor mu? (mysql --version)');
    console.log('   2. Kullanıcı adı ve şifre doğru mu?');
    console.log('   3. .env.local dosyası var mı?');
    console.log('   4. mysql2 paketi yüklü mü? (npm install mysql2)\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ana fonksiyonu çalıştır
setupDatabase();






