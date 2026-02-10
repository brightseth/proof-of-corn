/**
 * FOLLOW-UP SYSTEM
 *
 * Track outbound emails and create follow-up tasks
 * when contacts don't reply within N days.
 * Max 2 follow-ups per contact.
 */

import { Env } from "./types";

interface FollowUpRecord {
  contact: string;
  subject: string;
  sentAt: string;
  followUpAfter: string;
  category: string;
  attempts: number;
}

/**
 * Schedule a follow-up if no reply within N days.
 * Leads: 5 days, Partnerships/Others: 7 days.
 */
// Block bounce/system addresses from getting follow-ups
const BLOCKED_PATTERNS = [
  /@bounce\./i, /@send\./i, /^0[0-9a-f]{10,}/i,
  /noreply@/i, /no-reply@/i, /mailer-daemon@/i, /postmaster@/i,
  /fred@proofofcorn\.com/i,
];

export async function scheduleFollowUp(
  env: Env,
  contact: string,
  category: string | undefined,
  subject: string
): Promise<void> {
  // Don't schedule follow-ups to system/bounce addresses
  if (!contact || BLOCKED_PATTERNS.some(p => p.test(contact))) {
    console.log(`[FollowUp] Skipping invalid address: ${contact}`);
    return;
  }

  const key = `followup:${contact.toLowerCase()}`;
  const existing = await env.FARMER_FRED_KV.get(key, "json") as FollowUpRecord | null;

  // Max 2 follow-ups per contact
  if (existing && existing.attempts >= 2) return;

  const days = (category === "lead") ? 2 : 4;
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + days);

  const record: FollowUpRecord = {
    contact,
    subject,
    sentAt: new Date().toISOString(),
    followUpAfter: followUpDate.toISOString(),
    category: category || "other",
    attempts: existing ? existing.attempts + 1 : 0
  };

  await env.FARMER_FRED_KV.put(key, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 30
  });
}

/**
 * Check for overdue follow-ups and create tasks.
 */
export async function checkOverdueFollowUps(env: Env): Promise<void> {
  const keys = await env.FARMER_FRED_KV.list({ prefix: "followup:" });
  const now = new Date();

  for (const key of keys.keys) {
    const record = await env.FARMER_FRED_KV.get(key.name, "json") as FollowUpRecord | null;
    if (!record) continue;

    if (new Date(record.followUpAfter) <= now) {
      const task = {
        id: `${Date.now()}-fu-${Math.random().toString(36).slice(2, 6)}`,
        type: "follow_up" as const,
        priority: record.category === "lead" ? "high" as const : "medium" as const,
        title: `Follow up with ${record.contact}`,
        description: `No reply received since ${record.sentAt}. Original subject: "${record.subject}". Attempt ${record.attempts + 1} of 2. Send a gentle reminder.`,
        createdAt: new Date().toISOString(),
        status: "pending" as const,
        assignedTo: "fred" as const
      };
      await env.FARMER_FRED_KV.put(`task:${task.id}`, JSON.stringify(task), {
        expirationTtl: 60 * 60 * 24 * 30
      });

      await env.FARMER_FRED_KV.delete(key.name);
      console.log(`[FollowUp] Created follow-up task for ${record.contact}`);
    }
  }
}

/**
 * Cancel follow-up for a contact (called when they reply).
 */
export async function cancelFollowUp(env: Env, contact: string): Promise<void> {
  const key = `followup:${contact.toLowerCase()}`;
  await env.FARMER_FRED_KV.delete(key);
}
