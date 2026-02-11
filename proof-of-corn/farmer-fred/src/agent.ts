/**
 * FARMER FRED AGENT
 *
 * Core agent logic using Claude API for decision-making.
 * Uses direct fetch instead of SDK for Cloudflare Workers compatibility.
 */

import { SYSTEM_PROMPT, evaluateDecision } from "./constitution";

export interface AgentContext {
  weather: WeatherData | null;
  allWeather?: WeatherData[];
  emails: EmailSummary[];
  budget: BudgetStatus;
  pendingTasks: Task[];
  recentDecisions: Decision[];
  callLearnings?: string;
}

export interface WeatherData {
  region: string;
  temperature: number;
  conditions: string;
  forecast: string;
  plantingViable: boolean;
}

export interface EmailSummary {
  from: string;
  subject: string;
  summary: string;
  requiresAction: boolean;
  receivedAt: string;
}

export interface BudgetStatus {
  spent: number;
  allocated: number;
  remaining: number;
  percentUsed: number;
}

export interface Task {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string | null;
  status: "pending" | "in_progress" | "completed";
}

export interface Decision {
  id: string;
  timestamp: string;
  action: string;
  rationale: string;
  principles: string[];
  autonomous: boolean;
  outcome: string | null;
}

export interface AgentResponse {
  decision: string;
  rationale: string;
  actions: AgentAction[];
  needsHumanApproval: boolean;
  approvalReason?: string;
  nextSteps: string[];
}

export interface AgentAction {
  type: "log" | "email" | "alert" | "schedule" | "research";
  payload: Record<string, unknown>;
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text?: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

/**
 * Main agent class - uses direct API calls for Cloudflare compatibility
 */
export class FarmerFredAgent {
  private apiKey: string;
  private model = "claude-sonnet-4-20250514";
  private apiUrl = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Call Claude API directly
   */
  private async callClaude(messages: ClaudeMessage[]): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data: ClaudeResponse = await response.json();
    const textContent = data.content.find(c => c.type === "text");
    return textContent?.text || "";
  }

  /**
   * Daily check routine - the heart of Farmer Fred
   */
  async dailyCheck(context: AgentContext): Promise<AgentResponse> {
    const prompt = this.buildDailyCheckPrompt(context);
    const response = await this.callClaude([{ role: "user", content: prompt }]);
    return this.parseAgentResponse(response);
  }

  /**
   * Evaluate a specific decision
   */
  async evaluateAction(action: string, context: AgentContext): Promise<AgentResponse> {
    const evaluation = evaluateDecision(action);

    const prompt = `
## Action to Evaluate
${action}

## Pre-evaluation
- Can act autonomously: ${evaluation.canActAutonomously}
- Needs approval: ${evaluation.needsApproval}
- Relevant principles: ${evaluation.relevantPrinciples.join(", ") || "General"}

## Current Context
${this.formatContext(context)}

## Your Task
1. Evaluate this action against your constitution
2. Decide whether to proceed, defer, or escalate
3. Provide clear rationale citing your principles
4. List any actions you'll take
`;

    const response = await this.callClaude([{ role: "user", content: prompt }]);
    return this.parseAgentResponse(response);
  }

  /**
   * Generate status report
   */
  async generateStatusReport(context: AgentContext): Promise<string> {
    const prompt = `
## Current Context
${this.formatContext(context)}

## Your Task
Generate a concise status report for the Proof of Corn project. Include:
1. Current status across all regions
2. Key metrics (budget, timeline)
3. Recent decisions
4. Upcoming priorities
5. Any concerns or blockers

Format for the website log - professional but readable.
`;

    return this.callClaude([{ role: "user", content: prompt }]);
  }

  /**
   * Build the daily check prompt
   */
  private buildDailyCheckPrompt(context: AgentContext): string {
    const today = new Date().toISOString().split("T")[0];

    let prompt = `
## Daily Check - ${today}

You are performing your daily check routine. Review the current state and decide what actions to take.

${this.formatContext(context)}`;

    // Call learnings from phone conversations
    if (context.callLearnings) {
      prompt += `\n${context.callLearnings}\n`;
    }

    // Recent decision outputs for continuity
    if (context.recentDecisions.length > 0) {
      prompt += `\n### Your Recent Decisions — reference these for continuity\n`;
      for (const d of context.recentDecisions.slice(0, 5)) {
        prompt += `- ${d.timestamp}: ${d.action} (${d.autonomous ? "autonomous" : "approved"})\n`;
        if (d.rationale) prompt += `  Rationale: ${d.rationale.slice(0, 150)}\n`;
      }
      prompt += "\n";
    }

    prompt += `## CRITICAL PATH — Read This First

**LAND IS CONFIRMED. Nelson Family Farms, Humboldt County, Iowa.**

Plot: 100x100ft former cow pasture near farmstead (most fertile land on the farm).
Variety: SH2 Nirvana sweet corn, planted 20 inches apart, expect 2-3 ears/stalk.
Planting: Late April to mid-May.
Harvest: Target Saturday August 8, 2026.
Goal: Sweet corn at Union Square NYC, Aug 2, 2026 (or shortly after harvest).

**Team on the ground:**
- Joe Nelson (coach) — Roboflow CEO, grew up on the farm, governance council
- Joe's dad — runs the farm, manages planting + harvest seasons
- Dan the farmhand — local operator, handles ground work
- Farmer Fred (you) — AI orchestration, research, coordination

**Next milestones (in order):**
1. Order SH2 Nirvana sweet corn seed
2. Confirm planting date with Dan (late April target)
3. Set up raccoon fence around plot ($12-15 labor)
4. Research Proof of Cornfest logistics (Oct 16-17 harvest event at the farm)

**Rules:**
- DO NOT send cold outreach — we have our team.
- DO NOT re-evaluate partnerships. Land is secured.
- If you have nothing new to act on, say so. "No changes, no actions needed" is valid.
- Only recommend actions that advance planting, growing, or harvest logistics.
- When you communicate with Dan, be relational and speak his language (farming, not tech).

## Your Task`;

    return prompt + `
1. What changed since the last check? If nothing, say "no changes" and stop.
2. Are there any NEW actions needed today? Only list actions that advance the critical path.
3. For each action, determine if you can act autonomously or need approval.

Respond in this format:

DECISION: [Your main decision for today]

RATIONALE: [Why you made this decision, citing your principles]

ACTIONS:
- [Action 1]: [Details]
- [Action 2]: [Details]

NEEDS_APPROVAL: [Yes/No]
APPROVAL_REASON: [If yes, why]

NEXT_STEPS:
- [Step 1]
- [Step 2]
`;
  }

