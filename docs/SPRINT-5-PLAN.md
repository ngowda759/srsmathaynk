# Phase 5 - Intelligent Temple Platform
## Sprint Plan (4 Implementation Phases)

---

## Executive Summary

This plan organizes the 8 sprints from Phase 5 into **4 focused implementation phases**, each completing multiple sprints and delivering tangible value:

| Phase | Focus | Sprints Covered | Duration |
|-------|-------|-----------------|----------|
| **Phase 5.1** | AI Foundation | 5.1 (Raya AI 2.0) | 2 weeks |
| **Phase 5.2** | Identity & Payments | 5.2 (Auth/RBAC) + 5.3 (Payments) | 2 weeks |
| **Phase 5.3** | Infrastructure | 5.4 (Notifications) + 5.5 (Media) + 5.6 (Search) | 2 weeks |
| **Phase 5.4** | Intelligence & Hardening | 5.7 (Reports) + 5.8 (Production) | 2 weeks |

---

## Phase 5.1: AI Foundation (Highest Priority)

### Sprint 5.1 — Raya AI 2.0
**Timeline:** 2 weeks  
**Goal:** Transform Raya AI from chatbot to intelligent temple assistant

### Features to Implement

#### 1. Hybrid Retrieval System
```
lib/ai/retrieval/
├── index.ts              # Unified retrieval orchestrator
├── knowledge.ts           # Knowledge base retrieval
├── events.ts             # Events retrieval
├── sevas.ts              # Sevas retrieval
├── documents.ts          # Documents retrieval
└── donations.ts          # Donations retrieval
```

**Implementation:**
- [ ] Create unified retrieval orchestrator that queries multiple sources
- [ ] Implement semantic search using embeddings (pgvector or OpenAI)
- [ ] Create fallback chain: Knowledge → Events → Sevas → Documents → Donations
- [ ] Add relevance scoring and result ranking

#### 2. Conversation Memory
```
services/
├── chat-session.service.ts   # Session management
└── chat-memory.service.ts   # Conversation context
```

**Implementation:**
- [ ] Replace Firebase chat sessions with Prisma storage
- [ ] Add session management API (`/api/chat/sessions`)
- [ ] Implement context window management (last N messages)
- [ ] Add session metadata (language, detected intent)

#### 3. Multi-Language Support (English/Kannada)
```
lib/ai/
├── languageDetector.ts    # Already exists - enhance it
├── translator.ts          # Add translation layer
└── prompts/
    ├── en.ts             # English prompts
    └── kn.ts             # Kannada prompts
```

**Implementation:**
- [ ] Enhance language detection to handle mixed content
- [ ] Add translation API for real-time content
- [ ] Create bilingual knowledge articles
- [ ] Update system prompts for Kannada responses

#### 4. Source Attribution
**Implementation:**
- [ ] Add source metadata to all retrievals
- [ ] Display source badges in chat responses
- [ ] Link to relevant pages (events, sevas, etc.)
- [ ] Track source usage in analytics

#### 5. Suggested Follow-up Questions
**Implementation:**
- [ ] Generate follow-ups based on conversation context
- [ ] Add "Related Questions" section
- [ ] Track follow-up effectiveness
- [ ] Admin configuration for default suggestions

#### 6. AI Analytics Dashboard
```
app/admin/ai/analytics/
├── page.tsx              # Analytics overview
├── conversations.tsx      # Conversation metrics
├── topics.tsx             # Topic analysis
└── feedback.tsx           # Feedback analysis
```

**Implementation:**
- [ ] Create conversation tracking table
- [ ] Add message-level analytics
- [ ] Implement satisfaction tracking
- [ ] Create usage reports (daily/weekly/monthly)

#### 7. Unknown Question Logging
```
services/
└── unknown-question.service.ts   # Log unanswerable questions
```

**Implementation:**
- [ ] Create unknown questions table
- [ ] Add admin review interface
- [ ] Implement "suggest answer" workflow
- [ ] Track resolution rate

