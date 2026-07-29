# Admin Guide
## SRS Math Temple Portal

**Version:** 1.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Content Management](#content-management)
5. [Events Management](#events-management)
6. [Seva Management](#seva-management)
7. [Donations & Billing](#donations--billing)
8. [Gallery Management](#gallery-management)
9. [Settings](#settings)
10. [Reports & Analytics](#reports--analytics)

---

## Getting Started

### Accessing Admin Panel

1. Navigate to `/admin`
2. Log in with your admin credentials
3. Complete 2FA if enabled

### Admin Roles & Permissions

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access, user management, settings |
| ADMIN | Content management, reports, donations |
| STAFF | Event management, bookings, announcements |
| PRIEST | Event scheduling, seva management |

### Navigation

```
Admin Panel
├── Dashboard (overview & stats)
├── Users
│   ├── All Users
│   ├── Roles
│   └── Permissions
├── Content
│   ├── Announcements
│   ├── FAQs
│   ├── Daily Quotes
│   └── Pages
├── Events
│   ├── All Events
│   ├── Festivals
│   └── Calendar
├── Sevas
│   ├── All Sevas
│   ├── Categories
│   └── Bookings
├── Donations
│   ├── All Donations
│   ├── Campaigns
│   └── Reports
├── Gallery
│   ├── Albums
│   ├── Categories
│   └── Items
└── Settings
    ├── General
    ├── Payments
    ├── AI Configuration
    └── Backup
```

---

## Dashboard Overview

### Widgets Available

| Widget | Description | Refresh Rate |
|--------|-------------|--------------|
| Today's Visitors | Count of unique visitors | Real-time |
| Active Bookings | Current day's bookings | Real-time |
| Donations Today | Amount collected today | Real-time |
| Announcements | Active announcement count | 5 min |
| Upcoming Events | Next 7 days | Daily |
| Recent Activity | Latest 10 actions | Real-time |

### Quick Actions

- **Add Announcement**: Create new announcement
- **Add Event**: Schedule new event
- **View Reports**: Generate donation/event reports
- **Manage Sevas**: View/modify sevas

---

## User Management

### Adding New Users

1. Go to **Users > All Users**
2. Click **Add User**
3. Fill in details:
   - Email (required)
   - Name
   - Phone
   - Address
4. Assign role(s)
5. Click **Create**

### Managing Roles

1. Go to **Users > Roles**
2. View existing roles:
   - SUPER_ADMIN
   - ADMIN
   - STAFF
   - PRIEST
   - VOLUNTEER
   - DEVOTEE

3. Role Permissions:
   ```
   SUPER_ADMIN: All permissions
   ADMIN: Content, events, donations, reports
   STAFF: Events, sevas, announcements
   PRIEST: Events, sevas
   VOLUNTEER: Dashboard access
   DEVOTEE: Basic access
   ```

### User Status

| Status | Meaning | Action |
|--------|---------|--------|
| Active | Full access | Normal |
| Pending | Email not verified | Resend verification |
| Suspended | Temporary block | Unsuspend |
| Deleted | Soft-deleted | Restore or permanent delete |

---

## Content Management

### Announcements

#### Creating Announcement

1. Navigate to **Content > Announcements**
2. Click **New Announcement**
3. Fill form:
   - Title (required)
   - Content (rich text)
   - Type: INFO / WARNING / URGENT / EVENT
   - Priority: LOW / NORMAL / HIGH / CRITICAL
4. Set date range:
   - Start Date
   - End Date (optional)
5. Toggle **Pin to top** if needed
6. Click **Publish**

#### Announcement Types

| Type | Color | Use Case |
|------|-------|----------|
| INFO | Blue | General information |
| WARNING | Yellow | Temporary changes |
| URGENT | Red | Immediate attention |
| EVENT | Green | Festival/event info |

### FAQs

#### Creating FAQ

1. Go to **Content > FAQs**
2. Click **Add FAQ**
3. Enter:
   - Question
   - Answer (rich text)
   - Category
   - Display order
4. Toggle **Pin this FAQ**
5. Click **Save**

#### FAQ Categories
- Temple Timings
- Sevas
- Donations
- Festivals
- General

### Daily Quotes

1. **Content > Daily Quotes**
2. Add quote with:
   - Quote text
   - Translation (optional)
   - Source
   - Language: English / Kannada / Hindi
   - Category: Devotion / Wisdom / Service

---

## Events Management

### Creating Event

1. Navigate to **Events > All Events**
2. Click **Create Event**
3. Fill details:

#### Basic Information
- Title (English)
- Title (Kannada) - optional
- Description
- Category: SPIRITUAL / CULTURAL / FESTIVAL / SPECIAL

#### Date & Time
- Event Date
- Start Time
- End Time
- All Day toggle

#### Location & Status
- Location
- Status: DRAFT / PUBLISHED / CANCELLED
- Featured: Yes/No

4. Click **Save Draft** or **Publish**

### Recurring Events

For events that repeat:
1. Check **Enable Recurrence**
2. Configure:
   - Frequency: Daily / Weekly / Monthly / Yearly
   - Interval (every N days/weeks/etc)
   - End Date

### Managing Festival Events

Special handling for festivals:
1. Mark as **Featured**
2. Add to festival calendar
3. Link to gallery album
4. Set extended timings

---

## Seva Management

### Creating Seva

1. **Sevas > All Sevas**
2. Click **Add Seva**

#### Seva Details
- Name (English)
- Name (Kannada)
- Description
- Category
- Duration (minutes)

#### Scheduling
- Available Days (select)
- Start Time
- End Time
- Slot Duration

#### Pricing
- Price (₹)
- Max Bookings per Slot

#### Settings
- Online Booking: Enable/Disable
- Featured: Yes/No
- Display Order

### Managing Bookings

View all bookings at **Sevas > Bookings**

| Filter | Use |
|--------|-----|
| Date Range | Filter by booking date |
| Status | Pending / Confirmed / Completed / Cancelled |
| Seva Type | Filter by specific seva |
| Payment | Paid / Unpaid |

#### Booking Actions
- **View Details**: Full booking information
- **Confirm**: Approve pending booking
- **Cancel**: Cancel with refund process
- **Reschedule**: Change booking date/time

---

## Donations & Billing

### Donation Dashboard

**Key Metrics:**
- Today's Donations
- This Month
- This Year
- Average Donation

### Creating Donation Campaign

1. **Donations > Campaigns**
2. Click **New Campaign**
3. Enter:
   - Campaign Name
   - Description
   - Goal Amount
   - Start Date
   - End Date
   - Featured: Yes/No

### Processing Donations

#### Manual Donation Entry
1. **Donations > Add Manual**
2. Enter:
   - Donor Name
   - Donor Email
   - Amount
   - Payment Method
   - Campaign (if applicable)
   - Notes

#### Online Donation Tracking
View all online donations with:
- Payment status
- Transaction ID
- Razorpay reference

### Refunds

1. Find donation in list
2. Click **Refund**
3. Confirm refund amount
4. Refund processed via Razorpay

### Generating Receipts

1. Select donation(s)
2. Click **Generate Receipt**
3. Receipt sent via email automatically

### Tax Receipts (80G)

- Auto-generated for donations ≥ ₹500
- Download from donor portal
- Includes:
  - Donor details
  - Amount
  - Date
  - Temple info
  - 80G certificate number

---

## Gallery Management

### Creating Album

1. **Gallery > Albums**
2. Click **Create Album**
3. Fill:
   - Title (English)
   - Title (Kannada)
   - Description
   - Category
   - Visibility: PRIVATE / PUBLIC / UNLISTED
   - Event Date (optional)
   - Location

### Album Status

| Status | Meaning |
|--------|---------|
| DRAFT | Not visible to public |
| PUBLISHED | Visible to all |
| ARCHIVED | Hidden, preserved |

### Managing Media Items

1. Open album
2. Click **Add Media**
3. Upload files:
   - Supported: JPG, PNG, GIF, WebP
   - Max size: 10MB per file
4. Add captions and alt text
5. Set display order

### Gallery Categories

| Category | Slug | Use |
|----------|------|-----|
| Temple Architecture | temple-architecture | Temple photos |
| Festivals | festivals | Festival events |
| Sevas | sevas | Seva photos |
| Aradhana | aradhana | Annual aradhana |
| Events | events | General events |

---

## Settings

### General Settings

| Setting | Description |
|---------|-------------|
| Temple Name | Display name |
| Tagline | Short description |
| Contact Email | Public contact |
| Contact Phone | Public phone |
| Address | Full address |

### Social Media

| Platform | Field |
|----------|-------|
| Facebook | URL |
| Instagram | URL |
| YouTube | URL |
| WhatsApp | Number/URL |

### Payment Settings

| Setting | Value |
|---------|-------|
| Gateway | Razorpay |
| Currency | INR |
| Min Donation | ₹100 |
| Max Donation | ₹10,00,000 |

### AI Configuration

| Setting | Description |
|---------|-------------|
| AI Enabled | Toggle AI assistant |
| Provider | OpenAI |
| Model | gpt-4o-mini |
| Max Tokens | 500 |
| Temperature | 0.7 |

### Feature Flags

Enable/disable features:
- Donations
- Bookings
- Gallery
- Events
- Announcements
- AI Chat
- Testimonials
- Panchanga

---

## Reports & Analytics

### Available Reports

| Report | Description | Format |
|--------|-------------|--------|
| Donation Summary | Daily/weekly/monthly | PDF, Excel |
| Event Attendance | Per event | PDF |
| Seva Statistics | Popular sevas | PDF |
| User Activity | Logins, actions | PDF |
| Financial | Income/expenditure | PDF |

### Generating Reports

1. Navigate to **Reports**
2. Select report type
3. Set date range
4. Click **Generate**
5. Download or email

### Custom Reports

For custom reports:
1. Click **Custom Report**
2. Select metrics
3. Set filters
4. Choose visualization
5. Schedule (daily/weekly/monthly)

### Exporting Data

Available formats:
- PDF (formatted report)
- Excel (raw data)
- CSV (spreadsheet import)
- JSON (API integration)

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New item |
| `Ctrl + S` | Save |
| `Ctrl + F` | Search |
| `Ctrl + E` | Edit mode |
| `Ctrl + ,` | Settings |
| `Esc` | Cancel/Close |

---

## Support

For admin support:
- Email: admin@srsmatha.org
- Phone: +91-80-XXXX-XXXX
- Hours: Mon-Sat, 9 AM - 6 PM IST

---

*Document Version: 1.0*
