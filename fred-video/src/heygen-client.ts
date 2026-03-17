import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.heygen.com';

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error('HEYGEN_API_KEY not set');
  return key;
}

export interface VideoAgentConfig {
  duration_sec?: number;
  avatar_id?: string;
  orientation?: 'portrait' | 'landscape';
}

interface VideoAgentResponse {
  error: string | null;
  data: { video_id: string };
}

interface VideoStatusData {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

export async function generateVideo(
  prompt: string,
  config?: VideoAgentConfig,
): Promise<string> {
  const body: Record<string, unknown> = { prompt };
  if (config) body.config = config;

  const res = await fetch(`${API_BASE}/v1/video_agent/generate`, {
    method: 'POST',
    headers: {
      'X-Api-Key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json() as Record<string, unknown>;

  // Handle error responses (may come as { code, message } or { error, data })
  if (json.code && json.message) throw new Error(`HeyGen: ${json.message}`);
  if (json.error) throw new Error(`HeyGen: ${json.error}`);

  const data = json.data as { video_id?: string } | undefined;
  if (!data?.video_id) throw new Error(`HeyGen: unexpected response: ${JSON.stringify(json)}`);
  return data.video_id;
}

export async function getVideoStatus(videoId: string): Promise<VideoStatusData> {
  const res = await fetch(
    `${API_BASE}/v1/video_status.get?video_id=${videoId}`,
    { headers: { 'X-Api-Key': getApiKey() } },
  );

  const json = await res.json() as { error?: string; data?: VideoStatusData; code?: number; message?: string };

  // v1 status endpoint returns { code, message } on error, not { error, data }
  if (json.code && json.message) throw new Error(json.message);
  if (json.error) throw new Error(json.error);
  return json.data!;
}

export async function pollUntilReady(
  videoId: string,
  intervalMs = 10_000,
  timeoutMs = 20 * 60 * 1000,
): Promise<VideoStatusData> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await getVideoStatus(videoId);
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${elapsed}s] status: ${status.status}`);

    if (status.status === 'completed') return status;
    if (status.status === 'failed') throw new Error(status.error || 'Video generation failed');

    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs / 1000}s waiting for video ${videoId}`);
}

export async function downloadVideo(
  url: string,
  outputDir: string,
  videoId: string,
): Promise<string> {
  const outputPath = path.join(outputDir, `${videoId}.mp4`);

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outputPath, buf);
      return outputPath;
    } catch (err) {
      lastErr = err as Error;
      const delay = 2000 * Math.pow(2, attempt);
      console.log(`  download attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error(`Download failed after 5 attempts: ${lastErr?.message}`);
}
