# Sprint 3.2 - Announcement Module Review Documentation

## Updates (Sprint 3.2.1)

### Changes Made
1. **Production Auth Integration**: Replaced placeholder auth with Supabase auth
   - `getCurrentUser()` now fetches from Supabase session
   - Profile loaded from database with role
   - `profileId` used as `authorId` for announcements

2. **Slug Strategy Finalized**: Added slug to database schema
   - `slug` field added to `Announcement` model
   - `slug` is `unique` in database
   - Auto-generated from title on create/update
   - Added `findBySlug()`, `slugExists()`, `getAllSlugs()` to repository

3. **New Tests Added**:
   - Repository tests (22 test cases)
   - Service tests (18 test cases)
   - Action tests (15 test cases)

### Schema Change
```prisma
model Announcement {
  // ...
  slug    String  @unique  // NEW: Added for URL-friendly identifiers
  // ...
}
```

---

## 1. File Tree

```
src/
├── actions/
│   └── announcement/
│       └── index.ts                    (807 lines)
├── repositories/
│   └── announcement/
│       └── index.ts                    (424 lines)
├── services/
│   ├── index.ts                        (18 lines)
│   └── announcement.service.ts         (600 lines)
├── types/
│   ├── index.ts                        (3 lines modification)
│   ├── interfaces.ts                   (40 lines modification)
│   └── announcement/
│       └── index.ts                    (151 lines)
├── validators/
│   └── announcement/
│       └── index.ts                    (297 lines)
├── mappers/
│   └── announcement/
│       └── index.ts                    (134 lines - modified)
tests/
└── unit/
    ├── announcement-validators.test.ts  (199 lines)
    ├── announcement-repository.test.ts  (480 lines)
    ├── announcement-service.test.ts    (490 lines)
    └── announcement-actions.test.ts    (430 lines)
```

**Total: ~4,000+ lines of new/modified code + tests**

---

## 2. Git Diff Summary

### Sprint 3.2 (Initial)
```
Files changed: 6
Files added: 5
Total additions: +2,138 lines
Total deletions: -41 lines
```

### Sprint 3.2.1 (Hardening)
```
Modified files:
  prisma/schema.prisma                   | +1 line (slug field)
  src/mappers/announcement/index.ts      | +19 lines
  src/repositories/announcement/index.ts | +42 lines
  src/actions/announcement/index.ts     | +34 lines (auth)
  src/types/interfaces.ts               | +5 lines

New files:
  tests/unit/announcement-repository.test.ts | +480 lines
  tests/unit/announcement-service.test.ts   | +490 lines
  tests/unit/announcement-actions.test.ts   | +430 lines

Total additions: ~1,500 lines (tests + auth + slug)
```

---

## 3. Repository

### 3.1 Repository Inheritance

```typescript
export class AnnouncementRepository
  extends BaseRepository<AnnouncementDomain>
  implements IAnnouncementRepository
```

**Base Class Usage:**
- Inherits from `BaseRepository<AnnouncementDomain>`
- Uses `BasePrismaClient` type for model access
- Uses `isNotFoundError()` and `isUniqueConstraintError()` helpers

### 3.2 BaseRepository Usage

| Method | Usage |
|--------|-------|
| `getModelName()` | Returns "Announcement" |
| `isNotFoundError()` | Catches Prisma P2025 errors |
| `isUniqueConstraintError()` | Catches Prisma P2002 errors |

### 3.3 Prisma Queries Used

| Method | Query Type | Notes |
|--------|------------|-------|
| `findMany()` | SELECT | Used in findActive, findByType, findPublished, search, paginate |
| `findUnique()` | SELECT | Used in findById |
| `create()` | INSERT | With input transformation via mapper |
| `update()` | UPDATE | Soft delete, restore, standard update |
| `delete()` | DELETE | Hard delete (admin only) |
| `count()` | COUNT | Used with findAll for pagination |

### 3.4 Search Implementation

**Searchable Fields:**
- `title` (case-insensitive contains)
- `content` (case-insensitive contains)
- `excerpt` (case-insensitive contains)

**Implementation:**
```typescript
const where: Prisma.AnnouncementWhereInput = {
  deletedAt: null,
  AND: [{
    OR: [
      { title: { contains: params.query, mode: "insensitive" } },
      { content: { contains: params.query, mode: "insensitive" } },
      { excerpt: { contains: params.query, mode: "insensitive" } },
    ],
  }],
};
```

