-- Add content_md column to journals table for raw Markdown/BBCode storage
ALTER TABLE journals ADD COLUMN IF NOT EXISTS content_md TEXT;

-- Recommended: Migrate existing content_html to content_md if needed, 
-- but since content_html contains rendered TipTap HTML, 
-- a manual re-save is usually better for data integrity.
