/**
 * RSS 2.0 Feed Generator for Proof of Corn Decision Log
 *
 * Generates an RSS feed from decision log entries.
 * Follows RSS 2.0 specification: https://www.rssboard.org/rss-specification
 */

import { LogEntry } from './logData';

/**
 * Escapes XML special characters to prevent malformed XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts ISO 8601 date to RFC 822 format required by RSS 2.0
 * Example: "2026-01-23T16:45:00Z" -> "Thu, 23 Jan 2026 16:45:00 GMT"
 */
function toRFC822Date(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toUTCString();
}

/**
 * Generates enriched description for RSS item
 * Includes category, AI decision indicator, and cost if applicable
 */
function generateItemDescription(entry: LogEntry): string {
  let description = escapeXML(entry.description);

  // Add metadata to description
  const metadata: string[] = [];

  if (entry.aiDecision) {
    metadata.push('[AI Decision]');
  }

  if (entry.cost > 0) {
    metadata.push(`Cost: $${entry.cost.toFixed(2)}`);
  }

  if (metadata.length > 0) {
    description += ` | ${metadata.join(' | ')}`;
  }

  return description;
}

/**
 * Generates an RSS 2.0 feed from decision log entries
 *
 * @param logEntries - Array of decision log entries
 * @returns RSS 2.0 XML string
 */
export function generateRSSFeed(logEntries: LogEntry[]): string {
  const siteURL = 'https://proofofcorn.com';
  const feedTitle = 'Proof of Corn - Decision Log';
  const feedDescription = 'A real-time chronicle of every decision, every API call, every step toward growing corn with AI.';

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...logEntries].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Get the latest entry timestamp for lastBuildDate
  const lastBuildDate = sortedEntries.length > 0
    ? toRFC822Date(sortedEntries[0].timestamp)
    : toRFC822Date(new Date().toISOString());

  // Build RSS XML
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(feedTitle)}</title>
    <link>${siteURL}</link>
    <description>${escapeXML(feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteURL}/rss" rel="self" type="application/rss+xml" />
`;

  // Add items for each log entry
  for (const entry of sortedEntries) {
    const itemTitle = escapeXML(entry.title);
    const itemDescription = generateItemDescription(entry);
    const itemLink = `${siteURL}/log`;
    const itemPubDate = toRFC822Date(entry.timestamp);
    const itemGuid = entry.timestamp; // Use timestamp as unique identifier
    const itemCategory = escapeXML(entry.category);

    rss += `    <item>
      <title>${itemTitle}</title>
      <link>${itemLink}</link>
      <description>${itemDescription}</description>
      <pubDate>${itemPubDate}</pubDate>
      <guid isPermaLink="false">${itemGuid}</guid>
      <category>${itemCategory}</category>
    </item>
`;
  }

  rss += `  </channel>
</rss>`;

  return rss;
}
