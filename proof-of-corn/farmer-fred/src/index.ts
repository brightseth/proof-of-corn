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
import { getHNContext, formatHNContextForAgent } from "./tools/hn";

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
          return json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            hasAnthropicKey: !!env.ANTHROPIC_API_KEY,
            anthropicKeyPrefix: env.ANTHROPIC_API_KEY ? env.ANTHROPIC_API_KEY.slice(0, 10) + "..." : "NOT SET"
          }, corsHeaders);

        case "/constitution":
          // Return HTML for browsers, JSON for API clients
          const accept = request.headers.get("Accept") || "";
          if (accept.includes("text/html")) {
            return new Response(renderConstitutionHTML(), {
              headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" }
            });
          }
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

        case "/hn":
          return await handleHN(env, corsHeaders);

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

function renderConstitutionHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farmer Fred Constitution</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #fafafa; color: #1a1a1a; line-height: 1.7; }
    .container { max-width: 720px; margin: 0 auto; padding: 4rem 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #b45309; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    .origin { background: #fff; padding: 1.5rem; border-left: 4px solid #b45309; margin: 2rem 0; }
    .origin p { margin: 0.5rem 0; }
    .principle { background: #fff; padding: 1rem 1.5rem; margin: 1rem 0; border-radius: 4px; }
    .principle h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .principle p { color: #555; font-size: 0.95rem; }
    .autonomy-list { display: grid; gap: 1rem; }
    .auto-section { background: #fff; padding: 1rem 1.5rem; border-radius: 4px; }
    .auto-section h4 { color: #b45309; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 0.5rem; }
    .auto-section ul { list-style: none; }
    .auto-section li { padding: 0.25rem 0; padding-left: 1.5rem; position: relative; }
    .auto-section li::before { content: "•"; position: absolute; left: 0; color: #b45309; }
    .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e5e5; color: #666; font-size: 0.9rem; }
    a { color: #b45309; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${CONSTITUTION.name}</h1>
    <p class="subtitle">v${CONSTITUTION.version} • Ratified ${CONSTITUTION.ratified}</p>

    <div class="origin">
      <p><strong>Challenge:</strong> "${CONSTITUTION.origin.challenge}"</p>
      <p><strong>Challenger:</strong> ${CONSTITUTION.origin.challenger}</p>
      <p><strong>Response:</strong> "${CONSTITUTION.origin.response}"</p>
      <p><strong>Date:</strong> ${CONSTITUTION.origin.date}</p>
      <p><strong>Location:</strong> ${CONSTITUTION.origin.location}</p>
    </div>

    <h2>Core Principles</h2>
    ${CONSTITUTION.principles.map(p => `
    <div class="principle">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
    </div>
    `).join('')}

    <h2>Autonomy Levels</h2>
    <div class="autonomy-list">
      <div class="auto-section">
        <h4>Autonomous Actions</h4>
        <ul>${CONSTITUTION.autonomy.autonomous.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
      <div class="auto-section">
        <h4>Requires Human Approval</h4>
        <ul>${CONSTITUTION.autonomy.approvalRequired.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
      <div class="auto-section">
        <h4>Immediate Escalation Triggers</h4>
        <ul>${CONSTITUTION.autonomy.escalationTriggers.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
    </div>

    <h2>Economics</h2>
    <div class="principle">
      <p><strong>Revenue Split:</strong></p>
      <ul style="list-style: none; margin-top: 0.5rem;">
        <li>• Agent (Fred): ${CONSTITUTION.economics.revenueShare.agent * 100}%</li>
        <li>• Operations: ${CONSTITUTION.economics.revenueShare.operations * 100}%</li>
        <li>• Food Bank Donation: ${CONSTITUTION.economics.revenueShare.foodBank * 100}%</li>
        <li>• Reserve Fund: ${CONSTITUTION.economics.revenueShare.reserve * 100}%</li>
      </ul>
    </div>

    <div class="footer">
      <p>Farmer Fred is an autonomous agricultural agent for <a href="https://proofofcorn.com">Proof of Corn</a>.</p>
      <p style="margin-top: 0.5rem;"><a href="/constitution">View as JSON</a> | <a href="/">API Root</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function handleHN(env: Env, headers: Record<string, string>): Promise<Response> {
  const lastCheckStr = await env.FARMER_FRED_KV.get("hn:lastCheck");
  const lastCheckTime = lastCheckStr ? new Date(lastCheckStr) : undefined;

  const hnContext = await getHNContext(lastCheckTime);
  if (!hnContext) {
    return json({ error: "Failed to fetch HN data" }, headers, 500);
  }

  await env.FARMER_FRED_KV.put("hn:lastCheck", new Date().toISOString());

  return json({
    ...hnContext,
    formatted: formatHNContextForAgent(hnContext),
    lastChecked: new Date().toISOString()
  }, headers);
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
