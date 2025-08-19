-- Migration: Add audio_data, image_data, and pdf_data columns to homework_submissions table
-- Run this if you have an existing database

-- Add audio_data column
ALTER TABLE homework_submissions 
ADD COLUMN audio_data LONGTEXT COMMENT 'Store base64 encoded audio data for voice recordings';

-- Add image_data column
ALTER TABLE homework_submissions 
ADD COLUMN image_data LONGTEXT COMMENT 'Store base64 encoded image data for photo submissions';

-- Add pdf_data column
ALTER TABLE homework_submissions 
ADD COLUMN pdf_data LONGTEXT COMMENT 'Store base64 encoded PDF data for PDF submissions';

-- Update existing voice recordings to have a placeholder audio_data
-- (This is optional, only if you want to maintain consistency)
UPDATE homework_submissions 
SET audio_data = NULL 
WHERE submission_type = 'VOICE' AND audio_data IS NULL;

-- Update existing photo submissions to have a placeholder image_data
-- (This is optional, only if you want to maintain consistency)
UPDATE homework_submissions 
SET image_data = NULL 
WHERE submission_type = 'PHOTO' AND image_data IS NULL;

-- Update existing PDF submissions to have a placeholder pdf_data
-- (This is optional, only if you want to maintain consistency)
UPDATE homework_submissions 
SET pdf_data = NULL 
WHERE submission_type = 'PDF' AND pdf_data IS NULL;
