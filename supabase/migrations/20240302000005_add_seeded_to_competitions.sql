-- Add seeded column to competitions table and update defaults

-- Add seeded column to track which competitions have been seeded with teams/venues
ALTER TABLE competitions 
ADD COLUMN seeded BOOLEAN NOT NULL DEFAULT false;

-- Set seeded = true for all currently visible competitions (since they were already processed)
UPDATE competitions 
SET seeded = true 
WHERE visible = true;

-- Change default for visible column from true to false for better control
ALTER TABLE competitions 
ALTER COLUMN visible SET DEFAULT false;

-- Add comments to document the columns
COMMENT ON COLUMN competitions.seeded IS 'Tracks whether this competition has been seeded with teams and venues. Set to true after successful seeding.';
COMMENT ON COLUMN competitions.visible IS 'Controls whether this competition is visible in the app. Default is false. Set to true to show in user interface.';