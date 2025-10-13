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

async function checkProductFlavors() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ MSSQL bağlantısı başarılı - PineResto');

        console.log('\n📊 Tüm Ürün-Çeşni Eşleştirmeleri:');
        const result = await pool.query`
            SELECT 
                p.id as product_id,
                p.name as product_name,
                fg.name as flavor_group,
                fg.id as flavor_group_id
            FROM products p
            INNER JOIN product_flavors_mapping pfm ON p.id = pfm.product_id
            INNER JOIN flavor_groups fg ON pfm.flavor_group_id = fg.id
            ORDER BY p.name, fg.display_order
        `;
        
        if (result.recordset.length === 0) {
            console.log('❌ Hiç ürün-çeşni eşleştirmesi bulunamadı!');
            console.log('💡 Admin panelinden ürünlere çeşni eklemeniz gerekiyor.');
        } else {
            console.log(`✅ Toplam ${result.recordset.length} ürün-çeşni eşleştirmesi bulundu:`);
            result.recordset.forEach(row => {
                console.log(`- ${row.product_name} → ${row.flavor_group}`);
            });
        }

        console.log('\n📊 Çeşni Grupları ve Değerleri:');
        const flavorResult = await pool.query`
            SELECT 
                fg.name as group_name,
                fv.name as value_name,
                fv.price_modifier
            FROM flavor_groups fg
            LEFT JOIN flavor_values fv ON fg.id = fv.flavor_group_id
            ORDER BY fg.display_order, fv.display_order
        `;
        
        flavorResult.recordset.forEach(row => {
            const priceText = row.price_modifier !== 0 ? ` (${row.price_modifier > 0 ? '+' : ''}${row.price_modifier}₺)` : '';
            console.log(`- ${row.group_name}: ${row.value_name}${priceText}`);
        });

    } catch (err) {
        console.error('❌ Veritabanı işlemi hatası:', err);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

checkProductFlavors();
