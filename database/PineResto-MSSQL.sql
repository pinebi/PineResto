-- ============================================
-- PineResto - MSSQL Server Version
-- Modern Restoran Yönetim Sistemi
-- ============================================

-- PineResto veritabanını kullan
USE PineResto;
GO

-- ============================================
-- 1. KULLANICI YÖNETİMİ
-- ============================================

IF OBJECT_ID('user_permissions', 'U') IS NOT NULL DROP TABLE user_permissions;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'waiter', 'kitchen', 'delivery', 'cashier', 'customer')),
    is_active BIT DEFAULT 1,
    avatar VARCHAR(10) DEFAULT '👤',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2 NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    work_shift VARCHAR(20) CHECK (work_shift IN ('morning', 'afternoon', 'evening', 'night')),
    customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'corporate')),
    loyalty_points INT DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'bronze' CHECK (membership_level IN ('bronze', 'silver', 'gold', 'platinum')),
    total_spent DECIMAL(10,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    address NVARCHAR(MAX),
    birth_date DATE
);
GO

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
GO

CREATE TABLE user_permissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL,
    can_view BIT DEFAULT 0,
    can_create BIT DEFAULT 0,
    can_edit BIT DEFAULT 0,
    can_delete BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_module UNIQUE (user_id, module)
);
GO

-- ============================================
-- 2. KATALOG YÖNETİMİ
-- ============================================

IF OBJECT_ID('product_options_mapping', 'U') IS NOT NULL DROP TABLE product_options_mapping;
IF OBJECT_ID('product_option_values', 'U') IS NOT NULL DROP TABLE product_option_values;
IF OBJECT_ID('product_option_groups', 'U') IS NOT NULL DROP TABLE product_option_groups;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('brands', 'U') IS NOT NULL DROP TABLE brands;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
GO

CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    parent_id VARCHAR(50),
    order_index INT DEFAULT 0,
    icon VARCHAR(10),
    image_url VARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
GO

CREATE TABLE brands (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    logo VARCHAR(500),
    website VARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2),
    category_id VARCHAR(50) NOT NULL,
    brand_id VARCHAR(50),
    stock_code VARCHAR(100),
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    is_active BIT DEFAULT 1,
    is_new_product BIT DEFAULT 0,
    is_fast_shipping BIT DEFAULT 0,
    is_showcase BIT DEFAULT 0,
    order_index INT DEFAULT 0,
    source VARCHAR(50) DEFAULT 'SYSTEM',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products(name);
GO

CREATE TABLE product_option_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    is_required BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE product_option_values (
    id VARCHAR(50) PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    is_default BIT DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE
);
GO

CREATE TABLE product_options_mapping (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    option_group_id VARCHAR(50) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (option_group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_option UNIQUE (product_id, option_group_id)
);
GO

-- ============================================
-- 3. MASA VE SİPARİŞ YÖNETİMİ
-- ============================================

IF OBJECT_ID('order_item_options', 'U') IS NOT NULL DROP TABLE order_item_options;
IF OBJECT_ID('order_items', 'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('orders', 'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('tables', 'U') IS NOT NULL DROP TABLE tables;
GO

CREATE TABLE tables (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    shape VARCHAR(20) DEFAULT 'round' CHECK (shape IN ('square', 'round')),
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'reserved')),
    current_order_id VARCHAR(50),
    waiter_id VARCHAR(50),
    reservation_name VARCHAR(255),
    reservation_time DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_tables_status ON tables(status);
GO

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT IDENTITY(1,1) UNIQUE,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('kiosk', 'online', 'table', 'qr')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    table_id VARCHAR(50),
    customer_id VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address NVARCHAR(MAX),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'online')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    waiter_id VARCHAR(50),
    delivery_id VARCHAR(50),
    estimated_time INT,
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2 NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE NO ACTION,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (delivery_id) REFERENCES users(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
GO

CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_order_items_order ON order_items(order_id);
GO

CREATE TABLE order_item_options (
    id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL,
    option_name VARCHAR(100),
    selected_value VARCHAR(255),
    price_modifier DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);
GO

-- ============================================
-- 4. ENVANTER YÖNETİMİ
-- ============================================

IF OBJECT_ID('recipe_ingredients', 'U') IS NOT NULL DROP TABLE recipe_ingredients;
IF OBJECT_ID('recipes', 'U') IS NOT NULL DROP TABLE recipes;
IF OBJECT_ID('inventory_items', 'U') IS NOT NULL DROP TABLE inventory_items;
IF OBJECT_ID('suppliers', 'U') IS NOT NULL DROP TABLE suppliers;
GO

CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address NVARCHAR(MAX),
    tax_number VARCHAR(50),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('ingredient', 'beverage', 'packaging', 'other')),
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    supplier_id VARCHAR(50),
    last_restock_date DATE,
    expiry_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_inventory_stock ON inventory_items(current_stock, min_stock);
