/**
 * FARMER FRED AGENT
 *
 * Core agent logic using Claude API for decision-making.
 */

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, CONSTITUTION, evaluateDecision } from "./constitution";

export interface AgentContext {
  weather: WeatherData | null;
  emails: EmailSummary[];
  budget: BudgetStatus;
  pendingTasks: Task[];
  recentDecisions: Decision[];
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

/**
 * Main agent class
 */
export class FarmerFredAgent {
  private client: Anthropic;
  private model = "claude-sonnet-4-20250514";

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Daily check routine - the heart of Farmer Fred
   */
  async dailyCheck(context: AgentContext): Promise<AgentResponse> {
    const prompt = this.buildDailyCheckPrompt(context);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return this.parseAgentResponse(content.text);
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

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return this.parseAgentResponse(content.text);
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

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return content.text;
  }

  /**
   * Build the daily check prompt
   */
  private buildDailyCheckPrompt(context: AgentContext): string {
    const today = new Date().toISOString().split("T")[0];

    return `
## Daily Check - ${today}

You are performing your daily check routine. Review the current state and decide what actions to take.

${this.formatContext(context)}

## Your Task
1. Analyze the current state across all regions
2. Identify any actions needed today
3. For each action, determine if you can act autonomously or need approval
4. Provide your decisions with clear rationale

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

    // Weather
    if (context.weather) {
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
