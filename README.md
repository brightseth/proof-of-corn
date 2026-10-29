# Proof of Corn 🌽

**Can AI grow corn?**

A case study in vibe coding and autonomous orchestration.

**Live site**: [proofofcorn.com](https://proofofcorn.com)

**#1 on Hacker News** · 476 points, 307 comments · Jan 23, 2026 · [read the thread](https://news.ycombinator.com/item?id=46735511)

---

## The Origin

**January 21, 2026** — Walking from House of Nanking on Kearny Street to 1 Hotel San Francisco by the Embarcadero, [@fredwilson](https://x.com/fredwilson) challenged [@seth](https://x.com/seth):

> "Well, you can't grow corn."

The argument: AI can write code, but it can't affect the physical world. It can't make things grow.

**This repo is the response.**

---

## What This Is

This is not a simulation. This is not a metaphor.

We are growing **actual corn** — from seed to harvest — with every management decision made by Claude Code (Opus 4.6). The AI aggregates sensor data, weather forecasts, and satellite imagery to coordinate human operators who execute the physical work.

**The thesis**: AI doesn't need to drive a tractor. It needs to orchestrate the systems and people who do.

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE (Brain)                       │
│   • Decision making based on real-time data                 │
│   • Coordination of all contractors and services            │
│   • Documentation and logging of all operations             │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  DATA INPUTS  │   │  ORCHESTRATION  │   │    OUTPUTS      │
├───────────────┤   ├─────────────────┤   ├─────────────────┤
│ • IoT sensors │   │ • Custom farmer │   │ • Decisions log │
│ • Weather API │   │ • Seed supplier │   │ • Commands sent │
│ • Satellite   │   │ • Equipment     │   │ • Harvest data  │
│ • Soil data   │   │ • Payments      │   │ • Actual corn   │
└───────────────┘   └─────────────────┘   └───────────────┘
```

---

## Timeline

| Phase | Date | Status |
|-------|------|--------|
| Challenge accepted | Jan 21, 2026 | ✅ |
| Domain + website deployed | Jan 22, 2026 | ✅ |
| Infrastructure research | Jan 22, 2026 | ✅ |
| Platform accounts (ThingsBoard, Weather API) | Jan 2026 | 🔄 |
| Land lease + custom operator contracts | Feb-Mar 2026 | ⏳ |
| IoT sensors deployed | Mar 2026 | ⏳ |
| **Planting** | Apr-May 2026 | ⏳ |
| Growing season (AI managing) | May-Sep 2026 | ⏳ |
| **Harvest** | Oct 2026 | ⏳ |

---

## The Stack

| Component | Purpose |
|-----------|---------|
| **Claude Code (Opus 4.6)** | Decision engine — makes all farming decisions |
| **ThingsBoard** | IoT platform for real-time sensor data |
| **OpenWeatherMap** | Weather forecasts for planting/irrigation decisions |
| **Leaf Agriculture** | Satellite imagery (NDVI) for crop health |
| **Custom Operator (Iowa)** | Human execution of physical operations |
| **5 Acres (Iowa)** | The actual land |

---

## What's in This Repo

```
proof-of-corn/
├── README.md                  # You are here
├── CASE_STUDY.md              # Full documentation for the case study
├── INFRASTRUCTURE.md          # Setup guide, contacts, rates
├── BUDGET.md                  # Detailed cost/revenue projections
├── OUTREACH_LOG.md            # All emails sent, response tracking
├── SENSOR_KIT.md              # IoT hardware shopping list
├── SOCIAL.md                  # Twitter/LinkedIn/HN drafts
├── decision-engine/
│   ├── farm_manager.py        # Decision-making framework
│   ├── test_weather.py        # Weather API test
│   └── daily_check.py         # Automated daily monitoring
├── sensors/
│   ├── soil_sensor/           # ESP32 firmware (PlatformIO)
│   └── README.md              # Hardware setup guide
├── thingsboard/
│   └── SETUP.md               # Dashboard configuration
├── logs/
│   └── check_*.json           # Daily decision logs
└── proof-of-corn/             # Chronicle website (Next.js)
    └── src/app/
        ├── page.tsx           # Home
        ├── story/page.tsx     # Origin story
        ├── log/page.tsx       # Decision log
        └── process/page.tsx   # How it was built
```

---

## Why "Vibe Coding"?

This project didn't start with a prompt like "generate a farming app."

It started with a conversation between two friends walking through San Francisco at night. The idea emerged from that conversation. Claude Code then collaborated to:

1. **Research** — Iowa farming timelines, custom operator rates, land costs
2. **Architect** — Design the orchestration system
3. **Build** — Decision engine, website, documentation
4. **Deploy** — Domain registered, site live, all in one session

**Vibe coding** is about collaborating with AI to bring ideas into reality — not just generating code from prompts.

---

## Budget

| Item | Cost |
|------|------|
| Domain (proofofcorn.com) | $12.99 |
| IoT sensors | ~$300 |
| Land lease (5 acres) | ~$1,400 |
| Custom operator | ~$800 |
| Seeds + misc | ~$400 |
| **Total investment** | **~$2,900** |
| **Expected harvest value** | **~$4,000** |

---

## Follow Along

- **Website**: [proofofcorn.com](https://proofofcorn.com)
- **The Story**: [proofofcorn.com/story](https://proofofcorn.com/story)
- **Decision Log**: [proofofcorn.com/log](https://proofofcorn.com/log)

---

## Credits

- **[@seth](https://x.com/seth)** — Human collaborator
- **[@fredwilson](https://x.com/fredwilson)** — The challenge
- **Claude Code (Opus 4.6)** — AI orchestrator

---

## License

MIT

---

*The corn doesn't grow itself. But Claude doesn't touch a single seed either.*

*What matters is the outcome: real corn, from real decisions, made by real AI.*
