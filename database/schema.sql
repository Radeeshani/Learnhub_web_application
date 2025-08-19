-- Create database
CREATE DATABASE IF NOT EXISTS homework_db;
USE homework_db;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    class_grade VARCHAR(20),
    subject_taught VARCHAR(100),
    parent_of_student_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_of_student_id) REFERENCES users(id)
);

-- Homeworks table
CREATE TABLE homeworks (
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

-- Homework submissions table
CREATE TABLE homework_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homework_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    audio_data LONGTEXT, -- Store base64 encoded audio data for voice recordings
    image_data LONGTEXT, -- Store base64 encoded image data for photo submissions
    pdf_data LONGTEXT, -- Store base64 encoded PDF data for PDF submissions
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

-- Notifications table
CREATE TABLE notifications (
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

-- Insert sample data
INSERT INTO users (first_name, last_name, email, password, role, class_grade, subject_taught) VALUES
('John', 'Doe', 'john.doe@school.com', '$2a$10$example', 'TEACHER', 'Grade 5', 'Mathematics'),
('Jane', 'Smith', 'jane.smith@school.com', '$2a$10$example', 'TEACHER', 'Grade 5', 'English'),
('Mike', 'Johnson', 'mike.johnson@school.com', '$2a$10$example', 'STUDENT', 'Grade 5', NULL),
('Sarah', 'Williams', 'sarah.williams@school.com', '$2a$10$example', 'STUDENT', 'Grade 5', NULL),
('Admin', 'User', 'admin@school.com', '$2a$10$example', 'ADMIN', NULL, NULL);

-- Insert sample homeworks
INSERT INTO homeworks (title, description, subject, class_grade, due_date, teacher_id) VALUES
('Math Problem Set', 'Complete problems 1-20 in Chapter 3', 'Mathematics', 'Grade 5', DATE_ADD(NOW(), INTERVAL 7 DAY), 1),
('English Essay', 'Write a 500-word essay about your favorite book', 'English', 'Grade 5', DATE_ADD(NOW(), INTERVAL 5 DAY), 2),
('Science Project', 'Create a simple machine using household items', 'Science', 'Grade 5', DATE_ADD(NOW(), INTERVAL 10 DAY), 1); 