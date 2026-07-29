# Sri Raghavendra Swamy Matha Portal
## Software Design & Operations Handbook

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production Ready  

---

# Table of Contents

## Part I: Overview
1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Technology Stack](#technology-stack)

## Part II: System Architecture
4. [Architecture Overview](#architecture-overview)
5. [Application Structure](#application-structure)
6. [Component Architecture](#component-architecture)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)

## Part III: Database
9. [Database Schema](#database-schema)
10. [Entity Relationships](#entity-relationships)
11. [Indexing Strategy](#indexing-strategy)
12. [Row Level Security](#row-level-security)

## Part IV: Module Design
13. [Authentication Module](#authentication-module)
14. [User Management Module](#user-management-module)
15. [Event Management Module](#event-management-module)
16. [Seva & Booking Module](#seva--booking-module)
17. [Donation Module](#donation-module)
18. [Gallery Module](#gallery-module)
19. [AI Assistant Module](#ai-assistant-module)
20. [Announcements Module](#announcements-module)

## Part V: API Reference
21. [API Overview](#api-overview)
22. [Authentication API](#authentication-api)
23. [Events API](#events-api)
24. [Sevas API](#sevas-api)
25. [Donations API](#donations-api)
26. [Gallery API](#gallery-api)
27. [Announcements API](#announcements-api)

## Part VI: Security
28. [Security Model](#security-model)
29. [Authentication & Authorization](#authentication--authorization)
30. [Input Validation](#input-validation)
31. [Rate Limiting](#rate-limiting)
32. [Security Headers](#security-headers)
33. [OWASP Compliance](#owasp-compliance)

## Part VII: Deployment
34. [Deployment Overview](#deployment-overview)
35. [Environment Configuration](#environment-configuration)
36. [Build Process](#build-process)
37. [CI/CD Pipeline](#cicd-pipeline)
38. [Vercel Deployment](#vercel-deployment)

## Part VIII: Operations
39. [Monitoring & Alerting](#monitoring--alerting)
40. [Logging Strategy](#logging-strategy)
41. [Backup & Recovery](#backup--recovery)
42. [Disaster Recovery](#disaster-recovery)
43. [Performance Optimization](#performance-optimization)

## Part IX: Troubleshooting
44. [Common Issues](#common-issues)
45. [Error Reference](#error-reference)
46. [Debug Procedures](#debug-procedures)

## Part X: Appendices
47. [Glossary](#glossary)
48. [Checklists](#checklists)
49. [Future Roadmap](#future-roadmap)

---

# Part I: Overview

## 1. Introduction

This handbook is the authoritative reference for the Sri Raghavendra Swamy Matha Portal. It provides comprehensive documentation covering system architecture, database design, API specifications, security models, deployment procedures, and operational guidelines.

### Purpose
- Guide new contributors through the codebase
- Serve as a reference for daily operations
- Document architectural decisions and their rationale
- Provide troubleshooting procedures
- Enable consistent development practices

### Scope
This handbook covers:
- Architecture and design decisions
- All system modules and their interactions
- API endpoints and data formats
- Security implementation details
- Deployment and operational procedures
- Troubleshooting guidelines

---

## 2. Project Overview

### 2.1 Project Description

The SRS Math Portal is a web-based temple management system that serves devotees by providing:
- Online seva booking
- Donation management
- Event information
- Gallery browsing
- AI-powered assistance
- Administrative capabilities

### 2.2 Key Features

| Feature | Description |
|---------|-------------|
| User Authentication | Supabase-based auth with email/password |
| Seva Booking | Online booking for temple services |
| Donation Processing | Razorpay-integrated donations with 80G |
| Event Management | Festival and event scheduling |
| Gallery | Photo/video albums with categories |
| AI Assistant | GPT-4 powered chatbot (Raya) |
| Admin Dashboard | Comprehensive management interface |

### 2.3 User Roles

| Role | Permissions |
|------|-------------|
| Super Admin | Full system access |
| Admin | Content management, reports |
| Staff | Event and booking management |
| Priest | Event scheduling, sevas |
| Volunteer | Dashboard access |
| Devotee | Basic access |

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework |
| React | 19+ | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4+ | Styling |
| shadcn/ui | 4+ | Component library |
| Framer Motion | 12+ | Animations |
| React Hook Form | 7+ | Form handling |
| Zod | 4+ | Schema validation |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | - | Serverless functions |
| Prisma | 5+ | ORM |
| PostgreSQL | 15+ | Primary database |
| Supabase | - | Auth & Storage |
| Razorpay | - | Payment processing |
| OpenAI | - | AI assistant |

### 3.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| Vercel | Hosting & CDN |
| Vercel Analytics | Performance monitoring |
| Sentry | Error tracking |
| GitHub | Version control |

---

# Part II: System Architecture

## 4. Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Browser    │  │    Mobile   │  │      PWA        │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
└─────────┼────────────────┼─────────────────────┼─────────────┘
          │                │                     │
          └────────────────┼─────────────────────┘
                           │ HTTPS
          ┌────────────────┴─────────────────────┐
          │              Vercel Edge              │
          │  ┌──────────────────────────────┐   │
          │  │      Next.js Application      │   │
          │  │  ┌────────────────────────┐ │   │
          │  │  │    API Routes (SSR)     │ │   │
          │  │  └────────────┬─────────────┘ │   │
          │  │               │                 │   │
          │  │  ┌────────────▼─────────────┐ │   │
          │  │  │     Service Layer        │ │   │
          │  │  └────────────┬─────────────┘ │   │
          │  └───────────────┼─────────────────┘   │
          └─────────────────┼───────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │  Supabase   │    │  OpenAI     │
│  (Prisma)   │    │  (Auth+FS) │    │   (GPT-4)   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 4.2 Architecture Principles

1. **Serverless First**: Use Next.js API routes for serverless functions
2. **Type Safety**: Full TypeScript coverage
3. **Security by Design**: Input validation, RBAC, RLS
4. **Performance**: Server components, caching, optimization
5. **Scalability**: Stateless design, edge deployment

### 4.3 Design Patterns

| Pattern | Usage |
|---------|-------|
| Service Layer | Business logic encapsulation |
| Repository | Data access abstraction |
| Middleware | Request processing |
| Hook Pattern | Client-side logic reuse |
| Context | Global state management |

---

## 5. Application Structure

### 5.1 Directory Structure

```
/workspace/project/srsmathaynk/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected dashboard
│   ├── (public)/                  # Public pages
│   │   ├── about/
│   │   ├── events/
│   │   ├── sevas/
│   │   ├── gallery/
│   │   └── donate/
│   ├── admin/                    # Admin panel
│   │   ├── users/
│   │   ├── events/
│   │   ├── sevas/
│   │   ├── donations/
│   │   └── gallery/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── events/
│   │   ├── sevas/
│   │   └── donations/
│   ├── calendar/                # Calendar module
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin-specific
│   ├── auth/                     # Authentication
│   ├── calendar/                # Calendar
│   ├── common/                   # Shared
│   ├── events/                  # Events
│   ├── home/                    # Homepage
│   └── layout/                  # Layout
├── lib/                          # Utilities
│   ├── ai/                       # AI integration
│   ├── api/                      # API utilities
│   ├── auth.ts                   # Auth helpers
│   ├── db.ts                     # Prisma client
│   ├── rate-limit.ts            # Rate limiting
│   ├── rbac.ts                   # Role-based access
│   ├── security.ts               # Security utils
│   └── utils.ts                  # General utils
├── services/                      # Business logic
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── donation.service.ts
│   └── ...
├── types/                        # TypeScript types
├── prisma/                       # Database schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── middleware.ts                  # Next.js middleware
└── public/                        # Static assets
```

### 5.2 App Router Conventions

| Directory | Access | Rendering |
|-----------|--------|-----------|
| `(auth)` | Public | Client |
| `(dashboard)` | Protected | Hybrid |
| `(public)` | Public | Server |
| `admin` | Protected | Client |
| `api` | Varies | API Route |

---

## 6. Component Architecture

### 6.1 Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Main
│   ├── Page Content
│   │   ├── Components
│   │   └── Forms
│   └── Sidebar (if applicable)
├── Footer
└── ChatWidget (Raya AI)
```

### 6.2 Component Categories

| Category | Location | Purpose |
|----------|----------|---------|
| Admin | `components/admin/` | Dashboard components |
| Auth | `components/auth/` | Login, register forms |
| Common | `components/common/` | Shared UI |
| Layout | `components/layout/` | Page structures |
| Domain | `components/*/` | Feature-specific |

### 6.3 UI Components (shadcn/ui)

```typescript
// Available components
import { Button, Input, Card } from "@/components/ui"
import { DataTable } from "@/components/common"
import { Modal, Toast } from "@/components/common"
```

---

## 7. Data Flow

### 7.1 Request Flow

```
Browser Request
      ↓
Middleware (auth, rate-limit)
      ↓
Route Handler (API)
      ↓
Service Layer
      ↓
Repository/Prisma
      ↓
Database
      ↓
Response
```

### 7.2 Authentication Flow

```
Login Request
      ↓
Supabase Auth
      ↓
Create Session
      ↓
Set Cookies
      ↓
Update Session (middleware)
      ↓
Protected Route Access
```

### 7.3 Payment Flow

```
Initiate Donation
      ↓
Create Razorpay Order
      ↓
Client Payment
      ↓
Verify Signature
      ↓
Confirm Donation
      ↓
Send Receipt
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
┌────────────────────────────────────────┐
│           Network Layer                │
│  - HTTPS/TLS                           │
│  - CDN (Vercel Edge)                   │
├────────────────────────────────────────┤
│           Application Layer             │
│  - Authentication                       │
│  - Authorization (RBAC)                 │
│  - Input Validation                     │
│  - Rate Limiting                        │
├────────────────────────────────────────┤
│           Database Layer                │
│  - Row Level Security                  │
│  - Parameterized Queries               │
│  - Encrypted Connections                │
└────────────────────────────────────────┘
```

### 8.2 Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | Supabase Auth |
| Authorization | RBAC + RLS |
| Input Validation | Zod schemas |
| XSS Protection | React + sanitize |
| CSRF Protection | Tokens |
| Rate Limiting | In-memory + API |
| Security Headers | middleware.ts |

---

# Part III: Database

## 9. Database Schema

### 9.1 Core Tables

```prisma
// User Management
Profile          - User accounts
Role             - System roles
UserRole         - Role assignments

// Temple Configuration
TempleInfo       - Temple details
SiteSetting       - Key-value settings
HomepageConfig    - Homepage content

// Scheduling
TempleDay        - Regular hours
TempleException  - Special days

// Media
Media            - Centralized media storage
GalleryCategory  - Album categories
GalleryAlbum     - Photo albums
GalleryItem      - Individual items

// Services
Seva             - Temple services
SevaCategory     - Seva types
Booking          - Service bookings

// Content
Event            - Temple events
Announcement     - Public notices

// Financial
Donation         - Donations
DonationCampaign - Fundraising campaigns

// AI
ChatSession      - AI conversations
ChatMessage      - Chat history
AIFeedback       - User feedback
```

### 9.2 Schema Best Practices

1. **Naming**: PascalCase for models, camelCase for fields
2. **IDs**: UUID with `@id @default(uuid())`
3. **Timestamps**: `createdAt` and `updatedAt` on all tables
4. **Soft Deletes**: Use `deletedAt` for data retention
5. **Indexes**: Add for frequently queried columns

---

## 10. Entity Relationships

### 10.1 Core Relationships

```
Profile (1) ←────→ (N) UserRole ←────→ (1) Role
     │
     ├── (1) Donation
     ├── (1) Booking
     ├── (N) Announcement
     └── (N) ChatSession

Event (1) ←────→ (N) EventRecurrence
GalleryAlbum (1) ←────→ (N) AlbumItem ←────→ (1) GalleryItem
Donation (N) ←────→ (1) DonationCampaign
```

### 10.2 Cascade Rules

| Parent | Child | Rule |
|--------|-------|------|
| Profile | UserRole | Cascade Delete |
| GalleryAlbum | AlbumItem | Cascade Delete |
| GalleryAlbum | GalleryItem | SetNull |

---

## 11. Indexing Strategy

### 11.1 Index Types

```prisma
// Primary indexes (automatic)
// - @id creates unique index

// Additional indexes
@@index([email])           // Profile lookup
@@index([status])          // Filtering
@@index([createdAt])       // Sorting
@@index([eventDate])       // Date queries
```

### 11.2 Query Optimization

| Query Pattern | Index |
|---------------|-------|
| Find by email | `@@index([email])` |
| Filter by status | `@@index([status])` |
| Sort by date | `@@index([createdAt])` |
| Date range | `@@index([eventDate])` |

---

## 12. Row Level Security

### 12.1 RLS Overview

Row Level Security (RLS) ensures users only access their own data.

### 12.2 Policy Examples

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'ADMIN'
  )
);
```

---

# Part IV: Module Design

## 13. Authentication Module

### 13.1 Auth Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ POST /api/auth/login
       ↓
┌─────────────────┐
│ Supabase Auth   │
└──────┬──────────┘
       │ Success/Failure
       ↓
┌─────────────────┐
│ Create Session  │
│ Set Cookies     │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Redirect         │
└─────────────────┘
```

### 13.2 Auth Service

```typescript
// services/auth.service.ts
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw new AuthError(error.message)
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new AuthError(error.message)
}
```

---

## 14. User Management Module

### 14.1 Profile Schema

```typescript
interface Profile {
  id: string
  userId: string           // Supabase auth ID
  email: string
  name?: string
  phone?: string
  address?: string
  avatarId?: string
  emailVerified: boolean
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 14.2 RBAC Implementation

```typescript
// lib/rbac.ts
export async function getProfileRoles(profileId: string): Promise<UserRole[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { profileId },
    include: { role: true },
  })
  return userRoles.map(ur => ur.role.name)
}

export async function hasPermission(
  profileId: string,
  permission: string
): Promise<boolean> {
  const roles = await getProfileRoles(profileId)
  // Check if any role has the permission
}
```

---

## 15. Event Management Module

### 15.1 Event Schema

```typescript
interface Event {
  id: string
  title: string
  titleKn?: string          // Kannada
  description?: string
  descriptionKn?: string
  
  eventDate: Date
  startTime: string
  endTime?: string
  
  location?: string
  category: EventCategory
  status: EventStatus
  
  isFeatured: boolean
  maxAttendees?: number
  
  createdAt: Date
  updatedAt: Date
}

enum EventCategory {
  SPIRITUAL
  CULTURAL
  FESTIVAL
  SPECIAL
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}
```

### 15.2 Event Service

```typescript
// services/event.service.ts
export async function createEvent(data: CreateEventDTO) {
  return prisma.event.create({
    data: {
      ...data,
      status: 'DRAFT',
    },
  })
}

export async function publishEvent(id: string) {
  return prisma.event.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  })
}
```

---

## 16. Seva & Booking Module

### 16.1 Seva Schema

```typescript
interface Seva {
  id: string
  name: string
  nameKn?: string
  description?: string
  
  price: number
  duration: number           // minutes
  
  categoryId: string
  category: SevaCategory
  
  maxBookingsPerSlot: number
  availableDays: number[]    // 0=Sunday
  
  isActive: boolean
  isOnlineBooking: boolean
  displayOrder: number
}

interface Booking {
  id: string
  sevaId: string
  seva: Seva
  
  profileId: string
  profile: Profile
  
  bookingDate: Date
  slotTime: string
  status: BookingStatus
  
  devoteeName: string
  devoteePhone?: string
  devoteeEmail: string
  gotra?: string
  specialRequests?: string
  
  amount: number
  paymentId?: string
  
  createdAt: Date
  updatedAt: Date
}
```

### 16.2 Booking Flow

```
User selects Seva
       ↓
Choose Date & Time Slot
       ↓
Enter Details
       ↓
Make Payment (Razorpay)
       ↓
Confirm Booking
       ↓
Send Confirmation Email
```

---

## 17. Donation Module

### 17.1 Donation Schema

```typescript
interface Donation {
  id: string
  amount: number
  currency: string = 'INR'
  
  donorName: string
  donorEmail: string
  donorPhone?: string
  
  message?: string
  
  campaignId?: string
  campaign?: DonationCampaign
  
  status: DonationStatus
  
  paymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
  
  receiptNumber?: string
  receiptUrl?: string
  
  createdAt: Date
  updatedAt: Date
}

enum DonationStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### 17.2 Payment Integration

```typescript
// services/razorpay.service.ts
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function createDonationOrder(amount: number) {
  const order = await razorpay.orders.create({
    amount: amount * 100,  // Convert to paise
    currency: 'INR',
    receipt: `donation_${Date.now()}`,
  })
  return order
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  
  return generated_signature === signature
}
```

---

## 18. Gallery Module

### 18.1 Gallery Schema

```typescript
interface GalleryAlbum {
  id: string
  title: string
  titleKn?: string
  slug: string
  
  description?: string
  coverImageId?: string
  
  categoryId?: string
  category?: GalleryCategory
  
  status: AlbumStatus
  visibility: AlbumVisibility
  
  featured: boolean
  published: boolean
  
  photoCount: number
  videoCount: number
  
  createdAt: Date
  updatedAt: Date
}

interface GalleryItem {
  id: string
  type: GalleryItemType
  
  filename: string
  storagePath: string
  mimeType: string
  
  title?: string
  caption?: string
  altText?: string
  
  width?: number
  height?: number
}
```

### 18.2 Album Management

```typescript
export async function createAlbum(data: CreateAlbumDTO) {
  return prisma.galleryAlbum.create({
    data: {
      ...data,
      slug: generateSlug(data.title),
      status: 'DRAFT',
    },
  })
}

export async function publishAlbum(id: string) {
  return prisma.galleryAlbum.update({
    where: { id },
    data: { 
      status: 'PUBLISHED',
      published: true,
    },
  })
}
```

---

## 19. AI Assistant Module

### 19.1 Architecture

```
User Message
      ↓
Chat Session Management
      ↓
Intent Detection
      ↓
Knowledge Base Query
      ↓
GPT-4 Generation
      ↓
Response Formatting
      ↓
Store Message
      ↓
Send Response
```

### 19.2 Chat Schema

```typescript
interface ChatSession {
  id: string
  sessionKey: string
  
  userId?: string
  userIp?: string
  
  language: 'en' | 'kn' | 'mixed'
  messageCount: number
  
  lastIntent?: string
  lastTopic?: string
  
  isActive: boolean
  createdAt: Date
  lastActivityAt: Date
}

interface ChatMessage {
  id: string
  sessionId: string
  
  role: 'user' | 'assistant'
  content: string
  contentKn?: string
  
  model?: string
  latency?: number
  tokens?: number
  
  confidence?: number
  detectedIntent?: string
  sources?: Source[]
}
```

### 19.3 AI Service

```typescript
// services/chat.service.ts
export async function processMessage(
  sessionId: string,
  userMessage: string
) {
  // 1. Detect language
  const language = detectLanguage(userMessage)
  
  // 2. Search knowledge base
  const context = await searchKnowledgeBase(userMessage)
  
  // 3. Generate response
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })
  
  // 4. Store messages
  await storeMessages(sessionId, userMessage, response)
  
  return response
}
```

---

## 20. Announcements Module

### 20.1 Announcement Schema

```typescript
interface Announcement {
  id: string
  title: string
  content: string
  
  type: AnnouncementType
  priority: Priority
  
  isActive: boolean
  isPinned: boolean
  
  startDate: Date
  endDate?: Date
  
  url?: string
  urlText?: string
  
  mediaId?: string
  
  createdById?: string
  
  createdAt: Date
  updatedAt: Date
}

enum AnnouncementType {
  INFO
  WARNING
  URGENT
  EVENT
  MAINTENANCE
}
```

---

# Part V: API Reference

## 21. API Overview

### 21.1 API Structure

```
/api/
├── auth/
│   ├── callback
│   ├── login
│   ├── logout
│   └── session
├── events/
│   ├── GET    /api/events         # List events
│   ├── POST   /api/events         # Create event
│   ├── GET    /api/events/[id]    # Get event
│   ├── PUT    /api/events/[id]    # Update event
│   └── DELETE /api/events/[id]    # Delete event
├── sevas/
│   ├── GET    /api/sevas          # List sevas
│   ├── POST   /api/sevas          # Create seva
│   └── ...
├── donations/
│   ├── POST   /api/donations/create-order
│   ├── POST   /api/donations/verify
│   └── ...
└── chat/
    └── POST   /api/chat/message
```

### 21.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

---

## 22. Authentication API

### 22.1 Login

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com"
    },
    "session": { ... }
  }
}
```

### 22.2 Logout

```
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 23. Events API

### 23.1 List Events

```
GET /api/events?status=PUBLISHED&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [...],
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

### 23.2 Create Event

```
POST /api/auth/login
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Annual Festival",
  "eventDate": "2024-12-25",
  "startTime": "09:00",
  "endTime": "18:00",
  "category": "FESTIVAL",
  "status": "DRAFT"
}
```

---

## 24. Sevas API

### 24.1 List Sevas

```
GET /api/sevas?category=PUJA&isActive=true
```

### 24.2 Create Booking

```
POST /api/sevas/book
Authorization: Bearer <token>
```

**Request:**
```json
{
  "sevaId": "seva-123",
  "bookingDate": "2024-12-25",
  "slotTime": "09:00",
  "devoteeName": "John Doe",
  "devoteeEmail": "john@example.com",
  "devoteePhone": "+919876543210"
}
```

---

## 25. Donations API

### 25.1 Create Order

```
POST /api/donations/create-order
```

**Request:**
```json
{
  "amount": 1000,
  "campaignId": "campaign-123",
  "donorName": "Jane Doe",
  "donorEmail": "jane@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 100000,
    "currency": "INR"
  }
}
```

### 25.2 Verify Payment

```
POST /api/donations/verify
```

**Request:**
```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "xxx"
}
```

---

## 26. Gallery API

### 26.1 List Albums

```
GET /api/gallery/albums?status=PUBLISHED&category=festivals
```

### 26.2 Get Album Items

```
GET /api/gallery/albums/[id]/items?limit=20&offset=0
```

---

## 27. Announcements API

### 27.1 List Announcements

```
GET /api/announcements?isActive=true&type=INFO
```

### 27.2 Create Announcement

```
POST /api/announcements
Authorization: Bearer <admin-token>
```

---

# Part VI: Security

## 28. Security Model

### 28.1 Security Layers

| Layer | Protection |
|-------|------------|
| Network | HTTPS, TLS |
| Application | Auth, RBAC |
| Database | RLS, Encryption |
| API | Rate Limiting, Validation |

---

## 29. Authentication & Authorization

### 29.1 Authentication Flow

1. User submits credentials
2. Supabase validates
3. Session created with JWT
4. Cookies set (HttpOnly, Secure)
5. Middleware validates on each request

### 29.2 Authorization Levels

```
SUPER_ADMIN > ADMIN > STAFF > PRIEST > VOLUNTEER > DEVOTEE
```

### 29.3 Permission Checks

```typescript
// Middleware example
export async function withAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
) {
  const session = await getSession(request)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  if (allowedRoles) {
    const hasRole = await profileHasRole(session.profileId, allowedRoles)
    if (!hasRole) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
  
  return session
}
```

---

## 30. Input Validation

### 30.1 Zod Schemas

```typescript
// Validation example
import { z } from 'zod'

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  category: z.enum(['SPIRITUAL', 'CULTURAL', 'FESTIVAL', 'SPECIAL']),
})

export const DonationSchema = z.object({
  amount: z.number().positive().max(1000000),
  donorName: z.string().min(2).max(100),
  donorEmail: z.string().email(),
  donorPhone: z.string().optional(),
  message: z.string().max(500).optional(),
})
```

### 30.2 Sanitization

```typescript
// lib/security.ts
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')        // Remove brackets
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+=/gi, '')      // Remove event handlers
    .trim()
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
```

---

## 31. Rate Limiting

### 31.1 Implementation

```typescript
// lib/rate-limit.ts
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  
  // Clean old entries
  const record = rateLimitStore.get(identifier)
  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier)
  }
  
  // Check limit
  if (!record) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }
  
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }
  
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt }
}
```

### 31.2 Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| API (general) | 100 | 1 minute |
| API (search) | 30 | 1 minute |
| Auth | 5 | 15 minutes |
| Form submission | 10 | 1 minute |

---

## 32. Security Headers

### 32.1 Middleware Configuration

```typescript
// middleware.ts
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co https://api.stripe.com;
  `.replace(/\s+/g, ' ').trim()
}
```

---

## 33. OWASP Compliance

### 33.1 OWASP Top 10 Checklist

| Vulnerability | Protection |
|--------------|-----------|
| A01 - Broken Access Control | RBAC + RLS |
| A02 - Cryptographic Failures | HTTPS + Secure Cookies |
| A03 - Injection | Prisma + Zod |
| A04 - Insecure Design | Rate Limiting |
| A05 - Security Misconfiguration | Security Headers |
| A06 - Vulnerable Components | npm audit |
| A07 - Auth Failures | Supabase Auth |
| A08 - Software Integrity | CI/CD |
| A09 - Logging Failures | Audit Logging |
| A10 - SSRF | URL Validation |

---

# Part VII: Deployment

## 34. Deployment Overview

### 34.1 Environments

| Environment | Purpose | URL |
|------------|---------|-----|
| Development | Local development | localhost:3000 |
| Preview | PR testing | *.vercel.app |
| Production | Live site | srsmathaynk.vercel.app |

---

## 35. Environment Configuration

### 35.1 Required Variables

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Razorpay
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://srsmathaynk.vercel.app
```

---

## 36. Build Process

### 36.1 Build Command

```bash
npm run build
```

### 36.2 Build Steps

1. TypeScript compilation
2. ESLint checks
3. Next.js compilation
4. Prisma generation
5. Asset optimization

---

## 37. CI/CD Pipeline

### 37.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  prisma:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma validate

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, prisma]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 38. Vercel Deployment

### 38.1 Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

### 38.2 Deployment Steps

1. Push to GitHub
2. Vercel auto-deploys
3. Preview URL generated
4. Merge to main → Production deploy

---

# Part VIII: Operations

## 39. Monitoring & Alerting

### 39.1 Monitoring Tools

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Performance |
| Sentry | Errors |
| Supabase Dashboard | Database |
| Uptime Robot | Uptime |

### 39.2 Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "storage": "ok",
    "ai": "ok"
  }
}
```

---

## 40. Logging Strategy

### 40.1 Log Levels

| Level | Usage |
|-------|-------|
| ERROR | Failures, exceptions |
| WARN | Degraded performance |
| INFO | Important events |
| DEBUG | Development info |

### 40.2 Implementation

```typescript
// lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
})
```

---

## 41. Backup & Recovery

### 41.1 Backup Schedule

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full | Daily | 30 days |
| Incremental | 4 hours | 7 days |
| Weekly | Weekly | 12 weeks |
| Monthly | Monthly | 12 months |

### 41.2 Backup Commands

```bash
# Full backup
pg_dump -Fc srsmatha > backup_$(date +%Y%m%d).dump

# Restore
pg_restore -Fc -d srsmatha backup_xxx.dump
```

---

## 42. Disaster Recovery

### 42.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO | 4 hours |
| RTO | 2 hours |

### 42.2 Recovery Steps

1. **Assess**: Determine failure scope
2. **Notify**: Alert stakeholders
3. **Restore**: Recover from backup
4. **Verify**: Test functionality
5. **Resume**: Return to service

---

## 43. Performance Optimization

### 43.1 Frontend Optimization

- Server Components by default
- Lazy load images with `next/image`
- Code splitting per route
- Minimize client components

### 43.2 Backend Optimization

- Database indexing
- Query optimization
- Caching layer
- Connection pooling

---

# Part IX: Troubleshooting

## 44. Common Issues

### 44.1 Login Issues

**Problem**: Cannot log in

**Solutions**:
1. Check email/password
2. Reset password
3. Verify email verification
4. Clear browser cache

### 44.2 Payment Issues

**Problem**: Payment failed

**Solutions**:
1. Check card validity
2. Verify bank authorization
3. Try different payment method
4. Contact bank

### 44.3 Booking Issues

**Problem**: Cannot see available slots

**Solutions**:
1. Check date is within booking window
2. Try different time slot
3. Contact for sold-out slots

---

## 45. Error Reference

### 45.1 HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Fix input |
| 401 | Unauthorized | Log in |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify ID |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

### 45.2 Application Errors

| Code | Meaning |
|------|---------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Session expired |
| VAL_001 | Validation failed |
| PAY_001 | Payment failed |
| PAY_002 | Refund failed |

---

## 46. Debug Procedures

### 46.1 Local Debugging

```bash
# Start dev server
npm run dev

# Enable debug logging
DEBUG=* npm run dev
```

### 46.2 Production Debugging

1. Check Sentry dashboard
2. Review Vercel logs
3. Check Supabase logs
4. Verify environment variables

---

# Part X: Appendices

## 47. Glossary

| Term | Definition |
|------|------------|
| RLS | Row Level Security - Database access control |
| RBAC | Role-Based Access Control |
| CSR | Client-Side Rendering |
| SSR | Server-Side Rendering |
| SSG | Static Site Generation |
| PWA | Progressive Web App |

---

## 48. Checklists

### 48.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] Monitoring enabled

### 48.2 Post-Deployment Checklist

- [ ] Health check passes
- [ ] Core functionality works
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Monitoring receiving data

---

## 49. Future Roadmap

### 49.1 Phase 7 - Enhanced Features

- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Video streaming
- [ ] Virtual tours

### 49.2 Phase 8 - Advanced Capabilities

- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Donor management CRM
- [ ] Volunteer coordination

### 49.3 Long-term Vision

- Multi-temple support
- Unified Madhva community platform
- Educational resources portal
- E-commerce for temple merchandise

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial release |

---

*This handbook is the authoritative reference for the SRS Math Portal. For questions or updates, contact the development team.*
