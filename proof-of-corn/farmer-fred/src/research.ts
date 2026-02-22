/**
 * RESEARCH AUTOMATION MODULE
 *
 * Enables Farmer Fred to autonomously execute research tasks instead
 * of leaving them pending in the queue. Fetches public web data and
 * uses Claude to extract structured findings.
 *
 * Capabilities:
 *   - USDA extension office / land-grant university contacts
 *   - Farmland listings (lease/rental)
 *   - Custom operator rates by region
 *   - Detailed planting outlook (beyond basic weather API)
 *
 * All results cached in KV for 24 hours.
 */

// ============================================
// TYPES
// ============================================

export interface ResearchResult {
  query: string;
  source: string;
  findings: string[];
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
    organization: string;
    role: string;
  }>;
  rawData?: string;
  timestamp: string;
}

export interface ResearchEnv {
  ANTHROPIC_API_KEY: string;
  FARMER_FRED_KV: KVNamespace;
}

interface ClaudeExtractionResponse {
  content: Array<{ type: string; text?: string }>;
}

// ============================================
// CONSTANTS
// ============================================

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const MAX_BODY_LENGTH = 12000; // Max chars to send to Claude for extraction
const FETCH_TIMEOUT_MS = 8000; // 8s fetch timeout (Workers have 30s wall clock)

// Rate limit: max 10 research fetches per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
const RATE_LIMIT_MAX = 10;

// State extension directories by domain — Iowa only (land confirmed)
const EXTENSION_DIRECTORIES: Record<string, { url: string; name: string }> = {
  IA: { url: "https://www.extension.iastate.edu/content/county-offices", name: "Iowa State University Extension" },
};

// State abbreviation lookup for common names
const STATE_ABBREVIATIONS: Record<string, string> = {
  texas: "TX", iowa: "IA", illinois: "IL", indiana: "IN",
  nebraska: "NE", kansas: "KS", minnesota: "MN", missouri: "MO",
  ohio: "OH", wisconsin: "WI", oklahoma: "OK", "south dakota": "SD",
  "north dakota": "ND", michigan: "MI", kentucky: "KY", tennessee: "TN",
  arkansas: "AR", mississippi: "MS", louisiana: "LA", alabama: "AL",
  georgia: "GA", "south carolina": "SC", "north carolina": "NC",
  virginia: "VA", pennsylvania: "PA", "new york": "NY", colorado: "CO",
};

// ============================================
// MAIN ENTRY POINT
// ============================================

/**
 * Execute a research task. This is the main dispatcher that routes
 * research tasks to the appropriate handler based on keywords.
 */
export async function executeResearch(
  task: { type: string; title: string; description: string },
  env: ResearchEnv
): Promise<ResearchResult> {
  const titleLower = task.title.toLowerCase();
  const descLower = task.description.toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // Check rate limit
  const allowed = await checkResearchRateLimit(env);
  if (!allowed) {
    return makeResult(
      task.title,
      "rate-limit",
      ["Research rate limit reached (10/hour). Will retry next cycle."],
      []
    );
  }

  // Check cache first
  const cacheKey = `research:${hashQuery(combined)}`;
  const cached = await env.FARMER_FRED_KV.get(cacheKey, "json") as ResearchResult | null;
  if (cached) {
    console.log(`[Research] Cache hit for: ${task.title.slice(0, 60)}`);
    return cached;
  }

  let result: ResearchResult;

  try {
    if (combined.includes("extension") || combined.includes("county agent") || combined.includes("land-grant")) {
      // Extension office research
      const state = extractState(combined);
      const county = extractCounty(combined);
      result = await searchExtensionOffices(state, county, env);
    } else if (combined.includes("farmland") || combined.includes("land") || combined.includes("lease") || combined.includes("acreage")) {
      // Farmland listing research
      const state = extractState(combined);
      const acreage = extractAcreage(combined);
      const leaseType = combined.includes("annual") ? "annual" as const : "seasonal" as const;
      result = await searchFarmland(state, acreage, leaseType, env);
    } else if (combined.includes("custom operator") || combined.includes("custom rate") || combined.includes("operator rate")) {
      // Custom operator rate research
      const region = extractRegion(combined);
      result = await searchCustomOperatorRates(region, env);
    } else if (combined.includes("planting") || combined.includes("outlook") || combined.includes("forecast")) {
      // Planting outlook research
      const region = extractRegion(combined);
      result = await getPlantingOutlook(region, env);
    } else if (combined.includes("contact") || combined.includes("farming contact") || combined.includes("usda")) {
      // General contact research - combination of extension + USDA
      const state = extractState(combined);
      result = await searchFarmingContacts(state, combined, env);
    } else {
      // Generic research - use DuckDuckGo + Claude
      result = await genericResearch(task.title, task.description, env);
    }

    // Cache the result
    await env.FARMER_FRED_KV.put(cacheKey, JSON.stringify(result), {
      expirationTtl: CACHE_TTL,
    });

    // Increment rate limit counter
    await incrementResearchCount(env);

    return result;
  } catch (error) {
    console.error(`[Research] Failed: ${task.title}`, error);
    return makeResult(
      task.title,
      "error",
      [`Research failed: ${String(error)}`],
      []
    );
  }
}

