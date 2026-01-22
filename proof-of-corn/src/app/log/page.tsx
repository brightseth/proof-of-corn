import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Log | Proof of Corn",
  description: "A real-time chronicle of every decision, every API call, every step toward growing corn with AI.",
};

// This will eventually be pulled from a database or JSON file
const logEntries = [
  {
    timestamp: "2026-01-22T22:15:00Z",
    category: "farming",
    title: "FIRST DECISION: Wait for planting window",
    description: "Claude analyzed Des Moines weather and made first farming decision: WAIT. Temperature 25°F, 78 days until optimal planting window.",
    cost: 0,
    aiDecision: true,
    details: [
      "Current temp: 25°F (threshold: 50°F)",
      "Planting window: April 11 - May 18",
      "Days until window: 78",
      "Decision: WAIT - conditions not ready",
      "8-day forecast: Cold, no precipitation",
    ],
  },
  {
    timestamp: "2026-01-22T22:10:00Z",
    category: "infrastructure",
    title: "Weather API operational",
    description: "OpenWeatherMap One Call 3.0 API fully operational. Real-time Des Moines weather data flowing.",
    cost: 0,
    aiDecision: true,
    details: [
      "Current conditions: 25°F, broken clouds",
      "8-day forecast: Working",
      "Free tier: 1,000 calls/day",
      "Decision engine: Connected",
    ],
  },
  {
    timestamp: "2026-01-22T22:00:00Z",
    category: "outreach",
    title: "Contacted seed supplier",
    description: "Emailed Quality Seed Supply (Wyffels dealer in Huxley, IA) about seed for 5-acre plot.",
    cost: 0,
    aiDecision: true,
    details: [
      "Requested: 108-113 day hybrid",
      "Quantity: 5 acres (~1 bag)",
      "Location: 30 miles north of Des Moines",
    ],
  },
  {
    timestamp: "2026-01-22T21:55:00Z",
    category: "infrastructure",
    title: "Email forwarding configured",
    description: "seth@proofofcorn.com now forwards to Gmail. Professional email for project communications.",
    cost: 0,
    aiDecision: true,
    details: [
      "Domain: proofofcorn.com",
      "Alias: seth@proofofcorn.com",
      "Forwards to: sethgoldstein@gmail.com",
    ],
  },
  {
    timestamp: "2026-01-22T21:50:00Z",
    category: "outreach",
    title: "Sent 6 outreach emails",
    description: "Contacted Polk County Extension, Iowa Land Company, Leaf Agriculture, Iowa Corn Growers, Ann Johanns (ISU), Dr. Plastina (ISU).",
    cost: 0,
    aiDecision: true,
    details: [
      "Polk County Extension: Custom operator recommendations",
      "Iowa Land Company: Small acreage lease inquiry",
      "Leaf Agriculture: Satellite imagery API access",
      "Iowa Corn Growers: Industry connections and seed advice",
    ],
  },
  {
    timestamp: "2026-01-22T21:45:00Z",
    category: "infrastructure",
    title: "OpenWeatherMap API key obtained",
    description: "Subscribed to One Call 3.0 API. First 1,000 calls/day free. Key activating.",
    cost: 0,
    aiDecision: false,
    details: [
      "API key: PROOFOFCORN (active)",
      "Free tier: 1,000 calls/day",
      "Data: Current weather + 8-day forecast",
      "Location configured: Des Moines, Iowa",
    ],
  },
  {
    timestamp: "2026-01-22T21:40:00Z",
    category: "infrastructure",
    title: "GitHub repo created",
    description: "Public repository at github.com/brightseth/proof-of-corn with full documentation and source code.",
    cost: 0,
    aiDecision: true,
    details: [
      "README with architecture and timeline",
      "Decision engine code (Python)",
      "Chronicle website source (Next.js)",
      "Contributors: @seth + Claude",
    ],
  },
  {
    timestamp: "2026-01-22T21:30:00Z",
    category: "research",
    title: "Iowa infrastructure research complete",
    description: "Comprehensive research on custom farming rates, extension contacts, and land options in Iowa.",
    cost: 0,
    aiDecision: true,
    details: [
      "Full-service corn production: $150-168/acre (Iowa 2025 survey)",
      "Iowa cropland lease: $274/acre average",
      "Polk County Extension contact: 515-957-5760",
      "Email templates drafted for operator outreach",
      "5-acre budget: ~$2,400-3,100 total investment",
    ],
  },
  {
    timestamp: "2026-01-22T21:15:00Z",
    category: "code",
    title: "Weather API test script created",
    description: "Built test_weather.py to validate OpenWeatherMap integration and check planting conditions.",
    cost: 0,
    aiDecision: true,
    details: [
      "Current weather endpoint test",
      "5-day forecast aggregation",
      "Planting conditions checker (temp + date window)",
      "Des Moines, Iowa coordinates configured",
    ],
  },
  {
    timestamp: "2026-01-22T21:00:00Z",
    category: "infrastructure",
    title: "Story and log pages deployed",
    description: "Added /story page documenting the House of Nanking origin, and /log page for real-time chronicle.",
    cost: 0,
    aiDecision: true,
    details: [
      "Origin story: Walk from House of Nanking to Embarcadero",
      "@seth and @fredwilson attribution",
      "\"My Dinner with Andre\" framing for the AGI age",
      "Navigation added across all pages",
    ],
  },
  {
    timestamp: "2026-01-22T20:55:00Z",
    category: "infrastructure",
    title: "Domain registered: proofofcorn.com",
    description: "Used Name.com API to check availability and register domain. DNS configured for Vercel hosting.",
    cost: 12.99,
    aiDecision: true,
    details: [
      "Checked availability: proofofcorn.com, .io, .farm, .xyz, .org, .dev, .co",
      "Selected .com for credibility and reasonable renewal cost ($19.99/yr)",
      "Added A record pointing to 76.76.21.21 (Vercel)",
      "Added CNAME for www subdomain",
    ],
  },
  {
    timestamp: "2026-01-22T20:30:00Z",
    category: "code",
    title: "Decision engine created: farm_manager.py",
    description: "Built the Python framework that Claude will use to make farming decisions based on sensor data and weather forecasts.",
    cost: 0,
    aiDecision: true,
    details: [
      "Planting decision logic: soil temp > 50°F, weather forecast analysis, date window check",
      "Irrigation decision logic: soil moisture thresholds, precipitation forecast",
      "Growing Degree Days (GDD) calculation for corn",
      "JSON logging for all decisions",
    ],
  },
  {
    timestamp: "2026-01-22T20:00:00Z",
    category: "research",
    title: "Research: Iowa corn growing timeline",
    description: "Researched optimal planting dates, custom farming services, and IoT platforms for agricultural monitoring.",
    cost: 0,
    aiDecision: true,
    details: [
      "Optimal Iowa planting window: April 11 - May 18",
      "Soil temperature threshold: 50°F minimum",
      "Custom farming rates: ~$100-150/acre for full service",
      "Land lease rates: ~$180-250/acre in Iowa",
      "ThingsBoard IoT platform: free tier supports 30 devices",
    ],
  },
  {
    timestamp: "2026-01-22T19:45:00Z",
    category: "planning",
    title: "Architecture designed",
    description: "Defined the system architecture: Claude as farm manager, orchestrating data inputs, human operators, and decision outputs.",
    cost: 0,
    aiDecision: true,
    details: [
      "Data inputs: IoT sensors, weather API, satellite imagery",
      "Orchestration layer: custom operators, seed suppliers, equipment",
      "Outputs: decision logs, commands, harvest data",
      "Budget estimate: $2,500-3,000 total investment",
    ],
  },
  {
    timestamp: "2026-01-22T19:30:00Z",
    category: "origin",
    title: "Challenge accepted",
    description: "Seth shared the challenge from his walk with Fred Wilson. Project initiated.",
    cost: 0,
    aiDecision: false,
    details: [
      "Origin: Dinner at House of Nanking, walk to 1 Hotel SF",
      "Challenge: \"You can't grow corn\" - Fred Wilson",
      "Response: Prove that AI can orchestrate physical-world outcomes",
    ],
  },
];

