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
    
    // PineBI Import kategorisini kontrol et
    const result = await pool.request().query(`
      SELECT id, name, description, 
        (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories 
      WHERE name LIKE '%PineBI%' OR name LIKE '%Import%' 
      ORDER BY name
    `);
    
    console.log('PineBI Import kategorileri:');
    console.log(JSON.stringify(result.recordset, null, 2));
    
    // Bu kategorideki ürünleri göster
    if (result.recordset.length > 0) {
      const pinebiCatId = result.recordset[0].id;
      const products = await pool.request().query(`
        SELECT TOP 10 id, name, stock_code, category_id 
        FROM products 
        WHERE category_id = '${pinebiCatId}'
      `);
      
      console.log(`\nBu kategorideki örnek ürünler (ilk 10):`);
      console.log(JSON.stringify(products.recordset, null, 2));
    }
    
    await pool.close();
  } catch (error) {
    console.error('Hata:', error);
  }
})();




