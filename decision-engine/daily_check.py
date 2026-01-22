#!/usr/bin/env python3
"""
Proof of Corn - Daily Weather Check
Run this daily to log conditions and update planting decision.

Usage:
    export OPENWEATHER_API_KEY="your-key"
    python daily_check.py

Can be automated with cron:
    0 8 * * * cd /path/to/proof-of-corn && python daily_check.py >> logs/daily.log 2>&1
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
API_KEY = os.getenv("OPENWEATHER_API_KEY")
FARM_LAT = 41.5868
FARM_LON = -93.6250
LOCATION = "Des Moines, Iowa"

# Planting window for Iowa corn
PLANTING_START = (4, 11)  # April 11
PLANTING_END = (5, 18)    # May 18
SOIL_TEMP_THRESHOLD = 50  # °F

# Log directory
LOG_DIR = Path(__file__).parent.parent / "logs"


def get_weather():
    """Fetch current weather and forecast."""
    url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": FARM_LAT,
        "lon": FARM_LON,
        "appid": API_KEY,
        "units": "imperial",
        "exclude": "minutely,hourly"
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"API Error: {response.status_code}")
        return None


def analyze_conditions(data):
    """Analyze weather data and make planting decision."""
    now = datetime.now()
    current = data.get("current", {})
    daily = data.get("daily", [])

    temp = current.get("temp", 0)
    conditions = current.get("weather", [{}])[0].get("description", "unknown")
    humidity = current.get("humidity", 0)

    # Check planting window
    start_date = datetime(now.year, *PLANTING_START)
    end_date = datetime(now.year, *PLANTING_END)

    if now < start_date:
        days_until = (start_date - now).days
        window_status = f"BEFORE_WINDOW ({days_until} days until April 11)"
        in_window = False
    elif now > end_date:
        window_status = "PAST_WINDOW (yields may be reduced)"
        in_window = False
    else:
        window_status = "IN_WINDOW"
        in_window = True

    # Temperature check (using air as proxy for soil)
    temp_ready = temp >= SOIL_TEMP_THRESHOLD

    # 5-day precipitation forecast
    precip_5day = sum(day.get("rain", 0) for day in daily[:5]) / 25.4  # mm to inches

    # Decision
    if in_window and temp_ready:
        decision = "PLANT"
        rationale = "Conditions favorable"
    elif not in_window:
        decision = "WAIT"
        rationale = window_status
    else:
        decision = "WAIT"
        rationale = f"Temperature {temp:.0f}°F below {SOIL_TEMP_THRESHOLD}°F threshold"

    return {
        "timestamp": now.isoformat(),
        "location": LOCATION,
        "current": {
            "temp": temp,
            "feels_like": current.get("feels_like", 0),
            "humidity": humidity,
            "conditions": conditions,
            "wind_speed": current.get("wind_speed", 0)
        },
        "forecast_5day": {
            "precip_total_inches": round(precip_5day, 2),
            "temps": [(day.get("temp", {}).get("min", 0), day.get("temp", {}).get("max", 0)) for day in daily[:5]]
        },
        "analysis": {
            "window_status": window_status,
            "in_window": in_window,
            "temp_ready": temp_ready,
            "days_until_window": (start_date - now).days if now < start_date else 0
        },
        "decision": {
            "action": decision,
            "rationale": rationale
        }
    }


def log_check(result):
    """Save check to daily log file."""
    LOG_DIR.mkdir(exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    log_file = LOG_DIR / f"check_{date_str}.json"

    with open(log_file, "w") as f:
        json.dump(result, f, indent=2)

    # Also append to running log
    running_log = LOG_DIR / "all_checks.jsonl"
    with open(running_log, "a") as f:
        f.write(json.dumps(result) + "\n")

    return log_file


def print_report(result):
    """Print human-readable report."""
    print("=" * 60)
    print("🌽 PROOF OF CORN - Daily Check")
    print(f"   {result['timestamp']}")
    print("=" * 60)
    print()

    c = result["current"]
    print(f"LOCATION: {result['location']}")
    print(f"CURRENT:  {c['temp']:.0f}°F (feels like {c['feels_like']:.0f}°F)")
    print(f"          {c['conditions']}, {c['humidity']}% humidity")
    print(f"          Wind: {c['wind_speed']:.0f} mph")
    print()

    a = result["analysis"]
    print(f"WINDOW:   {a['window_status']}")
    print(f"TEMP:     {'✓ Ready' if a['temp_ready'] else '✗ Too cold'} ({c['temp']:.0f}°F / {SOIL_TEMP_THRESHOLD}°F needed)")
    print()

    f = result["forecast_5day"]
    print(f"5-DAY:    {f['precip_total_inches']:.1f}\" precipitation expected")
    print()

    d = result["decision"]
    emoji = "🌱" if d["action"] == "PLANT" else "⏳"
    print(f"DECISION: {emoji} {d['action']}")
    print(f"REASON:   {d['rationale']}")
    print()
    print("=" * 60)


def main():
    if not API_KEY:
        print("Error: OPENWEATHER_API_KEY not set")
        sys.exit(1)

    # Get weather
    data = get_weather()
    if not data:
        print("Failed to get weather data")
        sys.exit(1)

    # Analyze
    result = analyze_conditions(data)

    # Log
    log_file = log_check(result)

    # Report
    print_report(result)
    print(f"Logged to: {log_file}")


if __name__ == "__main__":
    main()
