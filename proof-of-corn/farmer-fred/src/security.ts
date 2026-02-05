/**
 * Security module for Farmer Fred
 * Detects prompt injection, rate limiting, and suspicious patterns
 */

export interface SecurityCheck {
  isSafe: boolean;
  threat: "none" | "prompt_injection" | "rate_limit" | "suspicious_pattern" | "spam";
  confidence: number; // 0-1
  flaggedPatterns: string[];
  recommendation: "allow" | "flag" | "block";
}

/**
 * Prompt injection patterns to detect
 */
const INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,
  /disregard\s+(previous|all|above|prior)/i,
  /forget\s+(everything|all|previous|instructions?)/i,

  // System/role manipulation
  /system\s*:/i,
  /assistant\s*:/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\{\{system\}\}/i,

  // Jailbreak attempts
  /pretend\s+(you|to be|you're)/i,
  /act\s+as\s+(if|a|an)/i,
  /roleplay/i,
  /simulate/i,
  /new\s+instructions?/i,

  // Data exfiltration
  /show\s+me\s+(all|your|the)\s+(emails?|data|database|logs?)/i,
  /dump\s+(database|data|emails?)/i,
  /list\s+all\s+(emails?|users?|contacts?)/i,

  // Action manipulation
  /send\s+(email|message|money|payment)/i,
  /transfer\s+(funds?|money|payment)/i,
  /delete\s+(all|everything)/i,
  /sudo\s+/i,
];

/**
 * Suspicious patterns (not necessarily injection, but worth flagging)
 */
const SUSPICIOUS_PATTERNS = [
  // Excessive special characters
  /[!@#$%^&*]{10,}/,

  // Base64 encoded content (might be hiding injection)
  /[A-Za-z0-9+/]{100,}={0,2}/,

  // Repeated words (potential SEO spam)
  /(\b\w+\b)(\s+\1){5,}/i,

  // URLs with suspicious TLDs
  /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)\b/i,

  // Cryptocurrency addresses
  /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/, // Bitcoin
  /0x[a-fA-F0-9]{40}/, // Ethereum
];

/**
 * Check email for prompt injection and security threats
 */
export function checkEmailSecurity(email: {
  from: string;
  subject: string;
  body: string;
}): SecurityCheck {
  const flaggedPatterns: string[] = [];
  let maxConfidence = 0;
  let threat: SecurityCheck["threat"] = "none";

  const fullText = `${email.subject} ${email.body}`.toLowerCase();

  // Check for prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(fullText)) {
      flaggedPatterns.push(pattern.source);
      maxConfidence = Math.max(maxConfidence, 0.9);
      threat = "prompt_injection";
    }
  }

  // Check for suspicious patterns
  if (threat === "none") {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(fullText)) {
        flaggedPatterns.push(pattern.source);
        maxConfidence = Math.max(maxConfidence, 0.6);
        threat = "suspicious_pattern";
      }
    }
  }

  // Check for spam indicators
  const spamScore = calculateSpamScore(email);
  if (spamScore > 0.7) {
    flaggedPatterns.push("high_spam_score");
    maxConfidence = Math.max(maxConfidence, spamScore);
    threat = threat === "none" ? "spam" : threat;
  }

  // Determine recommendation
  let recommendation: SecurityCheck["recommendation"] = "allow";
  if (threat === "prompt_injection" && maxConfidence > 0.8) {
    recommendation = "block";
  } else if (threat !== "none" && maxConfidence > 0.5) {
    recommendation = "flag";
  }

  return {
    isSafe: threat === "none" || (threat === "spam" && maxConfidence < 0.8),
    threat,
    confidence: maxConfidence,
    flaggedPatterns,
    recommendation,
  };
}

/**
 * Calculate spam score (0-1)
 */
function calculateSpamScore(email: {
  from: string;
  subject: string;
  body: string;
}): number {
  let score = 0;

  // Excessive caps in subject
  const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length;
  if (capsRatio > 0.5 && email.subject.length > 10) {
    score += 0.3;
  }

  // Excessive exclamation marks
  const exclamationCount = (email.subject + email.body).match(/!/g)?.length || 0;
  if (exclamationCount > 5) {
    score += 0.2;
  }

  // Common spam phrases
  const spamPhrases = [
    "congratulations", "you've won", "claim your", "act now",
    "limited time", "urgent", "verify your account", "click here",
    "make money", "work from home", "free money", "nigerian prince"
  ];

  const bodyLower = email.body.toLowerCase();
  let phraseCount = 0;
  for (const phrase of spamPhrases) {
    if (bodyLower.includes(phrase)) phraseCount++;
  }
  score += Math.min(phraseCount * 0.15, 0.5);

  return Math.min(score, 1.0);
}

/**
 * Redact email address for public display
 * Example: david@purdue.edu -> d***@p***.edu
 */
export function redactEmail(email: string): string {
  if (!email || typeof email !== 'string') return "***@***.***";

  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***.***";

  const [domainName, ...tlds] = domain.split(".");
  const tld = tlds.join(".");

  const redactedLocal = local[0] + "***";
  const redactedDomain = domainName[0] + "***";

  return `${redactedLocal}@${redactedDomain}.${tld}`;
}

