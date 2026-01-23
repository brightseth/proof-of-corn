import { Metadata } from "next";
import Link from "next/link";
import { logEntries } from "@/lib/logData";

export const metadata: Metadata = {
  title: "The Log | Proof of Corn",
  description: "A real-time chronicle of every decision, every API call, every step toward growing corn with AI.",
};

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
            <a href="mailto:seth@proofofcorn.com" className="text-amber-600 hover:underline">seth@proofofcorn.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
