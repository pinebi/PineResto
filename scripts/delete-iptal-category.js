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

async function deleteIptalCategory() {
  console.log('🚀 IPTAL kategorisi siliniyor...\n');

  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');

    // IPTAL kategorisini bul
    const categoryResult = await pool.request().query(`
      SELECT id, name FROM categories WHERE name = 'IPTAL'
    `);

    if (categoryResult.recordset.length === 0) {
      console.log('ℹ️  IPTAL kategorisi bulunamadı.');
      await pool.close();
      return;
    }

    const categoryId = categoryResult.recordset[0].id;
    const categoryName = categoryResult.recordset[0].name;

    console.log(`📋 Kategori bulundu: ${categoryName} (${categoryId})\n`);

    // Bu kategorideki ürünleri kontrol et
    const productsResult = await pool.request().query(`
      SELECT COUNT(id) as count FROM products WHERE category_id = '${categoryId}'
    `);

    const productCount = productsResult.recordset[0].count;
    console.log(`📦 Bu kategorideki ürün sayısı: ${productCount}\n`);

    if (productCount > 0) {
      console.log('🗑️  Kategorideki ürünler siliniyor...');
      
      // Önce ürün seçeneklerini sil
      try {
        await pool.request().query(`
          DELETE FROM product_options_mapping 
          WHERE product_id IN (SELECT id FROM products WHERE category_id = '${categoryId}')
        `);
      } catch (e) {
        // Tablo yoksa atla
      }

      // Sepet kayıtlarını sil
      try {
        await pool.request().query(`
          DELETE FROM cart 
          WHERE product_id IN (SELECT id FROM products WHERE category_id = '${categoryId}')
        `);
      } catch (e) {
        // Tablo yoksa atla
      }

      // Sipariş öğelerini kontrol et (siparişler silinmemeli)
      const orderItemsResult = await pool.request().query(`
        SELECT COUNT(id) as count FROM order_items 
        WHERE product_id IN (SELECT id FROM products WHERE category_id = '${categoryId}')
      `);
      
      if (orderItemsResult.recordset[0].count > 0) {
        console.log(`⚠️  Bu kategorideki ${orderItemsResult.recordset[0].count} ürün siparişlerde kullanılıyor. Ürünler silinmeyecek, sadece kategori silinecek.`);
        console.log('   Ürünlerin category_id NULL olacak.\n');
        
        // Ürünlerin category_id'sini NULL yap
        await pool.request().query(`
          UPDATE products SET category_id = NULL WHERE category_id = '${categoryId}'
        `);
        
        console.log(`✓ ${productCount} ürünün category_id NULL yapıldı`);
      } else {
        // Ürünleri sil
        await pool.request().query(`
          DELETE FROM products WHERE category_id = '${categoryId}'
        `);
        
        console.log(`✓ ${productCount} ürün silindi`);
      }
    }

    // Kategoriyi sil
    console.log('\n🗑️  Kategori siliniyor...');
    await pool.request().query(`
      DELETE FROM categories WHERE id = '${categoryId}'
    `);
    console.log(`✓ IPTAL kategorisi silindi`);

    await pool.close();

    console.log('\n✅ İşlem tamamlandı!');
    console.log(`   - Silinen kategori: ${categoryName}`);
    console.log(`   - İşlem gören ürün: ${productCount}\n`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  }
}

deleteIptalCategory().catch(console.error);

