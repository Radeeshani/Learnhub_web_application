-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS homework_db;

-- Create the application user if it doesn't exist
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'Ashmhmd25321';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON homework_db.* TO 'root'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the homework database
USE homework_db;