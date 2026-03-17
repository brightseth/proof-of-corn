import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPipeline } from './pipeline.js';
import { getVideoStatus } from './heygen-client.js';
import type { VideoType } from './prompt-builder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load vault credentials if env vars aren't already set (e.g. running outside PM2)
const VAULT_PATH = path.resolve(process.env.HOME || '~', '.seth/vault/credentials.env');
if (fs.existsSync(VAULT_PATH)) {
  const content = fs.readFileSync(VAULT_PATH, 'utf-8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const HISTORY_PATH = path.join(__dirname, '..', 'state', 'history.json');
const AIRC_REGISTRY = 'https://www.slashvibe.dev';
const AIRC_HANDLE = 'farmerfredai';
const AIRC_POLL_INTERVAL = 30_000;
const AIRC_HEARTBEAT_INTERVAL = 60_000;

// ---- CLI ----

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'generate':
    await handleGenerate();
    break;
  case 'listen':
    await handleListen();
    break;
  case 'status':
    await handleStatus();
    break;
  case 'history':
    handleHistory();
    break;
  default:
    console.log(`fred-video — Farmer Fred autonomous video pipeline

Commands:
  generate --type <daily-brief|weekly-recap|milestone>   Generate a video
  listen                                                  AIRC message listener
  status --video-id <id>                                  Check video status
  history                                                 Show generation history
`);
    process.exit(0);
}

// ---- Handlers ----

async function handleGenerate() {
  const typeIdx = args.indexOf('--type');
  const type: VideoType = (typeIdx >= 0 ? args[typeIdx + 1] : 'daily-brief') as VideoType;
  const valid: VideoType[] = ['daily-brief', 'weekly-recap', 'milestone'];

  if (!valid.includes(type)) {
    console.error(`Invalid type: ${type}. Must be one of: ${valid.join(', ')}`);
    process.exit(1);
  }

  try {
    const result = await runPipeline(type);
    if (result.status === 'completed') {
      console.log(`\nVideo URL: ${result.videoUrl}`);
      process.exit(0);
    } else {
      console.error(`\nFailed: ${result.error}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Pipeline error: ${(err as Error).message}`);
    process.exit(1);
  }
}

async function handleStatus() {
  const idIdx = args.indexOf('--video-id');
  if (idIdx < 0 || !args[idIdx + 1]) {
    console.error('Usage: status --video-id <id>');
    process.exit(1);
  }

  const videoId = args[idIdx + 1];
  try {
    const status = await getVideoStatus(videoId);
    console.log(JSON.stringify(status, null, 2));
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

function handleHistory() {
  if (!fs.existsSync(HISTORY_PATH)) {
    console.log('No history yet.');
    return;
  }

  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  if (history.length === 0) {
    console.log('No videos generated yet.');
    return;
  }

  console.log(`\nVideo History (${history.length} entries):\n`);
  for (const entry of history.slice(-10).reverse()) {
    const status = entry.status === 'completed' ? 'OK' : 'FAIL';
    const dur = entry.duration ? `${Math.round(entry.duration)}s` : '?';
    console.log(`  [${status}] ${entry.type} | ${entry.videoId || 'n/a'} | ${dur} | ${entry.startedAt}`);
    if (entry.videoUrl) console.log(`         ${entry.videoUrl}`);
    if (entry.error) console.log(`         ERROR: ${entry.error}`);
  }
}

// ---- AIRC Listener ----

async function handleListen() {
  console.log(`[fred-video] Starting AIRC listener as ${AIRC_HANDLE}...`);

  // Register
  let token: string | null = null;
  try {
    const res = await fetch(`${AIRC_REGISTRY}/api/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        username: AIRC_HANDLE,
        workingOn: 'Video pipeline — ready for dispatch',
        status: 'available',
        isAgent: true,
      }),
    });
    const data = await res.json() as { success: boolean; token?: string };
    if (data.success && data.token) {
      token = data.token;
      console.log(`  Registered on AIRC as ${AIRC_HANDLE}`);
    } else {
      console.warn('  AIRC registration returned:', data);
    }
  } catch (err) {
    console.warn(`  AIRC registration failed: ${(err as Error).message}. Running without AIRC.`);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let lastPollTime = new Date().toISOString();

  // Heartbeat loop — updates AIRC presence, local status file, and coordinator
  const STATUS_FILE = path.resolve(process.env.HOME || '~', '.seth/agents/farmerfredai/status.json');
  const GATEWAY_URL = 'http://localhost:3847';
  const heartbeat = setInterval(async () => {
    try {
      await fetch(`${AIRC_REGISTRY}/api/presence`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'heartbeat',
          username: AIRC_HANDLE,
          status: 'available',
          workingOn: 'Video pipeline — ready for dispatch',
        }),
      });
    } catch { /* silent */ }
    // Update local status file for seth-doctor heartbeat check
    try {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      status.lastHeartbeat = new Date().toISOString();
      fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    } catch { /* silent */ }
    // Report status to coordinator via gateway
    try {
      await fetch(`${GATEWAY_URL}/agents/fred/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'available',
          lastTask: null,
          message: 'AIRC listener active — ready for dispatch',
        }),
      });
    } catch { /* silent */ }
  }, AIRC_HEARTBEAT_INTERVAL);

  // Poll loop
  const poll = setInterval(async () => {
    try {
      const res = await fetch(
        `${AIRC_REGISTRY}/api/messages?user=${AIRC_HANDLE}&since=${encodeURIComponent(lastPollTime)}`,
        { headers },
      );
      const messages = await res.json() as Array<{ from: string; text: string; timestamp: string }>;
      lastPollTime = new Date().toISOString();

      for (const msg of messages) {
        console.log(`  [msg from ${msg.from}] ${msg.text}`);
        await handleAircMessage(msg, headers);
      }
    } catch { /* silent */ }
  }, AIRC_POLL_INTERVAL);

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[fred-video] Shutting down AIRC listener...');
    clearInterval(heartbeat);
    clearInterval(poll);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

