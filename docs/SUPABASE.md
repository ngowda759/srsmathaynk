# Supabase Setup Guide

This project uses **Supabase** as its backend-as-a-service platform, providing:
- PostgreSQL Database (via Prisma)
- Authentication
- Storage
- Real-time subscriptions (optional)

## Project Link

Your Supabase project: https://scnscvdnwqqmnqwtpulc.supabase.co

---

## Getting Started

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://scnscvdnwqqmnqwtpulc.supabase.co`
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (for `SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

### 2. Update Environment Variables

Copy your credentials to `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://scnscvdnwqqmnqwtpulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Get Database Connection String

1. Go to **Settings** → **Database**
2. Copy the **Connection Pooling** connection string
3. Update `DATABASE_URL` in `.env`:

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Push Schema to Database

```bash
npm run db:push
```

This creates all the database tables based on the Prisma schema.

---

## Database Schema

The following tables are created in PostgreSQL:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to Supabase Auth |
| `events` | Temple events |
| `sevas` | Services/offerings |
| `seva_bookings` | Seva bookings |
| `donation_campaigns` | Donation campaigns |
| `donations` | Donation records |
| `gallery_images` | Gallery images |
| `announcements` | Announcements |
| `homepage_settings` | Homepage configuration |
| `temple_settings` | Temple information |
| `trust_members` | Trust committee members |
| `future_plans` | Future plans |
| `facilities` | Temple facilities |
| `panchangas` | Daily panchanga data |
| `pooja_schedules` | Daily pooja schedule |
| `festivals` | Festival calendar |

---

## Storage Buckets

Create the following buckets in Supabase Storage:

1. Go to **Storage** in your Supabase dashboard
2. Create new buckets:
   - `images` - General images
   - `gallery` - Gallery images and videos
   - `documents` - Documents
   - `profile-photos` - User profile photos

Make buckets public for read access, or configure Row Level Security (RLS) policies.

---

## Authentication Setup

### Email Auth (Default)

Supabase Email Auth is enabled by default. Users can:
- Sign up with email/password
- Reset passwords via email

### Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirmation email
   - Reset password
   - Magic link

### Redirect URLs

Configure allowed redirect URLs in **Authentication** → **URL Configuration**:
- `http://localhost:3000/auth/callback` (development)
- `https://your-domain.com/auth/callback` (production)

---

## Row Level Security (RLS)

The database uses PostgreSQL Row Level Security. Sample policies:

### Profiles Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Gallery Images
```sql
-- Anyone can view active gallery images
CREATE POLICY "Public can view active images" ON gallery_images
  FOR SELECT USING (active = true);
```

---

## Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Push database schema
4. ⬜ Create storage buckets
5. ⬜ Configure RLS policies
6. ⬜ Test authentication
7. ⬜ Integrate services with database
