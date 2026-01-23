-- ============================================================================
-- FIX MISSING COLUMNS
-- Run this script to add missing columns to existing tables
-- ============================================================================

-- Fix LESSONS table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration TEXT;

-- Fix CHAPTERS table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS timestamp_seconds INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS timestamp_raw TEXT;

-- Reload the schema cache (in Supabase this happens automatically on DDL)
NOTIFY pgrst, 'reload schema';

-- Verify the columns exist now
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('video_id', 'video_url', 'duration');
