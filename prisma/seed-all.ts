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
// SEED DATA - Guru Parampara (Lineage)
// ============================================================================

const GURU_PARAMPARA = [
  {
    name: "Madhvacharya",
    sanskritName: "श्री Madhvacharya",
    period: "1238-1317 CE",
    description: "Founder of Dvaita Vedanta philosophy, the triple doctrine of difference between God, soul, and matter.",
    role: "Philosophical Founder",
    imageUrl: null,
    order: 1,
  },
  {
    name: "Madhava Vidyaranya",
    sanskritName: "Madhava Vidyaranya",
    period: "14th Century CE",
    description: "Shri Madhava Vidyaranya, the spiritual disciple of Madhvacharya's lineage, established the Sringeri Sharada Peetham.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 2,
  },
  {
    name: "Padmanabha Tirtha",
    sanskritName: "Padmanabha Tirtha",
    period: "14th Century CE",
    description: "Successor to Madhava Vidyaranya in the spiritual lineage.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 3,
  },
  {
    name: "Narayana Pandita",
    sanskritName: "Narayana Pandita",
    period: "14th Century CE",
    description: "Eminent scholar and guru in the Madhva tradition.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 4,
  },
  {
    name: "Madhava Tirtha",
    sanskritName: "Madhava Tirtha",
    period: "14th-15th Century CE",
    description: "Distinguished guru who contributed to the spread of Dvaita philosophy.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 5,
  },
  {
    name: "Aksobhya Tirtha",
    sanskritName: "Aksobhya Tirtha",
    period: "15th Century CE",
    description: "Guru in the spiritual lineage who maintained the teachings of Madhvacharya.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 6,
  },
  {
    name: "Jayatirtha",
    sanskritName: "Jayatirtha",
    period: "15th Century CE",
    description: "Scholar and spiritual master who defended Dvaita philosophy against critiques.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 7,
  },
  {
    name: "Sri Vibhudendra Tirtha",
    sanskritName: "श्री विभुदेवन्द्र तीर्थ",
    period: "1595-1671 CE",
    description: "The 21st swamiji in the Guru Parampara, born in Karnataka. He was a great scholar and spiritual master.",
    role: "Guru in Lineage",
    imageUrl: null,
    order: 8,
  },
  {
    name: "Raghavendra Swamy",
    sanskritName: "श्री राघवेन्द्र स्वामी",
    period: "1595-1671 CE",
    description: "One of the most revered saints in Karnataka, born as a normal child but later revealed as an incarnation of a gatekeeper of Vaikuntha. He performed numerous miracles and his samadhi at Mantralayam is a major pilgrimage site. He is worshipped as a deity by millions of devotees.",
    role: "Primary Deity of This Matha",
    imageUrl: null,
    order: 9,
  },
];

// ============================================================================
// SEED DATA - Temple History
// ============================================================================

const TEMPLE_HISTORY = [
  {
    title: "Establishment of SRS Matha",
    year: 2000,
    description: "The Sri Raghavendra Swamy Matha was established in Yelahanka, Bengaluru with the blessings of the spiritual lineage. The temple was built to serve the growing community of devotees in North Bengaluru.",
    importance: "high",
    order: 1,
  },
  {
    title: "First Prathista (Consecration)",
    year: 2001,
    description: "The main deity of Raghavendra Swamy was consecrated with traditional Vedic rituals, attended by thousands of devotees from across Karnataka.",
    importance: "high",
    order: 2,
  },
  {
    title: "Introduction of Daily Sevas",
    year: 2002,
    description: "The matha began offering daily sevas including Suprabhatha Seva, Nijalu Seve, and Pocket Temple services for devotees.",
    importance: "medium",
    order: 3,
  },
  {
    title: "Annual Aradhana Ceremony Started",
    year: 2003,
    description: "The first annual Aradhana ceremony was conducted to commemorate the swamiji's passing (Maha Samadhi) on Margashirsha Shudda Dashami.",
    importance: "high",
    order: 4,
  },
  {
    title: "Online Seva Booking Launched",
    year: 2015,
    description: "The matha introduced online booking system for sevas and donations, making it convenient for devotees worldwide to participate.",
    importance: "medium",
    order: 5,
  },
];

