import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { SYSTEM_PROMPT } from "@/lib/ai/systemPrompt";
import { hybridRetrieval, detectLanguage } from "@/lib/ai/retrieval";
import { 
  sanitizeInput, 
  checkForInjection, 
  logSuspiciousActivity, 
  validateHistory,
  checkRateLimit,
  createContextAddition 
} from "@/lib/ai/security";
import { chatSessionService } from "@/services/chat-session.service";
import type { AIMessage, ChatRequest, ChatResponse } from "@/types/ai";
import type { SourceMetadata } from "@/lib/ai/retrieval/types";

export const dynamic = "force-dynamic";

// Enhanced error logging helper
function logError(context: string, error: unknown, details?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorInfo: Record<string, unknown> = {
    timestamp,
    context,
    errorType: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...details,
  };
  console.error(`[Chat API] Error in ${context}:`, JSON.stringify(errorInfo, null, 2));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Get client info
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    console.log(`[Chat API] [${requestId}] Received request from IP: ${ip}`);

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      console.log(`[Chat API] [${requestId}] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again.", retryAfter: rateLimit.resetIn },
        { status: 429 }
      );
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      logError("JSON parsing", parseError, { requestId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { messages, sessionId, userId } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitization = sanitizeInput(lastUserMessage.content);
    if (!sanitization.isValid) {
      return NextResponse.json(
        { error: "Invalid message content" },
        { status: 400 }
      );
    }

    // Check for injection attempts
    const injectionCheck = checkForInjection(sanitization.sanitized);
    if (injectionCheck.isInjection) {
      logSuspiciousActivity("prompt_injection", {
        input: sanitization.sanitized,
        ip,
        sessionId,
        confidence: injectionCheck.confidence,
      });
      console.warn(`[Chat API] [${requestId}] Injection attempt detected from IP: ${ip}`);
      return NextResponse.json(
        { error: "Your message could not be processed. Please try a different question." },
        { status: 400 }
      );
    }

    // Log suspicious activity if detected
    if (sanitization.isSuspicious) {
      logSuspiciousActivity("suspicious_input", {
        input: sanitization.sanitized,
        ip,
        sessionId,
      });
    }

    console.log(`[Chat API] [${requestId}] Processing message: "${sanitization.sanitized.substring(0, 50)}..."`);

    // Detect language
    const detectedLanguage = detectLanguage(sanitization.sanitized);

    // Validate and truncate history
    const validatedHistory = validateHistory(messages.map(m => ({ role: m.role, content: m.content })));

    // Get or create session
    let currentSessionId = sessionId;
    if (currentSessionId) {
      // Verify session exists
      const session = await chatSessionService.getSessionByKey(currentSessionId);
      if (!session) {
        currentSessionId = crypto.randomUUID();
        await chatSessionService.createSession({
          sessionKey: currentSessionId,
          userId,
          userIp: ip,
          userAgent,
          language: detectedLanguage,
        });
      }
    } else {
      currentSessionId = crypto.randomUUID();
      await chatSessionService.createSession({
        sessionKey: currentSessionId,
        userId,
        userIp: ip,
        userAgent,
        language: detectedLanguage,
      });
    }

    // Hybrid retrieval for context
    const retrievalStart = Date.now();
    const retrievalResult = await hybridRetrieval(
      { query: sanitization.sanitized, language: detectedLanguage },
      { maxResults: 5 }
    );
    const retrievalTime = Date.now() - retrievalStart;

    console.log(`[Chat API] [${requestId}] Retrieval found ${retrievalResult.sources.length} sources in ${retrievalTime}ms, confidence: ${retrievalResult.confidence}`);

    // Get AI provider
    const provider = getAIProvider();

    if (!provider.isConfigured()) {
      throw new Error("AI service not configured. Please set up AI provider credentials.");
    }

    // Build enhanced system prompt with retrieved context
    let systemPrompt = SYSTEM_PROMPT;
    
    if (retrievalResult.sources.length > 0) {
      const contextAddition = createContextAddition({
        language: detectedLanguage,
        intent: retrievalResult.intent,
        sources: retrievalResult.sources.map(s => ({ type: s.type, title: s.title })),
      });
      systemPrompt += `\n\n${retrievalResult.content}${contextAddition}`;
    }

    // Add language instruction
    if (detectedLanguage === 'kn') {
      systemPrompt += "\n\nIMPORTANT: The user is communicating in Kannada. Respond entirely in proper Kannada script (ಕನ್ನಡ ಅಕ್ಷರಗಳನ್ನು ಬಳಸಿ).";
    } else if (detectedLanguage === 'mixed') {
      systemPrompt += "\n\nThe user is mixing languages. Respond naturally in both English and Kannada as appropriate.";
    }

    // Generate response
    const aiStart = Date.now();
    const aiMessages: AIMessage[] = validatedHistory.truncated.map((msg) => ({
      id: crypto.randomUUID(),
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: Date.now(),
    }));

    const responseContent = await provider.generateResponse(aiMessages, systemPrompt);
    const aiLatency = Date.now() - aiStart;
    const totalLatency = Date.now() - startTime;

    console.log(`[Chat API] [${requestId}] AI response generated in ${aiLatency}ms, total: ${totalLatency}ms`);

    // Save messages to session
    try {
      // Save user message
      await chatSessionService.saveMessage({
        sessionId: currentSessionId,
        role: 'user',
        content: sanitization.sanitized,
        detectedLang: detectedLanguage,
        detectedIntent: retrievalResult.intent,
      });

      // Save assistant response
      const sources = retrievalResult.sources.length > 0 
        ? retrievalResult.sources 
        : undefined;

      await chatSessionService.saveMessage({
        sessionId: currentSessionId,
        role: 'assistant',
        content: responseContent,
        model: provider.getModelName(),
        latency: aiLatency,
        confidence: retrievalResult.confidence,
        sources,
        detectedLang: detectedLanguage,
      });
    } catch (dbError) {
      // Don't fail the request if DB save fails
      console.error(`[Chat API] [${requestId}] Failed to save messages:`, dbError);
    }

    // Log unknown questions if confidence is low
    if (retrievalResult.confidence < 0.3 && retrievalResult.sources.length === 0) {
      try {
        await chatSessionService.logUnknownQuestion({
          sessionId: currentSessionId,
          question: sanitization.sanitized,
          language: detectedLanguage,
          intent: retrievalResult.intent,
          topic: retrievalResult.topic,
          userId,
          userIp: ip,
        });
        console.log(`[Chat API] [${requestId}] Low confidence - logged unknown question`);
      } catch (logError) {
        console.error(`[Chat API] [${requestId}] Failed to log unknown question:`, logError);
      }
    }

    const responseMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
      model: provider.getModelName(),
      latency: totalLatency,
      detectedLanguage,
    };

    const response: ChatResponse & { sources?: SourceMetadata[] } = {
      message: responseMessage,
      sessionId: currentSessionId,
    };

    // Include sources if available
    if (retrievalResult.sources.length > 0) {
      response.sources = retrievalResult.sources;
    }

    return NextResponse.json(response);
  } catch (error) {
    logError("Request processing", error, { requestId, startTime });

    // Handle specific error types with specific messages
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("401") || error.message.includes("403")) {
        console.error(`[Chat API] [${requestId}] Authentication error - check API key configuration`);
        return NextResponse.json(
          { error: "AI service authentication failed. Please contact the administrator." },
          { status: 500 }
        );
      }
      if (error.message.includes("rate") || error.message.includes("429")) {
        console.error(`[Chat API] [${requestId}] Rate limit error`);
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        console.error(`[Chat API] [${requestId}] Timeout error`);
        return NextResponse.json(
          { error: "Request timed out. Please try again." },
          { status: 504 }
        );
      }
      if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("ENOTFOUND")) {
        console.error(`[Chat API] [${requestId}] Network error`);
        return NextResponse.json(
          { error: "Network error. Please check your connection and try again." },
          { status: 503 }
        );
      }
    }

    // Generic error
    console.error(`[Chat API] [${requestId}] Unhandled error, returning generic response`);
    return NextResponse.json(
      { error: "An error occurred while generating the response. Please try again." },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const provider = getAIProvider();
  
  return NextResponse.json({
    status: "ok",
    provider: provider.getProviderName(),
    configured: provider.isConfigured(),
    model: provider.getModelName(),
    timestamp: Date.now(),
    features: {
      hybridRetrieval: true,
      sessionManagement: true,
      injectionProtection: true,
      multiLanguage: true,
    },
  });
}
