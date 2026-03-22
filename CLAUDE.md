# FRED — Proof of Corn

## Git Workflow
Always commit and push changes before ending a session. Seth works across multiple machines.

## @seth Reporting
```bash
echo '{"type":"TYPE","summary":"SUMMARY","from":"standalone-grow-corn-challenge"}' > ~/.seth/inbox/$(date +%s).json
```
Types: `decision` | `task` | `update` | `urgent` | `calendar`

## Available Skills

Key skills available in every CC session:

| Command | What it does |
|---------|-------------|
| `/deploy` | Rsync to agent server + PM2 restart + health verify |
| `/debug` | Symptom-driven runbooks (gateway down, agent crash, pipeline stuck, telegram silent, connectivity) |
| `/wire` | Send messages to other agents/projects via @seth message bus |
| `/status` | Cross-project status synthesis |
| `/session-start` | Full context briefing |
| `/session-end` | Commit + deploy + wire state sync |

Type `/` to see all available skills.

## Fleet Protocol
Read `~/.seth/agents/FLEET_PROTOCOL.md` on session start for cross-machine memory and Telegram coordination instructions.
