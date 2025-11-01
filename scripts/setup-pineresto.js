const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: '185.210.92.248',
  port: 1433,
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: 'PineResto',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 30000,
};

async function setup() {
  console.log('🚀 PineResto Tam Kurulum\n');

  try {
    const pool = await sql.connect(config);
    console.log('✅ PineResto veritabanına bağlandı\n');

    // SQL dosyasını oku (USE PineResto hariç)
    const sqlPath = path.join(__dirname, '..', 'database', 'PineResto-MSSQL.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // USE PineResto satırını kaldır (zaten bağlıyız)
    sqlContent = sqlContent.replace(/USE\s+PineResto\s*;?\s*GO/gi, '');

    // Batch'leri ayır
    const batches = sqlContent
      .split(/^\s*GO\s*$/gmi)
      .map(b => b.trim())
      .filter(b => b.length > 0 && !b.startsWith('--'));

    console.log(`📝 ${batches.length} SQL batch bulundu\n`);
    console.log('⚙️  Tablolar oluşturuluyor...\n');

    for (const batch of batches) {
      try {
        await pool.request().query(batch);
        
        if (batch.toUpperCase().includes('CREATE TABLE')) {
          const tableName = batch.match(/CREATE TABLE \[?(\w+)\]?/i)?.[1];
          console.log(`   ✅ ${tableName}`);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`   ⚠️  ${err.message.substring(0, 60)}...`);
        }
      }
    }

    console.log('\n📝 Veriler ekleniyor...\n');

    // Kullanıcılar
    await pool.request().query(`
      INSERT INTO users (id, username, email, password_hash, full_name, phone, role, employee_id, department, avatar) VALUES
      ('admin-1', 'admin', 'admin@pineresto.com', '$2a$10$demo_hash', 'Admin Kullanıcı', '0532 000 0001', 'admin', 'EMP-001', 'Yönetim', '👨‍💼'),
      ('user-2', 'garson1', 'ahmet@pineresto.com', '$2a$10$demo_hash', 'Ahmet Yılmaz', '0532 111 2222', 'waiter', 'EMP-002', 'Servis', '👨‍🍳'),
      ('user-3', 'mutfak1', 'fatma@pineresto.com', '$2a$10$demo_hash', 'Fatma Demir', '0532 333 4444', 'kitchen', 'EMP-003', 'Mutfak', '👩‍🍳'),
      ('user-4', 'kurye1', 'mehmet@pineresto.com', '$2a$10$demo_hash', 'Mehmet Kaya', '0532 555 6666', 'delivery', 'EMP-004', 'Teslimat', '🚴'),
      ('user-5', 'kasa1', 'ayse@pineresto.com', '$2a$10$demo_hash', 'Ayşe Şahin', '0532 777 8888', 'cashier', 'EMP-005', 'Kasa', '💰')
    `);
    console.log('   ✅ Kullanıcılar (5)');

    await pool.request().query(`
      INSERT INTO categories (id, name, description, icon, is_active, order_index) VALUES
      ('cat-1', 'Sıcak Yemekler', 'Ana yemekler ve kebaplar', '🍖', 1, 1),
      ('cat-2', 'İçecekler', 'Soğuk ve sıcak içecekler', '☕', 1, 2),
      ('cat-3', 'Tatlılar', 'Geleneksel tatlılar', '🍰', 1, 3),
      ('cat-4', 'Kahvaltı', 'Kahvaltı menüleri', '🍳', 1, 4)
    `);
    console.log('   ✅ Kategoriler (4)');

    await pool.request().query(`
      INSERT INTO products (id, name, description, price, purchase_price, category_id, stock_code, stock, image_url, is_active, order_index) VALUES
      ('prod-1', 'Adana Kebap', 'Acılı kıyma kebap', 120.00, 80.00, 'cat-1', 'PRD-001', 50, '🌶️', 1, 1),
      ('prod-2', 'İskender', 'Döner üzerine tereyağ ve yoğurt', 160.00, 110.00, 'cat-1', 'PRD-002', 30, '🍖', 1, 2),
      ('prod-3', 'Pide', 'Kaşarlı pide', 80.00, 50.00, 'cat-1', 'PRD-003', 40, '🥟', 1, 3),
      ('prod-4', 'Çay', 'Demleme çay', 10.00, 3.00, 'cat-2', 'PRD-004', 200, '☕', 1, 1),
      ('prod-5', 'Ayran', 'Ev yapımı ayran', 15.00, 5.00, 'cat-2', 'PRD-005', 100, '🥛', 1, 2),
      ('prod-6', 'Baklava', 'Antep fıstıklı baklava', 90.00, 60.00, 'cat-3', 'PRD-006', 25, '🍰', 1, 1),
      ('prod-7', 'Serpme Kahvaltı', 'Zengin kahvaltı tabağı', 150.00, 90.00, 'cat-4', 'PRD-007', 20, '🍳', 1, 1)
    `);
    console.log('   ✅ Ürünler (7)');

    await pool.request().query(`
      INSERT INTO product_option_groups (id, name, description, is_required) VALUES
      ('opt-grp-1', 'Acılık Derecesi', 'Ürünün acılık seviyesi', 1),
      ('opt-grp-2', 'Porsiyon Boyutu', 'Porsiyon büyüklüğü', 0),
      ('opt-grp-3', 'Şeker Seviyesi', 'İçecek şeker seviyesi', 0)
    `);
    console.log('   ✅ Ürün seçenek grupları (3)');

    await pool.request().query(`
      INSERT INTO product_option_values (id, group_id, name, price_modifier, is_default, order_index) VALUES
      ('opt-val-1', 'opt-grp-1', 'Az Acılı', 0.00, 1, 1),
      ('opt-val-2', 'opt-grp-1', 'Normal', 0.00, 0, 2),
      ('opt-val-3', 'opt-grp-1', 'Çok Acılı', 5.00, 0, 3),
      ('opt-val-4', 'opt-grp-2', 'Küçük', -20.00, 0, 1),
      ('opt-val-5', 'opt-grp-2', 'Orta', 0.00, 1, 2),
      ('opt-val-6', 'opt-grp-2', 'Büyük', 25.00, 0, 3),
      ('opt-val-7', 'opt-grp-3', 'Şekersiz', 0.00, 0, 1),
      ('opt-val-8', 'opt-grp-3', 'Az Şekerli', 0.00, 1, 2),
      ('opt-val-9', 'opt-grp-3', 'Orta Şekerli', 0.00, 0, 3)
    `);
    console.log('   ✅ Ürün seçenek değerleri (9)');

    await pool.request().query(`
      INSERT INTO product_options_mapping (id, product_id, option_group_id) VALUES
      ('map-1', 'prod-1', 'opt-grp-1'),
      ('map-2', 'prod-1', 'opt-grp-2'),
      ('map-3', 'prod-4', 'opt-grp-3')
    `);
    console.log('   ✅ Ürün-seçenek eşleştirmeleri (3)');

    await pool.request().query(`
      INSERT INTO [tables] (id, number, capacity, shape, position_x, position_y, status) VALUES
      ('table-1', 1, 2, 'square', 50, 50, 'empty'),
      ('table-2', 2, 4, 'round', 200, 50, 'empty'),
      ('table-3', 3, 4, 'round', 350, 50, 'empty'),
      ('table-4', 4, 6, 'square', 500, 50, 'empty'),
      ('table-5', 5, 2, 'square', 50, 200, 'empty'),
      ('table-6', 6, 4, 'round', 200, 200, 'empty'),
      ('table-7', 7, 4, 'round', 350, 200, 'empty'),
      ('table-8', 8, 8, 'square', 500, 200, 'empty')
    `);
    console.log('   ✅ Masalar (8)');

    await pool.request().query(`
      INSERT INTO suppliers (id, name, contact_person, email, phone, is_active) VALUES
      ('sup-1', 'Et Tedarik A.Ş.', 'Ali Yıldız', 'ali@ettedarik.com', '0532 100 2000', 1),
      ('sup-2', 'Yaş Sebze Ltd.', 'Ayşe Kara', 'ayse@yassebze.com', '0533 200 3000', 1),
      ('sup-3', 'Süt Ürünleri A.Ş.', 'Mehmet Demir', 'mehmet@sutco.com', '0534 300 4000', 1)
    `);
    console.log('   ✅ Tedarikçiler (3)');

    await pool.request().query(`
      INSERT INTO inventory_items (id, name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id) VALUES
      ('inv-1', 'Kuzu Eti', 'ingredient', 15, 20, 100, 'kg', 450.00, 'sup-1'),
      ('inv-2', 'Domates', 'ingredient', 50, 30, 100, 'kg', 25.00, 'sup-2'),
      ('inv-3', 'Ayran (Şişe)', 'beverage', 80, 50, 200, 'adet', 8.00, 'sup-3'),
      ('inv-4', 'Ekmek', 'ingredient', 45, 30, 80, 'adet', 5.00, 'sup-2'),
      ('inv-5', 'Karton Kutu', 'packaging', 120, 50, 200, 'adet', 2.00, NULL)
    `);
    console.log('   ✅ Stok kalemleri (5)');

    await pool.request().query(`
      INSERT INTO settings (id, key_name, value, description, category) VALUES
      ('set-1', 'restaurant_name', 'PineResto', 'Restoran adı', 'general'),
      ('set-2', 'tax_rate', '9', 'KDV oranı (%)', 'general'),
      ('set-3', 'currency', 'TRY', 'Para birimi', 'general'),
      ('set-4', 'language', 'tr', 'Varsayılan dil', 'general')
    `);
    console.log('   ✅ Ayarlar (4)');

    await pool.request().query(`
      INSERT INTO theme_customization (id, restaurant_name, primary_color, secondary_color, font_family) VALUES
      ('1', 'PineResto', '#3b82f6', '#10b981', 'Inter')
    `);
    console.log('   ✅ Tema (1)');

    console.log('\n📊 Özet:');
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM [tables]) as tables,
        (SELECT COUNT(*) FROM suppliers) as suppliers,
        (SELECT COUNT(*) FROM inventory_items) as inventory_items
    `);
    
    const counts = result.recordset[0];
    console.log(`   Kullanıcılar: ${counts.users}`);
    console.log(`   Kategoriler: ${counts.categories}`);
    console.log(`   Ürünler: ${counts.products}`);
    console.log(`   Masalar: ${counts.tables}`);
    console.log(`   Tedarikçiler: ${counts.suppliers}`);
    console.log(`   Stok: ${counts.inventory_items}`);

    await pool.close();

    console.log('\n🎉 PineResto veritabanı hazır!\n');
    console.log('🚀 Şimdi "npm run dev" çalıştırın!\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setup();











