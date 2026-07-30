# Deployment Guide - SRS Math Portal

## Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account with project created

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ngowda759/srsmathaynk.git
cd srsmathaynk
git checkout main
```

### 2. Create Environment File

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://scnscvdnwqqmnqwtpulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-axDZxVWZdTKaJXfG1nf0w_fpH2ItSE
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (Connection Pooling - for runtime)
DATABASE_URL="postgresql://postgres:GuruSarvaBhouma12@scnscvdnwqqmnqwtpulc.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL (for migrations)
DIRECT_URL="postgresql://postgres:GuruSarvaBhouma12@scnscvdnwqqmnqwtpulc.supabase.com:5432/postgres"

# AI CONFIG (Optional)
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Get Supabase Credentials

From your Supabase Dashboard (https://supabase.com/dashboard):
1. Go to Settings → API
2. Copy the `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
3. Copy the `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy the `service_role` secret key (SUPABASE_SERVICE_ROLE_KEY)

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Push Database Schema

```bash
npx prisma db push
```

This creates the database tables based on your Prisma schema.

### 7. Run Database Migrations (if you have existing migrations)

```bash
npx prisma migrate deploy
```

## Running the Application

### Development

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Supabase Setup Checklist

### Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates if needed

### Enable Google OAuth (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. Add your Google OAuth credentials from Google Cloud Console

### Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: http://localhost:3000 (development)
         https://your-production-domain.com (production)

Redirect URLs:
- http://localhost:3000/api/auth/callback
- https://your-production-domain.com/api/auth/callback
```

## Testing Authentication

### Unit Tests

```bash
npm run test -- tests/unit/auth.test.ts
```

### All Tests

```bash
npm run test
```

### E2E Tests (requires Playwright)

```bash
npx playwright test tests/e2e/auth-e2e.test.ts
```

## Verification

See [AUTH_VERIFICATION_CHECKLIST.md](./AUTH_VERIFICATION_CHECKLIST.md) for complete testing instructions.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Run tests
npm run test -- tests/unit/auth.test.ts

# Build for production
npm run build
```

## Common Issues

### "Can't reach database server"

- Check your DATABASE_URL is correct
- Ensure Supabase project is active
- Verify IP whitelist settings (if any)

### "Invalid JWT"

- Regenerate your SUPABASE_SERVICE_ROLE_KEY
- Check the key is correctly copied (no extra spaces)

### "Table does not exist"

- Run `npx prisma db push` to sync schema
- Check DATABASE_URL points to correct database
