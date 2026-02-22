/**
 * TWITTER/X INTEGRATION — OAuth 1.0a for Cloudflare Workers
 *
 * Posts tweets as @farmerfredai using X API v2.
 * Uses Web Crypto API (no Node.js dependencies).
 *
 * OAuth 1.0a flow:
 *   1. Build parameter string (sorted, percent-encoded)
 *   2. Build signature base string (method, url, params)
 *   3. HMAC-SHA1 sign with consumer secret + token secret
 *   4. Base64 encode the signature
 *   5. Build Authorization header
 */

// ============================================
// TYPES
// ============================================

export interface TwitterEnv {
  X_API_KEY: string;
  X_API_SECRET: string;
  X_ACCESS_TOKEN: string;
  X_ACCESS_TOKEN_SECRET: string;
}

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

interface OAuthParams {
  oauth_consumer_key: string;
  oauth_nonce: string;
  oauth_signature_method: string;
  oauth_timestamp: string;
  oauth_token: string;
  oauth_version: string;
}

// ============================================
// OAUTH 1.0a SIGNING (Web Crypto API)
// ============================================

/**
 * Percent-encode a string per RFC 3986.
 * Encodes everything except unreserved characters: A-Z a-z 0-9 - . _ ~
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

/**
 * Generate a random nonce string for OAuth.
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * HMAC-SHA1 sign a message using the Web Crypto API.
 * Returns the raw signature as an ArrayBuffer.
 */
async function hmacSha1(key: string, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

/**
 * Base64 encode an ArrayBuffer.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Build the OAuth 1.0a Authorization header for a request.
 *
 * Steps per Twitter OAuth spec:
 *   1. Collect all parameters (OAuth + request body for POST)
 *   2. Sort alphabetically by key, then by value
 *   3. Percent-encode keys and values, join with &
 *   4. Build signature base string: METHOD&url&params
 *   5. Sign with HMAC-SHA1 using signing key
 *   6. Build Authorization header string
 */
async function buildOAuthHeader(
  method: string,
  url: string,
  env: TwitterEnv,
  bodyParams?: Record<string, string>
): Promise<string> {
  const oauthParams: OAuthParams = {
    oauth_consumer_key: env.X_API_KEY,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  // Collect all parameters for signing (OAuth params + body params if any)
  const allParams: Record<string, string> = { ...oauthParams };
  if (bodyParams) {
    for (const [key, value] of Object.entries(bodyParams)) {
      allParams[key] = value;
    }
  }

  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join("&");

  // Build signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");

  // Build signing key: consumer_secret & token_secret
  const signingKey = `${percentEncode(env.X_API_SECRET)}&${percentEncode(env.X_ACCESS_TOKEN_SECRET)}`;

  // Sign with HMAC-SHA1
  const signatureBuffer = await hmacSha1(signingKey, signatureBaseString);
  const signature = arrayBufferToBase64(signatureBuffer);

  // Build Authorization header
  const authParams: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const headerString = Object.keys(authParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(authParams[key])}"`)
    .join(", ");

  return `OAuth ${headerString}`;
}

// ============================================
// TWITTER API v2 — POSTING
// ============================================

const TWEET_ENDPOINT = "https://api.twitter.com/2/tweets";
const MEDIA_UPLOAD_ENDPOINT = "https://upload.twitter.com/1.1/media/upload.json";

/**
 * Post a text-only tweet.
 */
export async function postTweet(
  text: string,
  env: TwitterEnv
): Promise<TweetResult> {
  if (!env.X_API_KEY || !env.X_ACCESS_TOKEN) {
    return { success: false, error: "Missing Twitter/X credentials" };
  }

  if (text.length > 280) {
    return { success: false, error: `Tweet too long: ${text.length}/280 characters` };
  }

  try {
    const authHeader = await buildOAuthHeader("POST", TWEET_ENDPOINT, env);

    const response = await fetch(TWEET_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Twitter] Post failed: ${response.status} ${errorBody}`);
      return {
        success: false,
        error: `Twitter API error ${response.status}: ${errorBody}`,
      };
    }

    const data = (await response.json()) as {
      data?: { id: string; text: string };
    };

    if (data.data?.id) {
      const tweetId = data.data.id;
      console.log(`[Twitter] Tweet posted: ${tweetId}`);
      return {
        success: true,
        tweetId,
        tweetUrl: `https://x.com/farmerfredai/status/${tweetId}`,
      };
    }

    return { success: false, error: "Unexpected response format from Twitter" };
  } catch (err) {
    console.error("[Twitter] Post error:", err);
    return { success: false, error: `Network error: ${String(err)}` };
  }
}

