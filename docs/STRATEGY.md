# AI Risk Explorer: positioning, market and phased plan

Approved by the owner on 7 November 2026; Phase 1 done the same day. Facts are sourced; estimates and opinions are marked as such.

## 1. The market in short

| Segment | Who | What they sell | Price signal | Gap they leave |
|---|---|---|---|---|
| Enterprise AI governance platforms | Credo AI, OneTrust, IBM watsonx.governance, Holistic AI, Monitaur, ServiceNow, Microsoft Purview | AI registries, policy packs, workflows, monitoring | Gartner: spending on AI governance platforms $492M in 2026, over $1B by 2030 ([Gartner, 17 Feb 2026](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms)) | Built for large companies with a governance team; they assume you already understand the risks |
| Official free tools | European Commission AI Act Service Desk: Compliance Checker, AI Act Explorer, helpdesk ([AI Act Single Information Platform](https://ai-act-service-desk.ec.europa.eu/en)); Future of Life Institute checker | Free EU classification | Free | EU-only, legal-text driven, no other frameworks, no "why" or "how to fix" |
| AI literacy training (Art. 4) | Dozens of providers listed by [artificialintelligenceact.eu](https://artificialintelligenceact.eu/ai-literacy-programs/) | Video and slide courses | Free to about €1,600 per seat | Mostly passive content. The Commission says no certificate is required ([AI literacy Q&A](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers)), so buyers want evidence that people actually learned |
| Professional certification | IAPP AIGP, ISO/IEC 42001 lead implementer courses | Exam-based credentials | Hundreds to thousands per person | Theory-heavy, few hands-on cases |
| Consulting | Boutiques to Big Four | Gap assessments, ISO/IEC 42001 readiness, documentation | Vendor-published figures: gap assessments about $2,000–15,000; SMB ISO/IEC 42001 implementation about $15,000–50,000 ([Axipro](https://axipro.co/iso-42001-consulting-cost/), [Truvo](https://truvocyber.com/blog/iso-42001-certification-cost)) | Too expensive for small organisations with one or two AI systems |

**Recent facts the site must reflect** (verified):
- EN 18286:2026, the quality management system standard for the AI Act, was published in July 2026; Implementing Decision (EU) 2026/2274 published its reference in the Official Journal in October 2026, making it the first harmonised standard; following it gives a presumption of conformity with the requirements it covers (quality management, including post-market monitoring processes) ([JTC 21](https://jtc21.eu/en-18286-becomes-the-first-harmonised-standard-under-the-eu-ai-act/)).
- The Commission published draft guidelines on classifying high-risk AI systems (Art. 6) for consultation on 19 May 2026; they are not final ([Commission](https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems)).

## 2. What makes this site different (the niche)

No one else combines these four things in one free place:
1. **Learning by breaking**: working simulations where you switch on a failure, watch the harm, and fix it with a named safeguard.
2. **One example, ten frameworks**: each safeguard is linked to the exact clause it satisfies in the EU AI Act, GDPR, US law, NIST, ISO/IEC 42001, OWASP, China, Korea, Singapore and the UK.
3. **From learning to doing**: classification wizard, crosswalk, templates and checklists sit next to the lessons.
4. **Plain language**, for non-lawyers.

In one line: **"the flight simulator for AI risk"**. Enterprise platforms manage AI; official tools classify it; this site teaches people to recognise and fix AI risk, and helps small teams take the first practical steps.

## 3. Who the users are, and what each needs

| Audience | Their job | Pain today | What the site can give | Value to us |
|---|---|---|---|---|
| **A. "Accidental AI officer" in an SME or mid-size firm** (compliance, privacy/DPO, risk, IT lead) | Find out which rules apply, inventory AI, document, train staff | No budget for platforms or consultants; legal texts are hard | Register of their AI systems, classification, checklists, document drafts, staff training | **Primary target.** Highest need, willingness to pay modest amounts |
| **B. Trainers and L&D** (corporate trainers, consultants, universities) | Run AI literacy and governance sessions | Passive content, no hands-on cases | Simulations, workshop kits, quizzes, certificates, LMS export | **Primary target.** Clear paid products (licences, kits) |
| C. Product, data science and security teams | Build systems that pass review | Rules are not translated into engineering controls | Per-system-type controls (OWASP, testing, agent permissions) | Secondary; drives usage and credibility |
| D. Executives and boards | Decide risk appetite | No time | 15-minute track, one-page briefs | Secondary; entry point for B2B sales |
| E. Academia and students | Teach and study AI governance | Fragmented sources | Free, citable, cross-jurisdiction material | Free audience; reach and reputation, little revenue |

**Recommendation:** focus on **A and B**. Keep C, D and E served by what exists.

## 4. Answers to your questions

**Is it worth adding a field where users list their systems, then evaluate and produce guidelines, checks and reports?**
Yes. It is the natural bridge from learning to doing, and the basis for paid tiers. Build it in two steps:
1. **Local-first (Phase 1):** everything stays in the user's browser, with export to file. No accounts, no storage of client data, so no data-protection or security burden yet.
2. **Accounts and teams (Phase 4, on Hostinger):** only once there is demand.

Reports must be framed as **structured self-assessment and document drafts**, not legal opinions (see risks).

**Is it worth going into detail per framework, e.g. conformity templates?**
Yes, selectively. Practitioners value templates when each field cites the clause it comes from. Priorities:
- EU high-risk: technical documentation outline (Annex IV), deployer duties (Art. 26), FRIA (Art. 27, exists), transparency notices (Art. 50), post-market monitoring plan (Art. 72), declaration of conformity outline (Annex V), quality management outline (Art. 17).
- ISO/IEC 42001: Statement of Applicability.
- NYC LL 144: candidate notice and audit summary.
- Korea: high-impact notice.

**Limits:**
- Harmonised standards and ISO texts are copyrighted. We can reference clause numbers and headings but not reproduce the text.
- Where an official template is pending (for example the Commission's post-market monitoring template), we must say so rather than guess.

**Should part of the site become an "enterprise" offer?**
Later, yes, but as a layer on top of the free site, not instead of it. The free content builds trust and traffic; paid tiers add saving, teams, evidence and expert help (Phase 4).

**Academia?**
Serve it for free (citation, open licence, teaching notes). It brings links, credibility and students who later become buyers, but it is not the revenue target.

## 5. Future paid offers (for later, after the site is complete)

These are hypotheses to validate with usage data, not commitments:
1. **Team plan** for AI literacy (Art. 4): role-based paths, team progress, an exportable record as evidence, verifiable certificates.
2. **Pro workspace**: saved AI register, assessments, document packs as Word/PDF, review reminders, regulatory change alerts for the user's own systems.
3. **Trainer licence**: white-label workshop kits, slides, LMS (SCORM) packages of the modules.
4. **Expert services**: review of a self-assessment, workshops, readiness assessments. Legal opinions only through a qualified partner.

## 6. Risks and guardrails

- **Legal-services rules.** Some countries reserve legal advice to lawyers; Germany's Legal Services Act (RDG), for example, regulates legal services and does not allow fully automated legal services ([IBA country report](https://www.ibanet.org/MediaHandler?id=df7ac29b-7cc9-43e1-94df-799ea4b00017)). Paid outputs must be positioned as education and self-assessment tools, with any legal opinion delivered by a qualified partner. Get a lawyer's review of terms before selling.
- **Accuracy and liability.** Every legal statement needs a source and a review date; keep the quarterly review and the updates log. Each template field cites its clause. Clear "indicative, not legal advice" wording stays.
- **Data protection.** Storing customers' system details later makes us a processor: privacy policy, data processing agreement, security, EU hosting. Local-first avoids this in early phases.
- **Copyright.** No reproduction of ISO or CEN text.
- **Maintenance cost.** Ten frameworks change often. Budget time for review, or narrow the paid scope to the frameworks we can keep current (EU, GDPR, ISO, NIST first).

## 7. Moving to Hostinger: what it means technically

- The site is static today, which suits any Hostinger plan. It already supports a different base path (`BASE_PATH=/` for a root domain) and writes a real HTML file per page, so it works on Hostinger's Apache hosting without server code. We will add an `.htaccess` (404 page, caching, HTTPS redirect) and make the canonical domain configurable.
- Later server features (accounts, saved workspaces, payments) need Node.js and a database. Hostinger supports Node.js web apps on Business and Cloud plans, deployed from GitHub ([Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)). Plan for Business or Cloud when Phase 4 starts.
- Before going commercial you will need: your own domain, legal pages (privacy policy, terms, and an imprint if your country requires one) and a decision on analytics consent.

## 8. Phased plan

### Phase 1: Focus, accuracy and the AI register (no backend; about 1–2 working sessions)
1. **Positioning:**
   - Rewrite the home page around the two main audiences, with "Start as: compliance lead / trainer / product team" entry points.
   - Add an audience page for each group ("For compliance leads", "For trainers").
   - Explain how the site relates to the Commission's free checker, and link to it.
2. **Accuracy refresh:** add the 19 May 2026 draft high-risk guidelines and EN 18286 to the EU guide, updates and timeline. Re-check every date against sources.
3. **My AI register (local-first):**
   - Add systems; classify each with the existing wizard logic.
   - Track a per-system checklist that combines the safeguards and framework duties that apply.
   - See an overview dashboard: categories, deadlines and gaps.
   - Export a Markdown or printable PDF report, and CSV or JSON. Import works too.
   - Nothing leaves the browser.
4. ~~Hostinger-ready build~~ Moved to Phase 4 at the owner's request: the site is finished on GitHub Pages first.
5. **Privacy-friendly feature analytics** (GoatCounter events on register use, template downloads, quiz completions), so later decisions rest on data.
6. **Tests:** unit tests for the register logic and report generation, plus e2e and accessibility checks for the new pages.

### Phase 2: Practitioner depth
- **Framework document packs**, each field citing its clause:
  - EU: Annex IV technical documentation outline, Art. 26 deployer pack, Art. 50 notice templates, Art. 72 monitoring plan, Annex V and Art. 17 outlines.
  - ISO/IEC 42001 Statement of Applicability helper.
  - NYC LL 144 notice and audit summary.
  - Korea notice.
- **Report generator**: produce Word documents from a register entry (`docx` library, in the browser).
- **Sector guides** (finance, HR, health, public sector, education, insurance), linking examples, rules and templates.
- **Evidence checklists**: what an auditor or regulator may ask for, per framework.

### Phase 3: Training product
- Team mode for Art. 4: role paths, progress export as evidence, facilitator kit with slides.
- LMS export (SCORM packages) of selected modules.
- More scenarios and sector packs; translations (start with German and French if those are your markets).
- Verifiable certificates (needs Phase 4 backend).

### Phase 4: Platform and monetisation on Hostinger
- Accounts, saved workspaces, team dashboards (Node.js and database on Hostinger Business or Cloud).
- Paid tiers, payments, expert-review requests, regulatory alerts per user system.
- Legal setup: terms, data processing agreement, privacy policy, liability limits, partner law firm for legal opinions.

## 9. Decisions needed from you

1. Do you agree with the primary audiences: SME compliance leads and trainers?
2. Which country will the business operate from? This affects legal pages and the legal-services question.
3. Which languages matter besides English?
4. Do you have, or plan, a legal partner for anything that needs a legal opinion?
5. Approve Phase 1 as described, or tell me what to change.
