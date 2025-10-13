const sql = require('mssql');

const config = {
    server: '185.210.92.248',
    port: 1433,
    user: 'EDonusum',
    password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
    database: 'PineResto',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

async function createFlavorTables() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ MSSQL bağlantısı başarılı - PineResto');

        // Çeşni Grupları Tablosu
        console.log('📝 flavor_groups tablosu oluşturuluyor...');
        await pool.query`
            CREATE TABLE flavor_groups (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                type VARCHAR(20) DEFAULT 'single',
                is_required BIT DEFAULT 0,
                display_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME2 DEFAULT GETDATE(),
                updated_at DATETIME2 DEFAULT GETDATE()
            )
        `;
        console.log('✅ flavor_groups tablosu oluşturuldu');

        // Çeşni Değerleri Tablosu
        console.log('📝 flavor_values tablosu oluşturuluyor...');
        await pool.query`
            CREATE TABLE flavor_values (
                id VARCHAR(50) PRIMARY KEY,
                flavor_group_id VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                price_modifier DECIMAL(10,2) DEFAULT 0,
                is_default BIT DEFAULT 0,
                display_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME2 DEFAULT GETDATE(),
                updated_at DATETIME2 DEFAULT GETDATE(),
                FOREIGN KEY (flavor_group_id) REFERENCES flavor_groups(id) ON DELETE CASCADE
            )
        `;
        console.log('✅ flavor_values tablosu oluşturuldu');

        // Ürün-Çeşni Eşleştirme Tablosu
        console.log('📝 product_flavors_mapping tablosu oluşturuluyor...');
        await pool.query`
            CREATE TABLE product_flavors_mapping (
                id VARCHAR(50) PRIMARY KEY,
                product_id VARCHAR(50) NOT NULL,
                flavor_group_id VARCHAR(50) NOT NULL,
                created_at DATETIME2 DEFAULT GETDATE(),
                FOREIGN KEY (flavor_group_id) REFERENCES flavor_groups(id) ON DELETE CASCADE,
                UNIQUE (product_id, flavor_group_id)
            )
        `;
        console.log('✅ product_flavors_mapping tablosu oluşturuldu');

        // Örnek Çeşni Grupları
        console.log('📝 Örnek çeşni grupları ekleniyor...');
        await pool.query`
            INSERT INTO flavor_groups (id, name, description, type, is_required, display_order) VALUES
            ('spice_level', 'Acılık Derecesi', 'Ürünün acılık seviyesini belirler', 'single', 1, 1),
            ('size', 'Porsiyon Boyutu', 'Ürünün porsiyon boyutunu belirler', 'single', 0, 2),
            ('extras', 'Ek Malzemeler', 'Ürüne eklenebilecek malzemeler', 'multiple', 0, 3)
        `;
        console.log('✅ Örnek çeşni grupları eklendi');

        // Örnek Çeşni Değerleri
        console.log('📝 Örnek çeşni değerleri ekleniyor...');
        await pool.query`
            INSERT INTO flavor_values (id, flavor_group_id, name, price_modifier, is_default, display_order) VALUES
            -- Acılık Derecesi
            ('spice_mild', 'spice_level', 'Az Acılı', 0, 1, 1),
            ('spice_medium', 'spice_level', 'Normal', 0, 0, 2),
            ('spice_hot', 'spice_level', 'Çok Acılı', 0, 0, 3),
            -- Porsiyon Boyutu
            ('size_small', 'size', 'Küçük', -5, 0, 1),
            ('size_medium', 'size', 'Orta', 0, 1, 2),
            ('size_large', 'size', 'Büyük', 10, 0, 3),
            -- Ek Malzemeler
            ('extra_cheese', 'extras', 'Ekstra Peynir', 5, 0, 1),
            ('extra_sauce', 'extras', 'Ekstra Sos', 3, 0, 2),
            ('extra_meat', 'extras', 'Ekstra Et', 15, 0, 3)
        `;
        console.log('✅ Örnek çeşni değerleri eklendi');

        console.log('\n🎉 Tüm çeşni tabloları başarıyla oluşturuldu!');

    } catch (err) {
        console.error('❌ Veritabanı işlemi hatası:', err);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

createFlavorTables();