// ============================================================================
// SEED DATA - FAQ Categories
// ============================================================================

const FAQ_CATEGORIES = [
  { name: "Temple Timings", slug: "temple-timings", icon: "clock", order: 1 },
  { name: "Sevas", slug: "sevas", icon: "service", order: 2 },
  { name: "Donations", slug: "donations", icon: "donation", order: 3 },
  { name: "Festivals", slug: "festivals", icon: "celebration", order: 4 },
  { name: "General", slug: "general", icon: "info", order: 5 },
];

// ============================================================================
// SEED DATA - FAQs
// ============================================================================

const FAQs = [
  {
    question: "What are the temple timings?",
    answer: "The temple is open from 5:00 AM to 1:00 PM and 4:00 PM to 8:30 PM on all days. Special timings apply on festival days.",
    category: "temple-timings",
    order: 1,
    isPinned: true,
  },
  {
    question: "Is there a dress code for visiting the temple?",
    answer: "Devotees are advised to wear traditional clothing. Men should wear dhoti or pants with shirts, and women should wear sarees or traditional suits. Decorated clothing is not permitted inside the sanctum.",
    category: "general",
    order: 2,
    isPinned: true,
  },
  {
    question: "How can I book sevas online?",
    answer: "You can book sevas through our website by creating an account, selecting the desired seva, choosing a date and time slot, and completing the payment. You will receive a confirmation via email and SMS.",
    category: "sevas",
    order: 3,
    isPinned: true,
  },
  {
    question: "What is the cancellation policy for sevas?",
    answer: "Cancellations are accepted up to 24 hours before the scheduled seva. A cancellation fee of 10% will be charged. No refunds are provided for cancellations within 24 hours.",
    category: "sevas",
    order: 4,
  },
  {
    question: "How can I make donations?",
    answer: "Donations can be made online through our website using net banking, UPI, or card payments. You can also donate in person at the temple's donation counter during operating hours.",
    category: "donations",
    order: 5,
    isPinned: true,
  },
  {
    question: "Are donations tax-deductible?",
    answer: "Yes, all donations above ₹500 are eligible for 80G tax exemption. You will receive a receipt via email within 24 hours of making the donation.",
    category: "donations",
    order: 6,
  },
  {
    question: "What are the major festivals celebrated?",
    answer: "Major festivals include Raghavendra Aradhana (December-January), Makara Sankranti, Sri Ramanavami, Hanuman Jayanti, and Shravan month celebrations.",
    category: "festivals",
    order: 7,
  },
  {
    question: "Can I perform special sevas on behalf of my family members?",
    answer: "Yes, you can book sevas on behalf of your family members. Please mention their names in the special requests field during booking.",
    category: "sevas",
    order: 8,
  },
  {
    question: "Is photography allowed inside the temple?",
    answer: "Photography is not allowed inside the sanctum sanctorum. External photography of the temple premises is permitted.",
    category: "general",
    order: 9,
  },
  {
    question: "How do I reach the temple?",
    answer: "The temple is located in Yelahanka Old Town, about 15 km from Kempegowda International Airport. Local buses and auto-rickshaws are available from Yelahanka Junction.",
    category: "general",
    order: 10,
  },
];

// ============================================================================
// SEED DATA - Daily Quotes
// ============================================================================

