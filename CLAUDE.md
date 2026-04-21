# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular interview preparation app for Paula at PZU. A bilingual (PL/EN) static web app with two views:
- **Definitions page** — expandable topic cards organized by category with search and filtering
- **Quiz page** — multiple-choice questions (single and multi-select) with scoring and results

No build system. Pure HTML, CSS, and vanilla JavaScript.

## Development

Serve locally with any static file server:
```bash
python3 -m http.server 8080
# or
npx serve .
```

No linting, testing, or build steps are configured.

## Architecture

Single-page or multi-page static site — HTML files at the root, with assets in:
- `css/style.css` — complete design system using CSS custom properties
- `js/` — vanilla JavaScript (no framework)

## Design System

All visual tokens are CSS custom properties defined in `:root` in `css/style.css`:
- Backgrounds: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Accent/status: `--accent`, `--success`, `--error`, `--warning`, `--purple`
- Category colors: `--cat-architecture`, `--cat-angular`, `--cat-rxjs`, `--cat-forms`, `--cat-performance`, `--cat-css`, `--cat-pwa`, `--cat-testing`, `--cat-devops`

## UI Components (CSS classes)

Key patterns already styled in `css/style.css`:
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
