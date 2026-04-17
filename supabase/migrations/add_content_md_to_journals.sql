-- Add content_md column to journals table
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS content_md text;

-- Optional: Populate content_md with content_html for existing records
-- UPDATE public.journals SET content_md = content_html WHERE content_md IS NULL;