// ============================================
// EXTENSION OFFICE SEARCH
// ============================================

/**
 * Search for USDA/land-grant university extension office contacts.
 * Uses state extension directories and the NIFA directory.
 */
export async function searchExtensionOffices(
  state: string,
  county?: string,
  env?: ResearchEnv
): Promise<ResearchResult> {
  const stateAbbr = normalizeState(state);
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];
  const sources: string[] = [];

  // 1. Try state-specific extension directory
  const stateDir = EXTENSION_DIRECTORIES[stateAbbr];
  if (stateDir) {
    try {
      const html = await safeFetch(stateDir.url);
      if (html) {
        sources.push(stateDir.url);
        // Extract contact info using Claude if we have env
        if (env) {
          const extracted = await extractContactsWithClaude(
            html,
            `Find extension office contacts for ${state}${county ? `, ${county} county` : ""}. Look for names, emails, phone numbers, and office addresses.`,
            env
          );
          contacts.push(...extracted.contacts);
          findings.push(...extracted.findings);
        } else {
          // Fallback: regex extraction
          const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
          if (emailMatches) {
            const uniqueEmails = Array.from(new Set(emailMatches)).slice(0, 10);
            findings.push(`Found ${uniqueEmails.length} email addresses from ${stateDir.name}`);
            for (const email of uniqueEmails) {
              contacts.push({
                name: "Extension Office",
                email,
                organization: stateDir.name,
                role: "County Extension Agent",
              });
            }
          }
        }
      }
    } catch (e) {
      findings.push(`Could not fetch ${stateDir.name} directory: ${String(e)}`);
    }
  }

  // 2. Try NIFA land-grant college directory
  try {
    const nifaHtml = await safeFetch("https://nifa.usda.gov/land-grant-colleges-and-universities-702");
    if (nifaHtml) {
      sources.push("nifa.usda.gov");
      // Extract relevant land-grant university for this state
      const stateNameFull = Object.entries(STATE_ABBREVIATIONS)
        .find(([, abbr]) => abbr === stateAbbr)?.[0] || state;
      const stateRegex = new RegExp(`${stateNameFull}[^<]{0,500}`, "gi");
      const stateMatches = nifaHtml.match(stateRegex);
      if (stateMatches) {
        findings.push(`Found ${stateNameFull} land-grant university info from NIFA directory`);
        // Extract any URLs or institutions mentioned
        for (const match of stateMatches.slice(0, 3)) {
          const urlMatch = match.match(/https?:\/\/[^\s"<]+/);
          if (urlMatch) {
            findings.push(`Land-grant institution URL: ${urlMatch[0]}`);
          }
        }
      }
    }
  } catch (e) {
    findings.push(`Could not fetch NIFA directory: ${String(e)}`);
  }

  // 3. Use DuckDuckGo for county-specific results
  if (county) {
    const ddgQuery = `${county} county ${state} extension office agent contact`;
    const ddgResults = await searchDuckDuckGo(ddgQuery);
    if (ddgResults.findings.length > 0) {
      sources.push("DuckDuckGo");
      findings.push(...ddgResults.findings);
      contacts.push(...ddgResults.contacts);
    }
  }

  // 4. Claude synthesis if we have env and gathered raw data
  if (env && findings.length > 0) {
    const synthesized = await synthesizeWithClaude(
      `Summarize what we found about extension offices in ${state}${county ? ` (${county} county)` : ""}:\n${findings.join("\n")}`,
      env
    );
    if (synthesized) {
      findings.unshift(synthesized);
    }
  }

  if (findings.length === 0) {
    findings.push(
      `No extension office data found for ${state}${county ? ` / ${county}` : ""}. ` +
      `Try searching directly at https://nifa.usda.gov/land-grant-colleges-and-universities-702`
    );
  }

  return makeResult(
    `Extension offices in ${state}${county ? ` (${county} county)` : ""}`,
    sources.join(", ") || "none",
    findings,
    contacts
  );
}

// ============================================
// FARMLAND SEARCH
// ============================================

/**
 * Search for available farmland for lease.
 * Queries public listing sites and USDA FSA data.
 */
export async function searchFarmland(
  state: string,
  acreage: { min: number; max: number },
  leaseType: "seasonal" | "annual",
  env?: ResearchEnv
): Promise<ResearchResult> {
  const stateAbbr = normalizeState(state);
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];
  const sources: string[] = [];

  // 1. DuckDuckGo search for farmland listings
  const queries = [
    `farmland for ${leaseType} lease ${state} ${acreage.min}-${acreage.max} acres`,
    `farm lease listing ${state} cropland rent`,
    `${state} USDA FSA farm rent land available`,
  ];

  for (const query of queries) {
    const ddgResults = await searchDuckDuckGo(query);
    if (ddgResults.findings.length > 0) {
      sources.push("DuckDuckGo");
      findings.push(...ddgResults.findings);
      contacts.push(...ddgResults.contacts);
    }
  }

  // 2. Try USDA NASS rental rates for context
  try {
    const nassQuery = `${state} cropland cash rent per acre USDA NASS`;
    const nassResults = await searchDuckDuckGo(nassQuery);
    if (nassResults.findings.length > 0) {
      findings.push("--- Rental Rate Context ---");
      findings.push(...nassResults.findings);
    }
  } catch (e) {
    findings.push(`Could not fetch USDA rental rate data: ${String(e)}`);
  }

  // 3. Known farmland listing sites
  const listingSites = [
    `https://www.landwatch.com/land/state/${state.toLowerCase().replace(/\s+/g, "-")}`,
    `https://www.landandfarm.com/search/${stateAbbr}/all-land/`,
  ];

  for (const siteUrl of listingSites) {
    try {
      const html = await safeFetch(siteUrl);
      if (html && env) {
        sources.push(new URL(siteUrl).hostname);
        const extracted = await extractContactsWithClaude(
          html,
          `Extract farmland listings in ${state} between ${acreage.min} and ${acreage.max} acres available for ${leaseType} lease. Look for: location, acreage, price/acre, contact info, key features.`,
          env
        );
        findings.push(...extracted.findings);
        contacts.push(...extracted.contacts);
      }
    } catch (e) {
      // Listing sites may block Workers -- that's fine
      findings.push(`Could not fetch ${new URL(siteUrl).hostname} (may require browser)`);
    }
  }

  // 4. Add USDA FSA county office as a contact resource
  contacts.push({
    name: "USDA Farm Service Agency",
    organization: `USDA FSA - ${state} State Office`,
    role: "Farm Programs / Land Access",
    email: `FSA.${stateAbbr}@usda.gov`,
  });
  findings.push(
    `USDA FSA ${state} office can help with farm loan programs, CRP land availability, and county-level rental data. Contact: FSA.${stateAbbr}@usda.gov`
  );

  if (env) {
    const synthesized = await synthesizeWithClaude(
      `Summarize farmland availability in ${state} for ${acreage.min}-${acreage.max} acres (${leaseType} lease):\n${findings.join("\n")}`,
      env
    );
    if (synthesized) {
      findings.unshift(synthesized);
    }
  }

  return makeResult(
    `Farmland listings in ${state} (${acreage.min}-${acreage.max} acres, ${leaseType})`,
    Array.from(new Set(sources)).join(", ") || "USDA",
    findings,
    contacts
  );
}

