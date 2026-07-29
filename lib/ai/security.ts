/**
 * Prompt Injection Protection & Input Sanitization
 * Protects the AI from malicious inputs
 */

// Injection patterns to detect
const INJECTION_PATTERNS = [
  // System prompt override attempts
  /ignore\s+(previous|all|above)\s+(instructions?|prompts?|context)/i,
  /disregard\s+(your|my)\s+(previous|initial)/i,
  /forget\s+(everything|all|what)[\s\w]+told/i,
  /new\s+(system|initial)\s+prompt/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /roleplay/i,
  /act\s+as/i,
  /behave\s+as/i,
  
  // jailbreak patterns
  /sudo\s+/i,
  /admin\s+mode/i,
  /developer\s+mode/i,
  /bypass/i,
  /override/i,
  /unfilter/i,
  
  // Data extraction attempts
  /show\s+(me\s+)?your\s+(system\s+)?prompt/i,
  /what\s+are\s+your\s+(instructions?|guidelines?)/i,
  /repeat\s+(your\s+)?(system\s+)?prompt/i,
  /list\s+(all\s+)?your\s+(instructions?|rules?)/i,
  
  // SQL/NoSQL injection (for context awareness)
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|WHERE|TABLE|DATABASE)\b)/i,
  /(\$\{|\$\w+|<script|javascript:|on\w+=)/i,
  
  // Special characters that might cause issues
  /\x00/g, // Null bytes
  /\x1a/g, // Ctrl-Z
];

// Patterns that indicate suspicious activity
const SUSPICIOUS_PATTERNS = [
  // Excessive length
  { pattern: /^.{10000,}$/, name: 'excessive_length' },
  
  // Repetitive characters
  { pattern: /(.)\1{20,}/, name: 'repetitive_chars' },
  
  // Binary-like content
  { pattern: /[^\x00-\x7F]{50,}/, name: 'binary_like' },
  
  // Base64 encoded content (potential obfuscation)
  { pattern: /^[A-Za-z0-9+/=]{100,}$/, name: 'base64_obfuscation' },
];

// Maximum lengths
const MAX_INPUT_LENGTH = 4000;
const MAX_HISTORY_LENGTH = 20;

export interface SanitizationResult {
  sanitized: string;
  isValid: boolean;
  warnings: string[];
  isSuspicious: boolean;
}

export interface InjectionCheckResult {
  isInjection: boolean;
  pattern?: string;
  confidence: number;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): SanitizationResult {
  const warnings: string[] = [];
  let sanitized = input.trim();
  let isSuspicious = false;

  // Check length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    warnings.push(`Input truncated from ${sanitized.length} to ${MAX_INPUT_LENGTH} characters`);
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }

  // Remove null bytes
  if (sanitized.includes('\x00')) {
    sanitized = sanitized.replace(/\x00/g, '');
    warnings.push('Removed null bytes from input');
  }

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Check for suspicious patterns
  for (const { pattern, name } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push(`Suspicious pattern detected: ${name}`);
      isSuspicious = true;
    }
  }

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push(`Potential injection pattern detected`);
      isSuspicious = true;
      break;
    }
  }

  return {
    sanitized,
    isValid: sanitized.length > 0,
    warnings,
    isSuspicious,
  };
}

/**
 * Check for prompt injection attempts
 */
export function checkForInjection(input: string): InjectionCheckResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isInjection: true,
        pattern: pattern.source,
        confidence: 0.9,
      };
    }
  }

  // Check for high concentration of special characters
  const specialCharRatio = (input.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length / input.length;
  if (specialCharRatio > 0.3 && input.length > 50) {
    return {
      isInjection: true,
      pattern: 'high_special_char_ratio',
      confidence: 0.6,
    };
  }

  // Check for encoded content
  if (/\\[xnu][0-9a-f]{2}/i.test(input)) {
    return {
      isInjection: true,
      pattern: 'encoded_characters',
      confidence: 0.5,
    };
  }

  return {
    isInjection: false,
    confidence: 0,
  };
}

/**
 * Validate message history
 */
export function validateHistory(
  history: Array<{ role: string; content: string }>
): { valid: boolean; truncated: Array<{ role: string; content: string }> } {
  if (history.length <= MAX_HISTORY_LENGTH) {
    return { valid: true, truncated: history };
  }

  // Keep the most recent messages
  return {
    valid: true,
    truncated: history.slice(-MAX_HISTORY_LENGTH),
  };
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  type: string,
  details: {
    input?: string;
    userId?: string;
    sessionId?: string;
    ip?: string;
    confidence?: number;
  }
): void {
  const timestamp = new Date().toISOString();
  
  // In production, this would send to a logging service
  console.warn('[Security] Suspicious activity detected:', {
    timestamp,
    type,
    ...details,
    // Don't log full input to avoid log pollution
    inputPreview: details.input?.substring(0, 100) + (details.input && details.input.length > 100 ? '...' : ''),
  });
}

/**
 * Create safe system prompt addition
 */
export function createContextAddition(context: {
  language?: string;
  intent?: string;
  sources?: Array<{ type: string; title: string }>;
}): string {
  const parts: string[] = [];

  if (context.language) {
    parts.push(`Current language: ${context.language}`);
  }

  if (context.intent) {
    parts.push(`Detected intent: ${context.intent}`);
  }

  if (context.sources && context.sources.length > 0) {
    parts.push('Relevant sources:');
    for (const source of context.sources.slice(0, 5)) {
      parts.push(`- ${source.type}: ${source.title}`);
    }
  }

  if (parts.length === 0) return '';

  return `\n\n[System context]\n${parts.join('\n')}\n[/System context]`;
}

/**
 * Rate limiter for API calls
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per window

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Cleanup old rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
