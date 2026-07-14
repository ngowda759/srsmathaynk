-- ============================================
-- Storage Buckets Setup for Supabase
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create storage buckets
-- Go to: Supabase Dashboard → SQL Editor → Run this script
-- Or use the Storage UI in Supabase Dashboard

-- ============================================
-- INSERT STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('profile-photos', 'profile-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR 'images' BUCKET
-- ============================================

-- Allow anyone to view images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- STORAGE POLICIES FOR 'gallery' BUCKET
-- ============================================

-- Allow anyone to view gallery
CREATE POLICY "Anyone can view gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow authenticated users to upload to gallery
CREATE POLICY "Authenticated users can upload to gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow admins to delete from gallery
CREATE POLICY "Admins can delete from gallery"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- STORAGE POLICIES FOR 'documents' BUCKET
-- ============================================

-- Allow authenticated users to view documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow admins to delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- STORAGE POLICIES FOR 'profile-photos' BUCKET
-- ============================================

-- Allow anyone to view profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Allow users to upload their own profile photo
CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile photo
CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile photo
CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- DONE
-- ============================================

-- Note: You can also create buckets via the Supabase Dashboard:
-- 1. Go to Storage in the left sidebar
-- 2. Click "New bucket"
-- 3. Enter the bucket name and set public/private
-- 4. Configure file size limits and allowed MIME types
