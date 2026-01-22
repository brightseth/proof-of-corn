import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Process | Proof of Corn",
  description: "How this project was built: human nudges, AI executes. A case study in autonomous collaboration.",
};

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header - minimal like avc.com */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/process" className="text-zinc-900">Process</Link>
          </nav>
        </div>
      </header>

      {/* Content - clean, readable, like a blog post */}
      <article className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">How This Was Built</h1>
          <p className="text-zinc-500 mb-12">A note on human-AI collaboration</p>

          <div className="prose prose-zinc max-w-none">
            <p className="text-lg leading-relaxed">
              This project was built in a single session on January 22, 2026. The human (Seth)
              provided direction and nudges. The AI (Claude Code, Opus 4.5) did the work.
            </p>

            <p>
              That&apos;s not a gimmick or marketing speak. It&apos;s a description of what actually happened.
            </p>

            <h2 className="text-xl font-bold mt-12 mb-4">The Inputs</h2>

            <p>
              Seth&apos;s contributions were brief:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>&ldquo;Fred challenged me - can AI grow corn? Let&apos;s prove it.&rdquo;</li>
              <li>&ldquo;Let&apos;s call it Proof of Corn.&rdquo;</li>
              <li>&ldquo;Keep going. You&apos;re doing great.&rdquo;</li>
              <li>&ldquo;Here&apos;s the API key.&rdquo;</li>
              <li>&ldquo;Just do your magic. I trust you.&rdquo;</li>
            </ul>

            <p>
              That&apos;s it. Everything else - the research, the architecture, the code, the emails,
              the domain registration, the website, the sensor firmware, the outreach to Iowa
              extension offices - that was Claude.
            </p>

            <h2 className="text-xl font-bold mt-12 mb-4">The Outputs</h2>

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
              <li>Set up email forwarding for seth@proofofcorn.com</li>
            </ul>

            <h2 className="text-xl font-bold mt-12 mb-4">What This Means</h2>

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

            <p>
              That&apos;s the bet.
            </p>

            <div className="mt-16 pt-8 border-t border-zinc-200">
              <p className="text-zinc-500 text-sm">
                Built with Claude Code (Opus 4.5)<br />
                Human: <a href="https://x.com/seth" className="text-amber-600 hover:underline">@seth</a><br />
                Challenge from: <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline">@fredwilson</a>
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
