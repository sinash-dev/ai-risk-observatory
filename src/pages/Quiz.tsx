import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Ring } from '../components/model/Panels';
import { Breadcrumbs } from '../components/Nav';
import { QUIZZES, QUIZ_BY_ID, type Quiz } from '../data/quizzes';
import { order, passed, saveQuizResult, useQuizResults } from '../lib/quizStore';
import { track } from '../lib/track';
import { url } from '../lib/util';
import type { PageProps } from './registry';

function Index() {
  const results = useQuizResults();
  const groups: [string, Quiz[]][] = [['By framework', QUIZZES.filter((q) => q.kind === 'framework')], ['By type of model', QUIZZES.filter((q) => q.kind === 'family')]];
  const done = QUIZZES.filter((q) => passed(results[q.id])).length;
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Quizzes' }]} />
        <h1>Quizzes</h1>
        <p className="lead">{QUIZZES.length} short quizzes with five scenario questions each. Every answer comes with an explanation and a link to where it is taught. Score 80% or more to add a module to your <a href={url('/certificate')}>certificate</a>.</p>
        <p className="small muted">{done} of {QUIZZES.length} passed in this browser.</p>
      </div>
      {groups.map(([g, qs]) => (
        <section key={g} className="section" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: 20 }}>{g}</h2>
          <div className="grid3" style={{ marginTop: 14 }}>
            {qs.map((q) => {
              const r = results[q.id];
              return (
                <a key={q.id} href={url(`/quiz/${q.id}`)} className="card card-pad lift quiz-card" style={{ color: 'inherit' }}>
                  <span><b>{q.title}</b><span className="muted small" style={{ display: 'block' }}>{q.questions.length} questions</span></span>
                  {r ? <span className={`tag ${passed(r) ? 'explored' : ''}`}>{passed(r) ? 'Passed' : 'Best'} {r.score}/{r.total}</span> : <span className="small accent">Start →</span>}
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Run({ quiz }: { quiz: Quiz }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const head = useRef<HTMLHeadingElement>(null);
  const q = quiz.questions[i];
  const perm = order(quiz.id + q.q);
  useEffect(() => { head.current?.focus({ preventScroll: true }); }, [i, done]);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i < quiz.questions.length - 1) { setI(i + 1); setPicked(null); return; }
    saveQuizResult(quiz.id, { score, total: quiz.questions.length, at: Date.now() });
    track(`quiz-${quiz.id}-done`);
    setDone(true);
  };
  const retry = () => { setI(0); setPicked(null); setScore(0); setDone(false); };
  const total = quiz.questions.length;
  const ok = score / total >= 0.8;

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ to: '/quiz', label: 'Quizzes' }, { label: quiz.title }]} />
        <h1>Quiz: {quiz.title}</h1>
      </div>
      <div className="quiz narrow">
        {!done ? (
          <>
            <div className="wiz-progress" aria-hidden><motion.div animate={{ width: `${((i + (picked !== null ? 1 : 0)) / total) * 100}%` }} /></div>
            <p className="small muted">Question {i + 1} of {total}</p>
            <AnimatePresence mode="wait">
              <motion.fieldset key={i} className="wiz-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                <legend><h2 ref={head} tabIndex={-1} className="wiz-q">{q.q}</h2></legend>
                <div className="opts">
                  {perm.map((k, n) => {
                    const state = picked === null ? '' : k === q.answer ? 'right' : k === picked ? 'wrong' : 'dim';
                    return (
                      <motion.button key={k} type="button" className={`opt quiz-opt ${state}`} onClick={() => choose(k)} aria-disabled={picked !== null} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * n }}>
                        <span className="quiz-key" aria-hidden>{'ABCD'[n]}</span>
                        <span>{q.options[k]}</span>
                        {state === 'right' && <span className="sr-only"> (correct answer)</span>}
                        {state === 'wrong' && <span className="sr-only"> (your answer, incorrect)</span>}
                      </motion.button>
                    );
                  })}
                </div>
                <div aria-live="polite">
                  {picked !== null && (
                    <motion.div className={`quiz-explain ${picked === q.answer ? 'ok' : 'no'}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <b>{picked === q.answer ? 'Correct.' : 'Not quite.'}</b> {q.explain} <a href={url(q.link)}>Learn more →</a>
                    </motion.div>
                  )}
                </div>
              </motion.fieldset>
            </AnimatePresence>
            <div className="wiz-nav">
              <button className="btn btn-primary" disabled={picked === null} onClick={next}>{i < total - 1 ? 'Next question' : 'See my score'}</button>
            </div>
          </>
        ) : (
          <motion.div className="quiz-result card card-pad" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Ring n={score} total={total} size={96} />
            <div>
              <h2 ref={head} tabIndex={-1}>{ok ? 'Well done.' : 'Keep going.'} You scored {score} out of {total}.</h2>
              <p className="muted">{ok ? 'This module now counts towards your certificate.' : 'Score 4 or more out of 5 to add this module to your certificate.'}</p>
              <div className="wiz-nav">
                <button className="btn" onClick={retry}>Try again</button>
                <a className="btn" href={url('/quiz')}>All quizzes</a>
                {ok && <a className="btn btn-primary" href={url('/certificate')}>View certificate</a>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage({ param }: PageProps) {
  const quiz = param ? QUIZ_BY_ID[param] : undefined;
  if (!param) return <Index />;
  if (!quiz) return <div className="wrap section"><h1>Quiz not found</h1><p><a href={url('/quiz')}>All quizzes</a></p></div>;
  return <Run key={quiz.id} quiz={quiz} />;
}
