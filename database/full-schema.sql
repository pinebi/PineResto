-- ============================================
-- MODERN RESTORAN YÖNETİM SİSTEMİ
-- Tam Veritabanı Şeması
-- Desteklenen: Kiosk, Online, Mobil, QR
-- ============================================

-- ============================================
-- 1. KULLANICI YÖNETİMİ
-- ============================================

-- Kullanıcılar Tablosu (Yönetim + Müşteri)
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
    -- Yönetim Kullanıcısı Alanları
    employee_id VARCHAR(50),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    work_shift ENUM('morning', 'afternoon', 'evening', 'night'),
    -- Müşteri Alanları
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

-- Kullanıcı İzinleri
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

-- Kategoriler
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

-- Markalar
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

-- Ürünler
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
    INDEX idx_stock (stock)
);

-- Ürün Seçenek Grupları
CREATE TABLE product_option_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ürün Seçenek Değerleri
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

-- Ürün-Seçenek Eşleştirme
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
-- 3. SİPARİŞ YÖNETİMİ
-- ============================================

-- Masalar
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

-- Siparişler
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

-- Sipariş Ürünleri
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

-- Sipariş Ürün Seçenekleri
CREATE TABLE order_item_options (
    id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL,
    option_group_id VARCHAR(50) NOT NULL,
    option_value_id VARCHAR(50) NOT NULL,
    option_name VARCHAR(100),
    selected_value VARCHAR(255),
    price_modifier DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- ============================================
-- 4. ENVANTER YÖNETİMİ
-- ============================================

-- Tedarikçiler
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

-- Stok Ürünleri
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

-- Reçeteler (Ürün Maliyeti)
CREATE TABLE recipes (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reçete Malzemeleri
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
-- 5. PROMOSYON & KAMPANYALAR
-- ============================================

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
    INDEX idx_active (is_active)
);

-- ============================================
-- 6. MÜŞTERİ YÖNETİMİ
-- ============================================

-- Favori Ürünler
CREATE TABLE customer_favorites (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_product (customer_id, product_id)
);

-- Kayıtlı Sepetler
CREATE TABLE saved_carts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cart_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 7. SİSTEM AYARLARI
-- ============================================

CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tema Özelleştirmeleri
CREATE TABLE theme_customization (
    id VARCHAR(50) PRIMARY KEY,
    restaurant_name VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    font_family VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 8. BİLDİRİMLER
-- ============================================

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

-- Admin kullanıcısı
INSERT INTO users (id, username, email, password_hash, full_name, phone, role, employee_id, department) VALUES
('admin-1', 'admin', 'admin@restaurant.com', '$2a$10$demo_hash', 'Admin Kullanıcı', '0532 000 0001', 'admin', 'EMP-001', 'Yönetim');

-- Sistem ayarları
INSERT INTO settings (id, key_name, value, description, category) VALUES
('set-1', 'restaurant_name', 'Modern Restoran', 'Restoran adı', 'general'),
('set-2', 'tax_rate', '9', 'KDV oranı (%)', 'general'),
('set-3', 'service_fee', '0', 'Servis ücreti (%)', 'general'),
('set-4', 'estimated_prep_time', '15', 'Varsayılan hazırlık süresi (dk)', 'orders'),
('set-5', 'currency', 'TRY', 'Para birimi', 'general'),
('set-6', 'language', 'tr', 'Varsayılan dil', 'general');

-- Varsayılan tema
INSERT INTO theme_customization (id, restaurant_name, primary_color, secondary_color, font_family) VALUES
('theme-1', 'Modern Restoran', '#3b82f6', '#10b981', 'Inter');

-- ============================================
-- PERFORMANS İNDEKSLERİ
-- ============================================

-- Sipariş sorgulama optimizasyonu
CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at);
CREATE INDEX idx_orders_table ON orders(table_id, status);

-- Ürün arama optimizasyonu
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);

-- Stok kontrol optimizasyonu
CREATE INDEX idx_inventory_low_stock ON inventory_items(current_stock, min_stock);






