# Developer Guide
## SRS Math Temple Portal

**Version:** 1.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Setup](#development-setup)
3. [Architecture](#architecture)
4. [Database](#database)
5. [API Development](#api-development)
6. [Authentication](#authentication)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)

---

## Project Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Razorpay |
| Hosting | Vercel |
| AI | OpenAI GPT-4 |

### Project Structure

```
/workspace/project/srsmathaynk/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/        # Protected dashboard
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── calendar/          # Calendar module
├── components/             # React components
│   ├── admin/             # Admin-specific
│   ├── auth/              # Authentication
│   ├── calendar/          # Calendar
│   ├── common/            # Shared
│   ├── events/            # Events
│   ├── home/              # Homepage
│   └── layout/            # Layout components
├── lib/                    # Utilities
│   ├── ai/                # AI integration
│   ├── api/               # API utilities
│   ├── auth.ts            # Auth helpers
│   ├── db.ts              # Prisma client
│   ├── rate-limit.ts      # Rate limiting
│   ├── rbac.ts            # Role-based access
│   └── security.ts        # Security utilities
├── services/              # Business logic
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── donation.service.ts
│   └── ...
├── types/                 # TypeScript types
├── prisma/                # Database schema
├── tests/                 # Test files
└── docs/                  # Documentation
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- PostgreSQL (local) or Docker
- Supabase account

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/srsmatha"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"

# OpenAI
OPENAI_API_KEY="sk-xxx"

# Razorpay
RAZORPAY_KEY_ID="rzp_xxx"
RAZORPAY_KEY_SECRET="xxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

```bash
# Clone repository
git clone https://github.com/org/srsmathaynk.git
cd srsmathaynk

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Set up database
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### Development Server

```bash
npm run dev
# Opens at http://localhost:3000
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# All checks
npm run lint && npm run typecheck
```

---

## Architecture

### Design Patterns

#### 1. Service Layer Pattern

Business logic lives in `/services/`:
```typescript
// services/event.service.ts
export class EventService {
  async create(data: CreateEventDTO): Promise<Event> {
    // Business logic
  }
  
  async findAll(filters: EventFilters): Promise<Event[]> {
    // Query logic
  }
}
```

#### 2. Repository Pattern

Data access through `/lib/db.ts`:
```typescript
// Direct Prisma access for simple queries
const events = await prisma.event.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { eventDate: 'asc' }
})

// Complex queries via service
const events = await eventService.findUpcoming(limit)
```

#### 3. Middleware Pattern

Request processing:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Auth check
  // Rate limiting
  // Security headers
  // Return response
}
```

### State Management

| Use Case | Solution |
|----------|----------|
| Server state | React Query (TanStack Query) |
| UI state | React useState/useReducer |
| Form state | React Hook Form + Zod |
| Global state | Context API (minimal) |

### Data Flow

```
User Action
    ↓
Component (React)
    ↓
API Route (/api/...)
    ↓
Service Layer
    ↓
Prisma ORM
    ↓
PostgreSQL
```

---

## Database

### Schema Overview

```prisma
// Core models
Profile          - User accounts
Role             - System roles
Event            - Temple events
Seva             - Temple services
Donation         - Financial records
Announcement     - Public notices
GalleryAlbum     - Photo albums
GalleryItem      - Individual media
```

### Key Relationships

```
Profile (1) ←→ (N) UserRole → (1) Role
Event (1) ←→ (N) EventRecurrence
GalleryAlbum (1) ←→ (N) AlbumItem ←→ (1) GalleryItem
Donation (N) → (1) DonationCampaign
```

### Query Examples

#### Basic CRUD
```typescript
// Create
const event = await prisma.event.create({
  data: { title: 'New Event', ... }
})

// Read
const events = await prisma.event.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { eventDate: 'desc' },
  take: 10
})

// Update
await prisma.event.update({
  where: { id: eventId },
  data: { title: 'Updated Title' }
})

// Delete (soft)
await prisma.event.update({
  where: { id: eventId },
  data: { deletedAt: new Date() }
})
```

#### Complex Queries
```typescript
// Join with relations
const eventsWithDetails = await prisma.event.findMany({
  include: {
    organizer: { select: { name: true } },
    category: true
  }
})

// Aggregation
const stats = await prisma.donation.aggregate({
  where: { status: 'completed' },
  _sum: { amount: true },
  _count: { id: true }
})
```

### Migrations

```bash
# Create migration
npm run db:migrate -- --name add_new_field

# Apply migrations
npm run db:migrate:deploy

# Reset database (WARNING: deletes data)
npm run db:reset

# Studio (GUI)
npm run db:studio
```

---

## API Development

### API Structure

```typescript
// app/api/events/route.ts
export async function GET(request: Request) {
  // List events
}

export async function POST(request: Request) {
  // Create event (auth required)
}
```

### Response Format

```typescript
// Success
{
  success: true,
  data: { ... },
  message: 'Operation successful'
}

// Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [...]
  }
}
```

### Rate Limiting

```typescript
// Apply per-route
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60000,
    maxRequests: 10
  })
  
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
}
```

### Input Validation

```typescript
import { z } from 'zod'

