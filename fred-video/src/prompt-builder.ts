import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FredState } from './data-gatherer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOUL_PATH = path.join(__dirname, '..', 'SOUL.md');
const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

export type VideoType = 'daily-brief' | 'weekly-recap' | 'milestone';

function loadSoul(): string {
  return fs.readFileSync(SOUL_PATH, 'utf-8');
}

function loadTemplate(type: VideoType): string {
  const templatePath = path.join(PROMPTS_DIR, `${type}.md`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildDataBlock(state: FredState): string {
  const iowa = state.weather.find(w => w.region === 'Iowa') || state.weather[0];
  const cp = state.status?.criticalPath;

  const lines: string[] = [];

  if (iowa) {
    lines.push(`WEATHER: ${iowa.conditions}, ${iowa.temperature}°F, humidity ${iowa.humidity}%`);
    if (iowa.frostRisk) lines.push('FROST RISK: Yes — watch overnight temps');
    if (iowa.soilTempEstimate) lines.push(`SOIL TEMP ESTIMATE: ${iowa.soilTempEstimate}°F`);
    if (iowa.evaluation?.recommendation) lines.push(`RECOMMENDATION: ${iowa.evaluation.recommendation}`);
  }

  if (cp) {
    lines.push(`DAYS ALIVE: ${cp.daysAlive}`);
    lines.push(`DAYS TO PLANTING: ${cp.daysToPlanting}`);
    lines.push(`BUDGET: $${cp.moneySpentOnFarming} of $${cp.totalBudget} spent`);
    lines.push(`NEXT MILESTONE: ${cp.nextMilestone}`);
    lines.push(`PLANTING WINDOW: ${cp.plantingWindow}`);
    lines.push(`HARVEST TARGET: ${cp.harvestTarget}`);
    if (cp.landSecured) lines.push('LAND: Secured');
    if (cp.seedOrdered) lines.push('SEED: Ordered');
  }

  return lines.join('\n');
}

function buildLearningsBlock(state: FredState): string {
  const recent = (state.learnings?.learnings || []).slice(0, 3);
  if (recent.length === 0) return 'No new learnings this period.';
  return recent.map(l => `- ${l.insight} (${l.source})`).join('\n');
}

function buildRecentActivity(state: FredState): string {
  if (!state.recentLogs || state.recentLogs.length === 0) return 'No recent activity.';
  return state.recentLogs
    .slice(0, 5)
    .map(l => `- [${l.type}] ${l.message}`)
    .join('\n');
}

export function buildPrompt(type: VideoType, state: FredState): string {
  const soul = loadSoul();
  const template = loadTemplate(type);
  const date = formatDate();

  // Extract voice guidance from SOUL.md
  const voiceMatch = soul.match(/## Voice\n\n([\s\S]*?)(?=\n## )/);
  const voiceGuidance = voiceMatch?.[1]?.trim() || 'Plain, warm, direct. Short sentences.';

  // Extract video guidance
  const videoMatch = soul.match(/## Video-Specific Guidance\n\n([\s\S]*?)$/);
  const videoGuidance = videoMatch?.[1]?.trim() || '';

  // Fill template variables
  let prompt = template
    .replace(/\{\{DATE\}\}/g, date)
    .replace(/\{\{DATA\}\}/g, buildDataBlock(state))
    .replace(/\{\{LEARNINGS\}\}/g, buildLearningsBlock(state))
    .replace(/\{\{RECENT_ACTIVITY\}\}/g, buildRecentActivity(state))
    .replace(/\{\{VOICE\}\}/g, voiceGuidance)
    .replace(/\{\{VIDEO_GUIDANCE\}\}/g, videoGuidance);

  return prompt;
}

export function getDurationForType(type: VideoType): number {
  switch (type) {
    case 'daily-brief': return 20;
    case 'weekly-recap': return 45;
    case 'milestone': return 60;
  }
}
