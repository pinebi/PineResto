# 🍽️ Restoran Kiosk Sistemi

Modern ve responsive restoran self-servis kiosk ve yönetim paneli uygulaması.

## ✨ Özellikler

### 🖥️ Kiosk Arayüzü
- Modern ve kullanıcı dostu arayüz
- Kategori bazlı ürün listeleme
- Ürün detay sayfası
- Sepet yönetimi
- Sipariş onay ve takip sistemi
- Tamamen responsive tasarım

### ⚙️ Admin Panel
- Kategori yönetimi (ağaç yapısı)
- Ürün yönetimi
- Kategori ve ürünlerde aktif/pasif durumu
- Sıralama ve organizasyon
- Emoji destekli görsel arayüz

## 🚀 Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** React Icons
- **Font:** Inter (Google Fonts)

## 📦 Kurulum

1. Bağımlılıkları yükleyin:
\`\`\`bash
npm install
\`\`\`

2. Geliştirme sunucusunu başlatın:
\`\`\`bash
npm run dev
\`\`\`

3. Tarayıcınızda açın:
\`\`\`
http://localhost:3000
\`\`\`

## 📱 Sayfalar

- `/` - Ana sayfa (Kiosk ve Admin panel seçimi)
- `/kiosk` - Kiosk ana menü
- `/kiosk/product/[id]` - Ürün detay sayfası
- `/kiosk/cart` - Sepet
- `/kiosk/checkout` - Sipariş onay
- `/admin` - Yönetim paneli

## 🎨 Özellikler Detay

### Kategori Yönetimi
- Ana kategoriler ve alt kategoriler
- Ağaç yapısı görünümü
- Sürükle-bırak sıralama
- Aktif/pasif durum kontrolü

### Ürün Yönetimi
- Kategori bazlı filtreleme
- Fiyat, açıklama, görsel yönetimi
- Stok durumu kontrolü
- Kolay düzenleme arayüzü

### Kiosk Deneyimi
- Büyük ve dokunmatik dostu butonlar
- Kategori filtreleme
- Hızlı ürün ekleme
- Sepet özeti
- Sipariş numarası takibi

## 🔧 Yapılandırma

Proje varsayılan olarak mock data kullanmaktadır. Gerçek bir veritabanı entegrasyonu için:

1. `app/api/*` klasöründeki route dosyalarını düzenleyin
2. Tercih ettiğiniz veritabanını ekleyin (PostgreSQL, MongoDB, vb.)
3. Prisma veya başka bir ORM kullanarak data modellerini oluşturun

## 📄 Lisans

MIT

## 👨‍💻 Geliştirme

Bu proje modern web teknolojileri kullanılarak geliştirilmiştir ve production-ready bir yapıya sahiptir.



