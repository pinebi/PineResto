const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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

const pinebiPath = 'C:\\Users\\OnurKIRAN\\Desktop\\pinebi';

// JSON dosyalarını oku ve ürün-kategori eşleştirmelerini yap
async function fixCategories() {
  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');
    
    // Tüm kategorileri çek
    const allCategories = await pool.request().query(`
      SELECT id, name, description FROM categories WHERE name != 'PineBI Import'
    `);
    
    console.log(`📁 ${allCategories.recordset.length} kategori bulundu\n`);
    
    // Kategori map oluştur (CODE ve DESCRIPTION'a göre)
    const categoryMap = {};
    allCategories.recordset.forEach(cat => {
      const key = (cat.name || '').toLowerCase().trim();
      categoryMap[key] = cat.id;
      if (cat.description) {
        const descKey = cat.description.toLowerCase().trim();
        categoryMap[descKey] = cat.id;
      }
    });
    
    // JSON dosyalarını oku
    const files = fs.readdirSync(pinebiPath).filter(f => f.endsWith('.json'));
    const allItems = [];
    
    files.forEach(file => {
      const filePath = path.join(pinebiPath, file);
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        const json = JSON.parse(content);
        
        // Ürünleri topla
        if (Array.isArray(json)) {
          json.forEach(item => {
            if (item.$type && item.$type.includes('clsItem') && !item.$type.includes('Group') && !item.$type.includes('Note')) {
              allItems.push(item);
            }
          });
        }
      } catch (e) {
        // Ignore
      }
    });
    
    console.log(`📦 ${allItems.length} ürün bulundu JSON dosyalarında\n`);
    
    // PineBI Import kategorisindeki ürünleri bul
    const pinebiCatResult = await pool.request().query(`
      SELECT id FROM categories WHERE name = 'PineBI Import' ORDER BY id
    `);
    
    if (pinebiCatResult.recordset.length === 0) {
      console.log('⚠️  PineBI Import kategorisi bulunamadı');
      await pool.close();
      return;
    }
    
    const pinebiCatId = pinebiCatResult.recordset[0].id;
    
    const productsToFix = await pool.request().query(`
      SELECT id, name, stock_code FROM products WHERE category_id = '${pinebiCatId}'
    `);
    
    console.log(`🔧 ${productsToFix.recordset.length} ürün düzeltilecek\n`);
    
    // Ürün koduna göre JSON'dan kategori bul
    let fixed = 0;
    let notFound = 0;
    
    for (const product of productsToFix.recordset) {
      // JSON'da bu ürünü bul
      const jsonItem = allItems.find(item => {
        const itemData = item.ITEM || item;
        const itemCode = itemData.CODE || itemData._id;
        return itemCode === product.stock_code || itemData.DESCRIPTION === product.name;
      });
      
      if (jsonItem) {
        const itemGroup = jsonItem.ITEM_GROUP || (jsonItem.ITEM ? jsonItem.ITEM.ITEM_GROUP : null);
        
        if (itemGroup) {
          const groupName = itemGroup.DESCRIPTION || itemGroup.CODE || '';
          const groupKey = groupName.toLowerCase().trim();
          
          if (categoryMap[groupKey]) {
            // Kategori eşleşti
            await pool.request().query(`
              UPDATE products SET category_id = '${categoryMap[groupKey]}' WHERE id = '${product.id}'
            `);
            fixed++;
            if (fixed % 10 === 0) {
              console.log(`  ✓ ${fixed} ürün düzeltildi...`);
            }
            continue;
          }
        }
      }
      
      notFound++;
    }
    
    console.log(`\n✅ İşlem tamamlandı!`);
    console.log(`   ✓ Düzeltilen: ${fixed}`);
    console.log(`   ⏭️  Düzeltilemeyen: ${notFound}`);
    console.log(`   📦 Toplam: ${productsToFix.recordset.length}`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

fixCategories();




