/**
 * EMAIL WORKER - Cloudflare Email Routing Handler
 *
 * Processes incoming emails to fred@proofofcorn.com
 * Stores them in KV for Fred to read during daily checks
 */

import { Env } from "./types";

export interface StoredEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
  read: boolean;
  requiresAction: boolean;
  category: "farmer" | "vendor" | "community" | "spam" | "other";
  sentiment: "positive" | "neutral" | "negative" | "question";
}

/**
 * Handle incoming email from Cloudflare Email Routing
 */
export async function handleEmail(
  message: ForwardableEmailMessage,
  env: Env
): Promise<void> {
  const emailId = `email:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  // Parse the email
  const from = message.from;
  const to = message.to;
  const subject = message.headers.get("subject") || "(no subject)";

  // Read the raw email content
  const rawEmail = await streamToString(message.raw);
  const { text, html } = parseEmailBody(rawEmail);

  // Analyze the email
  const analysis = analyzeEmail(from, subject, text);

  const storedEmail: StoredEmail = {
    id: emailId,
    from,
    to,
    subject,
    text: text.slice(0, 10000), // Limit size
    html: html?.slice(0, 20000),
    receivedAt: new Date().toISOString(),
    read: false,
    requiresAction: analysis.requiresAction,
    category: analysis.category,
    sentiment: analysis.sentiment
  };

  // Store in KV
  await env.FARMER_FRED_KV.put(emailId, JSON.stringify(storedEmail), {
    expirationTtl: 60 * 60 * 24 * 90 // 90 days
  });

  // Update unread count
  const unreadCount = await env.FARMER_FRED_KV.get("email:unreadCount");
  const newCount = (parseInt(unreadCount || "0") + 1).toString();
  await env.FARMER_FRED_KV.put("email:unreadCount", newCount);

  // Log the receipt
  console.log(`[Email] Received from ${from}: "${subject}" - Category: ${analysis.category}`);

  // If high priority, could trigger an alert or immediate processing
  if (analysis.category === "farmer" && analysis.requiresAction) {
    console.log(`[Email] HIGH PRIORITY: Farmer inquiry requires response`);
  }
}

/**
 * Analyze email content for categorization
 */
function analyzeEmail(
  from: string,
  subject: string,
  text: string
): {
  category: StoredEmail["category"];
  sentiment: StoredEmail["sentiment"];
  requiresAction: boolean;
} {
  const lowerFrom = from.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  const lowerText = text.toLowerCase();
  const combined = `${lowerSubject} ${lowerText}`;

  // Category detection
  let category: StoredEmail["category"] = "other";

  // Farmer/land owner keywords
  const farmerKeywords = ["acre", "land", "farm", "lease", "rent", "corn", "crop", "field", "tractor", "equipment", "irrigation"];
  if (farmerKeywords.some(kw => combined.includes(kw))) {
    category = "farmer";
  }

  // Vendor keywords
  const vendorKeywords = ["quote", "price", "service", "supply", "order", "invoice", "shipping"];
  if (vendorKeywords.some(kw => combined.includes(kw))) {
    category = "vendor";
  }

  // Community/HN keywords
  const communityKeywords = ["hacker news", "hn", "cool project", "interesting", "love this", "suggestion", "question"];
  if (communityKeywords.some(kw => combined.includes(kw))) {
    category = "community";
  }

  // Spam indicators
  const spamKeywords = ["unsubscribe", "click here", "limited time", "winner", "congratulations", "act now"];
  if (spamKeywords.some(kw => combined.includes(kw)) && !combined.includes("corn")) {
    category = "spam";
  }

  // Sentiment
  let sentiment: StoredEmail["sentiment"] = "neutral";

  const positiveWords = ["great", "awesome", "love", "excited", "interested", "help", "offer", "available"];
  const negativeWords = ["concern", "problem", "issue", "complaint", "disappointed", "wrong"];
  const questionIndicators = ["?", "how", "what", "when", "where", "can you", "do you", "is there"];

  const positiveCount = positiveWords.filter(w => combined.includes(w)).length;
  const negativeCount = negativeWords.filter(w => combined.includes(w)).length;
  const hasQuestion = questionIndicators.some(q => combined.includes(q));

  if (hasQuestion) {
    sentiment = "question";
  } else if (positiveCount > negativeCount) {
    sentiment = "positive";
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
  }

  // Requires action if:
  // - It's from a farmer/vendor
  // - Contains a question
  // - Is positive (potential lead)
  const requiresAction =
    (category === "farmer" || category === "vendor") ||
    (sentiment === "question" && category !== "spam") ||
    (sentiment === "positive" && category === "community");

  return { category, sentiment, requiresAction };
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
    if (key.name === "email:unreadCount") continue;

    const email = await env.FARMER_FRED_KV.get(key.name, "json") as StoredEmail | null;
    if (email && !email.read) {
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
  const email = await env.FARMER_FRED_KV.get(emailId, "json") as StoredEmail | null;
  if (email) {
    email.read = true;
    await env.FARMER_FRED_KV.put(emailId, JSON.stringify(email));

    // Update unread count
    const unreadCount = await env.FARMER_FRED_KV.get("email:unreadCount");
    const newCount = Math.max(0, parseInt(unreadCount || "0") - 1).toString();
    await env.FARMER_FRED_KV.put("email:unreadCount", newCount);
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
    if (!byCategory[email.category]) byCategory[email.category] = [];
    byCategory[email.category].push(email);
  }

  // Prioritize farmer and vendor emails
  const order: StoredEmail["category"][] = ["farmer", "vendor", "community", "other", "spam"];

  for (const category of order) {
    const categoryEmails = byCategory[category];
    if (!categoryEmails || categoryEmails.length === 0) continue;

    ctx += `\n#### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryEmails.length})\n`;

    for (const email of categoryEmails.slice(0, 5)) {
      const hoursAgo = Math.round((Date.now() - new Date(email.receivedAt).getTime()) / (1000 * 60 * 60));
      ctx += `- From: ${email.from} (${hoursAgo}h ago)\n`;
      ctx += `  Subject: "${email.subject}"\n`;
      ctx += `  Preview: "${email.text.slice(0, 100)}${email.text.length > 100 ? "..." : ""}"\n`;
      ctx += `  Action needed: ${email.requiresAction ? "YES" : "No"}\n`;
    }
  }

  return ctx;
}