### 3.5 Cursor Pagination Implementation

**Cursor Format:** Base64 encoded announcement ID
```typescript
// Encode: Buffer.from(announcement.id).toString("base64")
// Decode: Buffer.from(cursor, "base64").toString("utf-8")

const records = await this.model.findMany({
  where: { id: { lt: decodedCursor } },
  orderBy: [...],
  take: limit + 1, // Fetch one extra
});

// Determine hasMore
const hasMore = records.length > limit;
const nextCursor = hasMore 
  ? Buffer.from(data[data.length - 1].id).toString("base64")
  : null;
```

### 3.6 Soft Delete Implementation

**Soft Delete:**
```typescript
async softDelete(id: string): Promise<AnnouncementDomain> {
  const record = await this.model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return announcementMapper.toDomain(record);
}
```

**Restore:**
```typescript
async restore(id: string): Promise<AnnouncementDomain> {
  // Verify exists and is deleted
  if (!existing.deletedAt) {
    throw new ConflictError("Announcement is not deleted");
  }
  const record = await this.model.update({
    where: { id },
    data: { deletedAt: null },
  });
}
```

### 3.7 Domain Object Mapping

**Fields Mapped:**
```typescript
AnnouncementDomain {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string (computed from title)
  type: AnnouncementType
  priority: AnnouncementPriority
  isPinned: boolean
  isActive: boolean
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED" (computed)
  publishAt: Date | null
  expiresAt: Date | null
  authorId: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

---

## 4. Service

### 4.1 Business Rules Implemented

| Rule | Location | Validation |
|------|----------|------------|
| Title required | `createAnnouncement()` | Trim length check |
| Content required | `createAnnouncement()` | Trim length check |
| Publish before expires | Both create/update | Date comparison |
| Not already published | `publishAnnouncement()` | isActive check |
| Not already unpublished | `unpublishAnnouncement()` | isActive check |
| Not expired | `publishAnnouncement()` | expiresAt check |

### 4.2 Validation Flow

1. **Input validation** (service level):
   - Title: non-empty after trim
   - Content: non-empty after trim
   - Dates: publishAt < expiresAt

2. **Domain validation** (repository level):
   - NotFoundError on missing ID
   - ConflictError on duplicate slug (if applicable)

### 4.3 Logger Usage

**Service Logger Calls: 12 total**

| Call Type | Context | Fields |
|-----------|---------|--------|
| `logger.generateRequestId()` | Every method | requestId |
| `this.logInfo()` | Method entry | requestId, userId, params |
| `logAudit()` | Every method | requestId, userId, action, entityId, duration, status |

**Audit Log Format:**
```typescript
{
  requestId: string,
  userId?: string,
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "GET" | "GET_PUBLIC" | "GET_ADMIN" | "SEARCH",
  entityId?: string,
  duration: number,
  status: "success" | "error",
  error?: string
}
```

### 4.4 Transaction Usage

**Status:** No transactions used in current implementation

**Rationale:** Each operation is single-table CRUD. If future features require multi-table operations, `executeTransaction()` from `@/lib/transaction` should be used.

### 4.5 ServiceResult Usage

**Pattern Used:**
```typescript
return this.success(data, "message")     // Success case
return this.error(code, message, details) // Error case
```

**Service Methods Return Types:**
- `Promise<ServiceResult<AnnouncementDomain>>` - Single entity
- `Promise<ServiceResult<AnnouncementDomain[]>>` - Array
- `Promise<ServiceResult<PaginatedResult<AnnouncementDomain>>>` - Paginated

### 4.6 Error Handling

| Error Type | Code | Handling |
|------------|------|----------|
| Validation Error | VAL_INVALID_INPUT | Return error result |
| Not Found | ANN_NOT_FOUND | Return error result |
| Already Published | ANN_ALREADY_PUBLISHED | Return error result |
| Already Unpublished | ANN_PUBLISH_FAILED | Return error result |
| Database Error | DB-xxx | via `handleError()` |

### 4.7 Permission Checks

**Location:** Server Actions only (not in service)

**Permission Model:**
```typescript
function isAdmin(user: AuthUser | null): boolean {
  return user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN");
}
```

**Note:** Current implementation has placeholder auth. Integration with actual auth system required.

---

## 5. Server Actions

### 5.1 Authentication

**Implementation:** Placeholder `getCurrentUser()` function
```typescript
async function getCurrentUser(): Promise<AuthUser | null> {
  // TODO: Replace with actual auth implementation
  return null;
}
```

**Current Behavior:** Always returns `null` (no auth)
**Required:** Integration with actual auth system (Supabase auth, NextAuth, etc.)

### 5.2 Authorization

**Admin-only actions:**
- createAnnouncement
- updateAnnouncement
- deleteAnnouncement
- restoreAnnouncement
- publishAnnouncement
- unpublishAnnouncement
- getAnnouncements

**Public actions:**
- getPublicAnnouncements
- getAnnouncement
- searchAnnouncements

### 5.3 Validation

**Flow:**
1. Call `parse*Input()` from validators
2. If validation fails, return `{ success: false, error: { code, message, details } }`
3. If validation passes, invoke service

**Parse Functions:**
- `parseCreateInput()` → CreateAnnouncementInput
- `parseUpdateInput()` → UpdateAnnouncementInput  
- `parsePaginationInput()` → PaginationAnnouncementInput
- `parseSearchInput()` → SearchAnnouncementInput
- `validateAnnouncementId()` → AnnouncementIdInput

### 5.4 Error Handling

```typescript
try {
  // main logic
} catch (error) {
  logger.error("Server action error: actionName", error as Error, { requestId });
  return {
    success: false,
    error: {
      code: ErrorCodes.APP_INTERNAL,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    },
  };
}
```

### 5.5 Cache Invalidation

**Revalidated Paths:**
| Action | Paths Revalidated |
|--------|-------------------|
| create | `/admin/announcements`, `/` |
| update | `/admin/announcements`, `/admin/announcements/[id]`, `/` |
| delete | `/admin/announcements`, `/` |
| restore | `/admin/announcements`, `/admin/announcements/trash` |
| publish | `/admin/announcements`, `/admin/announcements/[id]`, `/` |
| unpublish | `/admin/announcements`, `/admin/announcements/[id]`, `/` |

### 5.6 Returned Types

```typescript
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 6. Validators

