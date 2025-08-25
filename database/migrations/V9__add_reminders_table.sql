-- Migration V9: Add Reminders Table for Due Date Reminders

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homework_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reminder_type ENUM('DUE_SOON_24H', 'DUE_SOON_12H', 'DUE_SOON_6H', 'DUE_SOON_1H', 'OVERDUE', 'CUSTOM') NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (homework_id) REFERENCES homeworks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_reminders_homework (homework_id),
    INDEX idx_reminders_user (user_id),
    INDEX idx_reminders_status (status),
    INDEX idx_reminders_time (reminder_time),
    INDEX idx_reminders_type (reminder_type),
    INDEX idx_reminders_pending (status, reminder_time)
);

-- Insert sample reminders for existing homeworks (if any exist)
-- This will create reminders for any existing homework assignments
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at)
SELECT 
    h.id,
    u.id,
    'DUE_SOON_24H',
    DATE_SUB(h.due_date, INTERVAL 24 HOUR),
    h.due_date,
    CONCAT('Homework Due Tomorrow: ', h.title),
    CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due tomorrow at ', 
           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Please complete it soon!'),
    'PENDING',
    FALSE,
    NOW(),
    NOW()
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND h.due_date > NOW()
  AND h.due_date > DATE_ADD(NOW(), INTERVAL 24 HOUR);

-- Create 12-hour reminders
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at)
SELECT 
    h.id,
    u.id,
    'DUE_SOON_12H',
    DATE_SUB(h.due_date, INTERVAL 12 HOUR),
    h.due_date,
    CONCAT('Homework Due in 12 Hours: ', h.title),
    CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due in 12 hours at ', 
           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Time to finish up!'),
    'PENDING',
    FALSE,
    NOW(),
    NOW()
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND h.due_date > NOW()
  AND h.due_date > DATE_ADD(NOW(), INTERVAL 12 HOUR);

-- Create 6-hour reminders
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at)
SELECT 
    h.id,
    u.id,
    'DUE_SOON_6H',
    DATE_SUB(h.due_date, INTERVAL 6 HOUR),
    h.due_date,
    CONCAT('Homework Due in 6 Hours: ', h.title),
    CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due in 6 hours at ', 
           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Don\'t wait too long!'),
    'PENDING',
    FALSE,
    NOW(),
    NOW()
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND h.due_date > NOW()
  AND h.due_date > DATE_ADD(NOW(), INTERVAL 6 HOUR);

-- Create 1-hour reminders
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at)
SELECT 
    h.id,
    u.id,
    'DUE_SOON_1H',
    DATE_SUB(h.due_date, INTERVAL 1 HOUR),
    h.due_date,
    CONCAT('Homework Due in 1 Hour: ', h.title),
    CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due in 1 hour at ', 
           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Submit now!'),
    'PENDING',
    FALSE,
    NOW(),
    NOW()
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND h.due_date > NOW()
  AND h.due_date > DATE_ADD(NOW(), INTERVAL 1 HOUR);

-- Create overdue reminders for past due homeworks
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at)
SELECT 
    h.id,
    u.id,
    'OVERDUE',
    DATE_ADD(h.due_date, INTERVAL 1 HOUR),
    h.due_date,
    CONCAT('Homework Overdue: ', h.title),
    CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' was due at ', 
           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Please submit as soon as possible!'),
    'PENDING',
    FALSE,
    NOW(),
    NOW()
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND h.due_date < NOW();
