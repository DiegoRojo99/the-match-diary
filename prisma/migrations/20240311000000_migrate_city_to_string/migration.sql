-- Migration: Migrate cities to venue city string field
-- This migration preserves existing city data by copying it to a string field on venues

BEGIN;

-- Step 1: Add city column to venues table
ALTER TABLE "venues" ADD COLUMN "city" VARCHAR(100);

-- Step 2: Populate city field with data from cities table
UPDATE "venues" 
SET "city" = "cities"."name" 
FROM "cities" 
WHERE "venues"."city_id" = "cities"."id";

-- Step 3: Drop foreign key constraint first
ALTER TABLE "venues" DROP CONSTRAINT IF EXISTS "venues_city_id_fkey";

-- Step 4: Drop the city_id column from venues
ALTER TABLE "venues" DROP COLUMN "city_id";

-- Step 5: Drop foreign key constraint from cities to countries
ALTER TABLE "cities" DROP CONSTRAINT IF EXISTS "cities_country_id_fkey";

-- Step 6: Drop the cities table
DROP TABLE IF EXISTS "cities";

COMMIT;