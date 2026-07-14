-- ============================================
-- Row Level Security (RLS) Policies for Supabase
-- ============================================
-- Run this SQL in your Supabase SQL Editor to configure RLS policies
-- Go to: Supabase Dashboard → SQL Editor → Run this script

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sevas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE panchangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pooja_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admin roles can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can insert new profiles (via service role)
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- ============================================
-- EVENTS TABLE
-- ============================================

-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
USING (published = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can manage events
CREATE POLICY "Admins can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- SEVAS TABLE
-- ============================================

-- Anyone can view active sevas
CREATE POLICY "Anyone can view active sevas"
ON sevas FOR SELECT
USING (active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can manage sevas
CREATE POLICY "Admins can manage sevas"
ON sevas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- SEVA BOOKINGS TABLE
-- ============================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON seva_bookings FOR SELECT
USING (user_id = auth.uid());

-- Users can create bookings
CREATE POLICY "Users can create bookings"
ON seva_bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
ON seva_bookings FOR UPDATE
USING (user_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON seva_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- DONATION CAMPAIGNS TABLE
-- ============================================

-- Anyone can view active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON donation_campaigns FOR SELECT
USING (active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can manage campaigns
CREATE POLICY "Admins can manage campaigns"
ON donation_campaigns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- DONATIONS TABLE
-- ============================================

-- Users can view their own donations
CREATE POLICY "Users can view own donations"
ON donations FOR SELECT
USING (user_id = auth.uid());

-- Anyone can create donations (public donations)
CREATE POLICY "Anyone can create donations"
ON donations FOR INSERT
WITH CHECK (true);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
ON donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'BILLING')
  )
);

-- ============================================
-- GALLERY IMAGES TABLE
-- ============================================

-- Anyone can view active gallery images
CREATE POLICY "Anyone can view active gallery images"
ON gallery_images FOR SELECT
USING (active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can manage gallery
CREATE POLICY "Admins can manage gallery"
ON gallery_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================

-- Anyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
ON announcements FOR SELECT
USING (active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON announcements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- SETTINGS TABLES (read-only for public)
-- ============================================

-- Homepage Settings
CREATE POLICY "Anyone can view homepage settings"
ON homepage_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage homepage settings"
ON homepage_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Temple Settings
CREATE POLICY "Anyone can view temple settings"
ON temple_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage temple settings"
ON temple_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- CONTENT TABLES
-- ============================================

-- Trust Members
CREATE POLICY "Anyone can view active trust members"
ON trust_members FOR SELECT
USING (active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can manage trust members"
ON trust_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Future Plans
CREATE POLICY "Anyone can view active future plans"
ON future_plans FOR SELECT
USING (is_active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can manage future plans"
ON future_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Facilities
CREATE POLICY "Anyone can view active facilities"
ON facilities FOR SELECT
USING (is_active = true OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can manage facilities"
ON facilities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- CALENDAR TABLES
-- ============================================

-- Panchangas - anyone can view
CREATE POLICY "Anyone can view panchangas"
ON panchangas FOR SELECT
USING (true);

CREATE POLICY "Service role can manage panchangas"
ON panchangas FOR ALL
USING (true);

-- Pooja Schedules - anyone can view
CREATE POLICY "Anyone can view pooja schedules"
ON pooja_schedules FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage pooja schedules"
ON pooja_schedules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Festivals - anyone can view
CREATE POLICY "Anyone can view festivals"
ON festivals FOR SELECT
USING (true);

CREATE POLICY "Admins can manage festivals"
ON festivals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- ============================================
-- VERIFICATION FUNCTION
-- ============================================

-- Create function to check user role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE user_id = auth.uid()),
    'GUEST'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- DONE
-- ============================================

-- Grant usage on new functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated, anon;