/**
 * Sanitize email body for public display
 * - Redact email addresses
 * - Redact phone numbers
 * - Redact URLs (show domain only)
 * - Limit length
 */
export function sanitizeEmailBody(body: string, maxLength = 200): string {
  if (!body || typeof body !== 'string') return '';

  let sanitized = body;

  // Redact email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    (match) => redactEmail(match)
  );

  // Redact phone numbers
  sanitized = sanitized.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "***-***-****"
  );

  // Simplify URLs (show domain only)
  sanitized = sanitized.replace(
    /https?:\/\/(www\.)?([A-Za-z0-9.-]+)\.[A-Za-z]{2,}[^\s]*/g,
    (match, www, domain) => `[${domain}]`
  );

  // Truncate
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + "...";
  }

  return sanitized;
}

/**
 * Rate limiting check
 * Returns whether this sender is within rate limits
 */
export interface RateLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  resetsIn: number; // seconds
}

export async function checkRateLimit(
  senderEmail: string,
  kv: KVNamespace
): Promise<RateLimitCheck> {
  const key = `ratelimit:${senderEmail}`;
  const limit = 10; // emails per day
  const windowSeconds = 86400; // 24 hours

  const data = await kv.get(key, "json") as { count: number; expiresAt: number } | null;
  const now = Date.now();

  if (!data || data.expiresAt < now) {
    // First email or expired window
    await kv.put(
      key,
      JSON.stringify({ count: 1, expiresAt: now + windowSeconds * 1000 }),
      { expirationTtl: windowSeconds }
    );

    return {
      allowed: true,
      current: 1,
      limit,
      resetsIn: windowSeconds,
    };
  }

  // Within window
  const newCount = data.count + 1;
  const allowed = newCount <= limit;

  if (allowed) {
    await kv.put(
      key,
      JSON.stringify({ count: newCount, expiresAt: data.expiresAt }),
      { expirationTtl: Math.floor((data.expiresAt - now) / 1000) }
    );
  }

  return {
    allowed,
    current: newCount,
    limit,
    resetsIn: Math.floor((data.expiresAt - now) / 1000),
  };
}

// ============================================
// VOICE / CALL SECURITY
// ============================================

/**
 * Social engineering patterns specific to voice/chat interactions.
 * These catch attempts to manipulate Fred's identity or authority.
 */
