/**
 * AI Chat API
 * POST - Send message and get response
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

// Simple keyword-based response (placeholder for full AI)
async function getAIResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase()

  // Simple keyword matching
  if (lowerMessage.includes("pooja") || lowerMessage.includes("seva")) {
    return "We offer various sevas including Suprabhatha Seva, Thomu Seva, Pallaki Seva, and more. You can book sevas online through our website."
  }
  if (lowerMessage.includes("darshan") || lowerMessage.includes("timing")) {
    return "Temple is open from 6:00 AM to 9:00 PM daily. Special darshan timings may vary during festivals."
  }
  if (lowerMessage.includes("donation")) {
    return "Donations can be made online through our secure payment portal. We accept UPI, bank transfers, and cards. All donations are eligible for 80G certificate."
  }
  if (lowerMessage.includes("fest") || lowerMessage.includes("festival")) {
    return "We celebrate many festivals including Sri Raghavendra Aradhana, Hanumath Jayanthi, and daily festivals. Check our events page for details."
  }
  if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email")) {
    return "You can contact us at the temple office during working hours. Check our contact page for details."
  }
  if (lowerMessage.includes("address") || lowerMessage.includes("location")) {
    return "Sri Raghavendra Swamy Temple is located in Raghavendra Nagar. Check our location page for directions."
  }
  if (lowerMessage.includes(" parking")) {
    return "Yes, we have parking facilities available for devotees near the temple entrance."
  }
  if (lowerMessage.includes(" Prasadam") || lowerMessage.includes("prasad")) {
    return "Prasadam is distributed after poojas. You can also pre-order prasadam items at the counters."
  }

  // Default response
  return "Thank you for your question. Our team will get back to you shortly. For immediate assistance, please visit the temple or call our helpdesk."
}

async function getUserProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.profile.findUnique({ where: { userId: user.id } })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get user profile
    const profile = await getUserProfile()

    // Search for matching articles
    const articles = await prisma.aIKnowledgeArticle.findMany({
      where: {
        active: true,
        OR: [
          { question: { contains: message, mode: "insensitive" } },
          { keywords: { hasSome: message.toLowerCase().split(" ") } },
        ],
      },
      orderBy: { priority: "desc" },
      take: 3,
    })

    let response: string
    let matchedArticle = null

    if (articles.length > 0) {
      // Use article answer
      matchedArticle = articles[0]
      response = matchedArticle.answer
      
      // Increment view count
      await prisma.aIKnowledgeArticle.update({
        where: { id: matchedArticle.id },
        data: { viewCount: { increment: 1 } },
      })
    } else {
      // Use AI response
      response = await getAIResponse(message)
    }

    // Store chat in feedback for future improvement
    await prisma.aIChatFeedback.create({
      data: {
        userQuery: message,
        aiResponse: response,
        userId: profile?.id,
        isHelpful: false, // Will be updated by user feedback
      },
    })

    return NextResponse.json({
      response,
      matchedArticle: matchedArticle ? {
        id: matchedArticle.id,
        question: matchedArticle.question,
      } : null,
    })
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}
