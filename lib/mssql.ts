import sql from 'mssql';

const config: sql.config = {
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
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    if (pool) {
      try {
        await pool.close();
      } catch (error) {
        // Ignore close errors
      }
    }
    pool = await sql.connect(config);
    console.log('✅ MSSQL bağlantısı başarılı - PineResto');
  }
  return pool;
}

export async function query<T = any>(queryText: string, params?: any): Promise<T[]> {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    // Parametreleri ekle
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(queryText);
    return result.recordset as T[];
  } catch (error) {
    console.error('MSSQL Query Error:', error);
    throw error;
  }
}

export async function execute(queryText: string, params?: any): Promise<any> {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(queryText);
    return result;
  } catch (error) {
    console.error('MSSQL Execute Error:', error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await getPool();
    return true;
  } catch (error) {
    console.error('❌ MSSQL bağlantı hatası:', error);
    return false;
  }
}

export default { query, execute, testConnection };