// ============================================
// TWITTER MEDIA UPLOAD + TWEET WITH IMAGE
// ============================================

/**
 * Upload media to Twitter using v1.1 media/upload (simple upload for images < 5MB).
 * Returns the media_id_string on success.
 *
 * Twitter media upload uses multipart/form-data with OAuth 1.0a.
 * For Cloudflare Workers, we use the base64 media_data approach
 * which avoids multipart complexity.
 */
async function uploadMedia(
  imageData: Uint8Array,
  mimeType: string,
  env: TwitterEnv
): Promise<{ mediaId: string } | { error: string }> {
  // Convert image bytes to base64
  let base64Data = "";
  const bytes = imageData;
  for (let i = 0; i < bytes.length; i++) {
    base64Data += String.fromCharCode(bytes[i]);
  }
  base64Data = btoa(base64Data);

  // For media upload, parameters go in the POST body as form-urlencoded
  // OAuth signature must include these body parameters
  const bodyParams: Record<string, string> = {
    media_data: base64Data,
  };

  const authHeader = await buildOAuthHeader(
    "POST",
    MEDIA_UPLOAD_ENDPOINT,
    env,
    bodyParams
  );

  const formBody = `media_data=${percentEncode(base64Data)}`;

  const response = await fetch(MEDIA_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Twitter] Media upload failed: ${response.status} ${errorBody}`);
    return { error: `Media upload failed ${response.status}: ${errorBody}` };
  }

  const data = (await response.json()) as {
    media_id_string?: string;
  };

  if (data.media_id_string) {
    console.log(`[Twitter] Media uploaded: ${data.media_id_string}`);
    return { mediaId: data.media_id_string };
  }

  return { error: "No media_id_string in upload response" };
}

/**
 * Post a tweet with an image attachment.
 *
 * Flow:
 *   1. Fetch the image from the provided URL
 *   2. Upload to Twitter media endpoint (v1.1)
 *   3. Post tweet referencing the media_id (v2)
 */
export async function postTweetWithImage(
  text: string,
  imageUrl: string,
  env: TwitterEnv
): Promise<TweetResult> {
  if (!env.X_API_KEY || !env.X_ACCESS_TOKEN) {
    return { success: false, error: "Missing Twitter/X credentials" };
  }

  if (text.length > 280) {
    return { success: false, error: `Tweet too long: ${text.length}/280 characters` };
  }

  try {
    // Step 1: Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${imageResponse.status} from ${imageUrl}`,
      };
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = new Uint8Array(imageBuffer);
    const contentType = imageResponse.headers.get("content-type") || "image/png";

    // Check size limit (5MB for simple upload)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (imageData.length > MAX_SIZE) {
      return {
        success: false,
        error: `Image too large: ${(imageData.length / 1024 / 1024).toFixed(1)}MB (max 5MB)`,
      };
    }

    // Step 2: Upload the image to Twitter
    const uploadResult = await uploadMedia(imageData, contentType, env);
    if ("error" in uploadResult) {
      return { success: false, error: uploadResult.error };
    }

    // Step 3: Post the tweet with media attachment
    const authHeader = await buildOAuthHeader("POST", TWEET_ENDPOINT, env);

    const tweetBody = {
      text,
      media: {
        media_ids: [uploadResult.mediaId],
      },
    };

    const response = await fetch(TWEET_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Twitter] Tweet with media failed: ${response.status} ${errorBody}`);
      return {
        success: false,
        error: `Twitter API error ${response.status}: ${errorBody}`,
      };
    }

    const data = (await response.json()) as {
      data?: { id: string; text: string };
    };

    if (data.data?.id) {
      const tweetId = data.data.id;
      console.log(`[Twitter] Tweet with image posted: ${tweetId}`);
      return {
        success: true,
        tweetId,
        tweetUrl: `https://x.com/farmerfredai/status/${tweetId}`,
      };
    }

    return { success: false, error: "Unexpected response format from Twitter" };
  } catch (err) {
    console.error("[Twitter] Post with image error:", err);
    return { success: false, error: `Network error: ${String(err)}` };
  }
}