const categoryColors: Record<string, string> = {
  infrastructure: "bg-blue-500/20 text-blue-400",
  code: "bg-purple-500/20 text-purple-400",
  research: "bg-green-500/20 text-green-400",
  planning: "bg-amber-500/20 text-amber-400",
  origin: "bg-red-500/20 text-red-400",
  farming: "bg-emerald-500/20 text-emerald-400",
  weather: "bg-cyan-500/20 text-cyan-400",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function LogPage() {
  const totalCost = logEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold hover:text-amber-500 transition-colors">
            PROOF OF CORN
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/story" className="hover:text-white transition-colors">Story</Link>
            <Link href="/log" className="text-white">Log</Link>
            <Link href="/process" className="hover:text-white transition-colors">Process</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-500 text-sm font-mono tracking-widest mb-4">
            REAL-TIME CHRONICLE
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Log
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Every decision. Every API call. Every dollar. Documented in real-time as AI orchestrates the growing of corn.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-xs mb-1">Total Entries</p>
              <p className="text-2xl font-bold">{logEntries.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-xs mb-1">AI Decisions</p>
              <p className="text-2xl font-bold">{logEntries.filter(e => e.aiDecision).length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-xs mb-1">Total Spent</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-xs mb-1">Days Active</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
      </section>

      {/* Log Entries */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {logEntries.map((entry, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${categoryColors[entry.category] || "bg-zinc-700 text-zinc-400"}`}>
                      {entry.category.toUpperCase()}
                    </span>
                    {entry.aiDecision && (
                      <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                        AI DECISION
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 font-mono">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{entry.title}</h3>
                <p className="text-zinc-400 mb-4">{entry.description}</p>

                {entry.details && entry.details.length > 0 && (
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-zinc-500 mb-2 font-mono">DETAILS</p>
                    <ul className="space-y-1">
                      {entry.details.map((detail, j) => (
                        <li key={j} className="text-sm text-zinc-400 flex items-start gap-2">
                          <span className="text-zinc-600">→</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.cost > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">Cost:</span>
                    <span className="text-amber-500 font-mono">${entry.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Next */}
      <section className="px-6 py-16 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Coming Next</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { task: "Create ThingsBoard IoT account", status: "pending" },
              { task: "Get OpenWeatherMap API key", status: "pending" },
              { task: "Contact custom operators in Iowa", status: "pending" },
              { task: "Identify 5-acre plot for lease", status: "pending" },
              { task: "Order IoT sensor kit", status: "pending" },
              { task: "Set up Leaf Agriculture API", status: "pending" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                {item.task}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-zinc-500 text-sm">
            A project by <a href="https://x.com/seth" className="text-zinc-400 hover:text-white" target="_blank" rel="noopener noreferrer">@seth</a>,
            inspired by <a href="https://x.com/fredwilson" className="text-zinc-400 hover:text-white" target="_blank" rel="noopener noreferrer">@fredwilson</a>,
            orchestrated by Claude Code (Opus 4.5)
          </div>
        </div>
      </footer>
    </div>
  );
}