GO

CREATE TABLE recipes (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_recipe_product UNIQUE (product_id)
);
GO

CREATE TABLE recipe_ingredients (
    id VARCHAR(50) PRIMARY KEY,
    recipe_id VARCHAR(50) NOT NULL,
    inventory_item_id VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE NO ACTION
);
GO

-- ============================================
-- 5. PROMOSYON & MÜŞTERİ
-- ============================================

IF OBJECT_ID('customer_favorites', 'U') IS NOT NULL DROP TABLE customer_favorites;
IF OBJECT_ID('saved_carts', 'U') IS NOT NULL DROP TABLE saved_carts;
IF OBJECT_ID('promotions', 'U') IS NOT NULL DROP TABLE promotions;
GO

CREATE TABLE promotions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('discount', 'coupon', 'combo', 'happy-hour', 'bogo')),
    value DECIMAL(10,2) NOT NULL,
    code VARCHAR(50) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BIT DEFAULT 1,
    usage_count INT DEFAULT 0,
    usage_limit INT,
    min_order_amount DECIMAL(10,2),
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
GO

CREATE TABLE customer_favorites (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_customer_product UNIQUE (customer_id, product_id)
);
GO

CREATE TABLE saved_carts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cart_data NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- ============================================
-- 6. SİSTEM AYARLARI
-- ============================================

IF OBJECT_ID('notifications', 'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID('theme_customization', 'U') IS NOT NULL DROP TABLE theme_customization;
IF OBJECT_ID('settings', 'U') IS NOT NULL DROP TABLE settings;
GO

CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value NVARCHAR(MAX),
    description NVARCHAR(MAX),
    category VARCHAR(100),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE theme_customization (
    id VARCHAR(50) PRIMARY KEY DEFAULT '1',
    restaurant_name VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#10b981',
    font_family VARCHAR(100) DEFAULT 'Inter',
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'info', 'success', 'warning', 'error')),
    title VARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
GO

-- ============================================
-- VARSAYILAN VERİLER
-- ============================================

-- Kullanıcılar
INSERT INTO users (id, username, email, password_hash, full_name, phone, role, employee_id, department, avatar) VALUES
('admin-1', 'admin', 'admin@pineresto.com', '$2a$10$demo_hash', 'Admin Kullanıcı', '0532 000 0001', 'admin', 'EMP-001', 'Yönetim', '👨‍💼'),
('user-2', 'garson1', 'ahmet@pineresto.com', '$2a$10$demo_hash', 'Ahmet Yılmaz', '0532 111 2222', 'waiter', 'EMP-002', 'Servis', '👨‍🍳'),
('user-3', 'mutfak1', 'fatma@pineresto.com', '$2a$10$demo_hash', 'Fatma Demir', '0532 333 4444', 'kitchen', 'EMP-003', 'Mutfak', '👩‍🍳'),
('user-4', 'kurye1', 'mehmet@pineresto.com', '$2a$10$demo_hash', 'Mehmet Kaya', '0532 555 6666', 'delivery', 'EMP-004', 'Teslimat', '🚴'),
('user-5', 'kasa1', 'ayse@pineresto.com', '$2a$10$demo_hash', 'Ayşe Şahin', '0532 777 8888', 'cashier', 'EMP-005', 'Kasa', '💰');
GO

-- Kategoriler
INSERT INTO categories (id, name, description, icon, is_active, order_index) VALUES
('cat-1', 'Sıcak Yemekler', 'Ana yemekler ve kebaplar', '🍖', 1, 1),
('cat-2', 'İçecekler', 'Soğuk ve sıcak içecekler', '☕', 1, 2),
('cat-3', 'Tatlılar', 'Geleneksel tatlılar', '🍰', 1, 3),
('cat-4', 'Kahvaltı', 'Kahvaltı menüleri', '🍳', 1, 4);
GO

