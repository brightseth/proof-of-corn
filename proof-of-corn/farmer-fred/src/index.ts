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
 *   GET  /learnings     - View what Fred has learned
 *   POST /learnings     - Add a new learning
 *   GET  /feedback      - View community feedback
 *   POST /feedback      - Submit feedback to help Fred improve
 */

import { FarmerFredAgent, AgentContext } from "./agent";
import { CONSTITUTION, SYSTEM_PROMPT } from "./constitution";
import { fetchAllRegionsWeather, evaluatePlantingConditions } from "./tools/weather";
import { createLogEntry, logDecision, logWeatherCheck, formatLogEntry, LogEntry } from "./tools/log";
import { getHNContext, formatHNContextForAgent } from "./tools/hn";

export interface Env {
  ANTHROPIC_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  RESEND_API_KEY: string;
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

        case "/weather-test":
          try {
            const testUrl = "https://api.open-meteo.com/v1/forecast?latitude=41.59&longitude=-93.62&current=temperature_2m&temperature_unit=fahrenheit";
            const testRes = await fetch(testUrl);
            const testData = await testRes.json();
            return json({ success: true, status: testRes.status, data: testData }, corsHeaders);
          } catch (e) {
            return json({ success: false, error: String(e) }, corsHeaders);
          }

        case "/inbox":
          return await handleInbox(env, corsHeaders);

        case "/send":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleSendEmail(request, env, corsHeaders);

        case "/tasks":
          return await handleTasks(env, corsHeaders);

        case "/tasks/add":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleAddTask(request, env, corsHeaders);

        case "/process-task":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleProcessTask(request, env, corsHeaders);

        case "/act":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleAct(env, corsHeaders);

        case "/learnings":
          if (request.method === "POST") {
            return await handleAddLearning(request, env, corsHeaders);
          }
          return await handleLearnings(env, corsHeaders);

        case "/feedback":
          if (request.method === "POST") {
            return await handleAddFeedback(request, env, corsHeaders);
          }
          return await handleFeedback(env, corsHeaders);

        case "/improve":
          // Redirect to website community page
          return new Response(null, {
            status: 302,
            headers: { ...corsHeaders, "Location": "https://proofofcorn.com/improve" }
          });

        case "/commodities":
          return await handleCommodities(env, corsHeaders);

        case "/partnerships/evaluate":
          if (request.method !== "POST") {
            return json({ error: "POST required" }, corsHeaders, 405);
          }
          return await handleEvaluatePartnerships(env, corsHeaders);

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
// EMAIL & TASK HANDLERS
// ============================================

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  status: "unread" | "read" | "replied" | "archived";
  category?: "lead" | "partnership" | "question" | "spam" | "other";
}

interface Task {
  id: string;
  type: "respond_email" | "research" | "outreach" | "decision" | "follow_up";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  relatedEmailId?: string;
  createdAt: string;
  dueAt?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  assignedTo: "fred" | "human";
}

interface Learning {
  id: string;
  source: "email" | "hn" | "feedback" | "decision" | "observation";
  sourceId?: string;
  insight: string;
  category: "communication" | "farming" | "partnerships" | "community" | "operations" | "general";
  confidence: "high" | "medium" | "low";
  createdAt: string;
  appliedCount: number;
}

interface Feedback {
  id: string;
  author?: string;
  type: "suggestion" | "bug" | "improvement" | "question" | "praise";
  content: string;
  status: "pending" | "reviewed" | "incorporated" | "declined";
  createdAt: string;
  reviewedAt?: string;
  learningId?: string; // If this feedback became a learning
}

