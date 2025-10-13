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

async function testFlavorsAPI() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ MSSQL bağlantısı başarılı');

        // Test 1: Basit sorgu
        console.log('\n🔍 Test 1: Basit flavor_groups sorgusu');
        const result1 = await pool.query`SELECT * FROM flavor_groups`;
        console.log(`✅ ${result1.recordset.length} çeşni grubu bulundu`);

        // Test 2: JOIN sorgusu
        console.log('\n🔍 Test 2: JOIN sorgusu (API deki gibi)');
        const result2 = await pool.query`
            SELECT fg.*, 
                   COUNT(fv.id) as values_count
            FROM flavor_groups fg
            LEFT JOIN flavor_values fv ON fg.id = fv.flavor_group_id AND fv.is_active = 1
            WHERE fg.is_active = 1
            GROUP BY fg.id, fg.name, fg.description, fg.type, fg.is_required, fg.display_order, fg.is_active, fg.created_at, fg.updated_at
            ORDER BY fg.display_order, fg.name
        `;
        console.log(`✅ ${result2.recordset.length} çeşni grubu JOIN ile bulundu`);
        
        result2.recordset.forEach(group => {
            console.log(`- ${group.name} (${group.values_count} değer)`);
        });

        // Test 3: Değerleri getirme
        console.log('\n🔍 Test 3: Çeşni değerlerini getirme');
        for (const group of result2.recordset) {
            const values = await pool.request()
                .input('groupId', sql.VarChar(50), group.id)
                .query`
                    SELECT id, name, price_modifier, is_default, display_order
                    FROM flavor_values 
                    WHERE flavor_group_id = @groupId AND is_active = 1
                    ORDER BY display_order, name
                `;
            
            console.log(`✅ ${group.name}: ${values.recordset.length} değer`);
            values.recordset.forEach(value => {
                console.log(`  - ${value.name} (${value.price_modifier}₺)`);
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

testFlavorsAPI();