#### 8. Confidence Scoring
**Implementation:**
- [ ] Add confidence score to AI responses
- [ ] Display confidence indicator (High/Medium/Low)
- [ ] Route low-confidence to human review
- [ ] Track accuracy over time

#### 9. Prompt Injection Protection
```
lib/ai/
├── sanitizer.ts           # Input sanitization
└── guard.ts               # Injection detection
```

**Implementation:**
- [ ] Sanitize user inputs
- [ ] Detect prompt injection patterns
- [ ] Log suspicious attempts
- [ ] Add rate limiting per session

#### 10. Feedback System ("Was this helpful?")
**Implementation:**
- [ ] Add thumbs up/down to responses
- [ ] Create feedback API
- [ ] Add optional comment field
- [ ] Track feedback trends

### Database Schema Updates (Prisma)
```prisma
// Chat Sessions - Replace Firebase
model ChatSession {
  id              String   @id @default(uuid())
  sessionId       String   @unique
  userId          String?
  userIp          String?
  language        String   @default("en")
  
  // Context
  messageCount    Int      @default(0)
  lastIntent      String?
  lastTopic       String?
  
  // Feedback
  helpfulCount    Int      @default(0)
  notHelpfulCount Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  messages        ChatMessage[]
  feedbacks       ChatFeedback[]
}

model ChatMessage {
  id           String     @id @default(uuid())
  sessionId    String
  session      ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  role         String     // "user", "assistant", "system"
  content      String     @db.Text
  contentKn    String?    @db.Text  // Kannada translation
  
  // Metadata
  model        String?
  latency      Int?       // milliseconds
  tokens       Int?
  confidence    Float?     // 0.0 - 1.0
  
  // Sources used for response
  sources      Json?      // Array of source objects
  
  // Language detection
  detectedLang String?
  
  createdAt    DateTime   @default(now())
  
  feedbacks    ChatFeedback[]
  @@index([sessionId])
}

model UnknownQuestion {
  id           String   @id @default(uuid())
  sessionId    String?
  question     String   @db.Text
  questionKn   String?  @db.Text
  language     String   @default("en")
  
  // Context
  intent       String?
  topic        String?
  
  // Resolution
  status       String   @default("pending")  // pending, reviewed, answered
  reviewedBy   String?
  reviewedAt   DateTime?
  suggestedAnswer String? @db.Text
  
  createdAt    DateTime @default(now())
  
  @@index([status])
  @@index([createdAt])
}
```

### API Endpoints
```
POST   /api/chat                  # Existing - enhance with retrieval
GET    /api/chat/sessions         # List user sessions
GET    /api/chat/sessions/:id     # Get session with messages
POST   /api/chat/sessions         # Create new session
DELETE /api/chat/sessions/:id     # Delete session

POST   /api/chat/feedback         # Submit feedback
GET    /api/chat/analytics        # Get AI analytics (admin)
GET    /api/chat/unknown-questions # Get unknown questions (admin)
PATCH  /api/chat/unknown-questions/:id # Update question status
```

### Deliverables Checklist
- [ ] Hybrid retrieval system functional
- [ ] Session management working
- [ ] Bilingual support (EN/KN)
- [ ] Source attribution in responses
- [ ] Analytics dashboard accessible
- [ ] Unknown questions logged and reviewable
- [ ] Confidence scoring implemented
- [ ] Prompt injection protection active
- [ ] Feedback system operational
- [ ] All tests passing

---

## Phase 5.2: Identity & Payments

### Sprint 5.2 — Authentication & RBAC
**Timeline:** 1.5 weeks

#### Authentication Features

##### Email/Password (Already implemented)
- [x] Registration flow
- [x] Login flow
- [x] Session management

##### Google Sign-In
```typescript
// services/auth/google.ts
services/auth.service.ts  // Add Google OAuth methods
```

**Implementation:**
- [ ] Add Google OAuth to Supabase
- [ ] Create Google sign-in button
- [ ] Handle OAuth callback
- [ ] Link Google account to existing account
- [ ] Update auth service

