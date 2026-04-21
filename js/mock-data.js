/* ==========================================================
   MOCK_DATA — 10 pytań open-ended do mock interview.
   Każde pytanie:
     id         — unikalny
     cat        — kategoria (musi istnieć w i18n `cat.*`)
     difficulty — 'easy' | 'medium' | 'hard'
     timeSec    — limit czasu na odpowiedź
     q          — { pl, en } treść pytania
     model      — { pl, en } wzorcowa odpowiedź (senior-level)
     keyPoints  — [{ pl, en }, ...] punkty, które powinny paść
     topic      — { pl, en } nazwa tematu (do listy "do powtórki")
   ========================================================== */
(function () {
  'use strict';

  const Q = [
    {
      id: 'mk-signal-vs-observable',
      cat: 'angular',
      difficulty: 'medium',
      timeSec: 180,
      topic: { pl: 'Signals vs RxJS', en: 'Signals vs RxJS' },
      q: {
        pl: 'Kiedy w Angularze 21 używasz Signal, a kiedy Observable? Wytłumacz różnicę fundamentalną, podaj dwa przykłady dla każdego.',
        en: 'When do you use a Signal vs an Observable in Angular 21? Explain the fundamental difference and give two examples for each.',
      },
      model: {
        pl: 'Signal to synchroniczny, zawsze-aktualny kontener wartości z auto-trackingiem zależności (computed/effect). Observable to strumień zdarzeń w czasie, głównie do asynchronii. Używam signali do stanu komponentu (lokalny state, derived via computed, effects jako side effects). Używam RxJS do strumieni async: HTTP, WebSocket/SSE, operatorów cancellation (switchMap w autocomplete), kombinowania (combineLatest, merge), retries. Na granicy interop: toSignal(http.get(...), { initialValue: [] }) konsumuję w template, toObservable(sig) gdy potrzebuję operatorów.',
        en: 'A Signal is a synchronous, always-current value container with auto-tracked dependencies (computed/effect). An Observable is a stream of events over time, primarily for async. I use signals for component state (local state, derived via computed, effects for side effects). I use RxJS for async streams: HTTP, WebSocket/SSE, cancellation operators (switchMap in autocomplete), combining (combineLatest, merge), retries. Interop at the boundary: toSignal(http.get(...), { initialValue: [] }) to consume in templates, toObservable(sig) when I need operators.',
      },
      keyPoints: [
        { pl: 'Signal = synchroniczny, wartość zawsze dostępna (`count()`)', en: 'Signal = synchronous, value always available (`count()`)' },
        { pl: 'Observable = strumień asynchroniczny, wymaga subscribe / async pipe', en: 'Observable = async stream, requires subscribe / async pipe' },
        { pl: 'Computed = leniwe, memoizowane derivation', en: 'Computed = lazy, memoized derivation' },
        { pl: 'Cleanup: signal + DestroyRef automatycznie; RxJS + takeUntilDestroyed()', en: 'Cleanup: signal + DestroyRef automatic; RxJS + takeUntilDestroyed()' },
        { pl: 'Interop: toSignal / toObservable', en: 'Interop: toSignal / toObservable' },
      ],
    },

    {
      id: 'mk-rxjs-flatten',
      cat: 'rxjs',
      difficulty: 'medium',
      timeSec: 180,
      topic: { pl: 'Operatory flatten (switch/merge/concat/exhaust)', en: 'Flatten operators (switch/merge/concat/exhaust)' },
      q: {
        pl: 'Porównaj switchMap, mergeMap, concatMap i exhaustMap. Dla każdego podaj przykład z życia, kiedy dokładnie tego użyjesz.',
        en: 'Compare switchMap, mergeMap, concatMap and exhaustMap. For each, give a real-world example of when exactly you use it.',
      },
      model: {
        pl: 'switchMap — anuluje poprzednie wewnętrzne źródło gdy przyjdzie nowa wartość. Use-case: autocomplete (chcemy wyniku tylko dla ostatniej frazy). mergeMap — wszystko leci równolegle, kolejność emisji może być pomieszana. Use-case: fire-and-forget (wysyłanie telemetrii, niezależne uploady). concatMap — kolejkuje, każdy kolejny source startuje dopiero po zakończeniu poprzedniego. Use-case: saving kroków wizardu w kolejności albo logowanie audit events. exhaustMap — gdy source jest aktywny, ignoruje kolejne źródła. Use-case: przycisk "Zaloguj" — klikanie 5 razy nie wyśle 5 requestów, drugi klik jest ignorowany aż pierwszy się skończy.',
        en: 'switchMap — cancels the previous inner source when a new value arrives. Use-case: autocomplete (we only want the result for the last query). mergeMap — runs everything in parallel, emission order may interleave. Use-case: fire-and-forget (telemetry, independent uploads). concatMap — queues, each next source starts only after the previous completes. Use-case: wizard step saving in order, audit event logging. exhaustMap — while a source is active, ignores incoming sources. Use-case: a "Login" button — 5 clicks won\'t fire 5 requests; the second click is ignored until the first completes.',
      },
      keyPoints: [
        { pl: 'switchMap: cancel previous + autocomplete', en: 'switchMap: cancel previous + autocomplete' },
        { pl: 'mergeMap: parallel, unordered', en: 'mergeMap: parallel, unordered' },
        { pl: 'concatMap: queue, ordered', en: 'concatMap: queue, ordered' },
        { pl: 'exhaustMap: ignore while busy + login button', en: 'exhaustMap: ignore while busy + login button' },
        { pl: 'Memory leak: mergeMap bez limitu (concurrency)', en: 'Memory leak: mergeMap without concurrency limit' },
      ],
    },

    {
      id: 'mk-zoneless',
      cat: 'angular',
      difficulty: 'hard',
      timeSec: 180,
      topic: { pl: 'Zoneless change detection', en: 'Zoneless change detection' },
      q: {
        pl: 'Jak działa zoneless change detection w Angular 21? Co konkretnie triggeruje cykl CD bez zone.js? Jakie pułapki przy migracji ze starego zone-based Angulara?',
        en: 'How does zoneless change detection work in Angular 21? What specifically triggers a CD cycle without zone.js? What are the migration pitfalls coming from zone-based Angular?',
      },
      model: {
        pl: 'Zone.js monkey-patchował globalne async API (setTimeout, Promise.then, addEventListener, XHR), żeby po każdej asynchronicznej operacji Angular mógł uruchomić CD. W zoneless to znika. CD odpalają teraz tylko: 1) zmiana sygnału użytego w template (signal.set/update/mutate), 2) eventy bindowane w template ((click), (input)), 3) async pipe przy nowej emisji, 4) ręczne ChangeDetectorRef.markForCheck(). Pułapki: setTimeout bez aktualizacji sygnału nie odświeży UI, addEventListener dodany ręcznie w ngAfterViewInit też nie, libki third-party (Monaco, D3) zakładające zone też nie. Rozwiązanie: zawsze kończ efekt sygnałem set() albo cdr.markForCheck(). Zysk: ~30kB bundle\'a, brak niepotrzebnych cykli CD od libów nie-angularowych, prostszy debugging.',
        en: 'Zone.js monkey-patched global async APIs (setTimeout, Promise.then, addEventListener, XHR) so that after every async operation Angular could run CD. In zoneless this disappears. CD now fires only from: 1) a signal change used in the template, 2) template-bound events ((click), (input)), 3) async pipe emission, 4) manual ChangeDetectorRef.markForCheck(). Pitfalls: a bare setTimeout without a signal update won\'t refresh UI, an addEventListener added manually in ngAfterViewInit either, third-party libs (Monaco, D3) that assume zone neither. Fix: always end the effect with signal.set() or cdr.markForCheck(). Gains: ~30kB bundle, no unnecessary CD cycles from non-Angular libs, easier debugging.',
      },
      keyPoints: [
        { pl: 'zone.js małpował async API', en: 'zone.js monkey-patched async APIs' },
        { pl: 'CD triggery: signal, event, async pipe, markForCheck', en: 'CD triggers: signal, event, async pipe, markForCheck' },
        { pl: 'Pitfall: setTimeout bez sygnału nie odświeży UI', en: 'Pitfall: bare setTimeout won\'t refresh UI' },
        { pl: 'provideZonelessChangeDetection() + remove zone.js', en: 'provideZonelessChangeDetection() + remove zone.js' },
        { pl: 'Zysk: bundle + znikają CD cycles od libów third-party', en: 'Gains: bundle + no CD cycles from third-party libs' },
      ],
    },

    {
      id: 'mk-perf-10k-list',
      cat: 'performance',
      difficulty: 'medium',
      timeSec: 240,
      topic: { pl: 'Optymalizacja listy 10k elementów', en: 'Optimizing a 10k-item list' },
      q: {
        pl: 'Masz listę 10 000 elementów, która zacina UI (scroll lag, wolne otwieranie). Jak to diagnozujesz krok po kroku? Co zmieniasz w pierwszej kolejności?',
        en: 'You have a 10,000-item list that stutters the UI (scroll lag, slow to open). How do you diagnose this step by step? What do you change first?',
      },
      model: {
        pl: 'Diagnoza: 1) Chrome DevTools Performance tab — nagrywam interakcję, patrzę czy długie taski to Scripting (JS) czy Rendering (Layout/Paint). 2) Angular DevTools profiler pokazuje cykle CD i ile każdy komponent zajmuje. 3) Sprawdzam czy są trackBy/track na @for, OnPush na komponentach-liściach, ciężkie pipe\'y non-pure w template. Fixy po kolei: (a) `@for (item of items; track item.id)` — bez tego Angular re-renderuje wszystko przy każdej zmianie, (b) OnPush strategy + immutable updates (spread zamiast push), (c) CDK virtual-scroll (`cdk-virtual-scroll-viewport`) — renderuje tylko ~20 widocznych elementów, reszta w DOM nie istnieje. To zwykle 90% problemu. Potem: (d) `computed()` dla filtrowania/sortowania zamiast w template, (e) offload ciężkich calcs do web workera jeśli potrzeba, (f) paginacja albo infinite scroll.',
        en: 'Diagnosis: 1) Chrome DevTools Performance tab — record the interaction, check whether long tasks are Scripting (JS) or Rendering (Layout/Paint). 2) Angular DevTools profiler shows CD cycles and how long each component takes. 3) Check for trackBy/track on @for, OnPush on leaf components, heavy non-pure pipes in template. Fixes in order: (a) `@for (item of items; track item.id)` — without it Angular re-renders everything on any change, (b) OnPush + immutable updates (spread, not push), (c) CDK virtual-scroll (`cdk-virtual-scroll-viewport`) — renders only ~20 visible items, the rest don\'t exist in DOM. That\'s usually 90% of the problem. Then: (d) `computed()` for filtering/sorting instead of in template, (e) offload heavy calcs to a web worker if needed, (f) pagination or infinite scroll.',
      },
      keyPoints: [
        { pl: 'Profiler first (DevTools + Angular DevTools)', en: 'Profiler first (DevTools + Angular DevTools)' },
        { pl: 'track w @for (kluczowe)', en: 'track in @for (critical)' },
        { pl: 'OnPush + immutable data', en: 'OnPush + immutable data' },
        { pl: 'CDK virtual-scroll', en: 'CDK virtual-scroll' },
        { pl: 'computed() zamiast logiki w template', en: 'computed() instead of logic in template' },
      ],
    },

    {
      id: 'mk-state-management',
      cat: 'architecture',
      difficulty: 'hard',
      timeSec: 240,
      topic: { pl: 'State management — kiedy co', en: 'State management — when to use what' },
      q: {
        pl: 'Jak ułożysz state management w średnio-dużej aplikacji Angular 21 (50+ komponentów)? Signal, service-facade, NgRx SignalStore, klasyczny NgRx — kiedy co?',
        en: 'How do you structure state management in a mid-to-large Angular 21 app (50+ components)? Signal, service-facade, NgRx SignalStore, classic NgRx — when does each apply?',
      },
      model: {
        pl: 'Reguła: start od najlżejszego, eskalacja tylko gdy potrzeba. Poziomy: 1) **Stan komponentu** — `signal()` + `computed()` w klasie komponentu. Dla formularzy, toggli, local UI state. 2) **Stan współdzielony w feature** — serwis z signalami (`@Injectable({ providedIn: "root" })` albo feature-scoped) jako facade. Metody mutujące + public signals (readonly przez `.asReadonly()`). 3) **Globalny, złożony stan** — `@ngrx/signals` SignalStore: ma entities, effects, hooks lifecycle, computed selectors, a kod jest 3× krótszy niż klasyczny NgRx. 4) **Klasyczny NgRx** — tylko gdy zespół już go zna i potrzebujemy time-travel debugging, Redux DevTools, Effect-y z rxjs operatorami do złożonych workflow. 5) **Cache HTTP** — TanStack Query Angular albo Apollo (GraphQL); jeśli nie chcę libki, serwis z `Map<key, signal<T>>()`. Zasada: nie overengineeruj — 70% aplikacji ok z poziomem 1 i 2.',
        en: 'Rule: start with the lightest, escalate only when needed. Levels: 1) **Component state** — `signal()` + `computed()` in the component class. For forms, toggles, local UI state. 2) **Feature-shared state** — a service with signals (`@Injectable({ providedIn: "root" })` or feature-scoped) as a facade. Mutator methods + public signals (readonly via `.asReadonly()`). 3) **Global, complex state** — `@ngrx/signals` SignalStore: entities, effects, lifecycle hooks, computed selectors; code is ~3× shorter than classic NgRx. 4) **Classic NgRx** — only when the team already knows it and we need time-travel debugging, Redux DevTools, complex Effect workflows with rxjs operators. 5) **HTTP cache** — TanStack Query Angular or Apollo (GraphQL); if no lib, a service with `Map<key, signal<T>>()`. Principle: don\'t over-engineer — 70% of apps are fine at levels 1 and 2.',
      },
      keyPoints: [
        { pl: 'Signal + computed lokalnie', en: 'Signal + computed locally' },
        { pl: 'Service-facade dla feature state', en: 'Service-facade for feature state' },
        { pl: 'SignalStore (@ngrx/signals) dla globalu', en: 'SignalStore (@ngrx/signals) for global' },
        { pl: 'Klasyczny NgRx tylko przy time-travel / zespół zna', en: 'Classic NgRx only for time-travel / team knows it' },
        { pl: 'Cache HTTP: TanStack Query / Apollo', en: 'HTTP cache: TanStack Query / Apollo' },
      ],
    },

    {
      id: 'mk-testing-http',
      cat: 'testing',
      difficulty: 'medium',
      timeSec: 240,
      topic: { pl: 'Testowanie komponentu z HttpClient', en: 'Testing a component with HttpClient' },
      q: {
        pl: 'Jak testujesz komponent, który przez serwis pobiera dane z HttpClient? Jaki stack (Jest/Vitest/Karma), co mockujesz, co sprawdzasz?',
        en: 'How do you test a component that fetches data via a service using HttpClient? What stack (Jest/Vitest/Karma), what do you mock, what do you assert?',
      },
      model: {
        pl: 'Stack: Vitest (szybszy niż Jest, natywny ESM) lub Jest jeśli projekt już go używa. Do DOM assertions — Angular Testing Library (user-centric queries `getByRole`). Setup: `TestBed.configureTestingModule({ imports: [Component], providers: [provideHttpClientTesting()] })`. Mockuję HTTP (boundary), nie serwis — żeby interceptory i mapowanie odpowiedzi też było w zasięgu testu. HttpTestingController pokazuje oczekiwany request (`httpMock.expectOne("/api/users")`), asercja URL+metody+headerów, `flush(mockData)` zwraca mock response. Po teście `httpMock.verify()` w afterEach — wyłapie nieoczekiwane calle. Asercje: komponent pokazuje loading → po flush pokazuje dane → error w teście z flushError(). Nie mockuję samej metody `getUser()` w serwisie, bo test staje się tautologią ("metoda zwraca to, co sama zwraca").',
        en: 'Stack: Vitest (faster than Jest, native ESM) or Jest if the project already uses it. For DOM assertions — Angular Testing Library (user-centric queries `getByRole`). Setup: `TestBed.configureTestingModule({ imports: [Component], providers: [provideHttpClientTesting()] })`. I mock HTTP (the boundary), not the service — so interceptors and response mapping are also covered. HttpTestingController surfaces the expected request (`httpMock.expectOne("/api/users")`), assert URL+method+headers, `flush(mockData)` returns the mock response. After the test, `httpMock.verify()` in afterEach catches unexpected calls. Assertions: component shows loading → after flush shows data → error test via flushError(). I don\'t mock the `getUser()` method itself because the test becomes a tautology ("the method returns what the method returns").',
      },
      keyPoints: [
        { pl: 'provideHttpClientTesting() + HttpTestingController', en: 'provideHttpClientTesting() + HttpTestingController' },
        { pl: 'Mock na boundary (HTTP), nie serwis', en: 'Mock at boundary (HTTP), not service' },
        { pl: 'httpMock.expectOne + flush + verify()', en: 'httpMock.expectOne + flush + verify()' },
        { pl: 'Loading → data → error — 3 happy/edge paths', en: 'Loading → data → error — 3 happy/edge paths' },
        { pl: 'Angular Testing Library zamiast debugElement', en: 'Angular Testing Library instead of debugElement' },
      ],
    },

    {
      id: 'mk-ts-unknown-satisfies',
      cat: 'typescript',
      difficulty: 'medium',
      timeSec: 180,
      topic: { pl: 'TS: unknown vs any, type guards, satisfies', en: 'TS: unknown vs any, type guards, satisfies' },
      q: {
        pl: 'Kiedy używasz `unknown` zamiast `any`? Co daje operator `satisfies`? Kiedy piszesz user-defined type guard vs Zoda/Valibota?',
        en: 'When do you use `unknown` over `any`? What does the `satisfies` operator give you? When do you write a user-defined type guard vs use Zod/Valibot?',
      },
      model: {
        pl: '`any` całkowicie wyłącza sprawdzanie — używam tylko przy migracji legacy i planuję usunąć. `unknown` wymusza narrowing przed każdym użyciem — to mój default dla danych zewnętrznych (fetch, JSON.parse, catch(err: unknown)). Type guard: `function isUser(x: unknown): x is User { return typeof x === "object" && x !== null && "id" in x }` — pisz ręcznie dla 2-3 prostych kształtów. Dla złożonych (API responses, forms) — Zod albo Valibot: `const User = z.object({ id: z.string(), email: z.email() }); type User = z.infer<typeof User>`. Zyskujesz walidację runtime + type bez duplikacji. `satisfies` sprawdza zgodność wartości z typem *bez poszerzania typu literału*. Przykład: `const routes = { home: "/", login: "/login" } satisfies Record<string, string>` — dostaję autocomplete + wąski typ literalny (`"/" | "/login"`), nie zwykły string. To było niemożliwe przed TS 4.9.',
        en: '`any` fully disables checking — I only use it for legacy migration and plan to remove it. `unknown` forces narrowing before every use — my default for external data (fetch, JSON.parse, catch(err: unknown)). Type guard: `function isUser(x: unknown): x is User { return typeof x === "object" && x !== null && "id" in x }` — write by hand for 2–3 simple shapes. For complex shapes (API responses, forms) — Zod or Valibot: `const User = z.object({ id: z.string(), email: z.email() }); type User = z.infer<typeof User>`. You get runtime validation + type without duplication. `satisfies` checks a value against a type *without widening the literal type*. Example: `const routes = { home: "/", login: "/login" } satisfies Record<string, string>` — I get autocomplete + narrow literal type (`"/" | "/login"`), not plain string. Impossible before TS 4.9.',
      },
      keyPoints: [
        { pl: '`unknown` dla boundary, `any` tylko legacy', en: '`unknown` at boundaries, `any` only legacy' },
        { pl: 'User type guard `x is T`', en: 'User type guard `x is T`' },
        { pl: 'Zod/Valibot dla złożonych kształtów (runtime + types)', en: 'Zod/Valibot for complex shapes (runtime + types)' },
        { pl: '`satisfies` — zachowuje literalny typ', en: '`satisfies` — preserves literal type' },
        { pl: 'Narrowing: typeof, instanceof, `in`, discriminated unions', en: 'Narrowing: typeof, instanceof, `in`, discriminated unions' },
      ],
    },

    {
      id: 'mk-css-modern',
      cat: 'css',
      difficulty: 'medium',
      timeSec: 180,
      topic: { pl: 'Nowy CSS: container queries, :has(), subgrid', en: 'Modern CSS: container queries, :has(), subgrid' },
      q: {
        pl: 'Opowiedz o container queries, `:has()` i subgrid — co to jest, jaki konkretny problem rozwiązują, jakie wsparcie przeglądarek w 2026?',
        en: 'Talk about container queries, `:has()` and subgrid — what they are, the concrete problem they solve, and browser support in 2026.',
      },
      model: {
        pl: '**Container queries** (`@container`) — responsywność na rozmiar *rodzica*, nie viewport. Idealne dla komponentów używanych w różnych kontekstach (sidebar vs main content). Wymaga `container-type: inline-size` na kontenerze. Kończy hacki typu class-based layout, przenoszą decyzję "jak się wyświetlam" do samego komponentu. Wsparcie: 95%+ (baseline 2023). **`:has()`** — pierwszy prawdziwy parent selector w CSS: `.card:has(img)` — stylujesz kartę, która zawiera obrazek. Eliminuje wiele klas utility dodawanych przez JS. Uwaga na performance — selektor może być drogi w dużych drzewach DOM. Wsparcie: 94%+ (baseline 2023). **Subgrid** — `grid-template-columns: subgrid` dziedziczy ścieżki rodzica. Kończy problem „jak wyrównać 3 karty w gridzie, żeby header, body i footer miały tę samą wysokość między kartami" — wcześniej wymagało jednego ogromnego gridu. Wsparcie: 90%+ (baseline 2024). Wszystkie trzy mają `@supports` fallbacki, ale w 2026 już prawie zawsze są bezpieczne.',
        en: '**Container queries** (`@container`) — respond to *parent* size, not viewport. Ideal for components used in different contexts (sidebar vs main). Requires `container-type: inline-size` on the container. Ends class-based layout hacks, moves the "how do I display" decision to the component itself. Support: 95%+ (baseline 2023). **`:has()`** — the first real parent selector in CSS: `.card:has(img)` — style a card that contains an image. Eliminates many JS-added utility classes. Watch perf — the selector can be expensive on large DOMs. Support: 94%+ (baseline 2023). **Subgrid** — `grid-template-columns: subgrid` inherits parent tracks. Solves "align 3 cards in a grid so header, body and footer match across cards" — previously required one giant grid. Support: 90%+ (baseline 2024). All three have `@supports` fallbacks but in 2026 are mostly safe.',
      },
      keyPoints: [
        { pl: 'Container queries = rozmiar rodzica, nie viewport', en: 'Container queries = parent size, not viewport' },
        { pl: '`:has()` = parent selector, uważaj na perf', en: '`:has()` = parent selector, watch perf' },
        { pl: 'Subgrid dziedziczy tracki rodzica', en: 'Subgrid inherits parent tracks' },
        { pl: 'Wsparcie 90%+ w 2026 — bezpieczne', en: 'Support 90%+ in 2026 — safe' },
        { pl: '`@supports` fallback gdy potrzeba', en: '`@supports` fallback when needed' },
      ],
    },

    {
      id: 'mk-system-design-autocomplete',
      cat: 'system-design',
      difficulty: 'hard',
      timeSec: 300,
      topic: { pl: 'System design: autocomplete 1M produktów', en: 'System design: autocomplete 1M products' },
      q: {
        pl: 'Zaprojektuj autocomplete dla sklepu z 1M produktów. Backend ma limit 100 req/s (globalny). Co robisz po stronie frontendu, żeby UX był dobry i nie zabić API? Jakie edge case\'y?',
        en: 'Design autocomplete for a 1M-product store. Backend has a 100 req/s global limit. What do you do on the frontend to get good UX without killing the API? What edge cases?',
      },
      model: {
        pl: 'FR (functional requirements): wyniki w ≤300 ms, top 10 dopasowań, highlight matchu, keyboard nav, historia ostatnich 5 zapytań. NFR: klient nie przekracza 1-2 req/s per user (globalnie 100 to ~50 aktywnych userów maksimum). Frontend stack: signal input + toObservable + `debounceTime(300)` + `distinctUntilChanged()` + `filter(q => q.length >= 2)` + `switchMap(q => fetch(q, { signal: abortCtrl.signal }))`. switchMap + AbortController eliminuje race condition i cancel w locie. LRU cache 50 zapytań w memory — powtórne „iph" nie strzela do API. Persistent cache w IndexedDB dla popularnych zapytań. Pre-fetch top 100 popularnych zapytań z SSR/edge do pamięci przy page load. Edge cases: (a) slow network → optimistic skeleton loading; (b) error → cached result z banerem „offline"; (c) user szybko pisze i kasuje → debounce + distinct; (d) empty result → „nie znaleziono" + sugestie popularnych; (e) special chars / XSS → escape w highlight; (f) typo tolerance → backend fuzzy search (ale to ich robota). Graceful degradation: gdy 429 z backendu, zwiększam debounce do 500 ms + pokazuję baner „chwilowo wolniej".',
        en: 'FR (functional requirements): results in ≤300 ms, top 10 matches, match highlighting, keyboard nav, last-5 search history. NFR: client stays within 1–2 req/s per user (global 100 ≈ 50 active users max). Frontend stack: signal input + toObservable + `debounceTime(300)` + `distinctUntilChanged()` + `filter(q => q.length >= 2)` + `switchMap(q => fetch(q, { signal: abortCtrl.signal }))`. switchMap + AbortController kills race conditions and cancels in-flight. LRU cache of 50 queries in memory — repeat "iph" doesn\'t hit the API. Persistent cache in IndexedDB for popular queries. Pre-fetch top 100 popular queries from SSR/edge into memory on page load. Edge cases: (a) slow network → optimistic skeleton loading; (b) error → cached result with "offline" banner; (c) user types-and-deletes fast → debounce + distinct; (d) empty result → "not found" + popular suggestions; (e) special chars / XSS → escape in highlight; (f) typo tolerance → backend fuzzy search (their job). Graceful degradation: on 429 from backend, bump debounce to 500 ms + show "temporarily slower" banner.',
      },
      keyPoints: [
        { pl: 'debounce 300ms + distinctUntilChanged + filter(len>=2)', en: 'debounce 300ms + distinctUntilChanged + filter(len>=2)' },
        { pl: 'switchMap + AbortController — race condition fix', en: 'switchMap + AbortController — race condition fix' },
        { pl: 'LRU cache in-memory + IndexedDB dla popularnych', en: 'LRU cache in-memory + IndexedDB for popular queries' },
        { pl: 'Pre-fetch top queries w SSR/edge', en: 'Pre-fetch top queries via SSR/edge' },
        { pl: 'Edge cases: slow net, 429, XSS, empty, typo', en: 'Edge cases: slow net, 429, XSS, empty, typo' },
        { pl: 'Graceful degradation: banner + zwiększone debounce', en: 'Graceful degradation: banner + bumped debounce' },
      ],
    },

    {
      id: 'mk-behavioral-tech-decision',
      cat: 'behavioral',
      difficulty: 'medium',
      timeSec: 240,
      topic: { pl: 'STAR: największa decyzja techniczna', en: 'STAR: biggest technical decision' },
      q: {
        pl: 'Opowiedz o największej decyzji technicznej, którą podjęłaś ostatnio. Użyj struktury STAR (Situation — Task — Action — Result).',
        en: 'Tell me about the biggest technical decision you made recently. Use STAR structure (Situation — Task — Action — Result).',
      },
      model: {
        pl: '**S (Situation):** Zespół odziedziczył aplikację Angular v11 z NgModule, 60+ komponentów, bundle 2.4 MB, LCP 4.2 s, team 5 osób. Klient skarżył się na wolne ładowanie i czas do pierwszej interakcji. **T (Task):** Jako senior frontend byłam proszona o propozycję — migracja do nowego stacku vs optymalizacja w miejscu. Musiałam zdecydować i uzasadnić przed tech leadem i PO. **A (Action):** Przeanalizowałam bundle (source-map-explorer), zrobiłam 2-dniowe POC migracji jednego modułu do v19+standalone+signals. Przedstawiłam 2 opcje z metrykami: opcja A (in-place: ~20% win, 2 sprinty) vs opcja B (pełna migracja: ~45% win, 6 sprintów + benefit techniczny długoterminowo). Zebrałam feedback od zespołu. Zaproponowałam opcję B w 5 fazach (v11→v14→v17→v19; standalone; signals; control flow; zoneless). Napisałam migration guide, zrobiłam wewnętrzne szkolenie 1h, pair-programowałam pierwszą fazę z 2 midami. Code review każdej fazy, regression tests przed każdym merge. **R (Result):** Bundle 2.4 → 1.3 MB (-46%), LCP 4.2 → 1.8 s (-57%), INP z 180 ms → 65 ms. Zero regresji w prod przez 3 miesiące. Dwóch midów wyszło z migracji jako samodzielni w nowym Angularze. Team adopcja — nowy kod już tylko w nowym stacku. Zyskałam też nową perspektywę, że „big bang migration" zabiłby projekt; fazowanie + metryki to klucz.',
        en: '**S (Situation):** The team inherited an Angular v11 app with NgModules, 60+ components, 2.4 MB bundle, 4.2 s LCP, 5-person team. The client complained about slow loading and time-to-interactive. **T (Task):** As senior frontend, I was asked to propose — migrate the stack vs optimize in place. I had to decide and defend it to the tech lead and PO. **A (Action):** I analysed the bundle (source-map-explorer), did a 2-day POC migrating one module to v19+standalone+signals. Presented 2 options with metrics: A (in-place: ~20% win, 2 sprints) vs B (full migration: ~45% win, 6 sprints + long-term tech benefit). Collected team feedback. Proposed option B in 5 phases (v11→v14→v17→v19; standalone; signals; control flow; zoneless). Wrote a migration guide, ran a 1h internal workshop, pair-programmed phase 1 with 2 mids. Code review every phase, regression tests before every merge. **R (Result):** Bundle 2.4 → 1.3 MB (−46%), LCP 4.2 → 1.8 s (−57%), INP 180 ms → 65 ms. Zero prod regressions for 3 months. Two mids came out of the migration self-sufficient in modern Angular. New code now only in the modern stack. I also took away the lesson that a "big bang migration" would have killed the project; phasing + metrics is the key.',
      },
      keyPoints: [
        { pl: 'Struktura STAR jasno zarysowana', en: 'STAR structure clearly laid out' },
        { pl: 'Konkretne metryki (bundle, LCP, INP)', en: 'Concrete metrics (bundle, LCP, INP)' },
        { pl: 'Decyzja między opcjami z trade-offami', en: 'Decision between options with trade-offs' },
        { pl: 'Angle zespołowy — mentoring, workshop, pairing', en: 'Team angle — mentoring, workshop, pairing' },
        { pl: 'Lesson learned — samorefleksja', en: 'Lesson learned — self-reflection' },
      ],
    },

    {
      id: 'mk-camunda-tasklist',
      cat: 'camunda',
      difficulty: 'hard',
      timeSec: 300,
      topic: { pl: 'Integracja Angular z Camunda Tasklist', en: 'Angular ↔ Camunda Tasklist integration' },
      q: {
        pl: 'Zaprojektuj komponent Angular dla Camunda Tasklist: lista user-tasków operatora KYC, claim + complete, integracja z process variables, optimistic UI i obsługa stale-data (inny operator claimnął zadanie).',
        en: 'Design an Angular component for Camunda Tasklist: list of KYC operator user tasks, claim + complete, integration with process variables, optimistic UI and stale-data handling (another operator already claimed the task).',
      },
      model: {
        pl: 'Architektura: **facade service** (`TasklistService`) — cienki wrapper na Camunda REST (`/task?assignee=me&active=true`, `/task/{id}/claim`, `/task/{id}/submit-form`, `/task/{id}/variables`). Stan w signalach: `tasks = signal<Task[]>([])`, `loading`, `error`, `selectedId`. **Komponent listy** — `@for (t of tasks(); track t.id)` z OnPush, badge priority z process variable `priority` z form-variables. **Polling** — `interval(15_000).pipe(startWith(0), switchMap(...))` + `takeUntilDestroyed()`; przy focus tabu od razu refresh (`fromEvent(window, "focus")`). **Claim flow** — optimistic: od razu ustawiam `task.assignee = me` lokalnie + send request; na 409 (już claimnięty) — rollback + toast „Zadanie już przypisane do X" + re-fetch listy. **Complete** — form dynamicznie generowany z `formKey` (embedded: mapuję JSON formKey → Angular Reactive Forms; albo iframe dla Camunda Forms). Submit wysyła `variables: { decision: "approve", reason: "..." }` w formacie Camunda (`{ value, type: "String" }`). **Stale data** — ETag/version w process variables, przy complete sprawdzam — jeśli zmieniły się, pokazuję diff + „Inny operator edytował, zaakceptuj zmianę". **Audit** — każdy claim/complete leci też do osobnego endpointu analytics (operator_id, duration, outcome).',
        en: 'Architecture: **facade service** (`TasklistService`) — thin wrapper over Camunda REST (`/task?assignee=me&active=true`, `/task/{id}/claim`, `/task/{id}/submit-form`, `/task/{id}/variables`). State in signals: `tasks = signal<Task[]>([])`, `loading`, `error`, `selectedId`. **List component** — `@for (t of tasks(); track t.id)` with OnPush, priority badge from `priority` process variable. **Polling** — `interval(15_000).pipe(startWith(0), switchMap(...))` + `takeUntilDestroyed()`; refresh on tab focus (`fromEvent(window, "focus")`). **Claim flow** — optimistic: set `task.assignee = me` locally and send request; on 409 (already claimed) — rollback + toast "already assigned to X" + re-fetch list. **Complete** — form generated dynamically from `formKey` (embedded: map JSON formKey → Angular Reactive Forms; or iframe for Camunda Forms). Submit sends `variables: { decision: "approve", reason: "..." }` in Camunda format (`{ value, type: "String" }`). **Stale data** — ETag/version in process variables, on complete I check — if changed, show diff + "another operator edited this, please accept". **Audit** — every claim/complete also fires an analytics endpoint (operator_id, duration, outcome).',
      },
      keyPoints: [
        { pl: 'Facade service + REST (task, claim, submit-form)', en: 'Facade service + REST (task, claim, submit-form)' },
        { pl: 'Polling + refresh on window focus', en: 'Polling + refresh on window focus' },
        { pl: 'Optimistic claim + 409 rollback + toast', en: 'Optimistic claim + 409 rollback + toast' },
        { pl: 'Process variables format: { value, type }', en: 'Process variables format: { value, type }' },
        { pl: 'Stale data: ETag / version check na complete', en: 'Stale data: ETag / version check on complete' },
        { pl: 'Audit analytics endpoint (operator_id, duration)', en: 'Audit analytics endpoint (operator_id, duration)' },
      ],
    },

    {
      id: 'mk-kyc-step-flow',
      cat: 'domain',
      difficulty: 'hard',
      timeSec: 300,
      topic: { pl: 'UI dla 5-krokowego KYC z asynchronicznymi krokami', en: 'UI for 5-step KYC with async backend steps' },
      q: {
        pl: 'Zaprojektuj UI dla 5-krokowego procesu KYC, w którym 2 kroki są asynchroniczne po stronie backendu (weryfikacja dokumentu ~30 s, AML/sanctions check do 5 min). Stepper, error-states, polling vs WebSocket, exit/resume flow.',
        en: 'Design UI for a 5-step KYC process where 2 steps are async on the backend (document verification ~30 s, AML/sanctions check up to 5 min). Stepper, error states, polling vs WebSocket, exit/resume flow.',
      },
      model: {
        pl: 'Kroki: (1) dane osobowe, (2) dokument tożsamości + selfie, (3) **async: OCR + face-match** (~30 s), (4) adres + źródło majątku, (5) **async: AML/sanctions/PEP check** (do 5 min). Stan kroku trzymam w signal store — enum `"pending" | "in-progress" | "needs-action" | "done" | "failed"`. **Stepper** (Angular Material Stepper albo własny) pokazuje 5 kółek; kolor z `--cat-domain`/success/error. **Async kroki** — nie blokuję UI: pokazuję progress bar z animacją + szacowany czas (z backendu, jeśli dostarczają, albo „zwykle ~30 s"). Polling `GET /kyc/{id}/status` co 3 s dla kroku 3, co 10 s dla kroku 5, z exponential backoff przy timeout 5+ min. **Preferred: SSE/WebSocket** — backend pushuje `{ step: 3, status: "done", result: {...} }`; fallback na polling gdy WS fail. **Exit/resume** — każdy krok autozapisuje state na backendzie (`PATCH /kyc/{id}`); user może wyjść i wrócić za dzień — route param `/kyc/:id/step/:n` + reducer ładujący state z backendu. **Error states**: (a) doc rejected → pokazuje powód („blur", „wygasły") + retake button, (b) AML hit → „nasz zespół skontaktuje się do 24h" + ticket id, (c) network loss → baner + zachowanie formularza w IndexedDB (resume offline-first), (d) timeout → „to zajmuje dłużej niż zwykle, wyślemy email". **A11y** — `aria-live="polite"` dla statusu polling, focus na błąd po submit.',
        en: 'Steps: (1) personal data, (2) ID document + selfie, (3) **async: OCR + face-match** (~30 s), (4) address + source of funds, (5) **async: AML/sanctions/PEP check** (up to 5 min). Step state in signal store — enum `"pending" | "in-progress" | "needs-action" | "done" | "failed"`. **Stepper** (Angular Material or custom) shows 5 circles; colors from `--cat-domain`/success/error. **Async steps** — don\'t block UI: progress bar with animation + estimated time (from backend if provided, else "usually ~30 s"). Polling `GET /kyc/{id}/status` every 3 s for step 3, every 10 s for step 5, with exponential backoff on 5+ min timeout. **Preferred: SSE/WebSocket** — backend pushes `{ step: 3, status: "done", result: {...} }`; fall back to polling if WS fails. **Exit/resume** — every step auto-saves on backend (`PATCH /kyc/{id}`); user can leave and resume a day later — route `/kyc/:id/step/:n` + reducer loading state from backend. **Error states**: (a) doc rejected → reason ("blur", "expired") + retake button, (b) AML hit → "our team will contact you within 24h" + ticket id, (c) network loss → banner + form snapshot in IndexedDB (resume offline-first), (d) timeout → "taking longer than usual, we\'ll email you". **A11y** — `aria-live="polite"` for polling status, focus on error after submit.',
      },
      keyPoints: [
        { pl: 'Stepper + enum status per-step', en: 'Stepper + per-step status enum' },
        { pl: 'SSE/WebSocket z fallback na polling', en: 'SSE/WebSocket with polling fallback' },
        { pl: 'Progress + estimated time z backendu', en: 'Progress + estimated time from backend' },
        { pl: 'Autosave backend + IndexedDB offline', en: 'Autosave to backend + IndexedDB offline' },
        { pl: 'Exit/resume via route param + backend state', en: 'Exit/resume via route param + backend state' },
        { pl: 'Error UX: retake, ticket-id, email fallback', en: 'Error UX: retake, ticket-id, email fallback' },
        { pl: 'A11y: aria-live, focus on error', en: 'A11y: aria-live, focus on error' },
      ],
    },

    {
      id: 'mk-aml-alert-ux',
      cat: 'domain',
      difficulty: 'medium',
      timeSec: 240,
      topic: { pl: 'UX dla operatora AML — 200 alertów dziennie', en: 'AML operator UX — 200 alerts/day' },
      q: {
        pl: 'Operator AML dostaje 200 alertów dziennie. Zaprojektuj UI priorytetyzacji, bulk-actions, case history. Plus krótki STAR: opowiedz o momencie, gdy musiałaś wytłumaczyć decyzję techniczną w regulated industry.',
        en: 'An AML operator receives 200 alerts/day. Design UI for prioritization, bulk actions, case history. Plus short STAR: tell me about a time you had to explain a technical decision in a regulated industry.',
      },
      model: {
        pl: '**UI**: lista-tabela z priorytetem (kolor = `critical/high/medium/low` z backendu na podstawie risk-score 0-100), sticky filters (status, risk-band, assigned-to, rule-triggered). Domyślny sort: risk-score desc, potem SLA-deadline asc. Każdy wiersz: risk-badge + client-name + alert-reason-chip + time-since-open + SLA countdown (czerwony gdy <2h). **Bulk actions** — select-all-on-page + select-by-filter, operacje: „assign to me/other", „close as false-positive with reason", „escalate to L2" — zawsze wymagany comment (audit trail). Potwierdzenie modal z listą ID-ów (nie tylko liczba) i checkboxem „I confirm this action is based on full case review". **Case view** — split screen: lewo chronologia (timeline: alert → prev-transactions → KYC-changes → screening-hits), prawo aktualny alert + rule-explanation + similar-cases. Keyboard shortcuts (J/K nawigacja, A=approve, R=reject, E=escalate). **Audit** — każda akcja loguje `{operator_id, case_id, action, before_state, after_state, comment, timestamp}` — regulator wymaga (GIIF, KNF). **STAR**: S — startup fintech, wdrażałam Angular signal-store zamiast NgRx; klient finansowy skeptyczny („tested=safe"). T — uzasadnić przed compliance-architect i CTO. A — wewnętrzny doc: 3 kryteria (bundle, learning curve, auditability); porównanie 1:1 NgRx vs SignalStore; POC w feature gdzie czas do merge spadł z 5 dni → 2; pokazałam że SignalStore ma full immutability + time-travel via Redux DevTools (same gwarancje); pokazałam produkcje z SignalStorem (innego banku). R — zgoda, migrated in 2 sprinty, 30% mniej LoC w state-layer, nowy junior onboardował się w 2 dni zamiast 2 tyg. Lesson — w regulowanej branży argumentuj *traceability* i *precedens*, nie tylko „szybciej/lepiej".',
        en: '**UI**: table list with priority (color = `critical/high/medium/low` from backend risk-score 0–100), sticky filters (status, risk-band, assigned-to, rule-triggered). Default sort: risk-score desc, then SLA-deadline asc. Each row: risk-badge + client-name + alert-reason-chip + time-since-open + SLA countdown (red when <2h). **Bulk actions** — select-all-on-page + select-by-filter; actions: "assign to me/other", "close as false-positive with reason", "escalate to L2" — always require comment (audit trail). Confirmation modal lists IDs (not just count) with a checkbox "I confirm this action is based on full case review". **Case view** — split screen: left chronology (timeline: alert → prev-transactions → KYC-changes → screening-hits), right current alert + rule-explanation + similar-cases. Keyboard shortcuts (J/K nav, A=approve, R=reject, E=escalate). **Audit** — every action logs `{operator_id, case_id, action, before_state, after_state, comment, timestamp}` — regulator requires (GIIF, KNF). **STAR**: S — fintech startup, I was rolling out Angular signal-store instead of NgRx; finance-minded client skeptical ("tested=safe"). T — justify to compliance-architect and CTO. A — internal doc: 3 criteria (bundle, learning curve, auditability); side-by-side NgRx vs SignalStore; POC in a feature where time-to-merge dropped 5 days → 2; showed SignalStore has full immutability + time-travel via Redux DevTools (same guarantees); showed prod usage at another bank. R — approved, migrated in 2 sprints, 30% fewer LoC in state-layer, a new junior onboarded in 2 days instead of 2 weeks. Lesson — in a regulated industry argue *traceability* and *precedent*, not just "faster/better".',
      },
      keyPoints: [
        { pl: 'Priorytet: risk-score + SLA-deadline', en: 'Priority: risk-score + SLA-deadline' },
        { pl: 'Bulk actions z wymagalnym komentarzem (audit)', en: 'Bulk actions with mandatory comment (audit)' },
        { pl: 'Case timeline: alert + prev-tx + KYC changes', en: 'Case timeline: alert + prev-tx + KYC changes' },
        { pl: 'Keyboard shortcuts dla power-usera', en: 'Keyboard shortcuts for power user' },
        { pl: 'Audit log format: before/after + comment', en: 'Audit log format: before/after + comment' },
        { pl: 'STAR: argumentacja przez traceability + precedens', en: 'STAR: argue via traceability + precedent' },
      ],
    },
  ];

  window.MOCK_DATA = Q;
})();
