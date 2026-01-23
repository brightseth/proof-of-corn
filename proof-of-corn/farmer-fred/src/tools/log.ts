/**
 * LOG TOOL
 *
 * Logs decisions and events to the Proof of Corn website.
 */

export interface LogEntry {
  timestamp: string;
  category: "infrastructure" | "code" | "research" | "planning" | "farming" | "outreach" | "agent" | "milestone";
  title: string;
  description: string;
  cost: number;
  aiDecision: boolean;
  region?: string;
  principles?: string[];
}

/**
 * Create a new log entry
 */
export function createLogEntry(
  category: LogEntry["category"],
  title: string,
  description: string,
  options: {
    cost?: number;
    region?: string;
    principles?: string[];
  } = {}
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    category,
    title,
    description,
    cost: options.cost || 0,
    aiDecision: true,
    region: options.region,
    principles: options.principles
  };
}

/**
 * Format log entry for display
 */
export function formatLogEntry(entry: LogEntry): string {
  const date = new Date(entry.timestamp);
  const formatted = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  let output = `[${formatted}] [${entry.category.toUpperCase()}] ${entry.title}`;

  if (entry.region) {
    output += ` (${entry.region})`;
  }

  output += `\n${entry.description}`;

  if (entry.cost > 0) {
    output += `\nCost: $${entry.cost.toFixed(2)}`;
  }

  if (entry.principles && entry.principles.length > 0) {
    output += `\nPrinciples: ${entry.principles.join(", ")}`;
  }

  return output;
}

/**
 * Post log entry to proofofcorn.com API
 * (Placeholder - will implement when API exists)
 */
export async function postLogEntry(
  entry: LogEntry,
  apiEndpoint: string,
  apiKey: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json() as { id: string };
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Create a decision log entry
 */
export function logDecision(
  action: string,
  rationale: string,
  autonomous: boolean,
  principles: string[] = []
): LogEntry {
  return createLogEntry(
    "agent",
    `Decision: ${action.slice(0, 50)}${action.length > 50 ? "..." : ""}`,
    `${action}\n\nRationale: ${rationale}\n\nAutonomous: ${autonomous ? "Yes" : "No (required approval)"}`,
    { principles }
  );
}

/**
 * Create a weather check log entry
 */
export function logWeatherCheck(
  region: string,
  temperature: number,
  conditions: string,
  recommendation: string
): LogEntry {
  return createLogEntry(
    "farming",
    `Weather Check: ${region}`,
    `Temperature: ${temperature}°F\nConditions: ${conditions}\nRecommendation: ${recommendation}`,
    { region }
  );
}

/**
 * Create an alert log entry
 */
export function logAlert(
  title: string,
  description: string,
  severity: "low" | "medium" | "high" | "critical"
): LogEntry {
  return createLogEntry(
    "milestone",
    `[${severity.toUpperCase()}] ${title}`,
    description
  );
}
