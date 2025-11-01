const fs = require('fs');
const path = require('path');
const sql = require('mssql');

// MSSQL bağlantı ayarları
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

const pinebiPath = 'C:\\Users\\OnurKIRAN\\Desktop\\pinebi';

// JSON dosyalarını oku
function readJSONFiles() {
  const files = fs.readdirSync(pinebiPath).filter(f => f.endsWith('.json'));
  const data = {};
  
  files.forEach(file => {
    const filePath = path.join(pinebiPath, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      // BOM'u kaldır
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      const json = JSON.parse(content);
      // Dosya adına göre ayır
      if (file.includes('ITEM_GROUP')) {
        data.itemGroups = json;
      } else if (file.includes('ITEM') && !file.includes('GROUP') && !file.includes('LINKED') && !file.includes('NOTE') && !file.includes('IMAGE')) {
        // UUID dosyalarını kontrol et - ITEMS olabilir
        const firstItem = Array.isArray(json) ? json[0] : json;
        if (firstItem && firstItem.$type && firstItem.$type.includes('clsItem')) {
          data.items = json;
        }
      } else if (file.includes('NOTE')) {
        data.itemNotes = json;
      }
      
      // UUID isimli dosyaları kontrol et - büyük olan muhtemelen ITEMS
      if (Array.isArray(json) && json.length > 0) {
        const sample = json[0];
        if (sample && sample.$type) {
          // Kategoriler (ItemGroups)
          if (sample.$type.includes('clsItemGroup') && !sample.ITEM) {
            if (!data.itemGroups) {
              data.itemGroups = [];
            }
            data.itemGroups = data.itemGroups.concat(json);
            console.log(`✓ ITEM_GROUPS bulundu: ${file} (${json.length} kategori)`);
          }
          // Ürünler (Items)
          else if (sample.$type.includes('clsItem') && !sample.$type.includes('Group') && !sample.$type.includes('Note')) {
            if (!data.items) {
              data.items = [];
            }
            data.items = data.items.concat(json);
            console.log(`✓ ITEMS bulundu: ${file} (${json.length} ürün)`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ ${file} okunamadı:`, error.message);
    }
  });
  
  return data;
}

// Kategorileri aktar
async function importCategories(pool, itemGroups) {
  if (!itemGroups || !Array.isArray(itemGroups) || itemGroups.length === 0) {
    console.log('⚠️  Kategori bulunamadı');
    return {};
  }

  console.log(`\n📁 ${itemGroups.length} kategori bulundu, aktarılıyor...`);
  
  const categoryMap = {};
  let imported = 0;

  for (const group of itemGroups) {
    try {
      // Sadece aktif kategorileri aktar
      if (group.DISPLAY_STATE === false) {
        continue;
      }

      const code = group.CODE || group._id;
      const name = group.DESCRIPTION || group.CODE || 'Kategori';
      const displayName = group.DISPLAY_DESCRIPTION || name;
      
      // Kategori zaten var mı kontrol et
      const existing = await pool.request().query(`
        SELECT id FROM categories WHERE name = '${name.replace(/'/g, "''")}'
      `);

      let categoryId;
      if (existing.recordset.length > 0) {
        categoryId = existing.recordset[0].id;
        categoryMap[code] = categoryId;
      } else {
        categoryId = `cat-${Date.now()}-${imported}`;
        await pool.request().query(`
          INSERT INTO categories (id, name, description, is_active, order_index)
          VALUES ('${categoryId}', '${name.replace(/'/g, "''")}', '${(displayName || '').replace(/'/g, "''")}', 1, ${group.DISPLAY_ORDER || imported})
        `);
        categoryMap[code] = categoryId;
        imported++;
      }
    } catch (error) {
      console.error(`Kategori hatası (${group.CODE}):`, error.message);
    }
  }

  console.log(`✅ ${imported} yeni kategori oluşturuldu, ${Object.keys(categoryMap).length} toplam kategori eşleştirildi`);
  return categoryMap;
}

// Ürünleri aktar
async function importProducts(pool, items, categoryMap) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log('⚠️  Ürün bulunamadı');
    return;
  }

  console.log(`\n📦 ${items.length} ürün bulundu, aktarılıyor...`);
  
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // Item objesi item içinde olabilir
      const itemData = item.ITEM || item;
      
      if (!itemData || !itemData.DESCRIPTION) {
        skipped++;
        continue;
      }

      const code = itemData.CODE || itemData._id || `item-${imported}`;
      const name = itemData.DESCRIPTION || 'Ürün';
      const price = itemData.PRICE || itemData.SALE_PRICE || 0;
      
      // Kategori eşleştirme - önce ITEM_GROUP'dan dene
      let categoryId = null;
      const itemGroup = item.ITEM_GROUP || itemData.ITEM_GROUP;
      
      if (itemGroup) {
        // ITEM_GROUP bir obje ise CODE veya DESCRIPTION'dan kategori bul
        const groupCode = itemGroup.CODE || itemGroup.DESCRIPTION || itemGroup._id;
        if (groupCode) {
          // categoryMap'te CODE ile ara
          categoryId = categoryMap[groupCode];
          
          // Bulunamazsa DESCRIPTION ile ara
          if (!categoryId && itemGroup.DESCRIPTION) {
            for (const [catCode, catId] of Object.entries(categoryMap)) {
              // Kategori adını veritabanından kontrol et
              const catCheck = await pool.request().query(`
                SELECT id FROM categories WHERE id = '${catId}' AND (name LIKE '%${itemGroup.DESCRIPTION.replace(/'/g, "''")}%' OR description LIKE '%${itemGroup.DESCRIPTION.replace(/'/g, "''")}%')
              `);
              if (catCheck.recordset.length > 0) {
                categoryId = catId;
                break;
              }
            }
          }
        }
      }
      
      // Hala kategori bulunamadıysa, tek bir PineBI Import kategorisi kullan
      if (!categoryId) {
        // Önce PineBI Import kategorisini kontrol et
        const pinebiCatCheck = await pool.request().query(`
          SELECT id FROM categories WHERE name = 'PineBI Import' ORDER BY id
        `);
        
        if (pinebiCatCheck.recordset.length > 0) {
          categoryId = pinebiCatCheck.recordset[0].id;
        } else {
          // Yeni PineBI Import kategorisi oluştur
          const defaultCatId = `cat-pinebi-import-${Date.now()}`;
          await pool.request().query(`
            INSERT INTO categories (id, name, description, is_active, order_index)
            VALUES ('${defaultCatId}', 'PineBI Import', 'PineBI veritabanından aktarılan ürünler', 1, 999)
          `);
          categoryId = defaultCatId;
        }
      }

      const productId = `prod-${Date.now()}-${imported}`;
      const barcode = itemData.BARCODE || null;
      const description = itemData.DESCRIPTION || name;
      
      await pool.request()
        .input('id', sql.VarChar, productId)
        .input('name', sql.VarChar, name.substring(0, 255))
        .input('description', sql.NVarChar, description.length > 0 ? description.substring(0, 4000) : null)
        .input('price', sql.Decimal(10, 2), parseFloat(price) || 0)
        .input('categoryId', sql.VarChar, categoryId)
        .input('stockCode', sql.VarChar, code.toString().substring(0, 100))
        .input('barcode', sql.VarChar, barcode ? barcode.toString().substring(0, 100) : null)
        .input('isActive', sql.Bit, itemData.IS_ACTIVE !== false ? 1 : 0)
        .query(`
          INSERT INTO products (id, name, description, price, category_id, stock_code, is_active, order_index, source)
          VALUES (@id, @name, @description, @price, @categoryId, @stockCode, @isActive, ${imported}, 'PineBI')
        `);

      imported++;
      if (imported % 10 === 0) {
        console.log(`  ✓ ${imported} ürün aktarıldı...`);
      }
    } catch (error) {
      if (error.message.includes('PRIMARY KEY') || error.message.includes('duplicate')) {
        // Zaten var, atla
        skipped++;
      } else {
        console.error(`Ürün aktarım hatası (${item.ITEM?.CODE || 'bilinmeyen'}):`, error.message);
        skipped++;
      }
    }
  }

  console.log(`\n✅ Aktarım tamamlandı!`);
  console.log(`   ✓ Aktarılan: ${imported}`);
  console.log(`   ⏭️  Atlanan: ${skipped}`);
  console.log(`   📦 Toplam: ${items.length}`);
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🚀 PineBI JSON dosyalarından ürün aktarımı başlatılıyor...\n');
    
    // JSON dosyalarını oku
    const data = readJSONFiles();
    
    // MSSQL'e bağlan
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');
    
    // Kategorileri aktar
    const categoryMap = await importCategories(pool, data.itemGroups);
    
    // Ürünleri aktar
    if (data.items && data.items.length > 0) {
      await importProducts(pool, data.items, categoryMap);
    } else {
      console.log('\n⚠️  Ürün bulunamadı. Dosya yapısını kontrol edin.');
      console.log('   Mevcut dosyalar:');
      const files = fs.readdirSync(pinebiPath);
      files.filter(f => f.endsWith('.json')).forEach(f => {
        const stats = fs.statSync(path.join(pinebiPath, f));
        console.log(`   - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    }
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

main();

