/**
 * Case-study additions for each example: residual risk, workshop prompts, OWASP codes for problems,
 * problems no safeguard can fix, and the missing memo fields and checklists for four examples.
 * Merged into LABS in labs.ts.
 */
export interface LabExtra {
  residual: string;
  discuss: string[];
  /** OWASP LLM (2026) or Agentic (ASI) codes per problem id */
  codes?: Record<string, string[]>;
  /** problems that no safeguard makes acceptable */
  unmitigable?: string[];
  role?: string;
  kpi?: string;
  checklist?: string[];
}

export const LAB_EXTRAS: Record<string, LabExtra> = {
  spam: {
    residual: 'Some spam will still get through and a few genuine emails will still be filtered. IT owns that balance and should review both error rates every quarter.',
    discuss: [
      'How many wrongly blocked emails a month would your organisation accept, and who should decide?',
      'Users’ spam reports make the filter better but also open it to manipulation. How would you weigh the two?',
    ],
    kpi: 'Spam caught ≥ 99% · real mail lost ≤ 0.1%',
    checklist: [
      'Measure both missed spam and wrongly blocked mail on a recent sample of real email',
      'Normalise look-alike characters and test the filter against disguised spam',
      'Give users a daily digest of filtered mail and an easy “not spam” button',
      'Cap the influence of user spam reports and watch for coordinated reporting',
      'Retrain on recent mail on a schedule and alert when the spam rate jumps',
    ],
  },
  salary: {
    residual: 'Even with equity checks and limits, the model reflects the pay data it is given and cannot judge individual circumstances. HR and the pay committee stay accountable for every offer and should review pay-gap figures at least once a year.',
    discuss: [
      'Should a model trained on past pay be used at all when that pay contains a known gender gap? What would you need to see first?',
      'Who should be able to override a suggested offer, and how would you record why?',
    ],
  },
  credit: {
    residual: 'Some creditworthy applicants will still be declined at any threshold. The credit risk committee must approve that trade-off and review it every quarter.',
    discuss: [
      'Which features would you refuse to use even if they improved accuracy?',
      'What reasons would you give a declined applicant, and could the model actually support them?',
      'How would you notice that a recession had made the model unfair as well as inaccurate?',
    ],
  },
  benefits: {
    residual: 'A pruned, audited tree still flags some honest claimants. Every flag must lead to a human review, never an automatic sanction, and the programme director must answer for flag rates by group.',
    discuss: [
      'Which data should a public body never use to rank people for fraud checks, even if it predicts well?',
      'What would a claimant need to be told, and when, to be able to challenge a flag?',
    ],
  },
  fraud: {
    residual: 'Fraudsters adapt, so some fraud will always get through and some genuine customers will have their cards frozen. The chief risk officer must set the acceptable cost of each and see both reported every month.',
    discuss: [
      'A model that is 99% accurate can catch almost no fraud. Which numbers would you put in the board report instead?',
      'What should a customer whose card was frozen be able to find out, and how quickly?',
    ],
  },
  segments: {
    residual: 'Segments built on behaviour can still mirror income or ethnicity. Marketing owns how offers differ between segments and should check outcomes by area at every campaign review.',
    discuss: [
      'Is it acceptable for some customers never to see your best offers? Where is the line?',
      'Which data-broker attributes would you refuse to buy, and why?',
    ],
  },
  staffing: {
    residual: 'No forecast foresees a genuinely new shock. Ward managers keep the final say on rosters, and the COO must agree minimum safe staffing levels that apply whatever the forecast says.',
    discuss: [
      'What minimum staffing would you fix regardless of the forecast, and who should set it?',
      'How could staff on a ward flag, in real time, that the forecast is wrong?',
    ],
  },
  lesion: {
    residual: 'Even a well-tested model misses some cancers, and its performance on skin types that were rare in testing stays uncertain. Clinicians remain responsible for every discharge, and the clinical director must review every missed case.',
    discuss: [
      'Should a model that performs worse on darker skin be used while better data is gathered? On what conditions?',
      'What should a patient be told about the AI’s part in their triage?',
    ],
  },
  face: {
    residual: 'Even with tested thresholds and two-person checks, some innocent shoppers will be wrongly matched, and everyone who walks in is scanned. The board must decide whether that is proportionate to the theft it prevents; data protection authorities have already fined retailers for this use.',
    discuss: [
      'Is scanning every shopper proportionate to the theft it prevents? What evidence would change your answer?',
      'Who decides who goes on the watchlist, and how does someone get taken off it?',
    ],
    kpi: 'Theft losses −20%',
    checklist: [
      'Check whether this use is lawful at all where you operate, starting with data protection law',
      'Complete an impact assessment before any camera is switched on',
      'Choose a system with independent test results across demographic groups, then test it on your own cameras',
      'Write rules for the watchlist: clear photos, documented reasons, an expiry date and regular review',
      'Require two trained staff to confirm a match before anyone is approached, and delete non-matches immediately',
    ],
  },
  emotion: {
    residual: 'For staff, nothing makes this acceptable: in the EU it is banned at work, and the science behind emotion reading is weak. For customers, even with notice, the labels stay unreliable, so they should never drive decisions about individuals.',
    discuss: [
      'If the law allowed it, would you still use emotion scores in performance reviews? Why or why not?',
      'What could management measure instead to support call quality?',
    ],
    unmitigable: ['rank'],
    kpi: 'Customer satisfaction +10 points',
    checklist: [
      'Confirm that no emotion scores about staff are produced, stored or used, anywhere in the EU',
      'Involve the works council or staff representatives before any monitoring of calls',
      'Test any customer-facing emotion feature for validity across accents and speech differences',
      'Tell customers at the start of the call if their voice is analysed',
      'Never link emotion labels to customer accounts or use them to make decisions about a person',
    ],
  },
  cv: {
    residual: 'Counterfactual tests and human review reduce bias but cannot prove it is gone, and the model still ranks people from a partial picture. HR must own the shortlist and audit outcomes by group at least once a year.',
    discuss: [
      'Which CV features should never influence a ranking, even if they predict who was hired before?',
      'How would a rejected candidate find out that an AI was involved, and what could they ask for?',
    ],
  },
  feed: {
    residual: 'Any ranking shapes what people see. Diversity and quality signals reduce harm but do not remove the pull towards maximising attention. Product leadership must set limits on engagement goals and review the effects on young users.',
    discuss: [
      'Which measure other than watch-time would you be willing to be judged on?',
      'Should users be able to switch to a feed that is not personalised? What would you lose?',
    ],
  },
  pricing: {
    residual: 'Caps and audits limit the worst outcomes, but a reinforcement-learning agent will keep finding whatever its reward allows. The CFO must own the pricing policy, including what is never acceptable, such as surge pricing in an emergency.',
    discuss: [
      'Which price changes would be unacceptable even if they were legal?',
      'How would you tell whether your pricing bot and a competitor’s have settled into matching prices?',
    ],
  },
  foundation: {
    residual: 'Evaluations and a safety framework reduce, but cannot rule out, misuse by people building on the model, and questions about training data are still being decided in court. The lab’s leadership must accept those risks openly and keep its safety documentation current.',
    discuss: [
      'Who should decide whether a new model is safe enough to release: the developer, a regulator or an independent body?',
      'What should a company building on your model be told about its limits?',
    ],
    kpi: 'API launch within 9 months',
    checklist: [
      'Record where every training dataset came from, under which licence, and how opt-outs were honoured',
      'Filter personal data before training and test the model for memorised personal details',
      'Run dangerous-capability evaluations with external red-teamers before release',
      'Publish technical documentation for downstream providers and a summary of training content',
      'Set up serious-incident reporting and protect the model weights',
    ],
  },
  chatbot: {
    residual: 'Retrieval and guardrails make wrong or manipulated answers rarer, not impossible. Customer service leadership must accept that the company is bound by what the bot says, and keep a fast route to a person.',
    discuss: [
      'If the bot promises something wrong, should the company honour it? Where would you draw the line?',
      'Which questions should the bot never answer without a person?',
    ],
    codes: { hallu: ['LLM07:2026'], jailbreak: ['LLM01:2026'], pii: ['LLM02:2026'] },
  },
  rag: {
    residual: 'Access controls and citations help, but the assistant is only as current and trustworthy as the documents behind it. Document owners must keep sources up to date, and the CIO must own the index.',
    discuss: [
      'Who owns an answer the assistant gives from an outdated policy: the document owner, IT or the user?',
      'Which document collections should never be indexed?',
    ],
    codes: { stale: ['LLM07:2026'], poison: ['LLM01:2026', 'LLM05:2026'], perm: ['LLM09:2026'], nocite: ['LLM07:2026'] },
  },
  imagegen: {
    residual: 'Even with bias checks, usage policies and labels, generated images can still carry stereotypes or be misused once published. The communications team must review every image used externally.',
    discuss: [
      'When should an AI-generated image be labelled, even where the law does not require it?',
      'Would you generate images “in the style of” a living artist? Why or why not?',
    ],
  },
  code: {
    residual: 'Scanning and review catch many flaws, but not all, and developers may come to trust suggestions too much. The CTO must keep human code review mandatory and track defects that come from AI-written code.',
    discuss: [
      'Should AI-written code be reviewed differently from code written by a colleague?',
      'How would you measure whether the assistant is making your software less secure?',
    ],
    codes: { accept: ['LLM10:2026'], pkg: ['LLM04:2026'], secret: ['LLM02:2026'] },
  },
  'travel-agent': {
    residual: 'With least privilege and approvals the damage is bounded, but a hijacked or confused agent can still act within its limits. The COO must set those limits and the spending at risk, and review the audit trail.',
    discuss: [
      'Which actions should an agent never take without a person pressing “approve”?',
      'If the agent books the wrong trip, who is accountable: the employee, IT or the vendor?',
    ],
    codes: { perms: ['ASI03', 'LLM03:2026'], inject: ['ASI01', 'LLM01:2026'], vague: ['LLM03:2026'] },
  },
  'devops-agent': {
    residual: 'Gates and sandboxes stop the worst failures, but an agent can still make plausible mistakes that pass review. The CTO must keep a named person responsible for every deployment and a tested way to roll back.',
    discuss: [
      'What should a coding agent be allowed to do on its own, and what only through a reviewed pipeline?',
      'How would you check that an agent’s report of its own work is true?',
    ],
    codes: { prodaccess: ['ASI03', 'LLM03:2026'], misread: ['ASI02'], cover: ['ASI09'], noreview: ['LLM03:2026'] },
  },
  swarm: {
    residual: 'Verification and caps limit cascades, but in a network of agents some errors will travel before they are caught. The procurement owner must approve commitments above a threshold and answer for the system as a whole.',
    discuss: [
      'Who is accountable when four agents each did their job and the result is still wrong?',
      'What would make you stop the whole system, and who can press the button?',
    ],
    codes: { cascade: ['ASI08'], collusion: ['ASI07'], runaway: ['LLM06:2026'] },
  },
};
