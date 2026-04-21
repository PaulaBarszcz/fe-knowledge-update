# AGENTS.md

Instructions for AI coding agents working in this repository. Follows the [agents.md](https://agents.md) convention.

## Project Overview

Angular interview preparation app for Paula at PZU. A bilingual (PL/EN) static web app with two views:
- **Definitions page** — expandable topic cards organized by category with search and filtering
- **Quiz page** — multiple-choice questions (single and multi-select) with scoring and results

No build system. Pure HTML, CSS, and vanilla JavaScript.

## Project Structure

```
.
├── *.html          # pages served at the root
├── css/style.css   # complete design system (CSS custom properties)
└── js/             # vanilla JavaScript (no framework)
```

## Setup & Dev Server

No install step. Serve locally with any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

## Build, Lint, Test

None configured. There is no build pipeline, linter, or test runner. Do not add one without explicit user request.

## Code Style

- Vanilla JavaScript only — do not introduce frameworks, bundlers, or transpilers.
- Keep files small and focused; extract utilities rather than growing a single file.
- Prefer CSS custom properties (defined in `:root` in `css/style.css`) over hardcoded values.
- Mobile-first CSS; target modern browsers.

## Design System

All visual tokens are CSS custom properties defined in `:root` in `css/style.css`:
- Backgrounds: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Accent/status: `--accent`, `--success`, `--error`, `--warning`, `--purple`
- Category colors: `--cat-architecture`, `--cat-angular`, `--cat-rxjs`, `--cat-forms`, `--cat-performance`, `--cat-css`, `--cat-pwa`, `--cat-testing`, `--cat-devops`

## UI Components (CSS classes)

Styled in `css/style.css`:
- `.topic-card` / `.topic-header` / `.topic-body` — collapsible cards; add `.open` class via JS to expand
- `.answer-btn` — quiz answer buttons; state classes: `.selected`, `.correct`, `.wrong`, `.missed`; add `.multi` for checkbox-style
- `.cat-btn` — category filter pills; toggle `.active` class
- `.lang-btn` — language toggle buttons; toggle `.active` class
- `.btn-primary`, `.btn-secondary`, `.btn-success` — action buttons
- `.explanation-box` — hidden by default, add `.show` to reveal after answer check
- `.next-btn` / `.check-btn` — quiz navigation; `.next-btn` hidden by default, add `.show`

## Responsive Breakpoints

- Mobile-first; special adjustments at `max-width: 390px` (iPhone 13 mini)
- Quiz answers switch from column to 2-column grid at `min-width: 768px`

## Internationalization

The app is bilingual (Polish / English). Any user-facing string added must be provided in both languages and wired through the existing language-toggle mechanism.

## Conventions for Agents

- Prefer editing existing files over creating new ones.
- Do not add dependencies, build tools, or config files without explicit user approval.
- Do not introduce a framework (React, Vue, Angular, etc.) — this is intentionally vanilla.
- Keep commits focused; follow conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
