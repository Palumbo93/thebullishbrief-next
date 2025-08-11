-- Remove featured field from tags table
ALTER TABLE tags DROP COLUMN IF EXISTS featured;
