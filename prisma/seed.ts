/**
 * Database Seed Script
 * 
 * Seeds reference and configuration data for the Sri Raghavendra Swamy Temple portal.
 * This script is idempotent - safe to run multiple times.
 * 
 * Usage: npx prisma db seed
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// SEED DATA
// ============================================================================

const ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "Super Administrator with full system access",
    permissions: [
      "manage_users",
      "manage_settings",
      "manage_content",
      "manage_events",
      "manage_sevas",
      "manage_donations",
      "manage_gallery",
      "manage_knowledge",
      "view_reports",
      "manage_billing",
      "access_admin",
      "access_dashboard",
    ],
  },
  {
    name: "ADMIN",
    description: "Temple Administrator with content management access",
    permissions: [
      "manage_content",
      "manage_events",
      "manage_sevas",
      "manage_donations",
      "manage_gallery",
      "manage_knowledge",
      "view_reports",
      "access_admin",
      "access_dashboard",
    ],
  },
  {
    name: "PRIEST",
    description: "Temple Priest with event and service management",
    permissions: ["manage_events", "manage_sevas", "access_dashboard"],
  },
  {
    name: "STAFF",
    description: "Temple Staff with limited management access",
    permissions: ["manage_events", "manage_sevas", "access_dashboard"],
  },
  {
    name: "VOLUNTEER",
    description: "Temple Volunteer with basic dashboard access",
    permissions: ["access_dashboard"],
  },
  {
    name: "DEVOTEE",
    description: "Regular devotee with basic access",
    permissions: [],
  },
];

const TEMPLE_INFO = {
  name: "Sri Raghavendra Swamy Matha",
  shortName: "SRS Matha",
  tagline: "A sacred place of devotion and tradition",
  description:
    "Sri Raghavendra Swamy Matha is a revered spiritual institution dedicated to Lord Raghavendra Swamy, located in Yelahanka, Bengaluru.",
  address: "",
  city: "Bengaluru",
  district: "Bengaluru North",
  state: "Karnataka",
  country: "India",
  pincode: "560064",
  phone: "",
  alternatePhone: "",
  email: "",
  website: "",
  mapEmbedUrl: "",
  latitude: 13.1006,
  longitude: 77.5763,
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialYoutube: "",
  socialWhatsapp: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIFSCCode: "",
  bankUPIId: "",
  establishedYear: 2000,
};

const HOMEPAGE_CONFIG = {
  heroTitle: "Sri Raghavendra Swamy Temple",
  heroSubtitle: "A sacred place of devotion and tradition",
  showFeaturedEvents: true,
  showFeaturedSevas: true,
  showDonationSection: true,
  showGalleryPreview: true,
  showAnnouncements: true,
  showTestimonials: true,
  showPanchanga: true,
  featuredEventsLimit: 6,
  featuredSevasLimit: 8,
  galleryPreviewLimit: 8,
  testimonialLimit: 5,
  donationTitle: "Support Our Temple",
  donationSubtitle: "Your generous contributions help us serve devotees",
  footerCopyright: `© ${new Date().getFullYear()} Sri Raghavendra Swamy Matha. All rights reserved.`,
  footerTagline: "Serving devotees with devotion and dedication",
};

const TEMPLE_DAYS = [
  {
    dayOfWeek: 0,
    name: "Sunday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "21:00",
    isHoliday: false,
    notes: "Special poojas and aaradhanes",
  },
  {
    dayOfWeek: 1,
    name: "Monday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "20:30",
    isHoliday: false,
  },
  {
    dayOfWeek: 2,
    name: "Tuesday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "20:30",
    isHoliday: false,
  },
  {
    dayOfWeek: 3,
    name: "Wednesday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "20:30",
    isHoliday: false,
  },
  {
    dayOfWeek: 4,
    name: "Thursday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "20:30",
    isHoliday: false,
    notes: "Special sevas available",
  },
  {
    dayOfWeek: 5,
    name: "Friday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "20:30",
    isHoliday: false,
  },
  {
    dayOfWeek: 6,
    name: "Saturday",
    morningOpenTime: "05:00",
    morningCloseTime: "13:00",
    eveningOpenTime: "16:00",
    eveningCloseTime: "21:00",
    isHoliday: false,
    notes: "Weekend - extended evening hours",
  },
];

const SITE_SETTINGS = [
  // General
  { key: "TEMPLE_NAME", value: "Sri Raghavendra Swamy Matha", category: "general", isPublic: true },
  { key: "DEFAULT_LANGUAGE", value: "en", category: "general", isPublic: true },
  { key: "TIMEZONE", value: "Asia/Kolkata", category: "general", isPublic: true },
  { key: "CURRENCY", value: "INR", category: "general", isPublic: true },
  { key: "DATE_FORMAT", value: "DD/MM/YYYY", category: "general", isPublic: true },
  { key: "TIME_FORMAT", value: "HH:mm", category: "general", isPublic: true },

  // Theme
  { key: "PRIMARY_COLOR", value: "#f59e0b", category: "theme", isPublic: true },
  { key: "SECONDARY_COLOR", value: "#d4a853", category: "theme", isPublic: true },
  { key: "ACCENT_COLOR", value: "#ea580c", category: "theme", isPublic: true },
  { key: "DARK_MODE", value: "false", category: "theme", isPublic: true },

  // SEO
  { key: "SITE_TITLE", value: "Sri Raghavendra Swamy Matha - Yelahanka", category: "seo", isPublic: true },
  { key: "META_DESCRIPTION", value: "Official website of Sri Raghavendra Swamy Matha, Yelahanka, Bengaluru. Devotional center for Lord Raghavendra Swamy devotees.", category: "seo", isPublic: true },
  { key: "META_KEYWORDS", value: "temple, sri raghavendra swamy, devotional, yelahanka, bengaluru, madhva", category: "seo", isPublic: true },
  { key: "OG_IMAGE", value: "", category: "seo", isPublic: true },

  // AI Configuration
  { key: "AI_ENABLED", value: "true", category: "ai", isPublic: false },
  { key: "AI_PROVIDER", value: "openai", category: "ai", isPublic: false },
  { key: "AI_MODEL", value: "gpt-4o-mini", category: "ai", isPublic: false },

  // Feature Flags
  { key: "DONATIONS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "BOOKINGS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "GALLERY_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "EVENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "ANNOUNCEMENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "KNOWLEDGE_BASE_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "TESTIMONIALS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "PANCHANGA_ENABLED", value: "true", category: "features", isPublic: true },

  // Contact
  { key: "CONTACT_EMAIL", value: "", category: "contact", isPublic: true },
  { key: "CONTACT_PHONE", value: "", category: "contact", isPublic: true },
  { key: "SUPPORT_EMAIL", value: "", category: "contact", isPublic: false },

  // Social
  { key: "SOCIAL_FACEBOOK", value: "", category: "social", isPublic: true },
  { key: "SOCIAL_TWITTER", value: "", category: "social", isPublic: true },
  { key: "SOCIAL_INSTAGRAM", value: "", category: "social", isPublic: true },
  { key: "SOCIAL_YOUTUBE", value: "", category: "social", isPublic: true },
  { key: "SOCIAL_WHATSAPP", value: "", category: "social", isPublic: true },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedRoles() {
  console.log("Seeding roles...");

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: role.permissions,
      },
      create: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      },
    });
  }

  console.log(`✓ Seeded ${ROLES.length} roles`);
}

async function seedTempleInfo() {
  console.log("Seeding temple information...");

  const existing = await prisma.templeInfo.findFirst();

  if (existing) {
    await prisma.templeInfo.update({
      where: { id: existing.id },
      data: TEMPLE_INFO,
    });
    console.log("✓ Updated existing temple information");
  } else {
    await prisma.templeInfo.create({
      data: TEMPLE_INFO,
    });
    console.log("✓ Created temple information");
  }
}

async function seedHomepageConfig() {
  console.log("Seeding homepage configuration...");

  const existing = await prisma.homepageConfig.findFirst();

  if (existing) {
    await prisma.homepageConfig.update({
      where: { id: existing.id },
      data: HOMEPAGE_CONFIG,
    });
    console.log("✓ Updated existing homepage configuration");
  } else {
    await prisma.homepageConfig.create({
      data: HOMEPAGE_CONFIG,
    });
    console.log("✓ Created homepage configuration");
  }
}

async function seedTempleDays() {
  console.log("Seeding temple days...");

  for (const day of TEMPLE_DAYS) {
    await prisma.templeDay.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      update: {
        name: day.name,
        morningOpenTime: day.morningOpenTime,
        morningCloseTime: day.morningCloseTime,
        eveningOpenTime: day.eveningOpenTime,
        eveningCloseTime: day.eveningCloseTime,
        isHoliday: day.isHoliday,
        notes: day.notes,
      },
      create: {
        ...day,
        isActive: true,
      },
    });
  }

  console.log(`✓ Seeded ${TEMPLE_DAYS.length} temple days`);
}

async function seedSiteSettings() {
  console.log("Seeding site settings...");

  for (const setting of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        category: setting.category,
        isPublic: setting.isPublic,
      },
      create: {
        key: setting.key,
        value: setting.value,
        category: setting.category,
        isPublic: setting.isPublic,
      },
    });
  }

  console.log(`✓ Seeded ${SITE_SETTINGS.length} site settings`);
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Sri Raghavendra Swamy Matha - Database Seed");
  console.log("=".repeat(60));
  console.log();

  try {
    // Run all seed functions in a transaction
    await prisma.$transaction(async (tx) => {
      // Note: For transaction, we need to use the transaction client
      // But upsert operations don't need explicit transaction wrapping
      // as each upsert is atomic
    });

    // Seed all data (each upsert is atomic)
    await seedRoles();
    await seedTempleInfo();
    await seedHomepageConfig();
    await seedTempleDays();
    await seedSiteSettings();

    console.log();
    console.log("=".repeat(60));
    console.log("Seed completed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Seeded data summary:");
    console.log(`  - ${ROLES.length} roles`);
    console.log(`  - 1 temple info`);
    console.log(`  - 1 homepage config`);
    console.log(`  - ${TEMPLE_DAYS.length} temple days`);
    console.log(`  - ${SITE_SETTINGS.length} site settings`);
    console.log();
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
