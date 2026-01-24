/**
 * Shared types for Farmer Fred Worker
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  FARMER_FRED_KV: KVNamespace;
  FARMER_FRED_DB: D1Database;
  FARMER_FRED_STATE: DurableObjectNamespace;
  AGENT_NAME: string;
  AGENT_VERSION: string;
}
