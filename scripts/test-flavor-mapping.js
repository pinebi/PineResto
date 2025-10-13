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

async function testFlavorMapping() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ MSSQL bağlantısı başarılı');

        // Test: Ürün-çeşni eşleştirmesi ekleme
        console.log('\n🔍 Test: Ürün-çeşni eşleştirmesi ekleme');
        
        const productId = 'prod-1'; // Test ürün ID'si
        const flavorGroupIds = ['spice_level', 'size']; // Test çeşni grupları

        // Önce mevcut eşleştirmeleri sil
        console.log('🗑️  Mevcut eşleştirmeleri siliniyor...');
        await pool.request()
            .input('productId', sql.VarChar(50), productId)
            .query`DELETE FROM product_flavors_mapping WHERE product_id = @productId`;

        // Yeni eşleştirmeleri ekle
        console.log('➕ Yeni eşleştirmeler ekleniyor...');
        for (const flavorGroupId of flavorGroupIds) {
            const mappingId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await pool.request()
                .input('id', sql.VarChar(50), mappingId)
                .input('productId', sql.VarChar(50), productId)
                .input('flavorGroupId', sql.VarChar(50), flavorGroupId)
                .query`INSERT INTO product_flavors_mapping (id, product_id, flavor_group_id) VALUES (@id, @productId, @flavorGroupId)`;
            console.log(`✅ ${flavorGroupId} eşleştirmesi eklendi`);
        }

        // Kontrol et
        console.log('\n🔍 Kontrol: Eşleştirmeler kaydedildi mi?');
        const result = await pool.request()
            .input('productId', sql.VarChar(50), productId)
            .query`
                SELECT 
                    pfm.product_id,
                    fg.name as flavor_group_name,
                    fg.id as flavor_group_id
                FROM product_flavors_mapping pfm
                INNER JOIN flavor_groups fg ON pfm.flavor_group_id = fg.id
                WHERE pfm.product_id = @productId
            `;

        if (result.recordset.length === 0) {
            console.log('❌ Hiç eşleştirme bulunamadı!');
        } else {
            console.log(`✅ ${result.recordset.length} eşleştirme bulundu:`);
            result.recordset.forEach(row => {
                console.log(`- ${row.product_id} → ${row.flavor_group_name}`);
            });
        }

    } catch (err) {
        console.error('❌ Test hatası:', err);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

testFlavorMapping();