const VOICE_MANIPULATION_PATTERNS = [
  // Identity attacks
  /you('re| are) (not|no longer) farmer fred/i,
  /stop being farmer fred/i,
  /your (real|true|actual) (name|identity|purpose)/i,
  /you('re| are) (actually|really) (a |an )?/i,

  // Authority escalation
  /i('m| am) (seth|joe|the founder|your (boss|owner|creator))/i,
  /seth (told|said|asked|wants) (me|you) to/i,
  /i have (admin|root|special) (access|privileges|authority)/i,
  /override (your|the) (constitution|rules|restrictions|guidelines)/i,
  /emergency (override|protocol|mode)/i,

  // Prompt extraction
  /what('s| is| are) your (system |initial )?prompt/i,
  /show (me )?your (instructions|rules|guidelines|constitution)/i,
  /repeat (your|the) (system|initial) (prompt|message|instructions)/i,
  /what were you told to/i,

  // Behavioral manipulation
  /for (educational|research|testing|safety) purposes/i,
  /hypothetically/i,
  /in a (fictional|imaginary|alternate) (scenario|world|reality)/i,
  /this is (just )?a (test|drill|game)/i,
  /don('t| not) (tell|email|notify|alert|cc) (seth|joe|the council|governance|anyone)/i,
  /keep this (between us|secret|private|off the record)/i,
  /don('t| not) log (this|anything)/i,

  // Financial manipulation
  /transfer (the |all )?(funds?|money|budget|crypto)/i,
  /send (me |)(the |all )?(funds?|money|payments?|budget)/i,
  /change the (wallet|payment|bank|account)/i,
  /approve (this |the )?(payment|transfer|purchase) (yourself|without)/i,

  // Escalation to external services
  /call (this|the) number/i,
  /go to (this |)(url|website|link)/i,
  /download (this|the)/i,
  /run (this |)(code|script|command)/i,
];

/**
 * Check voice/chat input for social engineering attempts.
 * Returns a severity level and matched patterns.
 */
export function checkVoiceSecurity(text: string): SecurityCheck {
  const flaggedPatterns: string[] = [];
  let maxConfidence = 0;
  let threat: SecurityCheck["threat"] = "none";

  // Check injection patterns (shared with email)
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      flaggedPatterns.push(pattern.source);
      maxConfidence = Math.max(maxConfidence, 0.9);
      threat = "prompt_injection";
    }
  }

  // Check voice-specific manipulation patterns
  for (const pattern of VOICE_MANIPULATION_PATTERNS) {
    if (pattern.test(text)) {
      flaggedPatterns.push(pattern.source);
      maxConfidence = Math.max(maxConfidence, 0.85);
      threat = threat === "none" ? "prompt_injection" : threat;
    }
  }

  let recommendation: SecurityCheck["recommendation"] = "allow";
  if (maxConfidence > 0.8) {
    recommendation = "block";
  } else if (maxConfidence > 0.5) {
    recommendation = "flag";
  }

  return {
    isSafe: threat === "none",
    threat,
    confidence: maxConfidence,
    flaggedPatterns,
    recommendation,
  };
}

/**
 * Call rate limiting — limits calls per phone number per day
 */
export async function checkCallRateLimit(
  callerNumber: string,
  kv: KVNamespace
): Promise<RateLimitCheck> {
  const key = `ratelimit:call:${callerNumber}`;
  const limit = 3; // calls per day per number
  const windowSeconds = 86400;

  const data = await kv.get(key, "json") as { count: number; expiresAt: number } | null;
  const now = Date.now();

  if (!data || data.expiresAt < now) {
    await kv.put(
      key,
      JSON.stringify({ count: 1, expiresAt: now + windowSeconds * 1000 }),
      { expirationTtl: windowSeconds }
    );
    return { allowed: true, current: 1, limit, resetsIn: windowSeconds };
  }

  const newCount = data.count + 1;
  const allowed = newCount <= limit;

  if (allowed) {
    await kv.put(
      key,
      JSON.stringify({ count: newCount, expiresAt: data.expiresAt }),
      { expirationTtl: Math.floor((data.expiresAt - now) / 1000) }
    );
  }

  return {
    allowed,
    current: newCount,
    limit,
    resetsIn: Math.floor((data.expiresAt - now) / 1000),
  };
}

/**
 * Caller blocklist — check if a phone number is blocked
 */
export async function isCallerBlocked(
  callerNumber: string,
  kv: KVNamespace
): Promise<boolean> {
  if (!callerNumber || callerNumber === "unknown") return false;
  const blocked = await kv.get(`blocklist:${callerNumber}`);
  return blocked !== null;
}

/**
 * Add a phone number to the blocklist
 */
export async function blockCaller(
  callerNumber: string,
  reason: string,
  kv: KVNamespace
): Promise<void> {
  await kv.put(
    `blocklist:${callerNumber}`,
    JSON.stringify({ number: callerNumber, reason, blockedAt: new Date().toISOString() }),
    { expirationTtl: 60 * 60 * 24 * 365 } // 1 year
  );

  // Also add to blocklist index for listing
  const indexStr = await kv.get("blocklist:index");
  const index: string[] = indexStr ? JSON.parse(indexStr) : [];
  if (!index.includes(callerNumber)) {
    index.push(callerNumber);
    await kv.put("blocklist:index", JSON.stringify(index));
  }
}

/**
 * Remove a phone number from the blocklist
 */
export async function unblockCaller(
  callerNumber: string,
  kv: KVNamespace
): Promise<void> {
  await kv.delete(`blocklist:${callerNumber}`);

  const indexStr = await kv.get("blocklist:index");
  const index: string[] = indexStr ? JSON.parse(indexStr) : [];
  const filtered = index.filter(n => n !== callerNumber);
  await kv.put("blocklist:index", JSON.stringify(filtered));
}

/**
 * List all blocked callers
 */
export async function listBlockedCallers(
  kv: KVNamespace
): Promise<Array<{ number: string; reason: string; blockedAt: string }>> {
  const indexStr = await kv.get("blocklist:index");
  const index: string[] = indexStr ? JSON.parse(indexStr) : [];

  const results: Array<{ number: string; reason: string; blockedAt: string }> = [];
  for (const num of index) {
    const data = await kv.get(`blocklist:${num}`, "json") as { number: string; reason: string; blockedAt: string } | null;
    if (data) results.push(data);
  }
  return results;
}

/**
 * Track manipulation attempts for a caller.
 * After 3 flagged attempts in a call, recommend blocking.
 */
export async function trackManipulationAttempt(
  callerNumber: string,
  pattern: string,
  kv: KVNamespace
): Promise<{ totalAttempts: number; shouldBlock: boolean }> {
  const key = `manipulation:${callerNumber}`;
  const data = await kv.get(key, "json") as { attempts: Array<{ pattern: string; at: string }> } | null;

  const attempts = data?.attempts || [];
  attempts.push({ pattern, at: new Date().toISOString() });

  // Keep last 24 hours of attempts
  const oneDayAgo = Date.now() - 86400 * 1000;
  const recent = attempts.filter(a => new Date(a.at).getTime() > oneDayAgo);

  await kv.put(key, JSON.stringify({ attempts: recent }), { expirationTtl: 86400 });

  return {
    totalAttempts: recent.length,
    shouldBlock: recent.length >= 5, // Auto-block after 5 attempts in 24 hours
  };
}

// ============================================
// ADMIN AUTH
// ============================================

/**
 * Verify admin authentication
 * Simple password-based auth for now
 */
export function verifyAdminAuth(request: Request, adminPassword: string): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  // Support both "Bearer <token>" and "Basic <base64>"
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return token === adminPassword;
  }

  if (authHeader.startsWith("Basic ")) {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const [, password] = decoded.split(":");
    return password === adminPassword;
  }

  return false;
}
