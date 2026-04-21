/* ==========================================================
   mock.js — mock interview: timer na pytanie, pole odpowiedzi,
   wzorzec + samoocena, lista „do powtórki".
   Ratings: good=2, ok=1, bad=0.  max = 2 * n.
   ========================================================== */
(function () {
  'use strict';

  if (!window.I18N || !window.MOCK_DATA) {
    console.error('mock.js: missing I18N or MOCK_DATA');
    return;
  }

  const RATE = { good: 2, ok: 1, bad: 0 };

  const CAT_KEY = {
    angular: 'cat.angular', architecture: 'cat.architecture', rxjs: 'cat.rxjs',
    forms: 'cat.forms', performance: 'cat.performance', css: 'cat.css',
    pwa: 'cat.pwa', testing: 'cat.testing', devops: 'cat.devops',
    behavioral: 'cat.behavioral', 'system-design': 'cat.system-design',
    typescript: 'cat.typescript',
    camunda: 'cat.camunda', domain: 'cat.domain',
    'ai-tools': 'cat.ai-tools', cloud: 'cat.cloud',
  };

  const categoryColor = (cat) => `var(--cat-${cat}, var(--accent))`;
  const categoryLabel = (cat) => I18N.t(CAT_KEY[cat] || '', cat);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function richText(str) {
    if (!str) return '';
    return escapeHtml(str).replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /* ── State ─────────────────────────────────────────────── */
  const state = {
    screen: 'start',        // 'start' | 'question' | 'result'
    index: 0,
    questions: [],
    answers: [],            // parallel array: textarea content
    ratings: [],            // parallel array: 'good' | 'ok' | 'bad' | null
    timerId: null,
    timeLeft: 0,
    revealed: false,
  };

  /* ── DOM refs ──────────────────────────────────────────── */
  const els = {
    start:       document.getElementById('start-screen'),
    question:    document.getElementById('question-screen'),
    result:      document.getElementById('result-screen'),
    startBtn:    document.getElementById('start-btn'),
    currentQ:    document.getElementById('current-q'),
    totalQ:      document.getElementById('total-q'),
    timer:       document.getElementById('timer-display'),
    timerFill:   document.getElementById('timer-fill'),
    qContainer:  document.getElementById('question-container'),
    resultBody:  document.getElementById('result-body'),
    restartBtn:  document.getElementById('restart-btn'),
  };

  /* ── Screens ───────────────────────────────────────────── */
  function showScreen(name) {
    state.screen = name;
    els.start.classList.toggle('hidden', name !== 'start');
    els.question.classList.toggle('hidden', name !== 'question');
    els.result.classList.toggle('hidden', name !== 'result');
  }

  /* ── Start ─────────────────────────────────────────────── */
  function startMock() {
    state.index = 0;
    state.questions = [...MOCK_DATA];
    state.answers = state.questions.map(() => '');
    state.ratings = state.questions.map(() => null);
    els.totalQ.textContent = state.questions.length;
    showScreen('question');
    renderQuestion();
  }

  /* ── Timer ─────────────────────────────────────────────── */
  function startTimer(totalSec) {
    stopTimer();
    state.timeLeft = totalSec;
    updateTimerDisplay(totalSec, totalSec);
    state.timerId = setInterval(() => {
      state.timeLeft--;
      updateTimerDisplay(state.timeLeft, totalSec);
      if (state.timeLeft <= 0) {
        stopTimer();
        onTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateTimerDisplay(left, total) {
    els.timer.textContent = formatTime(Math.max(0, left));
    const pct = Math.max(0, (left / total) * 100);
    els.timerFill.style.width = `${pct}%`;
    els.timer.classList.toggle('warn', left <= 30 && left > 0);
    els.timer.classList.toggle('over', left <= 0);
  }

  function onTimeUp() {
    const banner = document.getElementById('time-up-banner');
    if (banner) banner.classList.remove('hidden');
    if (!state.revealed) revealAnswer();
  }

  /* ── Question render ───────────────────────────────────── */
  function renderQuestion() {
    const q = state.questions[state.index];
    state.revealed = false;
    els.currentQ.textContent = state.index + 1;

    const catColor = categoryColor(q.cat);
    const keyPointsHtml = (q.keyPoints || [])
      .map(p => `<li>${richText(I18N.pick(p))}</li>`).join('');
    const isLast = state.index === state.questions.length - 1;
    const nextLabel = isLast ? I18N.t('mock.finish') : I18N.t('mock.next');

    els.qContainer.innerHTML = `
      <article class="question-card">
        <div class="mock-meta">
          <span class="question-type-badge" style="color: ${catColor}; border: 1px solid ${catColor};">
            ${escapeHtml(categoryLabel(q.cat))}
          </span>
          <span class="question-type-badge">
            ${escapeHtml(I18N.t('mock.difficulty'))}: ${escapeHtml(q.difficulty)}
          </span>
        </div>

        <p class="question-text">${richText(I18N.pick(q.q))}</p>

        <label for="mock-answer" class="topic-section-label">
          ${escapeHtml(I18N.t('mock.answer.label'))}
        </label>
        <textarea id="mock-answer" class="mock-textarea" rows="6"
                  placeholder="${escapeHtml(I18N.t('mock.answer.ph'))}">${escapeHtml(state.answers[state.index] || '')}</textarea>

        <div id="time-up-banner" class="time-up-banner hidden" role="alert">
          ⏱ ${escapeHtml(I18N.t('mock.timeUp'))}
        </div>

        <button class="check-btn" id="reveal-btn" type="button">
          ${escapeHtml(I18N.t('mock.reveal'))}
        </button>

        <div id="model-answer" class="model-answer hidden">
          <div class="topic-section-label">${escapeHtml(I18N.t('mock.model'))}</div>
          <div class="model-answer-text">${richText(I18N.pick(q.model))}</div>

          <div class="topic-section-label" style="margin-top: 1rem;">
            ${escapeHtml(I18N.t('mock.keyPoints'))}
          </div>
          <ul class="topic-bullets">${keyPointsHtml}</ul>

          <div class="topic-section-label" style="margin-top: 1rem;">
            ${escapeHtml(I18N.t('mock.rate'))}
          </div>
          <div class="rate-buttons">
            <button type="button" class="btn btn-success rate-btn"   data-rate="good">
              ${escapeHtml(I18N.t('mock.rate.good'))}
            </button>
            <button type="button" class="btn btn-secondary rate-btn" data-rate="ok">
              ${escapeHtml(I18N.t('mock.rate.ok'))}
            </button>
            <button type="button" class="btn btn-secondary rate-btn" data-rate="bad">
              ${escapeHtml(I18N.t('mock.rate.bad'))}
            </button>
          </div>

          <button class="next-btn show" id="next-btn" type="button" disabled>
            ${escapeHtml(nextLabel)}
          </button>
        </div>
      </article>
    `;

    bindQuestionHandlers();
    startTimer(q.timeSec);
  }

  function bindQuestionHandlers() {
    const answerEl = document.getElementById('mock-answer');
    answerEl.addEventListener('input', () => {
      state.answers[state.index] = answerEl.value;
    });

    document.getElementById('reveal-btn').addEventListener('click', revealAnswer);

    document.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.rate;
        state.ratings[state.index] = r;
        document.querySelectorAll('.rate-btn').forEach(b => {
          b.classList.toggle('selected', b === btn);
        });
        document.getElementById('next-btn').disabled = false;
      });
    });

    document.getElementById('next-btn').addEventListener('click', goNext);
  }

  function revealAnswer() {
    if (state.revealed) return;
    state.revealed = true;
    stopTimer();
    document.getElementById('reveal-btn').classList.add('hidden');
    document.getElementById('model-answer').classList.remove('hidden');
    document.getElementById('model-answer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function goNext() {
    if (state.index >= state.questions.length - 1) {
      showResults();
      return;
    }
    state.index++;
    renderQuestion();
  }

  /* ── Results ───────────────────────────────────────────── */
  function showResults() {
    stopTimer();
    showScreen('result');
    const n = state.questions.length;
    const scored = state.ratings.reduce((s, r) => s + (r ? RATE[r] : 0), 0);
    const max = n * 2;
    const pct = max ? Math.round((scored / max) * 100) : 0;

    const weak = state.questions
      .map((q, i) => ({ q, r: state.ratings[i] }))
      .filter(x => x.r === 'ok' || x.r === 'bad' || x.r === null);

    const weakHtml = weak.length === 0
      ? `<p style="text-align: center;">${escapeHtml(I18N.t('mock.result.none'))}</p>`
      : `
        <div class="topic-section-label">${escapeHtml(I18N.t('mock.result.weak'))}</div>
        <div class="wrong-topics">
          ${weak.map(x => `
            <div class="wrong-topic-item"
                 style="border-left-color: ${categoryColor(x.q.cat)};">
              <div class="wrong-topic-name">${escapeHtml(I18N.pick(x.q.topic))}</div>
              <div class="wrong-topic-hint">
                ${escapeHtml(categoryLabel(x.q.cat))} · ${escapeHtml(rateLabel(x.r))}
              </div>
            </div>
          `).join('')}
        </div>
      `;

    els.resultBody.innerHTML = `
      <div class="score-circle" style="border-color: ${pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)'};">
        <span class="score-pct">${pct}%</span>
        <span class="score-label">${escapeHtml(I18N.t('mock.result.avg'))}</span>
      </div>
      <h2>${scored} / ${max}</h2>
      <div class="results-details">
        <div class="result-stat">
          <span class="result-stat-num" style="color: var(--success);">
            ${state.ratings.filter(r => r === 'good').length}
          </span>
          <span class="result-stat-label">${escapeHtml(I18N.t('mock.rate.good'))}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-num" style="color: var(--warning);">
            ${state.ratings.filter(r => r === 'ok').length}
          </span>
          <span class="result-stat-label">${escapeHtml(I18N.t('mock.rate.ok'))}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-num" style="color: var(--error);">
            ${state.ratings.filter(r => r === 'bad' || r === null).length}
          </span>
          <span class="result-stat-label">${escapeHtml(I18N.t('mock.rate.bad'))}</span>
        </div>
      </div>
      ${weakHtml}
    `;
  }

  function rateLabel(r) {
    if (r === 'good') return I18N.t('mock.rate.good');
    if (r === 'ok')   return I18N.t('mock.rate.ok');
    return I18N.t('mock.rate.bad');
  }

  /* ── Bootstrap ─────────────────────────────────────────── */
  function init() {
    I18N.init();
    I18N.apply();
    I18N.bindToggle();

    els.startBtn.addEventListener('click', startMock);
    els.restartBtn.addEventListener('click', () => {
      showScreen('start');
    });

    I18N.onChange(() => {
      if (state.screen === 'question') renderQuestion();
      else if (state.screen === 'result') showResults();
    });

    showScreen('start');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
