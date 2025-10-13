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

async function checkFlavorTables() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ MSSQL bağlantısı başarılı - PineResto');

        // Flavor tablolarını kontrol et
        const result = await pool.query`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME LIKE '%flavor%'
        `;
        
        console.log('🔍 Mevcut flavor tabloları:');
        if (result.recordset.length === 0) {
            console.log('❌ Hiç flavor tablosu bulunamadı!');
            console.log('📝 database/flavors-schema.sql dosyasını çalıştırmanız gerekiyor.');
        } else {
            result.recordset.forEach(row => {
                console.log(`✅ ${row.TABLE_NAME}`);
            });
        }

        // Eğer tablolar varsa, içeriklerini kontrol et
        if (result.recordset.length > 0) {
            console.log('\n📊 Flavor grupları:');
            try {
                const groupsResult = await pool.query`SELECT * FROM flavor_groups`;
                console.log(`Toplam ${groupsResult.recordset.length} çeşni grubu bulundu`);
                groupsResult.recordset.forEach(group => {
                    console.log(`- ${group.name} (${group.id})`);
                });
            } catch (err) {
                console.log('❌ flavor_groups tablosu okunamadı:', err.message);
            }

            console.log('\n📊 Ürün-çeşni eşleştirmeleri:');
            try {
                const mappingResult = await pool.query`SELECT * FROM product_flavors_mapping`;
                console.log(`Toplam ${mappingResult.recordset.length} ürün-çeşni eşleştirmesi bulundu`);
                mappingResult.recordset.forEach(mapping => {
                    console.log(`- Ürün: ${mapping.product_id} → Çeşni: ${mapping.flavor_group_id}`);
                });
            } catch (err) {
                console.log('❌ product_flavors_mapping tablosu okunamadı:', err.message);
            }
        }

    } catch (err) {
        console.error('❌ Veritabanı işlemi hatası:', err);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

checkFlavorTables();
