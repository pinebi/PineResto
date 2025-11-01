# 🚀 PineResto Veritabanı Kurulum Rehberi

## ✅ HIZLI KURULUM (3 Adım)

### 1️⃣ MySQL'i Başlat ve PineResto Veritabanını Oluştur

**Seçenek A - MySQL Command Line:**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE PineResto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Seçenek B - phpMyAdmin:**
- phpMyAdmin'e gir
- "Yeni" butonu → "PineResto" adında veritabanı oluştur
- Karakter seti: utf8mb4_unicode_ci

**Seçenek C - MySQL Workbench:**
- MySQL Workbench'i aç
- "Create New Schema" → "PineResto"

---

### 2️⃣ SQL Dosyasını Import Et

**Seçenek A - Command Line (ÖNERİLEN):**
```bash
cd C:\ModernERP\Restoran
mysql -u root -p PineResto < database\PineResto-full.sql
```

**Seçenek B - phpMyAdmin:**
1. PineResto veritabanını seç
2. "İçe Aktar" (Import) sekmesi
3. `database/PineResto-full.sql` dosyasını seç
4. "Git" (Go) butonuna tıkla

**Seçenek C - MySQL Workbench:**
1. PineResto şemasını seç
2. Server → Data Import
3. "Import from Self-Contained File"
4. `database/PineResto-full.sql` dosyasını seç
5. "Start Import"

---

### 3️⃣ .env.local Dosyasını Düzenle

Proje klasöründe `.env.local` dosyası zaten oluşturuldu.  
**MySQL şifrenizi ekleyin:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=BURAYA_SİFRENİZİ_YAZIN
DB_NAME=PineResto
```

**Örnek (şifre: 123456):**
```env
DB_PASSWORD=123456
```

---

## ✨ Kurulum Tamamlandı!

### Projeyi Başlatın:
```bash
npm run dev
```

### Tarayıcıda Açın:
```
http://localhost:3100
```

---

## 🔐 Varsayılan Kullanıcılar

| Kullanıcı | Şifre | Rol | Erişim |
|-----------|-------|-----|--------|
| admin | 12345 | Admin | Tüm Sistem |
| garson1 | 12345 | Garson | Garson Ekranı |
| mutfak1 | 12345 | Mutfak | Mutfak Ekranı |
| kurye1 | 12345 | Kurye | Kurye Ekranı |
| kasa1 | 12345 | Kasa | Kasa Ekranı |

---

## 📊 Oluşturulan Tablolar (20 Adet)

### Kullanıcı Yönetimi
- ✅ users
- ✅ user_permissions

### Katalog
- ✅ categories
- ✅ brands
- ✅ products
- ✅ product_option_groups
- ✅ product_option_values
- ✅ product_options_mapping

### Sipariş ve Masa
- ✅ tables
- ✅ orders
- ✅ order_items
- ✅ order_item_options

### Envanter
- ✅ suppliers
- ✅ inventory_items
- ✅ recipes
- ✅ recipe_ingredients

### Müşteri ve Promosyon
- ✅ promotions
- ✅ customer_favorites
- ✅ saved_carts

### Sistem
- ✅ settings
- ✅ theme_customization
- ✅ notifications

---

## 🎯 Varsayılan Veriler

- **5 Kullanıcı** (1 Admin + 4 Personel)
- **4 Kategori** (Sıcak Yemekler, İçecekler, Tatlılar, Kahvaltı)
- **7 Ürün** (Adana, İskender, Pide, Çay, Ayran, Baklava, Kahvaltı)
- **8 Masa** (Farklı kapasite ve şekillerde)
- **3 Tedarikçi**
- **5 Stok Ürünü**
- **9 Ürün Seçeneği** (Acılık, Porsiyon, Şeker)

---

## ❓ Sorun Giderme

### "MySQL bağlantı hatası"
```bash
# MySQL servisinin çalıştığını kontrol edin:
mysql --version

# Windows:
services.msc → MySQL80 → Başlat

# Bağlantıyı test edin:
mysql -u root -p
```

### "Access Denied"
- .env.local dosyasında DB_USER ve DB_PASSWORD'ü kontrol edin
- MySQL kullanıcısının yetkilerini kontrol edin

### "Database does not exist"
```sql
CREATE DATABASE PineResto;
```

### "Table already exists"
- Veritabanını sıfırlayın:
```sql
DROP DATABASE PineResto;
CREATE DATABASE PineResto;
```

---

## 📱 Test Etme

### 1. Giriş Yapın
```
http://localhost:3100/login
Kullanıcı: admin
Şifre: 12345
```

### 2. Admin Panel'i Açın
```
http://localhost:3100/admin
```

### 3. Kategorileri Kontrol Edin
- Admin → Katalog → Kategoriler
- 4 kategori görmelisiniz

### 4. Ürünleri Kontrol Edin
- Admin → Katalog → Ürün Listesi
- 7 ürün görmelisiniz

### 5. Masaları Kontrol Edin
- Admin → Masalar
- 8 masa görmelisiniz

---

## 🎉 Başarılı!

Tüm sistem artık **PineResto** MySQL veritabanına bağlı çalışıyor!

- ✅ Tüm veriler SQL'de
- ✅ Kalıcı veri saklama
- ✅ Çoklu kullanıcı desteği
- ✅ Transaction desteği
- ✅ İlişkisel veri bütünlüğü











