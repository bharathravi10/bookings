CREATE DATABASE IF NOT EXISTS bookings_db;
USE bookings_db;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  mobile VARCHAR(20),
  vehicle_number VARCHAR(50),
  status TINYINT NOT NULL DEFAULT 1,
  comment TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO bookings (name, address, city, mobile, vehicle_number, status) VALUES
('John Doe', '123 Main St', 'Chennai', '+919800000001', 'TN01AB1234', 1),
('Alice', '4 Park Ave', 'Bengaluru', '+919800000002', 'KA05CD5678', 1),
('Bob', '78 Market St', 'Mumbai', '+919800000003', 'MH12EF9012', 2),
('Charlie', '56 High St', 'Delhi', '+919800000004', 'DL03GH3456', 1),
('Diana', '90 Beach Rd', 'Goa', '+919800000005', 'GA07IJ7890', 3),
('Eve', '12 Hill Ave', 'Pune', '+919800000006', 'MH14KL1234', 4);

