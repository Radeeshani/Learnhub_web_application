-- =====================================================
-- HOMEWORK APPLICATION - COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains the complete database structure for the Homework Application
-- Use this file to set up the database on a new PC
-- 
-- Database Name: homework_db
-- MySQL Version: 8.0+
-- 
-- Created: 2025-08-29
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS homework_db;
USE homework_db;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(1024) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    phone_number VARCHAR(20),
    class_grade VARCHAR(50),
    subject_taught VARCHAR(100),
    student_id VARCHAR(50),
    parent_of_student_id BIGINT,
    address TEXT,
    parent_first_name VARCHAR(100),
    parent_last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    profile_picture VARCHAR(255),
    last_activity_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_class_grade (class_grade),
    INDEX idx_address (address(100)),
    INDEX idx_parent_email (parent_first_name)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    event_type ENUM('HOMEWORK', 'EXAM', 'EVENT', 'HOLIDAY') DEFAULT 'EVENT',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_event_type (event_type),
    INDEX idx_created_by (created_by)
);

-- =====================================================
-- CLASSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    grade_level VARCHAR(50),
    subject VARCHAR(100),
    teacher_id BIGINT,
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_grade_level (grade_level),
    INDEX idx_subject (subject),
    INDEX idx_academic_year (academic_year)
);

-- =====================================================
-- ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE', 'DROPPED') DEFAULT 'ACTIVE',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_id),
    INDEX idx_student_id (student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_status (status)
);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id BIGINT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    total_points INT DEFAULT 100,
    assignment_type ENUM('HOMEWORK', 'QUIZ', 'PROJECT', 'EXAM') DEFAULT 'HOMEWORK',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_due_date (due_date),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_is_published (is_published)
);

-- =====================================================
-- HOMEWORKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS homeworks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id BIGINT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    total_points INT DEFAULT 100,
    grade VARCHAR(50),
    audio_data LONGBLOB,
    image_data LONGBLOB,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_due_date (due_date),
    INDEX idx_created_by (created_by),
    INDEX idx_grade (grade)
);

-- =====================================================
-- HOMEWORK SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS homework_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homework_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT,
    submitted_file VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INT,
    feedback TEXT,
    graded_by BIGINT,
    graded_at TIMESTAMP,
    status ENUM('SUBMITTED', 'GRADED', 'LATE', 'MISSING') DEFAULT 'SUBMITTED',
    FOREIGN KEY (homework_id) REFERENCES homeworks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_submission (homework_id, student_id),
    INDEX idx_homework_id (homework_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- =====================================================
-- REMINDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reminder_date TIMESTAMP NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    is_read BOOLEAN DEFAULT FALSE,
    reminder_type ENUM('HOMEWORK', 'EXAM', 'EVENT', 'GENERAL') DEFAULT 'GENERAL',
    related_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_reminder_date (reminder_date),
    INDEX idx_priority (priority),
    INDEX idx_is_read (is_read),
    INDEX idx_reminder_type (reminder_type)
);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type ENUM('ACADEMIC', 'BEHAVIORAL', 'ATTENDANCE', 'OTHER') DEFAULT 'OTHER',
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_report_date (report_date)
);

-- =====================================================
-- GAMIFICATION TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    points INT DEFAULT 0,
    criteria TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_points (points)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id)
);

CREATE TABLE IF NOT EXISTS user_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_points (user_id),
    INDEX idx_points (points),
    INDEX idx_level (level)
);

-- =====================================================
-- LIBRARY TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS library_books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    description TEXT,
    category VARCHAR(100),
    grade_level VARCHAR(50),
    subject VARCHAR(100),
    file_path VARCHAR(500),
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category),
    INDEX idx_grade_level (grade_level),
    INDEX idx_subject (subject)
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role, is_active) VALUES 
('Admin', 'User', 'admin@homework.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Insert some default achievements
INSERT INTO achievements (name, description, points, criteria) VALUES 
('First Homework', 'Complete your first homework assignment', 10, 'Submit first homework'),
('Perfect Score', 'Get 100% on any assignment', 50, 'Achieve perfect score'),
('On Time', 'Submit 5 assignments on time', 25, 'Submit 5 assignments before due date'),
('Helping Hand', 'Help 3 other students', 30, 'Provide help to 3 different students')
ON DUPLICATE KEY UPDATE id=id;

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_homeworks_class_due ON homeworks(class_id, due_date);
CREATE INDEX idx_submissions_homework_student ON homework_submissions(homework_id, student_id);
CREATE INDEX idx_reminders_user_date ON reminders(user_id, reminder_date);
CREATE INDEX idx_events_start_end ON calendar_events(start_date, end_date);

-- =====================================================
-- DATABASE SETUP COMPLETE
-- =====================================================
-- 
-- To use this database:
-- 1. Make sure MySQL is running
-- 2. Run this script: mysql -u root -p < setup_complete_database.sql
-- 3. Update application.yml with your database credentials
-- 4. Start the Spring Boot application
--
-- Default admin credentials:
-- Email: admin@homework.com
-- Password: admin123
-- =====================================================
