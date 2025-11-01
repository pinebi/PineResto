const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Firebird bağlantısını kullanan işlemler aranıyor...\n');

// PINEBI.CONNECTOR.exe ve benzeri process'leri bul
exec('tasklist /FI "IMAGENAME eq PINEBI.CONNECTOR.exe" /FO CSV', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Process kontrolü yapılamadı');
  }
  
  if (stdout && stdout.includes('PINEBI.CONNECTOR.exe')) {
    console.log('📋 PINEBI.CONNECTOR.exe çalışıyor');
    console.log('💡 İşlemi kapatmak için: taskkill /F /IM PINEBI.CONNECTOR.exe');
    
    // İsteğe bağlı olarak otomatik kapat
    console.log('\n🔄 İşlem kapatılıyor...');
    exec('taskkill /F /IM PINEBI.CONNECTOR.exe', (killError, killStdout, killStderr) => {
      if (killError) {
        console.log('⚠️  İşlem kapatılamadı:', killError.message);
        console.log('💡 Manuel olarak Görev Yöneticisi\'nden kapatabilirsiniz');
      } else {
        console.log('✅ PINEBI.CONNECTOR.exe kapatıldı');
        console.log('✅ Firebird bağlantısı serbest bırakıldı');
      }
    });
  } else {
    console.log('ℹ️  PINEBI.CONNECTOR.exe çalışmıyor');
    console.log('✅ Firebird bağlantısı zaten kapalı');
  }
});

// Firebird server process'lerini de kontrol et
exec('tasklist /FI "IMAGENAME eq fbserver.exe" /FO CSV', (error, stdout, stderr) => {
  if (stdout && stdout.includes('fbserver.exe')) {
    console.log('⚠️  Firebird sunucusu çalışıyor');
  } else {
    console.log('ℹ️  Firebird sunucusu çalışmıyor');
  }
});



