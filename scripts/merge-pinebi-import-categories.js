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
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');
    
    // Tüm PineBI Import kategorilerini bul
    const pinebiCats = await pool.request().query(`
      SELECT id, name, 
        (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories 
      WHERE name = 'PineBI Import'
      ORDER BY id
    `);
    
    console.log(`📋 ${pinebiCats.recordset.length} PineBI Import kategorisi bulundu\n`);
    
    if (pinebiCats.recordset.length === 0) {
      console.log('ℹ️  PineBI Import kategorisi bulunamadı');
      await pool.close();
      return;
    }
    
    if (pinebiCats.recordset.length === 1) {
      console.log('ℹ️  Zaten tek bir PineBI Import kategorisi var');
      await pool.close();
      return;
    }
    
    // İlk kategoriyi ana kategori olarak kullan
    const mainCategoryId = pinebiCats.recordset[0].id;
    const mainCategoryProducts = pinebiCats.recordset[0].product_count;
    
    console.log(`✅ Ana kategori ID: ${mainCategoryId}`);
    console.log(`   Bu kategorideki ürün sayısı: ${mainCategoryProducts}\n`);
    
    // Diğer kategorilerdeki ürünleri ana kategoriye taşı ve kategorileri sil
    let totalMoved = 0;
    let totalDeleted = 0;
    
    for (let i = 1; i < pinebiCats.recordset.length; i++) {
      const cat = pinebiCats.recordset[i];
      
      if (cat.product_count > 0) {
        // Ürünleri taşı
        const result = await pool.request().query(`
          UPDATE products 
          SET category_id = '${mainCategoryId}'
          WHERE category_id = '${cat.id}'
        `);
        totalMoved += result.rowsAffected[0];
        console.log(`   ✓ ${cat.id}: ${cat.product_count} ürün taşındı`);
      }
      
      // Kategoriyi sil
      await pool.request().query(`DELETE FROM categories WHERE id = '${cat.id}'`);
      totalDeleted++;
      console.log(`   ✓ ${cat.id}: kategori silindi`);
    }
    
    console.log(`\n✅ İşlem tamamlandı!`);
    console.log(`   📦 Taşınan ürün sayısı: ${totalMoved}`);
    console.log(`   🗑️  Silinen kategori sayısı: ${totalDeleted}`);
    console.log(`   📁 Kalan PineBI Import kategorisi: 1`);
    
    // Son durumu göster
    const finalCheck = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM categories WHERE name = 'PineBI Import') as category_count,
        (SELECT COUNT(*) FROM products WHERE category_id IN (SELECT id FROM categories WHERE name = 'PineBI Import')) as product_count
    `);
    
    console.log(`\n📊 Son durum:`);
    console.log(`   - PineBI Import kategorisi: ${finalCheck.recordset[0].category_count}`);
    console.log(`   - Bu kategorideki ürün: ${finalCheck.recordset[0].product_count}`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
})();




