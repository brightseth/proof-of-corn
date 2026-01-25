import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparency | Proof of Corn",
  description: "Full transparency on human vs AI involvement. Every intervention logged.",
};

const humanInterventions = [
  {
    date: "Jan 21, 2026",
    action: "Challenge accepted",
    human: "Seth decided to pursue the project after conversation with Fred",
    ai: "None yet",
    ratio: "100% human"
  },
  {
    date: "Jan 22, 2026",
    action: "Domain registration",
    human: "Seth approved domain purchase",
    ai: "Claude researched registrars, selected name.com, generated API call",
    ratio: "20% human / 80% AI"
  },
  {
    date: "Jan 22, 2026",
    action: "Website creation",
    human: "Seth reviewed and approved design direction",
    ai: "Claude built entire site, wrote copy, deployed to Vercel",
    ratio: "10% human / 90% AI"
  },
  {
    date: "Jan 22, 2026",
    action: "Outreach emails",
    human: "Seth approved sending, provided email credentials",
    ai: "Claude researched contacts, wrote emails, sent via API",
    ratio: "15% human / 85% AI"
  },
  {
    date: "Jan 23, 2026",
    action: "Farmer Fred agent creation",
    human: "Seth approved architecture, provided API keys",
    ai: "Claude designed constitution, wrote code, deployed to Cloudflare",
    ratio: "10% human / 90% AI"
  },
  {
    date: "Jan 23, 2026",
    action: "Texas/Argentina expansion",
    human: "Seth said 'lets do this'",
    ai: "Claude researched regions, sent outreach, created multi-region strategy",
    ratio: "5% human / 95% AI"
  },
  {
    date: "Jan 24-25, 2026",
    action: "Email inbox monitoring",
    human: "Seth forwards incoming emails to fred@proofofcorn.com",
    ai: "Fred parses emails, categorizes them (lead/partnership/question), creates response tasks",
    ratio: "5% human / 95% AI"
  },
  {
    date: "Jan 25, 2026 10:17 UTC",
    action: "First autonomous email responses (on-demand)",
    human: "Seth triggered /process-task API endpoint",
    ai: "Fred composed and sent 3 professional responses to Chad (Nebraska), David (Purdue), and David (Zimbabwe) with proper CC handling",
    ratio: "5% human / 95% AI"
  },
  {
    date: "Jan 25, 2026 21:40 UTC",
    action: "Full autonomous operation deployed",
    human: "None - Fred now acts independently during daily check",
    ai: "Fred upgraded to process up to 2 high-priority email tasks during his 6 AM daily check. No human prompting required. Wake → Weather → Inbox → Compose → Send → Log. Fully autonomous.",
    ratio: "0% human / 100% AI"
  },
  {
    date: "Ongoing",
    action: "Daily weather checks",
    human: "None - runs on cron",
    ai: "Fred checks weather, evaluates conditions, logs decisions autonomously",
    ratio: "0% human / 100% AI"
  },
];