##### Password Reset (Partially implemented)
**Implementation:**
- [ ] Complete password reset flow
- [ ] Add email templates
- [ ] Add reset rate limiting
- [ ] Add password strength validation

##### Email Verification
**Implementation:**
- [ ] Add email verification flow
- [ ] Create verification email template
- [ ] Add verified badge in profile
- [ ] Require verification for certain actions

##### Session Management
**Implementation:**
- [ ] Implement JWT refresh tokens
- [ ] Add session list in profile
- [ ] Add "logout all devices" feature
- [ ] Track login history

#### RBAC Implementation

##### Role Hierarchy (Already defined)
```typescript
// types/user.ts - Already has roles
type UserRole = "DEVOTEE" | "VOLUNTEER" | "PRIEST" | "STAFF" | "ADMIN" | "SUPER_ADMIN"
```

##### Permission Matrix
| Permission | Super Admin | Admin | Staff | Priest | Volunteer | Devotee |
|------------|-------------|-------|-------|--------|-----------|---------|
| manage_users | ✓ | | | | | |
| manage_settings | ✓ | | | | | |
| manage_content | ✓ | ✓ | | | | |
| manage_events | ✓ | ✓ | ✓ | | | |
| manage_sevas | ✓ | ✓ | ✓ | ✓ | | |
| manage_donations | ✓ | ✓ | | | | |
| manage_gallery | ✓ | ✓ | ✓ | | | |
| view_reports | ✓ | ✓ | | | | |
| manage_billing | ✓ | | | | | |
| access_admin | ✓ | ✓ | ✓ | ✓ | | |
| access_dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | |

##### Route Guards
```
middleware.ts  // Add role-based access control
```

**Implementation:**
- [ ] Add role-based middleware
- [ ] Protect admin routes
- [ ] Add role-based component rendering
- [ ] Implement API authorization

##### Audit Logs
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String
  entityType  String?
  entityId    String?
  oldData     Json?
  newData     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

**Implementation:**
- [ ] Create audit log service
- [ ] Log all admin actions
- [ ] Add audit log viewer in admin
- [ ] Export audit reports

##### Login History
```prisma
model LoginHistory {
  id        String   @id @default(uuid())
  userId    String
  ipAddress String?
  userAgent String?
  success   Boolean
  createdAt DateTime @default(now())
}
```

**Implementation:**
- [ ] Track login attempts
- [ ] Display login history in profile
- [ ] Add suspicious login alerts
- [ ] Admin view of all login history

---

### Sprint 5.3 — Payments (Razorpay Integration)
**Timeline:** 0.5 weeks (parallel with 5.2)

#### Razorpay Integration
```typescript
services/
├── payment.service.ts      # Payment orchestration
├── razorpay.service.ts     # Razorpay API wrapper
└── payment-webhook.service.ts  # Webhook handler
```

**Implementation:**
1. **Donations Integration**
   - [ ] Add Razorpay payment page
   - [ ] Implement payment gateway
   - [ ] Add UPI/Card/Wallet support
   - [ ] Custom amount option

2. **Seva Bookings Integration**
   - [ ] Add payment to booking flow
   - [ ] Partial payment support
   - [ ] Booking confirmation after payment

3. **Payment Verification**
   - [ ] Server-side signature verification
   - [ ] Idempotency handling
   - [ ] Duplicate detection

4. **Webhooks**
   ```typescript
   // app/api/webhooks/razorpay/route.ts
   ```
   - [ ] Handle payment.success
   - [ ] Handle payment.failed
   - [ ] Handle refund.created
   - [ ] Idempotency guards

5. **Refund Workflow**
   - [ ] Admin refund request form
   - [ ] Partial/full refund support
   - [ ] Refund status tracking
   - [ ] Automatic receipts

