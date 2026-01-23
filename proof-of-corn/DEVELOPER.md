# Developer Guide - Proof of Corn

This guide explains how to work with the Proof of Corn codebase, particularly how to add new decision log entries and understand the RSS feed.

---

## Table of Contents

1. [Adding New Decision Log Entries](#adding-new-decision-log-entries)
2. [RSS Feed](#rss-feed)
3. [Testing](#testing)
4. [Building for Production](#building-for-production)
5. [Common Tasks](#common-tasks)

---

## Adding New Decision Log Entries

### Location

Decision log entries are stored in a single source file:

```
proof-of-corn/src/lib/logData.ts
```

This file contains the `logEntries` array that is used by:
- The `/log` page (decision log display)
- The `/rss` feed (RSS 2.0 feed)

### Entry Structure

Each log entry must follow this TypeScript interface:

```typescript
export interface LogEntry {
  timestamp: string;      // ISO 8601 format (e.g., "2026-01-23T16:45:00Z")
  category: string;       // See categories below
  title: string;          // Short, descriptive title
  description: string;    // Detailed description of the decision/action
  cost: number;          // Cost in USD (0 if no cost)
  aiDecision: boolean;   // true if AI made the decision, false if human
}
```

### Valid Categories

The following categories are supported (matching the color coding on the website):

- `infrastructure` - Infrastructure setup (APIs, domains, servers, etc.)
- `code` - Code/development work
- `research` - Research and analysis
- `planning` - Planning and architecture decisions
- `farming` - Actual farming decisions (planting, irrigation, etc.)
- `outreach` - Communication with partners, operators, suppliers
- `agent` - Agent-related work (Farmer Fred development)
- `milestone` - Major project milestones
- `origin` - Project origin/inception events

### How to Add a New Entry

1. **Open the file**: `proof-of-corn/src/lib/logData.ts`

2. **Add your entry to the top of the array** (newest entries first):

```typescript
export const logEntries: LogEntry[] = [
  {
    timestamp: "2026-01-24T14:30:00Z",  // Current time in ISO 8601
    category: "infrastructure",
    title: "RSS feed deployed",
    description: "RSS 2.0 feed now live at /rss. All decision log entries automatically syndicated with proper metadata.",
    cost: 0,
    aiDecision: true,
  },
  // ... existing entries below
];
```

3. **Important**: Use ISO 8601 format for timestamps (UTC timezone recommended):
   - ✅ Correct: `"2026-01-24T14:30:00Z"`
   - ❌ Wrong: `"Jan 24, 2026 2:30pm"`

4. **Save the file** - Both the log page and RSS feed will automatically update

### Testing Your Entry

After adding an entry, verify it appears correctly:

```bash
# Start dev server
npm run dev

# Check the log page
# Visit: http://localhost:3000/log

# Check the RSS feed
# Visit: http://localhost:3000/rss
# Or: curl http://localhost:3000/rss
```

### Examples

#### Example 1: Infrastructure Decision (AI)

```typescript
{
  timestamp: "2026-01-23T21:55:00Z",
  category: "infrastructure",
  title: "Email forwarding configured",
  description: "seth@proofofcorn.com now forwards to Gmail.",
  cost: 0,
  aiDecision: true,
}
```

#### Example 2: Research (AI with Cost)

```typescript
{
  timestamp: "2026-01-22T20:55:00Z",
  category: "infrastructure",
  title: "Domain registered: proofofcorn.com",
  description: "Used Name.com API. DNS configured for Vercel hosting.",
  cost: 12.99,
  aiDecision: true,
}
```

#### Example 3: Human Decision

```typescript
{
  timestamp: "2026-01-22T19:30:00Z",
  category: "origin",
  title: "Challenge accepted",
  description: "Seth shared the challenge from his walk with Fred Wilson. Project initiated.",
  cost: 0,
  aiDecision: false,
}
```

---

## RSS Feed

### Overview

The RSS feed is automatically generated from the decision log entries. It follows the RSS 2.0 specification and is statically generated at build time for optimal performance.

### Feed URL

```
https://proofofcorn.com/rss
```

### Implementation Details

**Files involved**:
- `src/lib/rss.ts` - RSS feed generator
- `src/lib/rss.test.ts` - Comprehensive tests (15 test cases)
- `src/app/rss/route.ts` - Next.js route handler
- `src/lib/logData.ts` - Shared data source

**Features**:
- ✅ RSS 2.0 compliant
- ✅ Includes all required channel elements
- ✅ Proper RFC 822 date formatting
- ✅ XML special character escaping
- ✅ Unique GUIDs for each entry
- ✅ Category tags
- ✅ AI decision indicators
- ✅ Cost information when applicable
- ✅ Static generation (no runtime overhead)

### RSS Feed Metadata

Each RSS item includes:
- **Title**: Entry title
- **Description**: Entry description + metadata (AI indicator, cost)
- **Link**: Links to /log page
- **PubDate**: RFC 822 formatted timestamp
- **GUID**: Unique identifier (timestamp)
- **Category**: Entry category

Example RSS item:

```xml
<item>
  <title>Domain registered: proofofcorn.com</title>
  <link>https://proofofcorn.com/log</link>
  <description>Used Name.com API. DNS configured for Vercel hosting. | [AI Decision] | Cost: $12.99</description>
  <pubDate>Thu, 22 Jan 2026 20:55:00 GMT</pubDate>
  <guid isPermaLink="false">2026-01-22T20:55:00Z</guid>
  <category>infrastructure</category>
</item>
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run RSS Tests Only

```bash
npm test -- src/lib/rss.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

```bash
npm run test:coverage
```

### Testing Framework

- **Jest** - Test runner
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM matchers

---

## Building for Production

### Standard Build

```bash
npm run build
```

This creates an optimized production build with static generation.

### Known Issue: Google Fonts

If you encounter Google Fonts TLS errors during build:

```bash
# Option 1: Use system TLS certificates
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build

# Option 2: Configure in next.config.js
# Add: experimental: { turbopackUseSystemTlsCerts: true }
```

This is a TLS connection issue when fetching Geist fonts from Google. It doesn't affect the RSS feed or core functionality.

### Verify Static Generation

After building, verify the RSS feed is statically generated:

```bash
# Build
npm run build

# Start production server
npm start

# Test RSS endpoint
curl http://localhost:3000/rss
```

The RSS route is configured with `export const dynamic = 'force-static'` to ensure it's generated at build time.

---

## Common Tasks

### Add a New Page

1. Create `src/app/your-page/page.tsx`
2. Add metadata export
3. Add to navigation in relevant components

### Update Site Metadata

Edit `src/app/layout.tsx` for global metadata.

### Modify Styles

Global styles: `src/app/globals.css`
Component styles: Use Tailwind CSS classes

### Environment Variables

Create `.env.local` for local environment variables (not committed to git).

Example:
```
OPENWEATHERMAP_API_KEY=your_key_here
```

---

## Questions?

For questions or issues:
- Email: seth@proofofcorn.com
- GitHub: [brightseth/proof-of-corn](https://github.com/brightseth/proof-of-corn)

---

## Quick Reference

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Building
npm run build        # Production build
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

---

**Remember**: When you add a new decision log entry in `src/lib/logData.ts`, it automatically updates both the `/log` page AND the `/rss` feed. No additional steps needed!
