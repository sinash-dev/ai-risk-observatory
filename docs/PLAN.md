# AI Risk Explorer: design notes (v2)

## Purpose
Help people who are not specialists understand three things: how common AI systems work, how they fail, and what each governance framework requires. Everything is learned by doing: every example has a working simulation.

## Structure
| Page | Purpose |
|---|---|
| Models (home) | One map of all 21 examples on four rings (classical ML → agents) and a grouped list |
| Model page | How it works · the situation · simulation (problems + safeguards) · what this means · how the rules apply · real cases |
| Rules and frameworks | Comparison table, how frameworks fit together, guide per framework, other frameworks |
| Basics | Tutorial and glossary |

**View through** (header): All frameworks, or one of EU AI Act, US laws, NIST AI RMF, ISO/IEC 42001, OWASP, GDPR. Choosing one recolours the map by that framework’s categories, groups the list by them, and limits model pages to that framework.

## Content model
- `LabDef`: model, use case, explanation, situation, problems (design choice / real-world change / attack), safeguards (with the problems they fix), real cases.
- Per framework, per example: category, status, plain summary, requirements with references and the safeguard ids that meet them.

## Writing rules
Plain, direct sentences. Say what something is, who it affects and what to do. No marketing language. Legal references are given so readers can check the source.

## Design rules
Light, calm page; serif headings; one accent colour; colour used only to carry meaning (model family or framework category). Simulations sit in dark panels so they read as instruments.

## Next steps
- Facilitator notes for workshops
- More frameworks as full lenses (UK, Canada, China, Korea)
- Translations