const DAILY_QUOTES = [
  {
    quote: "ಭಕ್ತಿಯು ಜ್ಞಾನದ ಕಣ್ಣನ್ನು ತೆರೆಯುತ್ತದೆ, ಮತ್ತು ಜ್ಞಾನವು ಮೋಕ್ಷದ ದಾರಿಯನ್ನು ತೋರಿಸುತ್ತದೆ।",
    translation: "Devotion opens the eye of knowledge, and knowledge shows the path to liberation.",
    source: "Raghavendra Swamy",
    category: "devotion",
    language: "kn",
  },
  {
    quote: "सर्वदा शुद्ध बुद्धि से कार्य करो, तो सफलता अवश्य मिलेगी।",
    translation: "Always work with pure intellect, then success will surely follow.",
    source: "Madhvacharya",
    category: "wisdom",
    language: "hi",
  },
  {
    quote: "The grace of God is like the sun, which illuminates all equally, but only those who turn towards it receive its warmth.",
    translation: "The divine grace is universal, but receptive hearts receive its fullness.",
    source: "Raghavendra Swamy",
    category: "devotion",
    language: "en",
  },
  {
    quote: "ಸತ್ಯವನ್ನು ಹೇಳು, ಧರ್ಮವನ್ನು ಆಚರಿಸು, ಪರಸ್ಪರ ಸಹಾಯದಿಂದ ಬಾಳು।",
    translation: "Speak truth, practice righteousness, and live by helping each other.",
    source: "Traditional",
    category: "wisdom",
    language: "kn",
  },
  {
    quote: "In the service of devotees, I find my greatest joy and purpose.",
    translation: "Serving devotees brings supreme satisfaction.",
    source: "Raghavendra Swamy",
    category: "service",
    language: "en",
  },
];

// ============================================================================
// SEED DATA - Festivals
// ============================================================================

const FESTIVALS = [
  {
    name: "Raghavendra Swamy Aradhana",
    nameKn: "ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಆರಾಧನೆ",
    description: "The most important festival commemorating the swamiji's attaining Samadhi. Special pujas, discourses, and annadanam are conducted for 10 days.",
    month: 12,
    day: 10,
    durationDays: 10,
    importance: "very_high",
    activities: JSON.stringify(["Suprabhatha Seva", "Mahamangalarchana", " discourses", "Annadanam", "Mahaprasadam"]),
  },
  {
    name: "Makara Sankranti",
    nameKn: "ಮಕರ ಸಂಕ್ರಾಂತಿ",
    description: "Harvest festival celebrated with special pujas and distribution of til Ladoo and yellu (sesame and peanuts).",
    month: 1,
    day: 14,
    durationDays: 1,
    importance: "high",
    activities: JSON.stringify(["Special puja", "Til Ladoo distribution", "Ganesha puja"]),
  },
  {
    name: "Sri Ramanavami",
    nameKn: "ಶ್ರೀ ರಾಮಾವತಾರ",
    description: "Celebration of Lord Rama's birth. Special Ramarchana and bhajan programs are conducted.",
    month: 3,
    day: 1,
    durationDays: 1,
    importance: "high",
    activities: JSON.stringify(["Ramarchana", "Bhajan program", "Ramayana path"]),
  },
  {
    name: "Hanuman Jayanti",
    nameKn: "ಹನುಮಾನ್ ಜಯಂತಿ",
    description: "Birthday of Lord Hanuman. Special abhishekam and puja at the Hanuman temple within the complex.",
    month: 4,
    day: 1,
    durationDays: 1,
    importance: "medium",
    activities: JSON.stringify(["Abhishekam", "Hanuman Chalisa", "Sundara Kandam path"]),
  },
  {
    name: "Shravan Shivaratri",
    nameKn: "ಶ್ರಾವಣ ಶಿವರಾತ್ರಿ",
    description: "Night-long vigil dedicated to Lord Shiva with special pujas and Rudra Abhishekam.",
    month: 7,
    day: 14,
    durationDays: 1,
    importance: "medium",
    activities: JSON.stringify(["Rudra Abhishekam", "Night vigil", "Lingarchana"]),
  },
  {
    name: "Guru Purnima",
    nameKn: "ಗುರು ಪೂರ್ಣಿಮಾ",
    description: "Day to honor our gurus and teachers. Special guruvandana and discourse programs.",
    month: 7,
    day: 13,
    durationDays: 1,
    importance: "high",
    activities: JSON.stringify(["Guruvandana", "Guru stotra", "Discourse program"]),
  },
];

