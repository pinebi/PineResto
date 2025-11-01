const sql = require('mssql');

const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 30000,
};

async function testConnection() {
  console.log('🧪 MSSQL Bağlantı Testi\n');
  console.log('📡 Sunucu: 185.210.92.248:1433');
  console.log('👤 Kullanıcı: EDonusum\n');

  try {
    console.log('🔌 Bağlanılıyor...');
    const pool = await sql.connect(config);
    console.log('✅ Bağlantı başarılı!\n');

    // Mevcut veritabanlarını listele
    console.log('📊 Erişilebilir Veritabanları:');
    const databases = await pool.request().query('SELECT name FROM sys.databases WHERE HAS_DBACCESS(name) = 1');
    databases.recordset.forEach((db, index) => {
      console.log(`   ${index + 1}. ${db.name}`);
    });

    // Sunucu bilgilerini al
    console.log('\n🖥️  Sunucu Bilgileri:');
    const serverInfo = await pool.request().query('SELECT @@VERSION as version');
    console.log(`   ${serverInfo.recordset[0].version.split('\n')[0]}\n`);

    // Kullanıcı bilgilerini al
    console.log('👤 Kullanıcı Bilgileri:');
    const userInfo = await pool.request().query('SELECT SUSER_SNAME() as username, DB_NAME() as current_db');
    console.log(`   Username: ${userInfo.recordset[0].username}`);
    console.log(`   Current DB: ${userInfo.recordset[0].current_db}\n`);

    await pool.close();
    
    console.log('✅ Test tamamlandı!\n');
    console.log('💡 Sonraki Adım:');
    console.log('   Eğer PineResto veritabanı listede yoksa, sunucu yöneticinizden');
    console.log('   PineResto veritabanı oluşturmasını ve EDonusum kullanıcısına');
    console.log('   erişim yetkisi vermesini isteyin.\n');

  } catch (error) {
    console.error('\n❌ Bağlantı Hatası:', error.message);
    console.error('\n💡 Olası Sebepler:');
    console.log('   1. Kullanıcı adı veya şifre yanlış');
    console.log('   2. SQL Server Authentication modu kapalı');
    console.log('   3. Firewall port 1433 engelliyor');
    console.log('   4. SQL Server servisine uzak erişim kapalı\n');
  }
}

testConnection();











