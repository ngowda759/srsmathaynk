/**
 * Complete Database Seed Script
 * Seeds all reference and content data for production
 * 
 * Usage: npm run db:seed:all
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// SEED DATA - Temple Information
// ============================================================================

const TEMPLE_INFO = {
  name: "Sri Raghavendra Swamy Matha",
  shortName: "SRS Matha",
  tagline: "A sacred place of devotion and tradition",
  description: `Sri Raghavendra Swamy Matha is a revered spiritual institution dedicated to Lord Raghavendra Swamy, located in Yelahanka, Bengaluru. Our temple serves as a spiritual haven for devotees seeking peace, blessings, and divine connection.

The matha was established with the blessings of the lineage of Guru Raghavendra Swamy and continues the sacred tradition of serving devotees with devotion and dedication. We offer various sevas, spiritual programs, and community services to spread the teachings of Madhvacharya and Raghavendra Swamy.`,
  address: "Near Yelahanka Old Town",
  city: "Bengaluru",
  district: "Bengaluru North",
  state: "Karnataka",
  country: "India",
  pincode: "560064",
  phone: "+91-80-2844-1234",
  alternatePhone: "+91-80-2844-5678",
  email: "info@srsmatha.org",
  website: "https://srsmatha.org",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.1234567890!2d77.5763!3d13.1006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzAwLjAiTiA3N8KwMzQnMzUuMCJF!5e0!3m2!1sen!2sin!4v1234567890",
  latitude: 13.1006,
  longitude: 77.5763,
  socialFacebook: "https://facebook.com/srsmatha",
  socialInstagram: "https://instagram.com/srsmatha",
  socialYoutube: "https://youtube.com/srsmatha",
  socialTwitter: "https://twitter.com/srsmatha",
  socialWhatsapp: "https://wa.me/919876543210",
  bankName: "State Bank of India",
  bankAccountName: "Sri Raghavendra Swamy Matha",
  bankAccountNumber: "XXXXXXXX1234",
  bankIFSCCode: "SBIN0001234",
  bankUPIId: "srsmatha@sbi",
  establishedYear: 2000,
  priestCount: 5,
  dailyVisitors: 500,
};

// ============================================================================
// SEED DATA - Gallery Categories
// ============================================================================

const GALLERY_CATEGORIES = [
  { name: "Temple Architecture", nameKn: "ದೇವಾಲಯ ವಾಸ್ತುಶಿಲ್ಪ", slug: "temple-architecture", icon: "temple", color: "#f59e0b", order: 1 },
  { name: "Festivals", nameKn: "ಹಬ್ಬಗಳು", slug: "festivals", icon: "celebration", color: "#ea580c", order: 2 },
  { name: "Sevas", nameKn: "ಸೇವೆಗಳು", slug: "sevas", icon: "service", color: "#16a34a", order: 3 },
  { name: "Aradhana", nameKn: "ಆರಾಧನೆ", slug: "aradhana", icon: "prayer", color: "#7c3aed", order: 4 },
  { name: "Events", nameKn: "ಕಾರ್ಯಕ್ರಮಗಳು", slug: "events", icon: "event", color: "#0891b2", order: 5 },
  { name: "Daily Darshan", nameKn: "ದೈನಂದಿನ ದರ್ಶನ", slug: "daily-darshan", icon: "gallery", color: "#be123c", order: 6 },
];

// ============================================================================
// SEED DATA - Site Settings
// ============================================================================

const SITE_SETTINGS = [
  { key: "TEMPLE_NAME", value: "Sri Raghavendra Swamy Matha", category: "general", isPublic: true },
  { key: "DEFAULT_LANGUAGE", value: "en", category: "general", isPublic: true },
  { key: "TIMEZONE", value: "Asia/Kolkata", category: "general", isPublic: true },
  { key: "CURRENCY", value: "INR", category: "general", isPublic: true },
  { key: "DATE_FORMAT", value: "DD/MM/YYYY", category: "general", isPublic: true },
  { key: "TIME_FORMAT", value: "HH:mm", category: "general", isPublic: true },
  { key: "PRIMARY_COLOR", value: "#f59e0b", category: "theme", isPublic: true },
  { key: "SECONDARY_COLOR", value: "#d4a853", category: "theme", isPublic: true },
  { key: "ACCENT_COLOR", value: "#ea580c", category: "theme", isPublic: true },
  { key: "DARK_MODE", value: "false", category: "theme", isPublic: true },
  { key: "SITE_TITLE", value: "Sri Raghavendra Swamy Matha - Yelahanka, Bengaluru", category: "seo", isPublic: true },
  { key: "META_DESCRIPTION", value: "Official website of Sri Raghavendra Swamy Matha, Yelahanka, Bengaluru.", category: "seo", isPublic: true },
  { key: "META_KEYWORDS", value: "temple, sri raghavendra swamy, devotional, yelahanka, bengaluru, madhva", category: "seo", isPublic: true },
  { key: "AI_ENABLED", value: "true", category: "ai", isPublic: false },
  { key: "AI_PROVIDER", value: "openai", category: "ai", isPublic: false },
  { key: "AI_MODEL", value: "gpt-4o-mini", category: "ai", isPublic: false },
  { key: "DONATIONS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "BOOKINGS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "GALLERY_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "EVENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "ANNOUNCEMENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "KNOWLEDGE_BASE_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "TESTIMONIALS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "PANCHANGA_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "AI_CHAT_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "CONTACT_EMAIL", value: "info@srsmatha.org", category: "contact", isPublic: true },
  { key: "CONTACT_PHONE", value: "+91-80-2844-1234", category: "contact", isPublic: true },
  { key: "SUPPORT_EMAIL", value: "support@srsmatha.org", category: "contact", isPublic: false },
  { key: "SOCIAL_FACEBOOK", value: "https://facebook.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_INSTAGRAM", value: "https://instagram.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_YOUTUBE", value: "https://youtube.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_WHATSAPP", value: "https://wa.me/919876543210", category: "social", isPublic: true },
  { key: "MIN_DONATION_AMOUNT", value: "100", category: "payment", isPublic: true },
  { key: "MAX_DONATION_AMOUNT", value: "1000000", category: "payment", isPublic: true },
  { key: "PAYMENT_GATEWAY", value: "razorpay", category: "payment", isPublic: false },
  { key: "ADVANCE_BOOKING_DAYS", value: "30", category: "booking", isPublic: true },
  { key: "CANCELLATION_HOURS", value: "24", category: "booking", isPublic: true },
  { key: "CANCELLATION_FEE_PERCENT", value: "10", category: "booking", isPublic: true },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedTempleInfo() {
  console.log("📿 Seeding temple information...");
  
  const existing = await prisma.templeInfo.findFirst();
  
  if (existing) {
    await prisma.templeInfo.update({
      where: { id: existing.id },
      data: TEMPLE_INFO,
    });
    console.log("  ✓ Updated temple information");
  } else {
    await prisma.templeInfo.create({ data: TEMPLE_INFO });
    console.log("  ✓ Created temple information");
  }
}

async function seedSiteSettings() {
  console.log("⚙️ Seeding site settings...");
  
  for (const setting of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: {
        value: setting.value,
        category: setting.category,
        isPublic: setting.isPublic,
      },
    });
  }
  console.log(`  ✓ Seeded ${SITE_SETTINGS.length} site settings`);
}

async function seedGalleryCategories() {
  console.log("🖼️ Seeding gallery categories...");
  
  for (const category of GALLERY_CATEGORIES) {
    await prisma.galleryCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }
  console.log(`  ✓ Seeded ${GALLERY_CATEGORIES.length} gallery categories`);
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("");
  console.log("=".repeat(70));
  console.log("Sri Raghavendra Swamy Matha - Complete Database Seed");
  console.log("=".repeat(70));
  console.log("");

  try {
    await seedTempleInfo();
    await seedSiteSettings();
    await seedGalleryCategories();

    console.log("");
    console.log("=".repeat(70));
    console.log("✅ Complete seed completed successfully!");
    console.log("=".repeat(70));
    console.log("");
    console.log("Seeded data summary:");
    console.log("  - Temple information");
    console.log("  - Site settings");
    console.log("  - Gallery categories");
    console.log("");
  } catch (error) {
    console.error("Error during seed:", error);
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
