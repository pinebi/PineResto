import mysql from 'mysql2/promise';

// Database bağlantı havuzu - Uzak SQL Server
const pool = mysql.createPool({
  host: process.env.DB_HOST || '185.210.92.248',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'EDonusum',
  password: process.env.DB_PASSWORD || '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  database: process.env.DB_NAME || 'PineResto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 20000,
});

// Bağlantı testi
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL bağlantısı başarılı - PineResto');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL bağlantı hatası:', error);
    return false;
  }
}

// Query helper
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;

