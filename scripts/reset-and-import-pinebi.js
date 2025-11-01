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
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

(async () => {
  try {
    console.log('🚀 Veritabanı temizleme ve yeniden aktarım başlatılıyor...\n');
    
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');
    
    // Önce veri sayılarını göster
    const productsCount = await pool.request().query('SELECT COUNT(*) as count FROM products');
    const categoriesCount = await pool.request().query('SELECT COUNT(*) as count FROM categories');
    
    console.log(`📊 Mevcut durum:`);
    console.log(`   - Ürünler: ${productsCount.recordset[0].count}`);
    console.log(`   - Kategoriler: ${categoriesCount.recordset[0].count}\n`);
    
    // Silme işlemleri
    console.log('🗑️  Veriler siliniyor...\n');
    
    // Önce foreign key bağlantılarını kaldır
    console.log('   - Ürün seçenekleri siliniyor...');
    await pool.request().query('DELETE FROM product_flavors_mapping');
    await pool.request().query('DELETE FROM product_options_mapping');
    
    console.log('   - Sepet kayıtları siliniyor...');
    await pool.request().query('DELETE FROM cart');
    
    console.log('   - Sipariş öğeleri siliniyor...');
    await pool.request().query('DELETE FROM order_items');
    
    console.log('   - Ürünler siliniyor...');
    await pool.request().query('DELETE FROM products');
    
    console.log('   - Kategoriler siliniyor...');
    await pool.request().query('DELETE FROM categories');
    
    console.log('✅ Tüm veriler silindi\n');
    
    await pool.close();
    
    // Şimdi import scriptini çalıştır
    console.log('📦 PineBI verileri aktarılıyor...\n');
    const { exec } = require('child_process');
    
    exec('node scripts/import-from-pinebi-json.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Import hatası:', error);
        return;
      }
      
      console.log(stdout);
      if (stderr) {
        console.error('⚠️  Uyarılar:', stderr);
      }
      
      console.log('\n✅ İşlem tamamlandı!');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
})();




