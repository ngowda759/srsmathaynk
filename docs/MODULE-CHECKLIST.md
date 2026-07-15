# Module Development Checklist

This checklist ensures every new module follows the established architecture patterns for the Sri Raghavendra Swamy Temple website.

## 📋 Pre-Development

- [ ] Review existing modules (Events, Announcements, Gallery) for patterns
- [ ] Define module scope and requirements
- [ ] Create technical design document
- [ ] Update `docs/PROJECT_PLAN.md` with sprint/feature details

## 🗄️ Database Layer (Prisma)

### Schema (`prisma/schema.prisma`)

- [ ] Add model with proper fields matching requirements
- [ ] Include audit fields: `createdAt`, `updatedAt`, `deletedAt`
- [ ] Add `@@index()` for frequently queried fields
- [ ] Add `@@map()` for table naming convention
- [ ] Include soft delete pattern (`deletedAt`)
- [ ] Add relations with proper cascade rules
- [ ] Run `npx prisma validate` to verify schema
- [ ] Run `npx prisma generate` to regenerate client

### Example Model Pattern

```prisma
/// ${ModuleName}
model ${ModuleName} {
  id String @id @default(uuid())

  // Core fields
  name String

  // Enums
  status ${ModuleName}Status @default(DRAFT)

  // Relations
  items ${ModuleName}Item[]

  // Audit fields
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?

  @@index([status])
  @@map("${module_name}")
}

enum ${ModuleName}Status {
  DRAFT
  PUBLISHED
}
```

## 📝 Types Layer (`types/`)

- [ ] Create `types/${moduleName}.ts`
- [ ] Define TypeScript interfaces matching Prisma schema
- [ ] Add request/response types
- [ ] Add query parameter types
- [ ] Add enum types for status fields
- [ ] Add UI helper labels/maps
- [ ] Add statistics types
- [ ] Include JSDoc documentation

### Type Checklist

- [ ] `${ModuleName}Type` - Main entity interface
- [ ] `${ModuleName}Request` - Create/update input
- [ ] `${ModuleName}Query` - List query parameters
- [ ] `${ModuleName}Status` - Status enum
- [ ] `${MODULE_NAME}_STATUS_LABELS` - UI labels
- [ ] `${ModuleName}Stats` - Statistics interface

## 🏗️ Service Layer (`services/`)

- [ ] Create `services/${moduleName}.service.ts`
- [ ] Implement class-based service pattern
- [ ] Include input validation
- [ ] Add error handling with `handlePrismaError`
- [ ] Add logging with `logger`
- [ ] Implement CRUD methods
- [ ] Add business logic methods
- [ ] Add helper methods (getFeatured, getStats, etc.)

### Service Method Checklist

- [ ] `get${ModuleName}s(query?)` - List with filtering
- [ ] `get${ModuleName}(id)` - Get single by ID
- [ ] `create${ModuleName}(data)` - Create new
- [ ] `update${ModuleName}(id, data)` - Update existing
- [ ] `delete${ModuleName}(id)` - Soft delete
- [ ] `toggleFeatured(id)` - Toggle featured flag
- [ ] `getStats()` - Get statistics
- [ ] `getFeatured${ModuleName}s(max?)` - Get featured items

## 🌐 API Route Layer (`app/api/`)

### Main Route (`app/api/${moduleName}/route.ts`)

- [ ] GET - List with query parameters
- [ ] POST - Create new record
- [ ] Input validation
- [ ] Error handling
- [ ] Proper HTTP status codes
- [ ] Response format: `{ success, data, error }`

### ID Route (`app/api/${moduleName}/[id]/route.ts`)

- [ ] GET - Get single record
- [ ] PATCH - Update record
- [ ] DELETE - Soft delete
- [ ] Proper 404 handling
- [ ] Error responses

### Actions Route (`app/api/${moduleName}/[id]/actions/route.ts`)

- [ ] POST endpoint
- [ ] Action-based routing
- [ ] Return updated data

### Additional Routes

- [ ] `app/api/${moduleName}/stats/route.ts` - Statistics
- [ ] `app/api/${moduleName}/categories/route.ts` - Related entities

### API Route Checklist

- [ ] Consistent response format
- [ ] 400 for validation errors
- [ ] 404 for not found
- [ ] 500 for server errors
- [ ] Logging for all errors
- [ ] No sensitive data in error messages

