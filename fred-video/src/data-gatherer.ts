import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORKER_BASE = 'https://farmer-fred.sethgoldstein.workers.dev';
const CACHE_PATH = path.join(__dirname, '..', 'state', 'last-data.json');
const FETCH_TIMEOUT = 15_000;

interface RegionWeather {
  region: string;
  temperature: number;
  humidity: number;
  conditions: string;
  plantingViable: boolean;
  frostRisk: boolean;
  soilTempEstimate: number;
  evaluation: { recommendation: string };
}

export interface FredState {
  weather: RegionWeather[];
  status: {
    agent: { name: string; version: string };
    criticalPath: {
      landSecured: boolean;
      seedOrdered: boolean;
      nextMilestone: string;
      plantingWindow: string;
      harvestTarget: string;
      daysAlive: number;
      daysToPlanting: number;
      moneySpentOnFarming: number;
      totalBudget: number;
    };
  };
  learnings: { learnings: Array<{ insight: string; source: string; category: string }> };
  recentLogs: Array<{ type: string; message: string; timestamp: string }>;
  fetchedAt: string;
}

async function fetchJson(endpoint: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(`${WORKER_BASE}${endpoint}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function gatherState(): Promise<FredState> {
  try {
    const [weather, status, learnings, log] = await Promise.all([
      fetchJson('/weather') as Promise<{ weather: RegionWeather[] }>,
      fetchJson('/status') as Promise<FredState['status']>,
      fetchJson('/learnings') as Promise<FredState['learnings']>,
      fetchJson('/log') as Promise<{ logs: FredState['recentLogs'] }>,
    ]);

    const state: FredState = {
      weather: weather.weather,
      status,
      learnings,
      recentLogs: (log.logs || []).slice(0, 10),
      fetchedAt: new Date().toISOString(),
    };

    // Cache for fallback
    fs.writeFileSync(CACHE_PATH, JSON.stringify(state, null, 2));
    return state;
  } catch (err) {
    console.warn(`Worker fetch failed: ${(err as Error).message}. Using cached state.`);
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
    throw new Error('Worker unreachable and no cached state available');
  }
}