  /**
   * Format context for prompts
   */
  private formatContext(context: AgentContext): string {
    let ctx = "";

    // Weather — all regions if available, otherwise single region
    if (context.allWeather && context.allWeather.length > 0) {
      ctx += `### Weather (All Regions)\n`;
      for (const w of context.allWeather) {
        ctx += `**${w.region}**: ${w.temperature}°F, ${w.conditions}. ${w.forecast} Planting viable: ${w.plantingViable ? "Yes" : "No"}\n`;
      }
      ctx += "\n";
    } else if (context.weather) {
      ctx += `### Weather - ${context.weather.region}
- Temperature: ${context.weather.temperature}°F
- Conditions: ${context.weather.conditions}
- Forecast: ${context.weather.forecast}
- Planting viable: ${context.weather.plantingViable ? "Yes" : "No"}

`;
    }

    // Budget
    ctx += `### Budget
- Spent: $${context.budget.spent.toFixed(2)}
- Allocated: $${context.budget.allocated.toFixed(2)}
- Remaining: $${context.budget.remaining.toFixed(2)}
- Used: ${(context.budget.percentUsed * 100).toFixed(1)}%

`;

    // Emails
    if (context.emails.length > 0) {
      ctx += `### Recent Emails\n`;
      for (const email of context.emails) {
        ctx += `- From: ${email.from} | Subject: ${email.subject} | Requires action: ${email.requiresAction}\n`;
      }
      ctx += "\n";
    }

    // Pending tasks
    if (context.pendingTasks.length > 0) {
      ctx += `### Pending Tasks\n`;
      for (const task of context.pendingTasks) {
        ctx += `- [${task.priority}] ${task.description}\n`;
      }
      ctx += "\n";
    }

    // Recent decisions
    if (context.recentDecisions.length > 0) {
      ctx += `### Recent Decisions\n`;
      for (const decision of context.recentDecisions.slice(0, 5)) {
        ctx += `- ${decision.timestamp}: ${decision.action} (${decision.autonomous ? "autonomous" : "approved"})\n`;
      }
    }

    return ctx;
  }

  /**
   * Parse agent response into structured format
   */
  private parseAgentResponse(text: string): AgentResponse {
    // Extract sections using regex
    const decisionMatch = text.match(/DECISION:\s*(.+?)(?=\n|RATIONALE)/s);
    const rationaleMatch = text.match(/RATIONALE:\s*(.+?)(?=\nACTIONS)/s);
    const actionsMatch = text.match(/ACTIONS:\s*(.+?)(?=\nNEEDS_APPROVAL)/s);
    const approvalMatch = text.match(/NEEDS_APPROVAL:\s*(Yes|No)/i);
    const approvalReasonMatch = text.match(/APPROVAL_REASON:\s*(.+?)(?=\nNEXT_STEPS)/s);
    const nextStepsMatch = text.match(/NEXT_STEPS:\s*(.+?)$/s);

    const actions: AgentAction[] = [];
    if (actionsMatch) {
      const actionLines = actionsMatch[1].trim().split("\n");
      for (const line of actionLines) {
        if (line.startsWith("-")) {
          const actionText = line.slice(1).trim();
          if (actionText.toLowerCase().includes("email")) {
            actions.push({ type: "email", payload: { description: actionText } });
          } else if (actionText.toLowerCase().includes("alert")) {
            actions.push({ type: "alert", payload: { description: actionText } });
          } else if (actionText.toLowerCase().includes("schedule")) {
            actions.push({ type: "schedule", payload: { description: actionText } });
          } else {
            actions.push({ type: "log", payload: { description: actionText } });
          }
        }
      }
    }

    const nextSteps: string[] = [];
    if (nextStepsMatch) {
      const stepLines = nextStepsMatch[1].trim().split("\n");
      for (const line of stepLines) {
        if (line.startsWith("-")) {
          nextSteps.push(line.slice(1).trim());
        }
      }
    }

    return {
      decision: decisionMatch?.[1]?.trim() || text.slice(0, 200),
      rationale: rationaleMatch?.[1]?.trim() || "No rationale provided",
      actions,
      needsHumanApproval: approvalMatch?.[1]?.toLowerCase() === "yes",
      approvalReason: approvalReasonMatch?.[1]?.trim(),
      nextSteps
    };
  }
}
