-- Demo users for testing the authentication system
-- Passwords are properly encoded with BCrypt
-- Plain text passwords: admin123, teacher123, student123, parent123

USE homework_db;

-- Clear existing data
DELETE FROM users;

-- Reset auto-increment
ALTER TABLE users AUTO_INCREMENT = 1;

-- Insert demo users with proper BCrypt password hashes
-- Admin User
INSERT INTO users (email, password, first_name, last_name, role, phone_number, created_at, updated_at) 
VALUES ('admin@homework.com', '$2a$10$dEEh9BaE0s3NyMLRE.yK4eQzRoviARAyKBLl9Y3H2evs6UJgLCS/2', 'School', 'Administrator', 'ADMIN', '+1234567890', NOW(), NOW());

-- Teacher User
INSERT INTO users (email, password, first_name, last_name, role, phone_number, subject_taught, created_at, updated_at) 
VALUES ('teacher@homework.com', '$2a$10$7b7pu9O1lSZ0sGreAqucUeefd4dJV4r.PGVU/e/w3702ZMGMwm9N.', 'John', 'Smith', 'TEACHER', '+1234567891', 'Mathematics', NOW(), NOW());

-- Student User
INSERT INTO users (email, password, first_name, last_name, role, phone_number, class_grade, student_id, created_at, updated_at) 
VALUES ('student@homework.com', '$2a$10$G8Xxsixdb2k34O7/ARUx6eBGYZrvktVZ0GHYn4Owf3dDQDGWcm4OG', 'Emma', 'Johnson', 'STUDENT', '+1234567892', '3rd Grade', 'STU001', NOW(), NOW());

-- Parent User (linked to Emma Johnson)
INSERT INTO users (email, password, first_name, last_name, role, phone_number, parent_of_student_id, created_at, updated_at) 
VALUES ('parent@homework.com', '$2a$10$gojD0.5nY6NGBTGE0H6mCesWpTAa.lIEZfv/pDS6z.B4i4m.cEVP.', 'Michael', 'Johnson', 'PARENT', '+1234567893', 3, NOW(), NOW());

-- Additional demo users
INSERT INTO users (first_name, last_name, email, password, role, phone_number, subject_taught, created_at, updated_at) 
VALUES ('Sarah', 'Wilson', 'sarah.teacher@homework.com', '$2a$10$7b7pu9O1lSZ0sGreAqucUeefd4dJV4r.PGVU/e/w3702ZMGMwm9N.', 'TEACHER', '123-456-7894', 'English', NOW(), NOW());

INSERT INTO users (first_name, last_name, email, password, role, phone_number, class_grade, student_id, created_at, updated_at) 
VALUES ('Alex', 'Brown', 'alex.student@homework.com', '$2a$10$G8Xxsixdb2k34O7/ARUx6eBGYZrvktVZ0GHYn4Owf3dDQDGWcm4OG', 'STUDENT', '123-456-7895', '4th Grade', 'STU002', NOW(), NOW());

INSERT INTO users (first_name, last_name, email, password, role, phone_number, class_grade, student_id, created_at, updated_at) 
VALUES ('Sophia', 'Davis', 'sophia.student@homework.com', '$2a$10$G8Xxsixdb2k34O7/ARUx6eBGYZrvktVZ0GHYn4Owf3dDQDGWcm4OG', 'STUDENT', '123-456-7896', '3rd Grade', 'STU003', NOW(), NOW());

-- Test Credentials (these will now work):
-- Admin:   email: admin@homework.com,   password: admin123
-- Teacher: email: teacher@homework.com, password: teacher123
-- Student: email: student@homework.com, password: student123
-- Parent:  email: parent@homework.com,  password: parent123
-- Sarah:   email: sarah.teacher@homework.com, password: teacher123
-- Alex:    email: alex.student@homework.com, password: student123
-- Sophia:  email: sophia.student@homework.com, password: student123