// ============================================
// CUSTOM OPERATOR RATES
// ============================================

/**
 * Search for custom farm operator rates (planting, harvesting, spraying, etc.)
 */
async function searchCustomOperatorRates(
  region: string,
  env: ResearchEnv
): Promise<ResearchResult> {
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];
  const sources: string[] = [];

  // 1. Iowa State publishes the most widely-referenced custom rate survey
  try {
    const html = await safeFetch("https://www.extension.iastate.edu/agdm/crops/html/a3-10.html");
    if (html) {
      sources.push("extension.iastate.edu");
      const extracted = await extractContactsWithClaude(
        html,
        `Extract custom farm operator rates from this Iowa State Extension page. Focus on: corn planting rates, harvesting rates, spraying rates, tillage rates. Include per-acre costs and any regional notes. The user is interested in the ${region} region.`,
        env
      );
      findings.push(...extracted.findings);
    }
  } catch (e) {
    findings.push(`Could not fetch Iowa State custom rate survey: ${String(e)}`);
  }

  // 2. DuckDuckGo for region-specific rates
  const ddgResults = await searchDuckDuckGo(
    `custom farm operator rates ${region} corn planting harvesting per acre 2025 2026`
  );
  if (ddgResults.findings.length > 0) {
    sources.push("DuckDuckGo");
    findings.push(...ddgResults.findings);
  }

  // 3. Synthesize
  const synthesized = await synthesizeWithClaude(
    `Summarize custom farm operator rates for corn in ${region}. What would it cost per acre for planting, spraying, and harvesting?\n${findings.join("\n")}`,
    env
  );
  if (synthesized) {
    findings.unshift(synthesized);
  }

  return makeResult(
    `Custom operator rates for ${region}`,
    Array.from(new Set(sources)).join(", ") || "none",
    findings,
    contacts
  );
}

