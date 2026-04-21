/* ==========================================================
   i18n — prosty, dwujęzyczny (PL/EN), stan w localStorage
   ========================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'paula-pzu.lang';
  const DEFAULT_LANG = 'pl';
  const SUPPORTED = ['pl', 'en'];

  const DICT = {
    'nav.home':         { pl: 'Start',               en: 'Home' },
    'nav.definitions':  { pl: 'Definicje',          en: 'Definitions' },
    'nav.quiz':         { pl: 'Quiz',                en: 'Quiz' },
    'nav.mock':         { pl: 'Mock interview',     en: 'Mock interview' },

    /* ── Home page ─────────────────────────────────────── */
    'home.title':        { pl: 'Angular Interview Prep', en: 'Angular Interview Prep' },
    'home.subtitle':     { pl: 'Twój zestaw narzędzi do rozmowy Senior Frontend (Angular 21).',
                           en: 'Your toolkit for the Senior Frontend interview (Angular 21).' },
    'home.stats.flash':  { pl: 'fiszek',           en: 'flashcards' },
    'home.stats.quiz':   { pl: 'pytań quizu',       en: 'quiz questions' },
    'home.stats.mock':   { pl: 'pytań mock',        en: 'mock questions' },
    'home.card.defs.title':  { pl: 'Definicje',                   en: 'Definitions' },
    'home.card.defs.desc':   { pl: 'Fiszki z kluczowymi pojęciami: Angular, RxJS, Camunda, KYC/AML, Copilot, AWS. Search, filtry, expand/collapse.',
                               en: 'Flashcards of key concepts: Angular, RxJS, Camunda, KYC/AML, Copilot, AWS. Search, filters, expand/collapse.' },
    'home.card.quiz.title':  { pl: 'Quiz',                         en: 'Quiz' },
    'home.card.quiz.desc':   { pl: 'Pytania single / multi-choice w kilkunastu kategoriach. Wybierz długość (10 / 20 / wszystkie) i sprawdź się.',
                               en: 'Single / multi-choice questions across a dozen categories. Pick length (10 / 20 / all) and test yourself.' },
    'home.card.mock.title':  { pl: 'Mock interview',              en: 'Mock interview' },
    'home.card.mock.desc':   { pl: 'Pytania open-ended z timerem (3–5 min), wzorcowa odpowiedź, samoocena → lista tematów do powtórki.',
                               en: 'Open-ended questions with a 3–5 min timer, model answer, self-rating → a review list of weak topics.' },
    'home.card.cta':         { pl: 'Otwórz',                       en: 'Open' },
    'home.updated':          { pl: 'ostatnia aktualizacja',       en: 'last update' },
    'quiz.title':       { pl: 'Quiz Angular Senior', en: 'Angular Senior Quiz' },
    'quiz.subtitle':    { pl: 'Wybierz liczbę pytań i sprawdź swoją wiedzę.', en: 'Pick a question count and test your knowledge.' },
    'quiz.questions':   { pl: 'pytań',               en: 'questions' },
    'quiz.all':         { pl: 'wszystkie',           en: 'all' },
    'quiz.start':       { pl: 'Rozpocznij quiz',     en: 'Start quiz' },
    'quiz.score':       { pl: 'Wynik',               en: 'Score' },
    'quiz.check':       { pl: 'Sprawdź odpowiedź',   en: 'Check answer' },
    'quiz.next':        { pl: 'Następne pytanie',    en: 'Next question' },
    'quiz.finish':      { pl: 'Zobacz wynik',        en: 'See result' },
    'quiz.scoreLabel':  { pl: 'Wynik',               en: 'Score' },
    'quiz.correct':     { pl: 'poprawnych',          en: 'correct' },
    'quiz.wrong':       { pl: 'błędnych',            en: 'wrong' },
    'quiz.total':       { pl: 'wszystkich',          en: 'total' },
    'quiz.restart':     { pl: 'Jeszcze raz',         en: 'Try again' },
    'quiz.review':      { pl: 'Przejrzyj błędy',     en: 'Review mistakes' },
    'quiz.single':      { pl: 'Jedna odpowiedź',     en: 'Single choice' },
    'quiz.multi':       { pl: 'Wiele odpowiedzi',    en: 'Multiple choice' },
    'quiz.reviewTitle': { pl: 'Tematy do powtórki',  en: 'Topics to review' },
    'quiz.back':        { pl: 'Wróć do wyniku',      en: 'Back to result' },
    'quiz.result.excellent': { pl: 'Świetnie! Jesteś gotowa na rozmowę.', en: 'Excellent! You are ready for the interview.' },
    'quiz.result.good':      { pl: 'Dobra robota, jeszcze kilka tematów do doszlifowania.', en: 'Nice work — a few topics left to polish.' },
    'quiz.result.ok':        { pl: 'Solidna baza, ale warto powtórzyć słabsze sekcje.', en: 'Solid base, but worth revisiting weaker sections.' },
    'quiz.result.bad':       { pl: 'Powtórz materiał i wróć za chwilę.', en: 'Review the material and come back in a moment.' },

    /* ── Definitions page ──────────────────────────────── */
    'defs.title':        { pl: 'Definicje — Angular Senior', en: 'Definitions — Angular Senior' },
    'defs.subtitle':     { pl: 'Kluczowe pojęcia do rozmowy o pracę senior frontend (Angular 21).',
                           en: 'Core concepts for a senior frontend interview (Angular 21).' },
    'defs.search':       { pl: 'Szukaj w definicjach, bulletach, słowach kluczowych…',
                           en: 'Search definitions, bullets, keywords…' },
    'defs.all':          { pl: 'Wszystkie', en: 'All' },
    'defs.stats.total':  { pl: 'definicji', en: 'definitions' },
    'defs.stats.cats':   { pl: 'kategorii',  en: 'categories' },
    'defs.stats.updated':{ pl: 'ostatnia aktualizacja', en: 'last update' },
    'defs.keyConcepts':  { pl: 'Kluczowe koncepty', en: 'Key concepts' },
    'defs.example':      { pl: 'Przykład', en: 'Example' },
    'defs.keywords':     { pl: 'Słowa kluczowe', en: 'Keywords' },
    'defs.empty':        { pl: 'Brak wyników. Spróbuj innego zapytania lub kategorii.',
                           en: 'No results. Try another query or category.' },
    'defs.expandAll':    { pl: 'Rozwiń wszystkie',  en: 'Expand all' },
    'defs.collapseAll':  { pl: 'Zwiń wszystkie',    en: 'Collapse all' },

    /* ── Category labels (wspólne dla quiz + definitions) ── */
    'cat.architecture':  { pl: 'Architektura',     en: 'Architecture' },
    'cat.angular':       { pl: 'Angular',          en: 'Angular' },
    'cat.rxjs':          { pl: 'RxJS',             en: 'RxJS' },
    'cat.forms':         { pl: 'Formularze',       en: 'Forms' },
    'cat.performance':   { pl: 'Wydajność',        en: 'Performance' },
    'cat.css':           { pl: 'HTML / CSS',       en: 'HTML / CSS' },
    'cat.pwa':           { pl: 'PWA',              en: 'PWA' },
    'cat.testing':       { pl: 'Testy',            en: 'Testing' },
    'cat.devops':        { pl: 'DevOps',           en: 'DevOps' },
    'cat.behavioral':    { pl: 'Behawioralne',     en: 'Behavioral' },
    'cat.system-design': { pl: 'System design',    en: 'System design' },
    'cat.typescript':    { pl: 'TypeScript',       en: 'TypeScript' },
    'cat.camunda':       { pl: 'Camunda / BPM',    en: 'Camunda / BPM' },
    'cat.domain':        { pl: 'Domena (KYC/AML)', en: 'Domain (KYC/AML)' },
    'cat.ai-tools':      { pl: 'AI tools',          en: 'AI tools' },
    'cat.cloud':         { pl: 'Cloud (AWS)',       en: 'Cloud (AWS)' },

    /* ── Mock interview ────────────────────────────────── */
    'mock.title':        { pl: 'Mock interview — Angular Senior', en: 'Mock interview — Angular Senior' },
    'mock.subtitle':     { pl: '10 pytań w trybie rozmowy: odmierzony czas, wzorcowa odpowiedź, samoocena.',
                           en: '10 questions, interview style: timed answer, model answer, self-rating.' },
    'mock.start':        { pl: 'Rozpocznij mock interview', en: 'Start mock interview' },
    'mock.intro':        { pl: 'Na każde pytanie masz odmierzony czas (2–5 min). Odpowiadasz słownie lub pisemnie w polu poniżej, potem sprawdzasz wzorcową odpowiedź i oceniasz samą siebie.',
                           en: 'Each question has a fixed time (2–5 min). Answer out loud or in the field below, then reveal the model answer and self-rate.' },
    'mock.time':         { pl: 'Pozostały czas', en: 'Time left' },
    'mock.difficulty':   { pl: 'Trudność',       en: 'Difficulty' },
    'mock.answer.label': { pl: 'Twoja odpowiedź (opcjonalne — pomaga zebrać myśli)',
                           en: 'Your answer (optional — helps organise thoughts)' },
    'mock.answer.ph':    { pl: 'Napisz kluczowe punkty, które chcesz poruszyć…',
                           en: 'Write the key points you want to cover…' },
    'mock.reveal':       { pl: 'Pokaż wzorcową odpowiedź', en: 'Reveal model answer' },
    'mock.model':        { pl: 'Wzorcowa odpowiedź',       en: 'Model answer' },
    'mock.keyPoints':    { pl: 'Kluczowe punkty (o czym powinnaś wspomnieć)',
                           en: 'Key points (what you should cover)' },
    'mock.rate':         { pl: 'Samoocena',                en: 'Self-rating' },
    'mock.rate.good':    { pl: 'Wiem to',                  en: 'Got it' },
    'mock.rate.ok':      { pl: 'Prawie',                   en: 'Almost' },
    'mock.rate.bad':     { pl: 'Do powtórki',              en: 'Needs review' },
    'mock.next':         { pl: 'Następne pytanie',         en: 'Next question' },
    'mock.finish':       { pl: 'Zobacz wynik',             en: 'See result' },
    'mock.timeUp':       { pl: 'Czas minął — zerknij na wzorzec.',
                           en: 'Time is up — check the model answer.' },
    'mock.result.title': { pl: 'Wynik mock interview',     en: 'Mock interview result' },
    'mock.result.avg':   { pl: 'Średnia ocena',            en: 'Average score' },
    'mock.result.weak':  { pl: 'Tematy do powtórki',       en: 'Topics to review' },
    'mock.result.none':  { pl: 'Świetnie — wszystkie pytania oceniłaś na „Wiem to" 💪',
                           en: 'Great — you rated all questions as "Got it" 💪' },
    'mock.restart':      { pl: 'Jeszcze raz',              en: 'Try again' },
  };

  const I18N = {
    current: DEFAULT_LANG,
    listeners: new Set(),

    init() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) this.current = stored;
      document.documentElement.lang = this.current;
    },

    set(lang) {
      if (!SUPPORTED.includes(lang) || lang === this.current) return;
      this.current = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      this.apply();
      this.listeners.forEach(cb => cb(lang));
    },

    onChange(cb) {
      this.listeners.add(cb);
      return () => this.listeners.delete(cb);
    },

    t(key, fallback = key) {
      const entry = DICT[key];
      if (!entry) return fallback;
      return entry[this.current] || entry[DEFAULT_LANG] || fallback;
    },

    /** Wyciąga dwujęzyczny obiekt `{ pl, en }` -> string w bieżącym języku. */
    pick(obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      return obj[this.current] || obj[DEFAULT_LANG] || '';
    },

    /** Aktualizuje wszystkie elementy z atrybutem data-i18n (oraz data-i18n-placeholder / data-i18n-aria-label). */
    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = this.t(key, el.textContent);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', this.t(key, el.getAttribute('placeholder') || ''));
      });
      document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria-label');
        el.setAttribute('aria-label', this.t(key, el.getAttribute('aria-label') || ''));
      });
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.current);
      });
    },

    /** Podpina handlery kliknięć na przyciski języka. */
    bindToggle() {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => this.set(btn.dataset.lang));
      });
    },
  };

  window.I18N = I18N;
})();
