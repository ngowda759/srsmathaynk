# Entity Relationship Diagram - Sri Raghavendra Swamy Temple

## Overview

This document describes the complete database design for the Sri Raghavendra Swamy Temple Portal. The database is built using PostgreSQL with Prisma ORM.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                       │
│  │    Profile        │         │  UserSession     │                       │
│  ├──────────────────┤         ├──────────────────┤                       │
│  │ PK id             │──┐      │ PK id             │                      │
│  │    userId (FK)    │  │      │ FK profileId ─────┼──┐                   │
│  │    email          │  │      │    sessionToken   │  │                   │
│  │    name           │  │      │    deviceInfo     │  │                   │
│  │    role           │  │      │    ipAddress      │  │                   │
│  │    phone          │  │      │    expiresAt      │  │                   │
│  │    avatarUrl      │  │      └──────────────────┘  │                   │
│  │    isActive       │  │                            │                   │
│  └──────────────────┘  │                            │                   │
│         │              │                            │                   │
│         │ 1:N          │                            │                   │
│         ▼              │                            │                   │
│  ┌──────────────────┐  │      ┌──────────────────┐  │                   │
│  │  Donation         │  │      │  SevaBooking     │  │                   │
│  ├──────────────────┤  │      ├──────────────────┤  │                   │
│  │ PK id             │  │      │ PK id             │  │                   │
│  │ FK userId ─────────┼──┘      │ FK userId ─────────┼──┘                │
│  │ FK campaignId ─────┼─────────│ FK sevaId         │                   │
│  │    amount         │         │    bookingDate    │                   │
│  │    donorName      │         │    status         │                   │
│  │    status         │         │    amount         │                   │
│  │    anonymous      │         └──────────────────┘                   │
│  └──────────────────┘              │                                  │
│         │                           │                                  │
│         │ 1:N                       │ N:1                              │
│         ▼                           ▼                                  │
│  ┌──────────────────┐      ┌──────────────────┐                       │
│  │ DonationCampaign  │      │      Seva        │                       │
│  ├──────────────────┤      ├──────────────────┤                       │
│  │ PK id             │      │ PK id             │                       │
│  │    title          │      │    name           │                       │
│  │    description    │      │    description    │                       │
│  │    targetAmount   │      │    price          │                       │
│  │    raisedAmount   │      │    duration       │                       │
│  │    active         │      │    category       │                       │
│  │    urgencyLevel   │      │    active         │                       │
│  └──────────────────┘      └──────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTENT MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐  │
│  │    Event         │      │ Announcement     │      │    Festival     │  │
│  ├──────────────────┤      ├──────────────────┤      ├──────────────────┤  │
│  │ PK id             │      │ PK id             │      │ PK id             │  │
│  │    title          │      │    title          │      │    name          │  │
│  │    description    │      │    content        │      │    date          │  │
│  │    startDate      │      │    type          │      │    description   │  │
│  │    endDate        │      │    priority      │      │    isMajorFest   │  │
│  │    location       │      │    isPinned      │      └──────────────────┘  │
│  │    type           │      │    expiresAt     │                           │
│  │    status         │      └──────────────────┘                           │
│  │    featured       │              │                                      │
│  │    published     │              │ N:1                                  │
│  └────────┬─────────┘              ▼                                      │
│           │ 1:N              ┌──────────────────┐                         │
│           ▼                  │    Profile       │                         │
│  ┌──────────────────┐        │ (Author)         │                         │
│  │  EventBooking    │        └──────────────────┘                         │
│  ├──────────────────┤                                                       │
│  │ PK id             │        ┌──────────────────┐                         │
│  │ FK eventId        │        │   GalleryItem   │                         │
│  │    attendeeName  │        ├──────────────────┤                         │
│  │    attendeeEmail  │        │ PK id             │                         │
│  │    tickets       │        │ FK eventId        │────┐                   │
│  │    status        │        │    title          │    │                   │
│  └──────────────────┘        │    src           │    │                   │
│                              │    type          │    │                   │
│                              │    category      │    │                   │
│                              │    featured      │    │ 1:N               │
│                              │    active        │    │                   │
│                              └──────────────────┘    │                   │
│                                                        ▼                   │
│  ┌──────────────────┐      ┌──────────────────┐ ┌──────────────┐          │
│  │   Panchanga       │      │  PoojaSchedule   │ │     Event    │          │
│  ├──────────────────┤      ├──────────────────┤ └──────────────┘          │
│  │ PK id             │      │ PK id             │                         │
│  │    date (unique)  │      │    name           │                         │
│  │    tithi          │      │    time           │                         │
│  │    nakshatra      │      │    description    │                         │
│  │    yoga           │      │    category       │                         │
│  │    karana         │      │    active         │                         │
│  │    sunrise        │      │    order          │                         │
│  │    sunset         │      └──────────────────┘                         │
│  │    moonPhase      │                                                       │
│  └──────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SETTINGS & CONFIGURATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐                            │
│  │  TempleSettings  │      │HomepageSettings │                            │
│  ├──────────────────┤      ├──────────────────┤                            │
│  │ PK id             │      │ PK id             │                         │
│  │    templeName     │      │    heroTitle      │                          │
│  │    address        │      │    heroSubtitle   │                          │
│  │    city           │      │    aboutTitle    │                          │
│  │    state          │      │    aboutContent  │                          │
│  │    phone          │      │    showFlags...  │                          │
│  │    email          │      └──────────────────┘                          │
│  │    mapEmbedUrl    │                                                       │
│  │    bankDetails... │      ┌──────────────────┐                           │
│  │    socialLinks... │      │  TempleTiming    │                           │
│  └──────────────────┘      ├──────────────────┤                           │
│                            │ PK dayOfWeek      │                           │
│  ┌──────────────────┐      │    openTime      │                           │
│  │   TrustMember    │      │    closeTime     │                           │
│  ├──────────────────┤      │    isHoliday     │                           │
│  │ PK id             │      └──────────────────┘                           │
│  │    name           │                                                       │
│  │    designation    │                                                       │
│  │    bio            │                                                       │
│  │    imageUrl       │                                                       │
│  │    type           │       ┌──────────────────┐                            │
│  │    isPontiff      │       │    Facility      │                            │
│  │    active         │       ├──────────────────┤                            │
│  └──────────────────┘       │ PK id             │                           │
│                             │    name           │                           │
│  ┌──────────────────┐       │    description    │                          │
│  │   FuturePlan     │       │    icon           │                           │
│  ├──────────────────┤       │    isActive       │                           │
│  │ PK id             │       └──────────────────┘                           │
│  │    title          │                                                       │
│  │    description    │                                                       │
│  │    targetAmount   │                                                       │
│  │    status         │                                                       │
│  │    isActive       │                                                       │
│  └──────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI KNOWLEDGE BASE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐      ┌─────────────────────────────┐       │
│  │   AIKnowledgeCategory       │      │   AIKnowledgeArticle       │       │
│  ├─────────────────────────────┤      ├─────────────────────────────┤       │
│  │ PK id                        │ 1:N │ PK id                        │       │
│  │    name                      ├─────│ FK categoryId                │       │
│  │    description               │      │    question                 │       │
│  │    icon                      │      │    answer (TEXT)            │       │
│  │    active                    │      │    keywords[]               │       │
│  └─────────────────────────────┘      │    priority                 │       │
│                                       │    viewCount                │       │
│                                       │    helpfulCount             │       │
│                                       └─────────────┬───────────────┘       │
│                                                     │                       │
│                                                     │ 1:N                   │
│                                                     ▼                       │
│                                       ┌─────────────────────────────┐       │
│                                       │    AIChatFeedback          │       │
│                                       ├─────────────────────────────┤       │
│                                       │ PK id                        │       │
│                                       │ FK articleId                  │       │
│                                       │ FK userId                    │       │
│                                       │    rating                    │       │
│                                       │    isHelpful                 │       │
│                                       │    comment                  │       │
│                                       │    userQuery                │       │
│                                       └─────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENGAGEMENT & FEEDBACK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐                           │
│  │   Testimonial   │      │ContactEnquiry   │                            │
│  ├──────────────────┤      ├──────────────────┤                            │
│  │ PK id             │      │ PK id             │                         │
│  │ FK userId         │      │    name          │                          │
│  │    name           │      │    email         │                          │
│  │    location       │      │    phone        │                           │
│  │    content        │      │    subject      │                           │
│  │    rating         │      │    message      │                           │
│  │    isApproved     │      │    category     │                           │
│  │    isFeatured     │      │    status       │                           │
│  │    isPublished    │      │    response     │                           │
│  └──────────────────┘      └──────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tables Summary

