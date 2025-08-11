-- Add company fields to briefs table
ALTER TABLE briefs 
ADD COLUMN company_name text,
ADD COLUMN company_logo_url text; 