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

async function createOrdersTable() {
  try {
    await sql.connect(config);
    console.log('✅ MSSQL bağlantısı başarılı - PineResto');

    // Orders tablosunu oluştur
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
      CREATE TABLE orders (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_number VARCHAR(50) NOT NULL,
        customer_name NVARCHAR(100),
        customer_phone VARCHAR(20),
        customer_address NVARCHAR(255),
        table_number VARCHAR(20),
        order_type VARCHAR(20) NOT NULL DEFAULT 'kiosk',
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(20),
        notes NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        is_active BIT DEFAULT 1
      )
    `;

    console.log('✅ Orders tablosu oluşturuldu');

    // Order items tablosunu oluştur
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
      CREATE TABLE order_items (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_id UNIQUEIDENTIFIER NOT NULL,
        product_id UNIQUEIDENTIFIER NOT NULL,
        product_name NVARCHAR(100) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        notes NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `;

    console.log('✅ Order items tablosu oluşturuldu');

    // Index'ler oluştur
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_orders_order_number')
      CREATE INDEX IX_orders_order_number ON orders(order_number)
    `;

    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_orders_status')
      CREATE INDEX IX_orders_status ON orders(status)
    `;

    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_orders_created_at')
      CREATE INDEX IX_orders_created_at ON orders(created_at)
    `;

    await sql.query`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_order_items_order_id')
      CREATE INDEX IX_order_items_order_id ON order_items(order_id)
    `;

    console.log('✅ Index\'ler oluşturuldu');

  } catch (err) {
    console.error('❌ Hata:', err);
  } finally {
    await sql.close();
  }
}

createOrdersTable();



