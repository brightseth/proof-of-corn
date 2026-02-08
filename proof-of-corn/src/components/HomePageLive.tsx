'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';
const UNION_SQUARE_DATE = new Date('2026-08-02T00:00:00');

interface LogEntry {
  timestamp: string;
  category: string;
  title: string;
  description: string;
  aiDecision?: boolean;
}

interface WeatherData {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
  frostRisk: boolean;
}

interface StatusData {
  agent: {
    regions: { name: string; status: string; plantingWindow: { start: string; end: string } }[];
  };
  weather: WeatherData[];
  recentLogs: LogEntry[];
}

interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
}

function getDaysUntil(): number {
  const now = new Date();
  const diff = UNION_SQUARE_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function extractActionSummary(log: LogEntry): string {
  const desc = log.description;
  // Try to extract a clean one-liner from the decision
  if (desc.startsWith('Fred evaluated current state and decided:')) {
    const decision = desc.replace('Fred evaluated current state and decided:', '').trim();
    // Get first line or sentence
    const firstLine = decision.split('\n')[0].replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
    return firstLine || log.title;
  }
  if (desc.startsWith('Decision:')) {
    return desc.split('\n')[0].replace('Decision:', '').trim();
  }
  if (desc.startsWith('Subject:')) {
    return `Sent email — ${desc.split('\n')[0].replace('Subject:', '').trim()}`;
  }
  if (desc.startsWith('Fred learned:')) {
    return desc.split('\n')[0].trim();
  }
  return log.title;
}

export function CountdownBanner() {
  const [daysLeft, setDaysLeft] = useState(getDaysUntil());
  const [latestAction, setLatestAction] = useState<{ text: string; time: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setDaysLeft(getDaysUntil()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${FRED_API}/log`)
      .then(res => res.json())
      .then(data => {
        const logs: LogEntry[] = data?.logs || [];
        if (logs.length > 0) {
          const latest = logs[0];
          setLatestAction({
            text: extractActionSummary(latest),
            time: formatTimeAgo(latest.timestamp),
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="px-6 py-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-y border-blue-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🌽</div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-1">
              <p className="font-bold text-blue-900">
                <span className="text-2xl tabular-nums">{daysLeft}</span> days until Union Square
              </p>
              <span className="text-xs text-blue-600 font-medium">Aug 2, 2026</span>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              Fred is autonomously orchestrating seed-to-harvest corn production for his NYC Greenmarket debut.
            </p>
            {latestAction && (
              <p className="text-xs text-blue-700 border-t border-blue-200 pt-2 mt-2">
                <span className="font-medium">Last action</span>{' '}
                <span className="text-blue-500">({latestAction.time})</span>:{' '}
                {latestAction.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiveStatus() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [latestAction, setLatestAction] = useState<{ text: string; time: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${FRED_API}/status`).then(r => r.json()).catch(() => null),
      fetch(`${FRED_API}/tasks`).then(r => r.json()).catch(() => null),
    ]).then(([statusData, tasksData]) => {
      setStatus(statusData);
      if (tasksData?.summary) setTaskSummary(tasksData.summary);
      // Get latest action from status recentLogs
      const logs: LogEntry[] = statusData?.recentLogs || [];
      if (logs.length > 0) {
        const latest = logs[0];
        setLatestAction({
          text: extractActionSummary(latest),
          time: formatTimeAgo(latest.timestamp),
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading || !status) {
    return (
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-6">Current Status</h2>
        <div className="space-y-4">
          {['Farmer Fred', 'Regions', 'Outreach', 'Tasks', 'Total Spent'].map((label) => (
            <div key={label} className="flex justify-between items-center py-3 border-b border-zinc-100">
              <span>{label}</span>
              <span className="text-zinc-400 animate-pulse">Loading...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const regions = status.agent?.regions || [];
  const weather = status.weather || [];

  // Build region display from live data
  const regionDisplay = regions.map(r => {
    const w = weather.find(ww => ww.region === r.name);
    const viable = w?.plantingViable;
    const label = viable ? 'NOW' : r.status;
    return `${r.name} (${label})`;
  }).join(' \u2022 ');

  const outreachCount = taskSummary
    ? `${taskSummary.completed} completed, ${taskSummary.pending} pending`
    : '14 emails sent, awaiting responses';

  return (
    <div className="lg:col-span-2">
      <h2 className="text-2xl font-bold mb-6">Current Status</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-zinc-100">
          <span>Farmer Fred</span>
          <span className="text-green-700">&#9679; Operational</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-zinc-100">
          <span>Regions</span>
          <span className="text-amber-700">{regionDisplay}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-zinc-100">
          <span>Tasks</span>
          <span className="text-zinc-600">{outreachCount}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-zinc-100">
          <span>Weather</span>
          <span className="text-zinc-600">
            {weather.map(w => `${w.region}: ${w.temperature}\u00B0F`).join(' \u2022 ')}
          </span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span>Total Spent</span>
          <span className="font-mono">$12.99</span>
        </div>
      </div>

      {latestAction && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <span className="font-medium text-green-900">Last action</span>{' '}
          <span className="text-green-600">({latestAction.time})</span>:{' '}
          <span className="text-green-800">{latestAction.text}</span>
        </div>
      )}

      <div className="mt-6">
        <Link href="/log" className="text-amber-600 hover:underline">
          View the full decision log &rarr;
        </Link>
      </div>
    </div>
  );
}

export function PlantingCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const plantingStart = new Date('2026-04-11T00:00:00');
    const now = new Date();
    const diff = Math.ceil((plantingStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, []);

  if (daysLeft === null) return null;

  return (
    <p className="mt-4 text-sm text-zinc-500">
      {daysLeft > 0
        ? `${daysLeft} days until Iowa planting window opens`
        : 'Iowa planting window is open'}
    </p>
  );
}
