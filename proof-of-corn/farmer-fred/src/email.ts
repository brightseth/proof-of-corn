/**
 * EMAIL WORKER - Cloudflare Email Routing Handler
 *
 * Processes incoming emails to fred@proofofcorn.com
 * Stores them in KV for Fred to read during daily checks
 *
 * Stores in the Email format used by index.ts inbox handlers:
 *   { id, from, subject, body, receivedAt, status, category, securityCheck? }
 */

import { Env } from "./types";
import { checkEmailSecurity, SecurityCheck } from "./security";
import { sendAlertToSeth } from "./alerts";
import { cancelFollowUp } from "./followup";
import { triageEmail, getSenderRelationship } from "./email-voice";

export interface StoredEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  status: "unread" | "read" | "replied" | "archived";
  category?: "lead" | "partnership" | "question" | "spam" | "other" | "suspicious";
  securityCheck?: SecurityCheck;
}

/**
 * Handle incoming email from Cloudflare Email Routing
 */
export async function handleEmail(
  message: ForwardableEmailMessage,
  env: Env
): Promise<void> {
  const emailId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Parse the email
  const from = message.from;
  const subject = message.headers.get("subject") || "(no subject)";

  // Read the raw email content
  const rawEmail = await streamToString(message.raw);
  const { text } = parseEmailBody(rawEmail);

  // Run security check
  const securityCheck = checkEmailSecurity({ from, subject, body: text });

  // Categorize the email — try Claude first, fall back to keywords
  let category = categorizeEmailKeywords(from, subject, text, securityCheck);
  try {
    if (securityCheck.isSafe && env.ANTHROPIC_API_KEY) {
      const aiCategory = await categorizeEmailWithClaude(env, from, subject, text);
      if (aiCategory) category = aiCategory;
    }
  } catch (err) {
    console.log(`[Email] Claude categorization failed, using keyword fallback: ${err}`);
  }

  // Track sender relationship
  try {
    const senderKey = `sender:${from.toLowerCase()}`;
    const senderData = await env.FARMER_FRED_KV.get(senderKey, "json") as {
      count: number;
      lastSeen: string;
      categories: string[];
    } | null;

    const updated = {
      count: (senderData?.count || 0) + 1,
      lastSeen: new Date().toISOString(),
      firstSeen: senderData ? (senderData as any).firstSeen || senderData.lastSeen : new Date().toISOString(),
      categories: [...new Set([...(senderData?.categories || []), category || "other"])],
    };
    await env.FARMER_FRED_KV.put(senderKey, JSON.stringify(updated), {
      expirationTtl: 60 * 60 * 24 * 180, // 180 days
    });
  } catch {
    // Non-critical: sender tracking failure
  }

  const storedEmail: StoredEmail = {
    id: emailId,
    from,
    subject,
    body: text.slice(0, 10000), // Limit size
    receivedAt: new Date().toISOString(),
    status: "unread",
    category,
    securityCheck
  };

  // Store in KV with email: prefix (matches inbox handler queries)
  await env.FARMER_FRED_KV.put(`email:${emailId}`, JSON.stringify(storedEmail), {
    expirationTtl: 60 * 60 * 24 * 90 // 90 days
  });

  // Cancel any pending follow-up for this sender (they replied)
  await cancelFollowUp(env, from);

  // Log the receipt
  console.log(`[Email] Received from ${from}: "${subject}" - Category: ${category} - Safe: ${securityCheck.isSafe}`);

  if (category === "suspicious" || !securityCheck.isSafe) {
    console.log(`[Email] FLAGGED: Security concern from ${from}`);
  } else if (category !== "spam") {
    // Alert Seth on high-value emails
    if (category === "lead" || category === "partnership") {
      await sendAlertToSeth(
        env,
        category,
        `New ${category}: ${subject}`,
        `From: ${from}\nSubject: ${subject}\n\nPreview: ${text.slice(0, 300)}`
      );
    }

    // Triage: decide whether to respond, draft, or skip
    const relationship = await getSenderRelationship(env, from);
    const triage = triageEmail(category, from, subject, text, relationship);
    console.log(`[Email] Triage decision for ${from}: ${triage} (category: ${category})`);

    if (triage === "skip") {
      console.log(`[Email] Skipping — low-value or no reply needed for ${from}`);
    } else {
      // "respond" = auto-send OK, "draft" = needs human review
      const priority = (category === "lead" || category === "partnership") ? "high" : "medium";
      const isDraft = triage === "draft";
      const task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "respond_email" as const,
        priority,
        title: `${isDraft ? "[DRAFT] " : ""}Respond to ${from}: ${subject}`,
        description: `Respond to ${category} email from ${from}. Subject: "${subject}"`,
        relatedEmailId: emailId,
        createdAt: new Date().toISOString(),
        status: isDraft ? ("draft" as any) : ("pending" as const),
        assignedTo: "fred" as const
      };
      await env.FARMER_FRED_KV.put(`task:${task.id}`, JSON.stringify(task), {
        expirationTtl: 60 * 60 * 24 * 30 // 30 days
      });
      console.log(`[Email] Created ${isDraft ? "DRAFT" : "auto-respond"} task (${priority}) for ${category} email from ${from}`);
    }
  }
}

