'use client';

import { useEffect, useState } from 'react';
import PageLayout from "@/components/PageLayout";

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface LogEntry {
  timestamp: string;
  category: string;
  title: string;
  description: string;
  cost?: number;
  aiDecision?: boolean;
}

// Curated founding entries - the historical record of how this started
const foundingEntries: LogEntry[] = [
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
  lead: "bg-green-50 text-green-700",
  community: "bg-cyan-50 text-cyan-700",
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

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function LogPage() {
  const [liveEntries, setLiveEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${FRED_API}/log`);
      if (res.ok) {
        const data = await res.json();
        setLiveEntries(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Combine live entries with founding entries, sorted by timestamp (newest first)
  const allEntries = [...liveEntries, ...foundingEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalCost = allEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const aiDecisions = allEntries.filter(e => e.aiDecision).length;

  return (
    <PageLayout
      title="The Log"
      subtitle="Every decision. Every API call. Every dollar. Documented as it happens."
    >
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Autonomy Milestone */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌅</span>
              <p className="font-bold text-green-900 text-sm">Jan 25, 2026 21:40 UTC - Fred is now FULLY autonomous</p>
            </div>
            <p className="text-sm text-green-800">
              Fred now operates independently during his daily 6 AM UTC check. He wakes up, checks weather,
              reviews inbox, composes partnership emails, and sends them—completely autonomously.
              First autonomous cycle: Jan 26, 2026 06:00 UTC. Watch this log for his decisions in real-time.
            </p>
          </div>

          {/* Live indicator + refresh */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-zinc-500">
                Live from Fred&apos;s API
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-xs">
                Updated {formatRelativeTime(lastRefresh.toISOString())}
              </span>
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-xs transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{allEntries.length}</p>
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

          {/* Log Entries */}
          <div className="space-y-4">
            {loading && liveEntries.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                Loading Fred&apos;s activity log...
              </div>
            ) : (
              allEntries.map((entry, i) => {
                const isRecent = new Date(entry.timestamp).getTime() > Date.now() - 3600000; // Last hour
                return (
                  <div
                    key={`${entry.timestamp}-${i}`}
                    className={`bg-white border rounded-lg p-5 ${
                      isRecent ? 'border-amber-200 ring-1 ring-amber-100' : 'border-zinc-200'
                    }`}
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
                        {isRecent && (
                          <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                            recent
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    <h3 className="font-bold mb-1">{entry.title}</h3>
                    <p className="text-zinc-600 text-sm whitespace-pre-wrap">
                      {entry.description.length > 500
                        ? entry.description.slice(0, 500) + '...'
                        : entry.description}
                    </p>

                    {(entry.cost ?? 0) > 0 && (
                      <p className="mt-3 text-sm">
                        <span className="text-zinc-500">Cost:</span>{" "}
                        <span className="font-mono text-amber-700">${(entry.cost ?? 0).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* API Link */}
          <div className="mt-8 text-center">
            <a
              href={`${FRED_API}/log`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-600 hover:underline"
            >
              View raw API data →
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
