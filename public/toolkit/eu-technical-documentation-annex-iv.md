# Technical documentation outline (EU AI Act Art. 11 and Annex IV)

For **providers** of high-risk AI systems. Draw it up before the system is placed on the market or put into service, and keep it up to date (Art. 11(1)). Keep it for 10 years after the system is placed on the market or put into service (Art. 18(1)).

The headings follow the nine points of Annex IV, as amended up to Regulation (EU) 2026/1744. Fill in what applies to your system.

> **Small companies:** SMEs, start-ups and small mid-cap companies may provide the Annex IV elements in a simplified way, using a form the Commission will publish. If you choose that route you must use the Commission's form, and notified bodies must accept it (Art. 11(1), as amended in 2026). Check whether the form has been published before you start.

> **Products under Annex I, Section A** (for example machinery or medical devices): draw up one single set of documentation covering both this outline and what the product law requires (Art. 11(2)).

**System:** [name] · **Version:** [version] · **Provider:** [legal name, address] · **Document owner:** [name] · **Last updated:** [date]

## 1. General description (Annex IV, point 1)
| Item | Annex IV ref. | Your answer |
|---|---|---|
| Intended purpose | 1(a) | [ ] |
| Provider name and system version, and how it relates to earlier versions | 1(a) | [ ] |
| How it interacts with other hardware, software or AI systems that are not part of it | 1(b) | [ ] |
| Versions of relevant software or firmware; requirements for version updates | 1(c) | [ ] |
| All forms in which it is placed on the market (software package, embedded, download, API) | 1(d) | [ ] |
| Hardware it is meant to run on | 1(e) | [ ] |
| If it is a component of a product: photos or illustrations of external features, marking and internal layout | 1(f) | [ ] |
| Basic description of the user interface given to the deployer | 1(g) | [ ] |
| Instructions for use for the deployer (attach) | 1(h) | [link] |

## 2. Elements of the system and how it was developed (Annex IV, point 2)
- **Development methods and steps**, including any pre-trained systems or third-party tools, and how you used, integrated or changed them (2(a)): [ ]
- **Design specifications** (2(b)):
  - general logic of the system and its algorithms: [ ]
  - key design choices, with the reasons and assumptions, including about the people the system will be used on: [ ]
  - main classification choices: [ ]
  - what the system is designed to optimise for, and how much each parameter matters: [ ]
  - expected output and output quality: [ ]
  - trade-offs made to meet the requirements of Chapter III, Section 2: [ ]
- **System architecture**: how the software components build on or feed into each other; computing resources used to develop, train, test and validate (2(c)): [ ]
- **Data requirements**, where relevant (2(d)):
  - datasheets describing training methods and techniques, and the training data sets used;
  - for each data set: provenance, scope, main characteristics, how it was obtained and selected, labelling procedures and data cleaning methods (table below).

| Data set | Provenance | Scope and main characteristics | How obtained and selected | Labelling | Cleaning |
|---|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

- **Human oversight assessment** under Art. 14, including the technical measures that help deployers interpret outputs (Art. 13(3)(d)) (2(e)): [ ]
- **Pre-determined changes**, where applicable: what may change, and how you keep the system compliant when it does (2(f)): [ ]
- **Validation and testing** (2(g)):
  - procedures used, and the validation and test data with their main characteristics: [ ]
  - metrics for accuracy, robustness and other requirements, and for potentially discriminatory impacts: [ ]
  - test logs and test reports, dated and signed by the responsible people, including for pre-determined changes: [links]
- **Cybersecurity measures** (2(h)): [ ]

## 3. Monitoring, functioning and control (Annex IV, point 3)
- Capabilities and limits in performance, including accuracy for specific persons or groups and overall expected accuracy: [ ]
- Foreseeable unintended outcomes, and sources of risk to health, safety, fundamental rights and discrimination: [ ]
- Human oversight measures under Art. 14, including technical measures that help deployers interpret outputs: [ ]
- Specifications on input data, as appropriate: [ ]

## 4. Why the performance metrics are appropriate (Annex IV, point 4)
- [Explain why the chosen metrics suit this system and its intended purpose.]

## 5. Risk management system (Annex IV, point 5; Art. 9)
- [Describe the risk management system in detail, or attach it.]

## 6. Changes through the life cycle (Annex IV, point 6)
| Date | Version | Change | Reason | Effect on compliance |
|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] | [ ] |

## 7. Standards and specifications applied (Annex IV, point 7)
- Harmonised standards published in the Official Journal and applied in full or in part: [for example EN 18286:2026 for the quality management system]
- Where no harmonised standard was applied: detailed description of the solutions adopted to meet Chapter III, Section 2, and other standards or technical specifications used: [ ]

## 8. EU declaration of conformity (Annex IV, point 8; Art. 47)
- [Attach a copy.]

## 9. Post-market monitoring (Annex IV, point 9; Art. 72)
- [Describe the system for evaluating performance after release, and attach the post-market monitoring plan.]

---

*Source: Regulation (EU) 2024/1689, Art. 11, Art. 18 and Annex IV, in the consolidated version including Regulation (EU) 2026/1744. Check the current text on EUR-Lex before you rely on it.*

*Template from AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/), CC BY 4.0. Free to adapt. Not legal advice.*