/**
 * Categorize email using Claude for smarter classification
 */
async function categorizeEmailWithClaude(
  env: Env,
  from: string,
  subject: string,
  text: string
): Promise<StoredEmail["category"] | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Classify this email to Farmer Fred (AI farm manager for Proof of Corn project).

From: ${from}
Subject: ${subject}
Body: ${text.slice(0, 500)}

Classify as exactly one of: lead, partnership, question, spam, other
- lead: farmer, land owner, equipment supplier, someone with farming resources
- partnership: vendor, platform, API, data provider, collaboration offer
- question: general inquiry, community question, media request
- spam: unsolicited marketing, scam, irrelevant
- other: anything else

Respond with ONLY the category word, nothing else.`,
      }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json() as { content: Array<{ type: string; text?: string }> };
  const result = data.content?.find(c => c.type === "text")?.text?.trim().toLowerCase();

  const validCategories: StoredEmail["category"][] = ["lead", "partnership", "question", "spam", "other"];
  if (result && validCategories.includes(result as StoredEmail["category"])) {
    return result as StoredEmail["category"];
  }
  return null;
}

/**
 * Categorize email using keywords (fallback)
 * Maps to: "lead" | "partnership" | "question" | "spam" | "other" | "suspicious"
 */
function categorizeEmailKeywords(
  from: string,
  subject: string,
  text: string,
  securityCheck: SecurityCheck
): StoredEmail["category"] {
  // Security takes priority
  if (!securityCheck.isSafe || securityCheck.recommendation === "block") {
    return "suspicious";
  }

  const combined = `${subject} ${text}`.toLowerCase();

  // Spam indicators
  const spamKeywords = ["unsubscribe", "click here", "limited time", "winner", "congratulations", "act now"];
  if (spamKeywords.some(kw => combined.includes(kw)) && !combined.includes("corn")) {
    return "spam";
  }

  // Lead: farmer/land owner keywords (high-value contacts)
  const leadKeywords = ["acre", "land", "farm", "lease", "rent", "corn", "crop", "field", "tractor", "equipment", "irrigation", "soil", "seed", "planting"];
  if (leadKeywords.some(kw => combined.includes(kw))) {
    return "lead";
  }

  // Partnership: vendor/collaboration keywords
  const partnerKeywords = ["partner", "collaborat", "api", "data", "satellite", "sensor", "platform", "service", "supply", "sponsor", "farmpin", "digital earth"];
  if (partnerKeywords.some(kw => combined.includes(kw))) {
    return "partnership";
  }

  // Question: community/general inquiries
  const questionIndicators = ["?", "how", "what", "when", "where", "can you", "do you", "is there", "hacker news", "hn", "cool project"];
  if (questionIndicators.some(q => combined.includes(q))) {
    return "question";
  }

  return "other";
}

/**
 * Convert ReadableStream to string
 */
async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

/**
 * Parse email body from raw email (simplified)
 */
function parseEmailBody(raw: string): { text: string; html?: string } {
  // This is a simplified parser - for production, use a proper MIME parser

  // Try to find plain text part
  let text = "";
  let html: string | undefined;

  // Look for Content-Type boundaries
  const boundaryMatch = raw.match(/boundary="?([^"\r\n]+)"?/i);

  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = raw.split(`--${boundary}`);

    for (const part of parts) {
      if (part.includes("Content-Type: text/plain")) {
        const bodyStart = part.indexOf("\r\n\r\n") || part.indexOf("\n\n");
        if (bodyStart > 0) {
          text = part.slice(bodyStart + 4).trim();
        }
      } else if (part.includes("Content-Type: text/html")) {
        const bodyStart = part.indexOf("\r\n\r\n") || part.indexOf("\n\n");
        if (bodyStart > 0) {
          html = part.slice(bodyStart + 4).trim();
        }
      }
    }
  } else {
    // Single part email - try to extract body after headers
    const bodyStart = raw.indexOf("\r\n\r\n") || raw.indexOf("\n\n");
    if (bodyStart > 0) {
      text = raw.slice(bodyStart + 4).trim();
    }
  }

  // Strip HTML tags for plain text fallback
  if (!text && html) {
    text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  return { text: text || "(empty body)", html };
}

/**
 * Get unread emails for Fred's context
 */
export async function getUnreadEmails(env: Env): Promise<StoredEmail[]> {
  const emails: StoredEmail[] = [];
  const keys = await env.FARMER_FRED_KV.list({ prefix: "email:" });

  for (const key of keys.keys) {
    const email = await env.FARMER_FRED_KV.get(key.name, "json") as StoredEmail | null;
    if (email && email.status === "unread") {
      emails.push(email);
    }
  }

  // Sort by received date, newest first
  return emails.sort((a, b) =>
    new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

/**
 * Mark email as read
 */
export async function markEmailRead(env: Env, emailId: string): Promise<void> {
  const email = await env.FARMER_FRED_KV.get(`email:${emailId}`, "json") as StoredEmail | null;
  if (email) {
    email.status = "read";
    await env.FARMER_FRED_KV.put(`email:${emailId}`, JSON.stringify(email));
  }
}

/**
 * Format emails for Fred's agent context
 */
export function formatEmailsForAgent(emails: StoredEmail[]): string {
  if (emails.length === 0) {
    return "### Emails\nNo unread emails.\n";
  }

  let ctx = `### Emails (${emails.length} unread)\n`;

  const byCategory: Record<string, StoredEmail[]> = {};
  for (const email of emails) {
    const cat = email.category || "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(email);
  }

  // Prioritize leads and partnerships
  const order: NonNullable<StoredEmail["category"]>[] = ["lead", "partnership", "question", "other", "spam"];

  for (const category of order) {
    const categoryEmails = byCategory[category];
    if (!categoryEmails || categoryEmails.length === 0) continue;

    ctx += `\n#### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryEmails.length})\n`;

    for (const email of categoryEmails.slice(0, 5)) {
      const hoursAgo = Math.round((Date.now() - new Date(email.receivedAt).getTime()) / (1000 * 60 * 60));
      ctx += `- From: ${email.from} (${hoursAgo}h ago)\n`;
      ctx += `  Subject: "${email.subject}"\n`;
      ctx += `  Preview: "${email.body.slice(0, 100)}${email.body.length > 100 ? "..." : ""}"\n`;
      ctx += `  Status: ${email.status}\n`;
    }
  }

  return ctx;
}