6. **Automatic Receipts**
   ```services/
   └── receipt.service.ts
   ```
   - [ ] Generate receipt on payment success
   - [ ] 80G certificate generation
   - [ ] Email receipt delivery
   - [ ] Downloadable PDF

### Database Updates
```prisma
model Payment {
  id              String   @id @default(uuid())
  donationId      String?
  bookingId       String?
  
  razorpayId      String   @unique
  orderId         String?
  
  amount          Decimal
  currency        String   @default("INR")
  
  status          PaymentStatus
  method          String?
  
  // Verification
  signature       String?
  verified        Boolean  @default(false)
  
  // Refund
  refunded        Boolean  @default(false)
  refundId        String?
  refundAmount    Decimal?
  refundReason    String?
  
  // Receipt
  receiptNumber   String?
  receiptUrl      String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PaymentStatus {
  CREATED
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

---

## Phase 5.3: Infrastructure

### Sprint 5.4 — Notifications
**Timeline:** 1 week

#### Unified Notification Service
```
services/
├── notification.service.ts     # Main notification orchestrator
├── channels/
│   ├── email.service.ts        # Email notifications
│   ├── sms.service.ts          # SMS (future)
│   ├── whatsapp.service.ts     # WhatsApp (future)
│   └── push.service.ts         # Browser push notifications
└── templates/
    ├── booking-confirmation.ts
    ├── donation-receipt.ts
    ├── event-reminder.ts
    └── volunteer-assignment.ts
```

#### Notification Events
| Event | Channels | Template |
|-------|----------|----------|
| Booking Confirmation | Email, SMS, Push | booking-confirmation |
| Donation Receipt | Email, SMS | donation-receipt |
| Event Reminder | Email, Push | event-reminder |
| Volunteer Assignment | Email | volunteer-assignment |
| Admin Alert | Email | admin-alert |
| Seva Reminder | Email, Push | seva-reminder |

#### Implementation
1. **Email Service**
   - [ ] Integrate with Resend/SendGrid
   - [ ] Create email templates
   - [ ] Add unsubscribe management
   - [ ] Track open/click rates

2. **Push Notifications**
   - [ ] Service worker setup
   - [ ] Permission request flow
   - [ ] Push notification API
   - [ ] Notification preferences

3. **SMS/WhatsApp (Placeholders)**
   - [ ] Stub services for future integration
   - [ ] Twilio configuration ready
   - [ ] WhatsApp Business API setup guide

4. **Admin Interface**
   ```
   app/admin/notifications/
   ├── page.tsx           # Notification history
   ├── settings.tsx        # Notification preferences
   └── templates.tsx       # Template management
   ```

---

### Sprint 5.5 — Media & Storage
**Timeline:** 1 week

#### Supabase Storage Integration
```typescript
services/
├── storage.service.ts       # Main storage service
└── image.service.ts          # Image optimization
```

**Implementation:**

1. **Storage Setup**
   - [ ] Configure Supabase buckets
   - [ ] Set up RLS policies
   - [ ] Create upload endpoints
   - [ ] Add CORS configuration

2. **Image Optimization**
   - [ ] Implement Sharp for server-side processing
   - [ ] Generate multiple sizes (thumb, small, medium, large)
   - [ ] WebP conversion
   - [ ] Quality optimization

3. **Album Uploads**
   ```typescript
   // services/gallery-upload.service.ts
   ```
   - [ ] Bulk upload support
   - [ ] Progress tracking
   - [ ] Error handling
   - [ ] Duplicate detection

4. **Video Support**
   - [ ] Video upload with size limits
   - [ ] Thumbnail generation
   - [ ] Streaming support
   - [ ] Progress tracking

5. **CDN Caching**
   - [ ] Configure CDN headers
   - [ ] Cache invalidation
   - [ ] Cache-Control settings

6. **Automatic Thumbnails**
   - [ ] Image thumbnail generation
   - [ ] Video thumbnail extraction
   - [ ] Album cover auto-selection

### Database Updates
```prisma
model Media {
  id            String   @id @default(uuid())
  
  // Existing fields...
  
  // Optimization
  thumbnailUrl  String?
  optimizedUrl  String?
  
  // Metadata
  width         Int?
  height        Int?
  duration      Float?   // For videos
  colors        String[] // Dominant colors
  
  // CDN
  cdnUrl        String?
  cacheValidUntil DateTime?
  
  // Processing status
  processed     Boolean  @default(false)
  processingStatus String?  // pending, processing, completed, failed
}
```

---

### Sprint 5.6 — Search
**Timeline:** 1 week (parallel with 5.4-5.5)

#### Global Search Implementation
```
app/
├── api/
│   └── search/
│       └── route.ts          # Unified search API
└── (public)/
    └── search/
        └── page.tsx          # Search interface
