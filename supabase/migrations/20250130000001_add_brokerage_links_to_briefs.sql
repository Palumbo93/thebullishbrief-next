-- Add brokerage_links column to briefs table
ALTER TABLE public.briefs 
ADD COLUMN brokerage_links JSONB;

-- Add comment for the new column
COMMENT ON COLUMN public.briefs.brokerage_links IS 'JSON object mapping brokerage IDs to direct links for quick trading access';
