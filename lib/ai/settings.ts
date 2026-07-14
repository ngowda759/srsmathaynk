/**
 * AI Settings - Firebase has been removed
 * This module now uses default settings only
 */

import { SYSTEM_PROMPT, WELCOME_MESSAGE } from "./systemPrompt";

// AI Settings (now defaults only)
export interface AISettings {
  systemPrompt: string;
  welcomeMessage: string;
  enabled: boolean;
  updatedAt: any;
}

// Default AI Settings
export const DEFAULT_AI_SETTINGS: AISettings = {
  systemPrompt: SYSTEM_PROMPT,
  welcomeMessage: WELCOME_MESSAGE,
  enabled: true,
  updatedAt: null,
};

// Get AI settings (returns defaults since Firebase is removed)
export async function getAISettings(): Promise<AISettings> {
  console.log("[AISettings] Firebase removed - returning default settings");
  return DEFAULT_AI_SETTINGS;
}

// Save AI settings (no-op since Firebase is removed)
export async function saveAISettings(settings: Partial<AISettings>): Promise<void> {
  console.log("[AISettings] Firebase removed - cannot save settings");
  throw new Error("Settings save is not available - backend services have been removed");
}

// Clear settings cache (no-op)
export function clearSettingsCache(): void {
  // No-op since Firebase is removed
}

// Get just the system prompt (used by chat API)
export async function getSystemPrompt(): Promise<string> {
  return DEFAULT_AI_SETTINGS.systemPrompt;
}

// Get just the welcome message (used by chat frontend)
export async function getWelcomeMessage(): Promise<string> {
  return DEFAULT_AI_SETTINGS.welcomeMessage;
}

// Check if AI chat is enabled
export async function isAIChatEnabled(): Promise<boolean> {
  return DEFAULT_AI_SETTINGS.enabled;
}
