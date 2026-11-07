# AI Risk Explorer

A training website that shows, with working examples, how AI and machine learning systems fail and how ten governance frameworks deal with them.

**Live site:** https://sinash-dev.github.io/ai-risk-observatory/

## What is on the site

- **Models** (`/`, `/model/:id/`): 25 AI uses, from a naive Bayes spam filter to a back-office browser agent with MCP tools, in four families (classical machine learning, deep learning, generative AI, AI agents). A 3D map on the home page, with a 2D fallback. Each example is a case study: memo, simulation with problems and safeguards, risk radar, trade-off gauges, residual risk, how each framework classifies it (with Met / Partly met / Not met against the safeguards switched on), real cases, a before-go-live checklist and workshop prompts. Setups can be shared as links (`?p=…&s=…`).
- **Frameworks** (`/rules/`, `/rules/:fw/`): a 3D globe, a scroll-driven worldwide timeline, and a guide per framework (EU AI Act, US laws, NIST AI RMF, ISO/IEC 42001, OWASP, GDPR, China, Korea, Singapore, UK) with definitions, categories, requirements, timeline, roadmap, who enforces it, myths and a sortable examples table.
- **Compare** (`/compare/`, `/compare/:fw/`): strength grid and radar for 11 topics, scoring rubric, gap finder, CSV and PNG export.
- **Learn**: Basics (`/basics/`), learning tracks for seven roles (`/tracks/`), glossary of 55 terms (`/glossary/`), 14 quizzes (`/quiz/`, `/quiz/:id/`) and a printable certificate (`/certificate/`).
- **Start here** (`/start/`): a suggested route through the site for compliance leads, trainers, product teams and students.
- **Sector guides** (`/sectors/`, `/sectors/<id>/`): banking, insurance, HR, health care, public sector and education.
- **Tools**: My AI register (`/register/`, kept in the browser's local storage, with Markdown, Word, CSV and JSON export and JSON import), classify your system (`/classify/`), controls crosswalk (`/crosswalk/`), toolkit of 21 templates, including framework packs for the EU AI Act, ISO/IEC 42001, NYC Local Law 144 and Korea (`/toolkit/`, files in `public/toolkit/`), case library (`/cases/`).
- **About** (`/about/`) and **Updates** (`/updates/`, RSS at `/updates.xml`).
- **View through**: a switch in the header that shows the whole site through one framework.

Classical models are trained live in the browser on synthetic data. Generative AI and agent behaviour is scripted. Meridian, its people and the headlines in the simulations are fictional.

## Run locally

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run check` | Type-check, unit tests (Vitest) and production build with postbuild |
| `npm run e2e` | Playwright smoke and feature tests on mobile and desktop, with axe accessibility checks (run after a build) |
| `npx tsx scripts/check-links.ts` | Checks every external URL in the data (run by hand, not in CI) |
| `node scripts/lighthouse.mjs 4174` | Lighthouse (mobile) for four pages against a running `vite preview --port 4174`; reports go to `docs/lighthouse/` |
| `npx tsx scripts/crosswalk-seed.ts` | Prints candidate references per framework for curating the crosswalk |

Every push to `main` runs `npm run check` and the Playwright suite, then deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## How it is built

- Vite 5, React 18, TypeScript (strict), framer-motion 11; three.js via @react-three/fiber for the two 3D scenes (lazy-loaded, paused off-screen, 2D fallback for no WebGL, reduced motion, data saver and screens under 640 px).
- Path routing without a router library (`src/lib/util.ts`), base path `/ai-risk-observatory/`. Old `#/` links redirect.
- `scripts/postbuild.ts` writes an `index.html` per route (title, description, canonical, Open Graph, a static first paint and module preloads), `404.html`, `sitemap.xml`, `robots.txt`, `route-manifest.json`, `updates.xml` and Open Graph images (`scripts/og.ts`).
- Pages are code-split; new top-level pages are registered in `src/pages/registry.ts` and listed in `STATIC_PAGES` (`src/data/routes.ts`) and `LIVE_PATHS` (`src/data/nav.ts`).
- Fonts are self-hosted (@fontsource). A cookieless GoatCounter counter records page views; nothing else is sent anywhere.

## Adding an example

1. Add a `LabDef` (`src/data/types.ts`) in `src/labs/`, including `residual`, at least two `discuss` prompts, a five-item `checklist`, stressor `codes` (OWASP 2026 LLM or ASI codes) where they apply, `unmitigable: true` on problems no safeguard can fix, and incidents with a `url` only when the source has been verified.
2. Add a simulation component (it receives `s`, `m` and `live`) and register it in `src/labs/viz.ts`.
3. Add an entry for it in every file in `src/data/fw/`, and a name in `src/data/shortNames.ts`.
4. Add case metadata (jurisdiction, outcome type) in `src/data/cases.ts`.
5. Run `npm run check` and `npm run e2e`. The integrity tests check that every framework covers every example and that every problem can be handled.

## Adding a framework

Add it to `src/data/frameworks.ts` (or `frameworksMore.ts`), create `src/data/fw/<id>.ts` with an entry per example, add its guide content to `src/data/fwGuide.ts`, its cells to `src/data/compare.ts` and `src/data/crosswalk.ts`, a quiz to `src/data/quizzes.ts`, and a line to `src/data/fwList.ts`.

## Licence

Code: MIT (`LICENSE`). Content: CC BY 4.0 (`CONTENT_LICENSE.md`).

---
Legal summaries are simplified and were last reviewed on 6 November 2026; they are not legal advice. See `docs/IMPLEMENTATION_NOTES.md` for open points that need the owner.
