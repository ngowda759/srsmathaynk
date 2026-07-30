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
- [ ] Success message displayed
- [ ] Email received with confirmation link
- [ ] User can now login after confirmation

### Test Case: TC-AUTH-002 - Registration Validation
**Steps:**
1. Navigate to `/register`
2. Try submitting with invalid email
3. Try submitting with weak password

**Expected Results:**
- [ ] Client-side validation errors displayed
- [ ] Form not submitted until all fields valid

---

## 2. Login

### Test Case: TC-AUTH-010 - Successful Email/Password Login
**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Sign In"

**Expected Results:**
- [ ] Redirect to `/admin` (or intended destination)
- [ ] Auth cookie set
- [ ] Profile loaded from database
- [ ] Navigation shows user is logged in

### Test Case: TC-AUTH-011 - Invalid Credentials
**Steps:**
1. Navigate to `/login`
2. Enter wrong password
3. Click "Sign In"

**Expected Results:**
- [ ] Error message: "Invalid email or password"
- [ ] No auth cookie set

### Test Case: TC-AUTH-012 - Unverified Email Login
**Steps:**
1. Register but don't confirm email
2. Attempt to login

**Expected Results:**
- [ ] Error message: "Please verify your email address first"

---

## 3. Session Persistence

### Test Case: TC-AUTH-020 - Session After Page Refresh
**Steps:**
1. Login to the application
2. Refresh the page (F5)
3. Check if still logged in

**Expected Results:**
- [ ] User remains logged in
- [ ] Profile data persists
- [ ] No re-login required

### Test Case: TC-AUTH-021 - Session Across Navigation
**Steps:**
1. Login
2. Navigate through multiple pages
3. Check session persists

**Expected Results:**
- [ ] Session maintained across all pages

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

---

## 5. Protected Routes

### Test Case: TC-AUTH-040 - Unauthenticated Access to Dashboard
**Steps:**
1. Clear all sessions
2. Navigate directly to `/dashboard`

**Expected Results:**
- [ ] Redirect to `/login`
- [ ] Return URL preserved for post-login redirect

### Test Case: TC-AUTH-041 - Public Pages Remain Accessible
**Steps:**
1. Clear all sessions
2. Navigate to `/`, `/events`, `/donation`

**Expected Results:**
- [ ] All public pages accessible without login

---

## 6. RBAC Verification

| Role | Admin Access | Manage Users | Manage Content |
|------|--------------|--------------|----------------|
| Super Admin | ✅ | ✅ | ✅ |
| Temple Admin | ✅ | ❌ | ✅ |
| Staff | ❌ | ❌ | ✅ |
| Volunteer | ❌ | ❌ | ❌ |
| Devotee | ❌ | ❌ | ❌ |

### Test Case: TC-AUTH-050 - Role Permissions
**Steps:**
1. Login as each role
2. Try accessing each feature

**Expected Results:**
- [ ] Access matches RBAC matrix
- [ ] No unauthorized access

---

## 7. Security Review

### Test Case: TC-AUTH-060 - Cookie Settings
**Steps:**
1. Check browser developer tools
2. Inspect auth cookie

**Expected Results:**
- [ ] `HttpOnly: true`
- [ ] `Secure: true` (production)
- [ ] `SameSite` configured

### Test Case: TC-AUTH-061 - Firebase Cleanup
**Steps:**
1. Search codebase for "firebase", "Firebase"
2. Check `.env` files

**Expected Results:**
- [ ] No Firebase imports remain
- [ ] No Firebase env vars

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

## Test Environment

The application is deployed at:
- **Host 1**: https://work-1-kudrktlpcpehcata.prod-runtime.all-hands.dev (port 12000)
- **Host 2**: https://work-2-kudrktlpcpehcata.prod-runtime.all-hands.dev (port 12001)

### Test Accounts

| Role | Email Pattern | Permissions |
|------|---------------|-------------|
| Super Admin | admin@test.com | All permissions |
| Temple Admin | temple-admin@test.com | Admin - users |
| Staff | staff@test.com | Staff level |
| Volunteer | volunteer@test.com | Volunteer level |
| Devotee | devotee@test.com | Public user |

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
