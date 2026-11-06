# AI risk assessment

**System:** [name] · **Owner:** [name] · **Version assessed:** [version] · **Date:** [date]

## 1. Context
- **Purpose and intended use:** [describe]
- **Uses that are out of scope:** [describe]
- **Classification:** EU AI Act [category]; other frameworks [list]
- **Affected people and groups:** [list]

## 2. Risks
Score likelihood and severity from 1 (low) to 5 (high).

| # | Risk | Harm type | Likelihood | Severity | Score | Safeguard | Owner |
|---|---|---|---|---|---|---|---|
| 1 | [e.g. proxy features cause unfair declines] | Unfair treatment | [3] | [4] | [12] | [proxy test and remove proxies] | [name] |
| 2 | [e.g. data drift in a recession] | Errors | [3] | [3] | [9] | [drift monitoring and recalibration] | [name] |
| 3 | [e.g. prompt injection in retrieved content] | Security | [ ] | [ ] | [ ] | [ ] | [ ] |

Harm types: unfair treatment, errors and breakdowns, lack of transparency, privacy, security attacks, harm to people, unclear responsibility, misuse and IP.

## 3. Testing evidence
- **Accuracy and error rates, overall and by group:** [results]
- **Robustness and adversarial tests:** [results]
- **Security tests against the OWASP lists:** [results]

## 4. Residual risk
- **What remains with all safeguards on:** [describe]
- **Who accepts it:** [name, role]
- **Review date:** [date]

## 5. Approval
| Role | Name | Decision | Date |
|---|---|---|---|
| System owner | [ ] | [approve / reject] | [ ] |
| Risk or compliance | [ ] | [ ] | [ ] |
| Data protection | [ ] | [ ] | [ ] |

---

*Template from AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/), CC BY 4.0. Free to adapt. Not legal advice.*
