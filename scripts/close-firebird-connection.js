const firebird = require('node-firebird');

const firebirdConfig = {
  database: 'C:\\Users\\OnurKIRAN\\Desktop\\KIEL3010202544\\SultanS.fdb',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000
};

async function closeConnection() {
  return new Promise((resolve, reject) => {
    firebird.attach(firebirdConfig, (err, db) => {
      if (err) {
        // Bağlantı zaten kapalı veya bağlantı hatası
        if (err.message && err.message.includes('already in use')) {
          console.log('⚠️  Veritabanı başka bir işlem tarafından kullanılıyor');
          console.log('💡 Çözüm: PINEBI.CONNECTOR.exe veya diğer Firebird kullanan uygulamaları kapatın');
        } else {
          console.log('ℹ️  Bağlantı zaten kapalı veya hata:', err.message);
        }
        return resolve();
      }

      console.log('✅ Firebird bağlantısı açıldı');
      
      // Basit bir sorgu çalıştır ve bağlantıyı kapat
      db.query('SELECT 1 FROM RDB$DATABASE', (queryErr) => {
        if (queryErr) {
          console.log('⚠️  Sorgu hatası:', queryErr.message);
        }
        
        // Bağlantıyı kapat
        db.detach((detachErr) => {
          if (detachErr) {
            console.log('⚠️  Bağlantı kapatma hatası:', detachErr.message);
            return resolve();
          }
          console.log('✅ Firebird bağlantısı kapatıldı');
          resolve();
        });
      });
    });
  });
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🔌 Firebird bağlantısı kapatılıyor...\n');
    await closeConnection();
    console.log('\n✅ İşlem tamamlandı');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
  
  // Script'i sonlandır
  process.exit(0);
}

main();



