/**
 * Shared types for Farmer Fred Worker
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  FARMER_FRED_KV: KVNamespace;
  FARMER_FRED_STATE: DurableObjectNamespace;
  AGENT_NAME: string;
  AGENT_VERSION: string;
}
