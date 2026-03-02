-- Remove unnecessary fields from user_matches table
-- Simplifying the table to focus on core functionality

ALTER TABLE user_matches 
DROP COLUMN IF EXISTS seat_section,
DROP COLUMN IF EXISTS ticket_price,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS weather;

-- Rating is already optional (nullable), but let's ensure it's properly set
ALTER TABLE user_matches 
ALTER COLUMN rating DROP NOT NULL;