const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  category: z.enum(['SPIRITUAL', 'CULTURAL', 'FESTIVAL'])
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = CreateEventSchema.safeParse(body)
  
  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 400 }
    )
  }
  
  // Process valid data
}
```

---

## Authentication

### Supabase Auth Integration

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Session Management

```typescript
// Middleware checks session
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

### Protected Routes

```typescript
// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check role
  const hasAccess = await checkAdminRole(user.id)
  if (!hasAccess) {
    redirect('/unauthorized')
  }
  
  return <AdminDashboard />
}
```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Security tests
npm run test:security

# Coverage report
npm run test:coverage
```

### Writing Tests

```typescript
// tests/unit/services/event.service.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    event: {
      create: vi.fn(),
      findMany: vi.fn(),
    }
  }
}))

describe('Event Service', () => {
  it('should create event', async () => {
    const mockEvent = { id: '1', title: 'Test Event' }
    ;(prisma.event.create as any).mockResolvedValue(mockEvent)
    
    const result = await prisma.event.create({
      data: { title: 'Test Event' }
    })
    
    expect(result.title).toBe('Test Event')
  })
})
```

### E2E Testing with Playwright

```typescript
// tests/functional/events.spec.ts
import { test, expect } from '@playwright/test'

test('should create event', async ({ page }) => {
  await page.goto('/admin/events')
  await page.click('button:has-text("Create Event")')
  
  await page.fill('input[name="title"]', 'Test Event')
  await page.click('button:has-text("Publish")')
  
  await expect(page.locator('text=Test Event')).toBeVisible()
})
```

---

## Deployment

### Vercel Deployment

```bash
# Deploy to preview
git push

# Deploy to production
git push origin main
```

### Environment Variables on Vercel

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Scope |
|----------|-------|
| DATABASE_URL | Production, Preview, Development |
| SUPABASE_* | Production, Preview, Development |
| OPENAI_API_KEY | Production, Preview |
| RAZORPAY_* | Production, Preview |

### Build Process

```bash
# Vercel runs automatically:
npm run build

# Or manually:
npm run build
npm run start
```

### Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  })
}
```

---

## Best Practices

### Code Style

1. **TypeScript**: Strict mode enabled
2. **Naming**: camelCase for variables, PascalCase for components
3. **Imports**: Absolute paths with `@/` prefix
4. **Comments**: Minimal, descriptive where needed

### Security

1. **Never expose secrets**: Use environment variables
2. **Validate all input**: Zod schemas on all endpoints
3. **Sanitize output**: React handles most XSS protection
4. **Rate limit**: All public endpoints
5. **RBAC**: Check permissions server-side

### Performance

1. **Server Components**: Use where possible
2. **Caching**: Cache expensive queries
3. **Images**: Use Next.js Image component
4. **Bundle**: Keep client components minimal

### Git Workflow

```
feature/your-feature-name
    ↓
Pull Request
    ↓
Code Review
    ↓
Merge to main
    ↓
Auto-deploy to production
```

### Error Handling

```typescript
try {
  const result = await riskyOperation()
  return Response.json({ success: true, data: result })
} catch (error) {
  console.error('Operation failed:', error)
  
  if (error instanceof ValidationError) {
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
  
  return Response.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## Appendix: NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## Support

- **GitHub Issues**: Bug reports and feature requests
- **Email**: dev@srsmatha.org
- **Slack**: #dev-team channel

---

*Document Version: 1.0*
