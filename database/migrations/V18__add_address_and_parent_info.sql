-- Migration V18: Add address field and parent information for students

-- Add address column to users table (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN address TEXT;

-- Add parent first name column for students (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN parent_first_name VARCHAR(100);

-- Add parent last name column for students (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN parent_last_name VARCHAR(100);

-- Add parent email column for students (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN parent_email VARCHAR(255);

-- Add parent phone column for students (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN parent_phone VARCHAR(20);

-- Add indexes for better performance
CREATE INDEX idx_users_address ON users(address(100));
CREATE INDEX idx_users_parent_email ON users(parent_email);
