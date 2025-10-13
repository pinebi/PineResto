-- Çeşni Yönetim Sistemi - SQL Tabloları
-- Ürün Seçenekleri → Çeşniler olarak değiştirildi

-- Çeşni Grupları Tablosu (Örnek: Acılık Derecesi, Porsiyon Boyutu)
CREATE TABLE flavor_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'single', -- 'single' veya 'multiple'
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Çeşni Değerleri Tablosu (Örnek: Az Acılı, Normal, Çok Acılı)
CREATE TABLE flavor_values (
    id VARCHAR(50) PRIMARY KEY,
    flavor_group_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flavor_group_id) REFERENCES flavor_groups(id) ON DELETE CASCADE
);

-- Ürün-Çeşni Eşleştirme Tablosu
CREATE TABLE product_flavors_mapping (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    flavor_group_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (flavor_group_id) REFERENCES flavor_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_flavor (product_id, flavor_group_id)
);

-- Örnek Çeşni Grupları
INSERT INTO flavor_groups (id, name, description, type, is_required, display_order) VALUES
('spice_level', 'Acılık Derecesi', 'Ürünün acılık seviyesini belirler', 'single', TRUE, 1),
('size', 'Porsiyon Boyutu', 'Ürünün porsiyon boyutunu belirler', 'single', FALSE, 2),
('extras', 'Ek Malzemeler', 'Ürüne eklenebilecek malzemeler', 'multiple', FALSE, 3);

-- Örnek Çeşni Değerleri
INSERT INTO flavor_values (id, flavor_group_id, name, price_modifier, is_default, display_order) VALUES
-- Acılık Derecesi
('spice_mild', 'spice_level', 'Az Acılı', 0, TRUE, 1),
('spice_medium', 'spice_level', 'Normal', 0, FALSE, 2),
('spice_hot', 'spice_level', 'Çok Acılı', 0, FALSE, 3),
-- Porsiyon Boyutu
('size_small', 'size', 'Küçük', -5, FALSE, 1),
('size_medium', 'size', 'Orta', 0, TRUE, 2),
('size_large', 'size', 'Büyük', 10, FALSE, 3),
-- Ek Malzemeler
('extra_cheese', 'extras', 'Ekstra Peynir', 5, FALSE, 1),
('extra_sauce', 'extras', 'Ekstra Sos', 3, FALSE, 2),
('extra_meat', 'extras', 'Ekstra Et', 15, FALSE, 3);
