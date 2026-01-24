'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HNData {
  post: {
    score: number;
    commentCount: number;
    hoursAgo: number;
    hnUrl: string;
  };
  topThemes: string[];
  questionsNeedingResponse: Array<{ author: string; text: string }>;
}

interface WorkerMetrics {
  totalChecks: number;
  lastCheck: string;
  weatherCached: boolean;
}

interface TrafficData {
  estimatedPageviews: number;
  estimatedVisitors: number;
  apiRequestsJan23: number;
  note: string;
}

interface Stats {
  hn: HNData | null;
  worker: WorkerMetrics | null;
  traffic: TrafficData | null;
  loading: boolean;
  error: string | null;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    hn: null,
    worker: null,
    traffic: null,
    loading: true,
    error: null,
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      // Fetch HN data
      const hnRes = await fetch('https://farmer-fred.sethgoldstein.workers.dev/hn');
      const hnData = hnRes.ok ? await hnRes.json() : null;

      // Fetch worker status
      const statusRes = await fetch('https://farmer-fred.sethgoldstein.workers.dev/status');
      const statusData = statusRes.ok ? await statusRes.json() : null;

      // Track this page load
      await fetch('https://farmer-fred.sethgoldstein.workers.dev/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'stats_page_view' }),
      }).catch(() => {}); // Ignore errors

      // Fetch aggregated analytics
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

      setStats({
        hn: hnData,
        worker: statusData ? {
          totalChecks: statusData.recentLogs?.length || 0,
          lastCheck: statusData.lastDailyCheck?.timestamp || 'Never',
          weatherCached: !!statusData.weather,
        } : null,
        traffic: analyticsData?.traffic || null,
        loading: false,
        error: null,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setStats(prev => ({ ...prev, loading: false, error: 'Failed to fetch stats' }));
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-amber-500 hover:text-amber-400 font-mono text-sm">
            ← proofofcorn.com
          </Link>
          <span className="text-zinc-500 text-xs font-mono">
            LIVE STATS
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Proof of Corn Stats</h1>
        <p className="text-zinc-500 mb-8">
          Real-time metrics • Last updated: {lastUpdated.toLocaleTimeString()}
          <button
            onClick={fetchStats}
            className="ml-3 text-amber-500 hover:text-amber-400 text-sm"
          >
            Refresh
          </button>
        </p>

        {stats.loading ? (
          <div className="text-zinc-500">Loading stats...</div>
        ) : stats.error ? (
          <div className="text-red-500">{stats.error}</div>
        ) : (
          <div className="space-y-8">
            {/* HN Stats */}
            <section className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-500">Y</span> Hacker News
                {stats.hn?.post && (
                  <a
                    href={stats.hn.post.hnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-300 ml-auto"
                  >
                    View on HN →
                  </a>
                )}
              </h2>

              {stats.hn?.post ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900 rounded p-4">
                    <div className="text-3xl font-bold text-orange-500">
                      {stats.hn.post.score}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Points
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded p-4">
                    <div className="text-3xl font-bold text-amber-500">
                      {stats.hn.post.commentCount}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Comments
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded p-4">
                    <div className="text-3xl font-bold text-zinc-300">
                      {stats.hn.post.hoursAgo}h
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Age
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded p-4">
                    <div className="text-3xl font-bold text-green-500">
                      {stats.hn.questionsNeedingResponse?.length || 0}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Unanswered Qs
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500">Unable to fetch HN data</div>
              )}

              {stats.hn?.topThemes && stats.hn.topThemes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                    Top Discussion Themes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.hn.topThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-zinc-700 rounded text-sm text-zinc-300"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Farmer Fred Stats */}
            <section className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🌽 Farmer Fred Agent
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-2xl font-bold text-green-500">
                    Operational
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    Status
                  </div>
                </div>
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-2xl font-bold text-zinc-300">
                    6:00 AM UTC
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    Daily Check
                  </div>
                </div>
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-2xl font-bold text-zinc-300">
                    3
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    Regions Monitored
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-700 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Iowa:</span>
                  <span className="ml-2 text-blue-400">Frozen (wait)</span>
                </div>
                <div>
                  <span className="text-zinc-500">Texas:</span>
                  <span className="ml-2 text-green-400">Planting window</span>
                </div>
                <div>
                  <span className="text-zinc-500">Argentina:</span>
                  <span className="ml-2 text-amber-400">Research</span>
                </div>
              </div>
            </section>

            {/* Traffic Stats */}
            <section className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h2 className="text-lg font-semibold mb-4">📊 Traffic Estimates</h2>
              <p className="text-zinc-500 text-sm mb-4">
                Based on HN score (~75 pageviews per point typical for #1 posts)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-3xl font-bold text-green-500">
                    {stats.traffic?.estimatedPageviews?.toLocaleString() || '—'}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    Est. Pageviews
                  </div>
                </div>
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-3xl font-bold text-blue-500">
                    {stats.traffic?.estimatedVisitors?.toLocaleString() || '—'}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    Est. Visitors
                  </div>
                </div>
                <div className="bg-zinc-900 rounded p-4">
                  <div className="text-3xl font-bold text-purple-500">
                    {stats.traffic?.apiRequestsJan23?.toLocaleString() || '114,523'}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                    API Requests (Jan 23)
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mt-4">
                {stats.traffic?.note || 'See Vercel dashboard for exact metrics.'}
              </p>
              <p className="text-xs text-zinc-600 mt-2">
                Exact metrics:{' '}
                <a
                  href="https://vercel.com/slashvibe/proof-of-corn/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  Vercel Analytics Dashboard →
                </a>
              </p>
            </section>

            {/* Quick Links */}
            <section className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://vercel.com/slashvibe/proof-of-corn/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
              >
                Vercel Analytics →
              </a>
              <a
                href="https://dash.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
              >
                Cloudflare Dashboard →
              </a>
              <a
                href="https://farmer-fred.sethgoldstein.workers.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
              >
                Fred API →
              </a>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 px-6 py-6 mt-12">
        <div className="max-w-4xl mx-auto text-sm text-zinc-600">
          <p>
            Data refreshes every 30 seconds. HN data from{' '}
            <a href="https://github.com/HackerNews/API" className="text-zinc-500 hover:text-zinc-400">
              HN API
            </a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
