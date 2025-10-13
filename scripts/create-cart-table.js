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
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

async function createCartTable() {
  try {
    await sql.connect(config);
    console.log('✅ MSSQL bağlantısı başarılı - PineResto');

    // Cart tablosunu oluştur
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cart' AND xtype='U')
      CREATE TABLE cart (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id VARCHAR(100) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name NVARCHAR(100) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        notes NVARCHAR(500),
        order_type VARCHAR(20) NOT NULL DEFAULT 'kiosk',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        is_active BIT DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `;

    console.log('✅ Cart tablosu oluşturuldu');

    // Index'ler oluştur
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_cart_session_id')
      CREATE INDEX IX_cart_session_id ON cart(session_id)
    `;

    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_cart_order_type')
      CREATE INDEX IX_cart_order_type ON cart(order_type)
    `;

    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_cart_created_at')
      CREATE INDEX IX_cart_created_at ON cart(created_at)
    `;

    console.log('✅ Index\'ler oluşturuldu');

  } catch (err) {
    console.error('❌ Hata:', err);
  } finally {
    await sql.close();
  }
}

createCartTable();