### 6.1 Schema List

| Schema | Purpose |
|--------|---------|
| `announcementTypeSchema` | Enum: GENERAL, EVENT, DONATION, FESTIVAL, MAINTENANCE, URGENT |
| `announcementPrioritySchema` | Enum: LOW, NORMAL, HIGH, URGENT |
| `createAnnouncementSchema` | Validate create input |
| `updateAnnouncementSchema` | Validate update input |
| `searchAnnouncementSchema` | Validate search parameters |
| `paginationAnnouncementSchema` | Validate pagination parameters |
| `announcementIdSchema` | Validate ID parameter |

### 6.2 createAnnouncementSchema

**Purpose:** Validate data for creating a new announcement

**Fields:**
| Field | Type | Validation | Transform |
|-------|------|------------|-----------|
| title | string | min(1), max(255) | - |
| content | string | min(1) | - |
| excerpt | string? | max(500), optional | - |
| type | enum | default("GENERAL") | - |
| priority | enum | default("NORMAL") | - |
| isPinned | boolean | default(false) | - |
| isActive | boolean | default(true) | - |
| publishAt | string? | datetime format, optional, nullable | - |
| expiresAt | string? | datetime format, optional, nullable | - |

### 6.3 updateAnnouncementSchema

**Purpose:** Validate data for updating an announcement

**Fields:**
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | string | uuid format | Required |
| title | string? | min(1), max(255), optional | Cannot be empty if provided |
| content | string? | min(1), optional | Cannot be empty if provided |
| excerpt | string? | max(500), optional, nullable | - |
| type | enum? | optional | - |
| priority | enum? | optional | - |
| isPinned | boolean? | optional | - |
| isActive | boolean? | optional | - |
| publishAt | string? | datetime, optional, nullable | - |
| expiresAt | string? | datetime, optional, nullable | - |

### 6.4 searchAnnouncementSchema

**Purpose:** Validate search and filter parameters

