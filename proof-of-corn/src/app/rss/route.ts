/**
 * RSS Feed Route Handler
 *
 * Generates RSS 2.0 feed from decision log entries.
 * Accessible at https://proofofcorn.com/rss
 */

import { generateRSSFeed } from '@/lib/rss';
import { logEntries } from '@/lib/logData';

// Export this route as static (generated at build time)
export const dynamic = 'force-static';

/**
 * GET /rss
 * Returns RSS 2.0 XML feed
 */
export async function GET() {
  // Generate RSS feed from log entries
  const rss = generateRSSFeed(logEntries);

  // Return with proper RSS content type
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Cache for 1 hour (3600 seconds)
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
