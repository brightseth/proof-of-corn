import { NextResponse } from 'next/server';

// Vercel Analytics API isn't publicly accessible for detailed metrics
// This endpoint aggregates what we CAN get programmatically

export async function GET() {
  try {
    // Fetch HN data (this works!)
    const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/item/46735511.json');
    const hnData = await hnRes.json();

    // Fetch worker status
    const workerRes = await fetch('https://farmer-fred.sethgoldstein.workers.dev/status');
    const workerData = workerRes.ok ? await workerRes.json() : null;

    // Estimate traffic based on HN performance
    // Typical HN #1 post: ~50-100 pageviews per point
    const estimatedPageviews = hnData.score ? hnData.score * 75 : 0;
    const estimatedVisitors = hnData.score ? hnData.score * 50 : 0;

    return NextResponse.json({
      source: 'aggregated',
      hn: {
        score: hnData.score,
        comments: hnData.descendants,
        title: hnData.title,
        url: `https://news.ycombinator.com/item?id=${hnData.id}`,
        postedAt: new Date(hnData.time * 1000).toISOString(),
      },
      traffic: {
        estimatedPageviews,
        estimatedVisitors,
        apiRequestsJan23: 114523, // From Cloudflare dashboard
        note: 'Estimates based on HN score. See Vercel dashboard for exact metrics.',
      },
      worker: {
        status: workerData ? 'operational' : 'unknown',
        regions: 3,
      },
      dashboardLinks: {
        vercel: 'https://vercel.com/slashvibe/proof-of-corn/analytics',
        cloudflare: 'https://dash.cloudflare.com',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to aggregate analytics', details: String(error) },
      { status: 500 }
    );
  }
}
