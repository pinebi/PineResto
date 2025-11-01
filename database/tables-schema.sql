-- Masalar Tablosu
CREATE TABLE tables (
    id INT PRIMARY KEY IDENTITY(1,1),
    table_number NVARCHAR(10) NOT NULL UNIQUE,
    table_name NVARCHAR(50) NOT NULL,
    region_id INT NOT NULL,
    capacity INT NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'reserved'
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    shape NVARCHAR(10) DEFAULT 'round', -- 'round', 'square'
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Masa Bölgeleri Tablosu
CREATE TABLE table_regions (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Foreign Key İlişkisi
ALTER TABLE tables
ADD CONSTRAINT FK_tables_region
FOREIGN KEY (region_id) REFERENCES table_regions(id);

-- Demo Veriler - Bölgeler
INSERT INTO table_regions (name, description) VALUES
('Ön Taraf', 'Restoranın ön kısmındaki masalar'),
('Arka Taraf', 'Restoranın arka kısmındaki masalar'),
('Teras', 'Teras bölümündeki masalar'),
('ÖN2', 'İkinci ön bölüm');

-- Demo Veriler - Masalar
INSERT INTO tables (table_number, table_name, region_id, capacity, status, position_x, position_y, shape) VALUES
('T001', 'Masa-1', 1, 4, 'available', 50, 50, 'round'),
('T002', 'Masa-2', 1, 4, 'available', 150, 50, 'round'),
('T003', 'Masa-3', 1, 4, 'available', 250, 50, 'round'),
('T004', 'Masa-4', 1, 4, 'available', 350, 50, 'round'),
('T005', 'Masa-5', 2, 6, 'occupied', 50, 150, 'square'),
('T006', 'Masa-6', 2, 6, 'occupied', 150, 150, 'square'),
('T007', 'Masa-7', 2, 6, 'available', 250, 150, 'square'),
('T008', 'Masa-8', 3, 2, 'reserved', 50, 250, 'round'),
('T009', 'Masa-9', 3, 2, 'available', 150, 250, 'round'),
('T010', 'Masa-10', 4, 8, 'available', 50, 350, 'square');

-- İndeksler
CREATE INDEX IX_tables_region_id ON tables(region_id);
CREATE INDEX IX_tables_status ON tables(status);
CREATE INDEX IX_tables_table_number ON tables(table_number);

-- Trigger - Updated At
CREATE TRIGGER TR_tables_updated_at
ON tables
AFTER UPDATE
AS
BEGIN
    UPDATE tables
    SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;

CREATE TRIGGER TR_table_regions_updated_at
ON table_regions
AFTER UPDATE
AS
BEGIN
    UPDATE table_regions
    SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;





