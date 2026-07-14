# Sri Raghavendra Swamy Matha Portal - Project Board

## Sprint 2.x Kanban Board

| 📋 Backlog | 🟡 Sprint In Progress | 👀 Review | 🧪 Testing | ✅ Done |
|------------|----------------------|-----------|------------|--------|
| | | | | |

---

## Quick Commands

### Apply Migration
```bash
npm run db:migrate:deploy
```

### Seed Database
```bash
npm run db:seed
```

### Check Status
```bash
npx prisma migrate status
```

---

## Architecture Freeze

> ⚠️ **IMPORTANT**: The Architecture, ADRs, and Domain Model are approved and frozen.

During sprint work:
- ❌ Do NOT modify entities
- ❌ Do NOT rename models
- ❌ Do NOT change relationships
- ❌ Do NOT add or remove tables
- ❌ Do NOT alter business rules

If implementation reveals an architectural issue:
1. Stop implementation
2. Document the issue
3. Explain why it cannot be implemented
4. Wait for approval before making any changes

---

## Sprint 2.4 - Current Status

### ✅ Completed
- [x] Initial migration created
- [x] Seed script implemented
- [x] Database documentation
- [x] Engineering principles

### 🔄 In Progress
- [ ] Apply migration to Supabase
- [ ] Run seed
- [ ] Verify build

### 📋 To Do
- [ ] Fix Supabase SSR build issue
- [ ] Implement next feature

---

## Definition of Done

- [ ] Code follows engineering principles
- [ ] Prisma schema validated
- [ ] Migration applied successfully
- [ ] Seed executed
- [ ] Build passes
- [ ] No architectural deviations
- [ ] Documentation updated
