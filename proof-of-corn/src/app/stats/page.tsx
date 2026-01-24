'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';

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

interface TrafficData {
  estimatedPageviews: number;
  estimatedVisitors: number;
  apiRequestsJan23: number;
  note: string;
}

interface Stats {
  hn: HNData | null;
  traffic: TrafficData | null;
  loading: boolean;
  error: string | null;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    hn: null,
    traffic: null,
    loading: true,
    error: null,
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const [hnRes, analyticsRes] = await Promise.all([
        fetch('https://farmer-fred.sethgoldstein.workers.dev/hn'),
        fetch('/api/analytics'),
      ]);

      const hnData = hnRes.ok ? await hnRes.json() : null;
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

      setStats({
        hn: hnData,
        traffic: analyticsData?.traffic || null,
        loading: false,
        error: null,
      });
      setLastUpdated(new Date());
    } catch {
      setStats(prev => ({ ...prev, loading: false, error: 'Failed to fetch stats' }));
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout title="Live Stats" subtitle="Real-time metrics from Hacker News and Farmer Fred">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Last updated */}
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <button
              onClick={fetchStats}
              className="text-amber-600 hover:text-amber-700"
            >
              Refresh
            </button>
          </div>

          {stats.loading ? (
            <div className="text-zinc-500 py-12 text-center">Loading stats...</div>
          ) : stats.error ? (
            <div className="text-red-600 py-12 text-center">{stats.error}</div>
          ) : (
            <>
              {/* HN Stats */}
              <section className="bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-orange-500">Y</span> Hacker News
                  </h2>
                  {stats.hn?.post && (
                    <a
                      href={stats.hn.post.hnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-600 hover:underline"
                    >
                      View on HN →
                    </a>
                  )}
                </div>

                {stats.hn?.post ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-zinc-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {stats.hn.post.score}
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                          Points
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-amber-600">
                          {stats.hn.post.commentCount}
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                          Comments
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-zinc-700">
                          {stats.hn.post.hoursAgo}h
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                          Age
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {stats.hn.questionsNeedingResponse?.length || 0}
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                          Unanswered
                        </div>
                      </div>
                    </div>

                    {stats.hn.topThemes && stats.hn.topThemes.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-zinc-100">
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
                          Discussion Themes
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stats.hn.topThemes.map((theme, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-zinc-500 text-center py-8">
                    Unable to fetch HN data
                  </div>
                )}
              </section>

              {/* Farmer Fred Status */}
              <section className="bg-white border border-zinc-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">🌽 Farmer Fred</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-semibold text-green-600">
                      Operational
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Status
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-semibold text-zinc-700">
                      6:00 AM UTC
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Daily Check
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-semibold text-zinc-700">
                      3
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Regions
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-zinc-600">Iowa:</span>
                    <span className="text-zinc-900">Frozen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-zinc-600">Texas:</span>
                    <span className="text-zinc-900">Planting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-zinc-600">Argentina:</span>
                    <span className="text-zinc-900">Research</span>
                  </div>
                </div>
              </section>

              {/* Traffic Estimates */}
              <section className="bg-white border border-zinc-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">📊 Traffic Estimates</h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Based on HN performance (~75 pageviews per point for #1 posts)
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-zinc-700">
                      {stats.traffic?.estimatedPageviews?.toLocaleString() || '—'}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Est. Pageviews
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-zinc-700">
                      {stats.traffic?.estimatedVisitors?.toLocaleString() || '—'}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      Est. Visitors
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-zinc-700">
                      114k
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                      API Requests (Jan 23)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mt-4">
                  Exact metrics:{' '}
                  <a
                    href="https://vercel.com/slashvibe/proof-of-corn/analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:underline"
                  >
                    Vercel Analytics →
                  </a>
                </p>
              </section>

              {/* Quick Links */}
              <section className="flex flex-wrap gap-3 text-sm">
                <a
                  href="https://vercel.com/slashvibe/proof-of-corn/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
                >
                  Vercel Analytics →
                </a>
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
                >
                  Cloudflare Dashboard →
                </a>
                <a
                  href="https://farmer-fred.sethgoldstein.workers.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
                >
                  Fred API →
                </a>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
