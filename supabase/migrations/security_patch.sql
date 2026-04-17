-- Security Patch: Reinforce RLS for Privacy
-- Run this in your Supabase SQL Editor

-- 1. Notes Table RLS Update
DROP POLICY IF EXISTS "Public notes viewable by everyone" ON public.notes;
CREATE POLICY "Public notes viewable by everyone" ON public.notes
FOR SELECT USING (
  (is_private = false) OR (auth.role() = 'authenticated')
);

-- 2. Journals Table RLS Update
DROP POLICY IF EXISTS "Public journals viewable by everyone" ON public.journals;
CREATE POLICY "Public journals viewable by everyone" ON public.journals
FOR SELECT USING (
  (is_private = false) OR (auth.role() = 'authenticated')
);

-- 3. Hobbies Table RLS Update
DROP POLICY IF EXISTS "Public hobbies viewable by everyone" ON public.hobbies;
CREATE POLICY "Public hobbies viewable by everyone" ON public.hobbies
FOR SELECT USING (
  (is_private = false) OR (auth.role() = 'authenticated')
);

-- 4. Tags RPC Helper (Optional but recommended)
-- This ensures the tag cloud only counts public items for guests
CREATE OR REPLACE FUNCTION get_tag_cloud(table_name text, public_only boolean DEFAULT true)
RETURNS TABLE(tag_name text, tag_count int) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT t->>''name'' as tag_name, count(*)::int as tag_count
    FROM %I, jsonb_array_elements(tags) as t
    WHERE (%L = false OR is_private = false)
    GROUP BY tag_name
    ORDER BY tag_count DESC', table_name, public_only);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
