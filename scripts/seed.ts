/**
 * Database Seed Script
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Seed Temple Settings
  console.log("📝 Creating temple settings...")
  await prisma.templeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Sri Raghavendra Swamy Temple",
      shortName: "SRS Math",
      tagline: "Where Devotion Meets Divinity",
      description: "Welcome to the official portal of Sri Raghavendra Swamy Temple",
      address: "Rayara Math, Post Box No. 1, Raghavendra Nagar",
      city: "Mantralayam",
      district: "Kurnool",
      state: "Andhra Pradesh",
      country: "India",
      pincode: "518345",
      phone: "+91-8518-234123",
      email: "info@srsmathaynk.org",
      mapEmbedUrl: "",
      socialFacebook: "",
      socialTwitter: "",
      socialInstagram: "",
      socialYoutube: "",
    },
  })

  // Seed Homepage Settings
  console.log("📝 Creating homepage settings...")
  await prisma.homepageSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroTitle: "Welcome to Sri Raghavendra Swamy Temple",
      heroSubtitle: "Experience peace, devotion, and divine blessings",
      featuredSevaTitle: "Book Your Seva",
      featuredSevaSubtitle: "Participate in divine services",
      donationTitle: "Support Our Temple",
      donationSubtitle: "Your generous contributions help us serve devotees",
      newsTitle: "Latest Announcements",
    },
  })

  // Seed Trust Members
  console.log("📝 Creating trust members...")
  await prisma.trustMember.upsert({
    where: { id: "swamiji" },
    update: {},
    create: {
      id: "swamiji",
      name: "Swami Shri Suyoga Sri Raghavendra Swamy Ji",
      designation: "Pontiff",
      description: "The spiritual head of Rayara Math",
      imageUrl: "",
      order: 1,
      active: true,
    },
  })

  // Seed Pooja Schedules
  console.log("📝 Creating pooja schedules...")
  const poojas = [
    { name: "Suprabhatha Seva", startTime: "05:00", endTime: "06:00", description: "Morning wake-up ritual" },
    { name: "Thomala Seva", startTime: "06:00", endTime: "07:00", description: "Decorating the deity with garlands" },
    { name: "Sangeetha Seva", startTime: "07:00", endTime: "08:00", description: "Musical offering" },
    { name: "Midday Pooja", startTime: "12:00", endTime: "13:00", description: "Noon worship" },
    { name: "Kalyanotsava", startTime: "18:00", endTime: "19:00", description: "Divine marriage ceremony" },
    { name: "EkadashaRudra Abhishekam", startTime: "19:00", endTime: "20:00", description: "Special Shiva worship" },
    { name: "Night Temple Closure", startTime: "21:00", endTime: "21:30", description: "Evening rituals and closure" },
  ]

  for (let i = 0; i < poojas.length; i++) {
    const pooja = poojas[i]
    await prisma.poojaSchedule.upsert({
      where: { id: `pooja-${i + 1}` },
      update: {},
      create: {
        id: `pooja-${i + 1}`,
        name: pooja.name,
        startTime: pooja.startTime,
        endTime: pooja.endTime,
        description: pooja.description,
        order: i + 1,
        active: true,
      },
    })
  }

  // Seed Facilities
  console.log("📝 Creating facilities...")
  const facilities = [
    { name: "Parking", description: "Spacious parking for cars and two-wheelers", icon: "car" },
    { name: "Guest House", description: "Accommodation for devotees", icon: "home" },
    { name: "Prasada Bhavan", description: "Free meals for devotees", icon: "utensils" },
    { name: "Wheelchair Access", description: "Wheelchair availability for elderly", icon: "accessibility" },
    { name: " cloak Room", description: "Secure storage for belongings", icon: "lock" },
    { name: "Medical Facility", description: "First aid and emergency services", icon: "heart" },
  ]

  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i]
    await prisma.facility.upsert({
      where: { id: `facility-${i + 1}` },
      update: {},
      create: {
        id: `facility-${i + 1}`,
        name: facility.name,
        description: facility.description,
        iconName: facility.icon,
        order: i + 1,
        isActive: true,
      },
    })
  }

  // Seed Sample Events
  console.log("📝 Creating sample events...")
  await prisma.event.upsert({
    where: { id: "sample-event-1" },
    update: {},
    create: {
      id: "sample-event-1",
      title: "Annual Raghavendra Swamy Mahotsavam",
      description: "Join us for the grand annual celebration featuring special pujas, processions, and cultural programs.",
      date: new Date("2025-01-15"),
      endDate: new Date("2025-01-25"),
      time: "All Day",
      location: "Temple Premises",
      type: "FESTIVAL",
      published: true,
      featured: true,
    },
  })

  // Seed Sample Sevas
  console.log("📝 Creating sample sevas...")
  const sevas = [
    { id: "seva-1", name: "Thomala Seva", description: "Offering garlands to the deity", amount: 101, active: true },
    { id: "seva-2", name: "Kunkuma Archana", description: "Special turmeric offering", amount: 51, active: true },
    { id: "seva-3", name: "Suprabhatha Seva", description: "Morning wake-up ritual", amount: 201, active: true },
    { id: "seva-4", name: "Maha Mangala Aarti", description: "Grand evening lamp offering", amount: 151, active: true },
    { id: "seva-5", name: "Archana", description: "108 names chanting", amount: 251, active: true },
  ]

  for (const seva of sevas) {
    await prisma.seva.upsert({
      where: { id: seva.id },
      update: {},
      create: {
        id: seva.id,
        name: seva.name,
        description: seva.description,
        amount: seva.amount,
        active: seva.active,
        order: parseInt(seva.id.split("-")[1]),
      },
    })
  }

  // Seed Sample Donation Campaign
  console.log("📝 Creating sample donation campaign...")
  await prisma.donationCampaign.upsert({
    where: { id: "general-donation" },
    update: {},
    create: {
      id: "general-donation",
      name: "General Temple Fund",
      description: "Support the day-to-day operations and maintenance of the temple",
      goal: 1000000,
      active: true,
      featured: true,
    },
  })

  console.log("✅ Database seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
