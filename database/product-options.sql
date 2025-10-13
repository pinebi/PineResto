-- Ürün seçenekleri için SQL tabloları
CREATE TABLE product_option_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_option_values (
    id VARCHAR(50) PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE
);

CREATE TABLE product_options_mapping (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    option_group_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE
);

-- Örnek veriler
INSERT INTO product_option_groups (id, name, description, is_required) VALUES
('spice_level', 'Acılık Derecesi', 'Ürünün acılık seviyesini belirler', true),
('size', 'Porsiyon Boyutu', 'Ürünün porsiyon boyutunu belirler', false),
('bread_type', 'Ekmek Türü', 'Ekmeğin türünü belirler', false),
('drink_type', 'İçecek Türü', 'İçeceğin türünü belirler', false),
('sugar_level', 'Şeker Seviyesi', 'İçeceğin şeker seviyesini belirler', false);

INSERT INTO product_option_values (id, group_id, name, price_modifier, is_default, order_index) VALUES
-- Acılık Derecesi
('spice_mild', 'spice_level', 'Az Acılı', 0.00, true, 1),
('spice_medium', 'spice_level', 'Normal', 0.00, false, 2),
('spice_hot', 'spice_level', 'Çok Acılı', 2.00, false, 3),

-- Porsiyon Boyutu
('size_small', 'size', 'Küçük', -10.00, false, 1),
('size_medium', 'size', 'Orta', 0.00, true, 2),
('size_large', 'size', 'Büyük', 15.00, false, 3),

-- Ekmek Türü
('bread_white', 'bread_type', 'Beyaz Ekmek', 0.00, true, 1),
('bread_wheat', 'bread_type', 'Tam Buğday', 1.00, false, 2),
('bread_corn', 'bread_type', 'Mısır Ekmeği', 1.50, false, 3),

-- İçecek Türü
('drink_tea', 'drink_type', 'Çay', 0.00, true, 1),
('drink_coffee', 'drink_type', 'Kahve', 5.00, false, 2),
('drink_juice', 'drink_type', 'Meyve Suyu', 8.00, false, 3),

-- Şeker Seviyesi
('sugar_none', 'sugar_level', 'Şekersiz', 0.00, false, 1),
('sugar_light', 'sugar_level', 'Az Şekerli', 0.00, false, 2),
('sugar_medium', 'sugar_level', 'Orta Şekerli', 0.00, true, 3),
('sugar_heavy', 'sugar_level', 'Çok Şekerli', 0.00, false, 4);





