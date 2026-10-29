const HN_URL = 'https://news.ycombinator.com/item?id=46735511';

export function HNMilestone() {
  return (
    <section className="px-6 py-6 border-b border-zinc-200 bg-white">
      <div className="max-w-2xl mx-auto">
        <a
          href={HN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
          <span className="font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
            #1 on Hacker News
          </span>
          <span className="font-mono text-sm text-zinc-500">
            476 points &middot; 307 comments &middot; Jan 23, 2026
          </span>
          <span className="text-sm text-amber-600 group-hover:underline">Read the thread &rarr;</span>
        </a>
      </div>
    </section>
  );
}
