-- Restaurant Management System Database Schema
-- Supports both Kiosk and Online Ordering

-- Categories Table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(50),
    order_index INT DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Product Flavors Table (Çeşniler)
CREATE TABLE product_flavors (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Flavor Values Table (Çeşni Değerleri)
CREATE TABLE product_flavor_values (
    id VARCHAR(50) PRIMARY KEY,
    flavor_id VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flavor_id) REFERENCES product_flavors(id) ON DELETE CASCADE
);

-- Tables Table (for restaurant management)
CREATE TABLE tables (
    id VARCHAR(50) PRIMARY KEY,
    number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    current_order_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT AUTO_INCREMENT UNIQUE,
    order_type ENUM('kiosk', 'online') NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    table_id VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    estimated_time INT, -- in minutes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Order Item Options Table
CREATE TABLE order_item_options (
    id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL,
    option_id VARCHAR(50) NOT NULL,
    selected_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE
);

-- Staff Table (for order management)
CREATE TABLE staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'kitchen', 'waiter') DEFAULT 'waiter',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order Assignments Table (kitchen staff assignments)
CREATE TABLE order_assignments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    staff_id VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_tables_status ON tables(status);

-- Insert default settings
INSERT INTO settings (id, key_name, value, description) VALUES
('1', 'restaurant_name', 'Modern Restoran', 'Restaurant name'),
('2', 'tax_rate', '18', 'Tax rate percentage'),
('3', 'service_fee', '0', 'Service fee percentage'),
('4', 'estimated_prep_time', '15', 'Default estimated preparation time in minutes'),
('5', 'max_table_capacity', '12', 'Maximum table capacity'),
('6', 'order_timeout', '30', 'Order timeout in minutes for automatic cancellation');






