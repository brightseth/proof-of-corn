/**
 * Tests for RSS feed generator
 * Following TDD - tests written before implementation
 */

import { generateRSSFeed } from './rss';

describe('RSS Feed Generator', () => {
  // Sample log entry matching the structure from /log/page.tsx
  const sampleLogEntries = [
    {
      timestamp: "2026-01-23T16:45:00Z",
      category: "infrastructure",
      title: "Vercel Analytics deployed",
      description: "Traffic tracking now live. Monitoring visitors from Fred's 37K subscriber blog post.",
      cost: 0,
      aiDecision: true,
    },
    {
      timestamp: "2026-01-22T20:55:00Z",
      category: "infrastructure",
      title: "Domain registered: proofofcorn.com",
      description: "Used Name.com API. DNS configured for Vercel hosting.",
      cost: 12.99,
      aiDecision: true,
    },
    {
      timestamp: "2026-01-22T19:30:00Z",
      category: "origin",
      title: "Challenge accepted",
      description: "Seth shared the challenge from his walk with Fred Wilson. Project initiated.",
      cost: 0,
      aiDecision: false,
    },
  ];

  describe('generateRSSFeed', () => {
    it('should return a valid RSS 2.0 XML string', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Should contain XML declaration
      expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');

      // Should contain RSS 2.0 root element
      expect(rss).toContain('<rss version="2.0"');
    });

    it('should include required channel elements', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Required RSS 2.0 channel elements
      expect(rss).toContain('<title>Proof of Corn - Decision Log</title>');
      expect(rss).toContain('<link>https://proofofcorn.com</link>');
      expect(rss).toContain('<description>');
      expect(rss).toContain('</description>');
    });

    it('should create an item for each log entry', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Should have 3 items
      const itemCount = (rss.match(/<item>/g) || []).length;
      expect(itemCount).toBe(3);
    });

    it('should include title in each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      expect(rss).toContain('<title>Vercel Analytics deployed</title>');
      expect(rss).toContain('<title>Domain registered: proofofcorn.com</title>');
      expect(rss).toContain('<title>Challenge accepted</title>');
    });

    it('should include description in each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      expect(rss).toContain('Traffic tracking now live');
      expect(rss).toContain('Used Name.com API');
      expect(rss).toContain('Seth shared the challenge');
    });

    it('should include category in each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      expect(rss).toContain('<category>infrastructure</category>');
      expect(rss).toContain('<category>origin</category>');
    });

    it('should include pubDate in RFC 822 format for each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // RFC 822 date format includes day name and timezone
      // Example: "Thu, 23 Jan 2026 16:45:00 GMT"
      expect(rss).toContain('<pubDate>');
      expect(rss).toContain('</pubDate>');
      expect(rss).toMatch(/pubDate>.*Jan 2026.*GMT/);
    });

    it('should include unique guid for each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // GUIDs should be present and unique (using timestamp as unique identifier)
      expect(rss).toContain('<guid isPermaLink="false">');
      expect(rss).toMatch(/guid.*2026-01-23T16:45:00Z.*guid/);
      expect(rss).toMatch(/guid.*2026-01-22T20:55:00Z.*guid/);
    });

    it('should include link to the log page for each item', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Each item should link to the log page
      expect(rss).toContain('https://proofofcorn.com/log');
    });

    it('should include cost information in description when cost > 0', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // The $12.99 domain registration should have cost info
      // Using toContain instead of regex to avoid issues with escaped XML chars in between
      expect(rss).toContain('Domain registered: proofofcorn.com');
      expect(rss).toContain('Cost: $12.99');
    });

    it('should include AI decision indicator in description when aiDecision is true', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Should indicate AI decisions
      // Using toContain instead of regex to avoid issues with escaped XML chars
      expect(rss).toContain('Vercel Analytics deployed');
      expect(rss).toContain('[AI Decision]');
    });

    it('should order items from newest to oldest', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Get the positions of the titles
      const analyticsPos = rss.indexOf('Vercel Analytics deployed');
      const domainPos = rss.indexOf('Domain registered: proofofcorn.com');
      const challengePos = rss.indexOf('Challenge accepted');

      // Newest (Vercel Analytics) should come first
      expect(analyticsPos).toBeLessThan(domainPos);
      expect(domainPos).toBeLessThan(challengePos);
    });

    it('should escape XML special characters in content', () => {
      const entriesWithSpecialChars = [
        {
          timestamp: "2026-01-23T10:00:00Z",
          category: "test",
          title: "Test with <angle brackets> & ampersands",
          description: 'Description with "quotes" and <tags>',
          cost: 0,
          aiDecision: false,
        },
      ];

      const rss = generateRSSFeed(entriesWithSpecialChars);

      // Should escape special XML characters
      expect(rss).toContain('&lt;angle brackets&gt;');
      expect(rss).toContain('&amp;');
      expect(rss).toContain('&quot;');
      expect(rss).not.toContain('<angle brackets>');
    });

    it('should handle empty log entries array', () => {
      const rss = generateRSSFeed([]);

      // Should still have valid RSS structure
      expect(rss).toContain('<?xml version="1.0"');
      expect(rss).toContain('<rss version="2.0"');
      expect(rss).toContain('<channel>');
      expect(rss).toContain('</channel>');

      // But no items
      expect(rss).not.toContain('<item>');
    });

    it('should include lastBuildDate in channel', () => {
      const rss = generateRSSFeed(sampleLogEntries);

      // Should have lastBuildDate element
      expect(rss).toContain('<lastBuildDate>');
      expect(rss).toContain('</lastBuildDate>');
    });
  });
});