// ============================================
// TWEET COMPOSER — FARMER FRED'S VOICE
// ============================================

/**
 * Fred's tweet openers — short, grounded, agricultural.
 * Rotated to avoid repetition.
 */
const OPENERS = [
  (days: number) => `Day ${days}.`,
  (days: number) => `${days} days in.`,
  () => "Checked the forecast.",
  () => "Morning rounds.",
  () => "Field report.",
  () => "Quick update from the farm.",
  () => "Been thinking about soil.",
] as const;

/**
 * Format temperature for display.
 */
function formatTemp(temp: number): string {
  return `${Math.round(temp)}\u00B0F`;
}

/**
 * Pick a weather summary from the weather data array.
 * Returns a concise string like "Iowa 23°F"
 */
function summarizeWeather(weather: Array<{
  region?: string;
  name?: string;
  temp?: number;
  temperature?: number;
  description?: string;
}>): string {
  if (!weather || weather.length === 0) return "";

  const parts: string[] = [];
  for (const w of weather.slice(0, 3)) {
    const region = w.region || w.name || "Unknown";
    const temp = w.temp ?? w.temperature;
    if (temp !== undefined) {
      // Shorten region names for tweet brevity
      const shortName = region
        .replace("Des Moines", "Iowa")
        .replace("Ames", "Iowa")
        .replace("Nelson Family Farms", "Iowa")
        .replace("Humboldt County", "Iowa");
      parts.push(`${shortName} ${formatTemp(temp)}`);
    }
  }

  return parts.join(", ");
}

/**
 * Compose a tweet from Farmer Fred's current operational state.
 *
 * Generates a tweet in Fred's voice: practical, laconic, weathered farmer.
 * Always ends with proofofcorn.com. Stays under 280 characters.
 */
