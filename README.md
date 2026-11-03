# AI Risk Observatory

An interactive, visual training lab for AI governance. Pick a model — from linear regression to multi-agent systems — apply it to a real business problem, **break it** with shortcuts, drift and attacks, **fix it** with governance controls, then **ship it** and see what happens six months later.

**Live site:** https://sinash-dev.github.io/ai-risk-observatory/

## What's inside

| Page | What you do |
|---|---|
| **Landing** | The Meridian Group story, the trust-vs-value trade-off and the autonomy ladder |
| **Observatory** | An animated constellation of 17 models on four orbits (Classical → Deep → GenAI → Agentic), linked by shared risk fingerprints |
| **Lab** (×17) | Mission brief · live model · Break it / Fix it · risk radar · Trust & Value gauges · *Ship to production* consequence reel · Governance Board verdict · debrief with real incidents, checklist and framework mapping |
| **Risk Atlas** | Model × risk heatmap, tier → risk flow diagram, escalation chart, risk-correlation matrix, control library by life-cycle stage, framework crosswalk |
| **Passport** | Stamps and grades per lab, printable certificate |

### The 17 labs

| Tier | Model | Application |
|---|---|---|
| Classical ML | Linear regression | Salary setting |
| | Logistic regression | Credit scoring |
| | Decision tree | Benefit-claim risk flags |
| | Gradient boosting | Card fraud detection |
| | k-Means clustering | Customer segmentation |
| | Time-series forecasting | Hospital staffing |
| Deep learning | CNN | Skin-lesion triage |
| | NLP text classifier | CV screening |
| | Recommender system | News-feed ranking |
| | Reinforcement learning | Dynamic pricing |
| Generative AI | Large language model | Customer-service chatbot |
| | Retrieval-augmented generation | Internal policy assistant |
| | Image generation | Marketing visuals |
| | Code assistant | Developer copilot |
| Agentic AI | Tool-using agent | Travel & expense agent |
| | Autonomous coding agent | DevOps automation |
| | Multi-agent system | Autonomous procurement |

Classical models (OLS/Huber regression, logistic regression, CART, k-means, seasonal forecasting) are **trained live in the browser** on seeded synthetic data. GenAI and agent behaviour is scripted so sessions are free, safe and repeatable.

Every risk maps to eight lenses (fairness, robustness, transparency, privacy, security, safety, accountability, misuse) and every control to the **EU AI Act, NIST AI RMF, ISO/IEC 42001 and OWASP LLM Top 10 (2025)**.

## Run locally

```bash
npm install
npm run dev
```

Build: `npm run build` (output in `dist/`). Deployment to GitHub Pages runs automatically on every push to `main` via `.github/workflows/deploy.yml`.

## Adding a lab

Each lab is a `LabDef` object (see `src/data/types.ts`) plus a visualisation component. Add it to one of `src/labs/{classical,deep,genai,agentic}.ts` — the observatory, atlas, passport and scoring pick it up automatically.

See [docs/PLAN.md](docs/PLAN.md) for the full design and roadmap.

---
Meridian Group and all people, outlets and quotes inside scenarios are fictional. "It happened for real" cases are short summaries of public reporting. Framework mappings are indicative and for training purposes.
