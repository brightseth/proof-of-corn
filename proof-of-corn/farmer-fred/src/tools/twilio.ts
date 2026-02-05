/**
 * Twilio API helpers for Farmer Fred voice calls
 *
 * Handles: outbound calls, TwiML generation, SMS
 */

import type { Env } from "../types";

/**
 * Generate TwiML to connect an incoming call to a Media Stream WebSocket
 */
export function twimlConnect(wsUrl: string, callSid: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}?callSid=${callSid}">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Connect>
</Response>`;
}

/**
 * Generate TwiML for a simple voice response (e.g., fallback)
 */
export function twimlSay(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man">${escapeXml(message)}</Say>
</Response>`;
}

/**
 * Initiate an outbound call via Twilio REST API
 */
export async function makeOutboundCall(
  env: Env,
  to: string,
  wsUrl: string
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`;

  // TwiML that connects to our WebSocket stream when the recipient answers
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
    </Stream>
  </Connect>
</Response>`;

  const body = new URLSearchParams({
    To: to,
    From: env.TWILIO_PHONE_NUMBER,
    Twiml: twiml,
    StatusCallback: `https://farmer-fred.sethgoldstein.workers.dev/voice/status`,
    StatusCallbackEvent: "initiated ringing answered completed",
    StatusCallbackMethod: "POST",
  });

  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      return { success: false, error: `Twilio error ${res.status}: ${JSON.stringify(data)}` };
    }

    return { success: true, callSid: data.sid as string };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Send an SMS via Twilio REST API
 */
export async function sendSms(
  env: Env,
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams({
    To: to,
    From: env.TWILIO_PHONE_NUMBER,
    Body: body,
  });

  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      return { success: false, error: `Twilio error ${res.status}: ${JSON.stringify(data)}` };
    }

    return { success: true, messageSid: data.sid as string };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Look up a Twilio call by SID
 */
export async function getCallInfo(
  env: Env,
  callSid: string
): Promise<Record<string, unknown> | null> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
