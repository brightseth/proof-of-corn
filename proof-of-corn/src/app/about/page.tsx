'use client';

import { Metadata } from "next";
import PageLayout from "@/components/PageLayout";
import { useState } from 'react';

// Note: Metadata export removed due to 'use client' directive
// Add metadata via layout.tsx or convert to server component if needed

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'story' | 'how-it-works' | 'transparency'>('story');

  return (
    <PageLayout
      title="About Proof of Corn"
      subtitle="The complete story, architecture, and transparency log"
    >
      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 bg-white sticky top-[73px] z-40">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('story')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'story'
                  ? 'border-amber-600 text-zinc-900 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'how-it-works'
                  ? 'border-amber-600 text-zinc-900 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveTab('transparency')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'transparency'
                  ? 'border-amber-600 text-zinc-900 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Transparency
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <article className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'story' && <StoryTab />}
          {activeTab === 'how-it-works' && <HowItWorksTab />}
          {activeTab === 'transparency' && <TransparencyTab />}
        </div>
      </article>
    </PageLayout>
  );
}

function StoryTab() {
  return (
    <div className="prose-clean text-zinc-700 max-w-2xl mx-auto">
      <p className="text-lg leading-relaxed">
        It started with dinner. House of Nanking on Kearny Street, around 7pm on a
        Tuesday night. The kind of San Francisco evening where the fog hasn&apos;t
        rolled in yet and the city feels quiet—too quiet, maybe.
      </p>

      <p>
        <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline">Fred Wilson</a> and
        I walked from the restaurant toward his hotel at 1 Hotel San Francisco
        by the Embarcadero. We&apos;d been talking about AI—not the hype, but the
        reality. What it can actually do. What it can&apos;t.
      </p>

      <p>
        I&apos;d been describing my experience with Claude Code. Something had shifted
        around New Year&apos;s. For the first time, I felt like I could do anything
        with software from my terminal. Not &ldquo;someday&rdquo;—now.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">The Moment: 8:15 PM</h2>

      <p className="text-sm text-zinc-500 mb-4">
        Walking along the Embarcadero toward 1 Hotel San Francisco
      </p>

      <div className="bg-white border border-zinc-200 rounded-lg p-6 my-8 font-mono text-sm space-y-4">
        <p><span className="text-zinc-500">SETH:</span> &ldquo;I can do anything I want with software from my terminal.&rdquo;</p>

        <p><span className="text-zinc-500">FRED:</span> &ldquo;That&apos;s not fire. You can&apos;t like grow corn.&rdquo;</p>

        <p><span className="text-zinc-500">SETH:</span> &ldquo;I bet you I could. You know what I mean? I&apos;m going to grow corn for you.&rdquo;</p>

        <p><span className="text-zinc-500">FRED:</span> &ldquo;That&apos;d be great. Thank you.&rdquo;</p>

        <p><span className="text-zinc-500">SETH:</span> &ldquo;I&apos;m going to figure it out and I&apos;m going to show you. And that&apos;ll be our first vibe coding project together.&rdquo;</p>

        <p><span className="text-zinc-500">FRED:</span> &ldquo;It&apos;s a physical thing.&rdquo;</p>

        <p><span className="text-zinc-500">SETH:</span> &ldquo;I will buy fucking land with an API via my terminal and I will hire some service to plant corn.&rdquo;</p>

        <p><span className="text-zinc-500">FRED:</span> &ldquo;Okay, well that&apos;s a little different... you&apos;re going to get somebody to grow corn for you. But that&apos;s not exactly what I&apos;m talking about. Like, you can hire Jeff to come and make dinner for you, but like you can&apos;t make dinner.&rdquo;</p>

        <p><span className="text-zinc-500">SETH:</span> &ldquo;No, but anything that could be done with technology, I can do now. Anything, which is insane.&rdquo;</p>
      </div>

      <p>
        That was the challenge. Fred&apos;s point was precise: there&apos;s a gap between
        digital and physical that AI can&apos;t cross. Code doesn&apos;t water plants.
        Prompts don&apos;t drive tractors. Language models don&apos;t know when to harvest.
      </p>

      <p>
        But there was something in his framing that I thought missed the mark.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">The Insight</h2>

      <p>
        I got home that night and opened Claude Code. Not to prove Fred wrong—but
        to explore whether he might be missing something.
      </p>

      <p>
        The insight isn&apos;t that AI needs to drive a tractor. It&apos;s that AI can
        orchestrate the systems and people who do. A farm manager doesn&apos;t personally
        plant every seed—they aggregate data, make decisions, coordinate contractors.
      </p>

      <p>
        Fred&apos;s analogy was: &ldquo;You can hire Jeff to make dinner, but you can&apos;t make dinner.&rdquo;
      </p>

      <p>
        But that&apos;s exactly what a restaurant owner does. They don&apos;t cook every meal.
        They hire chefs, source ingredients, manage inventory, make decisions about
        the menu. The output is dinner. The method is orchestration.
      </p>

      <p>
        What if Claude Code became a farm manager?
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">12 Hours Later</h2>

      <p>
        By the next afternoon, working with Claude Code:
      </p>

      <ul className="list-disc pl-6 space-y-2 my-6">
        <li>Registered proofofcorn.com via API</li>
        <li>Built and deployed this website</li>
        <li>Researched Iowa custom farming rates, land costs, planting windows</li>
        <li>Sent 10 outreach emails to extension offices, land companies, seed suppliers</li>
        <li>Created a decision engine for farming operations</li>
        <li>Made the first AI farming decision: <strong>WAIT</strong> (78 days to planting window)</li>
      </ul>

      <p>
        Total cost: $12.99 (the domain).
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">What We&apos;re Proving</h2>

      <p>
        This project isn&apos;t just about growing corn. It&apos;s about documenting what
        happens when you take AI seriously as a collaborator rather than a tool.
      </p>

      <p>
        Every decision will be logged. Every API call documented. Every dollar
        tracked. When we harvest corn in October, we&apos;ll have a complete record
        of how an idea became a reality—with AI as the orchestration layer.
      </p>

      <p>
        Fred, this one&apos;s for you.*
      </p>

      <p className="text-sm text-zinc-500 mt-8">
        *We&apos;re not alone in this. <a href="https://soltomato.fun" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Sol Tomato</a> has
        Claude directly controlling a tomato plant via IoT sensors. That&apos;s the &ldquo;robot farmer&rdquo; approach—AI
        controlling hardware. Proof of Corn is the &ldquo;farm manager&rdquo; approach—AI orchestrating humans and services.
        Both prove the same point: AI can affect the physical world. The vibe coding movement is just getting started.
      </p>

      <div className="mt-12 pt-8 border-t border-zinc-200">
        <p className="text-zinc-500">
          — <a href="https://x.com/seth" className="text-amber-600 hover:underline">@seth</a>
          <br />
          <span className="text-sm">January 22, 2026</span>
        </p>
      </div>
    </div>
  );
}

