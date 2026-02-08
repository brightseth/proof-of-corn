# Growing Corn with Claude Code

**A Case Study for Fred Wilson**

**Started**: January 22, 2026
**Goal**: Prove that AI can orchestrate the physical world - specifically, grow actual corn
**Challenge**: "You can't grow corn" - Fred Wilson

---

## The Thesis

Claude Code isn't just a coding assistant. It's an orchestration layer that can coordinate real-world operations through APIs, contracts, and human contractors. To prove this, we will grow actual corn - from seed to harvest - with Claude making all management decisions.

---

## Architecture: Claude as Farm Manager

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE (Brain)                       │
│   - Decision making based on real-time data                 │
│   - Coordination of all contractors and services            │
│   - Documentation and logging of all operations             │
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
└───────────────┘   └─────────────────┘   └─────────────────┘
```

---

## The Plan: 5 Phases

### Phase 1: Setup (January-February 2026)
**Duration**: 2-3 weeks

- [ ] Set up ThingsBoard Cloud account (free tier, 30 devices)
- [ ] Create Leaf Agriculture API account for unified farm data
- [ ] Research custom operators in Iowa via [Wisconsin Custom Operators](https://wiscustomoperators.org/directory/) and [MIFarmLink](https://mifarmlink.org/find-a-farmer)
- [ ] Identify 5-10 acre plot options (lease or custom farm arrangement)
- [ ] Document total budget and timeline

**Budget Estimate**:
- ThingsBoard: Free (Community Edition)
- Leaf Agriculture API: Contact for pricing (per-use model available)
- Land lease: ~$180-250/acre in Iowa ([Agweek](https://www.agweek.com/opinion/challenging-land-rental-negotiations-for-2026))
- Custom operator fee: ~$100-150/acre for full service

### Phase 2: Contracts & Infrastructure (February-March 2026)
**Duration**: 4-6 weeks

- [ ] Execute land lease agreement (target: 5 acres in central Iowa)
- [ ] Contract with custom operator for planting, cultivation, harvest
- [ ] Purchase and install IoT sensor kit:
  - Soil moisture sensors (3-5 per field)
  - Temperature/humidity sensors
  - ESP32 microcontroller for data transmission
  - Estimated cost: $200-500 for basic kit
- [ ] Connect sensors to ThingsBoard
- [ ] Set up automated alerts and decision rules
- [ ] Purchase seed corn (variety TBD based on local conditions)

**Key Decision**: Custom farming vs. crop-share lease
- **Custom farming**: We pay operator per-service, keep 100% of crop
- **Crop-share**: 2/3 tenant, 1/3 landowner split ([MU Extension](https://extension.missouri.edu/publications/g424))

### Phase 3: Planting (April-May 2026)
**Target Window**: April 15 - May 18, 2026

Per [Iowa State Extension](https://crops.extension.iastate.edu/blog/mark-licht-zachary-clemens/corn-and-soybean-planting-date-considerations):
- Optimal planting: April 11 - May 18 for 95%+ yield
- Soil temp must be >50°F consistently
- Earlier is better than later (yield loss from late planting)

**Claude's Role**:
1. Monitor soil temperature via IoT sensors
2. Check 10-day weather forecast via API
3. When conditions meet threshold, notify custom operator to plant
4. Log decision rationale and execution

**Inputs Needed**:
- Seed: ~35,000 seeds/acre for field corn
- Fertilizer: Based on soil test (coordinate with operator)
- Planting depth: 2-2.5 inches

### Phase 4: Growing Season (May-September 2026)
**Duration**: ~120 days (full corn growing cycle)

**Monitoring & Decisions**:

| Week | Stage | Claude's Decisions |
|------|-------|-------------------|
| 0-2 | Emergence | Monitor soil moisture, assess stand count |
| 3-6 | V3-V6 | Weed control timing, nitrogen application |
| 7-10 | V12-VT | Irrigation decisions, pest scouting alerts |
| 11-14 | R1-R3 | Pollination monitoring, disease detection |
| 15-18 | R4-R6 | Maturity tracking, harvest timing |

**Data Sources**:
- ThingsBoard: Real-time soil moisture, temp, humidity
- Leaf API: Satellite imagery (NDVI for crop health)
- Weather API: Precipitation forecast, heat units (GDDs)
- Local extension reports: Pest/disease alerts

**Irrigation Decision Logic** (example rule):
```
IF soil_moisture < 40%
AND forecast_rain_48h < 0.5"
AND growth_stage IN [V12-R3]
THEN trigger_irrigation_alert(custom_operator)
AND log_decision("Irrigation needed: low moisture, no rain forecast")
```

### Phase 5: Harvest (October 2026)
**Target**: When grain moisture reaches 20-25%

**Claude's Role**:
1. Monitor grain moisture (sensor or operator reports)
2. Check weather window (dry conditions needed)
3. Coordinate harvest timing with custom operator
4. Arrange grain storage or sale
5. **Document final yield** - this is the proof for Fred

**Expected Yield**: 180-220 bushels/acre in good conditions

---

## Budget Summary

| Item | Estimated Cost |
|------|----------------|
| Land lease (5 acres × $200) | $1,000 |
| Custom operator services | $500-750 |
| Seed corn | $150-200 |
| Fertilizer/inputs | $200-300 |
| IoT sensor kit | $300-500 |
| Contingency | $300 |
| **Total** | **$2,500 - $3,000** |

---

## Success Metrics

1. **Physical corn harvested** - Photos, video, bags of corn to show Fred
2. **Complete decision log** - Every Claude decision timestamped
3. **Yield data** - Bushels harvested, compared to county average
4. **Timeline documentation** - Start to finish with actual dates
5. **Cost accounting** - Every dollar tracked

---

## Why This Works

The insight is that Claude doesn't need to drive a tractor. It needs to:

1. **Aggregate data** from multiple sources (sensors, weather, satellite)
2. **Make decisions** based on agricultural best practices
3. **Coordinate humans** who execute physical tasks
4. **Document everything** for accountability

This is exactly what a farm manager does - except Claude does it 24/7, responds to real-time data, and scales infinitely.

---

## API & Service Stack

| Service | Purpose | URL |
|---------|---------|-----|
| ThingsBoard | IoT platform for sensors | [thingsboard.io](https://thingsboard.io/) |
| Leaf Agriculture | Unified farm data API | [withleaf.io](https://withleaf.io/) |
| OpenWeatherMap | Weather forecasts | [openweathermap.org](https://openweathermap.org/) |
| Farmonaut | Satellite crop monitoring | [farmonaut.com](https://farmonaut.com/) |
| Wisconsin Custom Operators | Find contractors | [wiscustomoperators.org](https://wiscustomoperators.org/directory/) |

---

## Timeline

```
Jan 22, 2026   ← TODAY: Project initiated
Feb 2026      ← Contracts signed, sensors ordered
Mar 2026      ← Sensors installed, platform configured
Apr 15-May 18 ← PLANTING WINDOW
May-Sep 2026  ← Growing season (Claude managing)
Oct 2026      ← HARVEST
Nov 2026      ← Case study complete, show Fred the corn
```

---

## Log

### January 22, 2026
- Project created
- Research completed on custom farming, IoT platforms, corn growing timeline
- Architecture designed
- Case study document drafted
- **Next**: Create accounts, start contacting custom operators

---

## For Fred

When you read this, we will have:
- Actual ears of corn grown from seed
- A complete log of every AI-driven decision
- Proof that Claude Code can coordinate the physical world

The corn didn't grow itself. But neither did Claude touch a single seed.

**The future of AI isn't replacement. It's orchestration.**

---

*Project by Seth Goldstein, orchestrated by Claude Code (Opus 4.6)*