// ============================================
// PLANTING OUTLOOK
// ============================================

/**
 * Get detailed planting outlook for a region, combining weather data
 * with agricultural extension recommendations and USDA crop progress.
 */
export async function getPlantingOutlook(
  region: string,
  env: ResearchEnv
): Promise<ResearchResult> {
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];
  const sources: string[] = [];

  // 1. USDA NASS Crop Progress (weekly reports)
  try {
    const ddgCrop = await searchDuckDuckGo(
      `USDA crop progress report ${region} corn planting 2026`
    );
    if (ddgCrop.findings.length > 0) {
      sources.push("USDA Crop Progress");
      findings.push("--- USDA Crop Progress ---");
      findings.push(...ddgCrop.findings);
    }
  } catch (e) {
    findings.push(`Could not fetch USDA crop progress: ${String(e)}`);
  }

  // 2. Open-Meteo extended forecast (free, no key needed)
  const coords = getRegionCoordinates(region);
  if (coords) {
    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,soil_temperature_6cm_max&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/Chicago&forecast_days=14`;
      const forecastResponse = await fetch(forecastUrl);
      if (forecastResponse.ok) {
        const forecast: any = await forecastResponse.json();
        sources.push("Open-Meteo");
        findings.push("--- 14-Day Weather Forecast ---");

        const daily = forecast.daily;
        if (daily && daily.time) {
          for (let i = 0; i < Math.min(daily.time.length, 14); i++) {
            const date = daily.time[i];
            const high = daily.temperature_2m_max?.[i];
            const low = daily.temperature_2m_min?.[i];
            const precip = daily.precipitation_sum?.[i];
            const soilTemp = daily.soil_temperature_6cm_max?.[i];
            findings.push(
              `${date}: High ${Math.round(high)}F / Low ${Math.round(low)}F, ` +
              `Precip: ${precip?.toFixed(2) || "0.00"}in` +
              (soilTemp ? `, Soil temp: ${Math.round(soilTemp)}F` : "")
            );
          }

          // Analyze soil temperature trend
          const soilTemps = daily.soil_temperature_6cm_max?.filter((t: number) => t != null) || [];
          if (soilTemps.length > 0) {
            const avgSoil = soilTemps.reduce((a: number, b: number) => a + b, 0) / soilTemps.length;
            const lastSoil = soilTemps[soilTemps.length - 1];
            findings.push(
              `Soil temperature trend: avg ${Math.round(avgSoil)}F, ` +
              `latest ${Math.round(lastSoil)}F. ` +
              (lastSoil >= 50 ? "SOIL READY for corn planting (50F+)." : `Need ${Math.round(50 - lastSoil)}F more warming for corn planting.`)
            );
          }

          // Frost risk assessment
          const minTemps = daily.temperature_2m_min?.filter((t: number) => t != null) || [];
          const frostDays = minTemps.filter((t: number) => t <= 32);
          if (frostDays.length > 0) {
            findings.push(`FROST WARNING: ${frostDays.length} day(s) with freezing lows in the 14-day forecast.`);
          } else {
            findings.push("No frost risk in 14-day forecast.");
          }
        }
      }
    } catch (e) {
      findings.push(`Could not fetch extended forecast: ${String(e)}`);
    }
  }

  // 3. Extension planting date recommendations
  const ddgPlanting = await searchDuckDuckGo(
    `optimal corn planting date ${region} 2026 extension recommendation`
  );
  if (ddgPlanting.findings.length > 0) {
    sources.push("Extension recommendations");
    findings.push("--- Extension Planting Guidance ---");
    findings.push(...ddgPlanting.findings);
  }

  // 4. Claude synthesis
  const synthesized = await synthesizeWithClaude(
    `Provide a planting outlook for corn in ${region} based on this data. Should we plant now, wait, or prepare? What are the risks?\n${findings.join("\n")}`,
    env
  );
  if (synthesized) {
    findings.unshift(synthesized);
  }

  return makeResult(
    `Planting outlook for ${region}`,
    Array.from(new Set(sources)).join(", ") || "none",
    findings,
    contacts
  );
}

// ============================================
// GENERAL CONTACT SEARCH
// ============================================

/**
 * Combined search for farming contacts: extension offices, USDA,
 * Farm Bureau, and other agricultural organizations.
 */
async function searchFarmingContacts(
  state: string,
  description: string,
  env: ResearchEnv
): Promise<ResearchResult> {
  const stateAbbr = normalizeState(state);
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];

  // Get extension offices
  const extensionResult = await searchExtensionOffices(state, undefined, env);
  findings.push(...extensionResult.findings);
  contacts.push(...extensionResult.contacts);

  // Add standard USDA contacts for the state
  contacts.push(
    {
      name: "USDA Farm Service Agency",
      organization: `USDA FSA - ${state} State Office`,
      email: `FSA.${stateAbbr}@usda.gov`,
      role: "Farm Programs",
    },
    {
      name: "USDA NRCS",
      organization: `USDA NRCS - ${state}`,
      role: "Natural Resources Conservation Service",
    }
  );

  // Search for Farm Bureau contacts
  const fbResults = await searchDuckDuckGo(
    `${state} Farm Bureau county offices contact directory`
  );
  if (fbResults.findings.length > 0) {
    findings.push("--- Farm Bureau ---");
    findings.push(...fbResults.findings);
    contacts.push(...fbResults.contacts);
  }

  // Search for specific contacts mentioned in description
  if (description.includes("hidalgo") || description.includes("cameron") || description.includes("willacy")) {
    const counties = ["Hidalgo", "Cameron", "Willacy"].filter(c =>
      description.toLowerCase().includes(c.toLowerCase())
    );
    for (const county of counties) {
      const countyResult = await searchDuckDuckGo(
        `${county} county ${state} extension agent agricultural contact`
      );
      if (countyResult.findings.length > 0) {
        findings.push(`--- ${county} County ---`);
        findings.push(...countyResult.findings);
        contacts.push(...countyResult.contacts);
      }
    }
  }

  return makeResult(
    `Farming contacts in ${state}`,
    `extension directories, DuckDuckGo, USDA`,
    findings,
    contacts
  );
}

// ============================================
// GENERIC RESEARCH
// ============================================

/**
 * Fallback: general-purpose research using DuckDuckGo + Claude.
 */
async function genericResearch(
  title: string,
  description: string,
  env: ResearchEnv
): Promise<ResearchResult> {
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];

  // Run a few DuckDuckGo searches based on the description
  const ddgResults = await searchDuckDuckGo(title);
  findings.push(...ddgResults.findings);
  contacts.push(...ddgResults.contacts);

  // Also search with description keywords
  if (description && description !== title) {
    const descResults = await searchDuckDuckGo(description.slice(0, 100));
    findings.push(...descResults.findings);
    contacts.push(...descResults.contacts);
  }

  // Claude synthesis
  if (findings.length > 0) {
    const synthesized = await synthesizeWithClaude(
      `Research task: ${title}\nDescription: ${description}\nFindings so far:\n${findings.join("\n")}\n\nProvide a clear, actionable summary.`,
      env
    );
    if (synthesized) {
      findings.unshift(synthesized);
    }
  } else {
    findings.push(
      `No results found for "${title}". Consider refining the search or checking manually.`
    );
  }

  return makeResult(title, "DuckDuckGo", findings, contacts);
}

// ============================================
// WEB SEARCH HELPERS
// ============================================

/**
 * Search DuckDuckGo instant answer API.
 * Returns structured findings from the API response.
 */
async function searchDuckDuckGo(
  query: string
): Promise<{ findings: string[]; contacts: ResearchResult["contacts"] }> {
  const findings: string[] = [];
  const contacts: ResearchResult["contacts"] = [];

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

    if (!response.ok) {
      return { findings: [`DuckDuckGo search failed: HTTP ${response.status}`], contacts };
    }

    const data: any = await response.json();

    // Abstract (main answer)
    if (data.Abstract) {
      findings.push(data.Abstract);
      if (data.AbstractURL) {
        findings.push(`Source: ${data.AbstractURL}`);
      }
    }

    // Answer (direct answer)
    if (data.Answer) {
      findings.push(`Answer: ${data.Answer}`);
    }

    // Related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) {
          findings.push(topic.Text);
          // Extract emails from topic text
          const emails = topic.Text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
          if (emails) {
            for (const email of emails) {
              contacts.push({
                name: "Contact",
                email,
                organization: "From search results",
                role: "Unknown",
              });
            }
          }
        }
        // Nested topics (categories)
        if (topic.Topics && Array.isArray(topic.Topics)) {
          for (const sub of topic.Topics.slice(0, 3)) {
            if (sub.Text) findings.push(sub.Text);
          }
        }
      }
    }

    // Results (if any)
    if (data.Results && Array.isArray(data.Results)) {
      for (const result of data.Results.slice(0, 3)) {
        if (result.Text) {
          findings.push(result.Text);
        }
      }
    }
  } catch (e) {
    findings.push(`DuckDuckGo search error: ${String(e)}`);
  }

  return { findings, contacts };
}

/**
 * Fetch a URL safely with timeout and error handling.
 * Returns the text body or null on failure.
 */
async function safeFetch(url: string): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      console.log(`[Research] Fetch failed: ${url} -> ${response.status}`);
      return null;
    }
    const text = await response.text();
    // Strip HTML tags for cleaner extraction (basic approach for Workers)
    return stripHtml(text);
  } catch (e) {
    console.log(`[Research] Fetch error: ${url} -> ${String(e)}`);
    return null;
  }
}

/**
 * Fetch with a timeout using AbortController.
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FarmerFred/1.0 (Agricultural Research Bot; +https://proofofcorn.com)",
        "Accept": "text/html,application/json",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// CLAUDE EXTRACTION HELPERS
// ============================================

/**
 * Use Claude to extract structured contact info and findings from raw text.
 */
async function extractContactsWithClaude(
  rawText: string,
  instruction: string,
  env: ResearchEnv
): Promise<{ findings: string[]; contacts: ResearchResult["contacts"] }> {
  // Truncate to fit within reasonable token limits
  const truncated = rawText.slice(0, MAX_BODY_LENGTH);

  const prompt = `You are a research assistant helping an agricultural AI agent find contacts and information.

INSTRUCTION: ${instruction}

RAW TEXT (from a web page):
${truncated}

Respond ONLY with valid JSON in this exact format:
{
  "findings": ["finding 1", "finding 2"],
  "contacts": [
    {"name": "Person Name", "email": "email@example.com", "phone": "555-1234", "organization": "Org Name", "role": "Their Role"}
  ]
}

Rules:
- Only include contacts you actually find in the text
- If no contacts found, return empty contacts array
- Keep findings concise and actionable
- Omit email/phone fields if not found (don't make them up)`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Research] Claude extraction error: ${response.status} - ${error}`);
      return { findings: [`Claude extraction failed: HTTP ${response.status}`], contacts: [] };
    }

    const data: ClaudeExtractionResponse = await response.json();
    const text = data.content.find(c => c.type === "text")?.text || "";

    // Parse JSON from response (strip code blocks if present)
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
    };
  } catch (e) {
    console.error(`[Research] Claude extraction parse error:`, e);
    return { findings: [`Could not parse Claude extraction: ${String(e)}`], contacts: [] };
  }
}