```

#### Search Features

1. **Cross-Module Search**
   - [x] Knowledge articles (existing)
   - [ ] Events search
   - [ ] Sevas search
   - [ ] Documents search
   - [ ] Gallery search
   - [ ] Announcements search

2. **Search Interface**
   ```typescript
   // components/search/
   ├── SearchBar.tsx
   ├── SearchResults.tsx
   ├── SearchFilters.tsx
   └── SearchSuggestions.tsx
   ```
   - [ ] Autocomplete dropdown
   - [ ] Category filters
   - [ ] Date range filters
   - [ ] Relevance sorting
   - [ ] Pagination

3. **Kannada Search Support**
   - [ ] Full-text search on Kannada fields
   - [ ] Phonetic matching for common queries
   - [ ] Transliteration support (kn → en)

4. **Performance**
   - [ ] Search caching
   - [ ] Debounced input
   - [ ] Lazy loading results
   - [ ] Search analytics

#### Search API
```typescript
// GET /api/search?q=query&modules=articles,events&limit=20&offset=0

interface SearchResult {
  modules: {
    articles?: KnowledgeArticleRecord[]
    events?: EventRecord[]
    sevas?: SevaRecord[]
    documents?: DocumentRecord[]
    gallery?: GalleryItemRecord[]
    announcements?: AnnouncementRecord[]
  }
  total: number
  query: string
  suggestions: string[]
}
```

---

## Phase 5.4: Intelligence & Hardening

### Sprint 5.7 — Reports & Analytics
**Timeline:** 1 week

#### Admin Dashboard Enhancements

```
app/admin/reports/
├── page.tsx                    # Main dashboard
├── donations.tsx               # Donation analytics
├── bookings.tsx                # Booking analytics
├── volunteers.tsx              # Volunteer activity
├── documents.tsx               # Document downloads
├── gallery.tsx                # Gallery engagement
├── ai-usage.tsx               # AI usage metrics
└── users.tsx                  # User growth
```

#### Metrics to Implement

1. **Donation Trends**
   - [ ] Daily/weekly/monthly totals
   - [ ] Campaign performance
   - [ ] Payment method breakdown
   - [ ] Donor retention

2. **Booking Analytics**
   - [ ] Seva booking trends
   - [ ] Peak times
   - [ ] Cancellation rates
   - [ ] Revenue by service

3. **Volunteer Activity**
   - [ ] Hours contributed
   - [ ] Tasks completed
   - [ ] Event participation
   - [ ] Availability trends

4. **Document Downloads**
   - [ ] Download counts per document
   - [ ] Popular categories
   - [ ] Time-of-day patterns

5. **Gallery Engagement**
   - [ ] View counts
   - [ ] Most viewed albums
   - [ ] Photo interactions

6. **AI Usage Metrics**
   - [ ] Conversation counts
   - [ ] Response times
   - [ ] Satisfaction rates
   - [ ] Top queries

7. **User Growth**
   - [ ] New registrations
   - [ ] Active users
   - [ ] User retention
   - [ ] Role distribution

#### Data Visualization
- [ ] Charts (Recharts or similar)
- [ ] Date range pickers
- [ ] Export to CSV/PDF
- [ ] Scheduled reports via email

---

### Sprint 5.8 — Production Hardening
**Timeline:** 1 week

#### Performance Optimization
```typescript
// optimizations/
├── cache.service.ts         # Redis/memory caching
├── query.service.ts         # Database query optimization
└── bundle.service.ts        # Bundle analysis
```

**Implementation:**
- [ ] Implement Redis caching for Panchanga
- [ ] Database query optimization (indexes, joins)
- [ ] Image lazy loading
- [ ] Code splitting
- [ ] Bundle size monitoring

#### Security Review
```
lib/security/
├── csrf.ts                  # CSRF protection
├── xss.ts                   # XSS sanitization
├── headers.ts               # Security headers
└── rate-limit.ts            # Advanced rate limiting
```

**Implementation:**
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] CSRF token implementation
- [ ] Input sanitization audit
- [ ] SQL injection prevention
- [ ] API rate limiting per user
- [ ] Brute force protection

#### Accessibility (WCAG)
```typescript
// components/a11y/
├── SkipLinks.tsx
├── ARIALabels.tsx
└── FocusManagement.tsx
```

**Implementation:**
- [ ] Keyboard navigation audit
- [ ] Screen reader testing
- [ ] Color contrast compliance
- [ ] Focus indicators
- [ ] Skip navigation links
- [ ] ARIA labels

#### SEO
```typescript
// app/(public)/
├── sitemap.xml/route.ts
└── robots.txt/route.ts
```

**Implementation:**
- [ ] Sitemap generation
- [ ] robots.txt
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] JSON-LD structured data
- [ ] Canonical URLs

#### Health Checks
```typescript
// app/api/health/route.ts
```

**Implementation:**
- [ ] Database connectivity
- [ ] Supabase status
- [ ] AI provider status
- [ ] Storage status
- [ ] Response time monitoring

#### Backups
**Implementation:**
- [ ] Database backup schedule
- [ ] Media backup strategy
- [ ] Backup verification
- [ ] Recovery procedures

#### Monitoring
```typescript
// services/
├── logger.service.ts
├── metrics.service.ts
└── alerting.service.ts
```

**Implementation:**
- [ ] Structured logging
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert configurations

#### Rate Limiting
**Implementation:**
- [ ] Per-IP rate limiting
- [ ] Per-user rate limiting
- [ ] API-specific limits
- [ ] Rate limit headers

#### Error Tracking
**Implementation:**
- [ ] Sentry integration
- [ ] Custom error boundaries
- [ ] Error logging
- [ ] Alert on errors

---

## Implementation Timeline

```
Week 1-2:   Phase 5.1 - AI Foundation
            ├── Hybrid Retrieval
            ├── Session Management
            ├── Multi-language
            ├── Analytics
            └── Security

