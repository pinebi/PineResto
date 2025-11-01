-- Pine Resto Veritabanı Tabloları
-- Firma No: 1234

-- Kullanıcılar Tablosu
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'waiter', 'kitchen', 'delivery', 'cashier', 'customer')),
    is_active BIT DEFAULT 1,
    avatar NVARCHAR(255),
    employee_id NVARCHAR(20),
    department NVARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    work_shift NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Kategoriler Tablosu
CREATE TABLE categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    parent_id INT NULL,
    order_index INT DEFAULT 0,
    image_url NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Ürünler Tablosu
CREATE TABLE products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000),
    price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2),
    category_id INT NOT NULL,
    brand NVARCHAR(100),
    stock_code NVARCHAR(50),
    stock_quantity INT DEFAULT 0,
    image_url NVARCHAR(255),
    is_active BIT DEFAULT 1,
    is_new_product BIT DEFAULT 0,
    is_fast_shipping BIT DEFAULT 0,
    is_showcase BIT DEFAULT 0,
    order_index INT DEFAULT 0,
    source NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Masalar Tablosu
CREATE TABLE tables (
    id INT PRIMARY KEY IDENTITY(1,1),
    number NVARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status NVARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
    current_order_id INT NULL,
    location NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Masa Oturumları Tablosu
CREATE TABLE table_sessions (
    id INT PRIMARY KEY IDENTITY(1,1),
    table_id INT NOT NULL,
    waiter_id INT NOT NULL,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NULL,
    duration_minutes INT NULL,
    customer_count INT DEFAULT 1,
    total_amount DECIMAL(10,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Siparişler Tablosu
CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_number NVARCHAR(20) UNIQUE NOT NULL,
    order_type NVARCHAR(20) NOT NULL CHECK (order_type IN ('kiosk', 'online', 'waiter')),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    customer_name NVARCHAR(100),
    customer_phone NVARCHAR(20),
    customer_address NVARCHAR(500),
    table_id INT NULL,
    waiter_id INT NULL,
    payment_method NVARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'digital')),
    payment_status NVARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    estimated_time INT, -- dakika
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Sipariş Detayları Tablosu
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes NVARCHAR(200),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Müşteriler Tablosu
CREATE TABLE customers (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NULL,
    customer_type NVARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'corporate')),
    loyalty_points INT DEFAULT 0,
    membership_level NVARCHAR(20) DEFAULT 'bronze' CHECK (membership_level IN ('bronze', 'silver', 'gold', 'platinum')),
    total_spent DECIMAL(10,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    address NVARCHAR(500),
    birth_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Ödemeler Tablosu
CREATE TABLE payments (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    payment_method NVARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
    amount DECIMAL(10,2) NOT NULL,
    payment_status NVARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id NVARCHAR(100),
    processed_at DATETIME2 DEFAULT GETDATE(),
    notes NVARCHAR(200),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Stok Tablosu
CREATE TABLE inventory (
    id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 100,
    last_updated DATETIME2 DEFAULT GETDATE(),
    notes NVARCHAR(200),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tedarikçiler Tablosu
CREATE TABLE suppliers (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    contact_person NVARCHAR(100),
    phone NVARCHAR(20),
    email NVARCHAR(100),
    address NVARCHAR(500),
    payment_terms NVARCHAR(100),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Promosyonlar Tablosu
CREATE TABLE promotions (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    discount_type NVARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Sistem Ayarları Tablosu
CREATE TABLE system_settings (
    id INT PRIMARY KEY IDENTITY(1,1),
    setting_key NVARCHAR(100) UNIQUE NOT NULL,
    setting_value NVARCHAR(1000),
    setting_type NVARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description NVARCHAR(500),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Demo veriler ekle
INSERT INTO users (username, email, password_hash, full_name, phone, role, employee_id, department, salary, hire_date, work_shift) VALUES
('admin', 'admin@restaurant.com', '$2b$10$hash', 'Admin Kullanıcı', '0532 000 0001', 'admin', 'EMP-001', 'Yönetim', 25000.00, '2024-01-01', 'morning'),
('garson1', 'ahmet@restaurant.com', '$2b$10$hash', 'Ahmet Yılmaz', '0532 111 2222', 'waiter', 'EMP-002', 'Servis', 15000.00, '2024-01-15', 'morning'),
('mutfak1', 'fatma@restaurant.com', '$2b$10$hash', 'Fatma Demir', '0532 333 4444', 'kitchen', 'EMP-003', 'Mutfak', 18000.00, '2024-01-20', 'afternoon'),
('kurye1', 'mehmet@restaurant.com', '$2b$10$hash', 'Mehmet Kaya', '0532 555 6666', 'delivery', 'EMP-004', 'Teslimat', 16000.00, '2024-01-25', 'evening'),
('kasa1', 'ayse@restaurant.com', '$2b$10$hash', 'Ayşe Şahin', '0532 777 8888', 'cashier', 'EMP-005', 'Kasa', 14000.00, '2024-02-01', 'afternoon');

INSERT INTO categories (name, description, order_index) VALUES
('Pizza', 'Çeşitli pizza türleri', 1),
('Ana Yemek', 'Et ve tavuk yemekleri', 2),
('İçecek', 'Soğuk ve sıcak içecekler', 3),
('Tatlı', 'Çeşitli tatlılar', 4),
('Salata', 'Taze salatalar', 5);

INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES
('Margherita Pizza', 'Domates, mozzarella, fesleğen', 45.00, 1, 50),
('Pepperoni Pizza', 'Domates, mozzarella, pepperoni', 55.00, 1, 30),
('Tavuk Döner', 'Tavuk eti, sebze, sos', 35.00, 2, 25),
('Coca Cola', '330ml kutu', 8.00, 3, 200),
('Çikolatalı Pasta', 'Çikolata kaplı pasta', 25.00, 4, 15);

INSERT INTO tables (number, capacity, status) VALUES
('1', 4, 'available'),
('2', 6, 'available'),
('3', 2, 'available'),
('4', 8, 'available'),
('5', 4, 'available'),
('6', 6, 'available'),
('7', 4, 'available'),
('8', 8, 'available'),
('9', 2, 'available'),
('10', 4, 'available');

INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('restaurant_name', 'Pine Resto', 'string', 'Restoran adı'),
('firm_number', '1234', 'string', 'Firma numarası'),
('currency', 'TRY', 'string', 'Para birimi'),
('tax_rate', '18', 'number', 'KDV oranı'),
('service_charge', '10', 'number', 'Servis ücreti yüzdesi'),
('max_table_capacity', '12', 'number', 'Maksimum masa kapasitesi');






