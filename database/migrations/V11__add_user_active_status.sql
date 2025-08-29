-- Add is_active column to users table
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Create index for better performance
CREATE INDEX idx_users_active ON users(is_active);

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