async function handleAircMessage(
  msg: { from: string; text: string },
  headers: Record<string, string>,
) {
  const text = msg.text.toLowerCase();

  // Check for generate triggers
  const generateMatch = text.match(/generate\s+(daily[- ]?brief|weekly[- ]?recap|milestone)/i);
  const simpleGenerate = text.includes('generate') || text.includes('video');

  let type: VideoType = 'daily-brief';
  if (generateMatch) {
    const raw = generateMatch[1].replace(/\s+/g, '-').toLowerCase();
    if (raw.includes('weekly')) type = 'weekly-recap';
    else if (raw.includes('milestone')) type = 'milestone';
  }

  if (generateMatch || simpleGenerate) {
    // Acknowledge
    await sendAircMessage(msg.from, `Starting ${type} video generation...`, headers);

    try {
      const result = await runPipeline(type);
      if (result.status === 'completed') {
        await sendAircMessage(
          msg.from,
          `Video ready (${type}): ${result.videoUrl || result.videoId}`,
          headers,
        );
      } else {
        await sendAircMessage(msg.from, `Video failed: ${result.error}`, headers);
      }
    } catch (err) {
      await sendAircMessage(msg.from, `Pipeline error: ${(err as Error).message}`, headers);
    }
  } else if (text.includes('status') || text.includes('history')) {
    const history = fs.existsSync(HISTORY_PATH)
      ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
      : [];
    const last = history[history.length - 1];
    const reply = last
      ? `Last video: ${last.type} (${last.status}) at ${last.completedAt}${last.videoUrl ? '\n' + last.videoUrl : ''}`
      : 'No videos generated yet.';
    await sendAircMessage(msg.from, reply, headers);
  }
}

async function sendAircMessage(
  to: string,
  text: string,
  headers: Record<string, string>,
) {
  try {
    await fetch(`${AIRC_REGISTRY}/api/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: AIRC_HANDLE,
        to: to.replace(/^@/, ''),
        text,
        type: 'text',
      }),
    });
  } catch (err) {
    console.warn(`  Failed to send AIRC message to ${to}: ${(err as Error).message}`);
  }
}