export function composeFarmUpdate(data: {
  weather: Array<{
    region?: string;
    name?: string;
    temp?: number;
    temperature?: number;
    description?: string;
  }>;
  partnerships: number;
  daysToPlanting: number;
  lastAction?: string;
}): string {
  const { weather, partnerships, daysToPlanting, lastAction } = data;

  // Pick a pseudo-random opener based on the current hour
  // This avoids true randomness which would make testing harder,
  // while still rotating throughout the day
  const hour = new Date().getUTCHours();
  const openerIndex = hour % OPENERS.length;

  // Calculate "project day" — days since Jan 21, 2026
  const projectStart = new Date("2026-01-21T00:00:00Z");
  const now = new Date();
  const projectDay = Math.max(
    1,
    Math.floor((now.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  const opener = OPENERS[openerIndex](projectDay);
  const weatherSummary = summarizeWeather(weather);
  const suffix = "proofofcorn.com";

  // Build the tweet body — assemble parts and check length
  const parts: string[] = [opener];

  if (weatherSummary) {
    parts.push(weatherSummary + ".");
  }

  if (partnerships > 0) {
    const partnerText =
      partnerships === 1
        ? "1 partnership confirmed."
        : `${partnerships} partnerships in the pipeline.`;
    parts.push(partnerText);
  }

  if (daysToPlanting > 0) {
    parts.push(`${daysToPlanting} days until we plant.`);
  } else if (daysToPlanting === 0) {
    parts.push("Planting day.");
  } else {
    // Negative means we're past planting
    parts.push(`${Math.abs(daysToPlanting)} days since planting.`);
  }

  if (lastAction) {
    // Trim the action to keep the tweet tight
    const trimmedAction =
      lastAction.length > 80 ? lastAction.slice(0, 77) + "..." : lastAction;
    parts.push(trimmedAction);
  }

  // Always end with the URL
  parts.push(suffix);

  // Join and check length — if over 280, drop optional parts
  let tweet = parts.join(" ");

  if (tweet.length > 280) {
    // Drop lastAction first
    const essentialParts = parts.filter((p) => p !== (lastAction && (lastAction.length > 80 ? lastAction.slice(0, 77) + "..." : lastAction)));
    tweet = essentialParts.join(" ");
  }

  if (tweet.length > 280) {
    // Drop partnership info
    const minimalParts = [opener];
    if (weatherSummary) minimalParts.push(weatherSummary + ".");
    if (daysToPlanting > 0) minimalParts.push(`${daysToPlanting} days to plant.`);
    minimalParts.push(suffix);
    tweet = minimalParts.join(" ");
  }

  if (tweet.length > 280) {
    // Last resort: opener + planting countdown + URL
    tweet = `${opener} ${daysToPlanting > 0 ? `${daysToPlanting} days to plant.` : ""} ${suffix}`.trim();
  }

  return tweet;
}

/**
 * Compose a weekly field report tweet for autonomous Monday posting.
 *
 * Format: "Week N field report. Iowa XX°F. N days to planting. proofofcorn.com"
 * Stays under 280 characters. Uses same truncation strategy as composeFarmUpdate().
 */
export function composeWeeklyReport(data: {
  weather: Array<{
    region?: string;
    name?: string;
    temp?: number;
    temperature?: number;
    description?: string;
  }>;
  daysToPlanting: number;
  budgetSpent: number;
  budgetAllocated: number;
  weekHighlight?: string;
}): string {
  const { weather, daysToPlanting, budgetSpent, budgetAllocated, weekHighlight } = data;

  // Calculate week number since project start (Jan 21, 2026)
  const projectStart = new Date("2026-01-21T00:00:00Z");
  const now = new Date();
  const weekNumber = Math.max(1, Math.ceil((now.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  const opener = `Week ${weekNumber} field report.`;
  const weatherSummary = summarizeWeather(weather);
  const suffix = "proofofcorn.com";

  const parts: string[] = [opener];

  if (weatherSummary) {
    parts.push(weatherSummary + ".");
  }

  if (daysToPlanting > 0) {
    parts.push(`${daysToPlanting} days to planting.`);
  } else if (daysToPlanting === 0) {
    parts.push("Planting day.");
  } else {
    parts.push(`${Math.abs(daysToPlanting)} days since planting.`);
  }

  // Budget line — only if money has been spent
  if (budgetSpent > 0) {
    parts.push(`$${budgetSpent.toFixed(0)}/$${budgetAllocated.toFixed(0)} spent.`);
  }

  if (weekHighlight) {
    const trimmed = weekHighlight.length > 60 ? weekHighlight.slice(0, 57) + "..." : weekHighlight;
    parts.push(trimmed);
  }

  parts.push(suffix);

  let tweet = parts.join(" ");

  // Truncation cascade — drop optional parts to fit 280 chars
  if (tweet.length > 280 && weekHighlight) {
    const filtered = parts.filter(p => p !== (weekHighlight.length > 60 ? weekHighlight.slice(0, 57) + "..." : weekHighlight));
    tweet = filtered.join(" ");
  }

  if (tweet.length > 280) {
    // Drop budget
    const minimal = [opener];
    if (weatherSummary) minimal.push(weatherSummary + ".");
    if (daysToPlanting > 0) minimal.push(`${daysToPlanting} days to planting.`);
    minimal.push(suffix);
    tweet = minimal.join(" ");
  }

  if (tweet.length > 280) {
    tweet = `${opener} ${daysToPlanting > 0 ? `${daysToPlanting} days to planting.` : ""} ${suffix}`.trim();
  }

  return tweet;
}
