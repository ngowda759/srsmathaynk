/**
 * AI Feedback API
 * POST - Submit feedback for chat response
 * GET - Get feedback list (admin)
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const feedbackSchema = z.object({
  feedbackId: z.string().optional(), // If rating a stored feedback
  articleId: z.string().optional(), // If rating an article
  rating: z.number().int().min(1).max(5).optional(),
  isHelpful: z.boolean(),
  comment: z.string().optional(),
})

async function getUserProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.profile.findUnique({ where: { userId: user.id } })
}

async function checkAdmin() {
  const profile = await getUserProfile()
  return profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = feedbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const profile = await getUserProfile()
    const data = validation.data

    if (data.feedbackId) {
      // Update existing feedback
      await prisma.aIChatFeedback.update({
        where: { id: data.feedbackId },
        data: {
          isHelpful: data.isHelpful,
          rating: data.rating,
          comment: data.comment,
        },
      })
      return NextResponse.json({ success: true })
    }

    if (data.articleId) {
      // Rate an article
      const update = data.isHelpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } }

      await prisma.aIKnowledgeArticle.update({
        where: { id: data.articleId },
        data: update,
      })

      // Also create feedback record
      await prisma.aIChatFeedback.create({
        data: {
          articleId: data.articleId,
          userId: profile?.id,
          rating: data.rating,
          isHelpful: data.isHelpful,
          comment: data.comment,
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Feedback ID or Article ID required" }, { status: 400 })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Feedback submission failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get("articleId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {}
    if (articleId) where.articleId = articleId

    const [feedbacks, total] = await Promise.all([
      prisma.aIChatFeedback.findMany({
        where,
        include: {
          article: { select: { question: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aIChatFeedback.count({ where }),
    ])

    // Get article stats
    const articleStats = await prisma.aIKnowledgeArticle.findMany({
      where: { id: { in: feedbacks.map(f => f.articleId).filter(Boolean) } },
      select: { id: true, question: true, viewCount: true, helpfulCount: true, notHelpfulCount: true },
    })

    return NextResponse.json({
      feedbacks,
      articleStats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
