# Translation plan

Languages requested by the owner: German, French, Arabic, Persian (Farsi) and Chinese. English stays the source and the reference version.

## Size of the job

About 58,000 words of site text (frameworks, examples, quizzes, glossary, guides, interface) and 11,000 words of templates, so roughly 69,000 words per language and 345,000 words in total. Much of it is legal: one wrong term (for example "deployer" or "provider" under the EU AI Act) changes the meaning.

## Principles

1. **Official terms first.** The EU AI Act exists in official German and French versions on EUR-Lex. German and French pages use the terms of those versions (for example *Betreiber* and *Anbieter*; *déployeur* and *fournisseur*), taken from the official text, not guessed. The same goes for the GDPR.
2. **No official version, keep the anchor.** Arabic, Persian and Chinese have no official version of the EU AI Act. Those pages use established terms and show the English term in brackets the first time it appears, so readers can match it to the source.
3. **Names of laws, articles and dates are never translated loosely.** Article numbers, dates, amounts and names of laws are copied, not rewritten. Automated checks compare them with the English source.
4. **A language goes live only when it is complete.** Translations are built and checked out of sight and published one language at a time, never half-done.
5. **English prevails.** Every translated page says it is a translation and links to the English page; legal statements refer to the official texts.
6. **Human review before launch.** Machine-assisted translation is a draft. Each language should be read by a fluent reviewer, ideally with a legal background, before it is published. Without one, the language can still be published, clearly marked as a translation that has not been independently reviewed. This is the owner's decision per language.

## Technical approach

- **Addresses:** English stays where it is; other languages get a prefix: `/de/`, `/fr/`, `/ar/`, `/fa/`, `/zh/`. Every page links to its versions in other languages (`hreflang`), and the sitemap lists them.
- **Right-to-left:** Arabic and Persian pages set `dir="rtl"`. Layout moves to logical CSS properties (start/end instead of left/right) so it mirrors correctly; charts, numbers and code stay left-to-right where they should.
- **Fonts:** the current fonts have no Arabic or Chinese letters. Arabic and Persian use Vazirmatn (open licence, designed for Persian and Arabic); Chinese uses the system's Chinese fonts to keep pages light.
- **Content:** interface text lives in one dictionary per language; long content (frameworks, examples, quizzes, glossary) gets a translation file per language that mirrors the English data by id, so a missing or extra entry is caught by tests.
- **Checks per language:** every English entry has a translation; numbers, dates, article references and links match the English source; a fixed glossary of legal terms is used consistently; full accessibility and layout tests run in each language, including right-to-left.

## Order of work

| Step | What | Result |
|---|---|---|
| L1 | Language support in the site: addresses, language switch (hidden until a language is ready), `lang` and `dir`, right-to-left layout, fonts, per-language pages in the build | English unchanged; the site is ready for translations |
| L2 | Term glossary per language, from the official EU texts for German and French | One agreed term for every legal concept |
| L3 | Interface text (menus, buttons, labels, messages) in all five languages | |
| L4 | Core pages in all five languages: home, Start here, EU AI Act guide, classification wizard, My AI register | Usable in each language |
| L5 | All other content, then templates | Complete languages |
| L6 | Checks, review, then publish one language at a time | |

## Decisions for the owner

- **Chinese:** Simplified (mainland China, Singapore) or Traditional (Taiwan, Hong Kong)? The plan assumes Simplified unless told otherwise.
- **Review:** who will review each language before launch, or publish as unreviewed translations with a clear note?
