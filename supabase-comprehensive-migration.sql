-- COMPREHENSIVE Migration for Supabase SQL Editor
-- This addresses ALL potential NOT NULL constraint issues
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Step 1: Add new columns
ALTER TABLE cases ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'DCF';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'template';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS starting_point JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_results JSONB;

-- Step 2: Remove NOT NULL constraints from ALL old columns that might cause issues
-- This prevents future constraint violations during the transition period
ALTER TABLE cases ALTER COLUMN title DROP NOT NULL;
ALTER TABLE cases ALTER COLUMN content DROP NOT NULL;
ALTER TABLE cases ALTER COLUMN scenario DROP NOT NULL;
ALTER TABLE cases ALTER COLUMN calculations DROP NOT NULL;

-- Step 3: Migrate existing data and set defaults
UPDATE cases SET name = title WHERE name IS NULL AND title IS NOT NULL;
UPDATE cases SET name = 'Untitled Case' WHERE name IS NULL;
UPDATE cases SET type = 'DCF' WHERE type IS NULL;
UPDATE cases SET status = 'template' WHERE status IS NULL;

-- Step 4: Set safe default values for old required fields to prevent future errors
UPDATE cases SET content = '{}' WHERE content IS NULL;
UPDATE cases SET title = name WHERE title IS NULL;
UPDATE cases SET scenario = '{}' WHERE scenario IS NULL;
UPDATE cases SET calculations = '{}' WHERE calculations IS NULL;

-- Step 5: Make new required fields NOT NULL (only the ones we actually need)
ALTER TABLE cases ALTER COLUMN name SET NOT NULL;

-- Step 6: Add status constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cases_status_check' 
        AND table_name = 'cases'
    ) THEN
        ALTER TABLE cases ADD CONSTRAINT cases_status_check 
        CHECK (status IN ('template', 'submit_results', 'completed'));
    END IF;
END $$;

-- Step 7: Verify the migration (optional - you can run this separately to check)
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'cases' ORDER BY ordinal_position;
