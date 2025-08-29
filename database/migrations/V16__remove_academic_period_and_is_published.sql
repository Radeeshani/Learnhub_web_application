-- Remove academic_period and is_published columns from reports table
ALTER TABLE reports DROP COLUMN academic_period;
ALTER TABLE reports DROP COLUMN is_published;
