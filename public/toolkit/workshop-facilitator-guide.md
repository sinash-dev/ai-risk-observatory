# Workshop facilitator guide: AI risk in 60 minutes

A hands-on session for mixed groups of managers, lawyers, engineers and anyone who buys or uses AI at work (8–30 people). No technical background is needed. Participants work in groups of three or four around one laptop. Presenter slides with the same content are at https://sinash-dev.github.io/ai-risk-observatory/workshop/

## Learning objectives
By the end of the hour participants will be able to:
1. Explain how an AI system can treat people unfairly even when nobody meant it to.
2. Spot a proxy: a harmless-looking input that stands in for something you are not allowed to use.
3. Place a system in the right risk category of the EU AI Act, and name the date its rules apply.
4. Name one AI system at their work and one safeguard they will check next week.

## How the session is built
- **Start from what people know.** The warm-up asks for AI systems participants already use, so the rest of the hour is about their work.
- **Predict, then check.** Before each example, people guess what will happen. Being wrong first, then seeing why, is what makes the lesson stick.
- **Learn by doing.** Groups break a working simulation, watch who is affected, and find the fix themselves.
- **Talk it through.** Every activity ends with a short debrief that links what people saw to the rules.
- **Commit and come back.** People write down one action, and take a quiz a week later.

## Before the session
- [ ] Open every link below on the room's network.
- [ ] Decide which framework matters most to the group (for most European audiences, the EU AI Act).
- [ ] Check the EU AI Act guide on the site for any date changes since you last ran the session.
- [ ] Prepare sticky notes or a shared document for the take-away.
- [ ] Optional: print the human oversight checklist and the risk assessment template.

## Plan
| Time | Activity | What participants do | Link |
|---|---|---|---|
| 0–10 min | **Warm-up** | In groups, name three AI systems they use or are affected by at work, then find where each sits on the map: classical machine learning, deep learning, generative AI or AI agents. | https://sinash-dev.github.io/ai-risk-observatory/ |
| 10 min | **Prediction** | "A bank removes ethnicity from its credit model. Is it fair now?" Everyone decides: yes, no or it depends. Show of hands; no comment yet. | — |
| 10–25 min | **Break and fix** | Open credit scoring with the postcode problem on. Compare approvals by group before and after, then find the safeguard. Note one surprise. | https://sinash-dev.github.io/ai-risk-observatory/model/credit/?p=zip |
| 25–40 min | **One framework** | Set "View through" to the chosen framework, open its guide and follow the first four steps of its learning path. | https://sinash-dev.github.io/ai-risk-observatory/rules/ |
| 40–50 min | **Compare** | Open Compare on Transparency. Where would the organisation comply in one country and not another? Try the gap finder. | https://sinash-dev.github.io/ai-risk-observatory/compare/?topic=transparency |
| 50–55 min | **The hard case** | Open the call-centre example with emotion scores in performance reviews. Try the safeguards. What is left? | https://sinash-dev.github.io/ai-risk-observatory/model/emotion/?p=rank |
| 55–60 min | **Take away** | On their own, write down one AI system at work, its likely category and one safeguard to check next week. | — |

## Notes for each activity

### Warm-up
- If groups are slow to start, prompt them: the spam filter, fraud alerts on a bank card, CV screening software, a chatbot on the website, a code assistant, meeting summaries.
- Ask two or three groups to share one system each and write them down. You will come back to them at the end.
- Watch for "we don't use AI". Many organisations use more than they think, often switched on inside software they already pay for.

### Break and fix: credit scoring
- What happens: the model never sees ethnicity, but in this fictional town postcode is closely tied to it, so approvals drop for one group. The safeguard is a proxy test that finds and removes features that stand in for protected characteristics.
- Walk round and ask: "Who would notice this inside the bank? Who would complain, and to whom?"
- Groups that finish early can switch on the second problem, training on past loan officers' decisions, and see that removing proxies does not fix biased labels.
- **Common misconception:** "If we don't use protected attributes, we can't discriminate." Let the group discover why this is wrong rather than telling them.
- **Debrief:** bias gets in through proxies, through labels learned from past decisions, and through where the cut-off is set. Go back to the prediction: who changed their mind, and why?
- **Link to the rules:** in the EU, credit scoring of individuals is a high-risk use (AI Act, Annex III, point 5(b)), with duties applying from 2 December 2027. In the US, lenders must give specific reasons when they decline someone.

### One framework
- Groups can split frameworks and report back, which works well when the room has people from several countries.
- If time is short, skip the learning path and show the four risk levels below.

### The EU AI Act in one minute
| Level | Examples | Applies from |
|---|---|---|
| Banned | Social scoring; emotion recognition at work or in schools | 2 February 2025 |
| Transparency duties | Telling people they are talking to an AI; labelling deepfakes | 2 August 2026 |
| High-risk | Hiring, credit scoring, education | 2 December 2027 (2 August 2028 for AI inside regulated products) |
| Minimal risk | Most other uses | No specific duties; staff AI literacy (Art. 4) applies to every provider and deployer |

These dates reflect the Digital Omnibus on AI (Regulation (EU) 2026/1744). Older training material shows 2 August 2026 for high-risk systems; that is out of date. A common misreading is "the AI Act was delayed": only the high-risk duties moved.

### Compare
- Good question to ask: "If you had to write one policy for all countries, which rule would set the bar?"
- Point people to the controls crosswalk for later.

### The hard case
- No technical safeguard makes the scores fair, because the science behind reading emotions from voices is weak. The only full fix is not to score staff emotions at all.
- In the EU this use is banned: inferring the emotions of people at work is prohibited except for medical or safety reasons (AI Act, Art. 5(1)(f)).
- Ask: "If the law allowed it, would you still use it? What could management measure instead to support call quality?"
- The lesson: some risks cannot be managed, only avoided. Saying no is a legitimate outcome of a risk assessment.

### Take away
- Give two quiet minutes to write. Ask two or three volunteers to read theirs out and gently correct any category that is wrong.
- Go back to the four learning objectives and check them off together.

## Debrief questions
1. Which problem surprised you most, and would your organisation notice it?
2. Who in your organisation would have to accept the risk that remains?
3. Which safeguard would be hardest to fund, and why?
4. Where do two frameworks ask for different things, and how would you handle both?

## Follow-up
- **One week later:** send the quiz for the framework the group looked at. Coming back to the material after a gap is one of the most reliable ways to remember it. Quizzes: https://sinash-dev.github.io/ai-risk-observatory/quiz/ (also available as SCORM 1.2 packages for your learning platform).
- **For each person's own systems:** the classification wizard or My AI register.
- **For a whole team:** set up a training plan with one shared link and collect each person's record: https://sinash-dev.github.io/ai-risk-observatory/team/
- **Keep a record.** If your organisation is in the EU, Art. 4 of the AI Act asks providers and deployers to take measures to support their staff's AI literacy. The European Commission's AI literacy Q&A says no certificate is needed and you can keep an internal record of training. Note who attended, when, and what was covered.

---

*Template from AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/), CC BY 4.0. Free to adapt. Not legal advice.*
