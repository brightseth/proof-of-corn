/**
 * WEATHER TOOL
 *
 * Fetches weather data from OpenWeatherMap for all regions.
 */

import { CONSTITUTION } from "../constitution";

interface OpenWeatherResponse {
  current: {
    temp: number;
    humidity: number;
    weather: Array<{ main: string; description: string }>;
  };
  daily: Array<{
    dt: number;
    temp: { min: number; max: number };
    weather: Array<{ main: string; description: string }>;
  }>;
}

export interface RegionWeather {
  region: string;
  temperature: number;
  humidity: number;
  conditions: string;
  forecast: string;
  plantingViable: boolean;
  frostRisk: boolean;
  soilTempEstimate: number;
}

/**
 * Fetch weather for all regions
 */
export async function fetchAllRegionsWeather(
  apiKey: string
): Promise<RegionWeather[]> {
  const results: RegionWeather[] = [];

  for (const region of CONSTITUTION.regions) {
    try {
      const weather = await fetchRegionWeather(
        apiKey,
        region.name,
        region.coordinates.lat,
        region.coordinates.lon
      );
      results.push(weather);
    } catch (error) {
      console.error(`Failed to fetch weather for ${region.name}:`, error);
      results.push({
        region: region.name,
        temperature: 0,
        humidity: 0,
        conditions: "Unknown (API error)",
        forecast: "Unable to fetch forecast",
        plantingViable: false,
        frostRisk: true,
        soilTempEstimate: 0
      });
    }
  }

  return results;
}

/**
 * Fetch weather for a specific region
 */
export async function fetchRegionWeather(
  apiKey: string,
  regionName: string,
  lat: number,
  lon: number
): Promise<RegionWeather> {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=minutely,hourly,alerts`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: OpenWeatherResponse = await response.json();

  // Calculate planting viability
  const temp = data.current.temp;
  const soilTempEstimate = estimateSoilTemperature(temp);
  const frostRisk = temp < 36 || data.daily.some(d => d.temp.min < 32);

  // Corn needs soil temp > 50°F for germination
  const plantingViable = soilTempEstimate >= 50 && !frostRisk;

  // Build 7-day forecast summary
  const forecastDays = data.daily.slice(0, 7);
  const avgHigh = forecastDays.reduce((sum, d) => sum + d.temp.max, 0) / 7;
  const avgLow = forecastDays.reduce((sum, d) => sum + d.temp.min, 0) / 7;
  const forecast = `7-day outlook: Highs ${Math.round(avgHigh)}°F, Lows ${Math.round(avgLow)}°F. ${
    frostRisk ? "FROST RISK present." : "No frost expected."
  }`;

  return {
    region: regionName,
    temperature: Math.round(temp),
    humidity: data.current.humidity,
    conditions: data.current.weather[0]?.description || "Unknown",
    forecast,
    plantingViable,
    frostRisk,
    soilTempEstimate: Math.round(soilTempEstimate)
  };
}

/**
 * Estimate soil temperature from air temperature
 * Simplified model - soil lags air temp by ~10 degrees in winter
 */
function estimateSoilTemperature(airTemp: number): number {
  const month = new Date().getMonth();

  // In winter months, soil is warmer than air (lag effect)
  // In summer months, soil is cooler than air
  if (month >= 11 || month <= 2) {
    // Dec-Feb: soil is about 10°F warmer than air
    return airTemp + 10;
  } else if (month >= 3 && month <= 5) {
    // Mar-May: soil catching up, about 5°F diff
    return airTemp + 5;
  } else if (month >= 6 && month <= 8) {
    // Jun-Aug: soil slightly cooler
    return airTemp - 5;
  } else {
    // Sep-Nov: soil cooling slower
    return airTemp + 5;
  }
}

/**
 * Determine if it's a good day to plant
 */
export function evaluatePlantingConditions(weather: RegionWeather): {
  recommendation: "PLANT" | "WAIT" | "HOLD";
  reason: string;
} {
  if (weather.frostRisk) {
    return {
      recommendation: "HOLD",
      reason: "Frost risk detected. Wait for stable temperatures above 36°F."
    };
  }

  if (weather.soilTempEstimate < 50) {
    return {
      recommendation: "WAIT",
      reason: `Soil temperature estimated at ${weather.soilTempEstimate}°F. Corn needs 50°F+ for germination.`
    };
  }

  if (weather.soilTempEstimate >= 50 && weather.soilTempEstimate < 60) {
    return {
      recommendation: "WAIT",
      reason: `Soil at ${weather.soilTempEstimate}°F. Optimal is 60°F+. Planting possible but germination will be slow.`
    };
  }

  return {
    recommendation: "PLANT",
    reason: `Conditions favorable. Soil temp ~${weather.soilTempEstimate}°F, no frost risk. Good planting window.`
  };
}