/**
 * Use Claude to synthesize research findings into a summary.
 */
async function synthesizeWithClaude(
  prompt: string,
  env: ResearchEnv
): Promise<string | null> {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        messages: [{
          role: "user",
          content: `You are Farmer Fred's research assistant. Provide a concise, actionable summary (3-5 sentences). Be specific with names, numbers, and next steps.\n\n${prompt}`,
        }],
      }),
    });

    if (!response.ok) return null;

    const data: ClaudeExtractionResponse = await response.json();
    return data.content.find(c => c.type === "text")?.text || null;
  } catch (e) {
    console.error(`[Research] Claude synthesis error:`, e);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Strip HTML tags (basic, for Workers without DOM parser).
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize state input to 2-letter abbreviation.
 */
function normalizeState(input: string): string {
  const upper = input.trim().toUpperCase();
  if (upper.length === 2) return upper;
  return STATE_ABBREVIATIONS[input.trim().toLowerCase()] || upper.slice(0, 2);
}

/**
 * Extract state name/abbreviation from text.
 */
function extractState(text: string): string {
  // Check for 2-letter state codes
  const abbrMatch = text.match(/\b([A-Z]{2})\b/);
  if (abbrMatch && Object.values(STATE_ABBREVIATIONS).includes(abbrMatch[1])) {
    return abbrMatch[1];
  }

  // Check for full state names
  for (const [name, abbr] of Object.entries(STATE_ABBREVIATIONS)) {
    if (text.toLowerCase().includes(name)) {
      return abbr;
    }
  }

  // Default to Iowa (Proof of Corn primary region)
  if (text.includes("iowa") || text.includes("des moines") || text.includes("humboldt")) return "IA";
  if (text.includes("illinois") || text.includes("champaign")) return "IL";

  return "IA"; // Default to Iowa
}

/**
 * Extract county name from text.
 */
function extractCounty(text: string): string | undefined {
  const countyMatch = text.match(/(\w+)\s+county/i);
  return countyMatch ? countyMatch[1] : undefined;
}

/**
 * Extract acreage range from text.
 */
function extractAcreage(text: string): { min: number; max: number } {
  // Look for patterns like "50-100 acres", "100 acres", etc.
  const rangeMatch = text.match(/(\d+)\s*[-–to]+\s*(\d+)\s*acres?/i);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }

  const singleMatch = text.match(/(\d+)\s*acres?/i);
  if (singleMatch) {
    const val = parseInt(singleMatch[1]);
    return { min: Math.max(1, val - 50), max: val + 50 };
  }

  return { min: 40, max: 200 }; // Default range for corn
}

