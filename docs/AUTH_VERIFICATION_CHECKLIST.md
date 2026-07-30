# Authentication Verification Checklist

This document provides a comprehensive checklist for verifying the Firebase to Supabase authentication migration.

## Prerequisites

Before testing, ensure you have:
- [ ] Supabase project configured
- [ ] Database migrated with `npx prisma migrate deploy`
- [ ] Environment variables set in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  DATABASE_URL=postgresql://...
  ```
- [ ] OAuth providers configured in Supabase Dashboard (Google)

---

## 1. Email Registration

### Test Case: TC-AUTH-001 - New User Registration
**Steps:**
1. Navigate to `/register`
2. Fill in valid name, email, phone, and password
3. Click "Create Account"
4. Check email for verification link

**Expected Results:**
- [ ] Success message displayed: "Check your email for the confirmation link"
- [ ] Email received with confirmation link
- [ ] Link contains valid token and redirects to `/api/auth/callback`
- [ ] After clicking link, redirected to `/login?email_confirmed=true`
- [ ] User can now login with credentials

### Test Case: TC-AUTH-002 - Registration Validation
**Steps:**
1. Navigate to `/register`
2. Try submitting with invalid email
3. Try submitting with weak password (< 6 chars)
4. Try submitting with empty fields

**Expected Results:**
- [ ] Client-side validation errors displayed
- [ ] Form not submitted until all fields valid

### Test Case: TC-AUTH-003 - Duplicate Email Registration
**Steps:**
1. Register with existing email
2. Attempt to register again with same email

**Expected Results:**
- [ ] Error message: "User already registered"
- [ ] No duplicate account created

---

## 2. Email Verification

### Test Case: TC-AUTH-010 - Email Confirmation Flow
**Steps:**
1. Complete registration
2. Click email confirmation link
3. Attempt to login

**Expected Results:**
- [ ] Profile created in `auth.users`
- [ ] Profile synced to `public.profiles` table
- [ ] `email_confirmed_at` is set
- [ ] User can login after confirmation

### Test Case: TC-AUTH-011 - Expired Confirmation Link
**Steps:**
1. Request confirmation link
2. Wait for token expiry (if configured)
3. Click expired link

**Expected Results:**
- [ ] Appropriate error message displayed
- [ ] No unauthorized access granted

---

## 3. Login

### Test Case: TC-AUTH-020 - Successful Email/Password Login
**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Sign In"

**Expected Results:**
- [ ] Redirect to `/admin` (or intended destination)
- [ ] Auth cookie set
- [ ] Profile loaded from database
- [ ] Navigation shows user is logged in

### Test Case: TC-AUTH-021 - Invalid Credentials
**Steps:**
1. Navigate to `/login`
2. Enter wrong password
3. Click "Sign In"

**Expected Results:**
- [ ] Error message: "Invalid email or password"
- [ ] No auth cookie set
- [ ] User remains on login page

### Test Case: TC-AUTH-022 - Unverified Email Login
**Steps:**
1. Register but don't confirm email
2. Attempt to login

**Expected Results:**
- [ ] Error message: "Please verify your email address first"

### Test Case: TC-AUTH-023 - Password Visibility Toggle
**Steps:**
1. Navigate to `/login`
2. Click password visibility toggle

**Expected Results:**
- [ ] Password field toggles between hidden/visible
- [ ] Toggle button icon changes appropriately

### Test Case: TC-AUTH-024 - Remember Me
**Steps:**
1. Check "Remember me" checkbox
2. Login
3. Close browser
4. Reopen and check session

**Expected Results:**
- [ ] Session persists across browser restarts (when checked)
- [ ] Session uses extended expiry

---

## 4. Logout

### Test Case: TC-AUTH-030 - Successful Logout
**Steps:**
1. Login to the application
2. Click "Logout" button
3. Attempt to access protected page

**Expected Results:**
- [ ] User logged out
- [ ] Auth cookies cleared
- [ ] Redirected to `/login`
- [ ] Cannot access protected routes without re-login

### Test Case: TC-AUTH-031 - Logout from All Devices
**Steps:**
1. Login on multiple devices
2. Logout from one device

**Expected Results:**
- [ ] Only current device logged out
- [ ] Other devices remain authenticated

---

## 5. Session Persistence

### Test Case: TC-AUTH-040 - Session After Page Refresh
**Steps:**
1. Login to the application
2. Refresh the page (F5)
3. Check if still logged in

**Expected Results:**
- [ ] User remains logged in
- [ ] Profile data persists
- [ ] No re-login required

### Test Case: TC-AUTH-041 - Session Across Navigation
**Steps:**
1. Login
2. Navigate through multiple pages
3. Check session persists

**Expected Results:**
- [ ] Session maintained across all pages
- [ ] No session loss during navigation

### Test Case: TC-AUTH-042 - Browser Tab Session Sharing
**Steps:**
1. Login in one tab
2. Open new tab
3. Navigate to the app

**Expected Results:**
- [ ] User logged in automatically
- [ ] Session shared between tabs

---

## 6. Session Expiry

### Test Case: TC-AUTH-050 - Session Timeout
**Steps:**
1. Login to the application
2. Wait for session to expire (or check middleware)
3. Attempt to access protected route

**Expected Results:**
- [ ] Automatic redirect to `/login`
- [ ] Appropriate message if available
- [ ] No unauthorized access to protected routes

### Test Case: TC-AUTH-051 - Session Refresh
**Steps:**
1. Login
2. Make authenticated request before expiry
3. Verify session is refreshed

**Expected Results:**
- [ ] Session automatically refreshed on activity
- [ ] No forced logout during active use

---

## 7. Password Reset

### Test Case: TC-AUTH-060 - Forgot Password Flow
**Steps:**
1. Navigate to `/forgot-password`
2. Enter registered email
3. Click "Send Reset Link"
4. Check email for reset link
5. Click reset link
6. Enter new password
7. Login with new password

**Expected Results:**
- [ ] Reset email sent
- [ ] Email contains valid reset link
- [ ] Link redirects to `/reset-password` with token
- [ ] New password saved successfully
- [ ] Can login with new password
- [ ] Old password no longer works

### Test Case: TC-AUTH-061 - Invalid Reset Token
**Steps:**
1. Navigate to `/reset-password` with invalid token
2. Attempt to set new password

**Expected Results:**
- [ ] Error message displayed
- [ ] Password not changed

---

## 8. Protected Routes

### Test Case: TC-AUTH-070 - Unauthenticated Access to Dashboard
**Steps:**
1. Clear all sessions
2. Navigate directly to `/dashboard`

**Expected Results:**
- [ ] Redirect to `/login`
- [ ] Return URL preserved for post-login redirect

### Test Case: TC-AUTH-071 - Unauthenticated Access to Profile
**Steps:**
1. Clear all sessions
2. Navigate to `/profile`

**Expected Results:**
- [ ] Redirect to `/login`

### Test Case: TC-AUTH-072 - Public Pages Remain Accessible
**Steps:**
1. Clear all sessions
2. Navigate to `/`, `/events`, `/donation`

**Expected Results:**
- [ ] All public pages accessible without login
- [ ] No redirect to login

---

## 9. Admin Routes

### Test Case: TC-AUTH-080 - Super Admin Access
**Steps:**
1. Login as Super Admin
2. Navigate to `/admin`
3. Try accessing user management
4. Try accessing all admin sections

**Expected Results:**
- [ ] Full access to all admin features
- [ ] User management accessible
- [ ] All admin routes accessible

### Test Case: TC-AUTH-081 - Temple Admin Access
**Steps:**
1. Login as Temple Admin
2. Navigate to `/admin`
3. Try accessing user management

**Expected Results:**
- [ ] Access to admin dashboard
- [ ] Cannot access user management (manage_users permission)
- [ ] Appropriate access denied message if attempted

### Test Case: TC-AUTH-082 - Staff Access
**Steps:**
1. Login as Staff
2. Navigate to `/admin`

**Expected Results:**
- [ ] Limited access based on permissions
- [ ] Cannot access restricted admin sections

### Test Case: TC-AUTH-083 - Volunteer Access
**Steps:**
1. Login as Volunteer
2. Navigate to `/admin`

**Expected Results:**
- [ ] Redirected to `/dashboard` (not admin)
- [ ] No admin access

### Test Case: TC-AUTH-084 - Devotee Access
**Steps:**
1. Login as Devotee (public user)
2. Navigate to `/admin`

**Expected Results:**
- [ ] No admin access
- [ ] Redirected appropriately

---

## 10. Google OAuth

### Test Case: TC-AUTH-090 - Google Sign In
**Steps:**
1. Navigate to `/login`
2. Click "Continue with Google"
3. Complete Google authentication
4. Grant permissions

**Expected Results:**
- [ ] Redirected to Google
- [ ] After authentication, redirected back
- [ ] User logged in automatically
- [ ] Profile created if new user
- [ ] Profile updated if existing user

### Test Case: TC-AUTH-091 - Google OAuth New User
**Steps:**
1. Sign in with Google using new email
2. Complete registration

**Expected Results:**
- [ ] Account created in Supabase
- [ ] Profile created with Google info
- [ ] User logged in
- [ ] Redirected to `/admin`

### Test Case: TC-AUTH-092 - Google OAuth Existing User
**Steps:**
1. Register with email first
2. Sign in with same email via Google

**Expected Results:**
- [ ] Linked to existing account
- [ ] No duplicate account created
- [ ] User logged in

---

## 11. RBAC Verification Matrix

| Feature | Super Admin | Temple Admin | Staff | Volunteer | Devotee |
|---------|-------------|--------------|-------|-----------|---------|
| Access Admin | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Sevas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Donations | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Public Pages | ✅ | ✅ | ✅ | ✅ | ✅ |

### Test Case: TC-AUTH-100 - Permission Boundary Testing
**Steps:**
1. Login as each role
2. Attempt to access each feature above

**Expected Results:**
- [ ] Access matches RBAC matrix
- [ ] No unauthorized access
- [ ] Appropriate errors for denied access

### Test Case: TC-AUTH-101 - Horizontal Privilege Escalation
**Steps:**
1. Login as lower-privilege user
2. Try accessing other users' data via API

**Expected Results:**
- [ ] Cannot access other users' private data
- [ ] Proper authorization checks in place

### Test Case: TC-AUTH-102 - Vertical Privilege Escalation
**Steps:**
1. Login as non-admin
2. Try accessing admin API endpoints directly

**Expected Results:**
- [ ] Access denied
- [ ] Logged/audited as potential security event

---

## 12. Middleware Verification

### Test Case: TC-AUTH-110 - Unauthenticated /admin Access
**Steps:**
1. Clear all cookies
2. Request `GET /admin`

**Expected Results:**
- [ ] 307 redirect to `/login?next=/admin`
- [ ] No admin content served

### Test Case: TC-AUTH-111 - Expired Session Access
**Steps:**
1. Set session cookie with invalid/expired token
2. Request protected route

**Expected Results:**
- [ ] Session refreshed or invalidated
- [ ] Redirect to login if invalid
- [ ] No access to protected content

### Test Case: TC-AUTH-112 - API Route Authentication
**Steps:**
1. Make API request without auth
2. Make API request with valid auth
3. Make API request with invalid auth

**Expected Results:**
- [ ] Without auth: 401 Unauthorized
- [ ] With valid auth: 200 OK
- [ ] With invalid auth: 401 Unauthorized

### Test Case: TC-AUTH-113 - Redirect Loop Prevention
**Steps:**
1. Login
2. Access `/login` directly

**Expected Results:**
- [ ] Redirect to `/admin` if logged in
- [ ] No redirect loop

### Test Case: TC-AUTH-114 - Middleware Performance
**Steps:**
1. Enable verbose logging
2. Make multiple requests
3. Check for excessive latency

**Expected Results:**
- [ ] Minimal overhead from middleware
- [ ] Session validation < 50ms typical

---

## 13. Database Consistency

### Test Case: TC-AUTH-120 - Auth to App User Sync
**Steps:**
1. Create user via Supabase Dashboard
2. Create user via application
3. Check both methods create profile

**Expected Results:**
- [ ] `auth.users` table has user
- [ ] `public.profiles` table has matching profile
- [ ] Metadata synced (name, email)

### Test Case: TC-AUTH-121 - Profile Creation on Signup
**Steps:**
1. Register new user
2. Check `public.profiles` immediately after

**Expected Results:**
- [ ] Profile created with correct fields
- [ ] `userId` matches `auth.users.id`
- [ ] `email` matches
- [ ] `role` set to default (DEVOTEE)

### Test Case: TC-AUTH-122 - User Deletion Flow
**Steps:**
1. Delete user from application
2. Check `auth.users` also deleted
3. Check no orphaned data

**Expected Results:**
- [ ] User fully deleted from both locations
- [ ] No orphaned records
- [ ] Related data handled appropriately

### Test Case: TC-AUTH-123 - Onboarding Idempotency
**Steps:**
1. Trigger profile creation multiple times
2. Check no duplicate profiles

**Expected Results:**
- [ ] First call creates profile
- [ ] Subsequent calls update or no-op
- [ ] No duplicate profiles for same user

---

## 14. Security Review

### Test Case: TC-AUTH-130 - Cookie Settings
**Steps:**
1. Check browser developer tools
2. Inspect auth cookie

**Expected Results:**
- [ ] `HttpOnly: true` (not accessible via JavaScript)
- [ ] `Secure: true` (HTTPS only in production)
- [ ] `SameSite: Lax` or `SameSite: Strict`
- [ ] Appropriate expiry set

### Test Case: TC-AUTH-131 - OAuth Redirect URLs
**Steps:**
1. Check Supabase Dashboard OAuth config
2. Verify redirect URLs are specific

**Expected Results:**
- [ ] Redirect URLs point to your domain only
- [ ] No wildcard redirects
- [ ] Both callback URLs configured

### Test Case: TC-AUTH-132 - Environment Variable Handling
**Steps:**
1. Check codebase for hardcoded secrets
2. Verify `.env` is in `.gitignore`

**Expected Results:**
- [ ] No secrets in code
- [ ] `.env` file not committed
- [ ] Proper fallback for missing vars

### Test Case: TC-AUTH-133 - Firebase Cleanup
**Steps:**
1. Search codebase for "firebase", "Firebase"
2. Check `.env` files

**Expected Results:**
- [ ] No Firebase imports remain
- [ ] No Firebase env vars
- [ ] Firebase config removed

### Test Case: TC-AUTH-134 - SQL Injection Prevention
**Steps:**
1. Test API endpoints with SQL injection attempts
2. Check Prisma parameterized queries

**Expected Results:**
- [ ] All queries use parameterized statements
- [ ] No SQL injection possible
- [ ] Proper error handling

### Test Case: TC-AUTH-135 - XSS Prevention
**Steps:**
1. Test profile updates with XSS payloads
2. Check data displayed on pages

**Expected Results:**
- [ ] User input properly sanitized
- [ ] No script injection possible
- [ ] CSP headers in place

---

## 15. Error Handling

### Test Case: TC-AUTH-140 - Network Errors
**Steps:**
1. Disable network in browser
2. Attempt login

**Expected Results:**
- [ ] Clear error message
- [ ] No sensitive data exposed
- [ ] Retry mechanism available

### Test Case: TC-AUTH-141 - Supabase Down
**Steps:**
1. Simulate Supabase unavailability
2. Attempt auth operations

**Expected Results:**
- [ ] Graceful degradation
- [ ] Appropriate error messages
- [ ] No crash

### Test Case: TC-AUTH-142 - Rate Limiting
**Steps:**
1. Attempt many login failures
2. Attempt many registration attempts

**Expected Results:**
- [ ] Rate limiting active
- [ ] Clear message after limit
- [ ] No brute force possible

---

## 16. Audit Logging

### Test Case: TC-AUTH-150 - Login Logging
**Steps:**
1. Login successfully
2. Check audit logs

**Expected Results:**
- [ ] Login event logged
- [ ] IP address recorded
- [ ] User agent recorded
- [ ] Timestamp recorded

### Test Case: TC-AUTH-151 - Failed Login Logging
**Steps:**
1. Attempt failed login
2. Check audit logs

**Expected Results:**
- [ ] Failed attempt logged
- [ ] Appropriate details captured

### Test Case: TC-AUTH-152 - Admin Actions Logging
**Steps:**
1. Perform admin action
2. Check audit logs

**Expected Results:**
- [ ] Action logged
- [ ] Old/new values for changes
- [ ] Actor identified

---

## Test Environment Setup

### Using Work Hosts
The application is deployed at:
- **Host 1**: https://work-1-kudrktlpcpehcata.prod-runtime.all-hands.dev (port 12000)
- **Host 2**: https://work-2-kudrktlpcpehcata.prod-runtime.all-hands.dev (port 12001)

### Test Accounts
Create the following test accounts in Supabase Dashboard:

| Role | Email Pattern | Permissions |
|------|---------------|-------------|
| Super Admin | admin@test.com | All permissions |
| Temple Admin | temple-admin@test.com | Admin - users |
| Staff | staff@test.com | Staff level |
| Volunteer | volunteer@test.com | Volunteer level |
| Devotee | devotee@test.com | Public user |

---

## Quick Verification Commands

```bash
# Run all auth unit tests
npm run test -- tests/unit/auth.test.ts

# Run typecheck
npm run typecheck

# Run lint
npm run lint

# Validate Prisma schema
npx prisma validate

# Build production
npm run build
```

---

## Sign-off Checklist

Before marking migration complete, verify:

- [ ] All test cases marked ✅ above
- [ ] No critical security findings
- [ ] Performance acceptable
- [ ] User flows verified
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Team trained on new system
