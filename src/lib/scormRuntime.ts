/**
 * The script inside each SCORM 1.2 quiz package. Plain ES5 so older LMS players run it.
 * It reads window.QUIZ, talks to the LMS through the SCORM 1.2 API when one is found,
 * and works on its own (without saving) when opened outside an LMS.
 */
export const SCO_SCRIPT = String.raw`(function () {
  var Q = window.QUIZ, PASS = 80;
  var root = document.getElementById('app');
  var api = null, started = new Date(), finished = false;

  /* SCORM 1.2 API discovery: look up the parent frames, then the opener */
  function findIn(win) {
    var tries = 0;
    while (win && !win.API && win.parent && win.parent !== win && tries < 10) { win = win.parent; tries++; }
    return win && win.API ? win.API : null;
  }
  try { api = findIn(window) || (window.opener ? findIn(window.opener) : null); } catch (e) { api = null; }
  function get(k) { try { return api ? String(api.LMSGetValue(k)) : ''; } catch (e) { return ''; } }
  function set(k, v) { try { if (api) api.LMSSetValue(k, String(v)); } catch (e) {} }
  function commit() { try { if (api) api.LMSCommit(''); } catch (e) {} }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function span() { var s = Math.round((new Date() - started) / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }

  if (api) {
    try { api.LMSInitialize(''); } catch (e) { api = null; }
    var st = get('cmi.core.lesson_status');
    if (st === '' || st === 'not attempted') { set('cmi.core.lesson_status', 'incomplete'); commit(); }
  }
  function finish() {
    if (finished || !api) return;
    finished = true;
    set('cmi.core.session_time', span());
    set('cmi.core.exit', '');
    commit();
    try { api.LMSFinish(''); } catch (e) {}
  }
  window.addEventListener('pagehide', finish);
  window.addEventListener('beforeunload', finish);

  function report(pct) {
    if (!api) return;
    var prev = parseFloat(get('cmi.core.score.raw'));
    var best = isNaN(prev) ? pct : Math.max(prev, pct);
    set('cmi.core.score.min', 0);
    set('cmi.core.score.max', 100);
    set('cmi.core.score.raw', best);
    set('cmi.core.lesson_status', best >= PASS ? 'passed' : 'failed');
    commit();
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs) { if (k === 'text') n.textContent = attrs[k]; else if (k === 'onclick') n.onclick = attrs[k]; else n.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function screen(kids) {
    root.innerHTML = '';
    kids.forEach(function (c) { if (c) root.appendChild(c); });
    var h = root.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  function more(link) { return el('a', { href: link, target: '_blank', rel: 'noopener', text: 'Read more on AI Risk Explorer' }); }

  var i = 0, score = 0, answers = [];
  function intro() {
    screen([
      el('p', { 'class': 'kicker', text: 'Quiz · ' + Q.questions.length + ' questions · about 4 minutes' }),
      el('h1', { text: Q.title }),
      el('p', { text: 'Five short scenarios test whether you can apply what you have learned to real situations, not just recall definitions.' }),
      el('ul', {}, [
        el('li', { text: 'Choose the best answer. You will see straight away whether it was right, and why.' }),
        el('li', { text: 'Read every explanation, including for the questions you get right.' }),
        el('li', { text: 'You pass with ' + PASS + '% or more. You can try again as often as you like; your best score counts.' })
      ]),
      api ? null : el('p', { 'class': 'note', text: 'This quiz is running outside a learning platform, so your result will not be saved.' }),
      el('button', { 'class': 'primary', onclick: function () { i = 0; score = 0; answers = []; question(); }, text: 'Start the quiz' })
    ]);
  }
  function question() {
    var q = Q.questions[i], picked = null;
    var fb = el('div', { 'class': 'feedback', 'aria-live': 'polite' });
    var next = el('button', { 'class': 'primary', disabled: 'disabled', text: i < Q.questions.length - 1 ? 'Next question' : 'See my result',
      onclick: function () { i++; if (i < Q.questions.length) question(); else result(); } });
    var opts = el('div', { 'class': 'opts', role: 'group', 'aria-label': 'Answers' });
    q.options.forEach(function (o, k) {
      var b = el('button', { 'class': 'opt', text: o, onclick: function () {
        if (picked !== null) return;
        picked = k;
        var ok = k === q.answer;
        if (ok) score++;
        answers.push({ picked: k, ok: ok });
        Array.prototype.forEach.call(opts.children, function (x, j) {
          x.setAttribute('aria-disabled', 'true');
          if (j === q.answer) x.className = 'opt right';
          else if (j === k) x.className = 'opt wrong';
        });
        fb.innerHTML = '';
        fb.appendChild(el('p', { 'class': ok ? 'ok' : 'no', text: ok ? 'Correct.' : 'Not quite. The answer is: ' + q.options[q.answer] }));
        fb.appendChild(el('p', { text: q.explain }));
        fb.appendChild(el('p', {}, [more(q.link)]));
        next.removeAttribute('disabled');
        next.focus();
      } });
      opts.appendChild(b);
    });
    screen([
      el('p', { 'class': 'kicker', text: 'Question ' + (i + 1) + ' of ' + Q.questions.length }),
      el('h2', { text: q.q }), opts, fb, next
    ]);
  }
  function result() {
    var pct = Math.round(score / Q.questions.length * 100), passed = pct >= PASS;
    report(pct);
    var review = el('ol', { 'class': 'review' });
    Q.questions.forEach(function (q, k) {
      var a = answers[k];
      review.appendChild(el('li', {}, [
        el('p', {}, [el('b', { text: q.q })]),
        el('p', { 'class': a.ok ? 'ok' : 'no', text: (a.ok ? 'You answered correctly: ' : 'You chose: ' + q.options[a.picked] + '. The answer is: ') + q.options[q.answer] }),
        el('p', { text: q.explain })
      ]));
    });
    screen([
      el('p', { 'class': 'kicker', text: 'Your result' }),
      el('h1', { text: 'You scored ' + score + ' out of ' + Q.questions.length + ' (' + pct + '%)' }),
      el('p', { text: passed ? 'Well done, you passed. Come back in a week and try again without looking anything up: recalling it after a gap is what makes it stay.' : 'Not passed yet. Read the explanations below, follow the links for anything that is still unclear, then try again.' }),
      el('h2', { text: 'Review your answers' }), review,
      el('button', { 'class': 'primary', onclick: function () { i = 0; score = 0; answers = []; question(); }, text: 'Try again' })
    ]);
  }
  intro();
})();`;

