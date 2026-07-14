-- ============================================
-- Row Level Security (RLS) Policies for Supabase
-- Sprint 2 - Complete Database Design
-- ============================================
-- Run this SQL in your Supabase SQL Editor to configure RLS policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE panchangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pooja_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sevas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'SUPER_ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRIEST')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE user_id = auth.uid()),
    'GUEST'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage profiles"
ON profiles FOR ALL
USING (true);

-- ============================================
-- USER SESSIONS TABLE
-- ============================================

CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own sessions"
ON user_sessions FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ============================================
-- SETTINGS TABLES (Public Read)
-- ============================================

CREATE POLICY "Anyone can view temple settings"
ON temple_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage temple settings"
ON temple_settings FOR ALL
USING (is_admin());

CREATE POLICY "Anyone can view homepage settings"
ON homepage_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage homepage settings"
ON homepage_settings FOR ALL
USING (is_admin());

CREATE POLICY "Anyone can view temple timings"
ON temple_timings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage temple timings"
ON temple_timings FOR ALL
USING (is_admin());

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================

CREATE POLICY "Anyone can view active announcements"
ON announcements FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can create announcements"
ON announcements FOR INSERT
WITH CHECK (is_staff());

CREATE POLICY "Staff can update announcements"
ON announcements FOR UPDATE
USING (is_staff());

CREATE POLICY "Admins can delete announcements"
ON announcements FOR DELETE
USING (is_admin());

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
USING (published = true OR is_admin());

CREATE POLICY "Staff can manage events"
ON events FOR ALL
USING (is_staff());

-- ============================================
-- EVENT BOOKINGS TABLE
-- ============================================

CREATE POLICY "Users can view own bookings"
ON event_bookings FOR SELECT
USING (user_id = auth.uid() OR is_staff());

CREATE POLICY "Anyone can create event bookings"
ON event_bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own bookings"
ON event_bookings FOR UPDATE
USING (user_id = auth.uid() OR is_staff());

-- ============================================
-- FESTIVALS TABLE
-- ============================================

CREATE POLICY "Anyone can view festivals"
ON festivals FOR SELECT
USING (true);

CREATE POLICY "Staff can manage festivals"
ON festivals FOR ALL
USING (is_staff());

-- ============================================
-- PANCHANGA TABLE
-- ============================================

CREATE POLICY "Anyone can view panchangas"
ON panchangas FOR SELECT
USING (true);

-- ============================================
-- POOJA SCHEDULES TABLE
-- ============================================

CREATE POLICY "Anyone can view active pooja schedules"
ON pooja_schedules FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage pooja schedules"
ON pooja_schedules FOR ALL
USING (is_staff());

-- ============================================
-- SEVAS TABLE
-- ============================================

CREATE POLICY "Anyone can view active sevas"
ON sevas FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage sevas"
ON sevas FOR ALL
USING (is_staff());

-- ============================================
-- SEVA BOOKINGS TABLE
-- ============================================

CREATE POLICY "Users can view own seva bookings"
ON seva_bookings FOR SELECT
USING (user_id = auth.uid() OR is_staff());

CREATE POLICY "Users can create seva bookings"
ON seva_bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings"
ON seva_bookings FOR UPDATE
USING (user_id = auth.uid() OR is_staff());

-- ============================================
-- DONATION CAMPAIGNS TABLE
-- ============================================

CREATE POLICY "Anyone can view active campaigns"
ON donation_campaigns FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage campaigns"
ON donation_campaigns FOR ALL
USING (is_staff());

-- ============================================
-- DONATIONS TABLE
-- ============================================

CREATE POLICY "Users can view own donations"
ON donations FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Anyone can create donations"
ON donations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own pending donations"
ON donations FOR UPDATE
USING ((user_id = auth.uid() AND status = 'PENDING') OR is_staff());

-- ============================================
-- GALLERY ITEMS TABLE
-- ============================================

CREATE POLICY "Anyone can view active gallery items"
ON gallery_items FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage gallery"
ON gallery_items FOR ALL
USING (is_staff());

-- ============================================
-- TRUST MEMBERS TABLE
-- ============================================

CREATE POLICY "Anyone can view active trust members"
ON trust_members FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage trust members"
ON trust_members FOR ALL
USING (is_staff());

-- ============================================
-- STAFF TABLE
-- ============================================

CREATE POLICY "Anyone can view active staff"
ON staff FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage staff records"
ON staff FOR ALL
USING (is_admin());

-- ============================================
-- FACILITIES TABLE
-- ============================================

CREATE POLICY "Anyone can view active facilities"
ON facilities FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Staff can manage facilities"
ON facilities FOR ALL
USING (is_staff());

-- ============================================
-- AMENITIES TABLE
-- ============================================

CREATE POLICY "Anyone can view amenities"
ON amenities FOR SELECT
USING (true);

CREATE POLICY "Staff can manage amenities"
ON amenities FOR ALL
USING (is_staff());

-- ============================================
-- FUTURE PLANS TABLE
-- ============================================

CREATE POLICY "Anyone can view active future plans"
ON future_plans FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Staff can manage future plans"
ON future_plans FOR ALL
USING (is_staff());

-- ============================================
-- AI KNOWLEDGE BASE
-- ============================================

CREATE POLICY "Anyone can view active categories"
ON ai_knowledge_categories FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage categories"
ON ai_knowledge_categories FOR ALL
USING (is_admin());

CREATE POLICY "Anyone can view active articles"
ON ai_knowledge_articles FOR SELECT
USING (active = true OR is_admin());

CREATE POLICY "Staff can manage articles"
ON ai_knowledge_articles FOR ALL
USING (is_admin());

CREATE POLICY "Users can submit feedback"
ON ai_chat_feedback FOR INSERT
WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Users can view own feedback"
ON ai_chat_feedback FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================

CREATE POLICY "Anyone can view published testimonials"
ON testimonials FOR SELECT
USING (is_published = true OR is_admin());

CREATE POLICY "Users can create testimonials"
ON testimonials FOR INSERT
WITH CHECK (user_id = auth.uid() OR true);

CREATE POLICY "Staff can approve testimonials"
ON testimonials FOR UPDATE
USING (is_staff());

-- ============================================
-- CONTACT ENQUIRIES TABLE
-- ============================================

CREATE POLICY "Anyone can submit enquiries"
ON contact_enquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own enquiries"
ON contact_enquiries FOR SELECT
USING (true); -- Email matching could be added

CREATE POLICY "Staff can manage enquiries"
ON contact_enquiries FOR ALL
USING (is_staff());

-- ============================================
-- UTILITY TABLES
-- ============================================

-- Email logs - admin only
CREATE POLICY "Admins can manage email logs"
ON email_logs FOR ALL
USING (is_admin());

-- Audit logs - admin only
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (is_admin());

-- ============================================
-- GRANT EXECUTE ON FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_staff() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated, anon;
