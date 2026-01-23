/**
 * Decision log entries for Proof of Corn
 *
 * This data is shared between the log page and RSS feed.
 * Eventually this will be pulled from a database/API.
 */

// Type definition for a log entry
export interface LogEntry {
  timestamp: string;      // ISO 8601 format
  category: string;       // infrastructure, code, research, etc.
  title: string;
  description: string;
  cost: number;          // in USD
  aiDecision: boolean;   // true if AI made the decision
}

// All decision log entries (newest first)
export const logEntries: LogEntry[] = [
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
    description: "seth@proofofcorn.com now forwards to Gmail.",
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
