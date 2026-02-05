/**
 * PROACTIVE ALERTING
 *
 * Send alert emails to governance council on important events.
 * Rate-limited: max 1 per category per 6 hours.
 */

import { Env } from "./types";

// Governance council alert recipients
const ALERT_RECIPIENTS = [
  "sethgoldstein@gmail.com",
  "joseph.nelson@roboflow.com",
];

export async function sendAlertToSeth(
  env: Env,
  category: string,
  subject: string,
  body: string
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  // Rate limit: 1 alert per category per 6 hours
  const rateLimitKey = `alert-rate:${category}`;
  const lastAlert = await env.FARMER_FRED_KV.get(rateLimitKey);
  if (lastAlert) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Farmer Fred <fred@proofofcorn.com>",
        to: ALERT_RECIPIENTS,
        subject: `[Fred Alert] ${subject}`,
        text: body
      })
    });

    if (response.ok) {
      await env.FARMER_FRED_KV.put(rateLimitKey, new Date().toISOString(), {
        expirationTtl: 60 * 60 * 6
      });
      console.log(`[Alert] Sent ${category} alert: ${subject}`);
      return true;
    }
    console.error(`[Alert] Failed to send: ${response.status}`);
    return false;
  } catch (error) {
    console.error(`[Alert] Error:`, error);
    return false;
  }
}