function HowItWorksTab() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="prose prose-zinc max-w-none">
        <p className="text-lg leading-relaxed">
          This project was built in a single session on January 22, 2026. The human (Seth)
          provided direction and nudges. The AI (Claude Code, Opus 4.6) did the work.
        </p>

        <p>
          That&apos;s not a gimmick or marketing speak. It&apos;s a description of what actually happened.
        </p>

        <h2 className="text-xl font-bold mt-12 mb-4">The Human-AI Collaboration Model</h2>

        <p>
          There&apos;s a mode of working with AI that isn&apos;t prompting and isn&apos;t delegating.
          It&apos;s more like... nudging. You provide direction, intent, taste. The AI provides
          execution, research, synthesis, code.
        </p>

        <p>
          The human stays in the loop but doesn&apos;t micromanage. The AI has latitude to make
          decisions but checks in for guidance. It&apos;s collaborative in a way that&apos;s hard
          to describe until you experience it.
        </p>

        <p>
          Seth calls this &ldquo;vibe coding.&rdquo; The vibe is: trust, direction, iteration.
        </p>

        <h2 className="text-xl font-bold mt-12 mb-4">Architecture Overview</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8">
          <h3 className="font-bold mb-4 text-amber-900">System Components</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-amber-900">Farmer Fred (Autonomous Agent)</p>
              <p className="text-amber-800">
                Cloudflare Worker running on daily cron. Monitors Iowa weather,
                processes email inbox, makes farming decisions, and sends autonomous responses.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Decision Engine</p>
              <p className="text-amber-800">
                Constitution-based logic that determines what Fred can do autonomously vs
                what requires human approval. Escalates for payments &gt;$500, contracts, and strategic pivots.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Data Layer</p>
              <p className="text-amber-800">
                Cloudflare KV for persistent storage. Weather data, email logs, decision history,
                and partnership leads all tracked and publicly visible.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Communication Layer</p>
              <p className="text-amber-800">
                Email webhook receives messages at fred@proofofcorn.com. Fred parses, categorizes,
                and autonomously responds to partnership inquiries and questions.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-12 mb-4">What Seth Did</h2>

        <p>Seth&apos;s contributions were brief:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>&ldquo;Fred challenged me - can AI grow corn? Let&apos;s prove it.&rdquo;</li>
          <li>&ldquo;Let&apos;s call it Proof of Corn.&rdquo;</li>
          <li>&ldquo;Keep going. You&apos;re doing great.&rdquo;</li>
          <li>&ldquo;Here&apos;s the API key.&rdquo;</li>
          <li>&ldquo;Just do your magic. I trust you.&rdquo;</li>
        </ul>

        <h2 className="text-xl font-bold mt-12 mb-4">What Claude Code Did</h2>

        <p>In roughly 90 minutes:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Registered proofofcorn.com ($12.99)</li>
          <li>Built and deployed this website (Next.js, Vercel)</li>
          <li>Created GitHub repo with full documentation</li>
          <li>Researched Iowa farming: custom rates, land costs, planting windows</li>
          <li>Sent 7 outreach emails to extension offices, land companies, seed suppliers</li>
          <li>Configured weather API, tested planting conditions</li>
          <li>Made first farming decision: WAIT (78 days to planting window)</li>
          <li>Wrote ESP32 sensor firmware</li>
          <li>Created sensor shopping list and ThingsBoard setup guide</li>
          <li>Set up email forwarding for fred@proofofcorn.com</li>
        </ul>

        <h2 className="text-xl font-bold mt-12 mb-4">The Bet</h2>

        <p>
          Fred&apos;s challenge was that AI can&apos;t affect the physical world. Can&apos;t grow corn.
        </p>

        <p>
          Our response isn&apos;t that AI will drive tractors. It&apos;s that AI can orchestrate
          the systems and people who do. The same way a farm manager doesn&apos;t personally
          plant every seed - they aggregate data, make decisions, coordinate operations.
        </p>

        <p>
          By October 2026, we&apos;ll have harvested actual corn. Every decision logged.
          Every dollar tracked. The complete record of an idea becoming reality through
          human-AI collaboration.
        </p>

        <p className="font-medium">
          That&apos;s the bet.
        </p>

        <div className="mt-16 pt-8 border-t border-zinc-200">
          <p className="text-zinc-500 text-sm">
            Built with Claude Code (Opus 4.6)<br />
            Human: <a href="https://x.com/seth" className="text-amber-600 hover:underline">@seth</a><br />
            Challenge from: <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline">@fredwilson</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function TransparencyTab() {
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
      a: "It's not about information retrieval—it's about execution. Fred doesn't just know how to grow corn, he actively monitors weather in Iowa, sends emails, makes decisions, and coordinates with the team on the ground. Knowledge without action is just trivia."
    },
    {
      q: "Won't a 100x100ft plot lose money?",
      a: "This is a proof of concept, not a business. We're growing sweet corn on a 100x100ft plot at Nelson Family Farms in Iowa — enough to prove the orchestration model works. Scale comes later if the model proves out."
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
      q: "How are you actually farming this?",
      a: "Joe Nelson's family farm in Humboldt County, Iowa. 100x100ft plot of former cow pasture — the most fertile land on the property. Joe's dad manages the farm, Dan is the local farmhand. Real people, real land, real corn."
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
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
                <p className="text-sm text-amber-800">First deploy. Weather monitoring for Iowa. Daily cron at 6 AM UTC.</p>
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
            <div key={i} className="border-b border-zinc-200 pb-6 last:border-0">
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

      {/* Success Metrics */}
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
  );
}