-- Ürünler
INSERT INTO products (id, name, description, price, purchase_price, category_id, stock_code, stock, image_url, is_active, order_index) VALUES
('prod-1', 'Adana Kebap', 'Acılı kıyma kebap', 120.00, 80.00, 'cat-1', 'PRD-001', 50, '🌶️', 1, 1),
('prod-2', 'İskender', 'Döner üzerine tereyağ ve yoğurt', 160.00, 110.00, 'cat-1', 'PRD-002', 30, '🍖', 1, 2),
('prod-3', 'Pide', 'Kaşarlı pide', 80.00, 50.00, 'cat-1', 'PRD-003', 40, '🥟', 1, 3),
('prod-4', 'Çay', 'Demleme çay', 10.00, 3.00, 'cat-2', 'PRD-004', 200, '☕', 1, 1),
('prod-5', 'Ayran', 'Ev yapımı ayran', 15.00, 5.00, 'cat-2', 'PRD-005', 100, '🥛', 1, 2),
('prod-6', 'Baklava', 'Antep fıstıklı baklava', 90.00, 60.00, 'cat-3', 'PRD-006', 25, '🍰', 1, 1),
('prod-7', 'Serpme Kahvaltı', 'Zengin kahvaltı tabağı', 150.00, 90.00, 'cat-4', 'PRD-007', 20, '🍳', 1, 1);
GO

-- Ürün Seçenekleri
INSERT INTO product_option_groups (id, name, description, is_required) VALUES
('opt-grp-1', 'Acılık Derecesi', 'Ürünün acılık seviyesi', 1),
('opt-grp-2', 'Porsiyon Boyutu', 'Porsiyon büyüklüğü', 0),
('opt-grp-3', 'Şeker Seviyesi', 'İçecek şeker seviyesi', 0);
GO

INSERT INTO product_option_values (id, group_id, name, price_modifier, is_default, order_index) VALUES
('opt-val-1', 'opt-grp-1', 'Az Acılı', 0.00, 1, 1),
('opt-val-2', 'opt-grp-1', 'Normal', 0.00, 0, 2),
('opt-val-3', 'opt-grp-1', 'Çok Acılı', 5.00, 0, 3),
('opt-val-4', 'opt-grp-2', 'Küçük', -20.00, 0, 1),
('opt-val-5', 'opt-grp-2', 'Orta', 0.00, 1, 2),
('opt-val-6', 'opt-grp-2', 'Büyük', 25.00, 0, 3),
('opt-val-7', 'opt-grp-3', 'Şekersiz', 0.00, 0, 1),
('opt-val-8', 'opt-grp-3', 'Az Şekerli', 0.00, 1, 2),
('opt-val-9', 'opt-grp-3', 'Orta Şekerli', 0.00, 0, 3);
GO

INSERT INTO product_options_mapping (id, product_id, option_group_id) VALUES
('map-1', 'prod-1', 'opt-grp-1'),
('map-2', 'prod-1', 'opt-grp-2'),
('map-3', 'prod-4', 'opt-grp-3');
GO

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
GO

-- Tedarikçiler
INSERT INTO suppliers (id, name, contact_person, email, phone, is_active) VALUES
('sup-1', 'Et Tedarik A.Ş.', 'Ali Yıldız', 'ali@ettedarik.com', '0532 100 2000', 1),
('sup-2', 'Yaş Sebze Ltd.', 'Ayşe Kara', 'ayse@yassebze.com', '0533 200 3000', 1),
('sup-3', 'Süt Ürünleri A.Ş.', 'Mehmet Demir', 'mehmet@sutco.com', '0534 300 4000', 1);
GO

-- Stok
INSERT INTO inventory_items (id, name, category, current_stock, min_stock, max_stock, unit, unit_price, supplier_id) VALUES
('inv-1', 'Kuzu Eti', 'ingredient', 15, 20, 100, 'kg', 450.00, 'sup-1'),
('inv-2', 'Domates', 'ingredient', 50, 30, 100, 'kg', 25.00, 'sup-2'),
('inv-3', 'Ayran (Şişe)', 'beverage', 80, 50, 200, 'adet', 8.00, 'sup-3'),
('inv-4', 'Ekmek', 'ingredient', 45, 30, 80, 'adet', 5.00, 'sup-2'),
('inv-5', 'Karton Kutu', 'packaging', 120, 50, 200, 'adet', 2.00, NULL);
GO

-- Ayarlar
INSERT INTO settings (id, key_name, value, description, category) VALUES
('set-1', 'restaurant_name', 'PineResto', 'Restoran adı', 'general'),
('set-2', 'tax_rate', '9', 'KDV oranı (%)', 'general'),
('set-3', 'currency', 'TRY', 'Para birimi', 'general'),
('set-4', 'language', 'tr', 'Varsayılan dil', 'general');
GO

-- Tema
INSERT INTO theme_customization (id, restaurant_name, primary_color, secondary_color, font_family) VALUES
('1', 'PineResto', '#3b82f6', '#10b981', 'Inter');
GO

PRINT '✅ PineResto veritabanı başarıyla oluşturuldu!';
GO