// ============================================================================
// SEED DATA - Announcements
// ============================================================================

const ANNOUNCEMENTS = [
  {
    title: "Annual Aradhana 2024",
    content: "The Annual Raghavendra Swamy Aradhana will be celebrated from December 20-30, 2024. Devotees can book special sevas and accommodations online.",
    type: "EVENT",
    priority: "HIGH",
    isActive: true,
    isPinned: true,
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-31"),
  },
  {
    title: "Temple Renovation Fund",
    content: "We are raising funds for the renovation of the temple's inner sanctum. Your generous contributions will help preserve this sacred place for future generations. All donations above ₹500 are eligible for 80G tax exemption.",
    type: "INFO",
    priority: "NORMAL",
    isActive: true,
    isPinned: false,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
  },
  {
    title: "Online Seva Booking Available",
    content: "Devotees can now book all sevas online through our website. This includes Suprabhatha Seva, Nijalu Seve, and special poojas. Walk-in registrations are also available subject to availability.",
    type: "INFO",
    priority: "NORMAL",
    isActive: true,
    isPinned: false,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
  },
];

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
  { key: "SITE_TITLE", value: "Sri Raghavendra Swamy Matha - Yelahanka, Bengaluru", category: "seo", isPublic: true },
  { key: "META_DESCRIPTION", value: "Official website of Sri Raghavendra Swamy Matha, Yelahanka, Bengaluru. Devotional center for Lord Raghavendra Swamy devotees.", category: "seo", isPublic: true },
  { key: "META_KEYWORDS", value: "temple, sri raghavendra swamy, devotional, yelahanka, bengaluru, madhva, mantralayam", category: "seo", isPublic: true },

  // AI Configuration
  { key: "AI_ENABLED", value: "true", category: "ai", isPublic: false },
  { key: "AI_PROVIDER", value: "openai", category: "ai", isPublic: false },
  { key: "AI_MODEL", value: "gpt-4o-mini", category: "ai", isPublic: false },
  { key: "AI_MAX_TOKENS", value: "500", category: "ai", isPublic: false },
  { key: "AI_TEMPERATURE", value: "0.7", category: "ai", isPublic: false },

  // Feature Flags
  { key: "DONATIONS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "BOOKINGS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "GALLERY_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "EVENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "ANNOUNCEMENTS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "KNOWLEDGE_BASE_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "TESTIMONIALS_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "PANCHANGA_ENABLED", value: "true", category: "features", isPublic: true },
  { key: "AI_CHAT_ENABLED", value: "true", category: "features", isPublic: true },

  // Contact
  { key: "CONTACT_EMAIL", value: "info@srsmatha.org", category: "contact", isPublic: true },
  { key: "CONTACT_PHONE", value: "+91-80-2844-1234", category: "contact", isPublic: true },
  { key: "SUPPORT_EMAIL", value: "support@srsmatha.org", category: "contact", isPublic: false },

  // Social
  { key: "SOCIAL_FACEBOOK", value: "https://facebook.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_INSTAGRAM", value: "https://instagram.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_YOUTUBE", value: "https://youtube.com/srsmatha", category: "social", isPublic: true },
  { key: "SOCIAL_WHATSAPP", value: "https://wa.me/919876543210", category: "social", isPublic: true },

  // Payment
  { key: "MIN_DONATION_AMOUNT", value: "100", category: "payment", isPublic: true },
  { key: "MAX_DONATION_AMOUNT", value: "1000000", category: "payment", isPublic: true },
  { key: "PAYMENT_GATEWAY", value: "razorpay", category: "payment", isPublic: false },

  // Booking
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

async function seedFAQCategories() {
  console.log("❓ Seeding FAQ categories...");
  
  for (const category of FAQ_CATEGORIES) {
    await prisma.fAQCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }
  console.log(`  ✓ Seeded ${FAQ_CATEGORIES.length} FAQ categories`);
}

async function seedFAQs() {
  console.log("📖 Seeding FAQs...");
  
  for (const faq of FAQs) {
    const category = FAQ_CATEGORIES.find(c => c.slug === faq.category);
    
    await prisma.fAQ.upsert({
      where: { 
        id: `faq-${faq.question.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`
      },
      create: {
        id: `faq-${faq.question.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
        question: faq.question,
        answer: faq.answer,
        categoryId: category?.id || 'default',
        order: faq.order,
        isPinned: faq.isPinned,
        isActive: true,
      },
      update: {
        answer: faq.answer,
        order: faq.order,
        isPinned: faq.isPinned,
      },
    });
  }
  console.log(`  ✓ Seeded ${FAQs.length} FAQs`);
}

async function seedDailyQuotes() {
  console.log("✨ Seeding daily quotes...");
  
  for (const quote of DAILY_QUOTES) {
    await prisma.dailyQuote.upsert({
      where: { 
        id: `quote-${quote.quote.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`
      },
      create: {
        id: `quote-${quote.quote.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`,
        quote: quote.quote,
        translation: quote.translation,
        source: quote.source,
        category: quote.category,
        language: quote.language,
        isActive: true,
      },
      update: {
        translation: quote.translation,
      },
    });
  }
  console.log(`  ✓ Seeded ${DAILY_QUOTES.length} daily quotes`);
}

async function seedAnnouncements() {
  console.log("📢 Seeding announcements...");
  
  for (const announcement of ANNOUNCEMENTS) {
    await prisma.announcement.upsert({
      where: { 
        id: `announcement-${announcement.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`
      },
      create: {
        id: `announcement-${announcement.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
        ...announcement,
      },
      update: {
        content: announcement.content,
        isActive: announcement.isActive,
        isPinned: announcement.isPinned,
        endDate: announcement.endDate,
      },
    });
  }
  console.log(`  ✓ Seeded ${ANNOUNCEMENTS.length} announcements`);
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

async function seedFestivalEvents() {
  console.log("🎉 Seeding festival events...");
  
  for (const festival of FESTIVALS) {
    await prisma.event.upsert({
      where: { 
        slug: festival.name.toLowerCase().replace(/\s+/g, '-')
      },
      create: {
        title: festival.name,
        titleKn: festival.nameKn,
        description: festival.description,
        slug: festival.name.toLowerCase().replace(/\s+/g, '-'),
        eventDate: new Date(2024, festival.month - 1, festival.day),
        startTime: "06:00",
        endTime: "21:00",
        location: "Main Temple Hall",
        category: "FESTIVAL",
        status: festival.importance === "very_high" ? "PUBLISHED" : "PUBLISHED",
        isFeatured: true,
        importance: festival.importance,
        activities: festival.activities,
      },
      update: {
        titleKn: festival.nameKn,
        description: festival.description,
        eventDate: new Date(2024, festival.month - 1, festival.day),
        importance: festival.importance,
        activities: festival.activities,
      },
    });
  }
  console.log(`  ✓ Seeded ${FESTIVALS.length} festival events`);
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
    await seedFAQCategories();
    await seedFAQs();
    await seedDailyQuotes();
    await seedAnnouncements();
    await seedGalleryCategories();
    await seedFestivalEvents();

    console.log("");
    console.log("=".repeat(70));
    console.log("✅ Complete seed completed successfully!");
    console.log("=".repeat(70));
    console.log("");
    console.log("Seeded data summary:");
    console.log("  - Temple information");
    console.log("  - Site settings");
    console.log("  - FAQ categories & FAQs");
    console.log("  - Daily quotes");
    console.log("  - Announcements");
    console.log("  - Gallery categories");
    console.log("  - Festival events");
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
