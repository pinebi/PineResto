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

(async () => {
  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');
    
    // Tüm kategorileri çek
    const allCategories = await pool.request().query(`
      SELECT id, name, description FROM categories WHERE name != 'PineBI Import'
    `);
    
    console.log(`📁 ${allCategories.recordset.length} kategori bulundu\n`);
    
    // Kategori map oluştur (hem CODE hem DESCRIPTION'a göre)
    const categoryMap = {};
    allCategories.recordset.forEach(cat => {
      const nameKey = (cat.name || '').toLowerCase().trim();
      categoryMap[nameKey] = cat.id;
      if (cat.description) {
        const descKey = cat.description.toLowerCase().trim();
        categoryMap[descKey] = cat.id;
      }
    });
    
    // ITEM_GROUPS dosyasını oku - tüm JSON dosyalarını kontrol et
    let itemGroups = [];
    const jsonFiles = fs.readdirSync(pinebiPath).filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      try {
        let content = fs.readFileSync(path.join(pinebiPath, file), 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        const json = JSON.parse(content);
        
        if (Array.isArray(json) && json.length > 0) {
          const sample = json[0];
          // clsItemGroup tipindeki dosyaları bul
          if (sample.$type && sample.$type.includes('clsItemGroup') && !sample.ITEM) {
            itemGroups = json;
            console.log(`✓ ITEM_GROUPS bulundu: ${file} (${json.length} kategori)\n`);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }
    
    if (itemGroups.length === 0) {
      console.log('⚠️  ITEM_GROUPS bulunamadı, ürün dosyalarından kategoriler çıkarılacak\n');
    }
    
    // ITEM_GROUP map oluştur (CODE -> DESCRIPTION)
    const itemGroupMap = {};
    itemGroups.forEach(group => {
      const code = group.CODE || '';
      const desc = group.DESCRIPTION || group.CODE || '';
      itemGroupMap[code.toLowerCase().trim()] = desc;
      itemGroupMap[desc.toLowerCase().trim()] = desc;
    });
    
    if (itemGroups.length > 0) {
      console.log(`📋 ${itemGroups.length} kategori grubu bulundu\n`);
    }
    
    // PineBI Import kategorisindeki ürünleri bul
    const pinebiCatResult = await pool.request().query(`
      SELECT id FROM categories WHERE name = 'PineBI Import' ORDER BY id
    `);
    
    if (pinebiCatResult.recordset.length === 0) {
      console.log('ℹ️  PineBI Import kategorisi bulunamadı');
      await pool.close();
      return;
    }
    
    const pinebiCatId = pinebiCatResult.recordset[0].id;
    
    const productsToFix = await pool.request().query(`
      SELECT id, name, stock_code FROM products WHERE category_id = '${pinebiCatId}'
    `);
    
    console.log(`🔧 ${productsToFix.recordset.length} ürün kategorilendirilecek\n`);
    
    // JSON dosyalarından tüm ürünleri topla - TÜM dosyaları kontrol et
    const productFiles = jsonFiles.filter(f => !f.includes('NOTE') && !f.includes('SETTING'));
    const allItems = [];
    
    productFiles.forEach(file => {
      const filePath = path.join(pinebiPath, file);
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        const json = JSON.parse(content);
        
        if (Array.isArray(json)) {
          json.forEach(item => {
            // Tüm clsItem tipindeki ürünleri al (sadece ürün dosyalarından değil, her yerden)
            if (item.$type && item.$type.includes('clsItem') && !item.$type.includes('Group') && !item.$type.includes('Note')) {
              allItems.push(item);
            }
            // ITEM_GROUP içinde ITEM varsa onu da al
            if (item.ITEM && item.ITEM.$type && item.ITEM.$type.includes('clsItem')) {
              allItems.push({ ...item.ITEM, ITEM_GROUP: item });
            }
          });
        }
      } catch (e) {
        // Ignore
      }
    });
    
    console.log(`📦 ${allItems.length} ürün bulundu JSON dosyalarında\n`);
    
    // Ürünleri kategoriye eşleştir
    let fixed = 0;
    let notFound = 0;
    const categoryStats = {};
    
    // Debug: İlk 3 ürünü göster
    console.log('\n🔍 Debug - İlk 3 ürün:');
    productsToFix.recordset.slice(0, 3).forEach(p => {
      console.log(`   DB: ${p.name} (CODE: ${p.stock_code})`);
    });
    
    if (allItems.length > 0) {
      console.log('\n🔍 Debug - JSON\'dan ilk 3 ürün:');
      allItems.slice(0, 3).forEach(item => {
        const itemData = item.ITEM || item;
        const code = itemData.CODE || itemData._id;
        const name = itemData.DESCRIPTION;
        const group = item.ITEM_GROUP ? (item.ITEM_GROUP.DESCRIPTION || item.ITEM_GROUP.CODE) : 'YOK';
        console.log(`   JSON: ${name} (CODE: ${code}, GROUP: ${group})`);
      });
    }
    
    for (const product of productsToFix.recordset) {
      // JSON'da bu ürünü bul
      const jsonItem = allItems.find(item => {
        const itemData = item.ITEM || item;
        const itemCode = (itemData.CODE || itemData._id || '').toString().trim();
        const itemName = (itemData.DESCRIPTION || '').toString().trim();
        const productCode = (product.stock_code || '').toString().trim();
        const productName = (product.name || '').toString().trim();
        
        // Daha esnek eşleştirme
        const codeMatch = itemCode && productCode && (
          itemCode === productCode ||
          itemCode.toLowerCase() === productCode.toLowerCase()
        );
        
        const nameMatch = itemName && productName && (
          itemName.toLowerCase() === productName.toLowerCase() ||
          itemName.toLowerCase().includes(productName.toLowerCase()) ||
          productName.toLowerCase().includes(itemName.toLowerCase())
        );
        
        return codeMatch || nameMatch;
      });
      
      if (jsonItem && jsonItem.ITEM_GROUP) {
        const itemGroup = jsonItem.ITEM_GROUP;
        const groupCode = (itemGroup.CODE || '').toString().trim();
        const groupDesc = (itemGroup.DESCRIPTION || groupCode || '').toString().trim();
        
        // Önce CODE ile eşleştir
        let matchedCategoryId = null;
        
        // ITEM_GROUP CODE'dan kategori adını bul
        const categoryName = itemGroupMap[groupCode.toLowerCase()] || 
                            itemGroupMap[groupDesc.toLowerCase()] || 
                            groupDesc;
        
        // Kategori map'te ara
        const categoryKey = categoryName.toLowerCase().trim();
        matchedCategoryId = categoryMap[categoryKey];
        
        // Bulunamazsa benzer isimlerle dene
        if (!matchedCategoryId) {
          // Önce kısmi eşleşme dene
          for (const [catName, catId] of Object.entries(categoryMap)) {
            if (catName.includes(categoryKey) || categoryKey.includes(catName)) {
              matchedCategoryId = catId;
              break;
            }
          }
          
          // Hala bulunamazsa tüm kategorileri kontrol et
          if (!matchedCategoryId) {
            const allCatsResult = await pool.request().query(`
              SELECT id, name, description 
              FROM categories 
              WHERE name != 'PineBI Import'
            `);
            
            for (const cat of allCatsResult.recordset) {
              const catName = (cat.name || '').toLowerCase().trim();
              const catDesc = (cat.description || '').toLowerCase().trim();
              
              if (catName.includes(categoryKey) || categoryKey.includes(catName) ||
                  catDesc.includes(categoryKey) || categoryKey.includes(catDesc)) {
                matchedCategoryId = cat.id;
                break;
              }
            }
          }
        }
        
        if (matchedCategoryId) {
          await pool.request().query(`
            UPDATE products SET category_id = '${matchedCategoryId}' WHERE id = '${product.id}'
          `);
          fixed++;
          
          // İstatistik tut
          const catName = allCategories.recordset.find(c => c.id === matchedCategoryId)?.name || 'Bilinmeyen';
          categoryStats[catName] = (categoryStats[catName] || 0) + 1;
          
          if (fixed % 10 === 0) {
            console.log(`  ✓ ${fixed} ürün kategorilendirildi...`);
          }
        } else {
          notFound++;
        }
      } else {
        notFound++;
      }
    }
    
    console.log(`\n✅ İşlem tamamlandı!`);
    console.log(`   ✓ Kategorilendirilen: ${fixed}`);
    console.log(`   ⏭️  Kategorilendirilemeyen: ${notFound}`);
    console.log(`   📦 Toplam: ${productsToFix.recordset.length}`);
    
    if (Object.keys(categoryStats).length > 0) {
      console.log(`\n📊 Kategori dağılımı:`);
      Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count} ürün`);
      });
    }
    
    // Son durum
    const finalCheck = await pool.request().query(`
      SELECT COUNT(*) as count FROM products WHERE category_id = '${pinebiCatId}'
    `);
    
    console.log(`\n📊 PineBI Import kategorisinde kalan ürün: ${finalCheck.recordset[0].count}`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
})();

