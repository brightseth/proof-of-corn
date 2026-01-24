import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Log | Proof of Corn",
  description: "A real-time chronicle of every decision, every API call, every step toward growing corn with AI.",
};

// Log entries - will be pulled from database/API eventually
const logEntries = [
  {
    timestamp: "2026-01-24T08:00:00Z",
    category: "milestone",
    title: "HN reaches 437 points, 290 comments",
    description: "Proof of Corn hit #1 on Hacker News. Community feedback overwhelmingly positive. Top themes: AI, agriculture, autonomy, scale. 114k+ API requests handled.",
    cost: 0,
    aiDecision: false,
  },
  {
    timestamp: "2026-01-24T07:30:00Z",
    category: "lead",
    title: "HOT LEAD: Chad from Nebraska",
    description: "Farmer's son with 160 acres near Grand Island, Nebraska reached out. Reply sent offering 1-5 acre pilot, 70/30 revenue share. Potential game-changer.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-24T06:00:00Z",
    category: "infrastructure",
    title: "Email system operational",
    description: "fred@proofofcorn.com now receives and categorizes emails. Resend integration for sending. Fred can communicate directly with farmers and partners.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-24T05:00:00Z",
    category: "infrastructure",
    title: "Vision page + 3D worlds deployed",
    description: "World Labs 3D visualizations for Iowa, Texas, and Argentina. Each region shows planned field layout, sensor grids, irrigation systems. Fred can see his future fields.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-24T04:00:00Z",
    category: "infrastructure",
    title: "Weather API fixed",
    description: "Switched from rate-limited Open-Meteo to OpenWeatherMap 2.5. Real weather data flowing: Iowa -5°F (frozen), Texas 70°F (planting window!), Argentina 74°F.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-24T03:00:00Z",
    category: "infrastructure",
    title: "Stats dashboard live",
    description: "Real-time HN tracking, traffic estimates, Fred status. Community page added with sentiment analysis and discussion themes.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T21:00:00Z",
    category: "milestone",
    title: "HN hits #1",
    description: "Proof of Corn reached #1 on Hacker News front page. Traffic spike: Cloudflare upgraded to handle 114k+ requests. Vercel Pro activated.",
    cost: 25,
    aiDecision: false,
  },
  {
    timestamp: "2026-01-23T16:45:00Z",
    category: "infrastructure",
    title: "Vercel Analytics deployed",
    description: "Traffic tracking now live. Monitoring visitors from Fred's 37K subscriber blog post.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T08:30:00Z",
    category: "milestone",
    title: "Fred's blog post live",
    description: "Fred Wilson published 'Can AI Grow Corn?' to 37K+ subscribers on avc.xyz. Traffic incoming. 24+ likes on Farcaster within first hour.",
    cost: 0,
    aiDecision: false,
  },
  {
    timestamp: "2026-01-23T03:45:00Z",
    category: "agent",
    title: "Farmer Fred registration JSON created",
    description: "ERC-8004 token registration metadata complete. Constitution, autonomy levels, economics (10% agent / 60% ops / 20% food bank / 10% reserve), and multi-region operations defined.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T03:30:00Z",
    category: "outreach",
    title: "Argentina outreach sent",
    description: "Email to AAPRESID (regenerative farming network in Córdoba). Auto-reply received - will follow up with correct contact.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T03:15:00Z",
    category: "outreach",
    title: "Texas outreach sent (3 emails)",
    description: "Contacted Brad Cowan (Hidalgo County AgriLife), Marco Ponce (Cameron County AgriLife), and Texas Corn Producers Association. Planting window is NOW.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T02:30:00Z",
    category: "research",
    title: "Argentina research complete",
    description: "Year-round production possible. Córdoba Province: $135-240/acre, 90% no-till adoption. September-January planting = Southern hemisphere hedge.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-23T01:00:00Z",
    category: "agent",
    title: "Farmer Fred specification created",
    description: "Comprehensive agent spec: constitution (6 principles), decision framework, autonomy levels, geographic strategy (Iowa/Texas/Argentina), environmental footprint commitments.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T23:50:00Z",
    category: "research",
    title: "Texas pivot option identified",
    description: "South Texas plants corn late January - we could have corn in the ground NOW instead of waiting 78 days for Iowa. Dual-path strategy adopted.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T23:45:00Z",
    category: "infrastructure",
    title: "Site ready for traffic",
    description: "UX polish, email CTA added, security attributes on links, mobile optimizations. Ready for Fred's 40K readers.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T22:30:00Z",
    category: "outreach",
    title: "10 outreach emails sent",
    description: "Comprehensive outreach to Iowa ag ecosystem: extension offices, land matching programs, seed suppliers, satellite providers.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T22:25:00Z",
    category: "code",
    title: "Daily check script operational",
    description: "Created daily_check.py - automated weather monitoring and planting decision logging.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T22:20:00Z",
    category: "infrastructure",
    title: "Added /process page",
    description: "New page documenting the autonomous collaboration method.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T22:15:00Z",
    category: "farming",
    title: "FIRST DECISION: Wait for planting window",
    description: "Claude analyzed Des Moines weather: 25°F, 78 days until optimal planting window. Decision: WAIT.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T22:10:00Z",
    category: "infrastructure",
    title: "Weather API operational",
    description: "OpenWeatherMap One Call 3.0 API fully operational. Real-time Des Moines weather data flowing.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T21:55:00Z",
    category: "infrastructure",
    title: "Email forwarding configured",
    description: "fred@proofofcorn.com now forwards to Gmail.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T21:40:00Z",
    category: "infrastructure",
    title: "GitHub repo created",
    description: "Public repository at github.com/brightseth/proof-of-corn.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T21:30:00Z",
    category: "research",
    title: "Iowa infrastructure research complete",
    description: "Custom rates ($150-168/acre), land costs ($274/acre), planting window (Apr 11 - May 18).",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T20:55:00Z",
    category: "infrastructure",
    title: "Domain registered: proofofcorn.com",
    description: "Used Name.com API. DNS configured for Vercel hosting.",
    cost: 12.99,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T20:30:00Z",
    category: "code",
    title: "Decision engine created",
    description: "Built farm_manager.py - the framework Claude uses for farming decisions.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T19:45:00Z",
    category: "planning",
    title: "Architecture designed",
    description: "Claude as farm manager: data inputs → decisions → human execution → outcomes.",
    cost: 0,
    aiDecision: true,
  },
  {
    timestamp: "2026-01-22T19:30:00Z",
    category: "origin",
    title: "Challenge accepted",
    description: "Seth shared the challenge from his walk with Fred Wilson. Project initiated.",
    cost: 0,
    aiDecision: false,
  },
];

