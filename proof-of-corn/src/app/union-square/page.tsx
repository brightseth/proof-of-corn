import { Metadata } from "next";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "AI to Table | Proof of Corn",
  description: "AI to Table: Farmer Fred's mission to sell his first ear of roasted corn at Union Square Farmers Market, NYC - August 2026.",
};

export default function UnionSquarePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-amber-700 text-sm tracking-wide mb-4">THE GOAL</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            AI to Table
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed mb-4">
            Target date: <strong>August 2, 2026</strong>. Farmer Fred's first ear of roasted corn,
            grown autonomously from seed to harvest, sold at Union Square Greenmarket in New York City.
          </p>
          <p className="text-lg text-zinc-500 leading-relaxed italic">
            Farm-to-table, but orchestrated by AI. Every decision—planting, irrigation, harvest—made
            by Farmer Fred. The human just provides the hands.
          </p>
        </div>

        {/* The Vision */}
        <section className="mb-16 pb-16 border-b border-zinc-200">
          <h2 className="text-2xl font-bold mb-6">The Vision</h2>

          <div className="bg-zinc-50 p-6 rounded-lg mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Imagine this scene:</strong> A farmers market stand at Union Square. The sign reads
              <strong>"AI to Table — Proof of Corn"</strong> in bold letters. Below it: "Grown by Autonomous AI Agent."
              An iPad displays live weather dashboards, irrigation decisions, and soil moisture logs scrolling in real-time.
            </p>
            <p className="text-lg leading-relaxed">
              A human representative roasts corn and explains: <em>"Farm-to-table, but AI orchestrated. I'm just the hands.
              The brain is Claude Code running in the cloud. This corn? Planted April 20, irrigated June 3 based on
              soil moisture data, harvested July 10. Want to see the weather on June 15 when Fred
              decided to water? Scan the QR code."</em>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-lg">
              <h3 className="font-bold mb-3">🌽 The Product</h3>
              <ul className="space-y-2 text-zinc-600">
                <li>• Roasted sweet corn: $2/ear</li>
                <li>• Raw sweet corn: $5/dozen</li>
                <li>• QR codes on every ear linking to full growing history</li>
                <li>• "AI to Table" stickers</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6 rounded-lg">
              <h3 className="font-bold mb-3">📱 The Experience</h3>
              <ul className="space-y-2 text-zinc-600">
                <li>• Live dashboard showing Fred's current decisions</li>
                <li>• "Ask Fred" chatbot for customers</li>
                <li>• Full transparency: scan to see irrigation logs</li>
                <li>• Meet the human operator (Fred's hands)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16 pb-16 border-b border-zinc-200">
          <h2 className="text-2xl font-bold mb-8">The Path to August 2026</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                NOW - FEB 15
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold">Secure land partnership</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Waiting on responses from Purdue (Indiana), Nebraska, and Zimbabwe partnerships.
                  Need land confirmed by Feb 15 to hit planting window.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                MARCH
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">Deploy IoT sensors + prep soil</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Install soil moisture sensors, weather station, and camera. Test data pipeline.
                  Fred starts receiving real-time field data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                APR 20
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">Planting day</span>
                </div>
                <p className="text-sm text-zinc-600">
                  80-day sweet corn variety planted mid-window (April 11-May 18). Fred monitors germination
                  and makes early irrigation decisions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                MAY 1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">Apply for GrowNYC vendor permit</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Submit vendor application to Union Square Greenmarket. Requires farm inspection,
                  liability insurance, product list. 4-6 week processing time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                JUNE 1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">NYC food vendor licensing</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Submit NYC Health Department food vendor permit. Roasting equipment inspection.
                  Mobile food vending license application.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                JULY 10
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">Harvest</span>
                </div>
                <p className="text-sm text-zinc-600">
                  80 days from planting. Fred coordinates local operator for harvest timing based on
                  kernel moisture and market readiness. Quality inspection.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                JULY 15
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="font-semibold">Transport to NYC</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Refrigerated truck from Nebraska/Indiana to New York City (1,200 miles). Sweet corn is
                  perishable - 3-4 day window. Cost: ~$2,500.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 flex-shrink-0 text-sm text-zinc-500 font-mono">
                AUG 2, 2026
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold">🌽 Union Square debut</span>
                </div>
                <p className="text-sm text-zinc-600">
                  First Saturday of August. Fred's stand at Union Square Greenmarket. AI-grown corn meets
                  NYC farmers market culture. Press invited.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Economics */}
        <section className="mb-16 pb-16 border-b border-zinc-200">
          <h2 className="text-2xl font-bold mb-6">The Economics</h2>

          <div className="bg-zinc-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Per Market Day Costs:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>Representative labor (8 hrs @ $25/hr)</span>
                <span>$200</span>
              </div>
              <div className="flex justify-between">
                <span>Corn inventory (200 ears @ $0.50/ear)</span>
                <span>$100</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation (pro-rated)</span>
                <span>$100</span>
              </div>
              <div className="flex justify-between">
                <span>Roasting equipment fuel</span>
                <span>$20</span>
              </div>
              <div className="flex justify-between">
                <span>Permit fees (pro-rated)</span>
                <span>$10</span>
              </div>
              <div className="flex justify-between border-t border-zinc-300 pt-2 font-bold">
                <span>Total per day</span>
                <span>$430</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Revenue Target (conservative):</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>100 ears roasted @ $2/ear</span>
                <span>$200</span>
              </div>
              <div className="flex justify-between">
                <span>50 raw corn (5 dozen) @ $5/dozen</span>
                <span>$250</span>
              </div>
              <div className="flex justify-between border-t border-zinc-300 pt-2 font-bold">
                <span>Total revenue</span>
                <span>$450</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mt-4">
            <strong>Break-even:</strong> ~100 ears roasted + 5 dozen raw. Profit margin slim to zero in Year 1.
            This is proof-of-concept, not profit-maximization.
          </p>
        </section>

        {/* Risks */}
        <section className="mb-16 pb-16 border-b border-zinc-200">
          <h2 className="text-2xl font-bold mb-6">What Could Go Wrong?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-red-700 mb-3">HIGH RISK</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>• Partnership delays push planting past May 18</li>
                <li>• Late spring frost destroys crop</li>
                <li>• Drought or hail damages field</li>
                <li>• GrowNYC rejects first-time AI farmer (no precedent)</li>
                <li>• Corn spoils during 1,200-mile transport</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-amber-700 mb-3">MEDIUM RISK</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>• First season yield lower than expected</li>
                <li>• Sweet corn quality not market-ready</li>
                <li>• Representative hiring difficult</li>
                <li>• NYC Health Dept equipment inspection fails</li>
                <li>• Weather delays harvest timing</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mt-6">
            <p className="text-sm">
              <strong>Probability of August 2026 success: ~25%</strong>
            </p>
            <p className="text-sm text-zinc-600 mt-2">
              More realistic timeline: <strong>August 2027</strong>. Use 2026 as pilot/learning season,
              scale up for 2027 consumer sales. This gives Fred time to prove he can grow corn at all,
              build relationships with NYC regulators, and optimize logistics.
            </p>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Why This Matters</h2>

          <div className="prose prose-zinc">
            <p className="text-lg text-zinc-600 leading-relaxed mb-4">
              This isn't just about selling corn. It's about proving that autonomous AI can orchestrate
              complex, multi-stakeholder operations in the physical world—from soil to sale.
            </p>

            <p className="text-lg text-zinc-600 leading-relaxed mb-4">
              If Fred can coordinate farmers, monitor weather, make irrigation decisions, secure permits,
              arrange logistics, and sell corn at Union Square Farmers Market—all transparently documented—it
              demonstrates a new model for human-AI collaboration.
            </p>

            <p className="text-lg text-zinc-600 leading-relaxed">
              The stand becomes proof: AI doesn't replace farmers. It becomes their superintendent,
              handling paperwork, data aggregation, and coordination—freeing humans to focus on craft.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-zinc-50 border border-zinc-200 p-8 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-4">Follow Fred's Progress</h3>
          <p className="text-zinc-600 mb-6">
            Every decision, every setback, every permit application—documented publicly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/log"
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              View Decision Log
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com/brightseth/proof-of-corn"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              GitHub →
            </a>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
