/**
 * FARMER FRED - Cloudflare Worker
 *
 * Autonomous agricultural agent for Proof of Corn.
 *
 * Endpoints:
 *   GET  /              - Agent status and info
 *   GET  /health        - Health check
 *   GET  /weather       - Current weather for all regions
 *   GET  /status        - Full status report
 *   POST /check         - Trigger daily check (also runs on cron)
 *   POST /decide        - Submit an action for evaluation
 *   GET  /constitution  - View the agent's constitution
 *   GET  /log           - View recent decisions
 */

import { FarmerFredAgent, AgentContext } from "./agent";
import { CONSTITUTION, SYSTEM_PROMPT } from "./constitution";
import { fetchAllRegionsWeather, evaluatePlantingConditions } from "./tools/weather";
import { createLogEntry, logDecision, logWeatherCheck, formatLogEntry, LogEntry } from "./tools/log";

export interface Env {
  ANTHROPIC_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  FARMER_FRED_KV: KVNamespace;
  FARMER_FRED_DB: D1Database;
  FARMER_FRED_STATE: DurableObjectNamespace;
  AGENT_NAME: string;
  AGENT_VERSION: string;
}

// ============================================
// MAIN WORKER
// ============================================

export default {
  /**
   * HTTP Request Handler
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for API access
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handlers
      switch (path) {
        case "/":
          return json(getAgentInfo(env), corsHeaders);

        case "/health":
          return json({ status: "healthy", timestamp: new Date().toISOString() }, corsHeaders);

        case "/constitution":
          return json(CONSTITUTION, corsHeaders);

        case "/system-prompt":
          return json({ prompt: SYSTEM_PROMPT }, corsHeaders);

        case "/weather":
          return await handleWeather(env, corsHeaders);

        case "/status":
          return await handleStatus(env, corsHeaders);

        case "/check":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleDailyCheck(env, ctx, corsHeaders);

        case "/decide":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleDecide(request, env, corsHeaders);

        case "/log":
          return await handleLog(env, corsHeaders);

        default:
          return json({ error: "Not found", path }, corsHeaders, 404);
      }
    } catch (error) {
      console.error("Worker error:", error);
      return json(
        { error: "Internal error", message: String(error) },
        corsHeaders,
        500
      );
    }
  },

  /**
   * Cron Trigger Handler - Daily check at 6 AM UTC
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[${new Date().toISOString()}] Cron triggered: Daily check`);

    try {
      const result = await performDailyCheck(env);
      console.log("Daily check completed:", result.decision);

      // Store result in KV
      await env.FARMER_FRED_KV.put(
        `daily-check:${new Date().toISOString().split("T")[0]}`,
        JSON.stringify(result),
        { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
      );
    } catch (error) {
      console.error("Daily check failed:", error);
    }
  }
};

// ============================================
// HANDLERS
// ============================================

function getAgentInfo(env: Env) {
  return {
    name: env.AGENT_NAME || CONSTITUTION.name,
    version: env.AGENT_VERSION || CONSTITUTION.version,
    origin: CONSTITUTION.origin,
    principles: CONSTITUTION.principles.map(p => p.name),
    regions: CONSTITUTION.regions.map(r => ({
      name: r.name,
      status: r.status,
      plantingWindow: r.plantingWindow
    })),
    economics: CONSTITUTION.economics.revenueShare,
    endpoints: {
      health: "/health",
      weather: "/weather",
      status: "/status",
      check: "/check (POST)",
      decide: "/decide (POST)",
      constitution: "/constitution",
      log: "/log"
    }
  };
}

async function handleWeather(env: Env, headers: Record<string, string>): Promise<Response> {
  const apiKey = env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return json({ error: "Weather API key not configured" }, headers, 500);
  }

  const weather = await fetchAllRegionsWeather(apiKey);
  const evaluations = weather.map(w => ({
    ...w,
    evaluation: evaluatePlantingConditions(w)
  }));

  return json({ weather: evaluations, timestamp: new Date().toISOString() }, headers);
}

async function handleStatus(env: Env, headers: Record<string, string>): Promise<Response> {
  // Get recent log entries from KV
  const recentLogs: LogEntry[] = [];
  const logKeys = await env.FARMER_FRED_KV.list({ prefix: "log:" });
  for (const key of logKeys.keys.slice(0, 10)) {
    const entry = await env.FARMER_FRED_KV.get(key.name, "json");
    if (entry) recentLogs.push(entry as LogEntry);
  }

  // Get weather
  let weather = null;
  try {
    weather = await fetchAllRegionsWeather(env.OPENWEATHER_API_KEY);
  } catch (e) {
    console.error("Weather fetch failed:", e);
  }

  // Get last daily check
  const today = new Date().toISOString().split("T")[0];
  const lastCheck = await env.FARMER_FRED_KV.get(`daily-check:${today}`, "json");

  return json({
    agent: getAgentInfo(env),
    weather,
    recentLogs,
    lastDailyCheck: lastCheck,
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleDailyCheck(
  env: Env,
  ctx: ExecutionContext,
  headers: Record<string, string>
): Promise<Response> {
  const result = await performDailyCheck(env);

  // Store in KV
  ctx.waitUntil(
    env.FARMER_FRED_KV.put(
      `daily-check:${new Date().toISOString().split("T")[0]}`,
      JSON.stringify(result),
      { expirationTtl: 60 * 60 * 24 * 30 }
    )
  );

  return json(result, headers);
}

async function handleDecide(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as { action: string };
  if (!body.action) {
    return json({ error: "Missing 'action' in request body" }, headers, 400);
  }

  const agent = new FarmerFredAgent(env.ANTHROPIC_API_KEY);
  const context = await buildAgentContext(env);
  const result = await agent.evaluateAction(body.action, context);

  // Log the decision
  const logEntry = logDecision(
    body.action,
    result.rationale,
    !result.needsHumanApproval
  );
  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return json(result, headers);
}

async function handleLog(env: Env, headers: Record<string, string>): Promise<Response> {
  const logs: LogEntry[] = [];
  const logKeys = await env.FARMER_FRED_KV.list({ prefix: "log:" });

  for (const key of logKeys.keys.slice(0, 50)) {
    const entry = await env.FARMER_FRED_KV.get(key.name, "json");
    if (entry) logs.push(entry as LogEntry);
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return json({ logs, count: logs.length }, headers);
}

// ============================================
// CORE LOGIC
// ============================================

async function performDailyCheck(env: Env) {
  const agent = new FarmerFredAgent(env.ANTHROPIC_API_KEY);
  const context = await buildAgentContext(env);
  const result = await agent.dailyCheck(context);

  // Log the check
  const logEntry = createLogEntry(
    "agent",
    "Daily Check Complete",
    `Decision: ${result.decision}\n\nRationale: ${result.rationale}\n\nActions: ${result.actions.length}\nNeeds approval: ${result.needsHumanApproval}`
  );

  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return result;
}

async function buildAgentContext(env: Env): Promise<AgentContext> {
  // Fetch weather
  let weather = null;
  try {
    const allWeather = await fetchAllRegionsWeather(env.OPENWEATHER_API_KEY);
    weather = allWeather[0] ? {
      region: allWeather[0].region,
      temperature: allWeather[0].temperature,
      conditions: allWeather[0].conditions,
      forecast: allWeather[0].forecast,
      plantingViable: allWeather[0].plantingViable
    } : null;
  } catch (e) {
    console.error("Weather fetch failed:", e);
  }

  // Get budget from KV (or use defaults)
  const budgetData = await env.FARMER_FRED_KV.get("budget", "json") as {
    spent: number;
    allocated: number;
  } | null;

  const budget = budgetData || { spent: 12.99, allocated: 2500 };

  // Get recent decisions
  const recentDecisions: AgentContext["recentDecisions"] = [];
  const logKeys = await env.FARMER_FRED_KV.list({ prefix: "log:" });
  for (const key of logKeys.keys.slice(0, 5)) {
    const entry = await env.FARMER_FRED_KV.get(key.name, "json") as LogEntry;
    if (entry) {
      recentDecisions.push({
        id: key.name,
        timestamp: entry.timestamp,
        action: entry.title,
        rationale: entry.description,
        principles: entry.principles || [],
        autonomous: entry.aiDecision,
        outcome: null
      });
    }
  }

  return {
    weather,
    emails: [], // TODO: Integrate email checking
    budget: {
      spent: budget.spent,
      allocated: budget.allocated,
      remaining: budget.allocated - budget.spent,
      percentUsed: budget.spent / budget.allocated
    },
    pendingTasks: [], // TODO: Integrate task management
    recentDecisions
  };
}

// ============================================
// UTILITIES
// ============================================

function json(
  data: unknown,
  extraHeaders: Record<string, string> = {},
  status = 200
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });
}

// ============================================
// DURABLE OBJECT (for stateful operations)
// ============================================

export class FarmerFredState {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/get") {
      const data = await this.state.storage.get("state");
      return new Response(JSON.stringify(data || {}));
    }

    if (url.pathname === "/set") {
      const body = await request.json();
      await this.state.storage.put("state", body);
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response("Not found", { status: 404 });
  }
}
