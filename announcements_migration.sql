-- Create announcements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text text NOT NULL,
  type text DEFAULT 'info' NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Set up Policies
-- 1. Public can view all announcements
DROP POLICY IF EXISTS "Public announcements viewable by everyone" ON public.announcements;
CREATE POLICY "Public announcements viewable by everyone" ON public.announcements
  FOR SELECT USING (true);

-- 2. Authenticated users (the owner) can insert announcements
DROP POLICY IF EXISTS "Auth insert announcements" ON public.announcements;
CREATE POLICY "Auth insert announcements" ON public.announcements
  FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Authenticated users can update announcements
DROP POLICY IF EXISTS "Auth update announcements" ON public.announcements;
CREATE POLICY "Auth update announcements" ON public.announcements
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. Authenticated users can delete announcements
DROP POLICY IF EXISTS "Auth delete announcements" ON public.announcements;
CREATE POLICY "Auth delete announcements" ON public.announcements
  FOR DELETE TO authenticated USING (true);
