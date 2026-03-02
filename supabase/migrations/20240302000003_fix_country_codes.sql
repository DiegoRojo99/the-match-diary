-- Update countries table to handle longer country codes like GB-ENG, GB-SCT, etc.

ALTER TABLE countries ALTER COLUMN code TYPE VARCHAR(10) USING code::VARCHAR(10);

-- Update the unique constraint to use the new column type
-- (PostgreSQL automatically updates the constraint when the column type changes)