const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const pinebiPath = 'C:\\Users\\OnurKIRAN\\Desktop\\pinebi';
const zipPath = path.join(pinebiPath, 'ITEM_LINKED_GROUPS.zip');

if (fs.existsSync(zipPath)) {
  try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    
    console.log('📦 ITEM_LINKED_GROUPS.zip içeriği:\n');
    
    entries.forEach(entry => {
      if (entry.entryName.endsWith('.json')) {
        console.log(`📄 Dosya: ${entry.entryName}`);
        const content = entry.getData().toString('utf8');
        
        // BOM'u kaldır
        let cleanContent = content;
        if (content.charCodeAt(0) === 0xFEFF) {
          cleanContent = content.slice(1);
        }
        
        try {
          const json = JSON.parse(cleanContent);
          console.log(`   Kayıt sayısı: ${Array.isArray(json) ? json.length : 1}`);
          
          // İlk kayıt örneğini göster
          const sample = Array.isArray(json) ? json[0] : json;
          if (sample) {
            console.log(`   Örnek yapı:`, JSON.stringify(Object.keys(sample), null, 2));
            if (sample.ITEM && sample.ITEM_GROUP) {
              console.log(`   ✓ ITEM ve ITEM_GROUP içeriyor`);
              console.log(`   ITEM CODE: ${sample.ITEM.CODE || sample.ITEM._id}`);
              console.log(`   ITEM_GROUP CODE: ${sample.ITEM_GROUP.CODE || sample.ITEM_GROUP._id}`);
            }
          }
          console.log('');
        } catch (e) {
          console.log(`   ❌ JSON parse hatası: ${e.message}`);
        }
      }
    });
  } catch (error) {
    console.error('❌ ZIP okuma hatası:', error);
  }
} else {
  console.log('❌ ITEM_LINKED_GROUPS.zip bulunamadı');
}




