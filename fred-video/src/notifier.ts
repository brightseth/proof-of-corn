import fs from 'fs';
import path from 'path';

const TELEGRAM_API = 'https://api.telegram.org';
const STATUS_PATH = path.resolve(
  process.env.HOME || '~',
  '.seth/agents/farmerfredai/status.json',
);
const INBOX_DIR = path.resolve(
  process.env.HOME || '~',
  '.seth/inbox',
);

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  return token;
}

function getSethChatId(): string {
  return process.env.SETH_TELEGRAM_ID || process.env.TELEGRAM_ALLOWED_USERS || '1644612303';
}

export async function notifyTelegram(message: string): Promise<void> {
  const token = getBotToken();
  const chatId = getSethChatId();

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`Telegram notification failed: ${res.status} ${body}`);
  }
}

export function updateStatus(videoUrl: string | null, videoId: string): void {
  const status = {
    agent: 'farmerfredai',
    status: 'active',
    lastHeartbeat: new Date().toISOString(),
    summary: 'FarmerFredAI — Video pipeline active',
    health: 'green',
    version: '2.0.0',
    lastVideo: {
      id: videoId,
      url: videoUrl,
      generatedAt: new Date().toISOString(),
    },
  };

  const dir = path.dirname(STATUS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
}

export function notifyInbox(summary: string): void {
  if (!fs.existsSync(INBOX_DIR)) fs.mkdirSync(INBOX_DIR, { recursive: true });

  const msg = {
    type: 'update',
    summary,
    from: 'fred-video-pipeline',
    timestamp: new Date().toISOString(),
  };

  const filename = `${Date.now()}.json`;
  fs.writeFileSync(path.join(INBOX_DIR, filename), JSON.stringify(msg, null, 2));
}
