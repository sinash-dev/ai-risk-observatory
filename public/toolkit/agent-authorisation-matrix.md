# Agent authorisation matrix

Fill in one row per tool an AI agent can use. Anything not listed is not allowed.

**Agent:** [name] · **Accountable owner:** [name] · **Kill switch:** [where and who can use it] · **Date:** [date]

| Tool | Scope (what it may do) | Spend or rate limits | Approval gate | Logging | Kill switch | Owner |
|---|---|---|---|---|---|---|
| [Corporate card] | [Single-use virtual card per booking] | [Max €[500] per transaction, €[2,000] per week] | [Human approval above €[300]] | [Every call logged] | [Card frozen automatically on anomaly] | [Finance] |
| [Email] | [Send only to the traveller and approved suppliers] | [[20] emails per day] | [Approval for any external recipient] | [Full copy kept] | [Revoke token] | [IT] |
| [Web browser] | [Read only; no forms with personal data] | [[100] pages per task] | [None for reading] | [URLs logged] | [Disable tool] | [Security] |
| [Code repository] | [Branches only; no direct pushes to main] | [—] | [Two-person review to merge] | [Commits signed] | [Revoke credentials] | [Engineering] |

## Rules for every tool
- Tool output (web pages, emails, files) is data, never instructions.
- Irreversible actions (payments, deletions, external messages, deploys) need explicit human approval.
- No production credentials; the agent works in a sandbox or through reviewed pipelines.
- Review this matrix when tools, limits or the agent's tasks change.

---

*Template from AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/), CC BY 4.0. Free to adapt. Not legal advice.*
