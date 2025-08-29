-- Migration V10: Add Class Management Columns

-- Add new columns to classes table
ALTER TABLE classes 
ADD COLUMN section VARCHAR(10) AFTER grade_level,
ADD COLUMN capacity INT AFTER section;

-- Update existing classes to have default values
UPDATE classes SET section = 'A' WHERE section IS NULL;
UPDATE classes SET capacity = 30 WHERE capacity IS NULL;

-- Add indexes for better performance
CREATE INDEX idx_classes_grade_section ON classes(grade_level, section);
CREATE INDEX idx_classes_teacher_active ON classes(teacher_id, is_active);
