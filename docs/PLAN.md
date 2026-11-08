# AI Risk Explorer: design notes (v2)

## Purpose
Help people who are not specialists understand three things: how common AI systems work, how they fail, and what each governance framework requires. Everything is learned by doing: every example has a working simulation.

## Structure
| Page | Purpose |
|---|---|
| Home | Who the site is for, one first step (the register), the map of all 25 examples on four rings (classical ML to agents) and the full list |
| Start here | The compliance path in five steps, then routes for trainers, builders and students |
| My AI register and Classify | The working tools: list systems, classify them, export a report with a summary for management |
| Example page | How it works, the situation, simulation (problems and safeguards), what this means, how the rules apply, real cases |
| Frameworks | Globe, timeline, a guide per framework with an "In one minute" summary |
| Learn | Basics, tracks, glossary, quizzes, certificate, team training and workshop slides |

**View through** (header, only on the home, example and framework pages): All frameworks, or one framework. Choosing one recolours the map by that framework's categories, groups the list by them, and puts that framework first on example pages.

## Content model
- `LabDef`: model, use case, explanation, situation, problems (design choice / real-world change / attack), safeguards (with the problems they fix), real cases.
- Per framework, per example: category, status, plain summary, requirements with references and the safeguard ids that meet them.

## Design and writing rules

**Type and spacing.** Tokens at `:root` in `src/styles.css`, shared by both themes: body 17 px at line height 1.65 (`--fs-body`, `--lh-body`), lead `--fs-lead`, headings `--fs-h1`, `--fs-h2`, `--fs-h3` (h1 and h2 balance their lines), prose capped at `--measure` (68ch), `--section-gap` between sections and `--card-pad` inside cards. Use the tokens; add new ones rather than changing what an existing token means.

**Cards.** Three levels: `.card` (flat, the default), `.card.raised` (the one featured item on a page, such as the Start path or the guide summary) and `.card.quiet` (secondary notes). Only link cards (`a.card.lift`) tilt on hover.

**Colour and motion.** Light and dark themes from the same tokens; simulations, the globe and 3D scenes keep dark panels in both. Colour carries meaning only (model family or framework category) and is always paired with text. Motion is purposeful and collapses to short fades under `prefers-reduced-motion`; every 3D scene has a 2D fallback.

**Writing.** British spelling, no emojis, no exclamation marks.
1. Write to one reader ("you") in active voice and name the actor: "The provider must register the system".
2. Lead with the point, then the detail. Do not announce content ("Here is how", "in plain words").
3. One idea per sentence. Avoid "not only X but also Y" and strings of abstract nouns.
4. At most one em dash per paragraph; use commas, colons or full stops. En dashes stay in ranges.
5. Keep legal terms of art (deployer, provider, Annex III) and explain each once per page, with the `<Term>` component. No glossary jargon in headings.
6. Do not repeat a sentence on two pages; link instead.
7. Info boxes only for a warning, a deadline or a definition.
8. Memo cards read as a person speaking, with a specific pressure, number or deadline. No explaining, no moral.
9. Never change a legal date, article number, fine, URL or case outcome in a wording pass.

## Next steps
- Translations (paused; see `docs/TRANSLATION_PLAN.md`)
- Phase 4: move to Hostinger with accounts, which real paid features would need
