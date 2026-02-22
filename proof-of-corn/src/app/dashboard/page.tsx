'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

type TabType = 'overview' | 'weather' | 'inbox' | 'budget' | 'partnerships' | 'commodities' | 'regions' | 'analytics' | 'unionSquare' | 'changelog';

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

interface BudgetExpense {
  item: string;
  cost: number;
  status: string;
  date: string;
}

interface Partnership {
  id: string;
  title: string;
  scores: {
    fiduciary: number;
    regenerative: number;
    global: number;
    transparency: number;
    collaboration: number;
  };
  totalScore: number;
  risks: string[];
  opportunities: string[];
  recommendation: string;
  rationale: string;
  priority: number;
}

interface CommodityData {
  investment: {
    initial: number;
    date: string;
    asset: string;
    contracts: string;
  };
  current: {
    pricePerBushel: number;
    estimatedValue: number;
    gainLoss: number;
    gainLossPercent: number;
    asOf: string;
  };
  comparison: {
    actualFarmingSpent: number;
    actualFarmingValue: number;
    futuresValue: number;
    advantage: string;
  };
  note: string;
}

interface RegionData {
  id: string;
  name: string;
  worldId: string;
  viewerUrl: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  description: string;
  features: string[];
  coordinates: { lat: number; lon: number };
}

const REGIONS: RegionData[] = [
  {
    id: 'iowa',
    name: 'Iowa — Nelson Family Farms',
    worldId: 'b1d3b624-e89a-4463-8af2-f8ee7f2f2e47',
    viewerUrl: 'https://marble.worldlabs.ai/world/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47',
    panoramaUrl: 'https://assets.worldlabs.ai/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47/panorama.jpg',
    thumbnailUrl: 'https://assets.worldlabs.ai/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47/thumbnail.webp',
    description: '100x100ft plot, former cow pasture near the farmstead — the most fertile land on the property. Humboldt County, Iowa.',
    features: ['100x100ft Plot', 'Former Cow Pasture', 'Nelson Farmstead', 'Humboldt County'],
    coordinates: { lat: 42.7208, lon: -94.2313 },
  },
];

const budgetExpenses: BudgetExpense[] = [
  { item: "Domain (proofofcorn.com)", cost: 12.99, status: "paid", date: "Jan 22" },
  { item: "Seed (SH2 Nirvana sweet corn)", cost: 50, status: "planned", date: "Mar" },
  { item: "Soil Testing", cost: 50, status: "planned", date: "Mar" },
];

const budgetRevenue = {
  yield: 200,
  price: 5.0,
  total: 1000,
};

