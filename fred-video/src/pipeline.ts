import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { gatherState } from './data-gatherer.js';
import { buildPrompt, getDurationForType, type VideoType } from './prompt-builder.js';
// HeyGen kept as fallback — switch provider in ~/.seth/agents/registry.json
import { generateVideo, pollUntilReady, downloadVideo, type VideoAgentConfig } from './heygen-client.js';
import { notifyTelegram, updateStatus, notifyInbox } from './notifier.js';

// Avatar pipeline on @seth gateway (Phase 9)
const AVATAR_GATEWAY = process.env.AVATAR_GATEWAY_URL || 'http://localhost:3847';

async function generateViaAvatarPipeline(prompt: string, type: string): Promise<{ videoUrl: string | null; localPath: string | null; duration: number | null }> {
  const body = JSON.stringify({ agentName: 'fred', text: prompt, type });

  return new Promise((resolve, reject) => {
    const url = new URL(`${AVATAR_GATEWAY}/avatar/generate`);
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          if (data.status === 'completed') {
            resolve({ videoUrl: data.mp4Url || data.videoUrl, localPath: data.localPath, duration: null });
          } else {
            reject(new Error(data.error || 'Avatar pipeline failed'));
          }
        } catch (err) {
          reject(new Error(`Invalid response from avatar pipeline`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Check if avatar pipeline is available (agent has avatar config with faceId + voiceId)
function useAvatarPipeline(): boolean {
  try {
    const registry = JSON.parse(fs.readFileSync(
      path.join(process.env.HOME || '/Users/sethstudio1', '.seth/agents/registry.json'), 'utf-8'
    ));
    const fred = registry.agents?.find((a: any) => a.name === 'fred');
    return !!(fred?.avatar?.faceId && fred?.avatar?.voiceId && fred?.avatar?.provider !== 'heygen');
  } catch {
    return false;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HISTORY_PATH = path.join(__dirname, '..', 'state', 'history.json');
const VIDEOS_DIR = path.join(__dirname, '..', 'state', 'videos');

interface HistoryEntry {
  id: string;
  type: VideoType;
  videoId: string;
  videoUrl: string | null;
  localPath: string | null;
  prompt: string;
  duration: number | null;
  status: 'completed' | 'failed';
  error?: string;
  startedAt: string;
  completedAt: string;
}

function loadHistory(): HistoryEntry[] {
  if (!fs.existsSync(HISTORY_PATH)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
}

function saveHistory(history: HistoryEntry[]): void {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

export async function runPipeline(type: VideoType): Promise<HistoryEntry> {
  const startedAt = new Date().toISOString();
  console.log(`\n[fred-video] Starting ${type} pipeline at ${startedAt}`);

  // 1. Gather state from Fred's Worker
  console.log('[1/6] Gathering state from Worker...');
  const state = await gatherState();
  console.log(`  Fetched: ${state.weather.length} regions, ${state.recentLogs.length} logs`);

  // 2. Build prompt
  console.log('[2/6] Building prompt...');
  const prompt = buildPrompt(type, state);
  const duration = getDurationForType(type);
  console.log(`  Prompt: ${prompt.length} chars, target duration: ${duration}s`);

  // 3-5. Generate video — avatar pipeline (Simli) or HeyGen fallback
  let videoId = '';
  let videoUrl: string | null = null;
  let localPath: string | null = null;
  let videoDuration: number | null = null;

  if (useAvatarPipeline()) {
    // Avatar pipeline: TTS + Simli via @seth gateway
    console.log('[3/5] Generating video via avatar pipeline (Simli)...');
    try {
      const result = await generateViaAvatarPipeline(prompt, type);
      videoId = `avatar-${Date.now()}`;
      videoUrl = result.videoUrl;
      localPath = result.localPath;
      videoDuration = result.duration;
      console.log(`  Video ready: ${videoUrl ? 'yes' : 'no URL'}`);
    } catch (err) {
      const error = (err as Error).message;
      console.error(`  Avatar pipeline failed: ${error}`);
      const entry: HistoryEntry = {
        id: `${Date.now()}`, type, videoId: '', videoUrl: null, localPath: null,
        prompt, duration: null, status: 'failed', error, startedAt,
        completedAt: new Date().toISOString(),
      };
      const history = loadHistory();
      history.push(entry);
      saveHistory(history);
      await notifyTelegram(`Fred Video FAILED (${type}): ${error}`);
      return entry;
    }
  } else {
    // HeyGen fallback
    console.log('[3/6] Generating video via HeyGen Video Agent...');
    const config: VideoAgentConfig = {
      duration_sec: duration,
      orientation: type === 'daily-brief' ? 'portrait' : 'landscape',
    };
    const avatarId = process.env.HEYGEN_AVATAR_ID;
    if (avatarId) config.avatar_id = avatarId;

    try {
      videoId = await generateVideo(prompt, config);
    } catch (err) {
      const error = (err as Error).message;
      console.error(`  Generation failed: ${error}`);
      const entry: HistoryEntry = {
        id: `${Date.now()}`, type, videoId: '', videoUrl: null, localPath: null,
        prompt, duration: null, status: 'failed', error, startedAt,
        completedAt: new Date().toISOString(),
      };
      const history = loadHistory();
      history.push(entry);
      saveHistory(history);
      await notifyTelegram(`Fred Video FAILED (${type}): ${error}`);
      return entry;
    }
    console.log(`  Video ID: ${videoId}`);

    console.log('[4/6] Polling for completion...');
    let videoData;
    try {
      videoData = await pollUntilReady(videoId);
    } catch (err) {
      const error = (err as Error).message;
      console.error(`  Polling failed: ${error}`);
      const entry: HistoryEntry = {
        id: `${Date.now()}`, type, videoId, videoUrl: null, localPath: null,
        prompt, duration: null, status: 'failed', error, startedAt,
        completedAt: new Date().toISOString(),
      };
      const history = loadHistory();
      history.push(entry);
      saveHistory(history);
      await notifyTelegram(`Fred Video FAILED at poll (${type}): ${error}\nVideo ID: ${videoId}`);
      return entry;
    }

    console.log('[5/6] Downloading video...');
    videoUrl = videoData.video_url || null;
    videoDuration = videoData.duration || null;
    if (videoUrl) {
      try {
        if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
        localPath = await downloadVideo(videoUrl, VIDEOS_DIR, videoId);
        console.log(`  Saved to: ${localPath}`);
      } catch (err) {
        console.warn(`  Download failed: ${(err as Error).message} (video URL still valid)`);
      }
    }
  }

  // 6. Notify
  console.log('[6/6] Notifying...');
  const entry: HistoryEntry = {
    id: `${Date.now()}`,
    type,
    videoId,
    videoUrl,
    localPath,
    prompt,
    duration: videoDuration,
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
  };

  const history = loadHistory();
  history.push(entry);
  saveHistory(history);

  updateStatus(videoUrl, videoId);
  notifyInbox(`Fred video (${type}) generated: ${videoId}`);

  const msg = [
    `Fred Video Ready (${type})`,
    `Duration: ${videoDuration ? Math.round(videoDuration) + 's' : 'unknown'}`,
    videoUrl ? `URL: ${videoUrl}` : '',
  ].filter(Boolean).join('\n');

  await notifyTelegram(msg);
  console.log(`\n[fred-video] Pipeline complete. Video: ${videoId}`);

  return entry;
}