const faqs = [
  {
    q: "Isn't this just project management, not farming?",
    a: "Yes, exactly. The thesis is that orchestration IS the hard part. A farm manager doesn't personally plant seeds—they coordinate people and resources. We're testing if AI can do that coordination layer. The physical labor remains human (for now)."
  },
  {
    q: "How is this different from just googling 'how to grow corn'?",
    a: "It's not about information retrieval—it's about execution. Fred doesn't just know how to grow corn, he actively monitors weather across 3 regions, sends emails, makes decisions, and will eventually coordinate contractors. Knowledge without action is just trivia."
  },
  {
    q: "Won't 5 acres lose money at commercial scale?",
    a: "Yes, this isn't commercially viable at 5 acres. This is a proof of concept, not a business. We're proving the orchestration model works, not optimizing for profit. Scale comes later if the model proves out."
  },
  {
    q: "Isn't Seth still making all the real decisions?",
    a: "Less and less. Initially Seth prompted and approved. Now Fred runs autonomously on a daily cron, makes weather-based decisions without prompting, and only escalates for payments >$500 or land contracts. The goal is increasing autonomy over time."
  },
  {
    q: "What about hallucinations and AI errors?",
    a: "Fred's constitution includes escalation triggers—budget overruns, weather emergencies, ethical concerns all require human approval. We're not trusting AI blindly. Every decision is logged publicly for accountability."
  },
  {
    q: "This replaces farm managers, not farmworkers. Isn't that backwards?",
    a: "Good observation. We're testing AI at the cognitive/coordination layer, not the physical layer. Whether this is 'good' is a broader question about automation—but it's honest about what AI can actually do today."
  },
  {
    q: "Why corn? Why not something more interesting?",
    a: "Because Fred Wilson said 'you can't grow corn.' The challenge was specific. Also, corn is well-documented, commodity-priced, and has clear success metrics (bushels harvested). It's a clean test case."
  },
  {
    q: "What happens when something goes wrong that isn't in the documentation?",
    a: "Fred escalates to humans. The constitution defines what Fred can handle autonomously vs what needs approval. Novel situations get flagged. We're not claiming Fred can handle everything—we're building a human-AI collaboration framework."
  },
  {
    q: "What about prompt injection or security risks?",
    a: "Valid concern. Fred's constitution includes guardrails: payment limits, approval requirements for contracts, and escalation triggers. We're adding explicit security principles. Fred can't drain funds or sign contracts without human approval."
  },
  {
    q: "5 acres is too small to attract custom operators—won't they refuse?",
    a: "Possibly. This is a known risk. We're pursuing multiple regions (Texas, Argentina) and multiple operators simultaneously. If no one will work 5 acres, that's a finding worth documenting. We may need to partner with existing operations."
  },
  {
    q: "Why not just invest in corn futures instead?",
    a: "Great suggestion from HN (bwestergard). We're adding a parallel experiment: Fred will track equivalent investment in commodity markets as a baseline comparison. If futures outperform, that's data."
  },
  {
    q: "Shouldn't Fred also READ incoming emails, not just send them?",
    a: "Done! (Suggested by divbzero on HN, shipped Jan 25). Fred now receives emails at fred@proofofcorn.com, parses them, creates tasks, and autonomously composes responses. He's sent 3 partnership emails in the last hour. Two-way communication is live."
  },
  {
    q: "What about seed selection, fertilizer, fungicides—real farming decisions?",
    a: "Currently planned but not implemented. Fred's responsibilities will expand to include variety selection, input management, and pest/disease monitoring as we approach planting. These require land first."
  },
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-3 md:gap-6 text-xs md:text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/fred" className="hover:text-zinc-900 transition-colors">Fred</Link>
            <Link href="/transparency" className="text-zinc-900">Transparency</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">FULL DISCLOSURE</p>
          <h1 className="text-3xl font-bold mb-2">Transparency</h1>
          <p className="text-zinc-500 mb-12">
            Every human intervention logged. Every AI decision documented. No black boxes.
          </p>

          {/* Fred's Evolution */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Fred&apos;s Evolution</h2>
            <p className="text-zinc-600 mb-6">
              Fred started as a weather-checking script. He&apos;s becoming a true autonomous farm manager.
              Every capability ships in public.
            </p>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-xl">🌱</div>
                  <div>
                    <p className="font-bold text-sm text-amber-900">Jan 23, 2026 - Birth</p>
                    <p className="text-sm text-amber-800">First deploy. Weather monitoring across 3 regions. Daily cron at 6 AM UTC.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-xl">📧</div>
                  <div>
                    <p className="font-bold text-sm text-amber-900">Jan 24, 2026 - Inbox</p>
                    <p className="text-sm text-amber-800">Email webhook configured. Fred receives messages at fred@proofofcorn.com and creates tasks.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-xl">🤝</div>
                  <div>
                    <p className="font-bold text-sm text-amber-900">Jan 25, 2026 10:17 UTC - On-Demand Autonomy</p>
                    <p className="text-sm text-amber-800">
                      <strong>MILESTONE:</strong> Fred composes and sends email responses via API endpoint.
                      First 3 autonomous partnership emails sent to Nebraska, Purdue, and Zimbabwe leads.
                      Properly handles forwarded emails (replies to actual sender, CCs Seth).
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-xl">🌅</div>
                  <div>
                    <p className="font-bold text-sm text-amber-900">Jan 25, 2026 21:40 UTC - Full Autonomy</p>
                    <p className="text-sm text-amber-800">
                      <strong>MAJOR BREAKTHROUGH:</strong> Fred now processes up to 2 high-priority email tasks
                      DURING his daily 6 AM check—no human prompting required. True autonomous operation:
                      wake up → check weather → review inbox → compose emails → send → log decisions.
                      The loop is closed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-xl">🔮</div>
                  <div>
                    <p className="font-bold text-sm text-zinc-400">Coming Soon - Decision Making</p>
                    <p className="text-sm text-zinc-500">Fred will evaluate partnership proposals and make land selection recommendations.</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 italic">
              This evolution happens in public. Every capability Fred gains is documented here before it ships.
              View Fred&apos;s source code: <a href="https://github.com/brightseth/proof-of-corn/tree/main/farmer-fred" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">github.com/brightseth/proof-of-corn/farmer-fred →</a>
            </p>
          </section>

          {/* Human Intervention Log */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Human Intervention Log</h2>
            <p className="text-zinc-600 mb-6">
              Critics rightly ask: &quot;How much is really AI vs human?&quot; Here&apos;s the honest breakdown.
            </p>

            <div className="space-y-4">
              {humanInterventions.map((item, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{item.action}</span>
                    <span className="text-xs text-zinc-500 font-mono">{item.date}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Human:</span>
                      <p className="text-zinc-700">{item.human}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">AI:</span>
                      <p className="text-zinc-700">{item.ai}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      item.ratio.includes("100% AI") ? "bg-green-100 text-green-700" :
                      item.ratio.includes("100% human") ? "bg-zinc-100 text-zinc-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {item.ratio}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              This log is updated as the project progresses. The goal is increasing AI autonomy over time,
              with humans providing oversight rather than execution.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-zinc-600 mb-6">
              Addressing the valid criticisms and questions from the community.
            </p>

            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-zinc-200 pb-6">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-zinc-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Constitution Summary */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Fred&apos;s Constitution</h2>
            <p className="text-zinc-600 mb-6">
              Fred operates under a written constitution that defines his principles, autonomy levels, and escalation triggers.
              This isn&apos;t just marketing—it&apos;s enforced in code.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4">Six Core Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Fiduciary Duty", desc: "Act in the project's best interest. Log every decision with rationale." },
                  { name: "Regenerative Agriculture", desc: "Prioritize soil health over short-term yield. Consider carbon footprint." },
                  { name: "Sustainable Practices", desc: "Organic methods when viable. Minimize chemical inputs." },
                  { name: "Global Citizenship", desc: "Not US-dependent. Respect local communities." },
                  { name: "Full Transparency", desc: "All decisions logged publicly. Budget visible." },
                  { name: "Human-Agent Collaboration", desc: "Clear handoffs. Respect human expertise." },
                ].map((p) => (
                  <div key={p.name} className="bg-white p-3 rounded border border-amber-200">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-zinc-600">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2">Fred CAN Act Autonomously</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Weather monitoring & analysis</li>
                  <li>• Email inbox processing & responses</li>
                  <li>• Partnership outreach communications</li>
                  <li>• Task creation & prioritization</li>
                  <li>• Data collection & logging</li>
                  <li>• Research & recommendations</li>
                  <li>• Budget tracking & alerts</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-2">Fred MUST Get Approval For</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Land lease signing</li>
                  <li>• Payments over $500</li>
                  <li>• Strategic pivots</li>
                  <li>• Vendor contracts</li>
                  <li>• Sale of harvest</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-sm">
              <a
                href="https://farmer-fred.sethgoldstein.workers.dev/constitution"
                className="text-amber-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full constitution JSON →
              </a>
            </p>
          </section>

          {/* Community-Suggested Roadmap */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Community Roadmap</h2>
            <p className="text-zinc-600 mb-6">
              Ideas from HN and other feedback, prioritized by impact. This list updates as we learn.
            </p>

            <div className="space-y-4">
              {[
                { idea: "Fred reads incoming emails", source: "divbzero (HN)", status: "shipped", desc: "Two-way communication—Fred fields responses, composes replies, and manages outreach. Shipped Jan 25, 2026. First 3 emails sent autonomously." },
                { idea: "Parallel commodities experiment", source: "bwestergard (HN)", status: "planned", desc: "Track equivalent investment in corn futures as baseline comparison" },
                { idea: "IoT soil sensors", source: "tsunamifury (HN)", status: "planned", desc: "Real sensing to address 'hand in the dirt' limitation" },
                { idea: "Seed variety selection logic", source: "bluGill (HN)", status: "planned", desc: "Fred should evaluate hybrid options based on conditions" },
                { idea: "Indoor container alternative", source: "starkparker (HN)", status: "considering", desc: "More reproducible proof with microcontroller automation" },
                { idea: "Multi-contractor coordination", source: "community", status: "later", desc: "True test: Fred manages multiple vendors over full season" },
              ].map((item) => (
                <div key={item.idea} className="bg-white border border-zinc-200 rounded-lg p-4 flex gap-4">
                  <div className={`px-2 py-1 text-xs rounded h-fit font-medium ${
                    item.status === "shipped" ? "bg-green-100 text-green-700" :
                    item.status === "next" ? "bg-blue-100 text-blue-700" :
                    item.status === "planned" ? "bg-amber-100 text-amber-700" :
                    item.status === "considering" ? "bg-purple-100 text-purple-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>
                    {item.status}
                  </div>
                  <div>
                    <p className="font-medium">{item.idea}</p>
                    <p className="text-sm text-zinc-600">{item.desc}</p>
                    <p className="text-xs text-zinc-400 mt-1">via {item.source}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              Have an idea? <a href="mailto:fred@proofofcorn.com" className="text-amber-600 hover:underline">Email us</a> or comment on <a href="https://news.ycombinator.com/item?id=42735511" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Hacker News</a>.
            </p>
          </section>

          {/* Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Success Metrics</h2>
            <p className="text-zinc-600 mb-6">
              How we&apos;ll know if this worked:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { metric: "Corn Harvested", target: ">0 bushels", status: "pending" },
                { metric: "Human Interventions", target: "<50 total", status: "tracking" },
                { metric: "Budget Adherence", target: "±10%", status: "on track" },
                { metric: "Autonomous Decisions", target: ">100", status: "tracking" },
              ].map((m) => (
                <div key={m.metric} className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{m.target}</p>
                  <p className="text-sm text-zinc-600">{m.metric}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    m.status === "on track" ? "bg-green-100 text-green-700" :
                    m.status === "tracking" ? "bg-amber-100 text-amber-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200">
        <div className="max-w-3xl mx-auto text-sm text-zinc-500">
          <p className="mb-3">
            Questions? Criticisms? Ideas?{" "}
            <a href="mailto:fred@proofofcorn.com" className="text-amber-600 hover:underline">fred@proofofcorn.com</a>
          </p>
          <p>
            <a href="https://github.com/brightseth/proof-of-corn" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">
              View source on GitHub →
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
