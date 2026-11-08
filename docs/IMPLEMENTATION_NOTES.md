# Implementation notes

Notes from implementing the "AI Risk Explorer: Implementation Spec" (workstreams WS1–WS11), November 2026. They list where the build differs from the spec, what needs the owner's decision, and what was left out.

## E5: verification and release (November 2026)

From `docs/ENHANCEMENT_PLAN.md`.
- **Layout shift fixed.** On phones the footer sat inside the first screen below the loading skeleton and jumped when the page arrived (CLS 0.085 on most pages). The skeleton now fills the screen height (`PageSkeleton`), so the footer stays below it. CLS is now 0 on all ten measured pages.
- **First paint matches the page.** The home page's prerendered lead was the route description, so its text changed when the app started. `HOME_H1` and `HOME_LEAD` now live in `src/data/routes.ts` and are used by both `Home.tsx` and `scripts/postbuild.ts`.
- **Largest contentful paint.** In Chrome with mobile throttling (4x CPU, slow 4G), the LCP element is the lead paragraph of the prerendered first paint, at about 1.1 s; on pages where the app renders a larger paragraph (an example page, the register) LCP moves to about 1.9 to 2.3 s. It is not a heading, so heading-font preloading is not the cause. Lighthouse's simulated LCP stays at 3.2 to 3.5 s because its simulated first paint is already about 2.7 s: the page preloads about 15 script chunks that share bandwidth with the stylesheet in the simulation. Reaching 2.5 s there would mean changing what is preloaded, which could make the page slower to become interactive on real phones. Not changed; recorded as a possible later improvement.
- Lighthouse (mobile, median of three runs), before (7 November, before E1) and after:

| Page | Performance | LCP | CLS |
|---|---|---|---|
| Home | 85 to 87 | 3.4 s to 3.4 s | 0.085 to 0 |
| Credit scoring example | 85 to 87 | 3.4 s to 3.4 s | 0.085 to 0 |
| EU AI Act guide | 84 to 86 | 3.4 s to 3.4 s | 0.085 to 0 |
| Classify | 87 to 88 | 3.3 s to 3.3 s | 0.085 to 0 |
| Start here | 87 to 89 | 3.4 s to 3.4 s | 0.085 to 0 |
| Register | 89 to 89 | 3.2 s to 3.2 s | 0.041 to 0 |
| Sector guide (finance) | 88 to 90 | 3.3 s to 3.2 s | 0.085 to 0 |
| Toolkit | 87 to 89 | 3.4 s to 3.4 s | 0.085 to 0 |
| Team | 87 to 88 | 3.3 s to 3.3 s | 0.085 to 0 |
| Workshop | 89 to 88 | 3.5 s to 3.5 s | 0.041 to 0 |

  Accessibility, best practices and SEO are 100 on every page, before and after. Total blocking time is 0 to 20 ms (it was 0 to 40 ms). Differences of one or two points are within run-to-run variation.
