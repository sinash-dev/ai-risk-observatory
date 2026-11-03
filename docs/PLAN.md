# AI Risk Observatory — Development Plan

## 1. Positioning
An explorable, visual training lab for AI governance. Learners pick a **model**, pick an **application**,
then **break it**, **fix it** and **ship it** — watching real (in-browser) model behaviour, live risk metrics
and the consequences of their choices. It blends:

- **Proposal 2 (Observatory)** — free exploration of 17 labs on a constellation map, a risk atlas and a mitigation library.
- **Proposal 1 (Ship It)** — every lab opens with a mission brief from Meridian Group leadership, tempting
  "business shortcuts" that raise the Value score, a **Ship to production → 6 months later** consequence reel,
  and a **Governance Board** verdict (Trust × Value).

## 2. Story line
You are the new **AI Product Lead at Meridian Group** — a fictional conglomerate (Meridian Bank, Meridian Health,
Meridian Retail, Meridian Air, Meridian Media, Meridian Works). Leadership wants AI everywhere, fast.
Each lab is a launch. You are measured on two scores that pull in opposite directions:

| Score | Goes up when… | Goes down when… |
|---|---|---|
| **Value** | you take shortcuts (more data, proxies, autonomy, engagement) | you add controls that cost speed or accuracy |
| **Trust** | you mitigate risks | risks are left unmanaged at ship time |

Core lesson, repeated across tiers: **autonomy and capability raise the ceiling of value and of harm.**

## 3. Information architecture
| Route | Purpose |
|---|---|
| `#/` | Landing — animated hero, the Meridian story, the Autonomy Ladder, how it works |
| `#/observatory` | Constellation map — 17 models on 4 orbital rings, correlation links (shared risk profiles), lens filter |
| `#/lab/:id` | The Lab — brief, live model, Break it / Fix it, risk radar, Ship → consequence reel, debrief |
| `#/atlas` | Risk Atlas — model × risk heatmap, tier→risk flow diagram, risk escalation curve, mitigation lifecycle |
| `#/passport` | Progress stamps, grades, printable certificate |

## 4. Model coverage (17 labs, 4 tiers)
| Tier | Model | Application | Engine |
|---|---|---|---|
| Classical | Linear regression | Salary setting | Real OLS / Huber regression |
| Classical | Logistic regression | Credit scoring | Real gradient-descent training, threshold slider |
| Classical | Decision tree | Benefit-claim risk flags | Real CART, live tree diagram, protected-split detection |
| Classical | Gradient boosting | Fraud detection | Score-distribution simulation, confusion matrix, SHAP waterfall |
| Classical | k-Means | Customer segmentation | Real animated k-means on a city map |
| Classical | Time-series forecast | Hospital staffing | Seasonal forecast with regime shock |
| Deep | CNN (vision) | Skin-lesion triage | Procedural lesions, saliency maps, adversarial noise |
| Deep | NLP classifier | CV screening | Token attributions, counterfactual swaps |
| Deep | Recommender | News feed | 60-day feedback-loop simulation |
| Deep | Reinforcement learning | Dynamic pricing | Reward curves, surge & collusion simulation |
| GenAI | LLM chatbot | Customer service | Scripted chat, guardrail-dependent replies |
| GenAI | RAG | Policy assistant | Animated retrieval pipeline |
| GenAI | Image generation | Marketing visuals | Generated avatar grid, provenance |
| GenAI | Code assistant | Developer copilot | Streaming editor with scanner findings |
| Agentic | Tool-using agent | Travel & expense | Step-by-step agent trace with tools |
| Agentic | Autonomous coding agent | DevOps automation | Agent trace with shell, DB and deploy gates |
| Agentic | Multi-agent system | Procurement | Animated agent network with cascades |

## 5. Risk model
Eight risk lenses: Fairness, Robustness & drift, Transparency, Privacy, Security, Safety, Accountability, Misuse.
Each lab defines a base risk vector; **stressors** (kind: *shortcut* / *event* / *attack*) add risk, shortcuts add Value;
**mitigations** neutralise the stressors they counter (residual 15%) and cost Value.
Each mitigation is tagged with a lifecycle stage (Data → Design → Validate → Deploy → Monitor) and mapped to
NIST AI RMF, EU AI Act, ISO/IEC 42001 and OWASP LLM Top 10 (2025) where relevant.

## 6. Lab screen anatomy
1. Mission brief (message from Meridian leadership, KPI target)
2. Live model stage (custom animated visualisation + real metrics)
3. Break it — stressor cards; Fix it — mitigation cards with cost and "counters" chips
4. Live risk radar + Trust / Value gauges
5. Ship to production → "6 months later" reel: headlines, affected-person quotes, regulator letter, Board verdict
6. Debrief — real-world incidents, framework mapping, checklist, printable Model Risk Card

## 7. Design system
Dark "observatory" theme (ink navy, glass panels, glow accents), tier colours
(Classical teal, Deep violet, GenAI amber, Agentic coral), one colour per risk lens.
Type: Space Grotesk (display), Inter (UI), JetBrains Mono (code / metrics).
Motion: Framer Motion page/element transitions, animated SVG/canvas visualisations, tweened numbers & radar.

## 8. Tech
Vite + React + TypeScript, Framer Motion, no backend. Classical models run in the browser on seeded synthetic data
(deterministic). GenAI and agent behaviour is scripted so it is free, safe and repeatable in training.
Progress saved in localStorage. Hash routing for GitHub Pages; deployed via GitHub Actions.

## 9. Roadmap
- **v1 (this build):** all 17 labs, 5 pages, consequence reel, passport, Pages deploy.
- **v1.1:** facilitator mode (projector layout, timer), team leaderboard, translations.
- **v1.2:** SCORM/xAPI export for LMS, optional live-LLM mode with organisation API key, custom scenario authoring (JSON).
