-- Add duration column to tracks table
-- Execute this SQL in your Supabase SQL Editor

ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN public.tracks.duration IS 'Track duration in seconds';

