-- ============================================
-- Storage Buckets Setup for Supabase
-- Sprint 2 - Complete Database Design
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create storage buckets

-- ============================================
-- INSERT STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('gallery', 'gallery', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('events', 'events', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('sevas', 'sevas', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('testimonials', 'testimonials', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR 'images' BUCKET
-- ============================================

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Staff can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')));

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- ============================================
-- STORAGE POLICIES FOR 'gallery' BUCKET
-- ============================================

CREATE POLICY "Anyone can view gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Staff can upload to gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')));

CREATE POLICY "Staff can update gallery items"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')));

CREATE POLICY "Admins can delete from gallery"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- ============================================
-- STORAGE POLICIES FOR 'documents' BUCKET
-- ============================================

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Staff can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF')));

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- ============================================
-- STORAGE POLICIES FOR 'profile-photos' BUCKET
-- ============================================

CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = COALESCE((storage.foldername(name))[1], '')
);

CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = COALESCE((storage.foldername(name))[1], '')
);

CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = COALESCE((storage.foldername(name))[1], '')
);

-- ============================================
-- STORAGE POLICIES FOR 'events' BUCKET
-- ============================================

CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Staff can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'events' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')));

CREATE POLICY "Staff can update event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'events' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'events' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- ============================================
-- STORAGE POLICIES FOR 'sevas' BUCKET
-- ============================================

CREATE POLICY "Anyone can view seva images"
ON storage.objects FOR SELECT
USING (bucket_id = 'sevas');

CREATE POLICY "Staff can upload seva images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sevas' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF')));

CREATE POLICY "Staff can update seva images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sevas' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF')));

CREATE POLICY "Admins can delete seva images"
ON storage.objects FOR DELETE
USING (bucket_id = 'sevas' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- ============================================
-- STORAGE POLICIES FOR 'testimonials' BUCKET
-- ============================================

CREATE POLICY "Anyone can view testimonial images"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonials');

CREATE POLICY "Users can upload testimonial images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonials' 
  AND (auth.uid()::text = COALESCE((storage.foldername(name))[1], '') OR auth.role() = 'authenticated')
);

CREATE POLICY "Staff can update testimonial images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'testimonials' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF')));

CREATE POLICY "Staff can delete testimonial images"
ON storage.objects FOR DELETE
USING (bucket_id = 'testimonials' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF')));
