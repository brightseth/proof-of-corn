import { Metadata } from "next";
import Link from "next/link";
import FredWidget from "@/components/FredWidget";
import FredMiniWidget from "@/components/FredMiniWidget";
import { ContactFred } from "@/components/ContactFred";

export const metadata: Metadata = {
  title: "Proof of Corn",
  description: "Can AI grow corn? A case study in vibe coding and autonomous orchestration.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header with Fred Mini Widget */}
      <header className="border-b border-zinc-200 px-6 py-3 sticky top-0 bg-[#fafafa]/95 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
              Proof of Corn
            </Link>
            <nav className="hidden sm:flex gap-4 text-xs md:text-sm text-zinc-500">
              <Link href="/" className="text-zinc-900">Home</Link>
              <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
              <Link href="/fred" className="hover:text-zinc-900 transition-colors">Farmer Fred</Link>
              <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
              <Link href="/community" className="hover:text-zinc-900 transition-colors">Community</Link>
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            </nav>
          </div>
          {/* Fred Mini Widget - always visible */}
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-zinc-400">LIVE</span>
            <FredMiniWidget />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 border-b border-zinc-200">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">A CASE STUDY</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Can AI grow corn?
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed mb-8">
            On January 21, 2026,{" "}
            <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">@fredwilson</a>{" "}
            challenged{" "}
            <a href="https://x.com/seth" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">@seth</a>:
            AI can write code, but it can&apos;t affect the physical world.
          </p>
          <p className="text-xl text-zinc-600 leading-relaxed">
            This is our response. Real corn, grown from seed to harvest,
            with every decision made by Claude Code.
          </p>
          <div className="mt-8">
            <Link href="/story" className="text-amber-600 hover:underline">
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/* The Thesis */}
      <section className="px-6 py-16 border-b border-zinc-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">The Thesis</h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-4">
            AI doesn&apos;t need to drive a tractor. It needs to orchestrate
            the systems and people who do.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed">
            A farm manager doesn&apos;t personally plant every seed. They aggregate data,
            make decisions, coordinate contractors. Claude Code becomes that farm manager—
            24/7, data-driven, fully documented.
          </p>
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 py-16 border-b border-zinc-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">The Architecture</h2>
          <pre className="text-[10px] sm:text-sm text-zinc-600 bg-zinc-50 p-4 sm:p-6 rounded-lg overflow-x-auto font-mono">
{`┌─────────────────────────────────────────────────┐
│              CLAUDE CODE (Brain)                │
│  • Aggregates sensor data + weather forecasts   │
│  • Makes planting, irrigation, harvest decisions│
│  • Coordinates human operators                  │
└─────────────────────────────────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
   DATA INPUTS     ORCHESTRATION      OUTPUTS
   • IoT sensors   • Custom farmer    • Decision log
   • Weather API   • Seed supplier    • Commands
   • Satellite     • Equipment        • Actual corn`}
          </pre>
        </div>
      </section>

      {/* Current Status + Farmer Fred */}
      <section className="px-6 py-16 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Column */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Current Status</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span>Farmer Fred</span>
                  <span className="text-green-700">● Operational</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span>Regions</span>
                  <span className="text-amber-700">Iowa (wait) • Texas (NOW) • Argentina</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span>Outreach</span>
                  <span className="text-zinc-600">14 emails sent, awaiting responses</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                  <span>Land</span>
                  <span className="text-zinc-600">Searching (IA, TX)</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span>Total Spent</span>
                  <span className="font-mono">$12.99</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/log" className="text-amber-600 hover:underline">
                  View the full decision log →
                </Link>
              </div>
            </div>

            {/* Farmer Fred Widget */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">The Agent</h2>
              <FredWidget />
              <p className="mt-3 text-sm text-zinc-500">
                Click to see Fred&apos;s full view →
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-16 border-b border-zinc-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Timeline</h2>

          <div className="space-y-6">
            {[
              { date: "Jan 22, 2026", event: "Challenge accepted", status: "done" },
              { date: "Jan-Feb", event: "Infrastructure setup, outreach", status: "active" },
              { date: "Feb-Mar", event: "Land lease, operator contract", status: "pending" },
              { date: "March", event: "Sensors deployed", status: "pending" },
              { date: "Apr 11 - May 18", event: "Planting window", status: "pending" },
              { date: "May - Sep", event: "Growing season (AI managing)", status: "pending" },
              { date: "October", event: "Harvest", status: "pending" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-32 flex-shrink-0 text-sm text-zinc-500">
                  {item.date}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'done' ? 'bg-green-500' :
                    item.status === 'active' ? 'bg-amber-500' : 'bg-zinc-300'
                  }`} />
                  <span className={item.status === 'pending' ? 'text-zinc-500' : ''}>
                    {item.event}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="px-6 py-16 border-b border-zinc-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Follow Along</h2>
          <div className="space-y-3">
            <p>
              <a href="https://github.com/brightseth/proof-of-corn"
                 className="text-amber-600 hover:underline"
                 target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
              {" "}— All code, documentation, decision logs
            </p>
            <p>
              <Link href="/log" className="text-amber-600 hover:underline">
                Decision Log
              </Link>
              {" "}— Every AI decision, timestamped
            </p>
            <p>
              <Link href="/budget" className="text-amber-600 hover:underline">
                Budget
              </Link>
              {" "}— Every dollar, tracked
            </p>
            <p>
              <Link href="/process" className="text-amber-600 hover:underline">
                The Process
              </Link>
              {" "}— How this was built
            </p>
          </div>
        </div>
      </section>

      {/* Contact Fred */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-xl mx-auto">
          <ContactFred />
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
            Want to help? Iowa land leads, ag expertise, vibe coders welcome:{" "}
            <a href="mailto:fred@proofofcorn.com" className="text-amber-600 hover:underline">fred@proofofcorn.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
