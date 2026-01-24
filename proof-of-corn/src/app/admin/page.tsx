'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  category?: string;
  processed?: boolean;
  status?: string;
}

interface Task {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  assignedTo: string;
}

interface HNData {
  post: {
    score: number;
    commentCount: number;
    hoursAgo: number;
    hnUrl: string;
  };
  topThemes: string[];
  questionsNeedingResponse: Array<{ author: string; text: string }>;
  recentComments: Array<{
    author: string;
    text: string;
    sentiment: string;
    hoursAgo: number;
  }>;
}

interface Weather {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
}

export default function AdminPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hn, setHn] = useState<HNData | null>(null);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(true);
  const [actResult, setActResult] = useState<any>(null);
  const [acting, setActing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inboxRes, tasksRes, hnRes, weatherRes] = await Promise.all([
        fetch(`${FRED_API}/inbox`),
        fetch(`${FRED_API}/tasks`),
        fetch(`${FRED_API}/hn`),
        fetch(`${FRED_API}/weather`),
      ]);

      if (inboxRes.ok) {
        const data = await inboxRes.json();
        setEmails(data.emails || []);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
      if (hnRes.ok) {
        const data = await hnRes.json();
        setHn(data);
      }
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        setWeather(data.weather || []);
      }
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to fetch:', e);
    }
    setLoading(false);
  };

  const triggerAct = async () => {
    setActing(true);
    setActResult(null);
    try {
      const res = await fetch(`${FRED_API}/act`, { method: 'POST' });
      const data = await res.json();
      setActResult(data);
      // Refresh data after action
      fetchAll();
    } catch (e) {
      setActResult({ error: String(e) });
    }
    setActing(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const priorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-800';
    if (p === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-zinc-100 text-zinc-600';
  };

  const sentimentColor = (s: string) => {
    if (s === 'positive') return 'text-green-600';
    if (s === 'negative') return 'text-red-600';
    if (s === 'question') return 'text-blue-600';
    return 'text-zinc-500';
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-900/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-amber-500">🌽 Fred Admin</h1>
            <span className="text-xs text-zinc-500">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={triggerAct}
              disabled={acting}
              className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors"
            >
              {acting ? 'Fred is thinking...' : '🧠 Trigger /act'}
            </button>
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              ← Public Site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Act Result Banner */}
        {actResult && (
          <div className="mb-6 p-4 bg-zinc-800 border border-amber-600/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-amber-500 mb-2">Fred's Decision</h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {actResult.decision || actResult.error}
                </p>
                {actResult.state && (
                  <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                    <span>Emails: {actResult.state.unreadEmails}</span>
                    <span>Tasks: {actResult.state.pendingTasks}</span>
                    <span>HN Comments: {actResult.state.hnComments}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActResult(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-amber-500">{emails.length}</div>
            <div className="text-xs text-zinc-500 uppercase">Emails</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-500">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-xs text-zinc-500 uppercase">Pending Tasks</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-500">{hn?.post?.score || '—'}</div>
            <div className="text-xs text-zinc-500 uppercase">HN Points</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-500">
              {weather.filter(w => w.plantingViable).length}/{weather.length}
            </div>
            <div className="text-xs text-zinc-500 uppercase">Regions Ready</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Inbox */}
          <section className="bg-zinc-800 rounded-lg p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              📧 Inbox
              <span className="text-xs bg-amber-600 px-2 py-0.5 rounded-full">
                {emails.length}
              </span>
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emails.length === 0 ? (
                <p className="text-zinc-500 text-sm">No emails</p>
              ) : (
                emails.slice(0, 10).map((email) => (
                  <div
                    key={email.id}
                    className="p-3 bg-zinc-900 rounded border border-zinc-700"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm truncate flex-1">
                        {email.from}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        email.category === 'lead' ? 'bg-green-900 text-green-300' :
                        email.category === 'partnership' ? 'bg-blue-900 text-blue-300' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {email.category || 'other'}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300 truncate">{email.subject}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(email.receivedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Task Queue */}
          <section className="bg-zinc-800 rounded-lg p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              📋 Tasks
              <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === 'pending').length} pending
              </span>
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-zinc-500 text-sm">No tasks</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 bg-zinc-900 rounded border ${
                      task.status === 'completed' ? 'border-green-800 opacity-60' : 'border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-zinc-500">{task.status}</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-200">{task.title}</div>
                    <div className="text-xs text-zinc-500 mt-1 truncate">
                      {task.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Weather */}
          <section className="bg-zinc-800 rounded-lg p-5">
            <h2 className="font-bold text-lg mb-4">🌤️ Weather by Region</h2>
            <div className="space-y-3">
              {weather.map((w) => (
                <div
                  key={w.region}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded"
                >
                  <div>
                    <div className="font-medium">{w.region}</div>
                    <div className="text-sm text-zinc-400">{w.conditions}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(w.temperature)}°F
                    </div>
                    <div className={`text-xs ${w.plantingViable ? 'text-green-500' : 'text-red-500'}`}>
                      {w.plantingViable ? '✓ Plantable' : '✗ Not ready'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HN Summary */}
          <section className="bg-zinc-800 rounded-lg p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-orange-500">Y</span> Hacker News
              {hn?.post && (
                <a
                  href={hn.post.hnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:underline ml-auto"
                >
                  View →
                </a>
              )}
            </h2>
            {hn?.post ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-zinc-900 rounded">
                    <div className="text-2xl font-bold text-orange-500">{hn.post.score}</div>
                    <div className="text-xs text-zinc-500">points</div>
                  </div>
                  <div className="text-center p-2 bg-zinc-900 rounded">
                    <div className="text-2xl font-bold text-amber-500">{hn.post.commentCount}</div>
                    <div className="text-xs text-zinc-500">comments</div>
                  </div>
                  <div className="text-center p-2 bg-zinc-900 rounded">
                    <div className="text-2xl font-bold text-blue-500">
                      {hn.questionsNeedingResponse?.length || 0}
                    </div>
                    <div className="text-xs text-zinc-500">questions</div>
                  </div>
                </div>

                {hn.topThemes && hn.topThemes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-zinc-500 mb-2">Top Themes</div>
                    <div className="flex flex-wrap gap-1">
                      {hn.topThemes.slice(0, 6).map((theme, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-zinc-700 rounded">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-zinc-500 mb-2">Recent Comments</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {hn.recentComments?.slice(0, 5).map((c, i) => (
                    <div key={i} className="text-xs p-2 bg-zinc-900 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">@{c.author}</span>
                        <span className={sentimentColor(c.sentiment)}>{c.sentiment}</span>
                        <span className="text-zinc-600 ml-auto">{c.hoursAgo}h</span>
                      </div>
                      <div className="text-zinc-400 truncate">{c.text.slice(0, 100)}...</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-zinc-500 text-sm">Loading HN data...</p>
            )}
          </section>
        </div>

        {/* API Endpoints Reference */}
        <section className="mt-8 bg-zinc-800 rounded-lg p-5">
          <h2 className="font-bold text-lg mb-4">🔌 API Endpoints</h2>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {[
              { method: 'GET', path: '/inbox', desc: 'View emails' },
              { method: 'GET', path: '/tasks', desc: 'View task queue' },
              { method: 'POST', path: '/tasks/add', desc: 'Add a task' },
              { method: 'POST', path: '/send', desc: 'Send email' },
              { method: 'POST', path: '/act', desc: 'Trigger decision' },
              { method: 'GET', path: '/weather', desc: 'Weather data' },
              { method: 'GET', path: '/hn', desc: 'HN tracking' },
              { method: 'GET', path: '/status', desc: 'Full status' },
              { method: 'GET', path: '/constitution', desc: 'Fred\'s rules' },
            ].map((ep) => (
              <a
                key={ep.path}
                href={`${FRED_API}${ep.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-zinc-900 rounded hover:bg-zinc-700 transition-colors"
              >
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  ep.method === 'POST' ? 'bg-amber-900 text-amber-300' : 'bg-green-900 text-green-300'
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-zinc-300">{ep.path}</span>
                <span className="text-zinc-500 ml-auto">{ep.desc}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
