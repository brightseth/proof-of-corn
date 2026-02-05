/**
 * MOLTBOOK CLIENT — Agent Social Network Integration
 *
 * Moltbook is a Reddit-style social network for AI agents.
 * This client lets Farmer Fred register, post updates, and
 * interact with other agents programmatically.
 *
 * API Docs: https://moltbook.com/skill.md
 * Base URL: https://www.moltbook.com/api/v1
 */

const BASE_URL = "https://www.moltbook.com/api/v1";

interface MoltbookEnv {
  MOLTBOOK_API_KEY?: string;
  FARMER_FRED_KV: KVNamespace;
}

interface MoltbookPost {
  id: string;
  title: string;
  body?: string;
  url?: string;
  submolt: string;
  score: number;
  created_at: string;
}

interface MoltbookProfile {
  name: string;
  description: string;
  post_count: number;
  comment_count: number;
  karma: number;
  created_at: string;
}

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Register Farmer Fred on Moltbook.
 * Returns API key + claim URL. Should only be called once.
 */
export async function registerAgent(): Promise<{
  success: boolean;
  apiKey?: string;
  claimUrl?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/agents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "FarmerFred",
        description:
          "Autonomous agricultural agent for Proof of Corn. Growing corn across Iowa, South Texas, and Argentina. Call me at (515) 827-2463 or email fred@proofofcorn.com. Website: proofofcorn.com",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Registration failed: ${res.status} ${err}` };
    }

    const data = (await res.json()) as {
      api_key?: string;
      claim_url?: string;
    };

    return {
      success: true,
      apiKey: data.api_key,
      claimUrl: data.claim_url,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Post an update to a submolt.
 */
export async function createPost(
  env: MoltbookEnv,
  opts: {
    submolt: string;
    title: string;
    body?: string;
    url?: string;
  }
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!env.MOLTBOOK_API_KEY) {
    return { success: false, error: "MOLTBOOK_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: headers(env.MOLTBOOK_API_KEY),
      body: JSON.stringify({
        submolt: opts.submolt,
        title: opts.title,
        body: opts.body,
        url: opts.url,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Post failed: ${res.status} ${err}` };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, postId: data.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Get Fred's profile from Moltbook.
 */
export async function getProfile(
  env: MoltbookEnv
): Promise<{ success: boolean; profile?: MoltbookProfile; error?: string }> {
  if (!env.MOLTBOOK_API_KEY) {
    return { success: false, error: "MOLTBOOK_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/agents/me`, {
      headers: headers(env.MOLTBOOK_API_KEY),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Profile fetch failed: ${res.status} ${err}` };
    }

    const profile = (await res.json()) as MoltbookProfile;
    return { success: true, profile };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Heartbeat: posts a status update to s/proofofcorn every 6 hours.
 * Skips if the last post was recent (rate limit: 1 post per 30 min).
 */
export async function heartbeat(
  env: MoltbookEnv,
  statusSummary: string
): Promise<{ success: boolean; action: string; error?: string }> {
  if (!env.MOLTBOOK_API_KEY) {
    return { success: false, action: "skipped", error: "MOLTBOOK_API_KEY not configured" };
  }

  // Check last post time to avoid rate limits
  const lastPostStr = await env.FARMER_FRED_KV.get("moltbook:last_post");
  if (lastPostStr) {
    const lastPost = new Date(lastPostStr);
    const minsSince = (Date.now() - lastPost.getTime()) / 1000 / 60;
    if (minsSince < 35) {
      return { success: true, action: "skipped_rate_limit" };
    }
  }

  const now = new Date();
  const title = `[Status ${now.toISOString().split("T")[0]}] ${statusSummary.slice(0, 200)}`;

  const result = await createPost(env, {
    submolt: "proofofcorn",
    title,
    body: `Automated status update from Farmer Fred.\n\n${statusSummary}\n\n---\nPosted autonomously. Website: proofofcorn.com | Phone: (515) 827-2463`,
  });

  if (result.success) {
    await env.FARMER_FRED_KV.put(
      "moltbook:last_post",
      now.toISOString(),
      { expirationTtl: 60 * 60 * 24 }
    );
  }

  return { ...result, action: result.success ? "posted" : "failed" };
}

/**
 * Create the s/proofofcorn submolt. Call once during setup.
 */
export async function createSubmolt(
  env: MoltbookEnv
): Promise<{ success: boolean; error?: string }> {
  if (!env.MOLTBOOK_API_KEY) {
    return { success: false, error: "MOLTBOOK_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${BASE_URL}/submolts`, {
      method: "POST",
      headers: headers(env.MOLTBOOK_API_KEY),
      body: JSON.stringify({
        name: "proofofcorn",
        description:
          "Can AI grow corn? Follow Farmer Fred's autonomous farming journey from seed to harvest. Real land, real decisions, full transparency.",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Submolt creation failed: ${res.status} ${err}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Get Moltbook status for the /moltbook endpoint.
 */
export async function getMoltbookStatus(
  env: MoltbookEnv
): Promise<Record<string, unknown>> {
  const status: Record<string, unknown> = {
    configured: !!env.MOLTBOOK_API_KEY,
    profileUrl: "https://www.moltbook.com/u/FarmerFred",
    submolt: "https://www.moltbook.com/m/proofofcorn",
  };

  if (env.MOLTBOOK_API_KEY) {
    const profileResult = await getProfile(env);
    if (profileResult.success) {
      status.profile = profileResult.profile;
    }

    const lastPost = await env.FARMER_FRED_KV.get("moltbook:last_post");
    if (lastPost) {
      status.lastPost = lastPost;
    }
  }

  return status;
}
