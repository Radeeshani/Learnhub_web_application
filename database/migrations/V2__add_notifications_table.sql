-- Migration: Add notifications table
-- Run this if you have an existing database

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

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_homework_id ON notifications(homework_id);
