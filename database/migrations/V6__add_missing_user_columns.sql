-- Migration V6: Add missing columns to users table

-- Add phone_number column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add student_id column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