### User Management

| Table | Description | Relations |
|-------|-------------|-----------|
| `Profile` | User profiles linked to Supabase Auth | 1:N → Donation, SevaBooking, Testimonial, AIChatFeedback |
| `UserSession` | Session tracking | N:1 → Profile |

### Temple Settings

| Table | Description | Relations |
|-------|-------------|-----------|
| `TempleSettings` | Temple info, contact, bank details | - |
| `HomepageSettings` | Homepage configuration | - |
| `TempleTiming` | Daily opening hours | - |
| `TrustMember` | Committee/pontiff members | - |
| `Staff` | Temple staff | - |

### Content Management

| Table | Description | Relations |
|-------|-------------|-----------|
| `Announcement` | Temple announcements | N:1 → Profile (author) |
| `Event` | Temple events | 1:N → EventBooking, GalleryItem |
| `EventBooking` | Event registrations | N:1 → Event |
| `Festival` | Festival calendar | - |
| `GalleryItem` | Photos/videos | N:1 → Event (optional) |

### Services & Bookings

| Table | Description | Relations |
|-------|-------------|-----------|
| `Seva` | Service offerings | 1:N → SevaBooking |
| `SevaBooking` | Seva registrations | N:1 → Profile, Seva |

### Donations

| Table | Description | Relations |
|-------|-------------|-----------|
| `DonationCampaign` | Fundraising campaigns | 1:N → Donation |
| `Donation` | Individual donations | N:1 → Profile, DonationCampaign |

