/**
 * Chat Service - Firebase has been removed
 * This service now provides stub functions as no backend is available
 */

import { AIMessage, ChatSession, Testimonial, VolunteerRequest, ChatFeedback } from "@/types/ai";

// Collection names
const CHAT_SESSIONS_COLLECTION = "chat_sessions";
const MESSAGES_COLLECTION = "messages";
const TESTIMONIALS_COLLECTION = "testimonials";
const VOLUNTEER_REQUESTS_COLLECTION = "volunteer_requests";
const FEEDBACK_COLLECTION = "feedback";

// ============= Chat Sessions =============

export async function createChatSession(userId: string | null): Promise<string> {
  throw new Error("Chat sessions are not available - backend services have been removed");
}

export async function updateChatSession(
  sessionId: string,
  data: Partial<ChatSession>
): Promise<void> {
  throw new Error("Chat session updates are not available - backend services have been removed");
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  return null;
}

export async function getUserChatSessions(
  userId: string,
  maxSessions: number = 20
): Promise<ChatSession[]> {
  return [];
}

// ============= Messages =============

export async function saveMessage(
  sessionId: string,
  message: AIMessage
): Promise<string> {
  throw new Error("Message saving is not available - backend services have been removed");
}

export async function getSessionMessages(sessionId: string): Promise<AIMessage[]> {
  return [];
}

// ============= Testimonials =============

export async function submitTestimonial(
  testimonial: Omit<Testimonial, "id" | "createdAt" | "approved">
): Promise<string> {
  throw new Error("Testimonial submission is not available - backend services have been removed");
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  return [];
}

export async function getPendingTestimonials(): Promise<Testimonial[]> {
  return [];
}

export async function approveTestimonial(testimonialId: string): Promise<void> {
  throw new Error("Testimonial approval is not available - backend services have been removed");
}

// ============= Volunteer Requests =============

export async function submitVolunteerRequest(
  request: Omit<VolunteerRequest, "id" | "createdAt" | "status">
): Promise<string> {
  throw new Error("Volunteer request submission is not available - backend services have been removed");
}

export async function getVolunteerRequests(): Promise<VolunteerRequest[]> {
  return [];
}

export async function updateVolunteerRequestStatus(
  requestId: string,
  status: "pending" | "contacted" | "completed"
): Promise<void> {
  throw new Error("Volunteer request status update is not available - backend services have been removed");
}

// ============= Feedback =============

export async function submitFeedback(
  feedback: Omit<ChatFeedback, "id" | "createdAt">
): Promise<string> {
  throw new Error("Feedback submission is not available - backend services have been removed");
}

export async function getFeedbackStats(): Promise<{
  helpful: number;
  notHelpful: number;
  total: number;
}> {
  return { helpful: 0, notHelpful: 0, total: 0 };
}
