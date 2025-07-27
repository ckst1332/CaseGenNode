-- Quick Migration for Supabase SQL Editor
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Add new columns
ALTER TABLE cases ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'DCF';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'template';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS starting_point JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_results JSONB;

-- Migrate existing data
UPDATE cases SET name = title WHERE name IS NULL AND title IS NOT NULL;
UPDATE cases SET name = 'Untitled Case' WHERE name IS NULL;
UPDATE cases SET type = 'DCF' WHERE type IS NULL;
UPDATE cases SET status = 'template' WHERE status IS NULL;

-- Make name required
ALTER TABLE cases ALTER COLUMN name SET NOT NULL;

-- Add status constraint
ALTER TABLE cases ADD CONSTRAINT IF NOT EXISTS cases_status_check 
CHECK (status IN ('template', 'submit_results', 'completed'));
