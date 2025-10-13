const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Uzak SQL Server Bağlantı Bilgileri
const DB_CONFIG = {
  host: '185.210.92.248',
  port: 3306,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  multipleStatements: true,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: {
    rejectUnauthorized: false
  }
};

async function installDatabase() {
  console.log('🚀 PineResto Veritabanı Kurulumu\n');
  console.log('📡 Bağlantı bilgileri:');
  console.log(`   Host: ${DB_CONFIG.host}`);
  console.log(`   Port: ${DB_CONFIG.port}`);
  console.log(`   User: ${DB_CONFIG.user}`);
  console.log(`   Password: ${DB_CONFIG.password ? '***' : '(boş)'}\n`);

  let connection;

  try {
    // MySQL'e bağlan
    console.log('🔌 MySQL sunucusuna bağlanılıyor...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Bağlantı başarılı!\n');

    // PineResto veritabanını oluştur
    console.log('🗄️  PineResto veritabanı oluşturuluyor...');
    await connection.query('DROP DATABASE IF EXISTS PineResto');
    await connection.query('CREATE DATABASE PineResto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ PineResto veritabanı oluşturuldu\n');

    // PineResto'ya geç
    await connection.query('USE PineResto');

    // SQL dosyasını oku
    console.log('📄 SQL dosyası okunuyor...');
    const sqlPath = path.join(__dirname, '..', 'database', 'PineResto-full.sql');
    let sqlContent = await fs.promises.readFile(sqlPath, 'utf8');
    
    // Gereksiz satırları temizle
    sqlContent = sqlContent
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE PineResto;/gi, '')
      .replace(/-- .*$/gm, '') // Yorumları kaldır
      .trim();

    console.log('✅ SQL dosyası okundu\n');

    // SQL'i parçala ve çalıştır
    console.log('⚙️  Tablolar oluşturuluyor...\n');
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let tableCount = 0;
    let insertCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        if (stmt.toUpperCase().includes('CREATE TABLE')) {
          const tableName = stmt.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i)?.[1];
          await connection.query(stmt);
          console.log(`   ✅ ${tableName}`);
          tableCount++;
        } else if (stmt.toUpperCase().includes('INSERT INTO')) {
          await connection.query(stmt);
          insertCount++;
        } else if (stmt.toUpperCase().includes('CREATE INDEX') || stmt.toUpperCase().includes('DROP TABLE')) {
          await connection.query(stmt);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`   ⚠️  Uyarı: ${err.message.substring(0, 50)}...`);
        }
      }
    }

    console.log(`\n✅ ${tableCount} tablo oluşturuldu`);
    console.log(`✅ ${insertCount} veri eklendi\n`);

    // Oluşturulan tabloları göster
    console.log('📊 Oluşturulan Tablolar:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });

    // Veri sayılarını göster
    console.log('\n📈 Veri İstatistikleri:');
    const tableList = ['users', 'categories', 'products', 'tables', 'brands', 'suppliers', 'inventory_items'];
    
    for (const tableName of tableList) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result[0].count;
        console.log(`   ${tableName}: ${count} kayıt`);
      } catch (err) {
        // Skip
      }
    }

    // .env.local dosyasını güncelle
    console.log('\n📝 .env.local dosyası güncelleniyor...');
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = `# PineResto Database Configuration
DB_HOST=${DB_CONFIG.host}
DB_PORT=${DB_CONFIG.port}
DB_USER=${DB_CONFIG.user}
DB_PASSWORD=${DB_CONFIG.password}
DB_NAME=PineResto

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Security
JWT_SECRET=pineresto-${Date.now()}
`;
    
    await fs.promises.writeFile(envPath, envContent);
    console.log('✅ .env.local dosyası güncellendi\n');

    console.log('🎉 KURULUM BAŞARIYLA TAMAMLANDI!\n');
    console.log('📝 Varsayılan Giriş Bilgileri:');
    console.log('   URL: http://localhost:3100/login');
    console.log('   Kullanıcı: admin');
    console.log('   Şifre: 12345\n');
    console.log('🚀 Şimdi "npm run dev" komutu ile uygulamayı başlatın!\n');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error('\n💡 Çözüm Önerileri:');
    console.log('   1. MySQL servisinin çalıştığından emin olun');
    console.log('   2. scripts/install-db.js dosyasında DB_CONFIG.password ayarlayın');
    console.log('   3. MySQL root şifrenizi kontrol edin');
    console.log('   4. 3306 portunun açık olduğundan emin olun\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

installDatabase();

