-- Supabase Schema Migration Script
-- Run this in your Supabase SQL Editor to update the existing database

-- First, let's see what the current cases table looks like
-- You can run this query first to check current structure:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'cases';

-- Step 1: Add new columns to existing cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'DCF';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'template';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS starting_point JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_results JSONB;

-- Step 2: Add constraint for status field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'cases_status_check'
    ) THEN
        ALTER TABLE cases ADD CONSTRAINT cases_status_check 
        CHECK (status IN ('template', 'submit_results', 'completed'));
    END IF;
END $$;

-- Step 3: Migrate existing data from old schema to new schema
-- Update name from title where name is null
UPDATE cases SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Extract data from content JSONB to new columns where possible
UPDATE cases SET 
    company_description = content->>'company_description',
    starting_point = content->'starting_point',
    user_results = content->'user_results',
    type = COALESCE(content->>'type', 'DCF'),
    status = COALESCE(content->>'status', 'template')
WHERE content IS NOT NULL;

-- Step 4: Set default values for remaining NULL fields
UPDATE cases SET name = 'Untitled Case' WHERE name IS NULL;
UPDATE cases SET type = 'DCF' WHERE type IS NULL;
UPDATE cases SET status = 'template' WHERE status IS NULL;

-- Step 5: Make name NOT NULL after migration
ALTER TABLE cases ALTER COLUMN name SET NOT NULL;

-- Step 6: Verify the migration worked
-- You can run this to check the updated structure:
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'cases' ORDER BY ordinal_position;

-- Step 7: Optional - Clean up old columns if you want (CAREFUL - this will delete data!)
-- Only uncomment these if you're sure you don't need the old data
-- ALTER TABLE cases DROP COLUMN IF EXISTS title;
-- ALTER TABLE cases DROP COLUMN IF EXISTS content;
-- ALTER TABLE cases DROP COLUMN IF EXISTS scenario;
-- ALTER TABLE cases DROP COLUMN IF EXISTS calculations;

COMMIT;