### AI Knowledge Base

| Table | Description | Relations |
|-------|-------------|-----------|
| `AIKnowledgeCategory` | Knowledge categories | 1:N → AIKnowledgeArticle |
| `AIKnowledgeArticle` | Q&A articles | 1:N → AIChatFeedback |
| `AIChatFeedback` | User feedback on AI | N:1 → AIKnowledgeArticle, Profile |

### Engagement

| Table | Description | Relations |
|-------|-------------|-----------|
| `Testimonial` | Devotee testimonials | N:1 → Profile (optional) |
| `ContactEnquiry` | Contact form submissions | - |

### Utility

| Table | Description | Relations |
|-------|-------------|-----------|
| `Facility` | Temple facilities | - |
| `Amenity` | Available amenities | - |
| `FuturePlan` | Development plans | - |
| `Panchanga` | Daily calendar data | - |
| `PoojaSchedule` | Daily pooja timings | - |
| `EmailLog` | Email tracking | - |
| `AuditLog` | Activity logs | - |

---

## Enums Summary

### UserRole
- `DEVOTEE` - Regular user
- `VOLUNTEER` - Temple volunteer
- `PRIEST` - Temple priest
- `STAFF` - Temple staff
- `ADMIN` - Administrator
- `SUPER_ADMIN` - Super administrator

### EventType
- `GENERAL`
- `FESTIVAL`
- `WORKSHOP`
- `SPIRITUAL`
- `CULTURAL`
- `MAINTENANCE`

### EventStatus
- `UPCOMING`
- `ONGOING`
- `COMPLETED`
- `CANCELLED`

### BookingStatus
- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`

### DonationStatus
- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

### PaymentMethod
- `CARD`
- `UPI`
- `NET_BANKING`
- `WALLET`
- `BANK_TRANSFER`
- `CASH`
- `CHEQUE`

### AnnouncementType
- `GENERAL`
- `EVENT`
- `DONATION`
- `FESTIVAL`
- `MAINTENANCE`
- `URGENT`

### Priority
- `LOW`
- `NORMAL`
- `HIGH`
- `URGENT`

### MemberType
- `PONTIFF`
- `TRUSTEE`
- `MEMBER`
- `SECRETARY`
- `STAFF`
- `PRIEST`

### PlanStatus
- `PLANNING`
- `APPROVED`
- `IN_PROGRESS`
- `COMPLETED`
- `ON_HOLD`

### EnquiryCategory
- `GENERAL`
- `SEVA`
- `DONATION`
- `EVENT`
- `VISIT`
- `COMPLAINT`
- `FEEDBACK`

### EnquiryStatus
- `NEW`
- `IN_PROGRESS`
- `RESPONDED`
- `CLOSED`
- `SPAM`

---

## Indexes

Key indexes for performance optimization:

```sql
-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Events
CREATE INDEX idx_events_start_date ON events(start_date, published);
CREATE INDEX idx_events_status ON events(status);

-- Seva Bookings
CREATE INDEX idx_seva_bookings_user_date ON seva_bookings(user_id, booking_date);
CREATE INDEX idx_seva_bookings_seva_date ON seva_bookings(seva_id, booking_date);
CREATE INDEX idx_seva_bookings_status ON seva_bookings(status);

-- Donations
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(status, created_at);

-- Gallery
CREATE INDEX idx_gallery_type ON gallery_items(type, active);
CREATE INDEX idx_gallery_category ON gallery_items(category, active);

-- Panchanga
CREATE INDEX idx_panchangas_date ON panchangas(date);

-- Festivals
CREATE INDEX idx_festivals_date ON festivals(date);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## Migration Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (without migrations)
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```