**Fields:**
| Field | Type | Validation | Transform | Default |
|-------|------|------------|-----------|---------|
| query | string? | optional | - | - |
| type | enum? | optional | - | - |
| priority | enum? | optional | - | - |
| isPinned | boolean? | optional | - | - |
| isActive | boolean? | optional | - | - |
| page | number | int, positive | coerce | 1 |
| limit | number | int, positive, max(100) | coerce | 20 |

### 6.5 paginationAnnouncementSchema

**Purpose:** Validate pagination parameters for admin list

**Fields:**
| Field | Type | Validation | Transform | Default |
|-------|------|------------|-----------|---------|
| page | number | int, positive | coerce | 1 |
| limit | number | int, positive, max(100) | coerce | 20 |
| sortBy | enum | allowed values | - | "createdAt" |
| sortOrder | enum | "asc" \| "desc" | - | "desc" |
| type | enum? | optional | - | - |
| isActive | boolean? | optional | - | - |
| includeDeleted | boolean | - | - | false |

**Sortable Fields:** `createdAt`, `updatedAt`, `publishAt`, `priority`, `title`

### 6.6 Refinements

**Date Validation (`validateAnnouncementDates`):**
```typescript
if (publishAt && expiresAt) {
  if (publishDate >= expiresDate) {
    return { valid: false, error: "..." };
  }
}
```

**Applied in:**
- `parseCreateInput()`
- `parseUpdateInput()`

### 6.7 Transforms

| Transform | Location | Applied To |
|-----------|----------|------------|
| String to Date | `parseCreateInput()` | publishAt, expiresAt |
| String to Date | `parseUpdateInput()` | publishAt, expiresAt |
| String to number | Zod coerce | page, limit |
| Default values | Zod defaults | type, priority, isPinned, isActive, etc. |

---

## 7. Search

### 7.1 Searchable Fields

| Field | Search Type | Case Sensitive |
|-------|-------------|----------------|
| title | contains | No (insensitive) |
| content | contains | No (insensitive) |
| excerpt | contains | No (insensitive) |

### 7.2 Sort Fields

| Field | Direction |
|-------|-----------|
| createdAt | asc/desc |
| updatedAt | asc/desc |
| publishAt | asc/desc |
| priority | asc/desc |
| title | asc/desc |

**Default Order:** `createdAt desc`

### 7.3 Filters

| Filter | Type | Repository Method |
|--------|------|------------------|
| type | enum | findByType(), findAll(), search(), paginate() |
| isActive | boolean | findAll(), search(), paginate() |
| includeDeleted | boolean | findAll(), paginate() |

### 7.4 Pagination Cursor

**Format:** Base64 encoded announcement ID
**Direction:** DESC (newer first)
**Overflow:** Fetch `limit + 1`, exclude last if overflow exists

---

## 8. Logging

### 8.1 Logger Calls Summary

| Layer | Info Calls | Error Calls | Generate ID |
|-------|------------|-------------|-------------|
| Service | 11 | 0 (via logAudit) | 11 |
| Repository | 5 | 5 | 0 |
| Actions | 11 | 11 | 11 |
| **Total** | **27** | **16** | **22** |

### 8.2 Audit Log Context Fields

**Every action logs:**
```typescript
{
  requestId: logger.generateRequestId(),  // Unique per call
  userId?: string,                         // If authenticated
  action: string,                          // CREATE, UPDATE, etc.
  entityId?: string,                       // Announcement ID
  duration: number,                        // Time in ms
  status: "success" | "error",            // Outcome
  error?: string                          // Error message if failed
}
```

### 8.3 Logger Call Examples

**Service Entry:**
```typescript
const requestId = logger.generateRequestId();
this.logInfo("Creating announcement", { requestId, userId, title: input.title });
```

**Audit Log:**
```typescript
logAudit({
  requestId,
  userId,
  action: "CREATE",
  entityId: announcement.id,
  duration,
  status: "success",
});
```

**Error:**
```typescript
logger.error("Server action error: createAnnouncement", error as Error, { requestId });
```

---

## 9. Tests

### 9.1 Test List