## 👨‍💼 Admin Pages (`app/admin/`)

### Main Page (`app/admin/${moduleName}/page.tsx`)

- [ ] Use `AdminPageWrapper` and `AdminPageHeader`
- [ ] Table view with data listing
- [ ] Search functionality
- [ ] Filter dropdowns
- [ ] Pagination controls
- [ ] Action buttons (Add, Edit, Delete)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

### Create Page (`app/admin/${moduleName}/new/page.tsx`)

- [ ] Form with all required fields
- [ ] Client-side validation
- [ ] Loading states
- [ ] Success/error notifications
- [ ] Cancel button

### Edit Page (`app/admin/${moduleName}/[id]/page.tsx`)

- [ ] Load existing data
- [ ] Pre-populated form
- [ ] Save changes functionality
- [ ] Delete button with confirmation
- [ ] View public link

### Component Checklist

- [ ] `AdminPageWrapper` for layout
- [ ] `AdminPageHeader` for title
- [ ] `CrudTable` or custom table
- [ ] Form components from `@/components/ui/`
- [ ] Toast notifications with `react-hot-toast`

## 🌐 Public Pages (`app/(public)/`)

### Main Page (`app/(public)/${moduleName}/page.tsx`)

- [ ] Responsive grid/list layout
- [ ] Filter controls
- [ ] Search functionality
- [ ] Pagination or infinite scroll
- [ ] Loading skeletons
- [ ] Empty state

### Detail Page (`app/(public)/${moduleName}/[id]/page.tsx`)

- [ ] Full content display
- [ ] Related items
- [ ] Back navigation
- [ ] SEO meta tags

### Public Page Checklist

- [ ] `Navbar` and `Footer`
- [ ] `Breadcrumb` navigation
- [ ] Responsive design
- [ ] Loading states
- [ ] Error boundaries
- [ ] SEO meta tags

## 🧪 Testing

- [ ] Unit tests for service layer
- [ ] API route tests
- [ ] Component tests (if applicable)
- [ ] E2E tests (if applicable)

### Test Files

- [ ] `tests/unit/${moduleName}.service.spec.ts`
- [ ] `tests/functional/${moduleName}.spec.ts`

## 📚 Documentation

- [ ] Update `docs/PROJECT_PLAN.md`
- [ ] Update `docs/ARCHITECTURE.md`
- [ ] Add API documentation
- [ ] Update `docs/CHANGELOG.md`

## ✅ Pre-Merge Checklist

- [ ] All tests passing
- [ ] ESLint passing
- [ ] TypeScript compilation passing
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Keyboard navigation working
- [ ] Screen reader accessible
- [ ] No hardcoded secrets
- [ ] Environment variables documented

## 🚀 Post-Deployment

- [ ] Verify in production
- [ ] Check database migrations applied
- [ ] Monitor error logs
- [ ] Test all functionality
- [ ] Update documentation

---

## 🔧 Using the Template

Copy the template files from `templates/module/` to create new modules:

```bash
cp -r templates/module services/
```

Replace placeholders:
- `${MODULE_NAME}` → Human readable (e.g., "Gallery Album")
- `${ModuleName}` → PascalCase (e.g., "GalleryAlbum")
- `${moduleName}` → camelCase (e.g., "galleryAlbum")

## 📁 File Structure Summary

```
services/
  └── ${moduleName}.service.ts

types/
  └── ${moduleName}.ts

app/api/${moduleName}/
  ├── route.ts
  ├── [id]/
  │   ├── route.ts
  │   └── actions/
  │       └── route.ts
  └── stats/
      └── route.ts

app/admin/${moduleName}/
  ├── page.tsx
  ├── new/
  │   └── page.tsx
  ├── [id]/
  │   └── page.tsx
  └── columns.ts

app/(public)/${moduleName}/
  ├── page.tsx
  └── [id]/
      └── page.tsx
```

## 🎯 Quality Standards

1. **Consistency** - Follow existing patterns exactly
2. **Type Safety** - No `any` types, full TypeScript coverage
3. **Error Handling** - Never expose internal errors to users
4. **Performance** - Include proper indexes, pagination
5. **Security** - Validate all inputs, check permissions
6. **Accessibility** - Keyboard nav, ARIA labels
7. **Testing** - Aim for 80% coverage on service layer
