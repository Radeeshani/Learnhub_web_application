-- Migration: Add calendar_events table
-- Run this if you have an existing database

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    event_type ENUM('HOMEWORK_DUE', 'HOMEWORK_ASSIGNED', 'CLASS_SESSION', 'EXAM', 'HOLIDAY', 'MEETING', 'REMINDER', 'CUSTOM') NOT NULL,
    user_id BIGINT NOT NULL,
    homework_id BIGINT,
    class_id BIGINT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    location VARCHAR(255),
    recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (homework_id) REFERENCES homeworks(id),
    FOREIGN KEY (class_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_homework_id ON calendar_events(homework_id);
CREATE INDEX idx_calendar_events_class_id ON calendar_events(class_id);
CREATE INDEX idx_calendar_events_user_start_time ON calendar_events(user_id, start_time);
