-- ============================================
-- PineResto - Modern Restoran Yönetim Sistemi
-- Tam Veritabanı Şeması
-- ============================================

-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS PineResto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PineResto;

-- ============================================
-- 1. KULLANICI YÖNETİMİ
-- ============================================

DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'waiter', 'kitchen', 'delivery', 'cashier', 'customer') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(10) DEFAULT '👤',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    work_shift ENUM('morning', 'afternoon', 'evening', 'night'),
    customer_type ENUM('regular', 'vip', 'corporate') DEFAULT 'regular',
    loyalty_points INT DEFAULT 0,
    membership_level ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    total_spent DECIMAL(10,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    address TEXT,
    birth_date DATE,
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

CREATE TABLE user_permissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module)
);

-- ============================================
-- 2. KATALOG YÖNETİMİ
-- ============================================

DROP TABLE IF EXISTS product_options_mapping;
DROP TABLE IF EXISTS product_option_values;
DROP TABLE IF EXISTS product_option_groups;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(50),
    order_index INT DEFAULT 0,
    icon VARCHAR(10),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
);

CREATE TABLE brands (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    website VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2),
    category_id VARCHAR(50) NOT NULL,
    brand_id VARCHAR(50),
    stock_code VARCHAR(100),
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_new_product BOOLEAN DEFAULT FALSE,
    is_fast_shipping BOOLEAN DEFAULT FALSE,
    is_showcase BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    source VARCHAR(50) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_name (name)
);

CREATE TABLE product_option_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_option_values (
    id VARCHAR(50) PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE
);

