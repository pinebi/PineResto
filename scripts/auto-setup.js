const fs = require('fs');
const path = require('path');

console.log('🚀 PineResto Otomatik Kurulum\n');

// 1. .env.local oluştur
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  const envContent = `# PineResto Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=PineResto

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Security
JWT_SECRET=pineresto-secret-${Date.now()}
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local dosyası oluşturuldu');
} else {
  console.log('ℹ️  .env.local dosyası zaten mevcut');
}

console.log('\n📋 Sonraki Adımlar:');
console.log('\n1. MySQL şifrenizi .env.local dosyasına ekleyin:');
console.log('   DB_PASSWORD=your_password\n');
console.log('2. Veritabanını kurun:');
console.log('   npm run db:setup\n');
console.log('3. Uygulamayı başlatın:');
console.log('   npm run dev\n');






