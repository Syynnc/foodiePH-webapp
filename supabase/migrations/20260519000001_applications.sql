-- Run this in the Supabase SQL Editor after the profiles trigger migration.

-- Create tables for driver and restaurant owner applications
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | denied
  vehicle_type text DEFAULT 'motorcycle',
  plate_number text,
  license_number text,
  gov_id_url text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | denied
  restaurant_name text NOT NULL,
  cuisine text,
  address text,
  phone text,
  description text,
  permit_url text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_applications ENABLE ROW LEVEL SECURITY;

-- Users can read and insert their own applications
CREATE POLICY "driver_apps_own" ON public.driver_applications
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "restaurant_apps_own" ON public.restaurant_applications
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-docs', 'application-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own subfolder
CREATE POLICY "users_upload_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'application-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_read_own_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'application-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can read all docs (enforced at app level via service role)
-- The service role key bypasses RLS, so no extra policy needed for admin reads.
