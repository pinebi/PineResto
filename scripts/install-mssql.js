const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// MSSQL Server Bağlantı Bilgileri
const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  // database belirtmeden bağlan - kullanıcının default DB'sine bağlanır
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

async function installDatabase() {
  console.log('🚀 PineResto MSSQL Kurulumu\n');
  console.log('📡 Bağlantı bilgileri:');
  console.log(`   Server: ${config.server}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ***\n`);

  let pool;

  try {
    // MSSQL'e bağlan
    console.log('🔌 MSSQL sunucusuna bağlanılıyor...');
    pool = await sql.connect(config);
    console.log('✅ Bağlantı başarılı!\n');

    // Hangi veritabanına bağlıyız?
    const currentDbResult = await pool.request().query('SELECT DB_NAME() as current_db');
    const currentDb = currentDbResult.recordset[0].current_db;
    console.log(`📍 Bağlı veritabanı: ${currentDb}\n`);

    // SQL dosyasını oku
    console.log('📄 SQL dosyası okunuyor...');
    const sqlPath = path.join(__dirname, '..', 'database', 'PineResto-MSSQL.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL dosyası okundu\n');

    // SQL batch'lerini ayır (GO ile ayrılmış)
    console.log('⚙️  SQL komutları çalıştırılıyor...\n');
    const batches = sqlContent
      .split(/^\s*GO\s*$/gmi)
      .map(b => b.trim())
      .filter(b => b.length > 0 && !b.startsWith('--'));

    console.log(`📝 ${batches.length} SQL batch bulundu\n`);

    let successCount = 0;
    let tableCount = 0;
    let insertCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        await pool.request().query(batch);
        
        if (batch.toUpperCase().includes('CREATE TABLE')) {
          const tableName = batch.match(/CREATE TABLE \[?(\w+)\]?/i)?.[1];
          console.log(`   ✅ Tablo: ${tableName}`);
          tableCount++;
        } else if (batch.toUpperCase().includes('INSERT INTO')) {
          const tableName = batch.match(/INSERT INTO \[?(\w+)\]?/i)?.[1];
          const valueMatches = batch.match(/VALUES/gi);
          const rowCount = valueMatches ? valueMatches.length : 1;
          console.log(`   ✅ Veri: ${tableName} (+${rowCount} kayıt)`);
          insertCount += rowCount;
        } else if (batch.toUpperCase().includes('CREATE INDEX')) {
          const indexName = batch.match(/CREATE INDEX \[?(\w+)\]?/i)?.[1];
          console.log(`   ✅ Index: ${indexName}`);
        } else if (batch.toUpperCase().includes('CREATE DATABASE')) {
          console.log(`   ✅ Veritabanı oluşturuldu`);
        }
        
        successCount++;
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('DROP')) {
          console.log(`   ⚠️  Uyarı: ${err.message.substring(0, 80)}...`);
        }
      }
    }

    console.log(`\n✅ ${successCount} komut başarıyla çalıştırıldı`);
    console.log(`✅ ${tableCount} tablo oluşturuldu`);
    console.log(`✅ ${insertCount} kayıt eklendi\n`);

    // PineResto veritabanına geç
    console.log('\n🔄 PineResto veritabanına geçiliyor...');
    await pool.request().query('USE PineResto');
    console.log('✅ PineResto aktif\n');

    // Tabloları listele
    console.log('📊 Oluşturulan Tablolar:');
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      ORDER BY TABLE_NAME
    `);
    
    result.recordset.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.TABLE_NAME}`);
    });

    // Veri sayıları
    console.log('\n📈 Veri İstatistikleri:');
    const tables = ['users', 'categories', 'products', 'tables', 'suppliers', 'inventory_items'];
    
    for (const tableName of tables) {
      try {
        const countResult = await pool.request().query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${countResult.recordset[0].count} kayıt`);
      } catch (err) {
        // Skip
      }
    }

    // .env.local güncelle
    console.log('\n📝 .env.local dosyası güncelleniyor...');
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = `# PineResto MSSQL Configuration
DB_HOST=185.210.92.248
DB_PORT=1433
DB_USER=EDonusum
DB_PASSWORD=150399AA-DB5B-47D9-BF31-69EB984CB5DF
DB_NAME=PineResto

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Security
JWT_SECRET=pineresto-${Date.now()}
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local dosyası oluşturuldu\n');

    console.log('🎉 KURULUM BAŞARIYLA TAMAMLANDI!\n');
    console.log('📝 Varsayılan Giriş:');
    console.log('   URL: http://localhost:3100/login');
    console.log('   Kullanıcı: admin');
    console.log('   Şifre: 12345\n');
    console.log('🚀 Şimdi "npm run dev" ile başlatın!\n');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error('\nDetay:', error);
    console.error('\n💡 Kontrol:');
    console.log('   1. Sunucu erişilebilir mi?');
    console.log('   2. Port 1433 açık mı?');
    console.log('   3. Kullanıcı bilgileri doğru mu?\n');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

installDatabase();

