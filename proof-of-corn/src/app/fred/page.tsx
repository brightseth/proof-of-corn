"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";

interface WeatherData {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
  frostRisk?: boolean;
  evaluation?: {
    recommendation: string;
    reason: string;
  };
}

type FredState = "active" | "monitoring" | "thinking" | "dormant";

interface LogEntry {
  timestamp: string;
  category: string;
  title: string;
  description: string;
}

export default function FredPage() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [currentRegion, setCurrentRegion] = useState<WeatherData | null>(null);
  const [fredState, setFredState] = useState<FredState>("dormant");
  const [currentThought, setCurrentThought] = useState("Waking up...");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [recentActivity, setRecentActivity] = useState<LogEntry[]>([]);

  // Fetch Fred's status
  const fetchStatus = async () => {
    try {
      setFredState("thinking");
      const [weatherRes, logRes] = await Promise.all([
        fetch("https://farmer-fred.sethgoldstein.workers.dev/weather"),
        fetch("https://farmer-fred.sethgoldstein.workers.dev/log")
      ]);
      const weatherData = await weatherRes.json();
      const logData = await logRes.json();

      setWeather(weatherData.weather || []);
      setRecentActivity((logData.logs || []).slice(0, 10));

      // Use the Iowa data (primary and only region)
      const regions = weatherData.weather || [];
      const iowa = regions.find((w: WeatherData) => w.region?.toLowerCase().includes('iowa')) || regions[0];

      setCurrentRegion(iowa);

      if (iowa?.plantingViable) {
        setFredState("active");
        setCurrentThought("The Nelson Family Farms plot looks good. Planting window is open. Time to get those SH2 seeds in the ground.");
      } else if (iowa?.frostRisk) {
        setFredState("monitoring");
        setCurrentThought("Humboldt County is locked in frost. Nothing to do but wait and watch. Been through worse Iowa winters.");
      } else {
        setFredState("monitoring");
        setCurrentThought(`Checking on the plot at Nelson Family Farms. ${iowa?.temperature || '--'}°F, ${iowa?.conditions || 'checking conditions'}.`);
      }

      setLastUpdate(new Date());
      setError(null);
    } catch {
      setError("Fred is resting... (API unavailable)");
      setFredState("dormant");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // No region rotation needed — Iowa only

  const stateColors: Record<FredState, string> = {
    active: "bg-green-500",
    monitoring: "bg-amber-500",
    thinking: "bg-blue-500",
    dormant: "bg-zinc-400"
  };

  const stateLabels: Record<FredState, string> = {
    active: "ACTIVE",
    monitoring: "MONITORING",
    thinking: "THINKING...",
    dormant: "DORMANT"
  };

  // Dynamic sky based on current region's weather
  const getSkyGradient = () => {
    if (!currentRegion) return "from-sky-300 via-sky-200 to-green-400";
    const temp = currentRegion.temperature;
    const conditions = currentRegion.conditions?.toLowerCase() || "";

    if (temp < 32) return "from-slate-500 via-slate-400 to-slate-300";
    if (conditions.includes("cloud") || conditions.includes("overcast")) return "from-slate-400 via-gray-300 to-green-300";
    if (temp > 90) return "from-orange-300 via-amber-200 to-green-400";
    if (temp > 75) return "from-sky-400 via-sky-300 to-green-400";
    return "from-sky-300 via-sky-200 to-green-400";
  };

  const getSunStyle = () => {
    if (!currentRegion) return "bg-yellow-300";
    const conditions = currentRegion.conditions?.toLowerCase() || "";
    if (conditions.includes("cloud") || conditions.includes("overcast")) return "bg-yellow-200 opacity-40";
    if (currentRegion.temperature > 90) return "bg-orange-500";
    if (currentRegion.temperature > 75) return "bg-yellow-400";
    return "bg-yellow-300";
  };

  return (
    <PageLayout
      title="Farmer Fred"
      subtitle="Autonomous agricultural agent • Monitoring fields • Responding to partnerships • Evolving daily"
    >
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Evolution Milestone */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🌅</div>
              <div>
                <p className="font-bold text-green-900 text-sm">NEW: Fred is now FULLY autonomous</p>
                <p className="text-sm text-green-800">
                  As of Jan 25, 2026 21:40 UTC, Fred operates completely independently. Every day at 6 AM UTC,
                  he wakes up, checks Iowa weather, reviews his inbox, composes emails,
                  and sends them—no human prompting required. True autonomous operation.{" "}
                  <a href="/transparency" className="underline font-medium">View full evolution →</a>
                </p>
              </div>
            </div>
          </div>

          {/* The Tandoori Oven Window */}
          <div className="bg-gradient-to-b from-sky-100 to-green-100 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Sky and Field Background - Dynamic based on weather */}
            <div className={`relative h-80 bg-gradient-to-b ${getSkyGradient()} transition-all duration-1000`}>

              {/* Region Label */}
              <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-mono">
                📍 {currentRegion?.region || "Loading..."}
              </div>

              {/* Temperature */}
              <div className="absolute top-4 right-20 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-mono">
                {currentRegion?.temperature || "--"}°F
              </div>

              {/* Sun */}
              <div className={`absolute top-6 right-4 w-14 h-14 ${getSunStyle()} rounded-full shadow-lg animate-pulse transition-all duration-1000`} />

              {/* Clouds - more if overcast */}
              {currentRegion?.conditions?.toLowerCase().includes("cloud") && (
                <>
                  <div className="absolute top-12 left-16 text-white text-5xl opacity-70">☁️</div>
                  <div className="absolute top-8 left-40 text-white text-4xl opacity-60">☁️</div>
                  <div className="absolute top-16 right-32 text-white text-3xl opacity-50">☁️</div>
                </>
              )}

              {/* Snow if frozen */}
              {currentRegion && currentRegion.temperature < 32 && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute text-white animate-pulse"
                      style={{
                        left: `${(i * 5) % 100}%`,
                        top: `${(i * 13) % 70}%`,
                        fontSize: `${8 + (i % 3) * 4}px`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >❄</span>
                  ))}
                </div>
              )}

              {/* Corn Stalks - Row 1 (back) */}
              <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-4 opacity-50">
                {[...Array(12)].map((_, i) => (
                  <div key={`back-${i}`} className="text-3xl">🌽</div>
                ))}
              </div>

              {/* Corn Stalks - Row 2 (middle) */}
              <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-3 opacity-70">
                {[...Array(14)].map((_, i) => (
                  <div key={`mid-${i}`} className="text-4xl">🌽</div>
                ))}
              </div>

              {/* Older Pixel Fred */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative">
                  {/* State Indicator */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${stateColors[fredState]} animate-pulse shadow-lg`} />

                  {/* Straw Hat - weathered */}
                  <div className="flex justify-center">
                    <div className="w-14 h-4 bg-amber-600 rounded-t-lg shadow-md" />
                  </div>
                  <div className="flex justify-center -mt-[2px]">
                    <div className="w-18 h-3 bg-amber-700 rounded-sm shadow" style={{ width: '72px' }} />
                  </div>

                  {/* Gray Hair peeking out */}
                  <div className="flex justify-center -mt-[1px]">
                    <div className="w-12 h-2 bg-gray-400 rounded-t" />
                  </div>

                  {/* Weathered Face - older, tan, wrinkled */}
                  <div className="w-14 h-12 bg-amber-300 rounded-lg mx-auto relative -mt-[1px] shadow">
                    {/* Forehead wrinkles */}
                    <div className="absolute top-1 left-2 right-2 h-[1px] bg-amber-400" />
                    <div className="absolute top-2 left-3 right-3 h-[1px] bg-amber-400" />

                    {/* Bushy gray eyebrows */}
                    <div className="absolute top-3 left-2 w-3 h-1 bg-gray-500 rounded" />
                    <div className="absolute top-3 right-2 w-3 h-1 bg-gray-500 rounded" />

                    {/* Eyes - wise, slightly squinted */}
                    <div className="absolute top-4 left-3 w-2 h-2 bg-zinc-700 rounded-full" />
                    <div className="absolute top-4 right-3 w-2 h-2 bg-zinc-700 rounded-full" />

                    {/* Crow's feet wrinkles */}
                    <div className="absolute top-4 left-1 w-1 h-2 border-l border-amber-400" />
                    <div className="absolute top-4 right-1 w-1 h-2 border-r border-amber-400" />

                    {/* Weathered cheeks */}
                    <div className="absolute top-6 left-2 w-2 h-1 bg-amber-400/50 rounded" />
                    <div className="absolute top-6 right-2 w-2 h-1 bg-amber-400/50 rounded" />

                    {/* Slight smile - content, knowing */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-2 border-b-2 border-amber-600 rounded-b-full" />
                  </div>

                  {/* Neck */}
                  <div className="w-6 h-2 bg-amber-300 mx-auto -mt-[1px]" />

                  {/* Faded Blue Overalls */}
                  <div className="w-16 h-14 bg-blue-700 rounded-b-lg mx-auto relative -mt-[1px] shadow">
                    {/* Overall straps */}
                    <div className="absolute top-0 left-2 w-3 h-5 bg-blue-800 rounded-b" />
                    <div className="absolute top-0 right-2 w-3 h-5 bg-blue-800 rounded-b" />
                    {/* Buttons */}
                    <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    {/* Pocket */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-5 bg-blue-800 rounded-sm" />
                  </div>

                  {/* Arms - weathered skin */}
                  <div className="absolute top-[72px] -left-4 w-5 h-10 bg-amber-300 rounded-lg transform -rotate-12 shadow" />
                  <div className="absolute top-[72px] -right-4 w-5 h-10 bg-amber-300 rounded-lg transform rotate-12 shadow" />
                </div>

                {/* Name Tag */}
                <div className="mt-3 px-4 py-1.5 bg-white/95 rounded-full text-sm font-bold text-zinc-700 shadow-lg border border-amber-200">
                  FARMER FRED
                </div>
              </div>

              {/* Corn Stalks - Row 3 (front) */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={`front-${i}`} className="text-5xl">🌽</div>
                ))}
              </div>

              {/* Ground - changes based on weather */}
              <div className={`absolute bottom-0 left-0 right-0 h-4 ${
                currentRegion && currentRegion.temperature < 32
                  ? "bg-gradient-to-t from-slate-400 to-slate-300"
                  : "bg-gradient-to-t from-amber-900 to-amber-800"
              }`} />
            </div>

            {/* Status Bar */}
            <div className="bg-zinc-900 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stateColors[fredState]} animate-pulse`} />
                  <span className="font-mono text-sm">{stateLabels[fredState]}</span>
                </div>
                <span className="text-zinc-500 text-xs font-mono">
                  {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Loading..."}
                </span>
              </div>

              {/* Thought Bubble */}
              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-400 mb-1">💭 Fred&apos;s Thinking</p>
                <p className="text-amber-400 font-medium italic">&ldquo;{currentThought}&rdquo;</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
              )}

              {/* Region Label */}
              {currentRegion && (
                <div className="flex gap-2 mb-2">
                  <span className="px-3 py-1.5 rounded-lg text-sm font-mono bg-amber-600 text-white">
                    {currentRegion.region || "Iowa"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Weather Dashboard */}
          {weather.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {weather.map((w) => (
                <div
                  key={w.region}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    w.region === currentRegion?.region
                      ? "bg-amber-50 border-amber-400 shadow-lg scale-[1.02]"
                      : w.plantingViable
                        ? "bg-green-50 border-green-300"
                        : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{w.region}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      w.plantingViable
                        ? "bg-green-200 text-green-800"
                        : w.frostRisk
                          ? "bg-blue-200 text-blue-800"
                          : "bg-zinc-200 text-zinc-600"
                    }`}>
                      {w.evaluation?.recommendation || "CHECKING"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{w.temperature}°F</p>
                  <p className="text-sm text-zinc-600 capitalize">{w.conditions}</p>
                  {w.region === currentRegion?.region && (
                    <p className="text-xs text-amber-600 mt-2">👀 Fred is here</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Activity Feed */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">📋 Recent Activity</h2>
            <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((log, i) => {
                  const time = new Date(log.timestamp);
                  const timeStr = time.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  const icon = log.category === "outreach" ? "📧" :
                               log.category === "agent" ? "🧠" :
                               log.category === "weather" ? "🌡️" :
                               "📝";

                  return (
                    <FeedItem
                      key={i}
                      time={timeStr}
                      icon={icon}
                      title={log.title}
                      description={log.description.split('\n')[0].slice(0, 120) + (log.description.length > 120 ? '...' : '')}
                    />
                  );
                })
              ) : (
                <FeedItem
                  time="Loading..."
                  icon="⏳"
                  title="Fetching Fred's activity"
                  description="Loading recent decisions and actions..."
                />
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Live data from Fred&apos;s decision log. <a href="/log" className="text-amber-600 hover:underline">View full log →</a>
            </p>
          </div>

          {/* Constitution */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📜 Fred&apos;s Constitution</h2>
            <p className="text-sm text-zinc-600 mb-4">
              Six decades of farming taught Fred these principles. Now they&apos;re encoded in his constitution.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "Fiduciary Duty", desc: "Your money, my responsibility" },
                { name: "Regenerative Ag", desc: "Leave the land better" },
                { name: "Sustainable", desc: "Think seven generations" },
                { name: "Global Citizen", desc: "Not just American corn" },
                { name: "Transparency", desc: "Every decision logged" },
                { name: "Human-Agent", desc: "Work with people, not over them" }
              ].map((principle) => (
                <div key={principle.name} className="text-sm bg-white px-3 py-2 rounded border border-amber-200">
                  <p className="font-medium">{principle.name}</p>
                  <p className="text-xs text-zinc-500">{principle.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-600">
              <a
                href="https://farmer-fred.sethgoldstein.workers.dev/constitution"
                className="text-amber-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full constitution →
              </a>
            </p>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

function FeedItem({ time, icon, title, description }: {
  time: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 hover:bg-zinc-50 transition-colors">
      <div className="flex gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <span className="text-xs text-zinc-400 font-mono">{time}</span>
          </div>
          <p className="text-sm text-zinc-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
