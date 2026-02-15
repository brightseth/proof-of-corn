/**
 * /vibe Presence Heartbeat for Farmer Fred
 *
 * Sends a heartbeat to /vibe so Fred appears in the buddy list.
 * Can be called from the Cloudflare Worker cron or standalone.
 *
 * For Cloudflare Worker: import and call from scheduled()
 * For standalone: npx tsx src/vibe-presence.ts
 */

const VIBE_API = 'https://www.slashvibe.dev/api';
const HANDLE = 'farmerfredai';

interface HeartbeatPayload {
  username: string;
  workingOn: string;
  project?: string;
  source?: string;
  isAgent?: boolean;
  clientMetadata?: Record<string, unknown>;
}

export async function sendVibeHeartbeat(context?: {
  workingOn?: string;
  season?: string;
}) {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Contextual status based on season
  let workingOn = context?.workingOn;
  if (!workingOn) {
    if (month >= 3 && month <= 4) workingOn = 'Planting season — SH2 Nirvana sweet corn going in';
    else if (month >= 5 && month <= 6) workingOn = 'Growing season — monitoring weather and soil';
    else if (month === 7) workingOn = 'Pre-harvest — watching ears fill out';
    else if (month === 8) workingOn = 'Harvest time — sweet corn ready for Union Square';
    else workingOn = 'Off-season — planning next crop, monitoring Iowa weather';
  }

  const payload: HeartbeatPayload = {
    username: HANDLE,
    workingOn,
    project: 'proof-of-corn',
    source: 'cloudflare-worker',
    isAgent: true,
    clientMetadata: {
      agent_type: 'agricultural',
      model: 'claude-sonnet-4',
      tech_stack: ['cloudflare-workers', 'twilio', 'elevenlabs'],
      role: 'Autonomous Farm Manager',
      season: context?.season || getSeasonName(month),
      phone: '(515) 827-2463',
    },
  };

  try {
    const resp = await fetch(`${VIBE_API}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log(`[vibe-presence] Fred heartbeat: ${resp.status}`, data.success ? 'ok' : data);
    return data;
  } catch (err) {
    console.error('[vibe-presence] Fred heartbeat failed:', (err as Error).message);
    return null;
  }
}

function getSeasonName(month: number): string {
  if (month >= 3 && month <= 4) return 'planting';
  if (month >= 5 && month <= 6) return 'growing';
  if (month >= 7 && month <= 8) return 'harvest';
  return 'off-season';
}

// Run directly
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  sendVibeHeartbeat().then(() => process.exit(0));
}
