-- Migration V14: Add priority field to reminders table

-- Add priority column to reminders table
ALTER TABLE reminders ADD COLUMN priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL';

-- Update existing reminders with appropriate priority based on reminder type
UPDATE reminders SET priority = 'URGENT' WHERE reminder_type = 'OVERDUE';
UPDATE reminders SET priority = 'HIGH' WHERE reminder_type IN ('DUE_SOON_1H', 'DUE_SOON_6H');
UPDATE reminders SET priority = 'NORMAL' WHERE reminder_type IN ('DUE_SOON_12H', 'DUE_SOON_24H');
UPDATE reminders SET priority = 'LOW' WHERE reminder_type = 'CUSTOM';

-- Add index for priority field for better performance
CREATE INDEX idx_reminders_priority ON reminders(priority);

-- Add index for priority and status combination
CREATE INDEX idx_reminders_priority_status ON reminders(priority, status);
