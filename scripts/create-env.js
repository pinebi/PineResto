const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createEnvFile() {
  console.log('🔧 .env.local Dosyası Oluşturuluyor...\n');

  const dbHost = await question('MySQL Host (varsayılan: localhost): ') || 'localhost';
  const dbPort = await question('MySQL Port (varsayılan: 3306): ') || '3306';
  const dbUser = await question('MySQL Kullanıcı Adı (varsayılan: root): ') || 'root';
  const dbPassword = await question('MySQL Şifresi: ');

  const envContent = `# PineResto Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=PineResto

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Security (Production'da değiştirin!)
JWT_SECRET=pineresto-secret-key-${Date.now()}
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env.local dosyası oluşturuldu!');
  console.log(`📁 Konum: ${envPath}\n`);

  rl.close();
}

createEnvFile().catch(console.error);






