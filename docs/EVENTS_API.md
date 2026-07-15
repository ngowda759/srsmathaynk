# Events Module API

## Overview

The Events module provides comprehensive event management for temple events, festivals, and special occasions.

## API Endpoints

### List Events
```
GET /api/events
```

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` |
| `type` | string | Filter by type: `GENERAL`, `FESTIVAL`, `WORKSHOP`, `SPIRITUAL`, `CULTURAL`, `MAINTENANCE` |
| `featured` | boolean | Filter featured events |
| `published` | boolean | Filter published events |
| `search` | string | **Search term** (see Kannada Support below) |
| `startDate` | string | Events starting on or after (YYYY-MM-DD) |
| `endDate` | string | Events ending on or before (YYYY-MM-DD) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |

Response:
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### Get Single Event
```
GET /api/events/:id
```

### Create Event
```
POST /api/events
```

Body:
```json
{
  "title": "Rama Navami",
  "titleKn": "ರಾಮ ನವಮಿ",
  "description": "Celebration of Lord Rama's birthday",
  "descriptionKn": "ಭಗವಾನ್ ರಾಮನ ಜನ್ಮದಿನದ ಆಚರಣೆ",
  "startDate": "2026-03-30T09:00:00.000Z",
  "endDate": "2026-03-30T18:00:00.000Z",
  "startTime": "09:00",
  "endTime": "18:00",
  "location": "Main Temple Hall",
  "isOnline": false,
  "type": "FESTIVAL",
  "featured": true,
  "published": true,
  "maxAttendees": 500,
  "organizer": "Chief Priest",
  "contactPhone": "+91 98765 43210",
  "contactEmail": "priest@temple.org"
}
```

### Update Event
```
PUT /api/events/:id
```

### Delete Event (Soft Delete)
```
DELETE /api/events/:id
```

### Event Actions
```
POST /api/events/:id/actions
```

Body:
```json
{
  "action": "toggleFeatured" | "togglePublished" | "incrementAttendees" | "decrementAttendees"
}
```

### Event Statistics
```
GET /api/events/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "upcoming": 5,
    "ongoing": 1,
    "completed": 18,
    "featured": 3
  }
}
```

### Calendar Events
```
GET /api/events/calendar?startDate=2026-03-01&endDate=2026-03-31
```

Returns simplified event objects optimized for calendar views:

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "date": "2026-03-30",
      "title": "Rama Navami",
      "titleKn": "ರಾಮ ನವಮಿ",
      "type": "FESTIVAL",
      "featured": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "location": "Main Temple Hall"
    }
  ],
  "count": 1,
  "meta": {
    "startDate": "2026-03-01",
    "endDate": "2026-03-31"
  }
}
```

## Kannada (ಕನ್ನಡ) Support

The Events module supports bilingual content with English and Kannada fields:

### Fields with Kannada Support
- `title` / `titleKn`
- `description` / `descriptionKn`

### Search Behavior

The search is intelligent and handles mixed-language queries:

| Search Term | Example | Behavior |
|------------|---------|----------|
| English only | `Rama` | Case-insensitive search in `title`, `description`, `location`, and `titleKn` |
| Kannada only | `ರಾಮ` | Searches in `titleKn`, `descriptionKn`, and `title` (fallback) |
| Mixed | `Rama ನವಮಿ` | Searches all fields |
| Numbers | `2026` | Searches all fields |

### Example Searches

```bash
# Find "Rama Navami" by English name
GET /api/events?search=Rama
GET /api/events?search=Navami

# Find by Kannada name (exact match)
GET /api/events?search=ರಾಮ
GET /api/events?search=ರಾಮನವಮಿ
GET /api/events?search=ರಾಮ ನವಮಿ

# Find "Raghavendra" - should match both:
GET /api/events?search=Raghavendra
GET /api/events?search=ರಾಘವೇಂದ್ರ
GET /api/events?search=raghavendra  # case insensitive

# Combined mixed-language search
GET /api/events?search=rayara
GET /api/events?search=ರಾಯರ
GET /api/events?search=Rama ನವಮಿ

# Partial matches work too
GET /api/events?search=ರಾ
GET /api/events?search=Ragh
```

### Test Scenarios

| Test Case | Expected Behavior |
|-----------|------------------|
| `ರಾಮನವಮಿ` | Should find Rama Navami events |
| `ರಾಮ ನವಮಿ` | Should find Rama Navami events (with space) |
| `rayara` | Should find ರಾಯರ (Ragara) events |
| `ರಾಯರ` | Should find Raghavendra/Ragara events |
| `Raghavendra` | Should find both English and Kannada titles |
| `ರಾಘವೇಂದ್ರ` | Should find Raghavendra in Kannada script |

## Event Types

| Type | Label | Use Case |
|------|-------|----------|
| `GENERAL` | General | Regular temple activities |
| `FESTIVAL` | Festival | Religious festivals |
| `WORKSHOP` | Workshop | Educational programs |
| `SPIRITUAL` | Spiritual | Spiritual discourses |
| `CULTURAL` | Cultural | Cultural programs |
| `MAINTENANCE` | Maintenance | Temple maintenance closures |

## Event Status

| Status | Label | Description |
|--------|-------|-------------|
| `UPCOMING` | Upcoming | Event hasn't started yet |
| `ONGOING` | Ongoing | Event is currently happening |
| `COMPLETED` | Completed | Event has ended |
| `CANCELLED` | Cancelled | Event was cancelled |

## Future: Event Recurrence (Phase 5+)

For recurring events (Ekadashi, Thursdays, annual festivals), the following schema additions are planned:

```prisma
enum RecurrenceRule {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  ANNUALLY
  EKADASHI      // Every Ekadashi (11th lunar day)
  THURSDAY      // Every Thursday
  MADHWA_NAVAMI // Madhwa Navami
  PANCHAKA      // Panchaka period
}

model Event {
  // ... existing fields
  
  // Recurrence
  isRecurring    Boolean          @default(false)
  recurrenceRule RecurrenceRule?
  recurrenceEnd  DateTime?        // End date for recurrence
  
  // Instance tracking
  parentEventId  String?
  parentEvent    Event?           @relation("EventInstances", fields: [parentEventId], references: [id])
  instances      Event[]          @relation("EventInstances")
}
```

This allows:
- Every Ekadashi event
- Every Thursday spiritual discourse
- Annual Aaradhane
- Monthly Sankalpa Seva