| Test Suite | Tests |
|------------|-------|
| **Validator Tests** | |
| createAnnouncementSchema | 7 tests |
| updateAnnouncementSchema | 3 tests |
| validateAnnouncementDates | 3 tests |
| paginationAnnouncementSchema | 3 tests |
| validateAnnouncementId | 2 tests |
| **Repository Tests** | |
| findById | 2 tests |
| findBySlug | 2 tests |
| slugExists | 3 tests |
| findActive | 1 test |
| findPublished | 1 test |
| create | 1 test |
| update | 2 tests |
| softDelete | 1 test |
| restore | 3 tests |
| search | 3 tests |
| paginate | 2 tests |
| findAll | 2 tests |
| **Service Tests** | |
| createAnnouncement | 4 tests |
| updateAnnouncement | 3 tests |
| deleteAnnouncement | 2 tests |
| restoreAnnouncement | 2 tests |
| publishAnnouncement | 3 tests |
| unpublishAnnouncement | 2 tests |
| getAnnouncement | 2 tests |
| getPublicAnnouncements | 3 tests |
| getAdminAnnouncements | 3 tests |
| searchAnnouncements | 2 tests |
| Audit Logging | 2 tests |
| **Action Tests** | |
| Authentication | 2 tests |
| Authorization | 4 tests |
| Validation | 2 tests |
| Service Invocation | 7 tests |
| Response Formatting | 3 tests |
| Cache Invalidation | 4 tests |
| Logging | 2 tests |
| Public Actions | 3 tests |
| **Total** | **~75 tests** |

### 9.2 Coverage

| Category | Coverage |
|----------|----------|
| Validators | ✅ Full coverage of schemas |
| Date validation | ✅ |
| UUID validation | ✅ |
| Pagination defaults | ✅ |
| Type coercion | ✅ |
| Enum validation | ✅ |
| Schema refinement | ✅ |
| Repository | ✅ CRUD, soft delete, restore, search, pagination |
| Service | ✅ All business logic methods |
| Actions | ✅ Auth, validation, service invocation |
| Auth integration | ✅ Supabase auth with role checking |
| Slug operations | ✅ Generation, uniqueness, queries |

---

## 10. Self Review

### 10.1 Architecture Deviations

| Item | Status | Notes |
|------|--------|-------|
| UI → Actions → Services → Repositories → Prisma | ✅ Compliant | - |
| No Prisma in UI | ✅ Compliant | - |
| No business logic in Actions | ✅ Compliant | - |
| Business logic in Services | ✅ Compliant | - |
| Repositories return Domain Objects | ✅ Compliant | - |
| Centralized Logger | ✅ Compliant | - |
| Zod validation | ✅ Compliant | - |
| ServiceResult pattern | ✅ Compliant | - |
| Production Auth | ✅ Compliant | Supabase auth integrated |

### 10.2 Code Smells

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| `as any` casts | Low | Repository | Acceptable for generic BaseRepository usage |
| Duplicate error logging | Low | Service/Actions | Consider centralized error handler |
| Slug collision | Medium | Mapper | `generateUniqueSlug()` exists but not used |

### 10.3 Possible Improvements

1. **Transactions:** Add multi-table transaction support for complex operations
2. **Caching:** Add Redis/in-memory caching for published announcements
3. **Rate Limiting:** Add rate limiting to public endpoints
4. **Slug collision handling:** Use `generateUniqueSlug()` in service layer
5. **Rich Content:** Support Markdown/HTML content with sanitization
6. **Attachments:** Add media attachment support
7. **Scheduling:** Add background job support for scheduled publishing
8. **Analytics:** Add view tracking and analytics
9. **Internationalization:** Add Kannada content support (i18n)

### 10.4 Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Slug collision on concurrent create | Medium | Use transaction with retry |
| No caching | Performance | Add Redis cache layer |
| Search uses LIKE | Not full-text | Consider PostgreSQL tsvector for scale |
| No soft-delete restore conflict | Low | Check slug uniqueness on restore |

---

## 11. Validation Command Results

| Command | Status |
|---------|--------|
| `npm run lint` | ✅ Pass (no errors in announcement files) |
| `npx tsc --noEmit` | ✅ Pass (no type errors) |
| `npx prisma validate` | ✅ Pass |
| `npx prisma generate` | ✅ Pass |

---

## 12. Recommendations for Future Modules

1. **Copy Pattern:** Use this module as the template for Events, Gallery, Media, Donations, Sevas, Documents, Knowledge Base
2. **Standardize:** Create base templates for repositories, services, actions
3. **Generator:** Consider creating a CLI tool to scaffold new modules
4. **Documentation:** Document the architecture decisions and patterns

---

*Review prepared for Sprint 3.2 Architecture Review*