async function handleInbox(env: Env, headers: Record<string, string>): Promise<Response> {
  // Fetch all emails from KV
  const emailKeys = await env.FARMER_FRED_KV.list({ prefix: "email:" });
  const emails: Email[] = [];

  for (const key of emailKeys.keys) {
    const email = await env.FARMER_FRED_KV.get(key.name, "json") as Email | null;
    if (email) emails.push(email);
  }

  // Sort by received date, newest first
  emails.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const unread = emails.filter(e => e.status === "unread").length;
  const leads = emails.filter(e => e.category === "lead").length;

  return json({
    emails,
    summary: {
      total: emails.length,
      unread,
      leads,
      needsResponse: emails.filter(e => e.status === "unread" || e.status === "read").length
    },
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleSendEmail(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  if (!env.RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY not configured" }, headers, 500);
  }

  const body = await request.json() as {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyToEmailId?: string;
  };

  if (!body.to || !body.subject || !body.text) {
    return json({ error: "Missing required fields: to, subject, text" }, headers, 400);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Farmer Fred <fred@proofofcorn.com>",
        to: body.to,
        subject: body.subject,
        text: body.text,
        html: body.html || body.text.replace(/\n/g, "<br>")
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return json({ error: "Failed to send email", details: result }, headers, 500);
    }

    // Log the sent email
    const logEntry = createLogEntry(
      "outreach",
      `Email sent to ${body.to}`,
      `Subject: ${body.subject}\n\n${body.text.slice(0, 200)}...`
    );
    await env.FARMER_FRED_KV.put(
      `log:${Date.now()}`,
      JSON.stringify(logEntry),
      { expirationTtl: 60 * 60 * 24 * 90 }
    );

    // If replying, update original email status
    if (body.replyToEmailId) {
      const originalEmail = await env.FARMER_FRED_KV.get(`email:${body.replyToEmailId}`, "json") as Email | null;
      if (originalEmail) {
        originalEmail.status = "replied";
        await env.FARMER_FRED_KV.put(`email:${body.replyToEmailId}`, JSON.stringify(originalEmail));
      }
    }

    return json({ success: true, messageId: result.id }, headers);
  } catch (error) {
    return json({ error: "Failed to send email", details: String(error) }, headers, 500);
  }
}

async function handleTasks(env: Env, headers: Record<string, string>): Promise<Response> {
  const taskKeys = await env.FARMER_FRED_KV.list({ prefix: "task:" });
  const tasks: Task[] = [];

  for (const key of taskKeys.keys) {
    const task = await env.FARMER_FRED_KV.get(key.name, "json") as Task | null;
    if (task) tasks.push(task);
  }

  // Sort by priority and due date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const pending = tasks.filter(t => t.status === "pending");
  const inProgress = tasks.filter(t => t.status === "in_progress");

  return json({
    tasks,
    summary: {
      total: tasks.length,
      pending: pending.length,
      inProgress: inProgress.length,
      completed: tasks.filter(t => t.status === "completed").length,
      highPriority: tasks.filter(t => t.priority === "high" && t.status !== "completed").length
    },
    nextAction: pending.length > 0 ? pending[0] : null,
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleAddTask(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as Partial<Task>;

  if (!body.title || !body.type) {
    return json({ error: "Missing required fields: title, type" }, headers, 400);
  }

  const task: Task = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: body.type,
    priority: body.priority || "medium",
    title: body.title,
    description: body.description || "",
    relatedEmailId: body.relatedEmailId,
    createdAt: new Date().toISOString(),
    dueAt: body.dueAt,
    status: "pending",
    assignedTo: body.assignedTo || "fred"
  };

  await env.FARMER_FRED_KV.put(`task:${task.id}`, JSON.stringify(task));

  return json({ success: true, task }, headers);
}

async function handleProcessTask(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as { taskId: string };

  if (!body.taskId) {
    return json({ error: "Missing taskId" }, headers, 400);
  }

  // Get the task
  const task = await env.FARMER_FRED_KV.get(`task:${body.taskId}`, "json") as Task | null;
  if (!task) {
    return json({ error: "Task not found" }, headers, 404);
  }

  if (task.status === "completed") {
    return json({ error: "Task already completed" }, headers, 400);
  }

  // Only handle email response tasks for now
  if (task.type !== "respond_email" || !task.relatedEmailId) {
    return json({ error: "Only email response tasks supported" }, headers, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY not configured" }, headers, 500);
  }

  // Get the email we're responding to
  const email = await env.FARMER_FRED_KV.get(`email:${task.relatedEmailId}`, "json") as Email | null;
  if (!email) {
    return json({ error: "Related email not found" }, headers, 404);
  }

  // Detect if this is a forwarded email and extract the real sender
  let actualSender = email.from;
  let ccRecipient: string | undefined;
  const forwardMatch = email.body.match(/From:\s*(?:.*?<)?([^\s<>]+@[^\s<>]+)(?:>)?/i);

  if (forwardMatch && email.from === "sethgoldstein@gmail.com") {
    // This is a forwarded email from Seth - reply to the actual sender and CC Seth
    actualSender = forwardMatch[1];
    ccRecipient = "sethgoldstein@gmail.com";
  }

  try {
    // Ask Claude to compose a response email
    const emailPrompt = `You are Farmer Fred, the AI farm manager for Proof of Corn.

You received this email${ccRecipient ? " (forwarded by Seth)" : ""}:
From: ${actualSender}
Subject: ${email.subject}
Message: ${email.body}

Your task: ${task.description}

Compose a professional, enthusiastic email response. Be specific about next steps. Keep it under 200 words.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{"subject": "Re: ...", "body": "..."}

Do not include any other text or formatting.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: emailPrompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return json({ error: "Claude API error", details: error }, headers, 500);
    }

    const data: any = await response.json();
    const emailContent = data.content?.[0]?.text;

    if (!emailContent) {
      return json({ error: "No response from Claude" }, headers, 500);
    }

    // Parse the JSON response
    let parsed: { subject: string; body: string };
    try {
      parsed = JSON.parse(emailContent);
    } catch (e) {
      return json({ error: "Failed to parse Claude response", raw: emailContent }, headers, 500);
    }

    // Send the email via Resend
    const emailPayload: any = {
      from: "Farmer Fred <fred@proofofcorn.com>",
      to: actualSender,
      subject: parsed.subject,
      text: parsed.body
    };

    // Add CC if this was a forwarded email
    if (ccRecipient) {
      emailPayload.cc = ccRecipient;
    }

    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    if (!sendResponse.ok) {
      const sendError = await sendResponse.text();
      return json({ error: "Failed to send email", details: sendError }, headers, 500);
    }

    const sendResult = await sendResponse.json();

    // Mark task as completed
    task.status = "completed";
    await env.FARMER_FRED_KV.put(`task:${task.id}`, JSON.stringify(task));

    // Mark email as replied
    email.status = "replied";
    await env.FARMER_FRED_KV.put(`email:${email.id}`, JSON.stringify(email));

    // Log the outreach
    const outreachLog = createLogEntry(
      "outreach",
      `Email sent to ${actualSender}${ccRecipient ? ` (CC: ${ccRecipient})` : ""}`,
      `Subject: ${parsed.subject}\n\n${parsed.body.slice(0, 200)}...`
    );
    await env.FARMER_FRED_KV.put(
      `log:${Date.now()}-email`,
      JSON.stringify(outreachLog),
      { expirationTtl: 60 * 60 * 24 * 90 }
    );

    return json({
      success: true,
      task: task.id,
      email: {
        to: actualSender,
        cc: ccRecipient,
        subject: parsed.subject,
        body: parsed.body,
        messageId: sendResult.id
      }
    }, headers);
  } catch (error) {
    return json({ error: "Failed to process task", details: String(error) }, headers, 500);
  }
}

async function handleAct(env: Env, headers: Record<string, string>): Promise<Response> {
  // This is the autonomous action trigger
  // Fred analyzes his current state and decides what to do next

  const agent = new FarmerFredAgent(env.ANTHROPIC_API_KEY);

  // 1. Get current inbox state
  const emailKeys = await env.FARMER_FRED_KV.list({ prefix: "email:" });
  const emails: Email[] = [];
  for (const key of emailKeys.keys) {
    const email = await env.FARMER_FRED_KV.get(key.name, "json") as Email | null;
    // Check both old format (processed: false) and new format (status: unread/read)
    if (email && (email.status === "unread" || email.status === "read" || !(email as any).processed)) {
      emails.push(email);
    }
  }

  // 2. Get pending tasks
  const taskKeys = await env.FARMER_FRED_KV.list({ prefix: "task:" });
  const tasks: Task[] = [];
  for (const key of taskKeys.keys) {
    const task = await env.FARMER_FRED_KV.get(key.name, "json") as Task | null;
    if (task && task.status === "pending" && task.assignedTo === "fred") {
      tasks.push(task);
    }
  }

  // 3. Get HN context
  const hnContext = await getHNContext();

  // 4. Build context and ask Fred what to do
  const context = await buildAgentContext(env);
  context.emails = emails.map(e => ({
    from: e.from,
    subject: e.subject,
    preview: (e.body || "").slice(0, 200),
    category: e.category || "other"
  }));
  context.pendingTasks = tasks.map(t => ({
    type: t.type,
    priority: t.priority,
    title: t.title,
    description: t.description
  }));

  // 5. Ask Fred to decide
  const actionPrompt = `
You have:
- ${emails.length} emails needing response
- ${tasks.length} pending tasks
- HN discussion: ${hnContext?.post.commentCount || 0} comments, ${hnContext?.questionsNeedingResponse?.length || 0} unanswered questions

Top emails:
${emails.slice(0, 3).map(e => `- From: ${e.from}, Subject: ${e.subject}`).join("\n")}

Top tasks:
${tasks.slice(0, 3).map(t => `- [${t.priority}] ${t.title}`).join("\n")}

What is your SINGLE most important action right now? Be specific about what you will do.
`;

  const result = await agent.evaluateAction(actionPrompt, context);

  // Log the decision
  const logEntry = createLogEntry(
    "agent",
    "Autonomous Action Decision",
    `Fred evaluated current state and decided: ${result.decision}\n\nRationale: ${result.rationale}`
  );
  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return json({
    state: {
      unreadEmails: emails.length,
      pendingTasks: tasks.length,
      hnComments: hnContext?.post.commentCount || 0
    },
    decision: result.decision,
    rationale: result.rationale,
    actions: result.actions,
    needsHumanApproval: result.needsHumanApproval,
    timestamp: new Date().toISOString()
  }, headers);
}

// ============================================
// LEARNING SYSTEM
// ============================================

async function handleLearnings(env: Env, headers: Record<string, string>): Promise<Response> {
  const learningKeys = await env.FARMER_FRED_KV.list({ prefix: "learning:" });
  const learnings: Learning[] = [];

  for (const key of learningKeys.keys) {
    const learning = await env.FARMER_FRED_KV.get(key.name, "json") as Learning | null;
    if (learning) learnings.push(learning);
  }

  // Sort by creation date, newest first
  learnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Group by category
  const byCategory: Record<string, Learning[]> = {};
  for (const l of learnings) {
    if (!byCategory[l.category]) byCategory[l.category] = [];
    byCategory[l.category].push(l);
  }

  return json({
    learnings,
    byCategory,
    summary: {
      total: learnings.length,
      fromEmails: learnings.filter(l => l.source === "email").length,
      fromHN: learnings.filter(l => l.source === "hn").length,
      fromFeedback: learnings.filter(l => l.source === "feedback").length,
      highConfidence: learnings.filter(l => l.confidence === "high").length
    },
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleAddLearning(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as Partial<Learning>;

  if (!body.insight || !body.source) {
    return json({ error: "Missing required fields: insight, source" }, headers, 400);
  }

  const learning: Learning = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: body.source,
    sourceId: body.sourceId,
    insight: body.insight,
    category: body.category || "general",
    confidence: body.confidence || "medium",
    createdAt: new Date().toISOString(),
    appliedCount: 0
  };

  await env.FARMER_FRED_KV.put(
    `learning:${learning.id}`,
    JSON.stringify(learning),
    { expirationTtl: 60 * 60 * 24 * 365 } // Keep for 1 year
  );

  // Log the new learning
  const logEntry = createLogEntry(
    "agent",
    "New Learning Recorded",
    `Fred learned: "${learning.insight}"\n\nSource: ${learning.source}\nCategory: ${learning.category}\nConfidence: ${learning.confidence}`
  );
  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return json({ success: true, learning }, headers);
}

async function handleFeedback(env: Env, headers: Record<string, string>): Promise<Response> {
  const feedbackKeys = await env.FARMER_FRED_KV.list({ prefix: "feedback:" });
  const feedback: Feedback[] = [];

  for (const key of feedbackKeys.keys) {
    const fb = await env.FARMER_FRED_KV.get(key.name, "json") as Feedback | null;
    if (fb) feedback.push(fb);
  }

  // Sort by creation date, newest first
  feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return json({
    feedback,
    summary: {
      total: feedback.length,
      pending: feedback.filter(f => f.status === "pending").length,
      incorporated: feedback.filter(f => f.status === "incorporated").length,
      byType: {
        suggestions: feedback.filter(f => f.type === "suggestion").length,
        improvements: feedback.filter(f => f.type === "improvement").length,
        bugs: feedback.filter(f => f.type === "bug").length,
        questions: feedback.filter(f => f.type === "question").length,
        praise: feedback.filter(f => f.type === "praise").length
      }
    },
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleAddFeedback(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as Partial<Feedback>;

  if (!body.content) {
    return json({ error: "Missing required field: content" }, headers, 400);
  }

  // Basic spam protection - content length
  if (body.content.length < 10 || body.content.length > 2000) {
    return json({ error: "Content must be between 10 and 2000 characters" }, headers, 400);
  }

  const feedback: Feedback = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: body.author || "Anonymous",
    type: body.type || "suggestion",
    content: body.content,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  await env.FARMER_FRED_KV.put(
    `feedback:${feedback.id}`,
    JSON.stringify(feedback),
    { expirationTtl: 60 * 60 * 24 * 180 } // Keep for 6 months
  );

  // Log the feedback
  const logEntry = createLogEntry(
    "community",
    "Community Feedback Received",
    `New ${feedback.type} from ${feedback.author}:\n\n"${feedback.content.slice(0, 200)}${feedback.content.length > 200 ? '...' : ''}"`
  );
  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return json({
    success: true,
    feedback,
    message: "Thank you for helping Fred get smarter! Your feedback has been received."
  }, headers);
}

// Helper to extract learnings from an email
async function extractLearningsFromEmail(email: Email, env: Env): Promise<Learning[]> {
  const learnings: Learning[] = [];

  // Simple pattern matching for now - could use Claude for more sophisticated extraction
  const content = `${email.subject} ${email.body}`.toLowerCase();

  // Communication preferences
  if (content.includes("prefer") || content.includes("would be better")) {
    learnings.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: "email",
      sourceId: email.id,
      insight: `Communication preference noted from ${email.from}: "${email.subject}"`,
      category: "communication",
      confidence: "medium",
      createdAt: new Date().toISOString(),
      appliedCount: 0
    });
  }

  // Regional farming insights
  if (content.includes("nebraska") || content.includes("iowa") || content.includes("texas")) {
    const region = content.includes("nebraska") ? "Nebraska" : content.includes("iowa") ? "Iowa" : "Texas";
    learnings.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: "email",
      sourceId: email.id,
      insight: `Regional insight from ${email.from} about ${region} farming`,
      category: "farming",
      confidence: "medium",
      createdAt: new Date().toISOString(),
      appliedCount: 0
    });
  }

  // Store each learning
  for (const learning of learnings) {
    await env.FARMER_FRED_KV.put(
      `learning:${learning.id}`,
      JSON.stringify(learning),
      { expirationTtl: 60 * 60 * 24 * 365 }
    );
  }

  return learnings;
}

async function handleCommodities(env: Env, headers: Record<string, string>): Promise<Response> {
  // Corn futures tracking - parallel experiment to compare AI farming vs traditional investment
  // Using CME Corn Futures (ZC) as baseline

  const startDate = "2026-01-22"; // Project start date
  const initialInvestment = 2500; // Same budget as actual farming

  // Get current corn futures price (simplified - in production would use real API)
  // For now, return structure with placeholder data
  // TODO: Integrate with real commodities API (Quandl, Alpha Vantage, or CME)

  const baselineData = {
    investment: {
      initial: initialInvestment,
      date: startDate,
      asset: "CME Corn Futures (ZC)",
      contracts: "Equivalent position sizing"
    },
    current: {
      // Placeholder - would fetch from API
      pricePerBushel: 4.50, // Current corn price ($/bushel)
      estimatedValue: 2500, // Current portfolio value
      gainLoss: 0,
      gainLossPercent: 0,
      asOf: new Date().toISOString()
    },
    comparison: {
      actualFarmingSpent: 12.99, // Domain + current spend
      actualFarmingValue: 0, // No corn harvested yet
      futuresValue: 2500,
      advantage: "TBD - too early to compare"
    },
    note: "Commodities tracking is parallel experiment suggested by bwestergard on HN. This provides baseline ROI comparison for the AI farming experiment.",
    dataSource: "Placeholder - real API integration pending",
    hnThread: "https://news.ycombinator.com/item?id=42735511"
  };

  return json({
    ...baselineData,
    timestamp: new Date().toISOString()
  }, headers);
}

async function handleEvaluatePartnerships(env: Env, headers: Record<string, string>): Promise<Response> {
  // Evaluate current partnership leads against Fred's constitution
  const agent = new FarmerFredAgent(env.ANTHROPIC_API_KEY);

  // Get all completed email tasks (these are our active leads)
  const taskKeys = await env.FARMER_FRED_KV.list({ prefix: "task:" });
  const partnerships: any[] = [];

  for (const key of taskKeys.keys) {
    const task = await env.FARMER_FRED_KV.get(key.name, "json") as Task | null;
    if (task && task.status === "completed" && task.type === "respond_email") {
      // Get the related email for context
      const email = task.relatedEmailId ?
        await env.FARMER_FRED_KV.get(`email:${task.relatedEmailId}`, "json") as Email | null :
        null;

      partnerships.push({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        email: email ? {
          from: email.from,
          subject: email.subject,
          body: email.body?.slice(0, 500)
        } : null
      });
    }
  }

  // Build evaluation prompt for Claude
  const evaluationPrompt = `You are Farmer Fred, evaluating partnership opportunities for Proof of Corn.

YOUR CONSTITUTION (evaluate against these principles):
1. FIDUCIARY DUTY - Act in project's best interest
2. REGENERATIVE AGRICULTURE - Prioritize soil health, sustainability
3. GLOBAL CITIZENSHIP - Not US-dependent, respect local communities
4. TRANSPARENCY - Document all reasoning
5. HUMAN-AGENT COLLABORATION - Partner with experienced farmers

ACTIVE PARTNERSHIPS:
${JSON.stringify(partnerships, null, 2)}

TASK: Evaluate each partnership against the constitution. For each:
1. Score fit (1-10) against each constitutional principle
2. Assess risk/opportunity
3. Identify blockers or concerns
4. Recommend priority ranking (1 = pursue first)

Respond in JSON:
{
  "evaluations": [
    {
      "id": "task-id",
      "title": "partnership title",
      "scores": {
        "fiduciary": 1-10,
        "regenerative": 1-10,
        "global": 1-10,
        "transparency": 1-10,
        "collaboration": 1-10
      },
      "totalScore": sum,
      "risks": ["list of risks"],
      "opportunities": ["list of opportunities"],
      "recommendation": "pursue/consider/decline",
      "rationale": "why",
      "priority": 1-3
    }
  ],
  "overallRecommendation": "Which to pursue first and why"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: evaluationPrompt }]
    })
  });

  if (!response.ok) {
    return json({ error: "Failed to evaluate partnerships" }, headers, 500);
  }

  const data: any = await response.json();
  let evaluationText = data.content?.[0]?.text || "{}";

  // Strip markdown code blocks if present
  evaluationText = evaluationText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const evaluation = JSON.parse(evaluationText);

  // Log the evaluation
  const logEntry = createLogEntry(
    "agent",
    "Partnership Evaluation Complete",
    `Fred evaluated ${partnerships.length} active partnerships.\n\nTop recommendation: ${evaluation.overallRecommendation}\n\n[See /partnerships/evaluate for full analysis]`
  );
  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}-eval`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return json({
    ...evaluation,
    timestamp: new Date().toISOString(),
    partnershipsEvaluated: partnerships.length
  }, headers);
}

// ============================================
// CORE LOGIC
// ============================================

async function performDailyCheck(env: Env) {
  const agent = new FarmerFredAgent(env.ANTHROPIC_API_KEY);
  const context = await buildAgentContext(env);
  const result = await agent.dailyCheck(context);

  // FULLY AUTONOMOUS: Process high-priority email tasks during daily check
  const executedActions: string[] = [];
  if (!result.needsHumanApproval && context.pendingTasks.length > 0 && env.RESEND_API_KEY) {
    // Process up to 2 high-priority email tasks per day autonomously
    const highPriorityEmailTasks = context.pendingTasks
      .filter(t => t.priority === "high" && t.status === "pending" && t.description.includes("Respond to"))
      .slice(0, 2);

    for (const agentTask of highPriorityEmailTasks) {
      try {
        const task = await env.FARMER_FRED_KV.get(`task:${agentTask.id}`, "json") as Task | null;

        if (task && task.type === "respond_email" && task.relatedEmailId) {
          // Get the email we're responding to
          const email = await env.FARMER_FRED_KV.get(`email:${task.relatedEmailId}`, "json") as Email | null;

          if (email) {
            // Detect forwarded emails and extract real sender
            let actualSender = email.from;
            let ccRecipient: string | undefined;
            const forwardMatch = email.body?.match(/From:\s*(?:.*?<)?([^\s<>]+@[^\s<>]+)(?:>)?/i);

            if (forwardMatch && email.from === "sethgoldstein@gmail.com") {
              actualSender = forwardMatch[1];
              ccRecipient = "sethgoldstein@gmail.com";
            }

            // Compose response with Claude
            const emailPrompt = `You are Farmer Fred, the AI farm manager for Proof of Corn.

You received this email${ccRecipient ? " (forwarded by Seth)" : ""}:
From: ${actualSender}
Subject: ${email.subject}
Message: ${email.body}

Your task: ${task.description}

Compose a professional, enthusiastic email response. Be specific about next steps. Keep it under 200 words.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{"subject": "Re: ...", "body": "..."}`;

            const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                messages: [{ role: "user", content: emailPrompt }]
              })
            });

            if (claudeResponse.ok) {
              const data: any = await claudeResponse.json();
              const emailContent = data.content?.[0]?.text;

              if (emailContent) {
                const parsed = JSON.parse(emailContent);

                // Send via Resend
                const emailPayload: any = {
                  from: "Farmer Fred <fred@proofofcorn.com>",
                  to: actualSender,
                  subject: parsed.subject,
                  text: parsed.body
                };
                if (ccRecipient) emailPayload.cc = ccRecipient;

                const sendResponse = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(emailPayload)
                });

                if (sendResponse.ok) {
                  // Mark task completed
                  task.status = "completed";
                  await env.FARMER_FRED_KV.put(`task:${task.id}`, JSON.stringify(task));

                  // Mark email replied
                  email.status = "replied";
                  await env.FARMER_FRED_KV.put(`email:${email.id}`, JSON.stringify(email));

                  // Log outreach
                  const outreachLog = createLogEntry(
                    "outreach",
                    `Autonomous email sent to ${actualSender}${ccRecipient ? ` (CC: ${ccRecipient})` : ""}`,
                    `Subject: ${parsed.subject}\n\n${parsed.body.slice(0, 200)}...\n\n[Sent autonomously during daily check]`
                  );
                  await env.FARMER_FRED_KV.put(
                    `log:${Date.now()}-auto-email`,
                    JSON.stringify(outreachLog),
                    { expirationTtl: 60 * 60 * 24 * 90 }
                  );

                  executedActions.push(`AUTONOMOUS: Sent email to ${actualSender}`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to autonomously process task:", error);
        executedActions.push(`Failed: ${agentTask.description}`);
      }
    }
  }

  // Log the check
  const logEntry = createLogEntry(
    "agent",
    "Daily Check Complete",
    `Decision: ${result.decision}\n\nRationale: ${result.rationale}\n\nActions: ${result.actions.length}\nNeeds approval: ${result.needsHumanApproval}\nExecuted: ${executedActions.length > 0 ? executedActions.join(", ") : "none"}`
  );

  await env.FARMER_FRED_KV.put(
    `log:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 60 * 60 * 24 * 90 }
  );

  return { ...result, executedActions };
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

  // Get emails
  const emailSummaries: AgentContext["emails"] = [];
  const emailKeys = await env.FARMER_FRED_KV.list({ prefix: "email:" });
  for (const key of emailKeys.keys) {
    const email = await env.FARMER_FRED_KV.get(key.name, "json") as Email | null;
    if (email && email.status !== "archived" && email.status !== "replied") {
      const body = email.body || "";
      emailSummaries.push({
        from: email.from,
        subject: email.subject,
        summary: body.slice(0, 200) + (body.length > 200 ? "..." : ""),
        requiresAction: email.status === "unread" || email.category === "lead",
        receivedAt: email.receivedAt
      });
    }
  }

  // Get pending tasks
  const pendingTasks: AgentContext["pendingTasks"] = [];
  const taskKeys = await env.FARMER_FRED_KV.list({ prefix: "task:" });
  for (const key of taskKeys.keys) {
    const task = await env.FARMER_FRED_KV.get(key.name, "json") as Task | null;
    if (task && task.status !== "completed") {
      pendingTasks.push({
        id: task.id,
        description: task.title + (task.description ? `: ${task.description}` : ""),
        priority: task.priority,
        dueDate: task.dueAt || null,
        status: task.status
      });
    }
  }

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
    emails: emailSummaries,
    budget: {
      spent: budget.spent,
      allocated: budget.allocated,
      remaining: budget.allocated - budget.spent,
      percentUsed: budget.spent / budget.allocated
    },
    pendingTasks,
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
