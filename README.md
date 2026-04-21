# fe-knowledge-update

A bilingual (Polish / English) interview-prep toolkit for Senior Frontend (Angular 21) roles. No frameworks, no build step — just static HTML, one CSS file, and vanilla JavaScript.

**Live demo:** <https://paulabarszcz.github.io/fe-knowledge-update/>

## What's inside

Four pages share the same header, language toggle (PL ↔ EN), and design system:

| Page | Purpose | Size |
|---|---|---|
| [`index.html`](./index.html) | Landing hub with three cards linking to the other pages. | — |
| [`definitions.html`](./definitions.html) | Searchable, filterable flashcards with expand/collapse and category pills. | **76 flashcards** |
| [`quiz.html`](./quiz.html) | Single- and multi-choice quiz. Pick length (10 / 20 / all), get a score, review mistakes. | **50 questions** |
| [`mock.html`](./mock.html) | Open-ended, timed (3–5 min) interview questions. Reveals a model answer + key points and asks for a self-rating, then surfaces topics to review. | **13 questions** |

A long-form study guide lives in [`docs/interview-prep.md`](./docs/interview-prep.md): 19 chapters covering Angular 21 internals, RxJS, TypeScript, CSS, testing, system design, behavioural (STAR), live-coding drills, an old-vs-new Angular migration plan, and a chapter focused on banking / Camunda / KYC-AML / GitHub Copilot.

## Categories

Content is tagged across 16 categories:

`angular` · `architecture` · `rxjs` · `forms` · `performance` · `css` · `pwa` · `testing` · `devops` · `typescript` · `behavioral` · `system-design` · `camunda` · `domain` (KYC/AML) · `ai-tools` (GitHub Copilot) · `cloud` (AWS)

Each category has its own colour token (`--cat-*`) defined in `css/style.css`.

## Running locally

Any static file server works. Examples:

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .
```

Then open <http://localhost:8080>.

## Project structure

```
.
├── index.html              # Landing hub
├── definitions.html        # Flashcards page
├── quiz.html               # Quiz page
├── mock.html               # Mock interview page
├── css/
│   ├── style.css           # Design system + component styles
│   └── logo-capybara.svg   # Logo mark
├── js/
│   ├── i18n.js             # PL/EN dictionary + data-i18n applier
│   ├── definitions.js      # Flashcards render / search / filter
│   ├── definitions-data.js # Flashcard content
│   ├── quiz.js             # Quiz flow
│   ├── quiz-data.js        # Quiz content
│   ├── mock.js             # Mock interview flow (timer, reveal, rating)
│   └── mock-data.js        # Mock content
└── docs/
    └── interview-prep.md   # 19-chapter study guide
```

## Tech and conventions

- **Zero build system.** Plain `.html` + `.css` + `.js`, served as-is.
- **Design system in CSS custom properties.** All colours, spacings, and category accents are defined as variables in `:root` (see `css/style.css`).
- **i18n.** Every visible string ships as `{ pl, en }`. UI labels use `data-i18n="key"`; longer bilingual fields (questions, model answers, bullets) live inside the data files as `{ pl, en }` objects and are picked via `I18N.pick(obj)`. The toggle persists in `localStorage`.
- **Data as modules.** `quiz-data.js`, `definitions-data.js`, and `mock-data.js` each export on `window.*_DATA` from an IIFE — no bundler needed.
- **Immutability.** State objects are never mutated in place; updates clone.

## Adding content

- **Flashcard** — append an object to the array in `js/definitions-data.js`. Shape: `{ id, cat, name: {pl,en}, tags: [], definition: {pl,en}, bullets: [{pl,en}], example?: {pl,en}, keywords: [] }`.
- **Quiz question** — append to `js/quiz-data.js`. Shape: `{ id, cat, type: 'single'|'multi', q: {pl,en}, a: [{pl,en,ok}], exp: {pl,en}, topic: {pl,en} }`.
- **Mock question** — append to `js/mock-data.js`. Shape: `{ id, cat, difficulty, timeSec, topic: {pl,en}, q: {pl,en}, model: {pl,en}, keyPoints: [{pl,en}] }`.

Adding a brand-new category means: pick a hex colour, add a `--cat-<name>` variable in `css/style.css`, register `cat.<name>` in `js/i18n.js`, and include the slug in `CAT_ORDER` / `CAT_KEY` in `js/definitions.js` and `js/quiz.js` (`categoryColor`).

## Deployment

The live site is published via GitHub Pages from the `main` branch, root directory. Any push to `main` triggers a rebuild — usually live within a minute.

## License

See [`LICENSE`](./LICENSE).
