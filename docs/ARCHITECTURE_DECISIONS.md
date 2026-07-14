# Architecture Decision Records (ADR)

**Project:** Sri Raghavendra Swamy Math – Yelahanka (SRS Matha YNK)

Version: 1.0

Status: Active

---

# Purpose

This document records all significant architectural decisions made during the development of the Temple Management Platform.

These decisions are considered project standards.

OpenHands and all future contributors must follow these decisions unless a new ADR supersedes an existing one.

---

# ADR-001
## Project Architecture

Status: Accepted

Decision

The application shall follow a layered architecture.

```
UI

↓

Server Actions / Route Handlers

↓

Service Layer

↓

Repository Layer

↓

Prisma ORM

↓

Supabase PostgreSQL
```

Reason

- Separation of concerns
- Testability
- Scalability
- Maintainability

Consequences

- UI never communicates directly with Prisma.
- Business logic exists only inside Services.
- Database access exists only inside Repositories.

---

# ADR-002
## Backend Platform

Status: Accepted

Decision

The backend platform shall use:

- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage

Firebase shall not be used.

Reason

Single backend platform.

Simpler infrastructure.

Better SQL capabilities.

Future scalability.

---

# ADR-003
## ORM

Status: Accepted

Decision

Prisma is the only ORM used by the application.

Reason

- Type safety
- Migrations
- Excellent TypeScript support
- Maintainability

Consequences

No application code may perform SQL directly.

---

# ADR-004
## Database Naming

Status: Accepted

Decision

Database tables use

snake_case

Plural names

Examples

profiles

booking_items

knowledge_articles

Prisma models use

PascalCase

Singular names

Profile

BookingItem

KnowledgeArticle

Every model shall use

@@map()

Reason

Best SQL readability while preserving TypeScript conventions.

---

# ADR-005
## Primary Keys

Status: Accepted

Decision

Every entity uses

UUID

Reason

Security

Scalability

Distributed systems

---

# ADR-006
## Audit Fields

Status: Accepted

Decision

Mutable entities use

createdAt

updatedAt

deletedAt

createdById

updatedById

Reason

Traceability

Recovery

Auditing

---

# ADR-007
## Soft Delete

Status: Accepted

Decision

Business entities use

deletedAt

instead of hard delete.

Exceptions

Configuration tables

Reference tables

Immutable tables

Reason

Data recovery

Audit

Compliance

---

# ADR-008
## Authentication

Status: Accepted

Decision

Authentication is handled exclusively by Supabase Auth.

The application Profile extends auth.users.

Reason

Avoid duplicate user management.

---

# ADR-009
## Authorization

Status: Accepted

Decision

Role Based Access Control.

Tables

profiles

roles

user_roles

Reason

Future flexibility.

---

# ADR-010
## Media Storage

Status: Accepted

Decision

Binary files shall be stored only in Supabase Storage.

Database stores metadata only.

GitHub shall never store production uploads.

Reason

Performance

Repository cleanliness

Scalability

---

# ADR-011
## Media Relationships

Status: Accepted

Decision

Entities reference Media using explicit foreign keys.

Polymorphic media tables are prohibited.

Reason

Prisma compatibility

Referential integrity

Simpler queries

---

# ADR-012
## Booking Architecture

Status: Accepted

Decision

Bookings use

Booking

BookingItem

BookingItem references nullable foreign keys.

Reason

Shared booking workflow.

---

# ADR-013
## Donations

Status: Accepted

Decision

Donation

↓

DonationPayment

Reason

Multiple payment attempts

Refund support

Webhook reconciliation

---

# ADR-014
## AI Architecture

Status: Accepted

Decision

Raya AI retrieves information from the database.

It shall never rely on hardcoded prompts.

Primary sources

Knowledge Articles

FAQ

Announcements

Events

Temple Information

Reason

Content managed by administrators.

---

# ADR-015
## Multi-language

Status: Accepted

Decision

Database models reserve support for Kannada.

Naming convention

title

title_kn

description

description_kn

Future languages may introduce translation tables.

---

# ADR-016
## Environment Variables

Status: Accepted

Decision

Secrets exist only inside

.env

Never committed.

Validated during application startup.

---

# ADR-017
## Validation

Status: Accepted

Decision

All input validation uses

Zod

No manual validation.

---

# ADR-018
## File Upload Workflow

Status: Accepted

Workflow

User

↓

Validation

↓

Supabase Storage

↓

Metadata

↓

Database

---

# ADR-019
## Testing Standards

Status: Accepted

Every feature must pass

TypeScript

ESLint

Build

Unit Tests (where applicable)

Integration Tests (where applicable)

Playwright (critical flows)

---

# ADR-020
## Development Process

Status: Accepted

Every sprint follows

Design

↓

Review

↓

Implementation

↓

Verification

↓

Approval

↓

Merge

Reason

Avoid architectural drift.

---

# Future ADRs

New architectural decisions shall be added sequentially.

Example

ADR-021

ADR-022

ADR-023

Previous ADRs must never be modified without documenting the reason.
