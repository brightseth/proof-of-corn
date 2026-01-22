import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proof of Corn",
  description: "Can AI grow corn? A case study in autonomous orchestration.",
};

// Timeline data - will be updated as project progresses
const timeline = [
  {
    date: "January 22, 2026",
    title: "Project Initiated",
    description: "Challenge accepted. Claude Code begins orchestrating real-world corn production.",
    status: "complete",
  },
  {
    date: "January 22, 2026",
    title: "Domain Registered",
    description: "proofofcorn.com secured. Chronicle website deployed.",
    status: "complete",
  },
  {
    date: "February 2026",
    title: "Infrastructure Setup",
    description: "ThingsBoard IoT platform, weather APIs, satellite imagery integration.",
    status: "pending",
  },
  {
    date: "March 2026",
    title: "Land & Contracts",
    description: "5-acre plot secured in Iowa. Custom operator contracted.",
    status: "pending",
  },
  {
    date: "April-May 2026",
    title: "Planting",
    description: "Claude monitors soil temp and weather, coordinates planting timing.",
    status: "pending",
  },
  {
    date: "May-September 2026",
    title: "Growing Season",
    description: "Real-time monitoring. AI-driven irrigation and pest management decisions.",
    status: "pending",
  },
  {
    date: "October 2026",
    title: "Harvest",
    description: "Physical corn harvested. Proof delivered.",
    status: "pending",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold hover:text-amber-500 transition-colors">
            PROOF OF CORN
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/" className="text-white">Home</Link>
            <Link href="/story" className="hover:text-white transition-colors">Story</Link>
            <Link href="/log" className="hover:text-white transition-colors">Log</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl">
          <p className="text-amber-500 text-sm font-mono tracking-widest mb-4">
            A CASE STUDY IN AUTONOMOUS ORCHESTRATION
          </p>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            PROOF OF CORN
          </h1>

          <p className="text-2xl md:text-3xl text-zinc-400 mb-8 font-light">
            Can AI grow corn?
          </p>

          <div className="text-6xl mb-12">
            🌽
          </div>

          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            January 21, 2026 — Walking from House of Nanking to the Embarcadero,{" "}
            <a href="https://x.com/fredwilson" className="text-amber-500 hover:text-amber-400" target="_blank" rel="noopener noreferrer">@fredwilson</a> challenged{" "}
            <a href="https://x.com/seth" className="text-amber-500 hover:text-amber-400" target="_blank" rel="noopener noreferrer">@seth</a>:
            can AI affect the physical world?
            <br /><br />
            This is our response. No simulation. No metaphor. Actual corn, grown from
            seed to harvest, with every decision orchestrated by Claude Code.
          </p>

          <Link
            href="/story"
            className="inline-block mt-8 text-sm text-zinc-500 hover:text-amber-500 transition-colors"
          >
            Read the full story →
          </Link>
        </div>

        <div className="absolute bottom-12 animate-bounce">
          <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* The Challenge */}
      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">The Challenge</h2>

          <blockquote className="border-l-4 border-amber-500 pl-6 text-2xl text-zinc-400 italic mb-8">
            &ldquo;Well, you can&apos;t grow corn.&rdquo;
            <footer className="text-base text-zinc-600 mt-2 not-italic">— Fred Wilson</footer>
          </blockquote>

          <p className="text-lg text-zinc-400 leading-relaxed">
            The argument: AI can write code, but it can&apos;t affect the physical world.
            It can&apos;t make things grow. It can&apos;t coordinate atoms.
            <br /><br />
            Our thesis: AI doesn&apos;t need to drive a tractor. It needs to orchestrate
            the humans, sensors, and systems that do. Claude Code becomes the farm manager —
            aggregating data, making decisions, coordinating contractors, and documenting everything.
          </p>
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 py-24 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">The Architecture</h2>

          <div className="font-mono text-sm text-zinc-400 bg-black p-6 rounded-lg overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE (Brain)                       │
│   • Decision making based on real-time data                 │
│   • Coordination of all contractors and services            │
│   • Documentation and logging of all operations             │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  DATA INPUTS  │   │  ORCHESTRATION  │   │    OUTPUTS      │
├───────────────┤   ├─────────────────┤   ├─────────────────┤
│ • IoT sensors │   │ • Custom farmer │   │ • Decisions log │
│ • Weather API │   │ • Seed supplier │   │ • Commands sent │
│ • Satellite   │   │ • Equipment     │   │ • Harvest data  │
│ • Soil data   │   │ • Payments      │   │ • Actual corn   │
└───────────────┘   └─────────────────┘   └───────────────┘`}</pre>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">The Stack</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Claude Code (Opus 4.5)", role: "Decision Engine", desc: "Makes all farming decisions" },
              { name: "ThingsBoard", role: "IoT Platform", desc: "Real-time sensor data aggregation" },
              { name: "Leaf Agriculture", role: "Farm Data API", desc: "Satellite imagery, field operations" },
              { name: "OpenWeatherMap", role: "Weather Forecasts", desc: "7-day forecasts for decision making" },
              { name: "Custom Operator (Iowa)", role: "Physical Execution", desc: "Planting, cultivation, harvest" },
              { name: "5 Acres (Iowa)", role: "The Land", desc: "Real soil, real corn, real proof" },
            ].map((item) => (
              <div key={item.name} className="border border-zinc-800 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-amber-500 text-sm mb-2">{item.role}</p>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-24 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Timeline</h2>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-8 pb-12 border-l-2 border-zinc-700 last:pb-0">
                <div className={`absolute -left-[9px] w-4 h-4 rounded-full ${
                  item.status === "complete" ? "bg-amber-500" : "bg-zinc-700"
                }`} />
                <p className="text-sm text-zinc-600 mb-1">{item.date}</p>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400">{item.description}</p>
                {item.status === "complete" && (
                  <span className="inline-block mt-2 text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">
                    COMPLETE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Data (placeholder) */}
      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Live Data</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Soil Moisture", value: "—", unit: "%", status: "Sensors deploying Feb 2026" },
              { label: "Soil Temperature", value: "—", unit: "°F", status: "Sensors deploying Feb 2026" },
              { label: "Days Since Start", value: "0", unit: "days", status: "Counting..." },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                <p className="text-zinc-500 text-sm mb-2">{item.label}</p>
                <p className="text-4xl font-bold mb-1">
                  {item.value}<span className="text-lg text-zinc-500 ml-1">{item.unit}</span>
                </p>
                <p className="text-xs text-zinc-600">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Thesis */}
      <section className="px-6 py-24 bg-gradient-to-b from-zinc-900/50 to-amber-900/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">The Thesis</h2>

          <p className="text-2xl text-zinc-300 leading-relaxed mb-8">
            The future of AI isn&apos;t replacement.
            <br />
            <span className="text-amber-500 font-bold">It&apos;s orchestration.</span>
          </p>

          <p className="text-lg text-zinc-500 leading-relaxed">
            The corn doesn&apos;t grow itself. But Claude doesn&apos;t touch a single seed either.
            <br /><br />
            What matters is the outcome: real corn, from real decisions, made by real AI.
          </p>
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
          <div className="flex gap-6 text-sm">
            <Link href="/log" className="text-zinc-500 hover:text-white transition-colors">
              View Log
            </Link>
            <a href="https://claude.ai/code" className="text-zinc-500 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Claude Code
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
