-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'EVENT', 'DONATION', 'FESTIVAL', 'MAINTENANCE', 'URGENT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GENERAL', 'FESTIVAL', 'WORKSHOP', 'SPIRITUAL', 'CULTURAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('SEVA', 'EVENT', 'DONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'WALLET', 'BANK_TRANSFER', 'CASH', 'CHEQUE');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('PONTIFF', 'TRUSTEE', 'MEMBER', 'SECRETARY', 'STAFF', 'PRIEST');

-- CreateEnum
CREATE TYPE "EnquiryCategory" AS ENUM ('GENERAL', 'SEVA', 'DONATION', 'EVENT', 'VISIT', 'COMPLAINT', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'SPAM');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "avatarId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temple_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "mapEmbedUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "socialWhatsapp" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIFSCCode" TEXT,
    "bankUPIId" TEXT,
    "establishedYear" INTEGER,
    "priestCount" INTEGER,
    "dailyVisitors" INTEGER,
    "logoId" TEXT,
    "faviconId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temple_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_configs" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroVideoUrl" TEXT,
    "heroPrimaryButtonText" TEXT,
    "heroPrimaryButtonUrl" TEXT,
    "heroSecondaryButtonText" TEXT,
    "heroSecondaryButtonUrl" TEXT,
    "heroImageId" TEXT,
    "aboutTitle" TEXT,
    "aboutContent" TEXT,
    "aboutImageId" TEXT,
    "showFeaturedEvents" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedSevas" BOOLEAN NOT NULL DEFAULT true,
    "showDonationSection" BOOLEAN NOT NULL DEFAULT true,
    "showGalleryPreview" BOOLEAN NOT NULL DEFAULT true,
    "showAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "showPanchanga" BOOLEAN NOT NULL DEFAULT true,
    "featuredEventsLimit" INTEGER NOT NULL DEFAULT 6,
    "featuredSevasLimit" INTEGER NOT NULL DEFAULT 8,
    "galleryPreviewLimit" INTEGER NOT NULL DEFAULT 8,
    "testimonialLimit" INTEGER NOT NULL DEFAULT 5,
    "donationTitle" TEXT,
    "donationSubtitle" TEXT,
    "announcementBannerText" TEXT,
    "announcementBannerUrl" TEXT,
    "footerCopyright" TEXT,
    "footerTagline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temple_days" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "name" TEXT,
    "morningOpenTime" TEXT,
    "morningCloseTime" TEXT,
    "eveningOpenTime" TEXT,
    "eveningCloseTime" TEXT,
    "notes" TEXT,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temple_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temple_exceptions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "morningOpenTime" TEXT,
    "morningCloseTime" TEXT,
    "eveningOpenTime" TEXT,
    "eveningCloseTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isSpecialEvent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temple_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "bucket" TEXT NOT NULL DEFAULT 'media',
    "storagePath" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "category" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKn" TEXT,
    "description" TEXT,
    "descriptionKn" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "onlineLink" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'GENERAL',
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "bannerId" TEXT,
    "maxAttendees" INTEGER,
    "currentAttendees" INTEGER NOT NULL DEFAULT 0,
    "organizer" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "festivals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "descriptionKn" TEXT,
    "significance" TEXT,
    "imageUrl" TEXT,
    "isMajorFestival" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "festivals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panchangas" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tithi" TEXT NOT NULL,
    "tithiEnd" TEXT,
    "nakshatra" TEXT NOT NULL,
    "nakshatraEnd" TEXT,
    "yoga" TEXT NOT NULL,
    "yogaEnd" TEXT,
    "karana" TEXT NOT NULL,
    "karanaEnd" TEXT,
    "sunrise" TEXT NOT NULL,
    "sunset" TEXT NOT NULL,
    "moonrise" TEXT,
    "moonset" TEXT,
    "moonPhase" TEXT,
    "brahmaMuhurta" TEXT,
    "amritaKaalam" TEXT,
    "sunriseKaalam" TEXT,
    "sunsetKaalam" TEXT,
    "rahukalam" TEXT,
    "yamaganda" TEXT,
    "durMuhurtam" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panchangas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pooja_schedules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "descriptionKn" TEXT,
    "category" TEXT,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "pooja_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "profileId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "bookingType" "BookingType" NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "devoteeName" TEXT,
    "gothra" TEXT,
    "nakshatra" TEXT,
    "gotraKn" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_items" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sevaId" TEXT,
    "aaradhaneId" TEXT,
    "eventId" TEXT,
    "itemName" TEXT NOT NULL,
    "itemNameKn" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requestedDate" TIMESTAMP(3),
    "requestedTime" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sevas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "description" TEXT,
    "descriptionKn" TEXT,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "duration" TEXT,
    "category" TEXT,
    "imageId" TEXT,
    "iconName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "maxPerDay" INTEGER,
    "minAdvanceBooking" INTEGER,
    "maxAdvanceBooking" INTEGER,
    "instructions" TEXT,
    "benefits" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sevas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aaradhanes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKn" TEXT,
    "deityName" TEXT,
    "guruName" TEXT,
    "description" TEXT,
    "significance" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "imageId" TEXT,
    "thumbnailId" TEXT,
    "rituals" TEXT[],
    "offerings" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aaradhanes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aaradhane_sevas" (
    "id" TEXT NOT NULL,
    "aaradhaneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sevaId" TEXT,

    CONSTRAINT "aaradhane_sevas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKn" TEXT,
    "description" TEXT,
    "descriptionKn" TEXT,
    "targetAmount" DECIMAL(12,2),
    "raisedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "imageId" TEXT,
    "videoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "donation_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "campaignId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod",
    "paymentId" TEXT,
    "transactionId" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPhone" TEXT,
    "donorAddress" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "dedication" TEXT,
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_payments" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentId" TEXT,
    "transactionId" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "responseData" JSONB,
    "errorMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "donation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "titleKn" TEXT,
    "description" TEXT,
    "descriptionKn" TEXT,
    "mediaId" TEXT NOT NULL,
    "eventId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "designation" TEXT NOT NULL,
    "designationKn" TEXT,
    "bio" TEXT,
    "bioKn" TEXT,
    "imageId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "type" "MemberType" NOT NULL DEFAULT 'MEMBER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isPontiff" BOOLEAN NOT NULL DEFAULT false,
    "isResident" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "committee_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "description" TEXT,
    "descriptionKn" TEXT,
    "icon" TEXT,
    "imageId" TEXT,
    "color" TEXT,
    "instructions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionKn" TEXT,
    "answer" TEXT NOT NULL,
    "answerKn" TEXT,
    "keywords" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "imageId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_attachments" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaId" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_feedback" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "comment" TEXT,
    "userQuery" TEXT,
    "aiResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "contentKn" TEXT,
    "rating" INTEGER,
    "imageId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "category" "EnquiryCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKn" TEXT,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_email_idx" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_isActive_idx" ON "profiles"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_profileId_roleId_key" ON "user_roles"("profileId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE INDEX "site_settings_category_idx" ON "site_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "temple_days_dayOfWeek_key" ON "temple_days"("dayOfWeek");

-- CreateIndex
CREATE INDEX "temple_exceptions_date_idx" ON "temple_exceptions"("date");

-- CreateIndex
CREATE INDEX "media_type_isActive_idx" ON "media"("type", "isActive");

-- CreateIndex
CREATE INDEX "media_category_idx" ON "media"("category");

-- CreateIndex
CREATE INDEX "media_isFeatured_idx" ON "media"("isFeatured");

-- CreateIndex
CREATE INDEX "announcements_isActive_expiresAt_idx" ON "announcements"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_priority_idx" ON "announcements"("priority");

-- CreateIndex
CREATE INDEX "events_startDate_published_idx" ON "events"("startDate", "published");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "festivals_date_idx" ON "festivals"("date");

-- CreateIndex
CREATE UNIQUE INDEX "panchangas_date_key" ON "panchangas"("date");

-- CreateIndex
CREATE INDEX "panchangas_date_idx" ON "panchangas"("date");

-- CreateIndex
CREATE INDEX "pooja_schedules_active_order_idx" ON "pooja_schedules"("active", "order");

-- CreateIndex
CREATE INDEX "pooja_schedules_category_idx" ON "pooja_schedules"("category");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_referenceNumber_key" ON "bookings"("referenceNumber");

-- CreateIndex
CREATE INDEX "bookings_profileId_idx" ON "bookings"("profileId");

-- CreateIndex
CREATE INDEX "bookings_bookingType_bookingDate_idx" ON "bookings"("bookingType", "bookingDate");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "booking_items_bookingId_idx" ON "booking_items"("bookingId");

-- CreateIndex
CREATE INDEX "booking_items_sevaId_idx" ON "booking_items"("sevaId");

-- CreateIndex
CREATE INDEX "booking_items_aaradhaneId_idx" ON "booking_items"("aaradhaneId");

-- CreateIndex
CREATE INDEX "booking_items_eventId_idx" ON "booking_items"("eventId");

-- CreateIndex
CREATE INDEX "sevas_active_featured_idx" ON "sevas"("active", "featured");

-- CreateIndex
CREATE INDEX "sevas_category_idx" ON "sevas"("category");

-- CreateIndex
CREATE INDEX "aaradhanes_featured_active_idx" ON "aaradhanes"("featured", "active");

-- CreateIndex
CREATE INDEX "aaradhane_sevas_aaradhaneId_idx" ON "aaradhane_sevas"("aaradhaneId");

-- CreateIndex
CREATE INDEX "donation_campaigns_active_featured_idx" ON "donation_campaigns"("active", "featured");

-- CreateIndex
CREATE INDEX "donation_campaigns_urgencyLevel_idx" ON "donation_campaigns"("urgencyLevel");

-- CreateIndex
CREATE INDEX "donations_profileId_idx" ON "donations"("profileId");

-- CreateIndex
CREATE INDEX "donations_campaignId_idx" ON "donations"("campaignId");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_createdAt_idx" ON "donations"("createdAt");

-- CreateIndex
CREATE INDEX "donation_payments_donationId_idx" ON "donation_payments"("donationId");

-- CreateIndex
CREATE INDEX "donation_payments_status_idx" ON "donation_payments"("status");

-- CreateIndex
CREATE INDEX "gallery_items_active_idx" ON "gallery_items"("active");

-- CreateIndex
CREATE INDEX "gallery_items_featured_idx" ON "gallery_items"("featured");

-- CreateIndex
CREATE INDEX "gallery_items_eventId_idx" ON "gallery_items"("eventId");

-- CreateIndex
CREATE INDEX "committee_members_type_active_idx" ON "committee_members"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_categories_slug_key" ON "knowledge_categories"("slug");

-- CreateIndex
CREATE INDEX "knowledge_categories_active_idx" ON "knowledge_categories"("active");

-- CreateIndex
CREATE INDEX "knowledge_articles_active_priority_idx" ON "knowledge_articles"("active", "priority");

-- CreateIndex
CREATE INDEX "knowledge_articles_categoryId_idx" ON "knowledge_articles"("categoryId");

-- CreateIndex
CREATE INDEX "knowledge_attachments_articleId_idx" ON "knowledge_attachments"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_tags_name_key" ON "knowledge_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_tags_slug_key" ON "knowledge_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_tags_articleId_tagId_key" ON "article_tags"("articleId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_userId_key" ON "testimonials"("userId");

-- CreateIndex
CREATE INDEX "testimonials_approved_published_idx" ON "testimonials"("approved", "published");

-- CreateIndex
CREATE INDEX "testimonials_featured_idx" ON "testimonials"("featured");

-- CreateIndex
CREATE INDEX "contact_enquiries_status_idx" ON "contact_enquiries"("status");

-- CreateIndex
CREATE INDEX "contact_enquiries_category_idx" ON "contact_enquiries"("category");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "document_categories_active_order_idx" ON "document_categories"("active", "order");

-- CreateIndex
CREATE INDEX "documents_categoryId_active_idx" ON "documents"("categoryId", "active");

-- CreateIndex
CREATE INDEX "documents_featured_idx" ON "documents"("featured");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temple_info" ADD CONSTRAINT "temple_info_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temple_info" ADD CONSTRAINT "temple_info_faviconId_fkey" FOREIGN KEY ("faviconId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_configs" ADD CONSTRAINT "homepage_configs_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_configs" ADD CONSTRAINT "homepage_configs_aboutImageId_fkey" FOREIGN KEY ("aboutImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pooja_schedules" ADD CONSTRAINT "pooja_schedules_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_sevaId_fkey" FOREIGN KEY ("sevaId") REFERENCES "sevas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_aaradhaneId_fkey" FOREIGN KEY ("aaradhaneId") REFERENCES "aaradhanes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sevas" ADD CONSTRAINT "sevas_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aaradhanes" ADD CONSTRAINT "aaradhanes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aaradhanes" ADD CONSTRAINT "aaradhanes_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aaradhane_sevas" ADD CONSTRAINT "aaradhane_sevas_aaradhaneId_fkey" FOREIGN KEY ("aaradhaneId") REFERENCES "aaradhanes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aaradhane_sevas" ADD CONSTRAINT "aaradhane_sevas_sevaId_fkey" FOREIGN KEY ("sevaId") REFERENCES "sevas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_campaigns" ADD CONSTRAINT "donation_campaigns_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "donation_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_payments" ADD CONSTRAINT "donation_payments_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "knowledge_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_attachments" ADD CONSTRAINT "knowledge_attachments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_attachments" ADD CONSTRAINT "knowledge_attachments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "knowledge_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_feedback" ADD CONSTRAINT "chat_feedback_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_feedback" ADD CONSTRAINT "chat_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