- **3D map framing (owner's request).** The camera stood at a fixed distance that only framed the outer ring in wide panels (about 1.6:1), so in the near-square home panel the outer ring and its dots were cut off. `FitCamera` in `src/three/Universe.tsx` now sets the distance from the panel's shape whenever it resizes, so the outer ring, its dots and the labels under them fit through a full turn, and centres the drawing vertically with a projection offset. Measured in headless Chromium from 700 to 1920 px wide: every dot stays inside the frame with at least 54 px to spare.
- **Keyboard.** New `e2e/keyboard.spec.ts`: the Learn and Tools menus open, move and close with the keyboard alone, and Escape returns focus to the button; search opened with Ctrl+K returns focus on Escape to the element that had it; the register Backup menu works by keyboard (the Export menu is covered in `e2e/register.spec.ts`).
- **Copy and routes.** No hits for "Ten short questions", "Models</" or "Start with credit scoring" in `src` or `e2e`. Route descriptions checked against the pages that changed (home, Start, register, classify). `route-manifest.json` still lists 84 routes, as before E1.
- **Docs.** README: home, examples, Start, register menus and reports, navigation, the audit and Lighthouse scripts, a section on entitlements, glossary count corrected to 57. `docs/PLAN.md`: structure brought up to date and one "Design and writing rules" section (tokens, card levels, colour and motion, the nine writing rules).
- Not verified: real devices (all measurements are emulated), screen readers other than the accessibility tree checks, and the Word report in desktop Word (checked by reading the file's XML and in the unit test).

## E4: monetisation seams (November 2026)

From `docs/ENHANCEMENT_PLAN.md`. Nothing changes for visitors: everything stays free.
- **A static site cannot enforce paid features.** All code runs in the visitor's browser, so any check could be switched off. Real gating needs an authenticated backend (Phase 4, the move to Hostinger). What exists now are markers, so each future paid feature has one place to change.
- `src/lib/entitlements.ts`: the `Feature` ids, `FREE_FOR_NOW = true`, `hasFeature()` (true for every feature while free), `SHOW_PREMIUM_HINTS = false` (for a later preview mode; nothing reads it yet) and `PREMIUM_SLOTS`, which records the file, place and possible paid version of each insertion point. `src/lib/__tests__/entitlements.test.ts` checks that nothing is gated, that the feature list matches `PREMIUM_SLOTS`, and that each feature id appears in the file its slot names.
- `src/components/Premium.tsx`: `<PremiumSlot>` renders its children with no wrapper element, badge or label (a fragment), so the DOM and layout are unchanged.
- `src/lib/exportFile.ts`: every file the browser builds is saved through `exportFile(kind, blob, filename)`: register Markdown, Word, CSV and JSON; team Markdown, CSV and personal JSON record; SCORM packages; the Compare CSV and PNG; the Crosswalk CSV. Same file names, types and download method as before. Toolkit templates stay plain `<a download>` links to static files (routing them would add a fetch), and the certificate stays a printed page.
- Insertion points: register Word report (`export.word`, in the Export menu items), the summary for management (`export.board-pack`, `src/lib/register.ts`), the register header (`register.multi-register`), the team record tab (`team.shared-workspace`), each toolkit download link (`toolkit.prefilled`) and the workshop slide body (`workshop.white-label`).
- Check: `/register/`, `/team/` (both tabs), `/toolkit/` and `/workshop/` screenshotted before and after, in both themes at 390 and 1440 px: pixel-identical, and the HTML of `main` is identical too.
- Network: the search for `fetch(`, `XMLHttpRequest` and `sendBeacon` finds only calls that predate E4: the toolkit's previews of its own template files and the footer's GoatCounter visit total (added in WS4). E4 adds none.

## E3: journey tools and editorial pass (November 2026)

From `docs/ENHANCEMENT_PLAN.md`.
- Classify: new lead without a hard-coded count ("a few questions"; the wizard shows 9 or 10 questions depending on the answers), the same wording in the route description, "Select all that apply" once per step, and one quiet note ("This is an indication, not legal advice", with the Commission's checker link, `rel="noopener noreferrer"` kept) in place of the yellow banner. It still prints with the result. The "Please choose an answer" text uses the themed amber instead of a fixed dark-theme colour. `src/lib/classify.ts` is unchanged.
- Register: when empty, only "Add your first system", plus a small "Restore a backup (JSON)" link (without it, someone moving to a new computer could not import). With systems: "Add a system", an Export menu (Markdown report, Word report, CSV, Print) and a Backup menu (Back up (JSON), Import JSON). Both menus use `src/components/ActionMenu.tsx`: `aria-expanded`, arrow keys, Escape returns focus, a click outside or Tab closes. New lead and empty-state copy from the directive, adjusted to say "risk level under the EU AI Act". The yellow box is now one small line under the lead; the short line "Indicative, not legal advice." stays beside each system's classification (the plan's deviation).
- `summary()` and `summaryLines()` in `src/lib/register.ts`: systems (and retired), EU categories most severe first, systems with open actions, the next three dates from the register's own `deadlines()`, and five open actions taken one per system in turn from the most severe system down. Both the Markdown and Word reports start with "Summary for management"; the old table is now "Systems at a glance". Unit tests: empty, one banned, mixed tiers, deadline order; the Word test checks the new section.
- Classification logic was already shared (`register.ts` calls `classify()`), so nothing changed there.
- Editorial pass: em dashes in `src` down from 118 to 48. The four lab data files (`classical`, `genai`, `deep`, `agentic`) now have none; the rest are code comments, simulated screen text inside the examples (chat replies, file titles) and "no value" placeholders. No date, article, figure, URL or case outcome changed. Four memo cards (spam filter, face recognition, emotion recognition, foundation model) were rewritten from third-person descriptions into a person speaking, keeping their own figures; the other 21 already spoke. Announcing phrases ("in plain words") removed from the glossary lead and the guide definitions note. A check for long sentences repeated across files found only two, both intended (a form question shared by classify and the register, and a workshop prompt quoting its example).
- Tests changed: `e2e/register.spec.ts` and `e2e/phase2.spec.ts` now open the Export or Backup menu before choosing an item (the buttons they clicked moved into the menus); a new test covers the empty state and the menu keyboard behaviour.

## E2: visual hierarchy and polish (November 2026)

From `docs/ENHANCEMENT_PLAN.md`.
- Type and spacing tokens at `:root` (shared by both themes): body 17 px (was 16) at 1.65, lead, h1, h2 and h3 sizes, `--section-gap`, `--card-pad`; `--measure` is now 68ch and caps prose in `.narrow` and `.stack` blocks. Headings use `text-wrap: balance`.
- Section spacing: `.section` gets half the gap as top and bottom padding, so neighbouring sections sit one full gap apart. The directive suggested a `section + section` margin, but many sections sit inside wrappers and grids where a sibling rule would not apply.
- Cards: `.card` stays flat; `.card.raised` (one featured item per page: the Start path, the empty register, the guide summary) and `.card.quiet` (secondary notes). Tilt now applies only to link cards (`a.card.lift`).
- Examples map: labels are placed nearest first and drawn only if they clear the labels already placed and stay inside the frame; the hovered node always shows its label. In the SVG this happens at render; in the 3D scene a small `Declutter` component in `src/three/Universe.tsx` checks about eight times a second and changes only label opacity on the DOM, so React does not re-render. Measured in headless Chromium: no overlapping or clipped labels, 13 to 15 of 25 shown. The flat map (shown with reduced motion or without WebGL) also scales its labels to the drawn size, so they stay about 11 px on screen (they were near 6 px once the map moved into the half-width hero), and keeps names off the centre of other dots; it shows about 5 names at 390 px, 12 at 1440 px and 19 at 768 px. The map panel has a border and shadow so it reads as a deliberate frame in the light theme.
- Example pages: the framework table shows four rows (the lens framework first if one is set, then the EU AI Act, then the site's usual order) and a "Show all {n} frameworks" button with `aria-expanded`. With a lens set, the rules section below shows only that framework, so clicking another framework's row switches the lens back to all frameworks and opens that tab.
- Framework guides: an "In one minute" card under the header with what it is (opening of `intro`), who it covers (opening of `who`) and the next future entry of `timeline`, omitted when there is none. `splitOpening()` in `src/lib/util.ts` takes the first sentence, or two when the first is under 40 characters; the lead continues with the rest of the intro, so nothing is said twice at the top. A unit test checks the split loses nothing on every framework.
- Contrast: axe passed in both themes without changing any colour values.
- Gate: type check, 72 unit tests, 379 browser tests (both themes), site audit of 84 routes at 375 and 1366 px with no issues; screenshots of the six key pages in both themes at 390 and 1440 px reviewed, no horizontal or header overflow on any of them.

## E1: one clear path (November 2026)

From `docs/ENHANCEMENT_PLAN.md`.
- Home: new headline and lead (the framework count in words is computed), one primary button to `/register`, one secondary to the credit example (now carries the tour's `model-card` anchor), a computed counts line, one link to `/start`, the map as a `<figure>` with caption and progress ring below. Order: hero, How it works, deadlines, three task cards, latest two updates, examples list in a `<details>` (open when a lens is active; `#all-examples` kept).
- The prerendered first paint (`scripts/postbuild.ts`, `HOME_H1`) carries the new headline; the home description in `routes.ts` matches it.
- Navigation: Start here, My AI register, Frameworks, Examples, Learn, Tools. Compare moved to a `more` group (footer, mobile menu, search) and a button on `/rules`. The lens select, its mobile copy and the lens bar show only on `''`, `model`, `lab` and `rules` (the pages that call `useLens`).
- Header width: the nav collapses into the menu below 1240 px (was 1120); the "View through" label is hidden visually at all widths (it never fitted beside the longer nav, as the content width tops out near 1200 px), but stays in the accessibility tree; the select keeps a tooltip. Measured: no overflow from 1241 to 1920 px.
- `/start`: compliance path first as a five-step stepper (five columns from 1100 px, two from 640 px), other roles as `<details>` cards that open from old `#role` links; chip row and "What you get" labels removed.
- Tour: no automatic pill; `startTour()` from the Start page and the footer (opens `/?tour=1` when not on the home page).
- Tests: new `e2e/journey.spec.ts`; `e2e/register.spec.ts` start test rewritten because the persona links it clicked were removed.

## Light theme (November 2026)

- `:root[data-theme='light']` in `src/styles.css` redefines every colour token; an inline script in `index.html` (same text as `THEME_BOOT` in `src/lib/theme.ts`, checked by a unit test) sets `data-theme` before the first paint from the saved choice (`are-theme`) or the system setting. `useTheme` follows system changes until the visitor chooses. The header button switches and updates the `theme-color` meta tag.
- Dark islands: `.figure` (simulations) and `.stage` (3D pyramid, globe, home map) re-declare the dark tokens, so their many hand-tuned dark colours stay correct in the light theme.
- Category colours (risk levels, AI families, harm types, Compare series, status pills) are `var(--c-name, darkHex)` (`themed()` in `src/data/palette.ts`); the light theme gives each a deeper shade that reaches 4.5:1 on white, and dark islands reset them to the fallback. `solid()` extracts the hex for WebGL; `alpha()` uses `color-mix` instead of appending hex alpha.
- About 90 hard-coded colours in the stylesheet and page components were replaced with tokens; the certificate, memo, news clipping and template preview keep their paper look on purpose, and the Compare PNG export stays dark.
- Verification: axe colour contrast on all 84 routes in both themes (light via the smoke test, which now runs in the browser's default light preference; dark in `e2e/theme.spec.ts`), plus tests for the switch, persistence and the dark simulation panel.

## Visual pass and site review (November 2026)

- **Where visuals were added, and why there:** the EU risk pyramid on `/rules/eu` (the central concept of the Act; 3D with `src/three/Pyramid.tsx`, flat SVG fallback, full text panel in `src/components/RiskPyramid.tsx`, data in `src/data/euTiers.ts` checked against Arts. 5, 50, 99, 111 and 113); a small pyramid marker on classification results and register entries; a category bar and deadline timeline in the register (`src/components/RegisterCharts.tsx`); a life-cycle map of templates on the toolkit (stage field in `src/data/templates.ts`); a sector-by-rule matrix on `/sectors` (matrix field in `src/data/sectors.ts`); a 60-minute agenda bar on the workshop slides; progress meters in the team record. Elsewhere the existing simulations, globe and timelines already carry the visual load, so nothing was added.
- 3D is used only for the pyramid, where the shape itself carries meaning; charts stay 2D. The 3D scene loads lazily through `SceneShell`, falls back to the SVG on phones, reduced motion, data saver or missing WebGL, and is decorative (`aria-hidden`); the buttons and text panel are the accessible version.
- Colours: the risk palette is a severity scale used with labels everywhere. The dataviz validator flags the orange/yellow pair as close for colour-only reading, so every new visual also separates levels by position, label and gaps.
- **Review fixes:** Manrope's standard ligatures turned "(c)" into "©" in legal references across the site (now disabled); horizontal overflow on phones in the sector matrix (absolutely positioned screen-reader text escaping the scroll box), two example pages (a non-wrapping reference and a chart label); a second `h1` on the workshop page; a heading-level skip on the case library; small step buttons in the classifier; agenda labels hidden from screen readers on phones.
- `scripts/audit.mjs`: checks every route at 375 and 1366 px for console errors, overflow, stray "undefined"/"NaN" text, heading order, a single `h1`, small targets, missing alt text, duplicate titles and broken internal links. Run it against `npm run preview -- --port 4174`.

## Phase 3 (November 2026)

- **Team training** (`/team/`, `src/pages/Team.tsx`, logic in `src/lib/team.ts`). The plan is encoded in the link (base64url JSON, validated against known tracks and quizzes), so there is no server. Each person downloads a JSON record (progress, quiz scores, an optional reflection); the manager imports records and exports Markdown or CSV. Records are self-reported and not tamper-proof, and the page says so. Framed after the Commission's AI literacy Q&A: no certificate needed, no obligation to measure knowledge, an internal record of training is enough; enforcement by national market surveillance authorities from 2 August 2026.
- **Learning objectives** for every track (`src/data/tracks.ts`, moved out of the page), shown on the tracks page and in team plans.
- **Workshop slides** (`/workshop/`, content in `src/data/workshop.ts`): 13 slides with time slots, tasks and facilitator notes (purpose, prompts, misconceptions, links to the rules), keyboard control, full screen, a print handout and `#n` deep links. The facilitator guide in the toolkit was rewritten to match. Learning-science claims in the notes are sourced (pretesting effect: Kornell, Hays and Bjork 2009; implementation intentions: Gollwitzer and Sheeran 2006).
- **SCORM 1.2 export** of every quiz from `/quiz/#lms` (`src/lib/scorm.ts`, `src/lib/scormRuntime.ts`, a small store-only ZIP writer in `src/lib/zip.ts`). Manifest per the ADL SCORM 1.2 packaging model with `masteryscore` 80; the SCO finds the `API` object in parent frames or the opener, sets `incomplete` on first launch, reports the best score as `cmi.core.score.raw` (0–100) with `passed`/`failed`, and sets `session_time` and calls `LMSFinish` on leaving. Tested in `e2e/phase3.spec.ts` against a stand-in LMS that records every API call; not yet tried on a real LMS. XSD files are not bundled; most LMSs do not need them.
- Not done in this phase: translations (needs the owner's choice of languages and native-speaker review), verifiable certificates (needs the Phase 4 backend), new scenarios.

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
