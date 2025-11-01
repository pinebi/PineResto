const XLSX = require('xlsx');
const sql = require('mssql');
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
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

const excelFilePath = 'D:\\1.XLSX';

async function importFromExcel() {
  console.log('🚀 Excel dosyasından ürün aktarımı başlatılıyor...\n');
  console.log(`📄 Dosya: ${excelFilePath}\n`);

  try {
    // Excel dosyasını oku
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Excel dosyası okundu: ${sheetName}`);
    console.log(`✓ ${data.length} satır bulundu\n`);

    if (data.length === 0) {
      console.log('⚠️  Excel dosyasında veri bulunamadı!');
      return;
    }

    // Veritabanına bağlan
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı\n');

    // Kategorileri önce oluştur ve map oluştur
    console.log('📁 Kategoriler hazırlanıyor...');
    const categoryMap = {};
    const categories = [...new Set(data.map(row => row['KATEGORİ'] || row['KATEGORİ'] || 'Genel').filter(c => c))];
    
    for (const categoryName of categories) {
      if (!categoryName) continue;
      
      // Kategori zaten var mı kontrol et
      const existingCategory = await pool.request().query(`
        SELECT id FROM categories WHERE name = '${categoryName.toString().replace(/'/g, "''")}'
      `);
      
      let categoryId;
      if (existingCategory.recordset.length > 0) {
        categoryId = existingCategory.recordset[0].id;
        console.log(`   ✓ Kategori mevcut: ${categoryName} (${categoryId})`);
      } else {
        // Yeni kategori oluştur
        categoryId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await pool.request().query(`
          INSERT INTO categories (id, name, description, is_active, order_index)
          VALUES ('${categoryId}', '${categoryName.toString().replace(/'/g, "''")}', '', 1, 999)
        `);
        console.log(`   ✓ Yeni kategori oluşturuldu: ${categoryName} (${categoryId})`);
      }
      
      categoryMap[categoryName.toString()] = categoryId;
    }
    
    console.log(`\n📦 ${Object.keys(categoryMap).length} kategori hazır\n`);

    // Ürünleri aktar
    console.log('📦 Ürünler aktarılıyor...\n');
    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Gerekli alanları kontrol et
        const urunKodu = row['ÜRÜN KODU'] || row['ÜRÜN KODU'] || null;
        const barkod = row['BARKOD'] || null;
        const kategori = row['KATEGORİ'] || row['KATEGORİ'] || 'Genel';
        const urunAdi = row['ÜRÜN ADI'] || row['ÜRÜN ADI'] || null;
        const fiyat = row['FİYAT'] || row['FİYAT'] || 0;
        const vergi = row['VERGİ'] || 0;
        const zeminRengi = row['ZEMİN RENGİ'] || null;
        const metinRengi = row['METİN RENGİ'] || null;
        const listeSira = row['LİSTELEME SIRASI'] || row['LİSTELEME SIRASI'] || i + 1;

        if (!urunAdi) {
          skipped++;
          errors.push(`Satır ${i + 2}: Ürün adı bulunamadı`);
          continue;
        }

        // Kategori ID'sini al
        const categoryId = categoryMap[kategori.toString()] || categoryMap['Genel'];
        if (!categoryId) {
          skipped++;
          errors.push(`Satır ${i + 2}: Kategori bulunamadı: ${kategori}`);
          continue;
        }

        // Ürün kodu yoksa oluştur
        const stockCode = urunKodu || barkod || `prod-${Date.now()}-${i}`;
        
        // Ürün zaten var mı kontrol et
        const existingProduct = await pool.request().query(`
          SELECT id FROM products WHERE stock_code = '${stockCode.toString().replace(/'/g, "''")}' OR name = '${urunAdi.toString().replace(/'/g, "''")}'
        `);

        let productId;
        if (existingProduct.recordset.length > 0) {
          // Mevcut ürünü güncelle
          productId = existingProduct.recordset[0].id;
          await pool.request().query(`
            UPDATE products 
            SET name = '${urunAdi.toString().replace(/'/g, "''")}',
                price = ${parseFloat(fiyat) || 0},
                category_id = '${categoryId}',
                stock_code = '${stockCode.toString().replace(/'/g, "''")}',
                order_index = ${parseInt(listeSira) || i + 1},
                updated_at = GETDATE()
            WHERE id = '${productId}'
          `);
          console.log(`   ↻ Güncellendi: ${urunAdi} (${stockCode})`);
        } else {
          // Yeni ürün oluştur
          productId = `prod-${Date.now()}-${i}`;
          await pool.request().query(`
            INSERT INTO products (
              id, name, description, price, purchase_price, 
              category_id, stock_code, stock, is_active, order_index, 
              created_at, updated_at
            )
            VALUES (
              '${productId}',
              '${urunAdi.toString().replace(/'/g, "''")}',
              '',
              ${parseFloat(fiyat) || 0},
              ${parseFloat(fiyat) || 0},
              '${categoryId}',
              '${stockCode.toString().replace(/'/g, "''")}',
              0,
              1,
              ${parseInt(listeSira) || i + 1},
              GETDATE(),
              GETDATE()
            )
          `);
          console.log(`   ✓ Eklendi: ${urunAdi} (${stockCode}) - €${parseFloat(fiyat) || 0}`);
        }

        imported++;

      } catch (error) {
        skipped++;
        errors.push(`Satır ${i + 2}: ${error.message}`);
        console.error(`   ❌ Hata (Satır ${i + 2}): ${error.message}`);
      }

      // Her 10 üründe bir ilerleme göster
      if ((i + 1) % 10 === 0) {
        console.log(`   📊 İlerleme: ${i + 1}/${data.length} (${imported} başarılı, ${skipped} atlandı)`);
      }
    }

    await pool.close();

    console.log('\n✅ Aktarım tamamlandı!');
    console.log(`   ✓ Aktarılan: ${imported}`);
    console.log(`   ⏭️  Atlanan: ${skipped}`);
    console.log(`   📦 Toplam: ${data.length}\n`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('⚠️  Hatalar:');
      errors.forEach(error => console.log(`   - ${error}`));
      console.log('');
    } else if (errors.length > 10) {
      console.log(`⚠️  ${errors.length} hata oluştu (ilk 10 gösteriliyor):`);
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      console.log('');
    }

  } catch (error) {
    console.error('❌ Excel aktarım hatası:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

importFromExcel().catch(console.error);

