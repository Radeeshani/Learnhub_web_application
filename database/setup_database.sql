-- Complete Database Setup Script for Homework Application
-- Run this script to set up the entire database from scratch

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS homework_db;
USE homework_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    phone_number VARCHAR(20),
    class_grade VARCHAR(20),
    subject_taught VARCHAR(100),
    student_id VARCHAR(50),
    parent_of_student_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_of_student_id) REFERENCES users(id)
);

-- Create homeworks table
CREATE TABLE IF NOT EXISTS homeworks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    teacher_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Create homework submissions table
CREATE TABLE IF NOT EXISTS homework_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homework_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    audio_data LONGTEXT,
    image_data LONGTEXT,
    pdf_data LONGTEXT,
    submission_type ENUM('TEXT', 'VOICE', 'PHOTO', 'PDF', 'MIXED'),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    grade INT,
    feedback TEXT,
    graded_at TIMESTAMP NULL,
    graded_by BIGINT NULL,
    status ENUM('SUBMITTED', 'GRADED', 'RETURNED') DEFAULT 'SUBMITTED',
    FOREIGN KEY (homework_id) REFERENCES homeworks(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (graded_by) REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('DUE_SOON', 'OVERDUE', 'GRADED', 'NEW_HOMEWORK', 'SUBMISSION_RECEIVED', 'REMINDER', 'SYSTEM') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    homework_id BIGINT,
    homework_title VARCHAR(255),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (homework_id) REFERENCES homeworks(id)
);

-- Create calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type ENUM('HOMEWORK_DUE', 'EXAM', 'HOLIDAY', 'MEETING', 'OTHER') NOT NULL,
    user_id BIGINT NOT NULL,
    homework_id BIGINT,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (homework_id) REFERENCES homeworks(id)
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50),
    description TEXT,
    schedule_info VARCHAR(500),
    room_number VARCHAR(50),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    max_students INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    teacher_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE', 'DROPPED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    grade VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uk_enrollment_student_class (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type ENUM('HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT', 'ESSAY', 'PRESENTATION', 'LAB_REPORT', 'DISCUSSION', 'PARTICIPATION') NOT NULL,
    due_date TIMESTAMP NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    max_points INT,
    weight_percentage DECIMAL(5,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    late_submission_penalty DECIMAL(5,2) DEFAULT 0.0,
    attachments_info TEXT,
    submission_instructions TEXT,
    class_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    criteria TEXT,
    points_required INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT,
    points_earned INT DEFAULT 0,
    level INT DEFAULT 1,
    experience_points INT DEFAULT 0,
    achievements_count INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_homeworks_teacher ON homeworks(teacher_id);
CREATE INDEX idx_homeworks_subject ON homeworks(subject);
CREATE INDEX idx_homeworks_due_date ON homeworks(due_date);
CREATE INDEX idx_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_submissions_student ON homework_submissions(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_calendar_events_user ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_subject ON classes(subject);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);

-- Insert sample badges
INSERT INTO badges (name, description, icon_url, criteria, points_required) VALUES
('First Assignment', 'Complete your first homework assignment', '/icons/first-assignment.png', 'Submit your first homework', 0),
('Perfect Score', 'Get a perfect score on any assignment', '/icons/perfect-score.png', 'Achieve 100% on any assignment', 100),
('On Time', 'Submit 5 assignments on time', '/icons/on-time.png', 'Submit 5 assignments before due date', 50),
('Helping Hand', 'Help other students with their work', '/icons/helping-hand.png', 'Participate in 10 discussion threads', 75),
('Consistent', 'Submit assignments for 10 consecutive days', '/icons/consistent.png', 'Submit assignments for 10 days in a row', 200);

-- Insert sample admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role, phone_number) VALUES
('Admin', 'User', 'admin@homework.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'ADMIN', '+1234567890');

-- Insert sample teacher user (password: teacher123)
INSERT INTO users (first_name, last_name, email, password, role, phone_number, subject_taught) VALUES
('John', 'Smith', 'teacher@homework.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'TEACHER', '+1234567891', 'Mathematics');

-- Insert sample student user (password: student123)
INSERT INTO users (first_name, last_name, email, password, role, phone_number, class_grade, student_id) VALUES
('Emma', 'Johnson', 'student@homework.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'STUDENT', '+1234567892', '3rd Grade', 'STU001');

-- Insert sample parent user (password: parent123)
INSERT INTO users (first_name, last_name, email, password, role, phone_number, parent_of_student_id) VALUES
('Michael', 'Johnson', 'parent@homework.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'PARENT', '+1234567893', 3);

-- Insert sample classes
INSERT INTO classes (class_name, subject, grade_level, description, schedule_info, room_number, academic_year, semester, max_students, teacher_id) VALUES
('Mathematics 101', 'Mathematics', 'Grade 5', 'Basic mathematics concepts for fifth graders', 'Monday, Wednesday, Friday 9:00 AM - 10:00 AM', 'Room 201', '2024-2025', 'Fall', 25, 2),
('Science Discovery', 'Science', 'Grade 5', 'Introduction to scientific methods and basic concepts', 'Tuesday, Thursday 10:00 AM - 11:00 AM', 'Room 205', '2024-2025', 'Fall', 25, 2);

-- Insert sample enrollments
INSERT INTO enrollments (student_id, class_id, status) VALUES
(3, 1, 'ACTIVE'),
(3, 2, 'ACTIVE');

-- Insert sample homeworks
INSERT INTO homeworks (title, description, subject, class_grade, due_date, teacher_id) VALUES
('Math Problem Set', 'Complete problems 1-20 in Chapter 3', 'Mathematics', 'Grade 5', DATE_ADD(NOW(), INTERVAL 7 DAY), 2),
('Science Quiz', 'Quiz on Chapter 1: Scientific Method', 'Science', 'Grade 5', DATE_ADD(NOW(), INTERVAL 3 DAY), 2);

-- Insert sample user progress
INSERT INTO user_progress (user_id, points_earned, level, experience_points, achievements_count, streak_days) VALUES
(3, 0, 1, 0, 0, 0);

-- Grant privileges (if running as root)
-- GRANT ALL PRIVILEGES ON homework_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;