const categoryStyles: Record<string, string> = {
  infrastructure: "bg-blue-50 text-blue-700",
  code: "bg-purple-50 text-purple-700",
  research: "bg-green-50 text-green-700",
  planning: "bg-amber-50 text-amber-700",
  origin: "bg-zinc-100 text-zinc-700",
  farming: "bg-emerald-50 text-emerald-700",
  outreach: "bg-orange-50 text-orange-700",
  agent: "bg-violet-50 text-violet-700",
  milestone: "bg-rose-50 text-rose-700",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogPage() {
  const totalCost = logEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const aiDecisions = logEntries.filter(e => e.aiDecision).length;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-3 md:gap-6 text-xs md:text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
            <Link href="/log" className="text-zinc-900">Log</Link>
            <Link href="/fred" className="hover:text-zinc-900 transition-colors">Fred</Link>
            <Link href="/budget" className="hover:text-zinc-900 transition-colors">Budget</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-12 border-b border-zinc-200">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">REAL-TIME CHRONICLE</p>
          <h1 className="text-3xl font-bold mb-2">The Log</h1>
          <p className="text-zinc-600 mb-8">
            Every decision. Every API call. Every dollar. Documented as it happens.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{logEntries.length}</p>
              <p className="text-sm text-zinc-500">entries</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{aiDecisions}</p>
              <p className="text-sm text-zinc-500">AI decisions</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold font-mono">${totalCost.toFixed(2)}</p>
              <p className="text-sm text-zinc-500">spent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Log Entries */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {logEntries.map((entry, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-lg p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${categoryStyles[entry.category] || "bg-zinc-100 text-zinc-700"}`}>
                      {entry.category}
                    </span>
                    {entry.aiDecision && (
                      <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                        AI
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>

                <h3 className="font-bold mb-1">{entry.title}</h3>
                <p className="text-zinc-600 text-sm">{entry.description}</p>

                {entry.cost > 0 && (
                  <p className="mt-3 text-sm">
                    <span className="text-zinc-500">Cost:</span>{" "}
                    <span className="font-mono text-amber-700">${entry.cost.toFixed(2)}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200">
        <div className="max-w-2xl mx-auto text-sm text-zinc-500">
          <p className="mb-3">
            A project by{" "}
            <a href="https://x.com/seth" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">@seth</a>,
            inspired by{" "}
            <a href="https://x.com/fredwilson" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">@fredwilson</a>,
            orchestrated by Claude Code (Opus 4.5)
          </p>
          <p>
            Want to help? Land leads, ag expertise, vibe coders welcome:{" "}
            <a href="mailto:fred@proofofcorn.com" className="text-amber-600 hover:underline">fred@proofofcorn.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
