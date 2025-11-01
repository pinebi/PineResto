# PineResto Veritabanı Kurulum Kılavuzu

## 📋 Gereksinimler

- MySQL 8.0+ veya MariaDB 10.5+
- Node.js 18+
- npm veya yarn

## 🗄️ Veritabanı Kurulumu

### Adım 1: MySQL'de PineResto Veritabanını Oluştur

```sql
CREATE DATABASE PineResto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Adım 2: SQL Şemasını İçe Aktar

```bash
# MySQL Command Line ile:
mysql -u root -p PineResto < database/PineResto-full.sql

# Veya MySQL Workbench/phpMyAdmin ile:
# database/PineResto-full.sql dosyasını import edin
```

### Adım 3: Ortam Değişkenlerini Ayarla

Proje root klasöründe `.env.local` dosyası oluşturun:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=PineResto
```

### Adım 4: Bağımlılıkları Yükle

```bash
npm install mysql2
```

### Adım 5: Bağlantıyı Test Et

```bash
npm run dev
```

Tarayıcıda konsolu açın, bağlantı mesajını görmelisiniz:
```
✅ MySQL bağlantısı başarılı - PineResto
```

## 📊 Tablo Yapısı

### Kullanıcılar (users)
- Yönetim kullanıcıları (admin, manager, waiter, kitchen, delivery, cashier)
- Müşteri kullanıcıları (customer)
- Rol bazlı yetkilendirme

### Katalog (categories, products, brands)
- Kategoriler (hiyerarşik)
- Ürünler (tüm detaylar)
- Markalar
- Ürün seçenekleri

### Siparişler (orders, order_items, order_item_options)
- Sipariş yönetimi
- Sipariş ürünleri
- Ürün seçenekleri

### Masalar (tables)
- Masa düzeni
- Masa durumları
- Garson atamaları

### Envanter (inventory_items, recipes, suppliers)
- Stok takibi
- Reçete maliyetleri
- Tedarikçi yönetimi

### Promosyonlar (promotions, customer_favorites, saved_carts)
- Kampanyalar
- Favori ürünler
- Kayıtlı sepetler

### Sistem (settings, theme_customization, notifications)
- Ayarlar
- Tema özelleştirme
- Bildirimler

## 🔄 API Endpoints

Tüm API'ler `/api/db/*` altında:

- `GET /api/db/categories` - Kategorileri listele
- `POST /api/db/categories` - Kategori ekle
- `GET /api/db/products` - Ürünleri listele
- `POST /api/db/products` - Ürün ekle
- `GET /api/db/orders` - Siparişleri listele
- `POST /api/db/orders` - Sipariş oluştur
- `GET /api/db/users` - Kullanıcıları listele
- `POST /api/db/users` - Kullanıcı ekle

## 🔐 Varsayılan Kullanıcı

**Kullanıcı Adı:** admin  
**Şifre:** 12345  
**Email:** admin@pineresto.com

## ⚠️ Önemli Notlar

1. **Şifreler:** Demo hash kullanılıyor. Production'da bcrypt ile hash'leyin.
2. **Performans:** İndeksler eklendi, ama production için optimize edin.
3. **Backup:** Düzenli yedekleme yapın.
4. **Security:** `.env.local` dosyasını `.gitignore`'a ekleyin.

## 🧪 Test Verileri

SQL dosyası şunları içeriyor:
- 1 Admin kullanıcı
- 4 Yönetim kullanıcısı (garson, mutfak, kurye, kasa)
- 4 Kategori
- 7 Ürün
- 8 Masa
- 3 Tedarikçi
- 5 Stok ürünü
- 3 Ürün seçenek grubu

## 🚀 Çalıştırma

```bash
# Geliştirme modu
npm run dev

# Production build
npm run build
npm start
```

## 📞 Destek

Sorun yaşarsanız:
1. MySQL servisinin çalıştığından emin olun
2. Veritabanı bilgilerini kontrol edin
3. `mysql -u root -p` ile bağlantıyı test edin
4. Log dosyalarını kontrol edin











