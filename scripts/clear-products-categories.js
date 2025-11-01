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

async function clearProductsAndCategories() {
  console.log('🚀 Ürün ve kategori silme işlemi başlatılıyor...\n');
  
  const pool = await sql.connect(mssqlConfig);
  console.log('✅ MSSQL bağlantısı başarılı\n');

  try {
    // Mevcut durumu kontrol et
    const productCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM products`);
    const categoryCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM categories`);
    
    // Cart tablosu var mı kontrol et
    let cartCount = 0;
    try {
      const cartCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM cart`);
      cartCount = cartCountResult.recordset[0].count;
    } catch (e) {
      // Cart tablosu yoksa atla
    }
    
    const orderItemsCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM order_items`);
    
    // product_options_mapping veya product_flavors_mapping kontrol et
    let productOptionsCount = 0;
    try {
      const productOptionsCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM product_options_mapping`);
      productOptionsCount = productOptionsCountResult.recordset[0].count;
    } catch (e) {
      try {
        const productOptionsCountResult = await pool.request().query(`SELECT COUNT(id) as count FROM product_flavors_mapping`);
        productOptionsCount = productOptionsCountResult.recordset[0].count;
      } catch (e2) {
        // Tablo yoksa atla
      }
    }

    console.log('📊 Mevcut durum:');
    console.log(`   - Ürünler: ${productCountResult.recordset[0].count}`);
    console.log(`   - Kategoriler: ${categoryCountResult.recordset[0].count}`);
    console.log(`   - Sepet öğeleri: ${cartCount}`);
    console.log(`   - Sipariş öğeleri: ${orderItemsCountResult.recordset[0].count}`);
    console.log(`   - Ürün seçenekleri: ${productOptionsCount}\n`);

    console.log('🗑️  Veriler siliniyor...\n');

    // İlişkili tabloları silme sırasına dikkat et (foreign key constraintleri için)
    try {
      console.log('   - Ürün seçenekleri siliniyor...');
      await pool.request().query(`DELETE FROM product_options_mapping`);
      console.log(`   ✓ Ürün seçenekleri silindi`);
    } catch (e) {
      try {
        await pool.request().query(`DELETE FROM product_flavors_mapping`);
        console.log(`   ✓ Ürün çeşnileri silindi`);
      } catch (e2) {
        console.log(`   ℹ️  Ürün seçenek tablosu bulunamadı, atlanıyor`);
      }
    }

    try {
      console.log('   - Sepet kayıtları siliniyor...');
      const cartResult = await pool.request().query(`DELETE FROM cart`);
      console.log(`   ✓ ${cartResult.rowsAffected[0]} sepet öğesi silindi`);
    } catch (e) {
      console.log(`   ℹ️  Cart tablosu bulunamadı, atlanıyor`);
    }

    console.log('   - Sipariş öğeleri siliniyor...');
    const orderItemsResult = await pool.request().query(`DELETE FROM order_items`);
    console.log(`   ✓ ${orderItemsResult.rowsAffected[0]} sipariş öğesi silindi`);

    console.log('   - Ürünler siliniyor...');
    const productsResult = await pool.request().query(`DELETE FROM products`);
    console.log(`   ✓ ${productsResult.rowsAffected[0]} ürün silindi`);

    console.log('   - Kategoriler siliniyor...');
    const categoriesResult = await pool.request().query(`DELETE FROM categories`);
    console.log(`   ✓ ${categoriesResult.rowsAffected[0]} kategori silindi`);

    console.log('\n✅ Tüm ürünler ve kategoriler başarıyla silindi!');

    // Son durumu kontrol et
    const finalProductCount = await pool.request().query(`SELECT COUNT(id) as count FROM products`);
    const finalCategoryCount = await pool.request().query(`SELECT COUNT(id) as count FROM categories`);
    
    console.log('\n📊 Son durum:');
    console.log(`   - Ürünler: ${finalProductCount.recordset[0].count}`);
    console.log(`   - Kategoriler: ${finalCategoryCount.recordset[0].count}\n`);

    await pool.close();

  } catch (error) {
    console.error('❌ Veri silme hatası:', error.message);
    throw error;
  }
}

clearProductsAndCategories().catch(console.error);