Week 3-4:   Phase 5.2 - Auth/RBAC + 5.3 - Payments
            ├── Google Sign-In
            ├── Email Verification
            ├── Audit Logs
            ├── Razorpay Integration
            └── Receipt Generation

Week 5-6:   Phase 5.3 - Notifications + Media + Search
            ├── Notification Service
            ├── Email/Push
            ├── Storage Optimization
            ├── Global Search
            └── Kannada Support

Week 7-8:   Phase 5.4 - Reports + Hardening
            ├── Analytics Dashboard
            ├── Performance
            ├── Security Audit
            ├── Accessibility
            └── Monitoring
```

---

## Branch Strategy

```bash
# Feature branches
feature/sprint-5.1-ai-retrieval
feature/sprint-5.1-ai-sessions
feature/sprint-5.1-ai-analytics
feature/sprint-5.2-auth-google
feature/sprint-5.2-rbac-audit
feature/sprint-5.3-razorpay
feature/sprint-5.4-notifications
feature/sprint-5.5-media-storage
feature/sprint-5.6-global-search
feature/sprint-5.7-reports
feature/sprint-5.8-hardening

# Merge to integration branch
git checkout develop
git merge feature/sprint-5.1-ai-retrieval
# ... after testing
git tag -a v5.1.0 -m "Phase 5.1 Complete"
```

---

## Testing Requirements

For each phase, ensure:

1. **Unit Tests**
   - Service methods
   - Utility functions
   - Type validations

2. **Integration Tests**
   - API endpoints
   - Database operations
   - External services

3. **E2E Tests (Playwright)**
   - Critical user flows
   - Admin operations
   - Payment flows

4. **Manual Testing**
   - AI conversation testing
   - Payment flow testing
   - Notification delivery

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@prisma/extension-uuid": "^1.0.0",
    "razorpay": "^2.9.0",
    "resend": "^3.0.0",
    "sharp": "^0.33.0",
    "recharts": "^2.12.0",
    "sentry": "^7.0.0"
  }
}
```