CREATE TABLE product_options_mapping (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    option_group_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (option_group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_option (product_id, option_group_id)
);

-- ============================================
-- 3. MASA VE SİPARİŞ YÖNETİMİ
-- ============================================

DROP TABLE IF EXISTS order_item_options;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS tables;

CREATE TABLE tables (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    shape ENUM('square', 'round') DEFAULT 'round',
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    status ENUM('empty', 'occupied', 'reserved') DEFAULT 'empty',
    current_order_id VARCHAR(50),
    waiter_id VARCHAR(50),
    reservation_name VARCHAR(255),
    reservation_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT AUTO_INCREMENT UNIQUE,
    order_type ENUM('kiosk', 'online', 'table', 'qr') NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    table_id VARCHAR(50),
    customer_id VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    waiter_id VARCHAR(50),
    delivery_id VARCHAR(50),
    estimated_time INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (order_type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);

CREATE TABLE order_item_options (
    id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL,
    option_name VARCHAR(100),
    selected_value VARCHAR(255),
    price_modifier DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- ============================================
-- 4. ENVANTER YÖNETİMİ
-- ============================================

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('ingredient', 'beverage', 'packaging', 'other') NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    supplier_id VARCHAR(50),
    last_restock_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_stock_level (current_stock, min_stock)
);

CREATE TABLE recipes (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product (product_id)
);

CREATE TABLE recipe_ingredients (
    id VARCHAR(50) PRIMARY KEY,
    recipe_id VARCHAR(50) NOT NULL,
    inventory_item_id VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- ============================================
-- 5. PROMOSYON & MÜŞTERİ YÖNETİMİ
-- ============================================

DROP TABLE IF EXISTS customer_favorites;
DROP TABLE IF EXISTS saved_carts;
DROP TABLE IF EXISTS promotions;

CREATE TABLE promotions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('discount', 'coupon', 'combo', 'happy-hour', 'bogo') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    code VARCHAR(50) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    usage_limit INT,
    min_order_amount DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE customer_favorites (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_product (customer_id, product_id)
);

CREATE TABLE saved_carts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cart_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 6. SİSTEM AYARLARI & BİLDİRİMLER
-- ============================================

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS theme_customization;
DROP TABLE IF EXISTS settings;

CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE theme_customization (
    id VARCHAR(50) PRIMARY KEY DEFAULT '1',
    restaurant_name VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#10b981',
    font_family VARCHAR(100) DEFAULT 'Inter',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    type ENUM('order', 'info', 'success', 'warning', 'error') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

-- ============================================
-- VARSAYILAN VERİLER
-- ============================================

-- Admin kullanıcısı (şifre: admin123)
INSERT INTO users (id, username, email, password_hash, full_name, phone, role, employee_id, department, avatar) VALUES
('admin-1', 'admin', 'admin@pineresto.com', '$2a$10$demo_hash_admin', 'Admin Kullanıcı', '0532 000 0001', 'admin', 'EMP-001', 'Yönetim', '👨‍💼'),
('user-2', 'garson1', 'ahmet@pineresto.com', '$2a$10$demo_hash', 'Ahmet Yılmaz', '0532 111 2222', 'waiter', 'EMP-002', 'Servis', '👨‍🍳'),
('user-3', 'mutfak1', 'fatma@pineresto.com', '$2a$10$demo_hash', 'Fatma Demir', '0532 333 4444', 'kitchen', 'EMP-003', 'Mutfak', '👩‍🍳'),
('user-4', 'kurye1', 'mehmet@pineresto.com', '$2a$10$demo_hash', 'Mehmet Kaya', '0532 555 6666', 'delivery', 'EMP-004', 'Teslimat', '🚴'),
('user-5', 'kasa1', 'ayse@pineresto.com', '$2a$10$demo_hash', 'Ayşe Şahin', '0532 777 8888', 'cashier', 'EMP-005', 'Kasa', '💰');

-- Kategoriler
INSERT INTO categories (id, name, description, icon, is_active, order_index) VALUES
('cat-1', 'Sıcak Yemekler', 'Ana yemekler ve kebaplar', '🍖', TRUE, 1),
('cat-2', 'İçecekler', 'Soğuk ve sıcak içecekler', '☕', TRUE, 2),
('cat-3', 'Tatlılar', 'Geleneksel tatlılar', '🍰', TRUE, 3),
('cat-4', 'Kahvaltı', 'Kahvaltı menüleri', '🍳', TRUE, 4);

-- Ürünler
INSERT INTO products (id, name, description, price, purchase_price, category_id, stock_code, stock, image_url, is_active, order_index) VALUES
('prod-1', 'Adana Kebap', 'Acılı kıyma kebap', 120.00, 80.00, 'cat-1', 'PRD-001', 50, '🌶️', TRUE, 1),
('prod-2', 'İskender', 'Döner üzerine tereyağ ve yoğurt', 160.00, 110.00, 'cat-1', 'PRD-002', 30, '🍖', TRUE, 2),
('prod-3', 'Pide', 'Kaşarlı pide', 80.00, 50.00, 'cat-1', 'PRD-003', 40, '🥟', TRUE, 3),
('prod-4', 'Çay', 'Demleme çay', 10.00, 3.00, 'cat-2', 'PRD-004', 200, '☕', TRUE, 1),
('prod-5', 'Ayran', 'Ev yapımı ayran', 15.00, 5.00, 'cat-2', 'PRD-005', 100, '🥛', TRUE, 2),
('prod-6', 'Baklava', 'Antep fıstıklı baklava', 90.00, 60.00, 'cat-3', 'PRD-006', 25, '🍰', TRUE, 1),
('prod-7', 'Serpme Kahvaltı', 'Zengin kahvaltı tabağı', 150.00, 90.00, 'cat-4', 'PRD-007', 20, '🍳', TRUE, 1);

-- Ürün Seçenek Grupları
INSERT INTO product_option_groups (id, name, description, is_required) VALUES
('opt-grp-1', 'Acılık Derecesi', 'Ürünün acılık seviyesi', TRUE),
('opt-grp-2', 'Porsiyon Boyutu', 'Porsiyon büyüklüğü', FALSE),
('opt-grp-3', 'Şeker Seviyesi', 'İçecek şeker seviyesi', FALSE);

-- Seçenek Değerleri
INSERT INTO product_option_values (id, group_id, name, price_modifier, is_default, order_index) VALUES
-- Acılık
('opt-val-1', 'opt-grp-1', 'Az Acılı', 0.00, TRUE, 1),
('opt-val-2', 'opt-grp-1', 'Normal', 0.00, FALSE, 2),
('opt-val-3', 'opt-grp-1', 'Çok Acılı', 5.00, FALSE, 3),
-- Porsiyon
('opt-val-4', 'opt-grp-2', 'Küçük', -20.00, FALSE, 1),
('opt-val-5', 'opt-grp-2', 'Orta', 0.00, TRUE, 2),
('opt-val-6', 'opt-grp-2', 'Büyük', 25.00, FALSE, 3),
-- Şeker
('opt-val-7', 'opt-grp-3', 'Şekersiz', 0.00, FALSE, 1),
('opt-val-8', 'opt-grp-3', 'Az Şekerli', 0.00, TRUE, 2),
('opt-val-9', 'opt-grp-3', 'Orta Şekerli', 0.00, FALSE, 3);

-- Ürün-Seçenek Eşleştirme
INSERT INTO product_options_mapping (id, product_id, option_group_id) VALUES
('map-1', 'prod-1', 'opt-grp-1'), -- Adana - Acılık
('map-2', 'prod-1', 'opt-grp-2'), -- Adana - Porsiyon
('map-3', 'prod-4', 'opt-grp-3'); -- Çay - Şeker

-- Masalar
INSERT INTO tables (id, number, capacity, shape, position_x, position_y, status) VALUES
('table-1', 1, 2, 'square', 50, 50, 'empty'),
('table-2', 2, 4, 'round', 200, 50, 'empty'),
('table-3', 3, 4, 'round', 350, 50, 'empty'),
('table-4', 4, 6, 'square', 500, 50, 'empty'),
('table-5', 5, 2, 'square', 50, 200, 'empty'),
('table-6', 6, 4, 'round', 200, 200, 'empty'),
('table-7', 7, 4, 'round', 350, 200, 'empty'),
('table-8', 8, 8, 'square', 500, 200, 'empty');

-- Sistem Ayarları
INSERT INTO settings (id, key_name, value, description, category) VALUES
('set-1', 'restaurant_name', 'PineResto', 'Restoran adı', 'general'),
('set-2', 'tax_rate', '9', 'KDV oranı (%)', 'general'),
('set-3', 'service_fee', '0', 'Servis ücreti (%)', 'general'),
('set-4', 'estimated_prep_time', '15', 'Varsayılan hazırlık süresi (dk)', 'orders'),
('set-5', 'currency', 'TRY', 'Para birimi', 'general'),
('set-6', 'language', 'tr', 'Varsayılan dil', 'general'),
('set-7', 'notification_sound', 'true', 'Ses bildirimleri', 'notifications'),
('set-8', 'notification_push', 'true', 'Push bildirimleri', 'notifications');

-- Tema Özelleştirmesi
INSERT INTO theme_customization (id, restaurant_name, primary_color, secondary_color, font_family) VALUES
('1', 'PineResto', '#3b82f6', '#10b981', 'Inter');

-- Tedarikçiler
INSERT INTO suppliers (id, name, contact_person, email, phone, is_active) VALUES
('sup-1', 'Et Tedarik A.Ş.', 'Ali Yıldız', 'ali@ettedarik.com', '0532 100 2000', TRUE),
('sup-2', 'Yaş Sebze Ltd.', 'Ayşe Kara', 'ayse@yassebze.com', '0533 200 3000', TRUE),
('sup-3', 'Süt Ürünleri A.Ş.', 'Mehmet Demir', 'mehmet@sutco.com', '0534 300 4000', TRUE);

-- Stok Ürünleri
INSERT INTO inventory_items (id, name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id) VALUES
('inv-1', 'Kuzu Eti', 'ingredient', 15, 20, 100, 'kg', 450.00, 'sup-1'),
('inv-2', 'Domates', 'ingredient', 50, 30, 100, 'kg', 25.00, 'sup-2'),
('inv-3', 'Ayran (Şişe)', 'beverage', 80, 50, 200, 'adet', 8.00, 'sup-3'),
('inv-4', 'Ekmek', 'ingredient', 45, 30, 80, 'adet', 5.00, 'sup-2'),
('inv-5', 'Karton Kutu', 'packaging', 120, 50, 200, 'adet', 2.00, NULL);

-- ============================================
-- PERFORMANS İNDEKSLERİ
-- ============================================

CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_users_role_active ON users(role, is_active);