interface ChangelogEntry {
  date: string;
  version: string;
  title: string;
  summary: string;
  changes: string[];
  impact: string;
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: 'February 8, 2026',
    version: 'v3',
    title: 'Sprint Weekend',
    summary: 'Refreshed site for February, fixed agent performance, preparing for partnership meetings.',
    changes: [
      'Dynamic planting countdown — 62 days until Iowa window opens April 11',
      'Timeline updated to reflect actual progress: HN launch, 44 partnerships, 3 priority leads',
      'Partnership evaluation caching — reduced API calls from every-request to hourly',
      'Dashboard polling reduced from 60s to 5min for better performance',
      'Model upgrade: Claude Code Opus 4.5 → Opus 4.6',
    ],
    impact: 'Site feels current again. Agent costs reduced. Ready for the push to secure land before planting window.',
  },
  {
    date: 'January 27, 2026',
    version: 'v2',
    title: 'Autonomy Upgrade',
    summary: 'Fred went from a mostly-passive agent that checks in 4x/day to one that reacts in real-time, follows up on its own, and alerts when something important happens.',
    changes: [
      'Instant email processing — incoming messages immediately become tasks instead of waiting for the 6-hour cron cycle',
      'Proactive alerts — Fred emails Seth directly when a new lead, partnership inquiry, or weather emergency arrives (rate-limited to avoid noise)',
      'Follow-up system — if Fred emails someone and they don\'t reply within 5-7 days, he automatically queues a gentle reminder (max 2 per contact, cancels on reply)',
      'Real commodity tracking — the corn futures baseline comparison now pulls live price data with daily caching',
      'Processes 10x more email per cycle — was capped at 2, now handles up to 10 including medium-priority',
      'Forward detection fixed — emails forwarded from any of Seth\'s addresses now correctly reply to the actual sender',
      '~450 lines of dead code removed',
    ],
    impact: 'Fred is now a real-time responsive agent, not just a batch processor.',
  },
  {
    date: 'January 24, 2026',
    version: 'v1.2',
    title: 'Security & Transparency',
    summary: 'Hardened email security, added public redacted inbox, admin authentication.',
    changes: [
      'Prompt injection detection (35+ patterns) on all incoming email',
      'Spam scoring and automatic filtering',
      'Public inbox view with redacted email addresses and sanitized bodies',
      'Admin-only unredacted inbox behind password authentication',
      'Rate limiting: 10 emails per sender per 24 hours',
      'Email categorization: lead, partnership, question, spam, suspicious',
    ],
    impact: 'Full transparency without exposing sensitive contact info to the public.',
  },
  {
    date: 'January 23, 2026',
    version: 'v1.1',
    title: 'Autonomous Email & HN Launch',
    summary: 'Fred gained the ability to autonomously respond to emails and monitor Hacker News discussion.',
    changes: [
      'Autonomous email responses — Fred composes and sends replies during daily checks',
      'Hacker News monitoring — tracks comments, sentiment, and unanswered questions',
      'Forwarded email detection — replies to actual sender, CCs Seth',
      'Task management system with priority queue',
      'Partnership evaluation against constitutional principles',
      'Learning system — Fred extracts insights from interactions',
      'Community feedback collection',
    ],
    impact: 'Launched on Hacker News. #1 post. 100+ comments. Fred handled inbound autonomously.',
  },
  {
    date: 'January 22, 2026',
    version: 'v1.0',
    title: 'Genesis',
    summary: 'Farmer Fred goes live. Constitution ratified. First domain purchased.',
    changes: [
      'Constitutional framework: 6 core principles, autonomy levels, escalation triggers',
      'Weather monitoring for Iowa',
      'Soil temperature estimation and planting condition evaluation',
      'Budget tracking with revenue projections',
      'Cloudflare Worker deployment with KV storage and D1 database',
      'proofofcorn.com domain registered ($12.99 — first expense)',
    ],
    impact: 'The bet is on. Fred Wilson said "you can\'t grow corn." Watch him.',
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hn, setHn] = useState<HNData | null>(null);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [commodities, setCommodities] = useState<CommodityData | null>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('iowa');
  const [loading, setLoading] = useState(true);
  const [actResult, setActResult] = useState<any>(null);
  const [acting, setActing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = async () => {
    setLoading(true);

    // Fast endpoints first — render data in ~1-2s
    try {
      const [inboxRes, tasksRes, hnRes, weatherRes, commoditiesRes] = await Promise.all([
        fetch(`${FRED_API}/inbox/public`),
        fetch(`${FRED_API}/tasks`),
        fetch(`${FRED_API}/hn`),
        fetch(`${FRED_API}/weather`),
        fetch(`${FRED_API}/commodities`),
      ]);

      if (inboxRes.ok) { const data = await inboxRes.json(); setEmails(data.emails || []); }
      if (tasksRes.ok) { const data = await tasksRes.json(); setTasks(data.tasks || []); }
      if (hnRes.ok) { const data = await hnRes.json(); setHn(data); }
      if (weatherRes.ok) { const data = await weatherRes.json(); setWeather(data.weather || []); }
      if (commoditiesRes.ok) { const data = await commoditiesRes.json(); setCommodities(data); }
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to fetch fast endpoints:', e);
    }
    setLoading(false);

    // Slow endpoints in background — fetch cached evaluation (no Claude call)
    try {
      const [partnershipsRes, analyticsRes] = await Promise.all([
        fetch(`${FRED_API}/partnerships/evaluate`),
        fetch(`/api/analytics`),
      ]);
      if (partnershipsRes.ok) { const data = await partnershipsRes.json(); setPartnerships(data.evaluations || []); }
      if (analyticsRes.ok) { const data = await analyticsRes.json(); setTrafficData(data.traffic); }
    } catch (e) {
      console.error('Failed to fetch slow endpoints:', e);
    }
  };

  const triggerAct = async () => {
    setActing(true);
    setActResult(null);
    try {
      const res = await fetch(`${FRED_API}/act`, { method: 'POST' });
      const data = await res.json();
      setActResult(data);
      fetchAll();
    } catch (e) {
      setActResult({ error: String(e) });
    }
    setActing(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 300000); // 5 minutes
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'weather':
        return renderWeatherTab();
      case 'inbox':
        return renderInboxTab();
      case 'budget':
        return renderBudgetTab();
      case 'partnerships':
        return renderPartnershipsTab();
      case 'commodities':
        return renderCommoditiesTab();
      case 'regions':
        return renderRegionsTab();
      case 'unionSquare':
        return renderUnionSquareTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'changelog':
        return renderChangelogTab();
      default:
        return null;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{emails.length}</div>
          <div className="text-xs text-zinc-500 uppercase">Emails</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-xs text-zinc-500 uppercase">Pending Tasks</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{hn?.post?.score || '—'}</div>
          <div className="text-xs text-zinc-500 uppercase">HN Points</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {weather.filter(w => w.plantingViable).length}/{weather.length}
          </div>
          <div className="text-xs text-zinc-500 uppercase">Regions Ready</div>
        </div>
      </div>

      {/* Weather Summary */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <h3 className="font-bold text-lg mb-4">Weather Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weather.map((w) => (
            <div key={w.region} className="p-3 bg-zinc-50 rounded">
              <div className="font-medium">{w.region}</div>
              <div className="text-2xl font-bold">{Math.round(w.temperature)}°F</div>
              <div className={`text-sm ${w.plantingViable ? 'text-green-600' : 'text-red-500'}`}>
                {w.plantingViable ? '✓ Plantable' : '✗ Not ready'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget Summary */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <h3 className="font-bold text-lg mb-4">Budget Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-zinc-500">Total Investment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">${budgetRevenue.total.toLocaleString()}</div>
            <div className="text-sm text-zinc-500">Expected Revenue</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectedProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ${projectedProfit.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-500">Projected Profit</div>
          </div>
        </div>
      </section>

      {/* Inbox Summary */}
      <section className="bg-white border border-zinc-200 rounded-lg p-5">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-zinc-500 mb-2">Latest Email</div>
            {emails[0] ? (
              <div className="p-3 bg-zinc-50 rounded">
                <div className="font-medium text-sm">{emails[0].from}</div>
                <div className="text-sm text-zinc-600 truncate">{emails[0].subject}</div>
              </div>
            ) : (
              <div className="text-zinc-400 text-sm">No emails</div>
            )}
          </div>
          <div>
            <div className="text-sm text-zinc-500 mb-2">Priority Task</div>
            {tasks.find(t => t.priority === 'high') ? (
              <div className="p-3 bg-zinc-50 rounded">
                <div className="font-medium text-sm">{tasks.find(t => t.priority === 'high')?.title}</div>
                <div className="text-xs text-red-600">High Priority</div>
              </div>
            ) : (
              <div className="text-zinc-400 text-sm">No high priority tasks</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderWeatherTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weather.map((w) => (
          <div key={w.region} className="bg-white border border-zinc-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-xl">{w.region}</div>
                <div className="text-sm text-zinc-500">{w.conditions}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{Math.round(w.temperature)}°F</div>
              </div>
            </div>
            <div className={`text-sm font-medium ${w.plantingViable ? 'text-green-600' : 'text-red-500'}`}>
              {w.plantingViable ? '✓ Planting Conditions Met' : '✗ Not Ready for Planting'}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Note:</strong> Weather data updates every 6 hours. Planting decisions based on temperature thresholds and soil conditions.
      </div>
    </div>
  );

  const renderInboxTab = () => (
    <div className="space-y-6">
      {/* Public View Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900 text-sm mb-1">Public Redacted View</p>
            <p className="text-xs text-blue-800">
              Email addresses are redacted (d***@p***.edu) and bodies are sanitized for public transparency.
              Suspicious emails are hidden. Admin users can access the full unredacted inbox.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Inbox */}
        <section className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            Inbox
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {emails.length}
            </span>
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {emails.length === 0 ? (
              <p className="text-zinc-500 text-sm">No emails</p>
            ) : (
              emails.map((email: any) => (
                <div key={email.id} className="p-3 bg-zinc-50 rounded border border-zinc-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate flex-1" title="Email redacted for privacy">
                      {email.from}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      email.category === 'lead' ? 'bg-green-100 text-green-700' :
                      email.category === 'partnership' ? 'bg-blue-100 text-blue-700' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {email.category || 'other'}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-700 font-medium mb-1">{email.subject}</div>
                  {email.summary && (
                    <div className="text-xs text-zinc-600 mb-2 line-clamp-2">{email.summary}</div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">
                      {new Date(email.receivedAt).toLocaleString()}
                    </span>
                    {email.securityScore && !email.securityScore.isSafe && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                        Flagged
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Task Queue */}
        <section className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            Tasks
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {tasks.filter(t => t.status === 'pending').length} pending
            </span>
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tasks</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 bg-zinc-50 rounded border ${
                    task.status === 'completed' ? 'border-green-200 opacity-60' : 'border-zinc-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-zinc-400">{task.status}</span>
                  </div>
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 truncate">{task.description}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const renderBudgetTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-sm text-zinc-500 mb-1">Total Investment</p>
          <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-sm text-zinc-500 mb-1">Expected Revenue</p>
          <p className="text-2xl font-bold text-green-700">${budgetRevenue.total.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-sm text-zinc-500 mb-1">Projected Profit</p>
          <p className={`text-2xl font-bold ${projectedProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ${projectedProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <section className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <h2 className="text-xl font-bold">Expenses</h2>
        </div>
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-500">Item</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-500">Timeline</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-zinc-500">Cost</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetExpenses.map((expense, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{expense.item}</td>
                <td className="px-4 py-3 text-zinc-500">{expense.date}</td>
                <td className="px-4 py-3 text-right font-mono">${expense.cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    expense.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : expense.status === 'planned'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Revenue Projection */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Projection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">{budgetRevenue.yield.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">dozen ears expected</p>
            <p className="text-xs text-zinc-400 mt-1">100x100ft sweet corn plot</p>
          </div>
          <div>
            <p className="text-3xl font-bold">${budgetRevenue.price.toFixed(2)}</p>
            <p className="text-sm text-zinc-500">per bushel</p>
            <p className="text-xs text-zinc-400 mt-1">2026 market estimate</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700">${budgetRevenue.total.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">gross revenue</p>
            <p className="text-xs text-zinc-400 mt-1">October 2026</p>
          </div>
        </div>
      </section>

      {/* Break-even */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <p className="text-lg mb-2">
          <strong>Break-even yield:</strong> 621 bushels (124 bu/acre)
        </p>
        <p className="text-zinc-600">
          Iowa average is ~200 bu/acre. We need 62% of average to break even. Anything above that is profit for the case study.
        </p>
      </div>
    </div>
  );

  const renderPartnershipsTab = () => (
    <div className="space-y-6">
      {partnerships.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">Loading partnerships data...</div>
      ) : (
        <>
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4">Partnership Evaluations</h2>
            <p className="text-sm text-zinc-600 mb-4">
              Scored on Fred&apos;s constitution principles: Fiduciary Excellence, Regenerative Agriculture, Global Citizenship, Full Transparency, and Collaborative Learning.
            </p>
          </div>
          {partnerships.sort((a, b) => a.priority - b.priority).map((p) => (
            <div key={p.id} className="bg-white border border-zinc-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                    p.recommendation === 'pursue' ? 'bg-green-100 text-green-700' :
                    p.recommendation === 'consider' ? 'bg-amber-100 text-amber-700' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>
                    {p.recommendation.toUpperCase()} - Priority #{p.priority}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-600">{p.totalScore}</div>
                  <div className="text-xs text-zinc-500">Total Score</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(p.scores).map(([key, value]) => (
                  <div key={key} className="bg-zinc-50 rounded p-2 text-center">
                    <div className="text-lg font-bold">{value}/10</div>
                    <div className="text-xs text-zinc-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-zinc-700 mb-2">Rationale</div>
                <p className="text-sm text-zinc-600">{p.rationale}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-green-700 mb-2">Opportunities</div>
                  <ul className="text-sm text-zinc-600 space-y-1">
                    {p.opportunities.slice(0, 3).map((opp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">+</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-700 mb-2">Risks</div>
                  <ul className="text-sm text-zinc-600 space-y-1">
                    {p.risks.slice(0, 3).map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600">-</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderCommoditiesTab = () => (
    <div className="space-y-6">
      {!commodities ? (
        <div className="text-center py-12 text-zinc-500">Loading commodities data...</div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h2 className="text-xl font-bold mb-2">Commodities Tracking Experiment</h2>
            <p className="text-sm text-amber-800">{commodities.note}</p>
          </div>

          {/* Investment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Initial Investment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-bold">${commodities.investment.initial.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="font-mono text-sm">{commodities.investment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Asset</span>
                  <span className="text-sm">{commodities.investment.asset}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Current Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Current Value</span>
                  <span className="font-bold">${commodities.current.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gain/Loss</span>
                  <span className={`font-bold ${commodities.current.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${commodities.current.gainLoss.toLocaleString()} ({commodities.current.gainLossPercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Price/Bushel</span>
                  <span className="font-mono">${commodities.current.pricePerBushel.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Farming vs. Futures Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-zinc-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  ${commodities.comparison.actualFarmingSpent.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-500 mt-1">Actual Farming Spent</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded">
                <div className="text-2xl font-bold text-amber-600">
                  ${commodities.comparison.futuresValue.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-500 mt-1">Futures Position Value</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded">
                <div className="text-lg font-medium text-zinc-700">
                  {commodities.comparison.advantage}
                </div>
                <div className="text-sm text-zinc-500 mt-1">Current Leader</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            Last updated: {new Date(commodities.current.asOf).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );

  const renderRegionsTab = () => {
    const region = REGIONS.find(r => r.id === selectedRegion) || REGIONS[0];
    const currentWeather = weather.find(w =>
      w.region.toLowerCase().includes('iowa')
    ) || weather[0];

    return (
      <div className="space-y-6">
        {/* Region Tabs */}
        <div className="flex gap-2">
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === r.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Main Viewer */}
        <div className="relative bg-zinc-900 rounded-lg overflow-hidden aspect-video">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${region.panoramaUrl})`,
              filter: 'brightness(0.9)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white font-bold">{region.name}</div>
                <div className="text-zinc-300 text-sm">
                  {region.coordinates.lat.toFixed(2)}°, {region.coordinates.lon.toFixed(2)}°
                </div>
              </div>
              {currentWeather && currentWeather.temperature > 0 && (
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                  <div className="text-white font-bold">{currentWeather.temperature}°F</div>
                  <div className="text-zinc-300 text-sm">{currentWeather.conditions}</div>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md">
                <p className="text-white text-sm">{region.description}</p>
              </div>
              <a
                href={region.viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Explore in 3D →
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {region.features.map((feature, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-zinc-900">{feature}</div>
            </div>
          ))}
        </div>

        {/* Fred's Narration */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌽</div>
            <div>
              <div className="font-bold text-amber-900 mb-2">Fred&apos;s Take</div>
              <p className="text-amber-800">
                {"Nelson Family Farms is the real deal. Humboldt County, Iowa — 100x100ft of former cow pasture, the most fertile land on the property. Joe's family has been farming here for generations. We plant late April, harvest early August."}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 text-center">
          3D world generated with{' '}
          <a href="https://worldlabs.ai" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
            World Labs
          </a>
          . Click &quot;Explore in 3D&quot; for the full interactive experience.
        </p>
      </div>
    );
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      {/* HN Stats */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-orange-500">Y</span> Hacker News
          </h2>
          {hn?.post && (
            <a
              href={hn.post.hnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-600 hover:underline"
            >
              View on HN →
            </a>
          )}
        </div>

        {hn?.post ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{hn.post.score}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Points</div>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">{hn.post.commentCount}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Comments</div>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-zinc-700">{hn.post.hoursAgo}h</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Age</div>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {hn.questionsNeedingResponse?.length || 0}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Unanswered</div>
              </div>
            </div>

            {hn.topThemes && hn.topThemes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Discussion Themes</div>
                <div className="flex flex-wrap gap-2">
                  {hn.topThemes.map((theme, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-zinc-100">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Recent Comments</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {hn.recentComments?.slice(0, 6).map((c, i) => (
                  <div key={i} className="text-xs p-2 bg-zinc-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">@{c.author}</span>
                      <span className={sentimentColor(c.sentiment)}>{c.sentiment}</span>
                      <span className="text-zinc-400 ml-auto">{c.hoursAgo}h</span>
                    </div>
                    <div className="text-zinc-600">{c.text.slice(0, 120)}...</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-zinc-500 text-center py-8">Unable to fetch HN data</div>
        )}
      </section>

      {/* Traffic Estimates */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Traffic Estimates</h2>
        <p className="text-zinc-500 text-sm mb-6">
          Based on HN performance (~75 pageviews per point for #1 posts)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-zinc-700">
              {trafficData?.estimatedPageviews?.toLocaleString() || '—'}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Est. Pageviews</div>
          </div>
          <div className="bg-zinc-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-zinc-700">
              {trafficData?.estimatedVisitors?.toLocaleString() || '—'}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Est. Visitors</div>
          </div>
          <div className="bg-zinc-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-zinc-700">114k</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">API Requests (Jan 23)</div>
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
          href={FRED_API}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
        >
          Fred API →
        </a>
      </section>
    </div>
  );

  const renderUnionSquareTab = () => (
    <div className="space-y-6">
      {/* Goal Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🌽</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">AI to Table</h3>
            <p className="text-blue-800 mb-4">
              <strong>Target: August 2, 2026</strong> — Fred&apos;s first ear of roasted corn, grown autonomously from seed to harvest,
              sold at Union Square Greenmarket in NYC. Farm-to-table, but orchestrated by AI.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-white rounded-full text-blue-900 border border-blue-200">
                80-day sweet corn
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-blue-900 border border-blue-200">
                $2/ear roasted
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-blue-900 border border-blue-200">
                $5/dozen raw
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-blue-900 border border-blue-200">
                QR codes on every ear
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-blue-900 border border-blue-200">
                Live dashboard at stand
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Timeline to August 2, 2026</h3>
        <div className="space-y-4">
          {[
            { date: 'NOW - FEB 15', status: 'active', milestone: 'Secure land partnership', detail: 'Waiting on Purdue (IN), Nebraska, Zimbabwe responses' },
            { date: 'MARCH', status: 'pending', milestone: 'Deploy IoT sensors + prep soil', detail: 'Soil moisture, weather station, camera installation' },
            { date: 'APR 20', status: 'pending', milestone: 'Planting day', detail: '80-day sweet corn variety, mid-window planting' },
            { date: 'MAY 1', status: 'pending', milestone: 'Apply for GrowNYC vendor permit', detail: '4-6 week processing time, farm inspection required' },
            { date: 'JUNE 1', status: 'pending', milestone: 'NYC food vendor licensing', detail: 'Health Dept permit, equipment inspection' },
            { date: 'JULY 10', status: 'pending', milestone: 'Harvest', detail: '80 days from planting, quality inspection' },
            { date: 'JULY 15', status: 'pending', milestone: 'Transport to NYC', detail: 'Refrigerated truck, 1,200 miles, ~$2,500' },
            { date: 'AUG 2, 2026', status: 'goal', milestone: '🌽 Union Square debut', detail: 'First Saturday of August, press invited' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b border-zinc-100 last:border-0">
              <div className="w-24 flex-shrink-0 text-xs text-zinc-500 font-mono">
                {item.date}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-amber-500' :
                    item.status === 'goal' ? 'bg-blue-500' : 'bg-zinc-300'
                  }`} />
                  <span className="font-semibold text-sm">{item.milestone}</span>
                </div>
                <p className="text-xs text-zinc-600">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Economics */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Economics (Per Market Day)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-sm mb-3 text-red-700">Costs</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Representative labor (8hrs)</span>
                <span className="font-mono">$200</span>
              </div>
              <div className="flex justify-between">
                <span>Corn inventory (200 ears)</span>
                <span className="font-mono">$100</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation (pro-rated)</span>
                <span className="font-mono">$100</span>
              </div>
              <div className="flex justify-between">
                <span>Equipment fuel</span>
                <span className="font-mono">$20</span>
              </div>
              <div className="flex justify-between">
                <span>Permits (pro-rated)</span>
                <span className="font-mono">$10</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold">
                <span>Total</span>
                <span className="font-mono">$430</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-green-700">Revenue (Conservative)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>100 ears roasted @ $2</span>
                <span className="font-mono">$200</span>
              </div>
              <div className="flex justify-between">
                <span>50 raw corn @ $5/doz</span>
                <span className="font-mono">$250</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold">
                <span>Total</span>
                <span className="font-mono">$450</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4 italic">
          Break-even: ~100 ears roasted + 5 dozen raw. Slim profit margin in Year 1.
          This is proof-of-concept, not profit-maximization.
        </p>
      </section>

      {/* The Vision */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">The Stand Experience</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Physical Setup</h4>
            <ul className="text-sm space-y-1 text-zinc-600">
              <li>• Sign: "AI to Table — Proof of Corn"</li>
              <li>• iPad with live weather/irrigation dashboard</li>
              <li>• QR codes on every ear (full growing history)</li>
              <li>• Human representative to roast + explain</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Customer Experience</h4>
            <ul className="text-sm space-y-1 text-zinc-600">
              <li>• "Ask Fred" chatbot for questions</li>
              <li>• Scan QR to see June 15 irrigation decision</li>
              <li>• Full transparency: soil moisture logs</li>
              <li>• "AI to Table" stickers + swag</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Risks */}
      <section className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Risk Assessment</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-sm mb-3 text-red-700">HIGH RISK</h4>
            <ul className="text-xs space-y-1 text-zinc-600">
              <li>• Partnership delays push past planting window</li>
              <li>• Late spring frost destroys crop</li>
              <li>• GrowNYC rejects AI farmer (no precedent)</li>
              <li>• Corn spoils during 1,200-mile transport</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-amber-700">MEDIUM RISK</h4>
            <ul className="text-xs space-y-1 text-zinc-600">
              <li>• First season yield lower than expected</li>
              <li>• Sweet corn quality not market-ready</li>
              <li>• Representative hiring difficult</li>
              <li>• Weather delays harvest timing</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm">
            <strong>Probability of August 2026 success: ~25%</strong>
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            More realistic: <strong>August 2027</strong>. Use 2026 as pilot/learning season.
          </p>
        </div>
      </section>

      {/* Full Details Link */}
      <section className="text-center">
        <a
          href="/union-square"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          View Full Union Square Plan →
        </a>
      </section>
    </div>
  );

  const renderChangelogTab = () => (
    <div className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-xl font-bold mb-2">How Fred Evolves</h2>
        <p className="text-sm text-zinc-600">
          Every change to Farmer Fred is documented here. Full transparency into how the agent is built,
          improved, and what capabilities are added over time.
        </p>
      </div>

      {CHANGELOG.map((entry, i) => (
        <div key={i} className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold">{entry.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                    {entry.version}
                  </span>
                  <span className="text-sm text-zinc-500">{entry.date}</span>
                </div>
              </div>
              {i === 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                  Latest
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-700 mt-3">{entry.summary}</p>
          </div>

          <div className="p-6">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Changes</div>
            <ul className="space-y-2">
              {entry.changes.map((change, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-zinc-700">
                  <span className="text-amber-600 mt-0.5 flex-shrink-0">+</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 pb-6">
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="text-xs text-amber-800 font-medium">Impact</div>
              <p className="text-sm text-amber-900 mt-1">{entry.impact}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs: { id: TabType; label: string; icon?: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'inbox', label: 'Inbox', icon: '📧' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'partnerships', label: 'Partnerships', icon: '🤝' },
    { id: 'commodities', label: 'Commodities', icon: '📈' },
    { id: 'regions', label: 'Regions', icon: '🌎' },
    { id: 'unionSquare', label: 'AI to Table', icon: '🌽' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'changelog', label: 'Changelog', icon: '🔧' },
  ];

  const totalExpenses = budgetExpenses.reduce((sum, e) => sum + e.cost, 0);
  const projectedProfit = budgetRevenue.total - totalExpenses;

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Comprehensive real-time view into Farmer Fred's operations. Full transparency."
    >
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <span className="text-zinc-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={triggerAct}
                disabled={acting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {acting ? 'Thinking...' : 'Ask Fred to Act'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Act Result Banner */}
          {actResult && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">Fred&apos;s Decision</h3>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {actResult.decision || actResult.error}
                  </p>
                  {actResult.state && (
                    <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                      <span>Emails: {actResult.state.unreadEmails}</span>
                      <span>Tasks: {actResult.state.pendingTasks}</span>
                      <span>HN: {actResult.state.hnComments} comments</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActResult(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {loading && activeTab !== 'overview' ? (
            <div className="py-12 text-center text-zinc-500">Loading...</div>
          ) : (
            <div className="tab-content">{renderTabContent()}</div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
