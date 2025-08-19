-- Fix user role for testing
USE homework_db;

-- Update the user with email 'test1@gmail.com' to have TEACHER role
UPDATE users 
SET role = 'TEACHER', 
    subject_taught = 'Mathematics',
    updated_at = NOW()
WHERE email = 'test1@gmail.com';

-- Verify the update
SELECT id, first_name, last_name, email, role, subject_taught 
FROM users 
WHERE email = 'test1@gmail.com';
