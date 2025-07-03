-- Create database for homework application
CREATE DATABASE IF NOT EXISTS homework_db;

-- Create user for the application
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'Ashmhmd25321';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON homework_db.* TO 'root'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the homework database
USE homework_db; 