export const SCO_CSS = `
*{box-sizing:border-box}body{margin:0;font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1d1f23;background:#f6f5f1}
main{max-width:760px;margin:0 auto;padding:28px 20px 48px}h1{font-size:28px;line-height:1.2;margin:.2em 0 .5em}h2{font-size:21px;line-height:1.3}
h1:focus,h2:focus{outline:none}.kicker{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2d7d6c;margin:0}
button{font:inherit;cursor:pointer;border-radius:10px;min-height:44px}button.primary{background:#2d7d6c;color:#fff;border:0;padding:10px 20px;margin-top:16px;font-weight:600}
button.primary[disabled]{opacity:.45;cursor:default}.opts{display:grid;gap:8px;margin:16px 0}
.opt{text-align:left;background:#fff;border:1px solid #c9c6bd;padding:12px 14px;color:#1d1f23}.opt:hover{border-color:#2d7d6c}
.opt.right{border-color:#2d7d6c;background:#e3f2ee}.opt.wrong{border-color:#b3453e;background:#f8e4e2}
.feedback p{margin:.5em 0}.ok{color:#1f6656;font-weight:600}.no{color:#9b3a34;font-weight:600}.note{background:#fff4d6;padding:10px 12px;border-radius:8px}
a{color:#1f6656}.review{padding-left:20px}.review li{margin-bottom:14px}footer{max-width:760px;margin:0 auto;padding:0 20px 28px;font-size:13px;color:#5b5e64}
button:focus-visible,a:focus-visible{outline:3px solid #2d7d6c;outline-offset:2px}
`;
