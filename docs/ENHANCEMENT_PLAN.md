# Enhancement plan (E1 to E5)

Based on the owner's "Enhancement Directive" of 8 November 2026, checked against the code on the same day. Phases are named E1 to E5 so they do not clash with the earlier Phases 1 to 3 (already shipped) or with Phase 4 (the Hostinger move). Translations stay paused; see `docs/TRANSLATION_PLAN.md`.

**Status:** E1 done and live (commit d5f5b75, 8 November 2026). E2 done and live (commit 66984e5). E3 done and live (commit 0d7a4a0). E4 done (8 November 2026). E5 not started; it waits for the owner's go-ahead.

## 1. What was checked, and the verdict on each part of the directive

| Directive item | Checked in the code | Verdict |
|---|---|---|
| F1–F2, 1.1 Hero rewrite, one primary button to `/register` | Hero has two buttons, four persona links, four stat cards, tour pill. Confirmed. | **Accept.** "Nine other frameworks" is computed (`FRAMEWORKS.length - 1`), never typed. |
| 1.1 (missed by the directive) | `scripts/postbuild.ts` writes the old home headline into the static first paint of every page build. | **Add:** update the prerendered home headline too, or the first paint shows the old text and LCP is measured on it. |
| F3, 1.2 Home as a story; examples list in a closed `<details>` | List and orbit both present. Tour anchor `data-tour="orbit"` is on the map. | **Accept.** The list stays in the DOM as the accessible alternative to the map. |
| F4, 2.3 Orbit label collisions (SVG only) | At 1440 px with WebGL the map is the **3D** scene, which always shows every label (`.u-label` in `Universe.tsx`). The SVG is only the fallback. | **Adjust:** declutter labels in both. SVG: the collision check as written. 3D: hide labels that overlap a nearer one, using the screen positions the scene already projects; hovered label always on top. No change to colours, rotation or fallback logic. |
| 2.3 Legend out of the canvas | The legend is already HTML (`.hero-legend`) but clips on narrow widths. | **Adjust:** make it wrap above the map. |
| F5, 1.3 Navigation | Top level today: Start here, Models, Frameworks, Compare, Learn, Tools. `useLens` is used only by Home, Frameworks, Model (and Header). | **Accept.** Lens select shown only on `/`, `/rules/*`, `/model/*`. Rename "Models" to "Examples". Add "My AI register" to the top level, move Compare into the Frameworks page and footer. Re-measure the header at 1121–1440 px: it overflowed there once before. |
| 1.3 Search shortcut chip wraps | Confirmed in screenshots. | **Accept.** |
| F6, 1.4 `/start/` as a decision | Steps grid is `auto-fill, minmax(280px)`, so step 5 is orphaned. | **Accept.** |
| 1.5 Retire the tour pill | Pill in `Tour.tsx`; no test depends on it. Tour steps point at home elements. | **Accept.** The "Take the tour" button opens `/` with a flag that starts the tour once the anchors exist. |
| F7, 3.1 Classify copy | Lead says "Ten short questions"; the wizard shows 9 by default. | **Accept.** Count derived from the visible steps. |
| F8, 3.2 Register toolbar as two menus | Seven buttons confirmed. Three e2e tests click "Export report (Markdown)", "Export report (Word)" and "Back up (JSON)". | **Accept.** One accessible menu component, reused. The tests are updated, and the commit says so. |
| 3.2 Disclaimer only in footer and exports | | **Adjust:** keep one short line "Indicative, not legal advice" beside the classification result in the register. The strategy's legal-risk notes (legal-services rules, liability) need it where the result is shown. |
| 3.2 Management summary: deadlines "from the home deadline strip" | The home strip lists framework-wide dates. The register already computes per-system dates with `deadlines()`, including Colorado. | **Adjust:** use the register's own `deadlines()`, which are about the reader's systems. |
| 3.2 Register and classify share logic? | `register.ts` calls `classify()` already. | **No change needed.** |
| F11, 3.3 Editorial pass | 118 em dashes in `src` (directive: 117). `<Term>` component exists. | **Accept,** with the existing rules: human tone, British spelling, no change to any legal date, article, fine, URL or case outcome. Integrity tests guard these. |
| 4.1 Entitlements module | | **Accept.** Code comments and notes say plainly that a static site cannot enforce paid features. |
| 4.2 Route every download through `exportFile()` | Register, team, Word and SCORM downloads build files in the browser. Toolkit templates are static `<a download>` links. The certificate is printed, not downloaded. | **Adjust:** route the browser-built files through `exportFile()`. Leave toolkit links as links (routing them would add a fetch, which the directive's own gate forbids) and the certificate as print. |
| 4.3 `<PremiumSlot>` wrappers | | **Accept.** Renders its children with no extra element, so the DOM and layout are unchanged. |
| F12, Phase 5 performance targets | Saved report: FCP 2.9 s, LCP 3.4 s (mobile, simulated slow 4G). It does not name the LCP element. | **Accept the targets as goals.** Re-measure, find the element, fix the causes (the heading font is likely not preloaded), and report the numbers honestly if 2.5 s is not reached without larger changes. |
| Guardrails (no new dependencies, no new network calls, keep URLs, themes, reduced motion, no-WebGL) | | **Accept.** |

Additions from the site-wide view (apply in every phase):
- New CSS uses logical properties (`margin-inline-start`, `inset-inline-end`, `text-align: start`) so the right-to-left work for Arabic and Persian keeps working.
- Run the contrast checks in **both** themes at every gate, not only in E2.
- Add an entry to the updates log for visible changes, and keep `src/data/routes.ts` descriptions in line with the new copy (the home description changes).
- Training and legal text keep to the agreed writing style: human tone, no AI-style phrasing, sources for any claim.
- Commits are named `enh1:` … `enh5:`.

## 2. Phases

### E1. One clear path
Hero and home story; navigation; `/start/`; tour pill.
- Hero: new headline and lead, one primary button ("Check your first AI system", to `/register`) and one secondary button (the credit example), one link to `/start`, one computed counts line, progress ring below the map, caption under the map.
- Home order: hero, How it works (List, Classify, Report), deadline strip, three task cards, latest two updates, examples list in a closed `<details>`.
- Navigation: Start here, My AI register, Frameworks, Examples, Learn, Tools. Classify first in Tools. Compare moves to the Frameworks page and footer, and stays in search. Lens select only where it works, with a short explanation. Search chip on one line.
- `/start/`: compliance path first as a five-step stepper (five columns from 1100 px, two from 640 px, one below); other roles as three `<details>` cards; no chip row, no "What you get:" labels.
- Tour: no pill; "Take the 60-second tour" on `/start` and in the footer.
- Postbuild first-paint headline updated.

**Gate:** `npm run check`, `npm run e2e`, plus a new `e2e/journey.spec.ts`:
- one primary button in the hero, linking to `/register/`;
- headline at most three lines at 1440 px;
- nothing fixed overlaps the hero buttons at 390 px;
- search button on one line at 1280 px;
- five steps in one row at 1280 px;
- the header does not overflow at 1121, 1280 and 1440 px.

Then the site audit at 375 and 1366 px, and both themes.

### E2. Visual hierarchy and polish
- Type and spacing tokens at `:root`; applied to body, headings, lead and sections; prose line length about 68 characters in guides, Basics, Start and About.
- One card style in three levels (`.card`, `.card.raised`, `.card.quiet`); tilt only on link cards; memo card unchanged.
- Orbit map: label decluttering in the SVG and in the 3D scene, legend that wraps, a deliberate frame for the dark panel.
- Model page: four framework rows by default (lens first, then EU, then three others), with "Show all {n} frameworks".
- Framework guides: an "In one minute" card from existing fields only.
- Contrast: theme values change only if axe fails.

**Gate:** checks, e2e, axe in both themes, site audit. Screenshots of the six key pages in both themes at 390 and 1440 px, all opened and reviewed (not committed).

### E3. Journey tools and editorial pass
- Classify: derived question count, new lead, one merged note with the Commission checker link.
- Register: one primary button when empty; then "Add a system" plus Export and Backup menus (keyboard-accessible); privacy line under the lead; short disclaimer by the result; new empty-state and lead copy.
- `summary(systems)` in `register.ts` (systems, counts per EU category, systems with open actions, next three deadlines from `deadlines()`, top five open actions), used by the Markdown and Word reports. Unit tests: empty, one banned, mixed tiers, deadline order.
- Editorial pass over `src/pages`, `src/data` and `src/labs` by the directive's rules, top ten em-dash files first; memo cards rewritten only where they explain rather than speak.

**Gate:** checks, e2e, unit tests. Em-dash count down by at least a third, with both numbers recorded. "Ten short questions" and "Most organisations find more than" gone. Integrity tests green. Exported Markdown and Word reports opened and checked.

### E4. Monetisation seams (nothing changes for visitors)
- `entitlements.ts` (`FREE_FOR_NOW = true`) and its test.
- `<PremiumSlot>` with no visible output.
- `exportFile()` for every file the browser builds.
- Six insertion points marked as listed in the directive, with the toolkit and certificate exceptions above.
- Notes stating that real gating needs an authenticated backend (Phase 4, Hostinger).

**Gate:** checks, e2e, the entitlements test, no new network calls. Screenshots of `/register/` and `/team/` identical to E3.

### E5. Verification and release
- Full gates and a Lighthouse run on the production build, with the LCP element identified and fixed where possible; before and after numbers recorded.
- Keyboard test of the header menus, the register menus and search.
- Copy checks, route count unchanged.
- README and `docs/PLAN.md` "Design and writing rules" section; implementation notes.
- Final report to the owner: changes per phase, numbers, deviations, anything not verified.

## 3. Risks to watch

- **Header width.** Adding "My AI register" at the top level while removing Compare may change where the header overflows. E1 measures it at several widths.
- **Larger body text (17 px)** can create new overflow on dense pages (crosswalk, compare, tables). The site audit catches it; fix per page.
- **LCP target of 2.5 s** under simulated slow 4G may need more than font preloading. If it does, report it rather than strip features.
- **Test updates.** Only tests whose checked text this plan changes are updated, and each commit names them.
