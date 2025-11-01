const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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
  const pool = await sql.connect(mssqlConfig);
  
  // PineBI Import'taki ilk 3 ürün
  const products = await pool.request().query(`
    SELECT TOP 3 id, name, stock_code 
    FROM products 
    WHERE category_id IN (SELECT id FROM categories WHERE name = 'PineBI Import')
  `);
  
  console.log('Veritabanındaki PineBI Import ürünleri:');
  products.recordset.forEach(p => {
    console.log(`  - ${p.name} | CODE: ${p.stock_code}`);
  });
  
  // JSON dosyasından ilk 3 ürün
  const filePath = 'C:\\Users\\OnurKIRAN\\Desktop\\pinebi\\711904b9-622e-4dbe-801d-256efdc3f341.json';
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const json = JSON.parse(content);
  
  console.log('\nJSON dosyasındaki ilk 3 ürün:');
  json.slice(0, 3).forEach(item => {
    const code = item.CODE || item._id;
    const name = item.DESCRIPTION;
    const group = item.ITEM_GROUP ? (item.ITEM_GROUP.DESCRIPTION || item.ITEM_GROUP.CODE) : 'YOK';
    console.log(`  - ${name} | CODE: ${code} | GROUP: ${group}`);
  });
  
  await pool.close();
})();




