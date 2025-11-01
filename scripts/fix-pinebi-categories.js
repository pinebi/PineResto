const sql = require('mssql');

const mssqlConfig = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
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
    `);
    
    console.log(`📋 ${pinebiCats.recordset.length} PineBI Import kategorisi bulundu\n`);
    
    if (pinebiCats.recordset.length > 0) {
      // Tek bir PineBI Import kategorisi oluştur veya mevcut olanı bul
      let mainCategoryId = null;
      const mainCatCheck = await pool.request().query(`
        SELECT TOP 1 id FROM categories WHERE name = 'PineBI Import' ORDER BY id
      `);
      
      if (mainCatCheck.recordset.length > 0) {
        mainCategoryId = mainCatCheck.recordset[0].id;
      } else {
        mainCategoryId = `cat-pinebi-import-${Date.now()}`;
        await pool.request().query(`
          INSERT INTO categories (id, name, description, is_active, order_index)
          VALUES ('${mainCategoryId}', 'PineBI Import', 'PineBI veritabanından aktarılan ürünler', 1, 999)
        `);
      }
      
      console.log(`✅ Ana kategori ID: ${mainCategoryId}\n`);
      
      // Tüm PineBI Import kategorilerindeki ürünleri ana kategoriye taşı
      let movedCount = 0;
      for (const cat of pinebiCats.recordset) {
        if (cat.id !== mainCategoryId) {
          const result = await pool.request().query(`
            UPDATE products 
            SET category_id = '${mainCategoryId}'
            WHERE category_id = '${cat.id}'
          `);
          movedCount += result.rowsAffected[0];
          
          // Boş kategorileri sil
          if (cat.product_count > 0) {
            await pool.request().query(`DELETE FROM categories WHERE id = '${cat.id}'`);
          }
        }
      }
      
      console.log(`✅ ${movedCount} ürün ana kategoriye taşındı`);
      console.log(`✅ ${pinebiCats.recordset.length - 1} gereksiz kategori silindi`);
      console.log(`\n📦 Toplam ${movedCount} ürün artık tek bir 'PineBI Import' kategorisinde\n`);
    }
    
    await pool.close();
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
})();




