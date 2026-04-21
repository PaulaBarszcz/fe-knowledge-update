/* ==========================================================
   DEFINITIONS_DATA — fiszki/definicje wygenerowane z
   docs/interview-prep.md. Każda fiszka:
     id         — unikalny
     cat        — kategoria (musi istnieć w --cat-*)
     name       — { pl, en } tytuł tematu
     tags       — krótkie etykiety pomocnicze (bez i18n, po angielsku)
     definition — { pl, en } główny akapit
     bullets    — [{ pl, en }, ...] kluczowe punkty
     example    — opcjonalny { pl, en } — wyróżniony box
     keywords   — ['string'] pigułki na dole karty (bez i18n)
   ========================================================== */
(function () {
  'use strict';

  const D = [
    /* ── ANGULAR ─────────────────────────────────────────── */
    {
      id: 'ng-standalone',
      cat: 'angular',
      name: { pl: 'Standalone components', en: 'Standalone components' },
      tags: ['core'],
      definition: {
        pl: 'Od Angulara 19 komponenty są domyślnie standalone — nie potrzebują NgModule. Importujemy wprost inne komponenty, dyrektywy i pipes w polu `imports`. Bootstrap aplikacji odbywa się przez `bootstrapApplication(AppComponent, { providers: [...] })`.',
        en: 'Since Angular 19 components are standalone by default — no NgModule needed. You import other components, directives and pipes directly in `imports`. App bootstraps via `bootstrapApplication(AppComponent, { providers: [...] })`.',
      },
      bullets: [
        { pl: 'Mniejszy boilerplate, lepsze tree-shaking.', en: 'Less boilerplate, better tree-shaking.' },
        { pl: 'Prostszy lazy loading: `loadComponent: () => import(...)`.', en: 'Simpler lazy loading: `loadComponent: () => import(...)`.' },
        { pl: 'Testy — nie trzeba deklarować modułów testowych.', en: 'Tests — no more test modules to declare.' },
        { pl: 'NgModule dalej działa (kompatybilność wsteczna).', en: 'NgModule still works (backwards compatible).' },
      ],
      example: {
        pl: '`bootstrapApplication(App, { providers: [provideRouter(routes), provideHttpClient()] })`',
        en: '`bootstrapApplication(App, { providers: [provideRouter(routes), provideHttpClient()] })`',
      },
      keywords: ['standalone: true', 'bootstrapApplication', 'provideRouter', 'provideHttpClient'],
    },
    {
      id: 'ng-signals',
      cat: 'angular',
      name: { pl: 'Signals', en: 'Signals' },
      tags: ['reactivity', 'core'],
      definition: {
        pl: 'Signal to reaktywny, synchroniczny kontener wartości z automatycznym śledzeniem zależności. Odczyt następuje przez wywołanie funkcji (`count()`), zapis przez `.set()` lub `.update()`. Zastąpił w dużej mierze RxJS w warstwie stanu komponentu.',
        en: 'A signal is a reactive, synchronous value container with automatic dependency tracking. Read via function call (`count()`), write via `.set()` or `.update()`. It largely replaced RxJS for component state.',
      },
      bullets: [
        { pl: '`signal<T>(initial)` — writable signal.', en: '`signal<T>(initial)` — writable signal.' },
        { pl: '`computed(() => ...)` — leniwa, memoizowana pochodna.', en: '`computed(() => ...)` — lazy, memoized derivation.' },
        { pl: '`effect(() => ...)` — side-effect reagujący na sygnały.', en: '`effect(() => ...)` — side-effect reacting to signals.' },
        { pl: '`linkedSignal(...)` — writable, ale re-sync do źródła.', en: '`linkedSignal(...)` — writable but resyncs to a source.' },
        { pl: 'Interop: `toSignal(obs$)`, `toObservable(sig)`.', en: 'Interop: `toSignal(obs$)`, `toObservable(sig)`.' },
      ],
      example: {
        pl: 'items = signal<Item[]>([]); total = computed(() => items().reduce((s, i) => s + i.price, 0));',
        en: 'items = signal<Item[]>([]); total = computed(() => items().reduce((s, i) => s + i.price, 0));',
      },
      keywords: ['signal()', 'computed()', 'effect()', 'linkedSignal()', 'toSignal()', 'toObservable()'],
    },
    {
      id: 'ng-computed-vs-effect',
      cat: 'angular',
      name: { pl: 'computed() vs effect()', en: 'computed() vs effect()' },
      tags: ['reactivity'],
      definition: {
        pl: '`computed` to **derywacja wartości** — zwraca nowy signal, jest pure, memoizowany i leniwy. `effect` to **reakcja na zmianę** — uruchamia side-effects (DOM, logi, storage). Pomylenie to klasyk: jeśli chcesz nowej wartości — `computed`; jeśli chcesz "coś zrobić" — `effect`.',
        en: '`computed` is **value derivation** — returns a new signal, pure, memoized, lazy. `effect` is **reacting to change** — runs side-effects (DOM, logs, storage). Classic mistake: if you want a new value use `computed`; if you want "to do something", use `effect`.',
      },
      bullets: [
        { pl: 'Signal ustawiany w `effect` bez `untracked()` grozi pętlą.', en: 'Setting a signal inside `effect` without `untracked()` may loop.' },
        { pl: '`effect` ma `onCleanup(cb)` — pozwala zwolnić zasoby.', en: '`effect` has `onCleanup(cb)` — lets you release resources.' },
        { pl: '`computed` jest wyceniany leniwie — nie poleci jeśli nikt go nie czyta.', en: '`computed` is lazy — does not run until someone reads it.' },
      ],
      example: {
        pl: 'fullName = computed(() => `${first()} ${last()}`);  // pure\neffect(() => localStorage.setItem("name", fullName()));  // side-effect',
        en: 'fullName = computed(() => `${first()} ${last()}`);  // pure\neffect(() => localStorage.setItem("name", fullName()));  // side-effect',
      },
      keywords: ['computed', 'effect', 'untracked', 'onCleanup', 'memoization'],
    },
    {
      id: 'ng-zoneless',
      cat: 'angular',
      name: { pl: 'Zoneless change detection', en: 'Zoneless change detection' },
      tags: ['performance', 'Ang21'],
      definition: {
        pl: 'Angular historycznie opierał change detection na zone.js, który monkey-patchuje asynchroniczne API (setTimeout, XHR, addEventListener). W Zoneless (stable od v20/21) zone.js znika — CD wyzwalają sygnały, async pipe i jawne API. Skutek: mniejszy bundle, czytelniejsze stack trace, brak niespodziewanych CD po stronach trzecich.',
        en: 'Historically Angular CD was driven by zone.js, which monkey-patches async APIs (setTimeout, XHR, addEventListener). Zoneless (stable in v20/21) removes zone.js — CD is driven by signals, async pipe and explicit APIs. Result: smaller bundle, cleaner stack traces, no surprise CD from 3rd parties.',
      },
      bullets: [
        { pl: 'Włączenie: `provideZonelessChangeDetection()`.', en: 'Enable with `provideZonelessChangeDetection()`.' },
        { pl: 'Mutacja bez `signal.update` nie odpala re-renderu — wymusza immutability.', en: 'Mutation without `signal.update` skips re-render — enforces immutability.' },
        { pl: 'Trzecie strony liczące na zone.js mogą wymagać refaktoryzacji.', en: '3rd parties that relied on zone.js may need refactoring.' },
      ],
      keywords: ['provideZonelessChangeDetection', 'zone.js', 'markForCheck', 'immutability'],
    },
    {
      id: 'ng-onpush',
      cat: 'angular',
      name: { pl: 'OnPush change detection', en: 'OnPush change detection' },
      tags: ['performance'],
      definition: {
        pl: '`ChangeDetectionStrategy.OnPush` sprawdza komponent tylko, gdy zmieni się referencja `@Input`, w szablonie wystąpi event, async pipe wyemituje wartość lub sygnał czytany w template się zaktualizuje. Domyślna strategia (Default) sprawdza komponent przy każdym triggerze CD w drzewie — drogo.',
        en: '`ChangeDetectionStrategy.OnPush` only checks the component on: `@Input` reference change, a template event, async pipe emission or a signal read in the template being updated. The default strategy checks on every CD trigger in the tree — expensive.',
      },
      bullets: [
        { pl: 'Mutacja tablicy/obiektu bez zmiany referencji — brak re-renderu.', en: 'Mutating an array/object without changing the reference — no re-render.' },
        { pl: '`ChangeDetectorRef`: `markForCheck`, `detectChanges`, `detach`, `reattach`.', en: '`ChangeDetectorRef`: `markForCheck`, `detectChanges`, `detach`, `reattach`.' },
        { pl: '`detach` — ręczne sterowanie CD dla ciężkich widgetów (canvas, wykresy).', en: '`detach` — manual CD control for heavy widgets (canvas, charts).' },
      ],
      keywords: ['ChangeDetectionStrategy.OnPush', 'markForCheck', 'detectChanges', 'detach', 'immutability'],
    },
    {
      id: 'ng-control-flow',
      cat: 'angular',
      name: { pl: 'Wbudowany control flow (@if, @for, @switch, @defer, @let)', en: 'Built-in control flow (@if, @for, @switch, @defer, @let)' },
      tags: ['Ang17+', 'core'],
      definition: {
        pl: 'Od Angulara 17 mamy wbudowane dyrektywy blokowe zastępujące `*ngIf`, `*ngFor`, `*ngSwitch`. Są czytelniejsze, lepiej typowane i w `@for` wymagają `track` (performance by default). Dochodzą `@defer` (lazy fragment UI) i `@let` (lokalna zmienna w template).',
        en: 'Since Angular 17 we have built-in block control flow replacing `*ngIf`, `*ngFor`, `*ngSwitch`. More readable, better typed, and `@for` requires `track` (performance by default). Plus `@defer` (lazy UI fragment) and `@let` (local template variable).',
      },
      bullets: [
        { pl: '`@for (item of items(); track item.id)` — `track` obowiązkowy.', en: '`@for (item of items(); track item.id)` — `track` required.' },
        { pl: '`@if (user(); as u) { ... }` — local aliasing.', en: '`@if (user(); as u) { ... }` — local aliasing.' },
        { pl: '`@defer (on viewport; prefetch on idle)` — deferrable views.', en: '`@defer (on viewport; prefetch on idle)` — deferrable views.' },
        { pl: '`@let total = price() * qty();` — zmienna w template.', en: '`@let total = price() * qty();` — template variable.' },
      ],
      example: {
        pl: '@if (user(); as u) { Witaj {{ u.name }} } @else { Zaloguj się }',
        en: '@if (user(); as u) { Hi {{ u.name }} } @else { Please log in }',
      },
      keywords: ['@if', '@for', '@switch', '@defer', '@let', 'track'],
    },
    {
      id: 'ng-defer',
      cat: 'angular',
      name: { pl: 'Deferrable views (@defer)', en: 'Deferrable views (@defer)' },
      tags: ['performance'],
      definition: {
        pl: '`@defer` pozwala lazy-loadować fragment komponentu z jednym z triggerów: `on idle`, `on viewport`, `on hover`, `on interaction`, `on timer`, `on immediate`, lub warunkowo `when <expr>`. W przeciwieństwie do `loadComponent` nie wymaga dedykowanego route — renderuje fragment UI "gdy trzeba".',
        en: '`@defer` lazy-loads a component fragment with one of: `on idle`, `on viewport`, `on hover`, `on interaction`, `on timer`, `on immediate`, or conditionally `when <expr>`. Unlike `loadComponent` it does not need a dedicated route — it renders a UI fragment "when needed".',
      },
      bullets: [
        { pl: '`@placeholder`, `@loading (minimum 300ms)`, `@error` dla stanów.', en: '`@placeholder`, `@loading (minimum 300ms)`, `@error` for states.' },
        { pl: '`prefetch on idle` — załaduj w tle, pokaż później.', en: '`prefetch on idle` — load in background, render later.' },
        { pl: 'Skalowalny dla sekcji below-the-fold, tooltipów, modali.', en: 'Scalable for below-the-fold sections, tooltips, modals.' },
      ],
      keywords: ['@defer', 'on viewport', 'on idle', 'prefetch', '@placeholder', '@loading'],
    },
    {
      id: 'ng-di',
      cat: 'angular',
      name: { pl: 'Dependency Injection — inject()', en: 'Dependency Injection — inject()' },
      tags: ['core'],
      definition: {
        pl: 'Angular DI dostarcza instancje serwisów zgodnie z hierarchią providerów. `inject()` to funkcyjny wariant wstrzykiwania — działa wszędzie w "injection context" (konstruktor, field initializer, funkcjonalne guardy/interceptory/resolvery). Pozwala pisać czystszy kod bez konstruktorów.',
        en: 'Angular DI provides service instances according to the provider hierarchy. `inject()` is the functional variant — works anywhere in an "injection context" (constructor, field initializers, functional guards/interceptors/resolvers). Lets you write cleaner code without constructors.',
      },
      bullets: [
        { pl: 'Hierarchia: root → platform → environment → component.', en: 'Hierarchy: root → platform → environment → component.' },
        { pl: 'providedIn: "root" + tree-shakable providers.', en: 'providedIn: "root" + tree-shakable providers.' },
        { pl: 'Strategie: `useClass`, `useValue`, `useFactory`, `useExisting`, `multi: true`.', en: 'Strategies: `useClass`, `useValue`, `useFactory`, `useExisting`, `multi: true`.' },
        { pl: '`InjectionToken<T>` dla wartości nie-klasowych (config).', en: '`InjectionToken<T>` for non-class values (config).' },
      ],
      example: {
        pl: 'const auth = inject(AuthService);  // w funkcyjnym interceptorze lub guardzie',
        en: 'const auth = inject(AuthService);  // inside a functional interceptor or guard',
      },
      keywords: ['inject()', 'providedIn', 'InjectionToken', 'useFactory', 'multi: true'],
    },
    {
      id: 'ng-routing',
      cat: 'angular',
      name: { pl: 'Routing — funkcyjne guardy i lazy loading', en: 'Routing — functional guards and lazy loading' },
      tags: ['core'],
      definition: {
        pl: 'Router Angulara pozwala na funkcyjne guardy (`CanActivateFn`, `CanMatchFn`, `ResolveFn`, `CanDeactivateFn`) oraz lazy loading przez `loadComponent` (standalone) i `loadChildren`. `withComponentInputBinding()` przekazuje parametry URL jako `@Input`/`input()` komponentu; `withViewTransitions()` włącza View Transitions API.',
        en: 'The Angular router supports functional guards (`CanActivateFn`, `CanMatchFn`, `ResolveFn`, `CanDeactivateFn`) and lazy loading via `loadComponent` (standalone) and `loadChildren`. `withComponentInputBinding()` passes URL params as `@Input`/`input()`; `withViewTransitions()` enables the View Transitions API.',
      },
      bullets: [
        { pl: '`CanMatch` potrafi pominąć lazy load — lepiej niż `CanActivate` dla guardów opartych na roli.', en: '`CanMatch` can skip lazy loads — better than `CanActivate` for role-based guards.' },
        { pl: 'Preload strategies: `PreloadAllModules` lub własna.', en: 'Preload strategies: `PreloadAllModules` or custom.' },
        { pl: '`TitleStrategy` + `data.title` + `Meta` dla SEO.', en: '`TitleStrategy` + `data.title` + `Meta` for SEO.' },
      ],
      keywords: ['CanActivateFn', 'CanMatchFn', 'ResolveFn', 'loadComponent', 'loadChildren', 'withComponentInputBinding'],
    },
    {
      id: 'ng-http',
      cat: 'angular',
      name: { pl: 'HttpClient i funkcyjne interceptory', en: 'HttpClient and functional interceptors' },
      tags: ['core'],
      definition: {
        pl: '`HttpClient` z `provideHttpClient(withInterceptors([...]), withFetch())` to podstawa komunikacji z API. Funkcyjne interceptory (`HttpInterceptorFn`) zastępują klasowe — są kompozycyjne, łatwiejsze w testach. Kolejność w `withInterceptors([auth, log, retry, cache])` ma znaczenie.',
        en: '`HttpClient` with `provideHttpClient(withInterceptors([...]), withFetch())` is the base for API calls. Functional interceptors (`HttpInterceptorFn`) replaced class-based — composable, easier to test. Order in `withInterceptors([auth, log, retry, cache])` matters.',
      },
      bullets: [
        { pl: '`HttpContext` + `HttpContextToken` — metadane per-request (np. "skip auth").', en: '`HttpContext` + `HttpContextToken` — per-request metadata (e.g. "skip auth").' },
        { pl: '`withFetch()` — Fetch API zamiast XHR (lepsze perf, streaming).', en: '`withFetch()` — Fetch API instead of XHR (better perf, streaming).' },
        { pl: 'Interceptor 401 → refresh access tokena + retry requestu.', en: 'Interceptor 401 → refresh access token + retry request.' },
      ],
      example: {
        pl: 'export const authInt: HttpInterceptorFn = (req, next) => {\n  const tok = inject(AuthService).token();\n  return next(req.clone({ setHeaders: { Authorization: `Bearer ${tok}` } }));\n};',
        en: 'export const authInt: HttpInterceptorFn = (req, next) => {\n  const tok = inject(AuthService).token();\n  return next(req.clone({ setHeaders: { Authorization: `Bearer ${tok}` } }));\n};',
      },
      keywords: ['HttpClient', 'HttpInterceptorFn', 'withInterceptors', 'withFetch', 'HttpContext'],
    },
    {
      id: 'ng-takeuntildestroyed',
      cat: 'angular',
      name: { pl: 'takeUntilDestroyed', en: 'takeUntilDestroyed' },
      tags: ['rxjs'],
      definition: {
        pl: 'Operator RxJS od Angulara 16, który automatycznie odsubskrybuje observable przy zniszczeniu bieżącego kontekstu DI (komponentu/dyrektywy/serwisu providedIn component). Zastępuje manualny `destroy$ = new Subject(); takeUntil(this.destroy$)`.',
        en: 'An RxJS operator since Angular 16 that automatically unsubscribes when the current DI context (component/directive/component-provided service) is destroyed. Replaces manual `destroy$ = new Subject(); takeUntil(this.destroy$)`.',
      },
      bullets: [
        { pl: 'Używać w injection context (field initializer) — Angular sam znajdzie `DestroyRef`.', en: 'Use in an injection context (field initializer) — Angular finds `DestroyRef` automatically.' },
        { pl: 'Poza kontekstem: `takeUntilDestroyed(destroyRef)` z jawnym `DestroyRef`.', en: 'Outside context: `takeUntilDestroyed(destroyRef)` with an explicit `DestroyRef`.' },
        { pl: 'Alternatywy: `async` pipe (auto-unsubscribe), `toSignal()` (również auto-unsubscribe).', en: 'Alternatives: `async` pipe (auto-unsubscribe), `toSignal()` (also auto-unsubscribe).' },
      ],
      keywords: ['takeUntilDestroyed', 'DestroyRef', 'toSignal', 'async pipe'],
    },
    {
      id: 'ng-ssr-hydration',
      cat: 'angular',
      name: { pl: 'SSR i hydration', en: 'SSR and hydration' },
      tags: ['performance'],
      definition: {
        pl: 'Server-Side Rendering generuje HTML na serwerze (lepszy LCP i SEO), a przeglądarka "hydrates" go — podpina event listenery i logikę bez re-renderu. W Angularze od v17: `@angular/ssr` + `provideClientHydration()`. Od v19: incremental hydration — hydruje tylko potrzebne fragmenty.',
        en: 'Server-Side Rendering produces HTML on the server (better LCP and SEO); the browser "hydrates" it — attaches listeners and logic without re-rendering. In Angular since v17: `@angular/ssr` + `provideClientHydration()`. Since v19: incremental hydration — only hydrate the fragments needed.',
      },
      bullets: [
        { pl: 'Hydration mismatch = różny DOM serwer vs klient → pełny re-render, gorszy UX.', en: 'Hydration mismatch = different DOM server vs client → full re-render, worse UX.' },
        { pl: '`isPlatformBrowser(platformId)` — guard dla `window` / `localStorage`.', en: '`isPlatformBrowser(platformId)` — guard for `window` / `localStorage`.' },
        { pl: '`afterNextRender`/`afterRender` — kod tylko client-side po paint.', en: '`afterNextRender`/`afterRender` — client-only code after paint.' },
        { pl: 'Prerender (SSG) — statyczne HTML generowane w build.', en: 'Prerender (SSG) — static HTML generated at build time.' },
      ],
      keywords: ['@angular/ssr', 'provideClientHydration', 'incremental hydration', 'isPlatformBrowser', 'afterRender'],
    },
    {
      id: 'ng-optimization',
      cat: 'angular',
      name: { pl: 'Optymalizacja wydajności — checklist', en: 'Performance optimization — checklist' },
      tags: ['performance'],
      definition: {
        pl: 'Wydajność w Angularze to kombinacja: mały bundle (esbuild + tree-shaking + lazy loading), wydajny runtime (OnPush / Zoneless / Signals / `@defer` / `@for track`), szybki rendering (SSR + hydration) i optymalne assety (`NgOptimizedImage`, preconnect, SW cache).',
        en: 'Angular performance is a combination of: small bundle (esbuild + tree-shaking + lazy loading), efficient runtime (OnPush / Zoneless / Signals / `@defer` / `@for track`), fast rendering (SSR + hydration) and optimal assets (`NgOptimizedImage`, preconnect, SW cache).',
      },
      bullets: [
        { pl: 'Bundle analyzer: `ng build --stats-json` + `source-map-explorer`.', en: 'Bundle analyzer: `ng build --stats-json` + `source-map-explorer`.' },
        { pl: 'Ciężkie listy: `cdk-virtual-scroll-viewport`.', en: 'Heavy lists: `cdk-virtual-scroll-viewport`.' },
        { pl: '`runOutsideAngular` dla high-frequency handlerów (scroll, animacja).', en: '`runOutsideAngular` for high-frequency handlers (scroll, animation).' },
        { pl: 'Web Vitals: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.', en: 'Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.' },
      ],
      keywords: ['OnPush', 'Zoneless', '@defer', 'NgOptimizedImage', 'cdk-virtual-scroll', 'runOutsideAngular'],
    },

    /* ── FORMS ───────────────────────────────────────────── */
    {
      id: 'forms-reactive',
      cat: 'forms',
      name: { pl: 'Reactive Forms (typed)', en: 'Reactive Forms (typed)' },
      tags: ['core'],
      definition: {
        pl: 'Reaktywne formularze w Angularze to model oparty na `FormControl` / `FormGroup` / `FormArray`, w pełni typowany od v14 (`NonNullableFormBuilder`). Polecane dla dużych, testowalnych formularzy enterprise — dają pełną kontrolę, łatwą kompozycję i integrację z RxJS.',
        en: 'Reactive forms in Angular are a model built on `FormControl` / `FormGroup` / `FormArray`, fully typed since v14 (`NonNullableFormBuilder`). Recommended for large, testable enterprise forms — full control, easy composition, RxJS integration.',
      },
      bullets: [
        { pl: 'Walidatory synchroniczne (`Validators.required`) i async (`AsyncValidatorFn`).', en: 'Sync (`Validators.required`) and async (`AsyncValidatorFn`) validators.' },
        { pl: 'Cross-field: walidator na `FormGroup`.', en: 'Cross-field: validator on the `FormGroup`.' },
        { pl: '`updateOn: "blur" | "submit"` — kontrola kiedy liczyć walidację.', en: '`updateOn: "blur" | "submit"` — control when validation runs.' },
        { pl: 'Wizard: `FormGroup<{ step1, step2, ... }>` + sygnał `currentStep`.', en: 'Wizard: `FormGroup<{ step1, step2, ... }>` + `currentStep` signal.' },
      ],
      keywords: ['FormGroup', 'FormArray', 'NonNullableFormBuilder', 'AsyncValidatorFn', 'updateOn'],
    },
    {
      id: 'forms-async-validator',
      cat: 'forms',
      name: { pl: 'Async validator — wzorzec kanoniczny', en: 'Async validator — canonical pattern' },
      tags: ['rxjs'],
      definition: {
        pl: 'Wzorzec dla walidacji wymagającej wyjścia do API (np. unikalność username). Pipe: `debounceTime` → `distinctUntilChanged` → `switchMap` (anulowanie starych requestów) → `catchError(() => of(null))` (awaria API nie powinna blokować formularza).',
        en: 'Pattern for validations that hit an API (e.g. username uniqueness). Pipe: `debounceTime` → `distinctUntilChanged` → `switchMap` (cancel stale requests) → `catchError(() => of(null))` (API failure must not block the form).',
      },
      example: {
        pl: 'return control.valueChanges.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(v => api.checkUnique(v).pipe(catchError(() => of(null)))),\n  map(res => res?.taken ? { taken: true } : null),\n  take(1),\n);',
        en: 'return control.valueChanges.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(v => api.checkUnique(v).pipe(catchError(() => of(null)))),\n  map(res => res?.taken ? { taken: true } : null),\n  take(1),\n);',
      },
      bullets: [
        { pl: 'Musi zwrócić Observable, który **kończy się** — stąd `take(1)` lub `first()`.', en: 'Must return an Observable that **completes** — hence `take(1)` or `first()`.' },
        { pl: '`updateOn: "blur"` zmniejsza liczbę zapytań.', en: '`updateOn: "blur"` reduces the number of requests.' },
      ],
      keywords: ['AsyncValidatorFn', 'debounceTime', 'switchMap', 'catchError', 'take(1)'],
    },

    /* ── RXJS ────────────────────────────────────────────── */
    {
      id: 'rx-observable-vs-subject',
      cat: 'rxjs',
      name: { pl: 'Observable, Subject i rodzeństwo', en: 'Observable, Subject and siblings' },
      tags: ['core'],
      definition: {
        pl: 'Observable to "leniwy push" — nic się nie dzieje, dopóki nie zasubskrybujesz. Subject jest zarazem Observable i Observerem — multicastuje do wszystkich subskrybentów. `BehaviorSubject` trzyma ostatnią wartość i emituje ją nowym subskrybentom. `ReplaySubject(n)` bufferuje N. `AsyncSubject` emituje tylko po complete.',
        en: 'An Observable is a "lazy push" — nothing happens until you subscribe. A Subject is both an Observable and an Observer — multicasts to all subscribers. `BehaviorSubject` holds the last value and emits to new subscribers. `ReplaySubject(n)` buffers N. `AsyncSubject` emits only on complete.',
      },
      bullets: [
        { pl: 'Cold = każda subskrypcja uruchamia nową produkcję (HTTP, timer).', en: 'Cold = each subscribe starts a new production (HTTP, timer).' },
        { pl: 'Hot = produkcja niezależna od subskrybentów (events, WS, Subject).', en: 'Hot = production independent of subscribers (events, WS, Subject).' },
        { pl: 'Multicasting: `share()`, `shareReplay({ bufferSize, refCount: true })`.', en: 'Multicasting: `share()`, `shareReplay({ bufferSize, refCount: true })`.' },
      ],
      keywords: ['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject', 'cold', 'hot'],
    },
    {
      id: 'rx-flatten',
      cat: 'rxjs',
      name: { pl: 'switchMap vs mergeMap vs concatMap vs exhaustMap', en: 'switchMap vs mergeMap vs concatMap vs exhaustMap' },
      tags: ['core', 'must-know'],
      definition: {
        pl: 'Cztery higher-order operatory do "spłaszczania" obserwable zagnieżdżonych w emisji. Różnią się strategią, co zrobić gdy nowa wartość nadejdzie, a poprzednia jeszcze nie skończyła: anuluj, uruchom równolegle, kolejkuj, zignoruj.',
        en: 'Four higher-order operators for flattening nested observables. They differ in strategy when a new value arrives while the previous is still running: cancel, run in parallel, queue, ignore.',
      },
      bullets: [
        { pl: '`switchMap` — **anuluj** poprzedni, ostatni wygrywa. Autocomplete, live search, nawigacja.', en: '`switchMap` — **cancel** previous, last wins. Autocomplete, live search, navigation.' },
        { pl: '`mergeMap` — **równolegle**, wszystko leci. Równoległe zapisy niezależne.', en: '`mergeMap` — **parallel**, all fire. Independent parallel writes.' },
        { pl: '`concatMap` — **sekwencyjnie**, w kolejce. Zapisy do audit-log, pewność kolejności.', en: '`concatMap` — **sequential**, queued. Audit log writes, guaranteed order.' },
        { pl: '`exhaustMap` — **ignoruj** nowe póki trwa poprzednie. Login, form submit.', en: '`exhaustMap` — **ignore** new while running. Login, form submit.' },
      ],
      example: {
        pl: 'this.search$ = q.valueChanges.pipe(\n  debounceTime(300),\n  switchMap(v => api.search(v))\n);',
        en: 'this.search$ = q.valueChanges.pipe(\n  debounceTime(300),\n  switchMap(v => api.search(v))\n);',
      },
      keywords: ['switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'higher-order'],
    },
    {
      id: 'rx-sharereplay',
      cat: 'rxjs',
      name: { pl: 'shareReplay i refCount', en: 'shareReplay and refCount' },
      tags: ['memory'],
      definition: {
        pl: '`shareReplay` multicastuje strumień i bufferuje ostatnie N emisji dla przyszłych subskrybentów. Kluczowy przy cache\'owaniu HTTP. Bez `refCount: true` i dla źródła, które nigdy nie kończy (WebSocket, interval), masz **memory leak** — source żyje wiecznie, bo subskrybent jest trzymany.',
        en: '`shareReplay` multicasts a stream and buffers the last N emissions for future subscribers. Key for HTTP caching. Without `refCount: true` and a source that never completes (WebSocket, interval), you get a **memory leak** — the source lives forever because the subscriber is retained.',
      },
      example: {
        pl: 'this.user$ = this.http.get("/user").pipe(\n  shareReplay({ bufferSize: 1, refCount: true })\n);',
        en: 'this.user$ = this.http.get("/user").pipe(\n  shareReplay({ bufferSize: 1, refCount: true })\n);',
      },
      keywords: ['shareReplay', 'refCount', 'bufferSize', 'multicast', 'memory leak'],
    },
    {
      id: 'rx-signals-interop',
      cat: 'rxjs',
      name: { pl: 'RxJS ↔ Signals interop', en: 'RxJS ↔ Signals interop' },
      tags: ['Ang21'],
      definition: {
        pl: '`toSignal(obs$, { initialValue })` zamienia Observable w Signal z auto-unsubscribe przy destroy komponentu. `toObservable(sig)` idzie w drugą stronę — Signal w Observable. Typowy wzorzec hybrydowy: dane z HTTP/WS → Observable, lokalny stan i UI → Signals, pochodne UI → `computed`.',
        en: '`toSignal(obs$, { initialValue })` turns an Observable into a Signal with auto-unsubscribe on destroy. `toObservable(sig)` goes the other way. Typical hybrid pattern: data from HTTP/WS → Observable, local state and UI → Signals, UI derivations → `computed`.',
      },
      bullets: [
        { pl: '`toSignal` wymaga `initialValue` albo opcji `{ requireSync: true }`.', en: '`toSignal` requires `initialValue` or `{ requireSync: true }`.' },
        { pl: 'Nie wszystko przepisuj na signals — strumienie zdarzeń zostają w RxJS.', en: 'Do not rewrite everything to signals — event streams stay in RxJS.' },
      ],
      keywords: ['toSignal', 'toObservable', 'requireSync', 'initialValue'],
    },
    {
      id: 'rx-memory-leaks',
      cat: 'rxjs',
      name: { pl: 'Zapobieganie wyciekom pamięci', en: 'Preventing memory leaks' },
      tags: ['memory'],
      definition: {
        pl: 'Subskrypcja RxJS żyje, dopóki nie zostanie zakończona lub odsubskrybowana. Pozostawiona w komponencie po `ngOnDestroy` trzyma referencje, powoduje niechciane side-effects i memory leaks. Strategie: `async` pipe, `takeUntilDestroyed()`, `toSignal()`, lub klasyczny `takeUntil(destroy$)`.',
        en: 'An RxJS subscription lives until it completes or is unsubscribed. Left alive after `ngOnDestroy` it retains references, causes unwanted side-effects and memory leaks. Strategies: `async` pipe, `takeUntilDestroyed()`, `toSignal()`, or the classic `takeUntil(destroy$)`.',
      },
      bullets: [
        { pl: '`async` pipe — najprostsze, template sam odsubskrybowuje.', en: '`async` pipe — simplest, the template unsubscribes itself.' },
        { pl: 'HTTP complete samo (1 emisja + complete) — leak mniej prawdopodobny.', en: 'HTTP self-completes (1 emit + complete) — leak unlikely.' },
        { pl: 'WebSocket, interval, fromEvent — nigdy nie kończą, trzeba jawnie odsubskrybować.', en: 'WebSocket, interval, fromEvent — never complete, must be unsubscribed explicitly.' },
      ],
      keywords: ['ngOnDestroy', 'takeUntilDestroyed', 'async pipe', 'Subscription.unsubscribe'],
    },

    /* ── TYPESCRIPT / JS (architecture) ──────────────────── */
    {
      id: 'ts-unknown-any',
      cat: 'architecture',
      name: { pl: 'unknown vs any', en: 'unknown vs any' },
      tags: ['typescript'],
      definition: {
        pl: '`any` wyłącza typowanie — niebezpieczne, zamyka oczy TS. `unknown` wymaga **zawężenia typu** (type guard, `typeof`, Zod/io-ts) przed użyciem. Senior na granicy systemu (JSON, localStorage, postMessage, `try/catch`) zawsze wybiera `unknown` — TS wymusi walidację.',
        en: '`any` disables type checking — dangerous, TS "looks away". `unknown` requires **narrowing** (type guard, `typeof`, Zod/io-ts) before use. Seniors always pick `unknown` at system boundaries (JSON, localStorage, postMessage, `try/catch`) — TS forces validation.',
      },
      example: {
        pl: 'function parse(raw: string): unknown { return JSON.parse(raw); }\nconst data = parse(x);\nif (typeof data === "object" && data && "email" in data) { /* bezpiecznie */ }',
        en: 'function parse(raw: string): unknown { return JSON.parse(raw); }\nconst data = parse(x);\nif (typeof data === "object" && data && "email" in data) { /* safe */ }',
      },
      keywords: ['unknown', 'any', 'type narrowing', 'type guard', 'Zod'],
    },
    {
      id: 'ts-satisfies',
      cat: 'architecture',
      name: { pl: 'Operator satisfies', en: 'satisfies operator' },
      tags: ['typescript'],
      definition: {
        pl: 'Od TS 4.9 — sprawdza, czy wartość pasuje do typu, ale zachowuje **wąski typ literalny**. W przeciwieństwie do `as` nie jest niebezpiecznym castem, który może zamaskować błąd. Typowy use-case: obiekty config, mapy routingu.',
        en: 'Since TS 4.9 — checks that a value matches a type while keeping the **narrow literal type**. Unlike `as` it is not an unsafe cast that may hide bugs. Typical use: config objects, routing maps.',
      },
      example: {
        pl: 'const config = {\n  theme: "dark",\n  features: { chat: true },\n} satisfies AppConfig;\n// typeof config.theme === "dark"  (literał, nie string!)',
        en: 'const config = {\n  theme: "dark",\n  features: { chat: true },\n} satisfies AppConfig;\n// typeof config.theme === "dark"  (literal, not string!)',
      },
      keywords: ['satisfies', 'as const', 'literal types', 'type widening'],
    },
    {
      id: 'ts-utility-types',
      cat: 'architecture',
      name: { pl: 'Utility types', en: 'Utility types' },
      tags: ['typescript'],
      definition: {
        pl: 'Wbudowane generyki TypeScript do derywacji jednego typu z drugiego. Pozwalają trzymać jedno źródło prawdy (np. `User`) i generować pochodne typy (`Partial<User>`, `Pick<User, "id" | "email">`, `ReturnType<typeof getUser>`).',
        en: 'Built-in TypeScript generics for deriving one type from another. Let you keep a single source of truth (e.g. `User`) and generate derivatives (`Partial<User>`, `Pick<User, "id" | "email">`, `ReturnType<typeof getUser>`).',
      },
      bullets: [
        { pl: 'Obiektowe: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`.', en: 'Object: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`.' },
        { pl: 'Unie: `Exclude`, `Extract`, `NonNullable`.', en: 'Unions: `Exclude`, `Extract`, `NonNullable`.' },
        { pl: 'Funkcje: `ReturnType`, `Parameters`, `Awaited`.', en: 'Functions: `ReturnType`, `Parameters`, `Awaited`.' },
      ],
      keywords: ['Partial', 'Pick', 'Omit', 'Record', 'ReturnType', 'Awaited'],
    },
    {
      id: 'js-event-loop',
      cat: 'architecture',
      name: { pl: 'Event loop (microtasks vs macrotasks)', en: 'Event loop (microtasks vs macrotasks)' },
      tags: ['javascript', 'must-know'],
      definition: {
        pl: 'JavaScript jest single-threaded — event loop zarządza dwiema kolejkami. Microtasks (`Promise.then`, `queueMicrotask`, `MutationObserver`) wykonują się **przed** kolejnym macrotask (`setTimeout`, I/O, UI rendering). Stąd klasyczne pytania o kolejność `console.log`.',
        en: 'JavaScript is single-threaded — the event loop manages two queues. Microtasks (`Promise.then`, `queueMicrotask`, `MutationObserver`) run **before** the next macrotask (`setTimeout`, I/O, UI rendering). Hence the classic ordering puzzles.',
      },
      example: {
        pl: 'console.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// Wynik: 1, 4, 3, 2',
        en: 'console.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// Output: 1, 4, 3, 2',
      },
      keywords: ['microtask', 'macrotask', 'queueMicrotask', 'setTimeout', 'requestAnimationFrame'],
    },
    {
      id: 'js-esm-cjs',
      cat: 'architecture',
      name: { pl: 'ESM vs CommonJS', en: 'ESM vs CommonJS' },
      tags: ['javascript', 'modules'],
      definition: {
        pl: 'ECMAScript Modules (ESM) to standard języka — `import`/`export`, statyczne, wspiera tree-shaking i top-level await. CommonJS (`require`/`module.exports`) to dziedzictwo Node.js — dynamiczne, bez tree-shakingu. Nowe projekty zawsze ESM (`"type": "module"`).',
        en: 'ECMAScript Modules (ESM) is the language standard — `import`/`export`, static, supports tree-shaking and top-level await. CommonJS (`require`/`module.exports`) is Node.js legacy — dynamic, no tree-shaking. New projects always use ESM (`"type": "module"`).',
      },
      bullets: [
        { pl: 'Dual package hazard — pakiet publikowany w obu formatach może dać dwie instancje state.', en: 'Dual package hazard — a package shipped in both formats may give two state instances.' },
        { pl: 'Interop: `import fn from "cjs-pkg"` działa, ale named exports z CJS są ograniczone.', en: 'Interop: `import fn from "cjs-pkg"` works, but named exports from CJS are limited.' },
      ],
      keywords: ['ESM', 'CommonJS', 'type: module', 'tree-shaking', 'top-level await'],
    },
    {
      id: 'js-promises-async',
      cat: 'architecture',
      name: { pl: 'Promises i async/await', en: 'Promises and async/await' },
      tags: ['javascript'],
      definition: {
        pl: 'Promise reprezentuje przyszłą wartość (pending → fulfilled/rejected). `async/await` to cukier składniowy — funkcja `async` zawsze zwraca Promise, `await` rozpakowuje. `AbortController` pozwala anulować fetch i niektóre API, a `Promise.all` / `allSettled` / `race` / `any` łączą wiele obietnic.',
        en: 'A Promise represents a future value (pending → fulfilled/rejected). `async/await` is syntactic sugar — an `async` function always returns a Promise; `await` unwraps it. `AbortController` cancels fetch and some APIs, and `Promise.all` / `allSettled` / `race` / `any` compose promises.',
      },
      bullets: [
        { pl: '`Promise.all` — fail-fast; `allSettled` — wszystkie wyniki.', en: '`Promise.all` — fail-fast; `allSettled` — all outcomes.' },
        { pl: '`await` w pętli = sekwencyjnie. Dla równoległości — `Promise.all`.', en: '`await` in a loop = sequential. For parallelism use `Promise.all`.' },
        { pl: 'Concurrency limit — biblioteka `p-limit` lub własna pool.', en: 'Concurrency limit — the `p-limit` library or a custom pool.' },
      ],
      keywords: ['Promise.all', 'allSettled', 'AbortController', 'async', 'await'],
    },

    /* ── CSS / HTML / SCSS ───────────────────────────────── */
    {
      id: 'css-flex-grid',
      cat: 'css',
      name: { pl: 'Flexbox vs CSS Grid', en: 'Flexbox vs CSS Grid' },
      tags: ['layout'],
      definition: {
        pl: 'Flexbox to layout **jednowymiarowy** (rząd lub kolumna) — idealny do nawigacji, rzędu kart, wyśrodkowania. Grid to layout **dwuwymiarowy** (rzędy i kolumny jednocześnie) — dashboard, siatka stron, złożone formularze. Często zagnieżdżane: Grid na layout strony, Flex wewnątrz kart.',
        en: 'Flexbox is **one-dimensional** layout (row or column) — ideal for nav, rows of cards, centering. Grid is **two-dimensional** (rows and columns at once) — dashboards, page grids, complex forms. Often nested: Grid for page layout, Flex inside cards.',
      },
      bullets: [
        { pl: '`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` — responsywna siatka bez media.', en: '`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` — responsive grid without media.' },
        { pl: '`subgrid` — dziecko dziedziczy szablon rodzica.', en: '`subgrid` — child inherits parent template.' },
        { pl: 'Flex: `gap` zamiast `margin`, zgodny kierunek logical properties.', en: 'Flex: `gap` instead of `margin`, logical-property-friendly.' },
      ],
      keywords: ['flexbox', 'grid', 'auto-fit', 'minmax', 'subgrid', 'gap'],
    },
    {
      id: 'css-container-queries',
      cat: 'css',
      name: { pl: 'Container Queries (@container)', en: 'Container Queries (@container)' },
      tags: ['responsive'],
      definition: {
        pl: 'Container Queries pozwalają komponentowi reagować na rozmiar **rodzica (container)**, a nie tylko viewport. Dzięki temu ten sam komponent może wyglądać inaczej w szerokim main i wąskim sidebarze tej samej strony — bez znajomości kontekstu w którym żyje.',
        en: 'Container Queries let a component respond to **parent (container)** size rather than just the viewport. A single component can look different in a wide main vs a narrow sidebar on the same page — without knowing its context.',
      },
      example: {
        pl: '.card { container-type: inline-size; }\n@container (min-width: 400px) { .card h2 { font-size: 1.5rem; } }',
        en: '.card { container-type: inline-size; }\n@container (min-width: 400px) { .card h2 { font-size: 1.5rem; } }',
      },
      keywords: ['@container', 'container-type', 'container-name', 'cqw', 'cqh'],
    },
    {
      id: 'css-has',
      cat: 'css',
      name: { pl: 'Selektor :has() — parent selector', en: ':has() — parent selector' },
      tags: ['selectors'],
      definition: {
        pl: 'Od 2023 — pierwszy praktyczny "parent selector" w CSS. Pozwala stylować rodzica na podstawie dziecka lub potomka. Usuwa masę hacków JS-owych i custom-klas w stylu `.form--has-error`.',
        en: 'Since 2023 — the first practical "parent selector" in CSS. Lets you style a parent based on a child or descendant. Removes a ton of JS hacks and custom classes like `.form--has-error`.',
      },
      example: {
        pl: 'form:has(:invalid) button[type=submit] { opacity: .5; pointer-events: none; }',
        en: 'form:has(:invalid) button[type=submit] { opacity: .5; pointer-events: none; }',
      },
      bullets: [
        { pl: 'Wspierany we wszystkich nowoczesnych przeglądarkach.', en: 'Supported in all modern browsers.' },
        { pl: 'Może powiększyć specificity — uważaj w dużych projektach.', en: 'May increase specificity — watch out in big projects.' },
      ],
      keywords: [':has()', 'parent selector', 'relational pseudo-class'],
    },
    {
      id: 'css-sass-use',
      cat: 'css',
      name: { pl: 'SCSS @use / @forward', en: 'SCSS @use / @forward' },
      tags: ['sass'],
      definition: {
        pl: 'Od Sass 2019 — `@use` i `@forward` to następcy `@import`. Dają namespaces (`tokens.$accent`), brak globalnego leaku, brak duplikacji przy wielokrotnym imporcie. `@import` jest oficjalnie deprecated w dart-sass.',
        en: 'Since Sass 2019 — `@use` and `@forward` are successors to `@import`. Provide namespaces (`tokens.$accent`), no global leaks, no duplication on repeated imports. `@import` is officially deprecated in dart-sass.',
      },
      example: {
        pl: '@use "abstracts/tokens" as t;\n.button { color: t.$accent; padding: t.$space-2; }',
        en: '@use "abstracts/tokens" as t;\n.button { color: t.$accent; padding: t.$space-2; }',
      },
      keywords: ['@use', '@forward', 'namespace', '@import', 'dart-sass'],
    },
    {
      id: 'css-arch',
      cat: 'css',
      name: { pl: 'Architektury CSS — BEM, ITCSS, Atomic', en: 'CSS architectures — BEM, ITCSS, Atomic' },
      tags: ['architecture'],
      definition: {
        pl: 'Zbiór podejść do skalowania stylów w dużych projektach. BEM (Block__Element--Modifier) — proste, czytelne nazewnictwo. ITCSS — warstwy specificity od ogólnych do szczegółowych. Atomic/utility-first (Tailwind) — małe klasy kompozycyjne. Typowo w Angular: ViewEncapsulation.Emulated + BEM + tokeny jako CSS custom properties.',
        en: 'A set of approaches for scaling styles in large projects. BEM (Block__Element--Modifier) — simple, readable naming. ITCSS — specificity layers from generic to specific. Atomic/utility-first (Tailwind) — small composable classes. Typical Angular: ViewEncapsulation.Emulated + BEM + CSS custom properties as tokens.',
      },
      bullets: [
        { pl: 'Tokeny designu najlepiej trzymać jako CSS custom properties — runtime theming za darmo.', en: 'Design tokens are best kept as CSS custom properties — runtime theming for free.' },
        { pl: '`@layer` (cascade layers) — nowe narzędzie do kontroli specificity.', en: '`@layer` (cascade layers) — a new tool for specificity control.' },
      ],
      keywords: ['BEM', 'ITCSS', 'SMACSS', 'utility-first', 'Tailwind', '@layer'],
    },

    /* ── HTTP / REST / WS (architecture) ─────────────────── */
    {
      id: 'http-cors',
      cat: 'architecture',
      name: { pl: 'CORS i preflight', en: 'CORS and preflight' },
      tags: ['http', 'security'],
      definition: {
        pl: 'Same-Origin Policy blokuje cross-origin requests z JS. CORS to **mechanizm serwera**, który pozwala na wyjątki przez odpowiednie nagłówki. Dla "nietrywialnych" requestów (custom headers, metody inne niż GET/POST/HEAD) przeglądarka najpierw wysyła OPTIONS (preflight) i czeka na zgodę.',
        en: 'Same-Origin Policy blocks cross-origin requests from JS. CORS is a **server-side mechanism** that allows exceptions via specific headers. For "non-trivial" requests (custom headers, methods other than GET/POST/HEAD) the browser first sends OPTIONS (preflight) and waits for approval.',
      },
      bullets: [
        { pl: '`Access-Control-Allow-Origin: <origin>` — konkret, nie `*` przy credentials.', en: '`Access-Control-Allow-Origin: <origin>` — specific, not `*` with credentials.' },
        { pl: '`Access-Control-Allow-Credentials: true` + `withCredentials: true` po kliencie.', en: '`Access-Control-Allow-Credentials: true` + `withCredentials: true` on the client.' },
        { pl: 'Dev: Angular CLI proxy; prod: backend / API gateway.', en: 'Dev: Angular CLI proxy; prod: backend / API gateway.' },
      ],
      keywords: ['CORS', 'preflight', 'Access-Control-Allow-Origin', 'withCredentials', 'Same-Origin Policy'],
    },
    {
      id: 'http-auth',
      cat: 'architecture',
      name: { pl: 'JWT, OAuth 2.0, OpenID Connect', en: 'JWT, OAuth 2.0, OpenID Connect' },
      tags: ['security'],
      definition: {
        pl: 'JWT to stateless token (access + refresh). OAuth 2.0 to **framework delegacji** (upoważnienie, nie uwierzytelnianie — do tego jest OIDC). W SPA rekomendowany przepływ: Authorization Code + PKCE. Token access — w pamięci (signal/serwis), refresh — w httpOnly Secure cookie, by zminimalizować XSS surface.',
        en: 'JWT is a stateless token (access + refresh). OAuth 2.0 is a **delegation framework** (authorization, not authentication — that is OIDC). For SPAs the recommended flow is Authorization Code + PKCE. Access token — in memory (signal/service); refresh — in an httpOnly Secure cookie to minimize XSS surface.',
      },
      bullets: [
        { pl: 'localStorage dla tokenów = XSS może je ukraść. Unikaj.', en: 'localStorage for tokens = XSS can steal them. Avoid.' },
        { pl: 'Silent refresh: interceptor 401 → `/refresh` → retry (singleton, `shareReplay(1)`).', en: 'Silent refresh: interceptor 401 → `/refresh` → retry (singleton, `shareReplay(1)`).' },
      ],
      keywords: ['JWT', 'OAuth 2.0', 'OIDC', 'PKCE', 'httpOnly cookie', 'silent refresh'],
    },
    {
      id: 'http-ws-sse',
      cat: 'architecture',
      name: { pl: 'WebSocket vs SSE vs polling', en: 'WebSocket vs SSE vs polling' },
      tags: ['real-time'],
      definition: {
        pl: 'Trzy modele komunikacji "live". WebSocket = dwukierunkowy, niski latency (chaty, gry, collab). SSE (Server-Sent Events) = jednokierunkowy serwer → klient, auto-reconnect, HTTP-based — prostszy dla notyfikacji. Polling (long-polling) = fallback gdy WS niedostępny.',
        en: 'Three "live" communication models. WebSocket = bi-directional, low latency (chat, games, collab). SSE (Server-Sent Events) = one-way server → client, auto-reconnect, HTTP-based — simpler for notifications. Polling (long-polling) = fallback when WS is unavailable.',
      },
      bullets: [
        { pl: 'Reconnect z exponential backoff + jitter; po reconnect — resync przez fetch delta.', en: 'Reconnect with exponential backoff + jitter; on reconnect resync via delta fetch.' },
        { pl: 'Auth w WS: httpOnly cookie (same-origin) lub pierwsza wiadomość po handshake.', en: 'WS auth: httpOnly cookie (same-origin) or first message after handshake.' },
      ],
      keywords: ['WebSocket', 'SSE', 'EventSource', 'long polling', 'exponential backoff'],
    },
    {
      id: 'http-caching',
      cat: 'architecture',
      name: { pl: 'HTTP caching — Cache-Control i ETag', en: 'HTTP caching — Cache-Control and ETag' },
      tags: ['http', 'performance'],
      definition: {
        pl: 'Dwa poziomy cache — bezwarunkowy (`Cache-Control: max-age`, `stale-while-revalidate`) i warunkowy (`ETag` + `If-None-Match` → 304 bez body). W SPA dochodzi Service Worker cache (Workbox, Angular SW) oraz in-memory cache w interceptorze.',
        en: 'Two levels of caching — unconditional (`Cache-Control: max-age`, `stale-while-revalidate`) and conditional (`ETag` + `If-None-Match` → 304 with no body). In a SPA there is also Service Worker cache (Workbox, Angular SW) and interceptor-level in-memory cache.',
      },
      keywords: ['Cache-Control', 'ETag', 'If-None-Match', 'stale-while-revalidate', 'Service Worker'],
    },

    /* ── TESTING ─────────────────────────────────────────── */
    {
      id: 'test-pyramid',
      cat: 'testing',
      name: { pl: 'Piramida testów', en: 'Testing pyramid' },
      tags: ['strategy'],
      definition: {
        pl: 'Zdrowy podział: ~70% unit, ~20% integration, ~10% e2e. Unit są szybkie i izolowane, integration łączy kilka modułów, e2e sprawdza pełne flow w przeglądarce. Odwrócona piramida (dużo e2e) daje wolne, flaky testy i niskie zaufanie.',
        en: 'Healthy split: ~70% unit, ~20% integration, ~10% e2e. Units are fast and isolated, integration wires several modules, e2e covers full flows in the browser. The inverted pyramid (lots of e2e) yields slow, flaky tests and low confidence.',
      },
      bullets: [
        { pl: 'Mockować: HTTP, time, randomness, 3rd party.', en: 'Mock: HTTP, time, randomness, 3rd party.' },
        { pl: 'Nie mockować: implementation details własnego kodu.', en: 'Do not mock: internal implementation details.' },
      ],
      keywords: ['unit', 'integration', 'e2e', 'mock', 'flaky'],
    },
    {
      id: 'test-angular',
      cat: 'testing',
      name: { pl: 'TestBed i HttpTestingController', en: 'TestBed and HttpTestingController' },
      tags: ['angular'],
      definition: {
        pl: '`TestBed` to miniaturowy Angular do testów — konfigurujesz providery, tworzysz `ComponentFixture`, `fixture.detectChanges()` wymusza CD. `HttpTestingController` + `provideHttpClientTesting()` daje pełną kontrolę nad HTTP: `expectOne(url).flush(response)`, weryfikacja liczby wywołań.',
        en: '`TestBed` is a miniature Angular for tests — configure providers, create a `ComponentFixture`, use `fixture.detectChanges()` to force CD. `HttpTestingController` + `provideHttpClientTesting()` gives full HTTP control: `expectOne(url).flush(response)`, call-count verification.',
      },
      bullets: [
        { pl: '`fakeAsync` + `tick()` / `flush()` — deterministyczne testy czasu.', en: '`fakeAsync` + `tick()` / `flush()` — deterministic time tests.' },
        { pl: 'Angular Testing Library (`@testing-library/angular`) — test "jak użytkownik".', en: 'Angular Testing Library — test "like a user".' },
      ],
      keywords: ['TestBed', 'ComponentFixture', 'HttpTestingController', 'fakeAsync', 'tick'],
    },
    {
      id: 'test-jest-vitest',
      cat: 'testing',
      name: { pl: 'Jest vs Vitest (2026)', en: 'Jest vs Vitest (2026)' },
      tags: ['tooling'],
      definition: {
        pl: 'Jest to klasyka z ekosystemem, ale w 2026 kuleje przy natywnym ESM — trzeba transformów (`@swc/jest`). Vitest (na Vite + esbuild) jest znacząco szybszy, natywnie obsługuje ESM, a API jest kompatybilne z Jest. Angular 19+ ma oficjalny builder dla Vitest. Dla nowego projektu: Vitest.',
        en: 'Jest is a classic with an ecosystem, but in 2026 it struggles with native ESM — requires transforms (`@swc/jest`). Vitest (on Vite + esbuild) is significantly faster, handles ESM natively, with a Jest-compatible API. Angular 19+ ships an official Vitest builder. For a new project: Vitest.',
      },
      keywords: ['Jest', 'Vitest', 'esbuild', 'Vite', 'ESM'],
    },

    /* ── PERFORMANCE ─────────────────────────────────────── */
    {
      id: 'perf-web-vitals',
      cat: 'performance',
      name: { pl: 'Core Web Vitals', en: 'Core Web Vitals' },
      tags: ['metrics'],
      definition: {
        pl: 'Trzy główne metryki UX opublikowane przez Google, wpływające na SEO. LCP (Largest Contentful Paint) — kiedy największy element pojawia się w viewport, próg ≤ 2.5 s. CLS (Cumulative Layout Shift) — stabilność layoutu, ≤ 0.1. INP (Interaction to Next Paint) — reakcja na interakcję, ≤ 200 ms.',
        en: 'Three main UX metrics published by Google, impacting SEO. LCP (Largest Contentful Paint) — when the largest viewport element appears, target ≤ 2.5s. CLS (Cumulative Layout Shift) — layout stability, ≤ 0.1. INP (Interaction to Next Paint) — interaction responsiveness, ≤ 200ms.',
      },
      bullets: [
        { pl: 'INP zastąpił FID w 2024 — lepiej odzwierciedla prawdziwy UX.', en: 'INP replaced FID in 2024 — better reflects real UX.' },
        { pl: 'TTFB i FCP — pomocnicze, ale nie core vitals.', en: 'TTFB and FCP — supporting, not core vitals.' },
      ],
      keywords: ['LCP', 'CLS', 'INP', 'FID', 'TTFB', 'Web Vitals'],
    },
    {
      id: 'perf-ngoptimizedimage',
      cat: 'performance',
      name: { pl: 'NgOptimizedImage', en: 'NgOptimizedImage' },
      tags: ['angular'],
      definition: {
        pl: 'Dyrektywa Angulara (`ngSrc`) z automatycznym lazy-loadingiem, priorytetem dla LCP-image, generowaniem `srcset` i ostrzeżeniami w dev mode. Wymaga podania `width`/`height` (zero layout shift) albo `fill`.',
        en: 'Angular directive (`ngSrc`) with automatic lazy-loading, priority hint for LCP image, `srcset` generation and dev-mode warnings. Requires `width`/`height` (zero layout shift) or `fill`.',
      },
      example: {
        pl: '<img ngSrc="/hero.webp" width="1200" height="600" priority alt="..." />',
        en: '<img ngSrc="/hero.webp" width="1200" height="600" priority alt="..." />',
      },
      keywords: ['ngSrc', 'priority', 'NgOptimizedImage', 'srcset', 'LCP'],
    },
    {
      id: 'perf-virtual-scroll',
      cat: 'performance',
      name: { pl: 'Virtual scrolling', en: 'Virtual scrolling' },
      tags: ['angular'],
      definition: {
        pl: 'Technika renderowania tylko widocznych elementów listy (+ kilku w buforze) zamiast całej listy w DOM. Angular CDK dostarcza `<cdk-virtual-scroll-viewport>` + `*cdkVirtualFor`. Przy 10k+ itemów różnica między "zacina się" a "płynnie".',
        en: 'A technique of rendering only the visible list items (+ a buffer) instead of the full list in the DOM. Angular CDK provides `<cdk-virtual-scroll-viewport>` + `*cdkVirtualFor`. With 10k+ items it is the difference between "janky" and "smooth".',
      },
      keywords: ['cdk-virtual-scroll-viewport', 'cdkVirtualFor', 'itemSize', 'trackBy'],
    },
    {
      id: 'perf-bundlers',
      cat: 'performance',
      name: { pl: 'Bundlery — esbuild, Vite, Webpack', en: 'Bundlers — esbuild, Vite, Webpack' },
      tags: ['tooling'],
      definition: {
        pl: 'Angular 17+ używa **esbuild application builder** (Go, ~100× szybszy od Webpack w typowym builds). Vite łączy esbuild (dev) z Rollup (prod). Webpack zostaje w legacy configach i starym Module Federation (istnieje też Native Federation dla esbuild).',
        en: 'Angular 17+ uses an **esbuild application builder** (Go, ~100× faster than Webpack in typical builds). Vite combines esbuild (dev) with Rollup (prod). Webpack stays for legacy configs and old Module Federation (Native Federation also exists for esbuild).',
      },
      bullets: [
        { pl: 'Tree-shaking działa na ESM, nie na CJS.', en: 'Tree-shaking works on ESM, not CJS.' },
        { pl: 'Code splitting ≠ tree-shaking — pierwsze to podział, drugie to usuwanie dead code.', en: 'Code splitting ≠ tree-shaking — first is splitting, second is removing dead code.' },
      ],
      keywords: ['esbuild', 'Vite', 'Webpack', 'Rollup', 'tree-shaking', 'code splitting'],
    },

    /* ── PATTERNS (architecture) ─────────────────────────── */
    {
      id: 'arch-solid',
      cat: 'architecture',
      name: { pl: 'SOLID', en: 'SOLID' },
      tags: ['principles'],
      definition: {
        pl: 'Pięć zasad projektowania obiektowego: Single Responsibility (jedna odpowiedzialność), Open/Closed (otwarte na rozszerzenie, zamknięte na modyfikację), Liskov Substitution (podtyp zastępowalny), Interface Segregation (małe, wyspecjalizowane interfejsy), Dependency Inversion (zależność od abstrakcji).',
        en: 'Five OO design principles: Single Responsibility, Open/Closed (open for extension, closed for modification), Liskov Substitution (subtype replaceable), Interface Segregation (small, specialized interfaces), Dependency Inversion (depend on abstractions).',
      },
      bullets: [
        { pl: 'Open/Closed w Angularze: dodaj provider z nową strategią zamiast edytować istniejącą.', en: 'Open/Closed in Angular: add a provider with a new strategy instead of editing an existing one.' },
        { pl: 'Dependency Inversion w Angularze = DI + `InjectionToken` na interfejsie.', en: 'Dependency Inversion in Angular = DI + `InjectionToken` on an interface.' },
      ],
      keywords: ['Single Responsibility', 'Open/Closed', 'Liskov', 'Interface Segregation', 'Dependency Inversion'],
    },
    {
      id: 'arch-smart-presentational',
      cat: 'architecture',
      name: { pl: 'Smart / Presentational components', en: 'Smart / Presentational components' },
      tags: ['angular'],
      definition: {
        pl: 'Wzorzec podziału komponentów. Smart (container) wstrzykuje serwisy, trzyma stan, orchestruje. Presentational (dumb) przyjmuje dane przez `input()` i emituje przez `output()` — pure UI, bez serwisów biznesowych. Ułatwia testowanie, reużywalność i stylowanie.',
        en: 'A component split pattern. Smart (container) injects services, owns state, orchestrates. Presentational (dumb) takes data via `input()` and emits `output()` — pure UI, no business services. Eases testing, reuse and styling.',
      },
      keywords: ['smart', 'presentational', 'container', 'dumb', 'input()', 'output()'],
    },
    {
      id: 'arch-facade',
      cat: 'architecture',
      name: { pl: 'Facade pattern (Angular)', en: 'Facade pattern (Angular)' },
      tags: ['patterns'],
      definition: {
        pl: 'Facade ukrywa złożoność warstwy pod spodem (np. NgRx selectors + dispatch, Signal Store, dwa REST-y naraz) za prostym, domenowym API. UI rozmawia z `CheckoutFacade.addItem(...)`, nie wie co jest pod spodem. Ułatwia swap implementacji i testowanie.',
        en: 'Facade hides underlying complexity (e.g. NgRx selectors + dispatch, Signal Store, two REST calls at once) behind a simple domain API. UI talks to `CheckoutFacade.addItem(...)` and does not know what is underneath. Eases swapping and testing.',
      },
      keywords: ['Facade', 'NgRx', 'SignalStore', 'state management'],
    },
    {
      id: 'arch-repository',
      cat: 'architecture',
      name: { pl: 'Repository pattern', en: 'Repository pattern' },
      tags: ['patterns'],
      definition: {
        pl: 'Abstrakcja dostępu do danych: `UserRepository` ma metody `findAll`, `findById`, `create`, `update`, `delete` — logika biznesowa zna tylko interfejs, nie wie, czy pod spodem jest REST, IndexedDB, GraphQL czy mock w testach.',
        en: 'A data-access abstraction: `UserRepository` has `findAll`, `findById`, `create`, `update`, `delete` — business logic knows only the interface, not whether REST, IndexedDB, GraphQL or a test mock is behind it.',
      },
      keywords: ['Repository', 'abstraction', 'DI', 'mocking'],
    },
    {
      id: 'arch-mf',
      cat: 'architecture',
      name: { pl: 'Mikrofrontendy — Module Federation', en: 'Microfrontends — Module Federation' },
      tags: ['scale'],
      definition: {
        pl: 'Technika runtime sharingu modułów między osobno deployowanymi aplikacjami. Host (shell) ładuje remotes. Klucz: `shared` z `singleton: true` i zgodnymi wersjami — inaczej `inject()` zwraca różne instancje serwisów. Sens przy 5+ zespołach — inaczej monorepo (Nx) wygrywa.',
        en: 'A technique for runtime sharing of modules between separately deployed apps. Host (shell) loads remotes. Key: `shared` with `singleton: true` and matching versions — otherwise `inject()` returns different service instances. Worth it with 5+ teams — otherwise a monorepo (Nx) wins.',
      },
      bullets: [
        { pl: 'Webpack Module Federation + Native Federation (esbuild).', en: 'Webpack Module Federation + Native Federation (esbuild).' },
        { pl: 'Web Components (Angular Elements) — alternatywa do dzielenia widgetów.', en: 'Web Components (Angular Elements) — alternative for sharing widgets.' },
        { pl: 'Komunikacja: URL/router, custom events, shared service przez host.', en: 'Communication: URL/router, custom events, shared service via host.' },
      ],
      keywords: ['Module Federation', 'Native Federation', 'singleton', 'Angular Elements', 'micro-frontend'],
    },

    /* ── DEVOPS ──────────────────────────────────────────── */
    {
      id: 'git-flows',
      cat: 'devops',
      name: { pl: 'Git — merge, rebase, squash', en: 'Git — merge, rebase, squash' },
      tags: ['git'],
      definition: {
        pl: 'Merge zachowuje historię i tworzy merge commit. Rebase przepisuje commity na inny base (linearna historia). Squash merge zgniata PR do jednego commita w main. Typowa rekomendacja zespołowa: squash merge do main + lokalny rebase do utrzymania brancha aktualnego.',
        en: 'Merge preserves history and creates a merge commit. Rebase rewrites commits onto another base (linear history). Squash merge collapses a PR into one commit on main. Common team recommendation: squash merge to main + local rebase to keep the feature branch fresh.',
      },
      bullets: [
        { pl: '`git reflog` — ratunek po `reset --hard`.', en: '`git reflog` — a lifeline after `reset --hard`.' },
        { pl: '`git bisect` — binary search bugów.', en: '`git bisect` — binary search for bugs.' },
        { pl: 'Trunk-based development: wszyscy do main ≤ 1 dzień + feature flags.', en: 'Trunk-based development: everyone merges to main ≤ 1 day + feature flags.' },
      ],
      keywords: ['merge', 'rebase', 'squash', 'reflog', 'bisect', 'trunk-based'],
    },
    {
      id: 'npm-pnpm',
      cat: 'devops',
      name: { pl: 'npm vs pnpm vs yarn', en: 'npm vs pnpm vs yarn' },
      tags: ['package-manager'],
      definition: {
        pl: 'pnpm wygrywa w 2026: hardlinks do globalnego store (miejsce na dysku), strict resolution (brak phantom dependencies), szybsze instalacje (szczególnie w monorepo). npm i yarn dalej działają i wspierają workspaces, ale pnpm daje wszystko out-of-the-box.',
        en: 'pnpm wins in 2026: hardlinks to a global store (disk space), strict resolution (no phantom dependencies), faster installs (especially in monorepos). npm and yarn still work and support workspaces, but pnpm ships it all out-of-the-box.',
      },
      bullets: [
        { pl: 'Zawsze commituj lockfile (`pnpm-lock.yaml` / `package-lock.json`).', en: 'Always commit the lockfile (`pnpm-lock.yaml` / `package-lock.json`).' },
        { pl: 'W CI — `npm ci` / `pnpm install --frozen-lockfile`.', en: 'In CI use `npm ci` / `pnpm install --frozen-lockfile`.' },
        { pl: 'Monorepo: Nx (Angular-native), Turborepo.', en: 'Monorepo: Nx (Angular-native), Turborepo.' },
      ],
      keywords: ['pnpm', 'hardlinks', 'phantom dependencies', 'workspaces', 'Nx', 'Turborepo'],
    },
    {
      id: 'devops-semver',
      cat: 'devops',
      name: { pl: 'SemVer i conventional commits', en: 'SemVer and conventional commits' },
      tags: ['versioning'],
      definition: {
        pl: 'Semantic Versioning: `major.minor.patch`. Major = breaking, minor = nowa funkcja wstecznie zgodna, patch = fix. `^1.2.3` = compatible, `~1.2.3` = tylko patch, `1.2.3` = exact. Conventional Commits (`feat:`, `fix:`, `chore:`) pozwalają na automatyczny release i changelog.',
        en: 'Semantic Versioning: `major.minor.patch`. Major = breaking, minor = backwards-compatible feature, patch = fix. `^1.2.3` = compatible, `~1.2.3` = patch only, `1.2.3` = exact. Conventional Commits (`feat:`, `fix:`, `chore:`) enable automatic release and changelog.',
      },
      keywords: ['SemVer', 'major', 'minor', 'patch', 'conventional commits', 'changelog'],
    },
    {
      id: 'agile-scrum',
      cat: 'devops',
      name: { pl: 'Scrum vs Kanban', en: 'Scrum vs Kanban' },
      tags: ['agile'],
      definition: {
        pl: 'Scrum = złożony produkt z rytmem sprintów (planning, daily, review, retro, refinement), rolami (PO, SM, Devs). Kanban = continuous flow, WIP limits, brak sprintów — lepszy dla ops/support z wysokim przepływem różno-priorytetowych zadań.',
        en: 'Scrum = complex product with a sprint rhythm (planning, daily, review, retro, refinement), roles (PO, SM, Devs). Kanban = continuous flow, WIP limits, no sprints — better for ops/support with a high throughput of mixed-priority tasks.',
      },
      keywords: ['Scrum', 'Kanban', 'sprint', 'WIP', 'retrospective'],
    },
    {
      id: 'devops-observability',
      cat: 'devops',
      name: { pl: 'Observability na froncie', en: 'Frontend observability' },
      tags: ['monitoring'],
      definition: {
        pl: 'Trzy filary: logging (Sentry, Datadog), error tracking (Sentry + source maps upload) i RUM (Real User Monitoring) — Web Vitals z realnych sesji. Plus tracing (OpenTelemetry, correlation ID) dla end-to-end śledzenia requestów między klientem a backendem.',
        en: 'Three pillars: logging (Sentry, Datadog), error tracking (Sentry + source maps upload) and RUM (Real User Monitoring) — Web Vitals from real sessions. Plus tracing (OpenTelemetry, correlation ID) for end-to-end request tracking between client and backend.',
      },
      keywords: ['Sentry', 'Datadog', 'OpenTelemetry', 'RUM', 'correlation ID', 'source maps'],
    },

    /* ── PWA ─────────────────────────────────────────────── */
    {
      id: 'pwa-service-worker',
      cat: 'pwa',
      name: { pl: 'Service Worker i strategie cache', en: 'Service Worker and cache strategies' },
      tags: ['offline'],
      definition: {
        pl: 'Service Worker to skrypt działający w tle, pośredniczący między aplikacją a siecią. Umożliwia offline, push notifications, background sync i bardziej złożone strategie cache. Angular ma pakiet `@angular/service-worker` (ngsw-config), alternatywa to Workbox.',
        en: 'A Service Worker is a background script proxying between the app and the network. Enables offline, push notifications, background sync and advanced cache strategies. Angular ships `@angular/service-worker` (ngsw-config); an alternative is Workbox.',
      },
      bullets: [
        { pl: 'Strategie: cache-first, network-first, stale-while-revalidate.', en: 'Strategies: cache-first, network-first, stale-while-revalidate.' },
        { pl: 'Cykl: install → activate → fetch — pełna kontrola nad requestami.', en: 'Lifecycle: install → activate → fetch — full control over requests.' },
        { pl: 'Wymaga HTTPS (poza localhost).', en: 'Requires HTTPS (except localhost).' },
      ],
      keywords: ['Service Worker', 'Workbox', 'ngsw-config', 'stale-while-revalidate', 'manifest.json'],
    },

    /* ── CAMUNDA / BPM ───────────────────────────────────── */
    {
      id: 'cam-bpmn-basics',
      cat: 'camunda',
      name: { pl: 'BPMN 2.0 — elementy podstawowe', en: 'BPMN 2.0 — core elements' },
      tags: ['bpmn'],
      definition: {
        pl: 'BPMN (Business Process Model and Notation) 2.0 to standard ISO do modelowania procesów biznesowych. Cztery grupy elementów: **Flow Objects** (events, activities/tasks, gateways), **Connecting Objects** (sequence flow, message flow), **Swimlanes** (pools i lanes — kto co robi), **Artifacts** (data objects, annotations).',
        en: 'BPMN (Business Process Model and Notation) 2.0 is the ISO standard for modelling business processes. Four groups: **Flow Objects** (events, activities/tasks, gateways), **Connecting Objects** (sequence flow, message flow), **Swimlanes** (pools and lanes — who does what), **Artifacts** (data objects, annotations).',
      },
      bullets: [
        { pl: 'Events — start, intermediate (timer, message), end.', en: 'Events — start, intermediate (timer, message), end.' },
        { pl: 'Tasks — user task, service task, script task, send/receive task, business rule task.', en: 'Tasks — user, service, script, send/receive, business rule.' },
        { pl: 'Gateways — exclusive (XOR), parallel (AND), inclusive (OR), event-based.', en: 'Gateways — exclusive (XOR), parallel (AND), inclusive (OR), event-based.' },
        { pl: 'Diagram = `.bpmn` XML; otwiera się w Camunda Modeler albo `bpmn-js`.', en: 'Diagram = `.bpmn` XML; opens in Camunda Modeler or `bpmn-js`.' },
      ],
      example: {
        pl: 'Proces onboardingu: Start → User Task (dane klienta) → Gateway XOR (czy KYC wymagany?) → User Task (upload dokumentów) → Service Task (weryfikacja AML) → End.',
        en: 'Onboarding: Start → User Task (customer data) → Gateway XOR (KYC required?) → User Task (upload docs) → Service Task (AML check) → End.',
      },
      keywords: ['BPMN 2.0', 'user task', 'service task', 'gateway', 'pool', 'lane', 'sequence flow'],
    },
    {
      id: 'cam-7-vs-8',
      cat: 'camunda',
      name: { pl: 'Camunda 7 vs Camunda 8 (Zeebe)', en: 'Camunda 7 vs Camunda 8 (Zeebe)' },
      tags: ['architecture'],
      definition: {
        pl: 'Camunda 7 — klasyczny engine JVM, jedna relacyjna baza, REST API + Java API, embedowalny. Camunda 8 — cloud-native, silnik Zeebe (Go + event-sourcing), gRPC API, skalowalny horyzontalnie, wymaga Kafki-podobnego klastra. Na rozmowie: większość **enterprise w PL (banki) nadal jest na Camunda 7**.',
        en: 'Camunda 7 — classic JVM engine, single relational DB, REST + Java API, embeddable. Camunda 8 — cloud-native, Zeebe engine (Go + event-sourcing), gRPC API, horizontally scalable, requires a Kafka-like cluster. In interviews: **most Polish enterprise (banks) are still on Camunda 7**.',
      },
      bullets: [
        { pl: 'Camunda 7 → REST API (`/engine-rest/task`, `/process-instance`).', en: 'Camunda 7 → REST API (`/engine-rest/task`, `/process-instance`).' },
        { pl: 'Camunda 8 → gRPC (Zeebe client) + opcjonalne REST wrapper.', en: 'Camunda 8 → gRPC (Zeebe client) + optional REST wrapper.' },
        { pl: 'W obu jest Tasklist (UI gotowy) + Cockpit (monitoring) + Optimize (analityka).', en: 'Both ship with Tasklist (ready UI) + Cockpit (monitoring) + Optimize (analytics).' },
        { pl: 'Dla frontendowca zwykle tylko REST Tasklist API; reszta to backend.', en: 'For frontend usually only the REST Tasklist API matters; the rest is backend.' },
      ],
      keywords: ['Zeebe', 'Cockpit', 'Tasklist', 'Optimize', 'REST', 'gRPC'],
    },
    {
      id: 'cam-tasklist-api',
      cat: 'camunda',
      name: { pl: 'Camunda Tasklist API — frontend perspective', en: 'Camunda Tasklist API — frontend perspective' },
      tags: ['integration'],
      definition: {
        pl: 'Tasklist REST API pozwala zbudować własny UI listy zadań operatora. Typowe endpointy (Camunda 7): `GET /task` (lista z filtrem `assignee=me`), `POST /task/{id}/claim` (przypisz do siebie), `POST /task/{id}/complete` ze zmiennymi wyniku, `GET /task/{id}/variables` (kontekst procesu). Od frontendowca oczekują często custom UI zamiast out-of-the-box Tasklist.',
        en: 'The Tasklist REST API lets you build a custom operator task UI. Typical endpoints (Camunda 7): `GET /task` (list with `assignee=me`), `POST /task/{id}/claim`, `POST /task/{id}/complete` with result variables, `GET /task/{id}/variables` (process context). Companies often want a custom UI instead of the out-of-the-box Tasklist.',
      },
      bullets: [
        { pl: 'Zawsze `claim` przed `complete` — inaczej 403.', en: 'Always `claim` before `complete` — otherwise 403.' },
        { pl: 'Zmienne procesu przekazuje się w body jako `{ variables: { name: { value, type } } }`.', en: 'Process variables go in body as `{ variables: { name: { value, type } } }`.' },
        { pl: 'Typy zmiennych: String, Boolean, Long, Double, Date, Json, Object.', en: 'Variable types: String, Boolean, Long, Double, Date, Json, Object.' },
        { pl: 'Polling vs SSE/WS — Camunda 7 nie ma native push, trzeba polling co 5–10s.', en: 'Polling vs SSE/WS — Camunda 7 has no native push, you poll every 5–10s.' },
      ],
      example: {
        pl: '`POST /engine-rest/task/abc123/complete` body: `{ variables: { approved: { value: true, type: "Boolean" }, comment: { value: "OK", type: "String" } } }`',
        en: '`POST /engine-rest/task/abc123/complete` body: `{ variables: { approved: { value: true, type: "Boolean" }, comment: { value: "OK", type: "String" } } }`',
      },
      keywords: ['/task', 'claim', 'complete', 'variables', 'assignee', 'Tasklist'],
    },
    {
      id: 'cam-user-vs-service',
      cat: 'camunda',
      name: { pl: 'User task vs Service task vs Script task', en: 'User task vs Service task vs Script task' },
      tags: ['bpmn'],
      definition: {
        pl: '**User task** — czeka na działanie człowieka (pojawia się w Tasklist). **Service task** — wywołanie systemu, wykonuje kod Java/REST/connector automatycznie, nie blokuje się przy userze. **Script task** — inline skrypt (Groovy, JS) liczący coś „w locie". Frontend widzi głównie **user taski**; service/script są dla backendu.',
        en: '**User task** — waits for human action (appears in Tasklist). **Service task** — system call, runs Java/REST/connector code automatically, no user blocking. **Script task** — inline script (Groovy, JS) computing on the fly. Frontend mostly deals with **user tasks**; service/script are backend.',
      },
      bullets: [
        { pl: 'User task ma `assignee`, `candidateGroups`, `formKey` (link do formularza).', en: 'User task has `assignee`, `candidateGroups`, `formKey` (form link).' },
        { pl: 'Service task w Camunda 7: `Java class`, `expression`, `delegate expression`, `external task` (idiom: worker pattern).', en: 'Service task in Camunda 7: `Java class`, `expression`, `delegate expression`, `external task` (worker pattern).' },
        { pl: 'External task — backend worker pobiera z kolejki, wykonuje, zwraca → odporne na restart.', en: 'External task — backend worker fetches, executes, returns → restart-resilient.' },
      ],
      keywords: ['user task', 'service task', 'external task', 'assignee', 'candidateGroups', 'formKey'],
    },
    {
      id: 'cam-forms',
      cat: 'camunda',
      name: { pl: 'Camunda Forms — embedded vs external', en: 'Camunda Forms — embedded vs external' },
      tags: ['forms'],
      definition: {
        pl: 'Trzy podejścia do formularzy user-task: **Embedded Forms** — HTML inline w BPMN XML, przydaje się do prostych przypadków. **Camunda Forms (Form SDK)** — JSON schema + renderer, w Camunda 8 standard. **External forms** (custom UI) — frontend renderuje własny formularz Angular, zna tylko `taskId` i pobiera `variables`. W bankach zwykle to ostatnie.',
        en: 'Three approaches to user-task forms: **Embedded Forms** — HTML inline in BPMN XML, fine for simple cases. **Camunda Forms (Form SDK)** — JSON schema + renderer, standard in Camunda 8. **External forms** (custom UI) — frontend renders its own Angular form, knows only `taskId` and fetches `variables`. Banks usually go the last way.',
      },
      bullets: [
        { pl: 'Embedded — szybkie, ale brak walidacji poza HTML5; trudne w testowaniu.', en: 'Embedded — fast but HTML5-only validation; hard to test.' },
        { pl: 'Camunda Forms JSON — dobry kompromis, ma walidację, conditions, datasource.', en: 'Camunda Forms JSON — good compromise, has validation, conditions, datasource.' },
        { pl: 'External + Angular Reactive Forms / Signal Forms — max kontrola, pełny design-system.', en: 'External + Angular Reactive Forms / Signal Forms — max control, full design-system.' },
      ],
      keywords: ['embedded form', 'formKey', 'form JSON schema', 'external form', 'taskId'],
    },
    {
      id: 'cam-bpmn-js',
      cat: 'camunda',
      name: { pl: 'bpmn-js — viewer/modeler w przeglądarce', en: 'bpmn-js — browser viewer/modeler' },
      tags: ['library'],
      definition: {
        pl: '`bpmn-js` to biblioteka JS od Camundy do renderowania i edycji diagramów BPMN w przeglądarce. Dwa pakiety: **`bpmn-js` (viewer)** — read-only prezentacja + highlight aktualnego kroku, idealne dla operatora; **`bpmn-js-properties-panel`** — edytor z panelem właściwości. W Angularze wrap-ujesz w komponent.',
        en: '`bpmn-js` is the Camunda JS library to render and edit BPMN diagrams in a browser. Two packages: **`bpmn-js` (viewer)** — read-only rendering + current-step highlight, ideal for operators; **`bpmn-js-properties-panel`** — editor with a properties panel. In Angular you wrap it in a component.',
      },
      bullets: [
        { pl: '`new BpmnViewer({ container })` + `viewer.importXML(xml)` + `viewer.get("canvas").addMarker(taskId, "highlight")`.', en: '`new BpmnViewer({ container })` + `viewer.importXML(xml)` + `viewer.get("canvas").addMarker(taskId, "highlight")`.' },
        { pl: 'Zoom / pan / fit-to-viewport z pudełka.', en: 'Zoom / pan / fit-to-viewport out of the box.' },
        { pl: 'Integracja: pobierasz BPMN XML z backendu + lista zakończonych kroków → highlight.', en: 'Integration: fetch BPMN XML from backend + completed-step list → highlight.' },
      ],
      example: {
        pl: 'Typowe zadanie na rozmowie: „Zrób komponent Angular wyświetlający diagram procesu z podświetlonym aktualnym krokiem". `bpmn-js` + signal na `currentStep` + `effect(() => viewer.get("canvas").addMarker(currentStep(), "highlight"))`.',
        en: 'Typical interview task: "Build an Angular component showing the process diagram with the current step highlighted". `bpmn-js` + signal on `currentStep` + `effect(() => viewer.get("canvas").addMarker(currentStep(), "highlight"))`.',
      },
      keywords: ['bpmn-js', 'BpmnViewer', 'importXML', 'addMarker', 'canvas', 'properties-panel'],
    },
    {
      id: 'cam-process-variables',
      cat: 'camunda',
      name: { pl: 'Process variables — propagacja stanu', en: 'Process variables — state propagation' },
      tags: ['state'],
      definition: {
        pl: 'Zmienne procesu to **key-value state** niesiony przez cały process instance. User task widzi zmienne z poprzednich kroków (np. `customerId`, `kycLevel`, `riskScore`) i zwraca własne. Frontend czyta przez `GET /task/{id}/variables`, zapisuje przy `complete`. Typy są explicit — `{ value, type, valueInfo }`.',
        en: 'Process variables are **key-value state** carried through the entire process instance. A user task sees variables from previous steps (e.g. `customerId`, `kycLevel`, `riskScore`) and returns its own. Frontend reads via `GET /task/{id}/variables` and writes on `complete`. Types are explicit — `{ value, type, valueInfo }`.',
      },
      bullets: [
        { pl: 'Scope: **local** (tylko w obrębie taska) vs **global** (dla całej instancji).', en: 'Scope: **local** (task-only) vs **global** (whole instance).' },
        { pl: 'JSON przez `type: "Json"` albo serializowany obiekt `type: "Object"`.', en: 'JSON via `type: "Json"` or a serialised `type: "Object"`.' },
        { pl: 'Mapping — input/output variable mapping przy service task (co wchodzi/wychodzi).', en: 'Input/output variable mapping on service tasks (what goes in/out).' },
      ],
      keywords: ['process variables', 'local', 'global', 'Json', 'Object', 'variable mapping'],
    },
    {
      id: 'cam-correlation',
      cat: 'camunda',
      name: { pl: 'Correlation — message events i klucze', en: 'Correlation — message events and keys' },
      tags: ['events'],
      definition: {
        pl: 'Korelacja łączy zewnętrzne zdarzenie (np. „klient zakończył KYC w innym systemie") z konkretną instancją procesu. Zamiast `processInstanceId` używasz `correlationKey` (np. `businessKey = nip` klienta). Endpoint `POST /message` z `messageName` + `businessKey` + payload budzi oczekujący receive task / intermediate message event.',
        en: 'Correlation links an external event (e.g. "customer completed KYC in another system") to a specific process instance. Instead of `processInstanceId` you use a `correlationKey` (e.g. `businessKey = customer NIP`). `POST /message` with `messageName` + `businessKey` + payload wakes the waiting receive/intermediate message event.',
      },
      bullets: [
        { pl: '`businessKey` to najczęściej domenowy identyfikator (numer wniosku, PESEL, NIP).', en: '`businessKey` is usually a domain identifier (application number, national ID).' },
        { pl: 'Frontend rzadko sam woła `/message`; częściej backend, ale warto rozumieć flow.', en: 'Frontend rarely calls `/message` itself; backend does — but it is worth understanding the flow.' },
        { pl: 'Timer + message — alternatywna ścieżka: „jeśli KYC nie skończy się w 24h → escalation".', en: 'Timer + message — alternative path: "if KYC not done in 24h → escalation".' },
      ],
      keywords: ['correlation', 'businessKey', 'messageName', 'receive task', 'intermediate message event'],
    },
    {
      id: 'cam-dmn',
      cat: 'camunda',
      name: { pl: 'DMN — decision tables (po krótce)', en: 'DMN — decision tables (briefly)' },
      tags: ['decision'],
      definition: {
        pl: 'DMN (Decision Model and Notation) to siostra BPMN-a dla **decyzji biznesowych** zapisanych jako tabele (input → output). W Camundzie używa się ich przez **Business Rule Task**. Dla frontendowca rzadko bezpośrednio — ale warto wiedzieć, że „decyzje ryzyka AML" są często w DMN, nie w kodzie.',
        en: 'DMN (Decision Model and Notation) is BPMN\'s sibling for **business decisions** expressed as tables (input → output). In Camunda used via **Business Rule Task**. Rare for frontend directly — but good to know that "AML risk decisions" often live in DMN, not in code.',
      },
      bullets: [
        { pl: 'Hit policy — UNIQUE / FIRST / ANY / COLLECT / RULE ORDER.', en: 'Hit policies — UNIQUE / FIRST / ANY / COLLECT / RULE ORDER.' },
        { pl: 'Analityk edytuje DMN bez dotykania kodu — „low-code" dla reguł.', en: 'Analyst edits DMN without touching code — "low-code" for rules.' },
      ],
      keywords: ['DMN', 'decision table', 'business rule task', 'hit policy', 'FEEL'],
    },
    {
      id: 'cam-angular-integration',
      cat: 'camunda',
      name: { pl: 'Angular + Camunda — wzorzec integracji', en: 'Angular + Camunda — integration pattern' },
      tags: ['architecture'],
      definition: {
        pl: 'Typowy setup w projekcie bankowym: (1) **CamundaTaskService** (Angular service, inject HttpClient, metody `getMyTasks()`, `claim()`, `complete()`). (2) **TaskListComponent** — signal z listą, `computed()` filtruje po statusie. (3) **TaskDetailComponent** — pobiera `variables` + renderuje custom form (Reactive/Signal Forms). (4) **ProcessDiagramComponent** — `bpmn-js` viewer z highlight aktualnego kroku. (5) **interceptor** — dorzuca JWT + korelacja z business key.',
        en: 'Typical banking-project setup: (1) **CamundaTaskService** (Angular service, inject HttpClient, methods `getMyTasks()`, `claim()`, `complete()`). (2) **TaskListComponent** — signal with the list, `computed()` filters by status. (3) **TaskDetailComponent** — fetches `variables` + renders a custom form (Reactive/Signal Forms). (4) **ProcessDiagramComponent** — `bpmn-js` viewer with current-step highlight. (5) **interceptor** — adds JWT + business-key correlation.',
      },
      bullets: [
        { pl: 'Polling task listy co 5–10s (Camunda 7) lub WebSocket przez własny gateway (Camunda 8).', en: 'Poll the task list every 5–10s (Camunda 7) or WebSocket via own gateway (Camunda 8).' },
        { pl: 'Optimistic UI: natychmiast oznacz task „completed" → rollback gdy API zwróci 4xx.', en: 'Optimistic UI: mark task "completed" immediately → rollback on 4xx.' },
        { pl: 'Concurrency — ktoś inny mógł kliknąć `claim` pierwszy → 409 → pokaż info i refresh.', en: 'Concurrency — someone else may `claim` first → 409 → show info and refresh.' },
      ],
      keywords: ['CamundaTaskService', 'claim', 'complete', 'bpmn-js', 'interceptor', 'businessKey', 'polling'],
    },

    /* ── DOMENA BANKOWA: KYC / AML ───────────────────────── */
    {
      id: 'dom-kyc-basics',
      cat: 'domain',
      name: { pl: 'KYC — Know Your Customer', en: 'KYC — Know Your Customer' },
      tags: ['regulatory'],
      definition: {
        pl: 'KYC to zbiór obowiązków instytucji finansowej, aby **zweryfikować tożsamość klienta** przed otwarciem relacji biznesowej. W PL obowiązuje na bazie **ustawy o przeciwdziałaniu praniu pieniędzy (AML Act)**. Kroki: identyfikacja (kto), weryfikacja (dowód), profilowanie ryzyka (jaki klient), monitoring (ciągły).',
        en: 'KYC is the set of obligations for a financial institution to **verify a customer\'s identity** before opening a relationship. In Poland it follows the **Anti-Money Laundering Act**. Steps: identification (who), verification (proof), risk profiling (what type), monitoring (continuous).',
      },
      bullets: [
        { pl: 'Dokumenty: dowód osobisty, paszport; dla firm — KRS, NIP, REGON.', en: 'Documents: ID card, passport; for companies — registry, tax ID.' },
        { pl: 'Weryfikacja: na oddziale (pracownik), zdalnie (selfie + OCR), e-ID (profil zaufany, mojeID).', en: 'Verification: branch (clerk), remote (selfie + OCR), e-ID (trusted profile).' },
        { pl: 'Periodic review — KYC odnawia się (1/3/5 lat w zależności od poziomu ryzyka).', en: 'Periodic review — KYC is refreshed (1/3/5 years depending on risk tier).' },
      ],
      example: {
        pl: 'UI dla operatora w oddziale: stepper (5 kroków) — dane osobowe → skan dowodu → selfie-match → PEP check → potwierdzenie. Każdy krok może być service taskem Camundy.',
        en: 'Branch-clerk UI: stepper (5 steps) — personal data → ID scan → selfie match → PEP check → confirmation. Each step can be a Camunda service task.',
      },
      keywords: ['KYC', 'identification', 'verification', 'risk profiling', 'periodic review', 'AML Act'],
    },
    {
      id: 'dom-cdd-edd',
      cat: 'domain',
      name: { pl: 'CDD vs EDD — poziomy due diligence', en: 'CDD vs EDD — due diligence tiers' },
      tags: ['regulatory'],
      definition: {
        pl: '**CDD (Customer Due Diligence)** — standardowe środki bezpieczeństwa finansowego dla „zwykłego" klienta. **SDD (Simplified)** — niski ryzyk, np. lokata niewielkiej kwoty. **EDD (Enhanced)** — podwyższone dla klientów wysokiego ryzyka: PEP, klienci z krajów high-risk wg FATF, transakcje powyżej progów. Różnica w UI: EDD = więcej kroków, więcej dokumentów, akceptacja przez managera.',
        en: '**CDD (Customer Due Diligence)** — standard AML measures for a regular customer. **SDD (Simplified)** — low risk, e.g. small deposit. **EDD (Enhanced)** — for high-risk customers: PEPs, customers from FATF high-risk countries, transactions above thresholds. UI difference: EDD = more steps, more documents, manager approval.',
      },
      bullets: [
        { pl: 'PEP — Politically Exposed Person (polityk, urzędnik wysokiego szczebla i rodzina).', en: 'PEP — Politically Exposed Person (politician, senior official, family).' },
        { pl: 'SoF / SoW — Source of Funds / Source of Wealth — pytania przy EDD.', en: 'SoF / SoW — Source of Funds / Wealth — questions in EDD.' },
        { pl: 'FATF lists — aktualne listy krajów wysokiego ryzyka (Iran, KRLD, Myanmar…).', en: 'FATF lists — current high-risk country lists (Iran, DPRK, Myanmar…).' },
      ],
      keywords: ['CDD', 'EDD', 'SDD', 'PEP', 'SoF', 'SoW', 'FATF'],
    },
    {
      id: 'dom-aml-process',
      cat: 'domain',
      name: { pl: 'AML — proces i alerty', en: 'AML — process and alerts' },
      tags: ['regulatory'],
      definition: {
        pl: 'AML (Anti-Money Laundering) to ciągły proces wykrywania podejrzanych transakcji. Kluczowe artefakty: **STR (Suspicious Transaction Report)** do GIIF w PL, **SAR** w świecie. Alerty generują reguły (kwoty, częstotliwość, kraje) + ML modele. Rola frontendu — UI operatora AML: lista alertów, priorytetyzacja, akceptacja / eskalacja / STR.',
        en: 'AML (Anti-Money Laundering) is the continuous process of detecting suspicious transactions. Key artefacts: **STR (Suspicious Transaction Report)** to GIIF in Poland, **SAR** globally. Alerts come from rules (amounts, frequency, countries) + ML models. Frontend role — AML operator UI: alert list, prioritisation, accept / escalate / STR.',
      },
      bullets: [
        { pl: 'Sanction screening — PEP + sankcje (OFAC, EU, UN) przed otwarciem konta i przy transakcji.', en: 'Sanction screening — PEP + sanctions (OFAC, EU, UN) before account opening and on each transaction.' },
        { pl: 'Typowe UI patterns: alert queue (sortowalna lista), detail view z case history, action buttons.', en: 'Typical UI patterns: alert queue (sortable list), detail view with case history, action buttons.' },
        { pl: 'Eskalacja: L1 operator → L2 compliance officer → GIIF/regulator.', en: 'Escalation: L1 operator → L2 compliance officer → regulator.' },
      ],
      example: {
        pl: '„OneAML" to zwykle wewnętrzna nazwa zintegrowanego systemu AML (np. Oracle FCCM lub custom). Frontend dla operatora: tabela alertów z priority, filter, bulk-action + dashboard z KPI (avg time to resolve).',
        en: '"OneAML" is typically an internal name for an integrated AML system (Oracle FCCM or custom). Operator frontend: alert table with priority, filter, bulk-action + KPI dashboard (avg time to resolve).',
      },
      keywords: ['AML', 'STR', 'SAR', 'GIIF', 'OFAC', 'sanction', 'PEP screening', 'OneAML'],
    },
    {
      id: 'dom-kyc-ux',
      cat: 'domain',
      name: { pl: 'UX patterns — KYC / onboarding stepper', en: 'UX patterns — KYC / onboarding stepper' },
      tags: ['ux'],
      definition: {
        pl: 'Formularze KYC są najdroższe biznesowo — każdy drop-off = utracony klient. Wzorce: **stepper z progress** (stałe ile zostało), **save-as-you-go** (draft, powrót do kroku), **async verification** z pollingiem (skan dowodu weryfikuje się 30s — pokaż loader + szacowany czas), **clear error states** (nie „Error 500" tylko „Nie udało się zweryfikować dowodu, spróbuj ponownie").',
        en: 'KYC forms are the most expensive part of the business — every drop-off = lost customer. Patterns: **stepper with progress**, **save-as-you-go** (draft, return to step), **async verification with polling** (ID scan takes 30s — show loader + ETA), **clear error states** (not "Error 500" but "Could not verify ID, please try again").',
      },
      bullets: [
        { pl: 'Stepper: liniowy dla prostych, z branchingiem gdy EDD — pokaż dynamicznie.', en: 'Stepper: linear for simple, with branching on EDD — show dynamically.' },
        { pl: 'Upload dokumentów: preview + kadrowanie + walidacja rozmiaru/formatu po stronie klienta.', en: 'Document upload: preview + cropping + client-side size/format validation.' },
        { pl: 'Async status: `pending` → `in_review` → `approved` / `rejected` z polling lub WS.', en: 'Async status: `pending` → `in_review` → `approved` / `rejected` via polling or WS.' },
        { pl: 'A11y — formularze muszą być dostępne, bo to regulated process.', en: 'A11y — forms must be accessible, since it is a regulated process.' },
      ],
      keywords: ['stepper', 'save-as-you-go', 'async verification', 'polling', 'document upload', 'a11y'],
    },
    {
      id: 'dom-banking-context',
      cat: 'domain',
      name: { pl: 'Bankowość PL — słownik i kontekst', en: 'Polish banking — glossary and context' },
      tags: ['domain'],
      definition: {
        pl: 'Minimum, żeby nie wpaść na AI-rekruterze: **KNF** (Komisja Nadzoru Finansowego) — regulator, **GIIF** (Generalny Inspektor Informacji Finansowej) — dla AML, **PSD2** — dyrektywa otwartej bankowości (SCA, TPP, Open Banking), **SCA** (Strong Customer Authentication) — 2FA dla transakcji, **RODO/GDPR** — dane osobowe, **FATCA/CRS** — wymiana informacji podatkowych.',
        en: 'Bare minimum to not trip on the AI recruiter: **KNF** (Polish Financial Supervision Authority), **GIIF** (Polish FIU for AML), **PSD2** — open-banking directive (SCA, TPP, Open Banking), **SCA** — 2FA for transactions, **GDPR** — personal data, **FATCA/CRS** — tax info exchange.',
      },
      bullets: [
        { pl: 'Oddział / placówka partnerska — kontekst projektu: **UI dla pracownika banku**, nie dla klienta self-service.', en: 'Branch / partner outlet — project context: **UI for bank employee**, not self-service customer.' },
        { pl: 'Klient indywidualny vs biznesowy — inne formularze, inne dokumenty, inne decyzje.', en: 'Retail vs business customer — different forms, documents, decisions.' },
        { pl: 'Audit trail — wszystkie akcje operatora muszą być logowane dla regulatora.', en: 'Audit trail — every operator action must be logged for regulators.' },
      ],
      keywords: ['KNF', 'GIIF', 'PSD2', 'SCA', 'GDPR', 'FATCA', 'CRS', 'oddział', 'operator'],
    },

    /* ── GITHUB COPILOT / AI TOOLS ───────────────────────── */
    {
      id: 'ai-copilot-basics',
      cat: 'ai-tools',
      name: { pl: 'GitHub Copilot — inline vs Chat vs Agent', en: 'GitHub Copilot — inline vs Chat vs Agent' },
      tags: ['tools'],
      definition: {
        pl: 'Trzy tryby pracy: **inline suggestions** (Tab, w edytorze, najszybsze), **Copilot Chat** (side panel / ⌘I, pytania + refactor + explain + tests), **Copilot Agent** (multi-step tasks, tworzy PR-y, ale wymaga przeglądu). Każde na inny use-case — senior wie, kiedy co.',
        en: 'Three modes: **inline suggestions** (Tab, in-editor, fastest), **Copilot Chat** (side panel / ⌘I, Q&A + refactor + explain + tests), **Copilot Agent** (multi-step tasks, opens PRs but needs review). Each for a different use-case — a senior knows when to use what.',
      },
      bullets: [
        { pl: 'Inline = boilerplate, getters/setters, zamykanie bracketów, oczywiste kontynuacje.', en: 'Inline = boilerplate, getters/setters, bracket closing, obvious completions.' },
        { pl: 'Chat = explain this regex, refactor to signals, generate unit tests, wygeneruj BPMN task.', en: 'Chat = explain this regex, refactor to signals, generate unit tests, scaffold a BPMN task.' },
        { pl: 'Agent = zmiany przez wiele plików; zwykle follow-up „zmień też importy/testy".', en: 'Agent = multi-file changes; usually follow-up "also update imports/tests".' },
      ],
      keywords: ['Copilot', 'inline', 'Chat', 'Agent', 'ghost text', '@workspace'],
    },
    {
      id: 'ai-copilot-security',
      cat: 'ai-tools',
      name: { pl: 'Copilot w regulated industry — security', en: 'Copilot in regulated industry — security' },
      tags: ['security'],
      definition: {
        pl: 'W banku / fintechu **nie każdy fragment kodu można wkleić do Copilota**. Na rozmowie oczekują świadomości: co NIE wklejasz (PII, produkcyjne dane, secrets, JWT, fragmenty ze strategią biznesową), co jest OK (stubsy, testy z synthetic data, generyczne algorytmy). GitHub Copilot Business / Enterprise ma enterprise-grade privacy (no-training), ale polityka firmy rządzi.',
        en: 'In a bank / fintech **not every code fragment can be pasted into Copilot**. The interview tests awareness: what NOT to paste (PII, production data, secrets, JWTs, business-strategy snippets), what\'s OK (stubs, synthetic-data tests, generic algorithms). GitHub Copilot Business / Enterprise has enterprise privacy (no-training), but company policy rules.',
      },
      bullets: [
        { pl: 'Content exclusions — Copilot można wyłączyć dla niektórych repo / ścieżek.', en: 'Content exclusions — Copilot can be disabled for specific repos / paths.' },
        { pl: 'Duplicate detection filter — blokada sugestii dopasowanych 1:1 do public code.', en: 'Duplicate detection filter — blocks suggestions matching 1:1 to public code.' },
        { pl: 'Audit log (Enterprise) — widać kto, kiedy, jakie prompty.', en: 'Audit log (Enterprise) — who, when, which prompts.' },
        { pl: 'Zawsze review — Copilot halucynuje API i nazwy metod, zwłaszcza przy libach custom.', en: 'Always review — Copilot hallucinates APIs and method names, especially in custom libs.' },
      ],
      keywords: ['Copilot Business', 'content exclusion', 'duplicate detection', 'audit log', 'PII', 'no-training'],
    },
    {
      id: 'ai-copilot-prompts',
      cat: 'ai-tools',
      name: { pl: 'Copilot — prompt patterns dla seniora', en: 'Copilot — prompt patterns for a senior' },
      tags: ['productivity'],
      definition: {
        pl: 'Pięć patternów, które najbardziej zwiększają produktywność: **explain** („explain this RxJS pipe step by step"), **refactor to X** („refactor to signals + standalone"), **generate tests** („write Jest tests for happy path + 2 edge cases"), **translate** („port this React hook to Angular signals"), **pair review** („review this PR for race conditions"). Dobry prompt ma **kontekst** + **kryterium sukcesu**.',
        en: 'Five patterns that give the biggest productivity boost: **explain** ("explain this RxJS pipe step by step"), **refactor to X** ("refactor to signals + standalone"), **generate tests** ("write Jest tests for happy path + 2 edge cases"), **translate** ("port this React hook to Angular signals"), **pair review** ("review this PR for race conditions"). A good prompt has **context** + **success criteria**.',
      },
      bullets: [
        { pl: '`@workspace` w Chat = Copilot widzi całe repo, nie tylko otwarty plik.', en: '`@workspace` in Chat = Copilot sees the whole repo, not just the open file.' },
        { pl: '`/explain`, `/tests`, `/fix` — slash-commands przyspieszają typowe operacje.', en: '`/explain`, `/tests`, `/fix` — slash-commands speed up common ops.' },
        { pl: 'Custom instructions (`.github/copilot-instructions.md`) — stałe reguły dla projektu.', en: 'Custom instructions (`.github/copilot-instructions.md`) — standing rules for the project.' },
      ],
      example: {
        pl: 'Słaby: „add validation". Dobry: „add sync validators to this Signal Form: email format, min 8 chars password, password match; return ValidationErrors keyed by field".',
        en: 'Weak: "add validation". Strong: "add sync validators to this Signal Form: email format, min 8 chars password, password match; return ValidationErrors keyed by field".',
      },
      keywords: ['prompt pattern', '@workspace', '/explain', '/tests', 'copilot-instructions.md'],
    },
    {
      id: 'ai-copilot-review',
      cat: 'ai-tools',
      name: { pl: 'Review-first mindset z Copilotem', en: 'Review-first mindset with Copilot' },
      tags: ['quality'],
      definition: {
        pl: 'Copilot to **junior intern, nie senior engineer** — zawsze review przed commitem. Częste błędy: halucynacje nazw API, przestarzałe patterny (np. `*ngIf` zamiast `@if`), over-engineering dla prostego zadania, brak edge-case handling. Senior używa Copilota do **bootstrapu**, nie do finalnego kodu. Pytanie typu na rozmowie: „jak kontrolujesz jakość z Copilotem?"',
        en: 'Copilot is a **junior intern, not a senior engineer** — always review before commit. Common issues: API name hallucinations, outdated patterns (e.g. `*ngIf` instead of `@if`), over-engineering for simple tasks, missing edge-case handling. A senior uses Copilot to **bootstrap**, not for final code. Typical interview question: "How do you quality-control Copilot output?"',
      },
      bullets: [
        { pl: 'Zawsze run tests po sugestii — Copilot może złamać istniejący flow.', en: 'Always run tests after a suggestion — Copilot may break existing flow.' },
        { pl: 'Small diffs — akceptuj linia po linii, nie całe funkcje na ślepo.', en: 'Small diffs — accept line by line, not whole functions blindly.' },
        { pl: 'Prompt do linting: „check this for accessibility issues / race conditions / memory leaks".', en: 'Prompt for linting: "check this for accessibility issues / race conditions / memory leaks".' },
      ],
      keywords: ['review-first', 'halucynacja', 'bootstrap', 'small diff', 'quality gate'],
    },

    /* ── AWS (nice-to-have, frontend perspective) ─────────── */
    {
      id: 'aws-frontend-stack',
      cat: 'cloud',
      name: { pl: 'AWS dla frontendowca — stack podstawowy', en: 'AWS for frontend — the basic stack' },
      tags: ['aws'],
      definition: {
        pl: 'Minimum dla frontendowca: **S3** (static hosting — bundle Angulara), **CloudFront** (CDN + HTTPS + caching headers), **Route 53** (DNS), **ACM** (certyfikaty SSL), **API Gateway + Lambda** (backend/edge functions), **Cognito** (auth), **CloudWatch** (logs + RUM). Deployment przez `aws s3 sync dist/ s3://bucket` + `aws cloudfront create-invalidation`.',
        en: 'Minimum for a frontend dev: **S3** (static hosting — Angular bundle), **CloudFront** (CDN + HTTPS + cache headers), **Route 53** (DNS), **ACM** (SSL certs), **API Gateway + Lambda** (backend/edge functions), **Cognito** (auth), **CloudWatch** (logs + RUM). Deploy via `aws s3 sync dist/ s3://bucket` + `aws cloudfront create-invalidation`.',
      },
      bullets: [
        { pl: 'SPA routing → CloudFront „Error pages" 404 → `/index.html` (200).', en: 'SPA routing → CloudFront "Error pages" 404 → `/index.html` (200).' },
        { pl: 'Cache-Control: `index.html` — no-cache; assety hashowane — 1 rok.', en: 'Cache-Control: `index.html` — no-cache; hashed assets — 1 year.' },
        { pl: 'Invalidation kosztuje — lepiej hashe w nazwach plików.', en: 'Invalidations cost money — prefer hashed filenames.' },
      ],
      keywords: ['S3', 'CloudFront', 'Route 53', 'ACM', 'API Gateway', 'Lambda', 'Cognito', 'CloudWatch'],
    },
    {
      id: 'aws-cognito',
      cat: 'cloud',
      name: { pl: 'Cognito — auth dla Angulara', en: 'Cognito — auth for Angular' },
      tags: ['auth'],
      definition: {
        pl: 'AWS Cognito to managed OAuth2/OIDC provider: **User Pool** (users + sign-in + MFA) i **Identity Pool** (STS credentials do AWS resources). Dla Angulara — biblioteka `amazon-cognito-identity-js` lub `@aws-amplify/auth`, plus interceptor dodający `Authorization: Bearer <jwt>` do requestów.',
        en: 'AWS Cognito is a managed OAuth2/OIDC provider: **User Pool** (users + sign-in + MFA) and **Identity Pool** (STS credentials to AWS resources). For Angular — `amazon-cognito-identity-js` or `@aws-amplify/auth`, plus an interceptor adding `Authorization: Bearer <jwt>`.',
      },
      bullets: [
        { pl: 'JWT ma 3 tokeny: ID (OIDC claims), Access (authz do API), Refresh (odnawianie).', en: 'JWT has 3 tokens: ID (OIDC claims), Access (API authz), Refresh (renewal).' },
        { pl: 'Refresh token w HttpOnly cookie (nie localStorage) — XSS protection.', en: 'Refresh token in HttpOnly cookie (not localStorage) — XSS protection.' },
        { pl: 'SCA / MFA przez Cognito — SMS, TOTP, WebAuthn.', en: 'SCA / MFA via Cognito — SMS, TOTP, WebAuthn.' },
      ],
      keywords: ['Cognito', 'User Pool', 'Identity Pool', 'JWT', 'ID token', 'Access token', 'MFA'],
    },
    {
      id: 'aws-cloudwatch-rum',
      cat: 'cloud',
      name: { pl: 'CloudWatch RUM + logi', en: 'CloudWatch RUM + logs' },
      tags: ['observability'],
      definition: {
        pl: '**CloudWatch RUM** — Real User Monitoring: zbiera Web Vitals (LCP, CLS, INP), JS errors, API latency, session replay (beta). Konkurent Sentry/Datadog, ale native AWS. **CloudWatch Logs** — agregacja logów z Lambdy + API Gateway + CloudFront; Insights do zapytań SQL-like.',
        en: '**CloudWatch RUM** — Real User Monitoring: collects Web Vitals (LCP, CLS, INP), JS errors, API latency, session replay (beta). Alternative to Sentry/Datadog but native AWS. **CloudWatch Logs** — aggregates logs from Lambda + API Gateway + CloudFront; Insights for SQL-like queries.',
      },
      bullets: [
        { pl: 'RUM jest opt-in + sampling (np. 10% ruchu), żeby nie zabić konta billingiem.', en: 'RUM is opt-in + sampling (e.g. 10% traffic) to avoid billing shock.' },
        { pl: 'Custom events: `rum.recordEvent("checkout_submit", { ... })`.', en: 'Custom events: `rum.recordEvent("checkout_submit", { ... })`.' },
        { pl: 'Retention logów ma cenę — domyślnie „never expire" = drogo.', en: 'Log retention has a price — default "never expire" = expensive.' },
      ],
      keywords: ['CloudWatch RUM', 'Web Vitals', 'session replay', 'Logs Insights', 'sampling'],
    },
    {
      id: 'aws-iam-basics',
      cat: 'cloud',
      name: { pl: 'IAM — minimum dla frontendowca', en: 'IAM — minimum for frontend' },
      tags: ['security'],
      definition: {
        pl: 'IAM to control plane autoryzacji w AWS. Frontendowiec dotyka głównie: **IAM role dla CI/CD** (deploy do S3/CloudFront), **IAM role dla Cognito Identity Pool** (co user może zrobić w AWS po zalogowaniu), **policies JSON** (allow / deny). Zasada: **least privilege** — rola może tylko to, co musi.',
        en: 'IAM is AWS\'s authz control plane. Frontend mostly touches: **IAM role for CI/CD** (deploy to S3/CloudFront), **IAM role for Cognito Identity Pool** (what the signed-in user can do in AWS), **policies JSON** (allow / deny). Rule: **least privilege** — a role can only do what it must.',
      },
      bullets: [
        { pl: 'Nigdy nie commit access-key do repo — używaj OIDC dla GitHub Actions.', en: 'Never commit access keys to the repo — use OIDC for GitHub Actions.' },
        { pl: 'S3 bucket domyślnie privat; public access dopiero przez CloudFront OAC.', en: 'S3 bucket default private; public via CloudFront OAC only.' },
        { pl: 'Policy simulator do testowania — co by się stało, gdyby user spróbował.', en: 'Policy simulator for testing — what would happen if the user tried.' },
      ],
      keywords: ['IAM', 'role', 'policy', 'least privilege', 'OIDC', 'OAC', 'access key'],
    },
  ];

  window.DEFINITIONS_DATA = D;
})();
