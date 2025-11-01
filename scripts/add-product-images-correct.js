const sql = require('mssql');

const mssqlConfig = {
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
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// Ürün adlarına göre çok spesifik resim mapping (tam eşleşme öncelikli)
const productImageMap = {
  // === DÖNER VE KEBAP ===
  'adana dürüm': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'adana kebap': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop',
  'sade adana': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop',
  'dönerteller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'dönerteller klein': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'dürüm döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'geflügeldöner teller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'kalbsdöner teller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'kinder teller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'mixdöner teller': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'pomm döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'pide ici döner': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'iskender kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  
  // === IZGARA / GRILL ===
  'ali nazik': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'beyti': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'dana sis': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'izgara köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'kuzu filet': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'kuzu pirzola': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'kuzu sis': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'mevlana köfte': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'patlican kebap': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'pirzola': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'tavuk fileto': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'tavuk pirzola': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'tavuk sis': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'yogurtlu kebap': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'sultans karisik izgara': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  
  // === PIDE VE LAHMACUN ===
  'lahmacun': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'findik lahmacun': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'lahmacun deluxe': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'lahmacun menü': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kiymali pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kasarli pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'ispanakli pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'kusbasili pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'mevlana pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'pastirmali pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'sebzeli pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'sucuklu pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'tavuklu pide': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  
  // === SALATALAR VE MEZELER ===
  'cacik': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'coban salatasi': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'dönerli salata': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'ezme': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'humus': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'karisik kızartma': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'karisik meze': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'karisik salata': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'kisir': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'peynir zeytin': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'peynirli salata': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'tavuklu salata': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'yaprak sarma': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  
  // === ÇORBALAR VE KAHVALTI ===
  'kelle paca': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'mercimek corbasi': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'tavuk corbasi': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'halbe suppe': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'grill angebot': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'große grill angebot': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'ispanakli yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'kiymali yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'menemen': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'pastirmali yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'peynirli yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'sucuklu yumurta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'sultans frühstück': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  'mittagsessen': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop',
  
  // === İÇECEKLER - YUMUŞAK ===
  'ayran': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'coca-cola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop',
  'cola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop',
  'fanta': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'sprite': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'wasser': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'saft': 'https://images.unsplash.com/photo-1570654621852-d0de13ee8e3b?w=400&h=400&fit=crop',
  'schorle': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'eistee': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'redbull': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'apfelsaft': 'https://images.unsplash.com/photo-1570654621852-d0de13ee8e3b?w=400&h=400&fit=crop',
  'apfelschorle': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'bananensaft': 'https://images.unsplash.com/photo-1570654621852-d0de13ee8e3b?w=400&h=400&fit=crop',
  'orangensaft': 'https://images.unsplash.com/photo-1570654621852-d0de13ee8e3b?w=400&h=400&fit=crop',
  'mineral wasser': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'still wasser': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'uludag': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  
  // === İÇECEKLER - ALKOL ===
  'bier': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'wein': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'raki': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'pilsener': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'weissbier': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'efes': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'beck': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'könig': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'alsterwasser': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'weinschorle': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'benediktiner': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'flasche wein': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'villa doluca': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  
  // === KAHVE VE ÇAY ===
  'kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'kahve': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'cappuccino': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'espresso': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'latte': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'tee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'cay': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'mokka': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'crema': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'kakao': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'cafe crema': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'türkischer mokka': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'heiße milch mit honig': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  
  // === TATLILAR ===
  'baklava': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'künefe': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'sütlac': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'sutlac': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'lokum': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  
  // === VEGETARYEN ===
  'falafel': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'imam bayildi': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'sebze tava': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  
  // === DİĞER ===
  'pilav': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'reis': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'patates': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pommes': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'patates kizartmasi': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'sote': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'dana sote': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'kuzu sote': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'tavuk sote': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'börek': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'borek': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'sigara': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'bulgur pilavi': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'extra fleisch': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'extra käse': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'ketcup': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'mayo': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'gutschein scheck': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop',
};

// Kategori bazlı fallback
const categoryFallback = {
  'döner kebap': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'softdrinks': 'https://images.unsplash.com/photo-1543253687-ff91d6d4c588?w=400&h=400&fit=crop',
  'alkoholische getränke': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop',
  'pfannengerichte': 'https://images.unsplash.com/photo-1504674900247-087700f998c5?w=400&h=400&fit=crop',
  'pide_türkischepizza': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
  'salate_vorspeisen': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'suppen_frühstück': 'https://images.unsplash.com/photo-1589825560404-31272d5117b1?w=400&h=400&fit=crop',
  'tee_kaffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4a0c0d?w=400&h=400&fit=crop',
  'desserts': 'https://images.unsplash.com/photo-1563729781174-c66d7651120d?w=400&h=400&fit=crop',
  'vom grill': 'https://images.unsplash.com/photo-1529692236671-ac3368a872d8?w=400&h=400&fit=crop',
  'extras': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop',
  'vegetarisch': 'https://images.unsplash.com/photo-1512621776951-a5714317e7f1?w=400&h=400&fit=crop',
  'teigröllchen': 'https://images.unsplash.com/photo-1593560704721-db211902ba23?w=400&h=400&fit=crop',
};

function findImageByProductName(productName, categoryName) {
  if (!productName) {
    const catKey = categoryName?.toLowerCase()?.trim()?.replace(/\s+/g, '_');
    return categoryFallback[catKey] || 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop';
  }
  
  // Ürün adını temizle ve normalize et
  let cleanName = productName.toLowerCase()
    .replace(/[0-9.,()]/g, ' ') // Sayıları ve özel karakterleri kaldır
    .replace(/\s+/g, ' ')
    .trim();
  
  // 1. Tam eşleşme kontrolü (öncelikli)
  if (productImageMap[cleanName]) {
    return productImageMap[cleanName];
  }
  
  // 2. Ürün adını kelimelere ayır (uzun kelimeler öncelikli)
  const words = cleanName.split(/\s+/).filter(w => w.length > 2);
  const sortedWords = words.sort((a, b) => b.length - a.length);
  
  // Her kelime kombinasyonunu kontrol et
  for (let i = 0; i < sortedWords.length; i++) {
    const word = sortedWords[i];
    if (productImageMap[word]) {
      return productImageMap[word];
    }
    
    // İki kelime kombinasyonları
    if (i < sortedWords.length - 1) {
      const twoWords = `${word} ${sortedWords[i + 1]}`;
      if (productImageMap[twoWords]) {
        return productImageMap[twoWords];
      }
    }
  }
  
  // 3. Kısmi eşleşme (ürün adında geçen kelimeler)
  for (const [key, url] of Object.entries(productImageMap)) {
    if (cleanName.includes(key) && key.length > 3) {
      return url;
    }
  }
  
  // 4. Kategori fallback
  if (categoryName) {
    const categoryKey = categoryName.toLowerCase().trim().replace(/\s+/g, '_');
    if (categoryFallback[categoryKey]) {
      return categoryFallback[categoryKey];
    }
  }
  
  // 5. Varsayılan
  return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop';
}

async function addProductImages() {
  console.log('🚀 Ürün resimleri ekleniyor (geliştirilmiş eşleştirme ile)...\n');
  const pool = await sql.connect(mssqlConfig);
  console.log('✅ MSSQL bağlantısı başarılı\n');

  try {
    const products = await pool.request().query(`
      SELECT 
        p.id,
        p.name,
        p.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.name
    `);

    console.log(`📦 ${products.recordset.length} ürün bulundu\n`);

    let updatedCount = 0;
    let exactMatches = 0;
    let wordMatches = 0;
    let categoryFallbacks = 0;

    for (const product of products.recordset) {
      const imageUrl = findImageByProductName(product.name || '', product.category_name || '');
      
      // Eşleşme türünü kaydet
      const cleanName = (product.name || '').toLowerCase().replace(/[0-9.,()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (productImageMap[cleanName]) {
        exactMatches++;
      } else if (cleanName.split(/\s+/).some(w => productImageMap[w])) {
        wordMatches++;
      } else {
        categoryFallbacks++;
      }
      
      // Veritabanını güncelle
      const request = pool.request();
      request.input('imageUrl', sql.NVarChar, imageUrl);
      request.input('productId', sql.NVarChar, product.id);
      await request.query(`
        UPDATE products 
        SET image_url = @imageUrl
        WHERE id = @productId
      `);

      console.log(`✓ ${product.name}`);
      updatedCount++;

      if (updatedCount % 20 === 0) {
        console.log(`\n📊 İlerleme: ${updatedCount}/${products.recordset.length} ürün güncellendi\n`);
      }
    }

    console.log('\n✅ İşlem tamamlandı!');
    console.log(`   ✓ Güncellenen: ${updatedCount}`);
    console.log(`   📊 Tam eşleşme: ${exactMatches}`);
    console.log(`   📊 Kelime eşleşmesi: ${wordMatches}`);
    console.log(`   📊 Kategori fallback: ${categoryFallbacks}`);
    console.log(`   📦 Toplam: ${products.recordset.length}\n`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    throw error;
  } finally {
    await pool.close();
  }
}

addProductImages().catch(console.error);

