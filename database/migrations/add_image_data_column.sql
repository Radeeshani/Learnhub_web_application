-- Migration: Add image_data column to homework_submissions table
-- Run this if you have an existing database

ALTER TABLE homework_submissions 
ADD COLUMN image_data LONGTEXT COMMENT 'Store base64 encoded image data for photo submissions';

-- Update existing photo submissions to have a placeholder image_data
-- (This is optional, only if you want to maintain consistency)
UPDATE homework_submissions 
SET image_data = NULL 
WHERE submission_type = 'PHOTO' AND image_data IS NULL;
