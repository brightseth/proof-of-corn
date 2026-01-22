import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Story | Proof of Corn",
  description: "How a walk in San Francisco sparked a challenge to prove AI can grow corn.",
};

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold hover:text-amber-500 transition-colors">
            PROOF OF CORN
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/story" className="text-white">Story</Link>
            <Link href="/log" className="hover:text-white transition-colors">Log</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-500 text-sm font-mono tracking-widest mb-4">
            THE ORIGIN
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            A Walk in San Francisco
          </h1>
          <p className="text-xl text-zinc-400">
            January 21, 2026 — House of Nanking to the Embarcadero
          </p>
        </div>
      </section>

      {/* The Story */}
      <article className="px-6 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">

          <p className="text-xl text-zinc-300 leading-relaxed">
            It started with dinner. House of Nanking on Kearny Street, around 8pm on a
            Wednesday night. The kind of San Francisco evening where the fog hasn&apos;t
            rolled in yet and the city still feels electric.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            <a href="https://x.com/fredwilson" className="text-amber-500 hover:text-amber-400" target="_blank" rel="noopener noreferrer">@fredwilson</a> and
            I walked from the restaurant toward his hotel at 1 Hotel San Francisco
            by the Embarcadero. We&apos;d been talking about AI — not the hype, but the
            reality. What it can actually do. What it can&apos;t.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            Fred&apos;s been in tech for decades. He&apos;s seen every wave. And he had a
            point that cut through all the noise:
          </p>

          <blockquote className="border-l-4 border-amber-500 pl-6 my-12 text-2xl text-zinc-300 italic">
            &ldquo;Well, you can&apos;t grow corn.&rdquo;
          </blockquote>

          <p className="text-lg text-zinc-400 leading-relaxed">
            It was a simple statement. AI can write code. AI can generate images.
            AI can pass the bar exam. But can it affect the physical world? Can it
            make something actually grow?
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            The argument is that there&apos;s a gap between digital and physical that AI
            can&apos;t cross. Code doesn&apos;t water plants. Prompts don&apos;t drive tractors.
            Language models don&apos;t know when to harvest.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6">The Response</h2>

          <p className="text-lg text-zinc-400 leading-relaxed">
            I got home that night and opened Claude Code. Not to prove Fred wrong —
            but to explore whether he might be missing something.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            The insight isn&apos;t that AI needs to drive a tractor. It&apos;s that AI can
            orchestrate the systems and people who do. A farm manager doesn&apos;t personally
            plant every seed — they aggregate data, make decisions, coordinate contractors,
            and ensure the outcome.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            What if Claude Code became that farm manager?
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6">My Dinner with AI</h2>

          <p className="text-lg text-zinc-400 leading-relaxed">
            There&apos;s something almost <em>My Dinner with Andre</em> about this moment
            we&apos;re living through. Two people walking through a city, having a
            conversation that seems philosophical but is actually deeply practical.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            Except now, the conversation doesn&apos;t end at the hotel lobby. It continues
            with a collaborator that never sleeps, that can research Iowa farm leases
            at midnight, that can write decision-making algorithms while you sleep,
            that can register a domain and deploy a website before you&apos;ve finished
            your coffee the next morning.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            This is what vibe coding actually means. It&apos;s not about prompting AI to
            generate code. It&apos;s about having an idea — born from a real conversation
            with a real friend on a real street — and then collaborating with AI to
            bring it into existence.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            The prompt wasn&apos;t &ldquo;generate a website.&rdquo; The prompt was a challenge
            from a friend. The website, the domain, the IoT architecture, the custom
            farming contracts, the decision engine — all of that emerged from the
            collaboration.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6">What We&apos;re Proving</h2>

          <p className="text-lg text-zinc-400 leading-relaxed">
            This project isn&apos;t just about growing corn. It&apos;s about documenting what
            happens when you take AI seriously as a collaborator rather than a tool.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            Every decision will be logged. Every API call documented. Every dollar
            tracked. When we harvest corn in October, we&apos;ll have a complete record
            of how an idea became a reality — with AI as the orchestration layer.
          </p>

          <p className="text-lg text-zinc-400 leading-relaxed mt-6">
            Fred, this one&apos;s for you.
          </p>

          <div className="mt-16 pt-8 border-t border-zinc-800">
            <p className="text-zinc-500">
              — <a href="https://x.com/seth" className="text-amber-500 hover:text-amber-400" target="_blank" rel="noopener noreferrer">@seth</a>
              <br />
              <span className="text-sm">January 22, 2026</span>
            </p>
          </div>

        </div>
      </article>

      {/* Timeline Callout */}
      <section className="px-6 py-16 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">The Timeline</h2>
          <p className="text-zinc-400 mb-8">
            From conversation to corn. Every step documented.
          </p>
          <div className="inline-flex gap-4">
            <Link
              href="/log"
              className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              View the Log
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-zinc-700 text-white font-semibold rounded-lg hover:border-zinc-500 transition-colors"
            >
              See the Plan
            </Link>
          </div>
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
        </div>
      </footer>
    </div>
  );
}
