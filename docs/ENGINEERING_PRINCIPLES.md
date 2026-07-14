# Engineering Principles

This document establishes the day-to-day coding guidelines for the Sri Raghavendra Swamy Matha temple portal project. These principles apply to OpenHands agents and all future contributors.

---

## 1. Simplicity Over Cleverness

Write code that is easy to understand and maintain. Prefer straightforward solutions over clever ones, even if they require more lines of code.

**Good:**
```typescript
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Bad:**
```typescript
const calculateTotal = (items: CartItem[]) => items.reduce((s, {price: p, quantity: q}) => s + p * q, 0);
```

---

## 2. Reuse Before Creating New Code

Before creating new code, check if existing utilities, functions, or components can solve the problem.

- Check `lib/` for shared utilities
- Check `components/` for reusable UI components
- Check `services/` for existing business logic
- Check `hooks/` for shared React hooks

If existing code doesn't quite fit, consider extending it rather than duplicating functionality.

---

## 3. One Responsibility Per Class/Module

Each module, function, and component should have a single, well-defined purpose.

**Good:**
```typescript
// validators/booking.validator.ts
export function validateBookingInput(data: unknown): BookingInput {
  return bookingSchema.parse(data);
}

// services/booking.service.ts
export async function createBooking(input: BookingInput, profileId: string) {
  const validated = validateBookingInput(input);
  return prisma.booking.create({ data: { ...validated, profileId } });
}
```

**Bad:**
```typescript
// booking.ts - does everything
export async function createBooking(input: unknown, profileId: string) {
  const validated = bookingSchema.parse(input);
  // validation, business logic, DB operations, email sending all in one function
  // ...
}
```

---

## 4. Validate All Input

Never trust external data. Always validate input at system boundaries.

```typescript
// API Routes
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body); // Throws on invalid input
  // Proceed with validated data
}
```

**Rules:**
- Validate all API request bodies
- Validate all query parameters
- Validate all environment variables at startup
- Validate all data from the database (even if you just wrote it)

---

## 5. Never Bypass the Service Layer

All business logic must go through the service layer. Direct database access from API routes or components is forbidden.

**Correct Architecture:**
```
API Route → Service → Repository → Database
```

**Forbidden:**
```
API Route → Repository → Database  (bypasses service)
Component → Repository → Database (bypasses service and API)
```

The service layer enforces business rules, permissions, and consistency.

---

## 6. Never Access Prisma Outside Repositories

Prisma Client should only be used in dedicated repository modules. This ensures consistent patterns and makes it easy to audit database access.

**Allowed:**
```typescript
// repositories/announcement.repository.ts
import { prisma } from "@/lib/db";

export function findActiveAnnouncements() {
  return prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}
```

**Forbidden:**
```typescript
// In an API route
import { prisma } from "@/lib/db";

export async function GET() {
  const announcements = await prisma.announcement.findMany({ ... }); // Don't do this
}
```

---

## 7. Write Self-Documenting Code

Code should be readable without comments whenever possible. Use clear names, good structure, and consistent patterns.

**Prefer self-documenting code:**
```typescript
// Good
const isBookingConfirmed = booking.status === "CONFIRMED";
if (isBookingConfirmed) {
  await sendConfirmationEmail(booking);
}

// Avoid unnecessary comments
// Check if booking is confirmed
const isBookingConfirmed = booking.status === "CONFIRMED"; // Don't do this
```

**Add comments only when necessary:**
- Explaining non-obvious business rules
- Documenting complex algorithms
- Noting important edge cases or workarounds

---

## 8. Prefer Composition Over Duplication

When you find yourself copying code, extract it into a shared utility, component, or function.

**Signs of duplication:**
- Same code in multiple files
- Similar functions with slight variations
- Repeated UI patterns
- Repeated query patterns

**Before duplicating, ask:**
1. Can I extract this to a shared utility?
2. Can I create a reusable component?
3. Can I use a higher-order function?
4. Is this duplication actually different enough to justify?

---

## 9. Every Feature Must Be Testable

Design code to be testable. If a feature is hard to test, it's often a sign of poor design.

**Practices:**
- Keep business logic in service functions (not components or routes)
- Use dependency injection for external services
- Separate side effects from pure logic where possible
- Write unit tests for services
- Write integration tests for API routes

**Testable pattern:**
```typescript
// Easy to test - pure function
export function calculateDonationAmount(
  baseAmount: number,
  campaign: DonationCampaign
): number {
  if (campaign.urgencyLevel === "CRITICAL") {
    return baseAmount * 1.1; // 10% bonus for critical campaigns
  }
  return baseAmount;
}

// Hard to test - embedded in component
function DonationForm() {
  const handleSubmit = () => {
    // Business logic mixed with UI - hard to test
    let amount = baseAmount;
    if (campaign.urgencyLevel === "CRITICAL") amount *= 1.1;
    // ...
  };
}
```

---

## 10. Security Is Part of Every Feature

Security is not an afterthought. Every feature must consider:

### Authentication & Authorization
- Is the user authenticated?
- Does the user have permission?
- Can users access data they shouldn't?

```typescript
// Always check permissions in service layer
export async function deleteAnnouncement(id: string, userId: string) {
  const user = await getUser(userId);
  
  if (!user.roles.includes("ADMIN")) {
    throw new ForbiddenError("Only admins can delete announcements");
  }
  
  return prisma.announcement.delete({ where: { id } });
}
```

### Input Validation
- Sanitize user input
- Use parameterized queries (Prisma handles this)
- Validate file uploads
- Escape output for XSS prevention

### Data Protection
- Never log sensitive data (passwords, tokens, personal info)
- Never expose internal errors to users
- Use HTTPS for all communications
- Keep secrets in environment variables

### Common Vulnerabilities to Avoid
- SQL Injection (use Prisma's parameterized queries)
- XSS (escape output, use React's automatic escaping)
- CSRF (use proper CSRF tokens for state-changing operations)
- IDOR (always verify ownership before access)
- Broken Authentication (use Supabase Auth properly)

---

## Applying These Principles

When making changes, use this checklist:

- [ ] Is the solution simple?
- [ ] Am I reusing existing code?
- [ ] Does this have one clear responsibility?
- [ ] Is all input validated?
- [ ] Does this go through the service layer?
- [ ] Is Prisma only used in repositories?
- [ ] Is the code self-documenting?
- [ ] Am I introducing duplication?
- [ ] Can this be tested?
- [ ] Are there security considerations?

---

## Related Documents

- [Domain Model v5](./DOMAIN_MODEL.md)
- [Architecture Decisions](./ARCHITECTURE_DECISIONS.md)
- [Database Documentation](./DATABASE.md)
- [API Guidelines](./API_GUIDELINES.md)

---

**Last Updated:** July 2025
**Version:** 1.0
