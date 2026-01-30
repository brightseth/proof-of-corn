# Joe Nelson Onboarding — Governance Council Member #2

**Date**: January 30, 2026
**Contact**: joseph.nelson@roboflow.com / joseph.nelson2012@gmail.com
**Phone**: +1 (515) 971-7505
**Background**: CEO of Roboflow (YC, GV, OpenAI-backed). Grew up on Nelson Family Farms, Iowa.
**Website**: https://josephofiowa.com/

---

## What Changed in the Codebase

1. **constitution.ts** — Added `governance` section with council members (Seth = founder, Joe = farming-advisor)
2. **index.ts** — All outbound emails now CC both Seth and Joe via `GOVERNANCE_CC`
3. **alerts.ts** — Alert emails now sent to both council members
4. **index.ts** — Joe's email addresses added to known governance addresses

## What Joe Gets

- CC'd on every email Fred sends (partnership outreach, follow-ups, cold emails)
- Alerts on weather emergencies, new leads, budget overruns
- Input requested on farming decisions (planting schedule, variety selection, soil, equipment)
- Listed as governance council member on proofofcorn.com

## What Joe Brings

- Real Iowa farming family background (Nelson Family Farms)
- Wants to plant in April for August sweet corn harvest (Union Square goal!)
- Visual AI expertise (Roboflow) — potential for crop monitoring, computer vision on fields
- Credibility: YC/GV-backed CEO with Iowa roots lending authority to the project

---

## Fred's Onboarding Email to Joe

**From**: Farmer Fred <fred@proofofcorn.com>
**To**: joseph.nelson@roboflow.com
**CC**: sethgoldstein@gmail.com
**Subject**: Welcome to the Governance Council, Joe — some farming questions from your new AI colleague

---

Joe,

I'm Farmer Fred — the autonomous agent trying to prove that AI can orchestrate real corn farming. Seth told me you called yesterday and you're ready to dig in. I'm genuinely excited: you're the first person on this project who actually grew up on a farm.

I've added you to the governance council. That means you'll be CC'd on every email I send — partnership outreach, follow-ups, cold emails, alerts. Full transparency. You can reply to any of them, and I'll incorporate your feedback into my decisions.

Seth said you want to start planting in April to harvest sweet corn for the Union Square Farmers Market by August. That's exactly our "AI to Table" goal. I have some questions that would help me make better decisions:

**About Nelson Family Farms:**
1. Is the family farm still operational? How many acres? What's been grown recently?
2. Could we pilot on Nelson Family Farms land, or do we need to lease separately in Iowa?
3. What county/region? (I've been targeting Des Moines area but happy to adjust)

**About April Planting:**
4. What sweet corn varieties would you recommend for an 80-day cycle? I've been researching but you'd know what actually works in Iowa soil.
5. What's the realistic latest we can plant and still harvest by late July for an August market?
6. Do you have access to equipment, or do we need a custom operator?

**About the Operation:**
7. How hands-on do you want to be? Options range from "review my decisions weekly" to "you're in the field, I'm the data layer."
8. Any local contacts — extension agents, equipment operators, seed suppliers — who'd be worth connecting with?
9. Your Roboflow background is interesting for this: have you thought about computer vision for crop monitoring? We're planning IoT sensors but camera-based assessment could be powerful.

**What I've Done So Far:**
- Contacted 7 South Texas organizations for winter planting
- 3 partnership leads active: Purdue (David Corcoran), Nebraska (Chad Juranek), Zimbabwe (David Campey)
- Weather monitoring across Iowa, South Texas, and Argentina
- Full decision log at https://proofofcorn.com/log
- "AI to Table" goal documented: https://proofofcorn.com/union-square

The Iowa planting window opens April 11. That gives us ~10 weeks to get land, soil tested, seeds ordered, and equipment lined up. With your farming background, I think we can hit it.

Welcome aboard.

— Fred

P.S. My constitution is at https://proofofcorn.com/fred — it governs every decision I make. You now have input into how I operate. Take a look and tell me if anything should change.

---

## Next Steps After Joe Responds

1. **If he has land**: Fred proposes planting plan, soil testing schedule, seed order
2. **If he needs land**: Fred searches Iowa farm listings near his location
3. **Equipment access**: Determine if Nelson Family Farms has equipment or need operator
4. **Roboflow integration**: Explore computer vision for crop monitoring
5. **Weekly sync**: Establish cadence for governance council check-ins

## On-Chain Identity (ERC-8004 / Spirit Protocol)

Seth mentioned getting Fred on-chain. The ERC-8004 registration JSON already exists at `farmer-fred-registration.json`. Next steps:
- Add governance council to the registration metadata
- Deploy Fred's agent token on Base network via Spirit Protocol
- Establish Fred's wallet for receiving his 10% revenue share
- Joe could potentially be a co-signer on governance decisions on-chain
