# Implementation notes

Notes from implementing the "AI Risk Explorer: Implementation Spec" (workstreams WS1–WS11), November 2026. They list where the build differs from the spec, what needs the owner's decision, and what was left out.

## Phase 2 (November 2026)

- **Framework packs** in `public/toolkit/` (listed in `src/data/templates.ts`): EU AI Act Annex IV, Art. 17, Annex V, Art. 72, Art. 26 and Art. 50; ISO/IEC 42001 Statement of Applicability (CSV, objective headings only, no standard text); NYC Local Law 144 notice and audit summary; Korea AI Basic Act Art. 31 notices; an evidence checklist. EU content was checked line by line against the consolidated AI Act of 27 July 2026 (CELEX 02024R1689-20260727), which marks the Omnibus changes. Notable points: simplified Annex IV form for SMEs and small mid-caps (Art. 11(1)); proportionate QMS (Art. 17(2)); Commission post-market monitoring template due by 2 September 2027 (Art. 72(3)); DPIA cross-references in the FRIA (Art. 27(4)); Art. 26 unchanged.
- **EN 18286 wording corrected.** Implementing Decision (EU) 2026/2274 gives a presumption of conformity with "the requirements covered" by the standard. The site no longer says it presumes compliance with Art. 17 as a whole.
- **Korea:** decree article numbers are left out because sources disagree; the fine (Art. 43) and grace period come from the US International Trade Administration and Korean law firms.
- **Word report** from the register: `src/lib/registerDocx.ts`, using `docx` 9.11.0 (MIT, pinned), loaded only on click (about 118 kB gzip, never preloaded).
- **Sector guides**: `src/data/sectors.ts`, `src/pages/Sectors.tsx`, routes `/sectors/` and `/sectors/<id>/`. EU points cite Annex III from the consolidated text; cases come from each example's incidents.
- Tests: `src/data/__tests__/toolkit.test.ts` (every file listed, licence line, renderable tables, CSV shape), `sectors.test.ts`, `registerDocx.test.ts`, `e2e/phase2.spec.ts`.

## Phase 1 (November 2026)

Phase 1 of `docs/STRATEGY.md`, without the Hostinger items, which the owner moved to a later Phase 4.

- **Start here** (`/start/`, `src/pages/Start.tsx`) and audience links in the home hero.
- **My AI register** (`/register/`, `src/pages/Register.tsx`, logic in `src/lib/register.ts`). Systems are classified with the same `classify()` as the wizard; the actions are the `next` items of each result card, identified by a hash of card and text so ticks survive a rebuild. Stored under the local storage key `are-register-v1`. "Reset my progress" on the About page does not clear it, since it is the user's own work. Imports are validated and cleaned; malformed entries are dropped. The Colorado reminder is only shown for education, employment and essential services, where the link to "consequential decisions" is clear.
- **Accuracy refresh**: EN 18286 (Implementing Decision (EU) 2026/2274), the draft Art. 6 guidelines of 19 May 2026, the AI Act Service Desk and its compliance checker; new glossary terms and an updates entry.
- **Feature counts**: `src/lib/track.ts` sends GoatCounter events (`event-register-add`, `event-register-export-md`, `event-template-…`, `event-quiz-…-done`, `event-classify-result`). Only the feature name is sent. Disclosed on the About page.
- **Header**: the main navigation now collapses into the menu below 1120 px, and the lens label hides below 1200 px. Before this change the lens selector was pushed off-screen between about 900 and 1100 px.
- Shared form pieces moved to `src/components/Choice.tsx` and `src/lib/classifyOptions.ts`.
- Checks: 41 unit tests, full e2e suite (233 passed, 5 screenshot-only skipped) including `e2e/register.spec.ts` and axe on the two new routes, Lighthouse mobile: start 89, register 91 for performance and 100 for the other three categories.

## Status (WS1–WS11)

All workstreams are implemented and committed one per workstream (`ws1:` … `ws11:`).

- `npm run check`: type-check, 32 unit tests, build and postbuild pass.
- `npm run e2e`: about 230 Playwright tests (mobile and desktop) pass, including axe on all 73 routes with zero serious or critical violations, WebGL on and off, and reduced motion.
- Lighthouse (mobile, median of three runs, `docs/lighthouse/summary.txt`): home 85, model/credit 85, rules/eu 86, classify 91 for performance; 100 for accessibility, best practices and SEO on all four.
- First-load JavaScript is about 100 kB gzip (budget 200 kB); three.js loads only with the 3D scenes.

## Deviations from the spec

