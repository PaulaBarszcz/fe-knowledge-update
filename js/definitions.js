/* ==========================================================
   definitions.js — renderuje listę fiszek z DEFINITIONS_DATA
   - grupowanie po kategoriach
   - search (name / definition / bullets / keywords / tags)
   - filtr kategorii (single-select, "All" = reset)
   - expand/collapse kart, rozwiń / zwiń wszystkie
   - reaguje na zmianę języka (re-render)
   ========================================================== */
(function () {
  'use strict';

  if (!window.I18N || !window.DEFINITIONS_DATA) {
    console.error('definitions.js: missing I18N or DEFINITIONS_DATA');
    return;
  }

  /* ── Kolejność kategorii w UI ─────────────────────────── */
  const CAT_ORDER = [
    'angular', 'architecture', 'rxjs', 'forms',
    'performance', 'css', 'pwa', 'testing', 'devops',
    'camunda', 'domain', 'ai-tools', 'cloud',
  ];

  const CAT_KEY = {
    angular:      'cat.angular',
    architecture: 'cat.architecture',
    rxjs:         'cat.rxjs',
    forms:        'cat.forms',
    performance:  'cat.performance',
    css:          'cat.css',
    pwa:          'cat.pwa',
    testing:      'cat.testing',
    devops:       'cat.devops',
    camunda:      'cat.camunda',
    domain:       'cat.domain',
    'ai-tools':   'cat.ai-tools',
    cloud:        'cat.cloud',
  };

  const categoryColor = (cat) => `var(--cat-${cat})`;
  const categoryLabel = (cat) => I18N.t(CAT_KEY[cat] || '', cat);

  /* ── Utils ─────────────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Niepełne escape — pozwala na `<code>` i `<br>` w tekście definicji. */
  function richText(str) {
    if (!str) return '';
    return escapeHtml(str)
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  /* ── State ─────────────────────────────────────────────── */
  const state = {
    query: '',
    cat: 'all',
    openIds: new Set(),
  };

  /* ── DOM refs ──────────────────────────────────────────── */
  const els = {
    statTotal:    document.getElementById('stat-total'),
    statCats:     document.getElementById('stat-cats'),
    search:       document.getElementById('search-input'),
    catFilters:   document.getElementById('cat-filters'),
    sections:     document.getElementById('sections-container'),
    empty:        document.getElementById('empty-state'),
    expandAll:    document.getElementById('expand-all-btn'),
    collapseAll:  document.getElementById('collapse-all-btn'),
  };

  /* ── Render: filtry kategorii ──────────────────────────── */
  function renderCatFilters() {
    const cats = CAT_ORDER.filter(c => DEFINITIONS_DATA.some(d => d.cat === c));
    const all = `<button class="cat-btn ${state.cat === 'all' ? 'active' : ''}" data-cat="all" type="button">${escapeHtml(I18N.t('defs.all'))}</button>`;
    const pills = cats.map(c => `
      <button class="cat-btn ${state.cat === c ? 'active' : ''}"
              data-cat="${escapeHtml(c)}"
              type="button"
              style="--cat-color: ${categoryColor(c)}">
        ${escapeHtml(categoryLabel(c))}
      </button>
    `).join('');
    els.catFilters.innerHTML = all + pills;

    els.catFilters.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.cat;
        renderCatFilters();
        renderSections();
      });
    });
  }

  /* ── Render: karty ─────────────────────────────────────── */
  function matchesQuery(def, q) {
    if (!q) return true;
    const hay = [
      I18N.pick(def.name),
      I18N.pick(def.definition),
      (def.bullets || []).map(b => I18N.pick(b)).join(' '),
      (def.keywords || []).join(' '),
      (def.tags || []).join(' '),
      I18N.pick(def.example),
    ].join(' ').toLowerCase();
    return hay.includes(q);
  }

  function filteredData() {
    const q = state.query.trim().toLowerCase();
    return DEFINITIONS_DATA.filter(d =>
      (state.cat === 'all' || d.cat === state.cat) && matchesQuery(d, q)
    );
  }

  function renderCard(def, number) {
    const isOpen = state.openIds.has(def.id);
    const tagsHtml = (def.tags || []).map(t => `<span class="topic-tag">${escapeHtml(t)}</span>`).join('');
    const bulletsHtml = (def.bullets || [])
      .map(b => `<li>${richText(I18N.pick(b))}</li>`)
      .join('');
    const exampleText = I18N.pick(def.example);
    const keywordsHtml = (def.keywords || [])
      .map(k => `<span class="keyword">${escapeHtml(k)}</span>`)
      .join('');

    const exampleBlock = exampleText ? `
      <div class="topic-section-label">${escapeHtml(I18N.t('defs.example'))}</div>
      <div class="topic-example">${richText(exampleText)}</div>
    ` : '';

    const keywordsBlock = keywordsHtml ? `
      <div class="topic-section-label">${escapeHtml(I18N.t('defs.keywords'))}</div>
      <div class="topic-keywords">${keywordsHtml}</div>
    ` : '';

    const bulletsBlock = bulletsHtml ? `
      <div class="topic-section-label">${escapeHtml(I18N.t('defs.keyConcepts'))}</div>
      <ul class="topic-bullets">${bulletsHtml}</ul>
    ` : '';

    return `
      <article class="topic-card ${isOpen ? 'open' : ''}" data-id="${escapeHtml(def.id)}">
        <header class="topic-header" role="button" tabindex="0"
                aria-expanded="${isOpen ? 'true' : 'false'}">
          <span class="topic-number" style="color: ${categoryColor(def.cat)};">${number}</span>
          <span class="topic-name">${escapeHtml(I18N.pick(def.name))}</span>
          <span class="topic-tags">${tagsHtml}</span>
          <svg class="topic-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </header>
        <div class="topic-body">
          <p class="topic-definition">${richText(I18N.pick(def.definition))}</p>
          ${bulletsBlock}
          ${exampleBlock}
          ${keywordsBlock}
        </div>
      </article>
    `;
  }

  function renderSections() {
    const data = filteredData();
    els.statTotal.textContent = String(DEFINITIONS_DATA.length);
    els.statCats.textContent = String(new Set(DEFINITIONS_DATA.map(d => d.cat)).size);

    if (data.length === 0) {
      els.sections.innerHTML = '';
      els.empty.classList.remove('hidden');
      return;
    }
    els.empty.classList.add('hidden');

    const grouped = new Map();
    CAT_ORDER.forEach(c => grouped.set(c, []));
    data.forEach(d => {
      if (!grouped.has(d.cat)) grouped.set(d.cat, []);
      grouped.get(d.cat).push(d);
    });

    let globalIdx = 0;
    const html = [...grouped.entries()]
      .filter(([, items]) => items.length > 0)
      .map(([cat, items]) => {
        const cards = items.map(d => renderCard(d, ++globalIdx)).join('');
        return `
          <section class="category-section" data-cat="${escapeHtml(cat)}">
            <div class="category-header">
              <span class="category-dot" style="background: ${categoryColor(cat)};"></span>
              <span class="category-title">${escapeHtml(categoryLabel(cat))}</span>
              <span class="category-count">${items.length}</span>
            </div>
            ${cards}
          </section>
        `;
      }).join('');

    els.sections.innerHTML = html;
    bindCardToggles();
  }

  /* ── Interakcje karty ──────────────────────────────────── */
  function bindCardToggles() {
    els.sections.querySelectorAll('.topic-card').forEach(card => {
      const header = card.querySelector('.topic-header');
      const id = card.dataset.id;
      const toggle = () => {
        if (state.openIds.has(id)) {
          state.openIds.delete(id);
          card.classList.remove('open');
          header.setAttribute('aria-expanded', 'false');
        } else {
          state.openIds.add(id);
          card.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
        }
      };
      header.addEventListener('click', toggle);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ── Expand / Collapse all ─────────────────────────────── */
  function expandAll() {
    filteredData().forEach(d => state.openIds.add(d.id));
    renderSections();
  }

  function collapseAll() {
    state.openIds.clear();
    renderSections();
  }

  /* ── Bootstrap ─────────────────────────────────────────── */
  function init() {
    I18N.init();
    I18N.apply();
    I18N.bindToggle();

    els.search.addEventListener('input', (e) => {
      state.query = e.target.value;
      renderSections();
    });

    els.expandAll.addEventListener('click', expandAll);
    els.collapseAll.addEventListener('click', collapseAll);

    I18N.onChange(() => {
      renderCatFilters();
      renderSections();
    });

    renderCatFilters();
    renderSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
