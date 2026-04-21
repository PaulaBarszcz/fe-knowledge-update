/* ==========================================================
   quiz.js — logika quizu (start / question / results)
   Zależy od: window.I18N, window.QUIZ_DATA
   ========================================================== */
(function () {
  'use strict';

  /* ── Utility ───────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function categoryColor(cat) {
    const map = {
      architecture:   'var(--cat-architecture)',
      angular:        'var(--cat-angular)',
      rxjs:           'var(--cat-rxjs)',
      forms:          'var(--cat-forms)',
      performance:    'var(--cat-performance)',
      css:            'var(--cat-css)',
      pwa:            'var(--cat-pwa)',
      testing:        'var(--cat-testing)',
      devops:         'var(--cat-devops)',
      typescript:     'var(--cat-typescript)',
      behavioral:     'var(--cat-behavioral)',
      'system-design':'var(--cat-system-design)',
      camunda:        'var(--cat-camunda)',
      domain:         'var(--cat-domain)',
      'ai-tools':     'var(--cat-ai-tools)',
      cloud:          'var(--cat-cloud)',
    };
    return map[cat] || 'var(--accent)';
  }

  function categoryLabel(cat) {
    return I18N.t(`cat.${cat}`, cat);
  }

  /* ── State ─────────────────────────────────────────────── */
  const state = {
    selectedCount: 20,
    questions: [],
    index: 0,
    score: 0,
    /** Pełna historia odpowiedzi — do ekranu review. */
    history: [],
    /** Mapa: selectedIndexes per current question. Czyszczona po "Next". */
    selected: new Set(),
    checked: false,
    screen: 'start', // 'start' | 'quiz' | 'results' | 'review'
  };

  /* ── DOM refs ──────────────────────────────────────────── */
  const refs = {
    startScreen:    $('#start-screen'),
    quizScreen:     $('#quiz-screen'),
    resultsScreen:  $('#results-screen'),
    startBtn:       $('#start-quiz-btn'),
    countButtons:   $$('.count-btn'),
    totalCountSpan: $('[data-total-count]'),
    progressFill:   $('#progress-fill'),
    currentQ:       $('#current-q'),
    totalQ:         $('#total-q'),
    liveScore:      $('#live-score'),
    questionContainer: $('#question-container'),
    scoreCircle:    $('#score-circle'),
    scorePct:       $('#score-pct'),
    resultTitle:    $('#result-title'),
    resultMessage:  $('#result-message'),
    correctCount:   $('#correct-count'),
    wrongCount:     $('#wrong-count'),
    totalCount:     $('#total-count'),
    restartBtn:     $('#restart-btn'),
    reviewBtn:      $('#review-btn'),
    wrongTopicsList:$('#wrong-topics-list'),
  };

  /* ── Screens ───────────────────────────────────────────── */
  function showScreen(name) {
    state.screen = name;
    refs.startScreen.classList.toggle('hidden', name !== 'start');
    refs.quizScreen.classList.toggle('hidden', name !== 'quiz');
    refs.resultsScreen.classList.toggle('hidden', name !== 'results' && name !== 'review');
  }

  /* ── Start screen ──────────────────────────────────────── */
  function initStartScreen() {
    refs.totalCountSpan.textContent = String(QUIZ_DATA.length);

    refs.countButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        refs.countButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedCount = btn.dataset.count === 'all' ? QUIZ_DATA.length : Number(btn.dataset.count);
      });
    });

    refs.startBtn.addEventListener('click', startQuiz);
  }

  /* ── Quiz lifecycle ────────────────────────────────────── */
  function startQuiz() {
    const count = Math.min(state.selectedCount, QUIZ_DATA.length);
    state.questions = shuffle(QUIZ_DATA).slice(0, count).map(q => ({
      ...q,
      // pomieszaj kolejność odpowiedzi per pytanie
      a: shuffle(q.a),
    }));
    state.index = 0;
    state.score = 0;
    state.history = [];
    state.selected = new Set();
    state.checked = false;

    refs.totalQ.textContent = String(state.questions.length);
    refs.liveScore.textContent = '0';
    showScreen('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    state.selected = new Set();
    state.checked = false;

    refs.currentQ.textContent = String(state.index + 1);
    const progress = ((state.index) / state.questions.length) * 100;
    refs.progressFill.style.width = `${progress}%`;

    const isMulti = q.type === 'multi';
    const typeLabel = I18N.t(isMulti ? 'quiz.multi' : 'quiz.single');
    const catLabel = categoryLabel(q.cat);

    const card = document.createElement('article');
    card.className = 'question-card';
    card.innerHTML = `
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem;">
        <span class="question-type-badge" style="color:${categoryColor(q.cat)};border:1px solid ${categoryColor(q.cat)};background:transparent;">${escapeHtml(catLabel)}</span>
        <span class="question-type-badge">${escapeHtml(typeLabel)}</span>
      </div>
      <h2 class="question-text">${I18N.pick(q.q)}</h2>
      <div class="answers-grid" role="group"></div>
      <button class="check-btn" data-i18n="quiz.check">${I18N.t('quiz.check')}</button>
      <div class="explanation-box"></div>
      <button class="next-btn">${I18N.t(state.index === state.questions.length - 1 ? 'quiz.finish' : 'quiz.next')}</button>
    `;

    const grid = $('.answers-grid', card);
    q.a.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.className = `answer-btn${isMulti ? ' multi' : ''}`;
      btn.type = 'button';
      btn.dataset.idx = String(i);
      btn.innerHTML = `
        <span class="answer-marker">${isMulti ? '' : String.fromCharCode(65 + i)}</span>
        <span class="answer-text">${I18N.pick(ans)}</span>
      `;
      btn.addEventListener('click', () => onAnswerClick(i, btn, isMulti));
      grid.appendChild(btn);
    });

    const checkBtn = $('.check-btn', card);
    const nextBtn = $('.next-btn', card);

    if (isMulti) {
      // multi: check button od razu widoczny, zablokowany dopóki nic nie wybrane
      checkBtn.disabled = true;
      checkBtn.addEventListener('click', () => checkAnswer(q, card, nextBtn));
    } else {
      // single: check button ukryty — klik odpowiedzi od razu sprawdza
      checkBtn.style.display = 'none';
    }

    nextBtn.addEventListener('click', goNext);

    refs.questionContainer.innerHTML = '';
    refs.questionContainer.appendChild(card);
  }

  function onAnswerClick(idx, btn, isMulti) {
    if (state.checked) return;
    const q = state.questions[state.index];
    const card = btn.closest('.question-card');

    if (isMulti) {
      if (state.selected.has(idx)) {
        state.selected.delete(idx);
        btn.classList.remove('selected');
      } else {
        state.selected.add(idx);
        btn.classList.add('selected');
      }
      const checkBtn = $('.check-btn', card);
      checkBtn.disabled = state.selected.size === 0;
    } else {
      state.selected = new Set([idx]);
      $$('.answer-btn', card).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // single — od razu sprawdź
      checkAnswer(q, card, $('.next-btn', card));
    }
  }

  function checkAnswer(q, card, nextBtn) {
    state.checked = true;
    const answerBtns = $$('.answer-btn', card);
    const correctIndexes = q.a.map((a, i) => a.ok ? i : -1).filter(i => i !== -1);
    const selectedArr = [...state.selected];

    const allCorrect = correctIndexes.length === selectedArr.length
      && correctIndexes.every(i => state.selected.has(i));

    answerBtns.forEach((btn, i) => {
      btn.disabled = true;
      const isCorrect = q.a[i].ok;
      const wasSelected = state.selected.has(i);

      if (isCorrect && wasSelected) btn.classList.add('correct');
      else if (!isCorrect && wasSelected) btn.classList.add('wrong');
      else if (isCorrect && !wasSelected) btn.classList.add('missed');
    });

    // explanation box
    const expBox = $('.explanation-box', card);
    expBox.innerHTML = `<strong>${allCorrect ? '✓' : '✗'}</strong> ${I18N.pick(q.exp)}`;
    expBox.classList.add('show');

    // hide check, show next
    const checkBtn = $('.check-btn', card);
    if (checkBtn) checkBtn.style.display = 'none';
    nextBtn.classList.add('show');

    // history
    state.history.push({
      question: q,
      selected: selectedArr,
      correct: correctIndexes,
      isCorrect: allCorrect,
    });
    if (allCorrect) {
      state.score++;
      refs.liveScore.textContent = String(state.score);
    }
  }

  function goNext() {
    if (state.index < state.questions.length - 1) {
      state.index++;
      renderQuestion();
    } else {
      showResults();
    }
  }

  /* ── Results ───────────────────────────────────────────── */
  function showResults() {
    const total = state.questions.length;
    const correct = state.score;
    const wrong = total - correct;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    refs.progressFill.style.width = '100%';

    refs.scorePct.textContent = `${pct}%`;
    refs.correctCount.textContent = String(correct);
    refs.wrongCount.textContent = String(wrong);
    refs.totalCount.textContent = String(total);

    // score ring color
    const ringColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : pct >= 40 ? 'var(--warning)' : 'var(--error)';
    refs.scoreCircle.style.borderColor = ringColor;
    refs.scorePct.style.color = ringColor;

    // message
    let msgKey;
    if (pct >= 85) msgKey = 'quiz.result.excellent';
    else if (pct >= 70) msgKey = 'quiz.result.good';
    else if (pct >= 50) msgKey = 'quiz.result.ok';
    else msgKey = 'quiz.result.bad';

    refs.resultTitle.textContent = `${correct} / ${total}`;
    refs.resultMessage.textContent = I18N.t(msgKey);

    renderWrongTopics();
    showScreen('results');
  }

  function renderWrongTopics() {
    const wrongs = state.history.filter(h => !h.isCorrect);
    refs.wrongTopicsList.innerHTML = '';

    if (wrongs.length === 0) {
      return;
    }

    const title = document.createElement('h3');
    title.style.margin = '1.25rem 0 .5rem';
    title.style.fontSize = '.85rem';
    title.style.textTransform = 'uppercase';
    title.style.letterSpacing = '.06em';
    title.style.color = 'var(--text-muted)';
    title.textContent = I18N.t('quiz.reviewTitle');
    refs.wrongTopicsList.appendChild(title);

    // Dedupe po topic
    const seen = new Set();
    wrongs.forEach(h => {
      const key = h.question.id;
      if (seen.has(key)) return;
      seen.add(key);

      const item = document.createElement('div');
      item.className = 'wrong-topic-item';
      item.style.borderLeftColor = categoryColor(h.question.cat);
      item.innerHTML = `
        <div class="wrong-topic-name">${I18N.pick(h.question.topic)}</div>
        <div class="wrong-topic-hint">${I18N.pick(h.question.q)}</div>
      `;
      refs.wrongTopicsList.appendChild(item);
    });
  }

  /* ── Review screen (reuses results container) ─────────── */
  function showReview() {
    // Przerabiamy wrongTopicsList na szczegółowy review
    refs.wrongTopicsList.innerHTML = '';

    const title = document.createElement('h3');
    title.style.margin = '1.25rem 0 .75rem';
    title.style.fontSize = '.9rem';
    title.textContent = I18N.t('quiz.reviewTitle');
    refs.wrongTopicsList.appendChild(title);

    state.history.forEach((h, idx) => {
      const q = h.question;
      const item = document.createElement('div');
      item.className = 'wrong-topic-item';
      item.style.borderLeftColor = h.isCorrect ? 'var(--success)' : 'var(--error)';
      item.style.padding = '.75rem .9rem';
      item.style.marginBottom = '.6rem';

      const answersHtml = q.a.map((a, i) => {
        const isCorrect = a.ok;
        const wasSelected = h.selected.includes(i);
        let bg = 'transparent';
        let color = 'var(--text-secondary)';
        let prefix = '&nbsp;&nbsp;';
        if (isCorrect) { color = 'var(--success)'; prefix = '✓ '; }
        if (wasSelected && !isCorrect) { color = 'var(--error)'; prefix = '✗ '; }
        return `<li style="color:${color};margin:.15rem 0;list-style:none;font-size:.8rem;">${prefix}${I18N.pick(a)}</li>`;
      }).join('');

      item.innerHTML = `
        <div class="wrong-topic-name" style="margin-bottom:.35rem;">
          ${idx + 1}. ${I18N.pick(q.q)}
        </div>
        <ul style="padding:0;margin:.25rem 0;">${answersHtml}</ul>
        <div style="margin-top:.5rem;padding:.5rem .65rem;background:var(--bg-hover);border-radius:var(--radius-sm);font-size:.78rem;color:var(--text-secondary);">
          ${I18N.pick(q.exp)}
        </div>
      `;
      refs.wrongTopicsList.appendChild(item);
    });

    // zmień przycisk na "Back"
    refs.reviewBtn.textContent = I18N.t('quiz.back');
    refs.reviewBtn.onclick = () => {
      renderWrongTopics();
      refs.reviewBtn.textContent = I18N.t('quiz.review');
      refs.reviewBtn.onclick = showReview;
    };
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    I18N.init();
    I18N.bindToggle();
    I18N.apply();
    I18N.onChange(() => {
      // Re-render aktywnego ekranu po zmianie języka
      if (state.screen === 'quiz') renderQuestion();
      if (state.screen === 'results') showResults();
    });

    initStartScreen();

    refs.restartBtn.addEventListener('click', () => {
      refs.reviewBtn.textContent = I18N.t('quiz.review');
      refs.reviewBtn.onclick = showReview;
      showScreen('start');
    });
    refs.reviewBtn.onclick = showReview;
  }

  /* ── HTML escape ───────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