1. **Visit counter kept.** The spec rules out third-party runtime requests. The owner had explicitly asked for a visit counter, so the cookieless GoatCounter script and the footer total remain. It is disclosed on the About page. Remove the script in `index.html`, `countView` in `src/App.tsx` and `VisitCount` in `src/components/Footer.tsx` to drop it.
2. **AI literacy (EU).** The spec said the Omnibus "removed" the AI literacy duty. Sources say it was reworded (measures to support literacy, without a guaranteed level) and that deployers of high-risk systems must still train overseers. The site says "softened, not removed".
3. **Colorado SB 26-189** includes correction of inaccurate data and human review or reconsideration, in addition to notice and explanation; both are described.
4. **New EU ban date.** The ban on AI that generates non-consensual intimate content or CSAM is shown as applying from 2 December 2026, as in the sources.
5. **Test order.** WS1 e2e tests could only run fully after WS3 (path routing), because hash routes do not return separate documents. The CI gate was enabled with WS3.
6. **Search dialog and 3D scenes load through plain state updates, not `React.lazy`.** On the home page the 2D orbit re-renders every frame, which starved Suspense retries for seconds.
7. **The 2D orbit is still on phones** (and under reduced motion). Animating it there cost about 5 s of blocking time in Lighthouse.
8. **Route titles load on demand** in the client, and the header and footer use light lists (`src/data/fwList.ts`, `src/data/nav.ts`) so the shell does not carry all the data. An integrity test keeps them in sync with the full data.
9. **Static first paint.** Each route's HTML contains a header bar, the page title and its description, replaced by React on load.
10. **Globe arcs** link frameworks that set firm rules (strength 2 or more) on at least half of the same Compare topics, rather than on any shared topic; otherwise almost every pair is linked. The NIST AI RMF has no arcs because it is voluntary throughout.
11. **Quiz index page** (`/quiz/`) was added so the "Quizzes" menu item has a destination.
12. **Lighthouse** runs through `scripts/lighthouse.mjs` (Playwright's Chromium with a debugging port) because `npx lighthouse` could not start Chrome in the build environment. Lighthouse itself is installed temporarily (`npm i --no-save lighthouse@12.2.1`).
13. **Voice example and OWASP**: as the spec allows, the ML Top 10 is used for audio, with a note.

## Needs the owner

- **About page biography**: placeholder `[Author name, role, short bio, link]` in `src/pages/About.tsx` (marked TODO). No details were invented.
- **Licences**: code MIT (`LICENSE`), content CC BY 4.0 (`CONTENT_LICENSE.md`). Please confirm.
- **Citation**: the About page uses "Shafaei, S. (2026). AI Risk Explorer." as given in the spec. The owner's email spells the surname "Shafai"; please confirm the spelling.
- **Report-an-error link** opens a GitHub issue with `.github/ISSUE_TEMPLATE/content-error.md`; the repository must allow issues.

### Compare cells needing owner review

Scored conservatively from the guides on the site:

| Topic | Framework | Score | Reason for review |
|---|---|---|---|
| AI literacy | EU AI Act | 3 | Set by the spec's anchor; the Omnibus softened the duty, so 2 could be argued |
| AI literacy | US laws | 0 | No general duty found in the site's sources |
| AI literacy | China | 0 | No training duty in the rules covered |
| AI literacy | Korea | 1 | Government promotion duty only; worth checking the Act and Decree |
| AI literacy | UK | 0 | No specific duty |
| Banned uses | UK | 1 | Only practice-specific offences (intimate deepfakes) |
| Banned uses | China | 2 | Scored only from practices described on the site |
| Banned uses | GDPR | 2 | No list of bans, but Art. 9 rules out many biometric uses |
| Redress | ISO/IEC 42001 | 1 | A.8 reporting channel, not individual redress |

### Crosswalk cells needing owner review

`src/data/crosswalk.ts` uses only references that already exist in the site's data (`scripts/crosswalk-seed.ts`). Cells marked "—" have no supporting reference on the site, which does not prove the framework is silent. Worth a second look:

- AI literacy for ISO/IEC 42001 is described as "Competence and awareness requirements" without a clause number, because none is cited elsewhere on the site.
- "Event logging" and "Change management" have several empty cells (US, NIST, GDPR, China, Singapore, UK).
- US "Explanation and appeal" combines ECOA/Regulation B with Colorado SB 26-189 (from 2027).

## Facts left out because they could not be verified

- Source URLs for most older cases in the case library (for example Apple Card, SyRI, Amazon recruiting, the Dutch childcare-benefits scandal, Mercadona, HireVue and the Flash Crash). Links are shown only where they were checked: Robodebt Royal Commission, Gender Shades, FTC v. Rite Aid, NYC Local Law 144, Moffatt v. Air Canada, the EchoLeak CVE, three arXiv papers, and the Appendix A sources for the four new examples.
- Five sources block automated checks (CanLII, ISO, ICO, NAIC, Reuters). They were confirmed through search results or Appendix A and should be opened once in a browser.
- Colorado SB 26-189 is not applied to insurance pricing, because it was not confirmed that the new law keeps insurance as a consequential decision.
- The UK "loyalty penalty" rules for insurance are not cited; the UK insurance entry stays general (Consumer Duty and equality law), as the spec asked.
- The public-authority transitional date for legacy high-risk systems (Art. 111) is described without a date.

## Content checks run

- `rg -n "Aug 2027" src`: no results.
- `rg -n "30 June 2026" src`: no results.
- `rg -nP "LLM(0[1-9]|10)(?!:20\d\d)" src`: no results (also enforced by an integrity test).
- `npx tsx scripts/check-links.ts`: 43 URLs, 38 OK, 5 blocked automated checks, 0 broken.