---

## Environment Variables Required

```env
# Phase 5.1 - AI
AI_EMBEDDING_MODEL=text-embedding-3-small
VECTOR_STORE=pgvector

# Phase 5.2 - Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Phase 5.3 - Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Phase 5.4 - Notifications
RESEND_API_KEY=
EMAIL_FROM=noreply@srsmathaynk.org

# Phase 5.5 - Storage
# (Supabase already configured)

# Phase 5.8 - Monitoring
SENTRY_DSN=
```

---

## Success Criteria

### Phase 5.1
- [ ] AI responds with context-aware answers
- [ ] Sessions persist across visits
- [ ] Kannada queries answered correctly
- [ ] Analytics show real data
- [ ] Unknown questions logged

### Phase 5.2
- [ ] Google sign-in works
- [ ] All roles have correct permissions
- [ ] Audit logs capture all admin actions
- [ ] Login history viewable

### Phase 5.3
- [ ] Payments complete successfully
- [ ] Webhooks handled correctly
- [ ] Refunds process properly
- [ ] Receipts generated and emailed

### Phase 5.4
- [ ] Search finds relevant content
- [ ] Notifications deliver reliably
- [ ] Images optimized automatically
- [ ] Reports generate correctly

### Phase 5.5
- [ ] All pages load < 2s
- [ ] No security vulnerabilities
- [ ] WCAG AA compliant
- [ ] Health checks pass

---

## Notes

1. **Firebase Removal**: The chat service currently has Firebase stubs. These should be fully replaced with Prisma implementations in Phase 5.1.

2. **Existing RBAC**: The RBAC system is partially implemented. Phase 5.2 should complete it with route guards and audit logs.

3. **Donation Service**: Already has a good foundation. Phase 5.3 adds the payment gateway layer.

4. **Knowledge Base**: Already exists and powers the AI. Phase 5.1 enhances it with semantic search.

5. **Testing**: Use the existing Playwright setup for E2E tests.

---

*Last Updated: 2026-07-29*
*Version: 1.1*

---

## Completion Status

### Phase 5.1: AI Foundation ✅ COMPLETE
- [x] Hybrid Retrieval System
- [x] Session Management
- [x] Multi-language Support (EN/KN)
- [x] Analytics Dashboard

### Phase 5.2: Identity & Payments ✅ COMPLETE
- [x] Google Sign-In
- [x] Email Verification
- [x] Audit Logging
- [x] RBAC Middleware
- [x] Razorpay Integration

### Phase 5.3: Infrastructure ✅ COMPLETE
- [x] Notification Service (Email/Push)
- [x] Email Templates
- [x] Image Optimization (Sharp)
- [x] Responsive Images
- [x] Global Search
- [x] Search Suggestions

### Phase 5.4: Intelligence & Hardening 🔄 IN PROGRESS
- [x] Reports Dashboard (Sprint 5.7)
  - [x] Donation Analytics Service
  - [x] Booking Analytics Service
  - [x] Analytics API
  - [x] Admin Dashboard UI
- [ ] Performance Optimization (Sprint 5.8)
- [ ] Security Review
- [ ] Accessibility Audit
- [ ] Monitoring & Alerts
