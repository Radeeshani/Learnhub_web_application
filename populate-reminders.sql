-- Populate reminders for existing homework assignments
-- This script creates reminders for homework that was assigned before the reminder system was fully implemented

USE homework_db;

-- Insert reminders for existing homework assignments
INSERT INTO reminders (homework_id, user_id, reminder_type, reminder_time, due_date, title, message, status, is_read, created_at, updated_at, priority)
SELECT 
    h.id as homework_id,
    u.id as user_id,
    'SMART' as reminder_type,
    NOW() as reminder_time,
    h.due_date,
    CASE 
        WHEN h.due_date < NOW() THEN CONCAT('Homework Overdue: ', h.title)
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 24 THEN CONCAT('Homework Due Soon: ', h.title)
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 168 THEN CONCAT('Homework Due This Week: ', h.title)
        ELSE CONCAT('Upcoming Homework: ', h.title)
    END as title,
    CASE 
        WHEN h.due_date < NOW() THEN CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' was due at ', 
                                           DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Please submit as soon as possible!')
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 24 THEN CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due tomorrow at ', 
                                                                     DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Don\'t forget to complete it!')
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 168 THEN CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due in ', 
                                                                      FLOOR(TIMESTAMPDIFF(HOUR, NOW(), h.due_date) / 24), ' day(s) at ', 
                                                                      DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. Plan your time wisely!')
        ELSE CONCAT('Your ', h.subject, ' homework for ', h.class_grade, ' is due on ', 
                   DATE_FORMAT(h.due_date, '%b %d, %Y at %H:%i'), '. This is a long-term assignment, so start early!')
    END as message,
    'PENDING' as status,
    FALSE as is_read,
    NOW() as created_at,
    NOW() as updated_at,
    CASE 
        WHEN h.due_date < NOW() THEN 'URGENT'
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 24 THEN 'HIGH'
        WHEN TIMESTAMPDIFF(HOUR, NOW(), h.due_date) < 168 THEN 'NORMAL'
        ELSE 'LOW'
    END as priority
FROM homeworks h
CROSS JOIN users u
WHERE u.role = 'STUDENT' 
  AND u.class_grade = h.class_grade
  AND NOT EXISTS (
      SELECT 1 FROM reminders r 
      WHERE r.homework_id = h.id AND r.user_id = u.id
  );

-- Show the results
SELECT 
    'Reminders created' as status,
    COUNT(*) as count
FROM reminders r
JOIN homeworks h ON r.homework_id = h.id
WHERE r.created_at >= NOW() - INTERVAL 1 MINUTE;

-- Show reminders for the specific user
SELECT 
    r.id,
    h.title as homework_title,
    r.title as reminder_title,
    r.message,
    r.priority,
    r.status,
    r.due_date,
    r.created_at
FROM reminders r
JOIN homeworks h ON r.homework_id = h.id
WHERE r.user_id = 9  -- test1@gmail.com user ID
ORDER BY r.due_date ASC;