/**
 * Extract region name from text.
 */
function extractRegion(text: string): string {
  // Known Proof of Corn regions — Iowa confirmed
  const regions = [
    "Central Iowa", "Des Moines", "Ames", "Humboldt County",
    "Central Illinois", "Champaign",
  ];

  for (const region of regions) {
    if (text.toLowerCase().includes(region.toLowerCase())) {
      return region;
    }
  }

  // Fall back to state name
  for (const [name] of Object.entries(STATE_ABBREVIATIONS)) {
    if (text.includes(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return "Central Iowa"; // Default
}

/**
 * Get approximate coordinates for a region (for weather API).
 */
function getRegionCoordinates(region: string): { lat: number; lon: number } | null {
  const coords: Record<string, { lat: number; lon: number }> = {
    "central iowa": { lat: 41.59, lon: -93.62 },
    "humboldt county": { lat: 42.72, lon: -94.23 },
    "des moines": { lat: 41.59, lon: -93.62 },
    "ames": { lat: 42.03, lon: -93.47 },
    "central illinois": { lat: 40.12, lon: -88.24 },
    "champaign": { lat: 40.12, lon: -88.24 },
    "indiana": { lat: 39.77, lon: -86.16 },
    "nebraska": { lat: 40.81, lon: -96.7 },
    "kansas": { lat: 38.96, lon: -95.27 },
    "minnesota": { lat: 44.98, lon: -93.27 },
    "missouri": { lat: 38.58, lon: -92.17 },
    "ohio": { lat: 39.96, lon: -83.0 },
    "texas": { lat: 31.0, lon: -97.0 },
    "iowa": { lat: 41.59, lon: -93.62 },
    "illinois": { lat: 40.12, lon: -88.24 },
  };

  return coords[region.toLowerCase()] || null;
}

/**
 * Create a simple hash for cache keys.
 */
function hashQuery(query: string): string {
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Build a ResearchResult object.
 */
function makeResult(
  query: string,
  source: string,
  findings: string[],
  contacts: ResearchResult["contacts"]
): ResearchResult {
  return {
    query,
    source,
    findings,
    contacts,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check if we're within rate limits for research operations.
 */
async function checkResearchRateLimit(env: ResearchEnv): Promise<boolean> {
  const key = `research:rate-limit:${Math.floor(Date.now() / (RATE_LIMIT_WINDOW * 1000))}`;
  const count = await env.FARMER_FRED_KV.get(key);
  return !count || parseInt(count) < RATE_LIMIT_MAX;
}

/**
 * Increment the research rate limit counter.
 */
async function incrementResearchCount(env: ResearchEnv): Promise<void> {
  const key = `research:rate-limit:${Math.floor(Date.now() / (RATE_LIMIT_WINDOW * 1000))}`;
  const count = await env.FARMER_FRED_KV.get(key);
  const newCount = count ? parseInt(count) + 1 : 1;
  await env.FARMER_FRED_KV.put(key, String(newCount), {
    expirationTtl: RATE_LIMIT_WINDOW,
  });
}
