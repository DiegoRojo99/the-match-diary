-- Add visible column to competitions table to allow hiding unwanted competitions

ALTER TABLE competitions 
ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;

-- Add comment to document the column purpose
COMMENT ON COLUMN competitions.visible IS 'Controls whether this competition is visible in the app. Default is true. Set to false to hide unwanted competitions.';