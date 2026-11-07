/**
 * The 60-minute workshop as presenter slides.
 * Legal dates follow the consolidated EU AI Act of 27 July 2026 (Art. 113 and Art. 5).
 */
export interface Slide {
  id: string;
  /** time slot, e.g. "10–25 min" */
  time?: string;
  kicker?: string;
  title: string;
  /** short lines shown on screen */
  points?: string[];
  /** what participants do */
  task?: string;
  link?: { to: string; label: string };
  /** facilitator notes, shown in presenter view and in the handout */
  notes: string[];
}

export const WORKSHOP_TITLE = 'When AI gets it wrong';
export const WORKSHOP_SUB = 'A hands-on hour on AI risk and the rules that deal with it';

export const SLIDES: Slide[] = [
  {
    id: 'title', kicker: 'Workshop · 60 minutes', title: WORKSHOP_TITLE,
    points: [WORKSHOP_SUB, 'Bring a laptop or share one in groups of three or four.'],
    notes: [
      'Who it is for: mixed groups of managers, lawyers, engineers and anyone who buys or uses AI at work. No technical background needed.',
      'Before people arrive: open every link in this deck on the room’s network, set up groups of three or four around one laptop, and have sticky notes or a shared document ready for the take-away exercise.',
      'Open by saying what this is not: it is not a lecture on the law. People will break real-looking AI systems, see who gets hurt, and then find the fix.',
    ],
  },
  {
    id: 'goals', kicker: 'The plan', title: 'By the end of the hour you will be able to',
    points: [
      'Explain how an AI system can treat people unfairly even when nobody meant it to.',
      'Spot a proxy: a harmless-looking input that stands in for something you are not allowed to use.',
      'Place a system in the right risk category of the EU AI Act, and name the date its rules apply.',
      'Name one AI system at your work and one safeguard you will check next week.',
    ],
    notes: [
      'Read the four objectives aloud and leave them up for a moment. Adults learn better when they know what they are working towards.',
      'Tell the group you will come back to these at the end and check them off together.',
    ],
  },
  {
    id: 'how', kicker: 'How this works', title: 'Break it, watch, fix it',
    points: [
      'Each example is a small working simulation of a real kind of AI system.',
      'You switch on a problem and watch what changes for the people affected.',
      'Then you look for the safeguard that fixes it, and check what the rules say.',
      'Guess first. Being wrong before you see the answer is what makes it stick.',
    ],
    notes: [
      'The prediction habit matters more than it seems. Studies of the “pretesting effect” (for example Kornell, Hays and Bjork, 2009) found that trying to answer before learning, even unsuccessfully, improves later memory, as long as people then see the correct answer. That is why every example here shows the outcome straight after the guess.',
      'Make it safe to be wrong: say you will be wrong yourself at least once today.',
    ],
  },
  {
    id: 'warmup', time: '0–10 min', kicker: 'Warm-up', title: 'Where is AI in your work already?',
    task: 'In your group, name three AI systems you use or are affected by at work. Then find where they sit on the map: classical machine learning, deep learning, generative AI or AI agents.',
    link: { to: '/', label: 'Open the map of examples' },
    notes: [
      'Purpose: start from what people already know and use. It makes the rest of the hour about their work, not about abstract examples.',
      'If groups are slow to start, prompt them: the spam filter, fraud alerts on a bank card, CV screening software, a chatbot on the website, a code assistant, meeting summaries.',
      'Ask two or three groups to share one system each. Write them down; you will come back to them at the end.',
      'Watch for: people saying “we don’t use AI”. Many organisations use more than they think, often switched on inside software they already pay for.',
    ],
  },
  {
    id: 'predict', time: '10 min', kicker: 'Before you click', title: 'A bank removes ethnicity from its credit model. Is it fair now?',
    points: ['Take ten seconds and decide: yes, no, or it depends.', 'Keep your answer in mind. You will check it in a moment.'],
    notes: [
      'Ask for a show of hands for each answer. Do not comment yet.',
      'Most groups split. That disagreement is the point: the next exercise settles it with evidence.',
    ],
  },
  {
    id: 'credit', time: '10–25 min', kicker: 'Break and fix', title: 'Credit scoring with postcodes',
    task: 'Open the credit example. The postcode problem is already on. Look at who gets approved in each group before and after. Then find the safeguard that fixes it. Note one thing that surprised you.',
    link: { to: '/model/credit?p=zip', label: 'Open credit scoring with the postcode problem on' },
    notes: [
      'What happens: the model never sees ethnicity, but postcode is closely tied to it in this fictional town, so approvals drop for one group. The safeguard is a proxy test that finds and removes features standing in for protected characteristics.',
      'Give groups ten minutes. Walk round and ask: “Who would notice this inside the bank? Who would complain, and to whom?”',
      'If a group finishes early, have them switch on the second problem, training on past loan officers’ decisions, and see that removing proxies does not fix biased labels.',
      'Common misconception: “If we don’t use protected attributes, we can’t discriminate.” The example shows why that is wrong. Let the group discover it rather than telling them.',
    ],
  },
  {
    id: 'credit-debrief', time: '20–25 min', kicker: 'What we saw', title: 'Bias gets in three ways',
    points: [
      'Proxies: inputs such as postcode that stand in for protected characteristics.',
      'Labels: the model learns from past human decisions, including their mistakes.',
      'Thresholds: where you set the cut-off decides who is excluded.',
      'Dropping the protected attribute is not enough.',
    ],
    notes: [
      'Ask each group for the one thing that surprised them. Link their answers to the three causes on the slide.',
      'Go back to the prediction from earlier. Who changed their mind, and why?',
      'Connect to the law briefly: in the EU, credit scoring of individuals is a high-risk use (Annex III, point 5(b) of the AI Act), with duties applying from 2 December 2027. In the US, lenders must give specific reasons when they decline someone.',
    ],
  },
  {
    id: 'framework', time: '25–40 min', kicker: 'One framework', title: 'Look at it through the rules that apply to you',
    task: 'Use “View through” to pick the framework that matters most to your organisation. Open its guide and follow the first four steps of its learning path.',
    link: { to: '/rules', label: 'Choose a framework' },
    notes: [
      'Decide the framework with the group beforehand if you can. For most European audiences it will be the EU AI Act; for others the GDPR, ISO/IEC 42001 or US rules.',
      'Groups can split frameworks and report back: this works well when the room has people from several countries.',
      'If time is short, skip the learning path and go straight to the next slide.',
    ],
  },
  {
    id: 'eu-tiers', time: '35–40 min', kicker: 'The EU AI Act in one slide', title: 'Four levels of risk, four sets of dates',
    points: [
      'Banned: for example social scoring, and emotion recognition at work or in schools. Since 2 February 2025.',
      'Transparency duties: tell people they are talking to an AI, and label deepfakes. Since 2 August 2026.',
      'High-risk: for example hiring, credit scoring and education. From 2 December 2027, or 2 August 2028 for AI inside regulated products.',
      'Minimal risk: most other uses. No specific duties, but staff AI literacy (Art. 4) applies to all.',
    ],
    notes: [
      'These dates reflect the Digital Omnibus on AI (Regulation (EU) 2026/1744), which moved the high-risk deadlines in July 2026. Older training material will show 2 August 2026 for high-risk systems; that is out of date.',
      'A common misreading is “the AI Act was delayed”. Only the high-risk duties moved. The bans and transparency duties were not delayed.',
      'Check the EU AI Act guide on this site before each session in case dates change again.',
    ],
  },
  {
    id: 'compare', time: '40–50 min', kicker: 'Compare', title: 'Same system, different countries',
    task: 'Open Compare and choose Transparency. Where would your organisation comply in one country and not in another? Try the gap finder with two frameworks your organisation deals with.',
    link: { to: '/compare?topic=transparency', label: 'Open Compare on transparency' },
    notes: [
      'Purpose: show that one control often serves several laws, and where it does not.',
      'Good question to ask: “If you had to write one policy for all countries, which rule would set the bar?”',
      'Point people to the controls crosswalk for later: it maps one control to the clauses of ten frameworks.',
    ],
  },
  {
    id: 'hard', time: '50–55 min', kicker: 'The hard case', title: 'When no safeguard works',
    task: 'Open the call-centre example with emotion scores used in performance reviews. Try the safeguards. What is left?',
    link: { to: '/model/emotion?p=rank', label: 'Open the call-centre example' },
    notes: [
      'What happens: no technical safeguard makes the scores fair, because the science behind reading emotions from voices is weak. The only full fix is not to score staff emotions at all.',
      'In the EU this use is banned: inferring the emotions of people at work is prohibited except for medical or safety reasons (Art. 5(1)(f)), since 2 February 2025.',
      'Discussion questions: If the law allowed it, would you still use it? What could management measure instead to support call quality?',
      'The lesson to land: some risks cannot be managed, only avoided. Saying no is a legitimate outcome of a risk assessment.',
    ],
  },
  {
    id: 'takeaway', time: '55–60 min', kicker: 'Take away', title: 'One system, one category, one check',
    task: 'Write down, on your own: one AI system at your work, the category you think it falls into, and one safeguard you will check next week.',
    notes: [
      'Give people two quiet minutes to write. Push for something specific (“next week I will ask our HR vendor for approval rates by group”) rather than “be more careful with AI”. Research on implementation intentions (Gollwitzer and Sheeran, 2006) found that specific plans are carried out more often than general good intentions.',
      'Ask two or three volunteers to read theirs out. Correct gently if a category is wrong; point them to the classification wizard.',
      'Go back to the four objectives on the second slide and check them off with the group.',
    ],
  },
  {
    id: 'after', kicker: 'After today', title: 'Make it stick',
    points: [
      'In a week: take the quiz for the framework you looked at. Coming back after a gap is the best way to remember.',
      'For your own systems: run them through the classification wizard or add them to My AI register.',
      'For your team: set up a training plan with a shared link, and keep the record.',
    ],
    link: { to: '/team', label: 'Set up team training' },
    notes: [
      'Send the quiz link a week after the session; spacing practice over time works better than one long session.',
      'If your organisation is in the EU: Art. 4 of the AI Act asks providers and deployers to take measures to support their staff’s AI literacy. The Commission says no certificate is needed and an internal record of training is enough. Keep a note of who attended this session and when.',
      'Share the “Before go-live” checklist from the example closest to each person’s work.',
    ],
  },
];
