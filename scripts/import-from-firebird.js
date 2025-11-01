const firebird = require('node-firebird');
const sql = require('mssql');

// Firebird veritabanı bağlantı ayarları
// Embedded bağlantı için host ve port gerekmeyebilir
const firebirdConfig = {
  // host ve port kaldırıldı - embedded bağlantı için
  database: 'C:\\Users\\OnurKIRAN\\Desktop\\KIEL30102025\\SultanS.fdb',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000
};

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

// Firebird'den ürünleri çek
async function getProductsFromFirebird() {
  return new Promise((resolve, reject) => {
    firebird.attach(firebirdConfig, (err, db) => {
      if (err) {
        console.error('❌ Firebird bağlantı hatası:', err);
        return reject(err);
      }

      console.log('✅ Firebird bağlantısı başarılı');

      // Önce tablo yapısını kontrol et
      db.query(
        "SELECT RDB$RELATION_NAME FROM RDB$RELATIONS WHERE RDB$SYSTEM_FLAG = 0 AND RDB$RELATION_NAME NOT LIKE 'RDB$%'",
        (err, result) => {
          if (err) {
            db.detach();
            return reject(err);
          }

          console.log('\n📋 Mevcut tablolar:');
          result.forEach(row => {
            console.log('  -', row.RDB_RELATION_NAME?.toString().trim());
          });

          // Ürün tablosunu bulmayı dene (genel isimler)
          const possibleTableNames = ['URUN', 'URUNLER', 'PRODUCT', 'PRODUCTS', 'MAL', 'MALLAR', 'STOK', 'STOKLAR', 'ITEM', 'ITEMS'];
          
          db.query(
            `SELECT RDB$RELATION_NAME FROM RDB$RELATIONS 
             WHERE RDB$SYSTEM_FLAG = 0 
             AND UPPER(RDB$RELATION_NAME) IN (${possibleTableNames.map(n => `'${n}'`).join(',')})`,
            (err, tables) => {
              if (err || !tables || tables.length === 0) {
                // Tüm tabloları listele ve kullanıcıya sor
                console.log('\n⚠️  Ürün tablosu bulunamadı. Lütfen tablo adını manuel olarak belirtin.');
                db.detach();
                return resolve([]);
              }

              const tableName = tables[0].RDB_RELATION_NAME.toString().trim().toUpperCase();
              console.log(`\n📦 Ürün tablosu bulundu: ${tableName}`);

              // Tablo kolonlarını getir
              db.query(
                `SELECT RDB$FIELD_NAME FROM RDB$RELATION_FIELDS 
                 WHERE RDB$RELATION_NAME = ? 
                 ORDER BY RDB$FIELD_POSITION`,
                [tableName],
                (err, columns) => {
                  if (err) {
                    db.detach();
                    return reject(err);
                  }

                  console.log('\n📋 Tablo kolonları:');
                  const columnNames = columns.map(col => col.RDB_FIELD_NAME?.toString().trim());
                  columnNames.forEach(col => console.log('  -', col));

                  // Ürünleri çek (ilk 10 kayıt örnek için)
                  const sql = `SELECT FIRST 10 * FROM "${tableName}"`;
                  db.query(sql, (err, products) => {
                    db.detach();
                    
                    if (err) {
                      return reject(err);
                    }

                    console.log(`\n✅ ${products.length} ürün örneği bulundu:`);
                    if (products.length > 0) {
                      console.log('Örnek kayıt:', JSON.stringify(products[0], null, 2));
                    }

                    resolve({
                      tableName,
                      columns: columnNames,
                      sampleProducts: products
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

// Ürünleri MSSQL'e aktar
async function importProductsToMSSQL(firebirdData) {
  try {
    const pool = await sql.connect(mssqlConfig);
    console.log('\n✅ MSSQL bağlantısı başarılı');

    // Kategori kontrolü - yoksa oluştur
    const checkCategory = await pool.request().query(`
      SELECT id FROM categories WHERE name = 'Firebird Import'
    `);

    let categoryId;
    if (checkCategory.recordset.length === 0) {
      categoryId = `cat-${Date.now()}`;
      await pool.request().query(`
        INSERT INTO categories (id, name, description, is_active, order_index)
        VALUES ('${categoryId}', 'Firebird Import', 'Firebird veritabanından aktarılan ürünler', 1, 999)
      `);
      console.log('✅ Yeni kategori oluşturuldu:', categoryId);
    } else {
      categoryId = checkCategory.recordset[0].id;
      console.log('✅ Mevcut kategori kullanılıyor:', categoryId);
    }

    // Firebird'den tüm ürünleri çek ve aktar
    return new Promise((resolve, reject) => {
      firebird.attach(firebirdConfig, async (err, db) => {
        if (err) {
          return reject(err);
        }

        const tableName = firebirdData.tableName;
        const sqlQuery = `SELECT * FROM "${tableName}"`;
        
        db.query(sqlQuery, async (err, products) => {
          if (err) {
            db.detach();
            return reject(err);
          }

          console.log(`\n📦 ${products.length} ürün bulundu, aktarılıyor...`);

          let imported = 0;
          let skipped = 0;

          for (const product of products) {
            try {
              // Firebird'den gelen veriyi işle (kolon isimlerine göre mapping yapılacak)
              // Örnek mapping - gerçek kolon isimlerine göre düzenlenmeli
              const name = product.AD || product.NAME || product.URUN_ADI || product.URUN_AD || Object.values(product)[0];
              const price = product.FIYAT || product.PRICE || product.FIYAT_TL || 0;
              const code = product.KOD || product.CODE || product.STOK_KOD || null;

              if (!name) {
                skipped++;
                continue;
              }

              const productId = `prod-${Date.now()}-${imported}`;
              
              await pool.request()
                .input('id', sql.VarChar, productId)
                .input('name', sql.VarChar, name.toString().trim())
                .input('description', sql.NVarChar, product.ACIKLAMA || product.DESCRIPTION || null)
                .input('price', sql.Decimal(10, 2), parseFloat(price) || 0)
                .input('categoryId', sql.VarChar, categoryId)
                .input('stockCode', sql.VarChar, code ? code.toString().trim() : null)
                .input('isActive', sql.Bit, 1)
                .query(`
                  INSERT INTO products (id, name, description, price, category_id, stock_code, is_active, order_index)
                  VALUES (@id, @name, @description, @price, @categoryId, @stockCode, @isActive, ${imported})
                `);

              imported++;
              if (imported % 10 === 0) {
                console.log(`  ✓ ${imported} ürün aktarıldı...`);
              }
            } catch (error) {
              console.error('Ürün aktarım hatası:', error);
              skipped++;
            }
          }

          db.detach();
          await pool.close();
          
          console.log(`\n✅ Aktarım tamamlandı!`);
          console.log(`   ✓ Aktarılan: ${imported}`);
          console.log(`   ⏭️  Atlanan: ${skipped}`);
          console.log(`   📦 Toplam: ${products.length}`);

          resolve({ imported, skipped, total: products.length });
        });
      });
    });
  } catch (error) {
    console.error('❌ MSSQL bağlantı hatası:', error);
    throw error;
  }
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🚀 Firebird veritabanından ürün aktarımı başlatılıyor...\n');
    
    const firebirdData = await getProductsFromFirebird();
    
    if (!firebirdData || !firebirdData.tableName) {
      console.log('\n⚠️  Devam etmek için lütfen tablo adını manuel olarak belirtin.');
      return;
    }

    console.log('\n⏳ Ürünler MSSQL veritabanına aktarılıyor...');
    await importProductsToMSSQL(firebirdData);
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

main();

