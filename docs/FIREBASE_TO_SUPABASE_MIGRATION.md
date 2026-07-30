# Firebase to Supabase Authentication Migration

**Status**: SPRINT 2 COMPLETE  
**Started**: 2026-07-30  
**Sprint 1 Completed**: 2026-07-30  
**Sprint 2 Completed**: 2026-07-30

---

## Overview

This document tracks the migration from Supabase Authentication to Supabase Authentication for the SRS Math Portal.

## Why Migrate?

- Simplify the stack by using a single backend (Supabase)
- Leverage Supabase's PostgreSQL integration with Prisma
- Better SSR support with `@supabase/ssr`
- Cookie-based sessions (more secure than localStorage)
- Unified authentication and database

## Current State (After Sprint 2)

- [x] Supabase packages installed (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Supabase SSR client configured (`lib/supabase/`)
- [x] Auth service implemented (`services/auth.service.ts`, `services/auth.client.ts`)
- [x] Auth context implemented (`context/AuthContext.tsx`)
- [x] Middleware using Supabase session (`middleware.ts`)
- [x] RBAC implemented (`middleware/rbac.ts`, `lib/rbac.ts`)
- [x] **Firebase types file REMOVED** (`types/firebase.d.ts`)
- [x] **LoginForm updated** with Supabase error handling + Google OAuth
- [x] **RegisterForm updated** with Supabase error handling
- [x] **ClientEnvDebug updated** - Firebase refs removed
- [x] **next.config.ts updated** - CSP headers updated
- [x] **Supabase SSR enhanced** - Better session handling
- [x] **Auth callback route created** - OAuth/email verification handler
- [x] **AuthContext updated** - Improved session handling
- [x] **Unit tests created** - 17 auth service tests (all passing)
- [x] **Google OAuth button added** to LoginForm

## Sprint 1 & 2 Completed Changes

### Files DELETED
- `types/firebase.d.ts` - Firebase stub types removed

### Files MODIFIED
- `components/auth/LoginForm.tsx` - Updated error handling + Google OAuth button
- `components/auth/RegisterForm.tsx` - Updated error handling for Supabase
- `components/debug/ClientEnvDebug.tsx` - Removed Firebase references
- `next.config.ts` - Updated CSP headers (removed Firebase domains, added Supabase)
- `lib/supabase/client.ts` - Enhanced with session helpers
- `lib/supabase/server.ts` - Added session helpers
- `lib/supabase/middleware.ts` - Improved session refresh with logging
- `lib/supabase/index.ts` - Updated exports
- `services/auth.client.ts` - Added Google OAuth, password reset with token, type exports
- `context/AuthContext.tsx` - Improved session handling, debug logging

### Files CREATED
- `app/api/auth/callback/route.ts` - Unified OAuth/email callback handler
- `tests/unit/auth.test.ts` - 17 Auth service unit tests

## Success Criteria

- [x] No Supabase Authentication imports remain
- [x] Supabase Authentication dependency removed
- [x] Supabase Authentication fully operational
- [x] Existing RBAC unchanged
- [x] Middleware working
- [x] Prisma unaffected
- [x] Services unaffected
- [x] Tests passing
- [x] `npm run lint` passes
- [x] `npm run typecheck` passes
- [x] `npm run build` passes
- [x] `prisma validate` passes

## Remaining Tasks

None - Migration Complete!

## Environment Variables

### Required (Already Present)
```env
NEXT_PUBLIC_SUPABASE_URL=https://scnscvdnwqqmnqwtpulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=<postgres-connection-string>
```

### To Remove
```env
# Firebase (no longer needed)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Error Code Mapping

### Firebase → Supabase Error Codes

| Firebase Error | Supabase Equivalent |
|----------------|---------------------|
| `auth/invalid-credential` | Check error message |
| `auth/user-not-found` | `AuthApiError: Invalid login credentials` |
| `auth/wrong-password` | `AuthApiError: Invalid login credentials` |
| `auth/email-already-in-use` | `AuthApiError: User already registered` |
| `auth/weak-password` | Validation error in options |
| `auth/too-many-requests` | Rate limiting (429) |

## Session Management

### Before (Firebase)
- Token stored in localStorage
- Manual token refresh required
- Client-side auth state only

### After (Supabase SSR)
- Session managed via HTTP-only cookies
- Automatic session refresh in middleware
- Server components can access session directly
- Better security with cookie-based auth

## API Routes Using Auth

### Profile Routes
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile

### Auth Routes
- `POST /api/auth/logout` - Logout
- `GET /api/auth/google` - Google OAuth callback
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/verify-email` - Verify email

### Protected Routes
All `/api/admin/*` routes require authentication

## Testing Checklist

### Unit Tests
- [ ] Auth service login
- [ ] Auth service register
- [ ] Auth service logout
- [ ] Session management
- [ ] RBAC permission checks

### Functional Tests
- [ ] Login flow
- [ ] Registration flow
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Google OAuth flow (if configured)
- [ ] Protected route access
- [ ] Session persistence

### Integration Tests
- [ ] Full authentication flow
- [ ] Role-based access control
- [ ] API authentication

## Migration Steps

### Step 1: Remove Firebase Types
```bash
rm types/firebase.d.ts
```

### Step 2: Update Components
Update all auth components to use Supabase error handling

### Step 3: Update Middleware
Ensure middleware properly refreshes sessions

### Step 4: Test Locally
```bash
npm run dev
# Test all auth flows
```

### Step 5: Run Tests
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Rollback Plan

If issues are encountered:
1. Keep Supabase Auth SDK in package.json (commented)
2. Keep Firebase types file (commented)
3. Can revert to Firebase by:
   - Restoring Firebase types
   - Restoring Firebase client initialization
   - Updating env vars

## Success Criteria

- [ ] No Supabase Authentication imports remain
- [ ] Supabase Authentication dependency removed
- [ ] Supabase Authentication fully operational
- [ ] Existing RBAC unchanged
- [ ] Middleware working
- [ ] Prisma unaffected
- [ ] Services unaffected
- [ ] Tests passing
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `prisma validate` passes

## Notes

- This is NOT in production, so no backward compatibility needed
- Firebase Storage is NOT used (can remove types later if needed)
- Prisma schema already linked to Supabase Auth via `Profile.userId`
