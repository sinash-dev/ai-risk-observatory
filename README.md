# AI Risk Explorer

A training website that shows, with working examples, how AI and machine learning systems fail and how the main governance frameworks deal with them.

**Live site:** https://sinash-dev.github.io/ai-risk-observatory/

## How it is organised

- **Models**: one overview of 21 AI uses, from a naive Bayes spam filter to a multi-agent procurement system, grouped into four families (classical machine learning, deep learning, generative AI, AI agents). Each example has its own page with:
  - a plain explanation of how the model works and the situation it is used in
  - a working simulation: switch on a problem, see what goes wrong, switch on a safeguard and see whether it helps
  - a summary of what is still unhandled and an indicative risk level
  - how each framework classifies the use and what it requires, linked to the safeguards in the simulation
  - real cases from public reporting
- **Rules and frameworks**: a comparison of six frameworks and a full guide to each (who it applies to, categories, key requirements, timeline, penalties, and how it treats every example). Twelve more frameworks are summarised.
- **Basics**: a short tutorial on how models work, where risk comes from, eight kinds of harm, laws vs. standards vs. security guides, and a glossary.
- **View through**: a switch in the header that shows the whole site through one framework (EU AI Act, US federal and state laws, NIST AI RMF, ISO/IEC 42001, OWASP, GDPR). The overview is recoloured by that framework’s categories and model pages show only its requirements.

Classical models (OLS/Huber regression, logistic regression, CART, k-means, seasonal forecasting) are trained live in the browser on synthetic data. Generative AI and agent behaviour is scripted so sessions are free and repeatable.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`. Every push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Adding content

- A new example: add a `LabDef` (see `src/data/types.ts`) and a simulation component in `src/labs/`, then add an entry for it in each file in `src/data/fw/`.
- A new framework: add it to `src/data/frameworks.ts` and create `src/data/fw/<id>.ts` with an entry per example.

---
Meridian and all people and headlines inside the simulations are fictional. Legal summaries are simplified and dated November 2026; they are not legal advice.
