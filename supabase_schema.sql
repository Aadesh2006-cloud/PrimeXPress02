-- ========================================================================
-- Supabase Schema for Apex Clean Air Solutions (Bookings & Reviews)
-- Project: wzjfoimorynzpupjcaah
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/wzjfoimorynzpupjcaah/sql)
-- ========================================================================

-- 1. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    property_type TEXT DEFAULT 'Residential',
    address TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time_slot TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone (anon + authenticated) to submit a booking form
DROP POLICY IF EXISTS "Allow public insert for bookings" ON public.bookings;
CREATE POLICY "Allow public insert for bookings" 
ON public.bookings 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 4. Policy: Allow reading bookings (for client portal and admin view)
DROP POLICY IF EXISTS "Allow read for bookings" ON public.bookings;
CREATE POLICY "Allow read for bookings" 
ON public.bookings 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 5. Policy: Allow updating booking status
DROP POLICY IF EXISTS "Allow update for bookings" ON public.bookings;
CREATE POLICY "Allow update for bookings" 
ON public.bookings 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- 6. Create Reviews Table (Optional)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    author_name TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    service TEXT NOT NULL,
    neighborhood TEXT DEFAULT 'Winnipeg, MB',
    comment TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert for reviews" ON public.reviews;
CREATE POLICY "Allow public insert for reviews" 
ON public.reviews 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read for reviews" ON public.reviews;
CREATE POLICY "Allow public read for reviews" 
ON public.reviews 
FOR SELECT 
TO anon, authenticated 
USING (true);
