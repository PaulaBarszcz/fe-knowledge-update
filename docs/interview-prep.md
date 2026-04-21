# Przygotowanie do rozmowy — Senior Frontend (Angular 21)

> Dokument bazowy pod kolejne zadania (fiszki, quizy, rozszerzenia aplikacji `paula-pzu`).
> Stanowisko: **Senior Frontend Developer**. Główny stack: **Angular 21**, TypeScript, RxJS, SCSS, mikrofrontendy.
> Każde zagadnienie ma: krótkie wyjaśnienie → kluczowe koncepty → przykładowe pytania rekrutacyjne → szkic odpowiedzi/kod.

---

## Spis treści

1. [Angular 21 — rdzeń](#1-angular-21--rdzeń)
2. [TypeScript i JavaScript ES6+](#2-typescript-i-javascript-es6)
3. [HTML5, CSS3, SCSS, architektury CSS](#3-html5-css3-scss-architektury-css)
4. [RxJS](#4-rxjs)
5. [REST API, WebSockets, HTTP](#5-rest-api-websockets-http)
6. [Git, Node.js, npm](#6-git-nodejs-npm)
7. [Testy jednostkowe (Jest / Vitest)](#7-testy-jednostkowe-jest--vitest)
8. [Bundlery (Webpack, Vite, esbuild)](#8-bundlery-webpack-vite-esbuild)
9. [Mikrofrontendy (Module Federation, Web Components)](#9-mikrofrontendy-module-federation-web-components)
10. [Wzorce projektowe i dobre praktyki](#10-wzorce-projektowe-i-dobre-praktyki)
11. [Agile / Scrum](#11-agile--scrum)
12. [Decyzje techniczne i odpowiedzialność seniora](#12-decyzje-techniczne-i-odpowiedzialność-seniora)
13. [System Design — frontendowy](#13-system-design--frontendowy)
14. [Live coding — typowe zadania](#14-live-coding--typowe-zadania)
15. [Pytania behawioralne (STAR)](#15-pytania-behawioralne-star)
16. [Pytania do rekrutera / firmy](#16-pytania-do-rekrutera--firmy)
17. [Materiały dodatkowe](#17-materiały-dodatkowe)
18. [Stary vs nowy Angular — porównanie i migracja](#18-stary-vs-nowy-angular--porównanie-i-migracja)
19. [Connectis (Frontend Angular / bank) — cheat sheet pod rozmowę](#19-connectis-frontend-angular--bank--cheat-sheet-pod-rozmowę)

---

## 1. Angular 21 — rdzeń

Angular 21 to dojrzała odsłona po rewolucji Signals (v16+), Zoneless (stable w v20/21) i Deferrable Views (v17). Senior powinien rozumieć **różnicę między starym a nowym Angularem**, umieć uzasadnić migrację oraz mieć praktyczne zdanie nt. zone.js, NgModules vs standalone, RxJS vs Signals.

### 1.1 Komponenty standalone i architektura

**Kluczowe koncepty**
- `standalone: true` jest **domyślny** od Angulara 19 — `NgModule` dalej działa, ale nowy kod piszemy bez modułów.
- Importujemy wprost komponenty/dyrektywy/pipes w `imports: [...]`.
- `bootstrapApplication(AppComponent, { providers: [...] })` zamiast `AppModule`.
- Routing: `provideRouter(routes, withComponentInputBinding(), withViewTransitions())`.
- `provideHttpClient(withInterceptors([...]), withFetch())` — funkcyjne interceptory.

**Przykładowe pytania**
1. Co dało przejście na standalone components?
2. Kiedy jeszcze sensownie użyć `NgModule`?
3. Jak zmigrować aplikację z NgModules do standalone?

**Szkic odpowiedzi**
- Mniej boilerplate'u, lepsze tree-shaking, prostszy graf zależności, ułatwione lazy loading (`loadComponent`), łatwiejsze testy.
- Moduły wciąż bywają użyteczne do **feature module jako publiczne API** dla bibliotek Nx/monorepo, albo gdy ekosystem (np. stare biblioteki) ich wymaga.
- Migracja: schematic `ng generate @angular/core:standalone` przechodzi w trzech krokach (convert components → routes → remove NgModules).

```ts
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
});
```

---

### 1.2 Signals, computed, effect, linkedSignal, resource

**Kluczowe koncepty**
- `signal<T>(initial)` — reaktywny kontener wartości. Odczyt przez wywołanie: `count()`.
- `computed(() => ...)` — memoizowana, leniwa pochodna; śledzi zależności automatycznie.
- `effect(() => ...)` — side-effects reagujące na sygnały; uruchamia się poza change detection, ma `onCleanup`.
- `linkedSignal(...)` — writable signal zsynchronizowany z innym źródłem (np. reset po zmianie filtru).
- `resource({ request, loader })` / `rxResource(...)` — reaktywne ładowanie danych (signal-first zamiennik dla klasycznych Observables w komponentach).
- `input()`, `input.required()`, `model()`, `output()`, `viewChild()`, `contentChild()` — sygnałowe odpowiedniki dekoratorów.
- Interop: `toSignal(observable$)`, `toObservable(signal)`.

**Przykładowe pytania**
1. Czym różni się `computed` od `effect`? Kiedy użyć którego?
2. Jak uniknąć "infinite loops" w `effect`?
3. Kiedy wybrać Signal, a kiedy Observable?

**Szkic odpowiedzi**
- `computed` = **derivacja wartości** (pure, memo). `effect` = **reakcja na zmianę** (side-effect: DOM manipulacja poza szablonem, logowanie, sync do localStorage).
- Pętle: nie modyfikuj sygnałów, które `effect` czyta, bez `untracked(...)`; Angular w dev mode rzuci błąd.
- **Signals**: stan lokalny komponentu, derywacje, UI-state. **Observables**: strumienie zdarzeń, HTTP, WebSockets, złożona kompozycja operatorów. Granica: HTTP zwraca `Observable`, ale w komponencie często konwertujemy `toSignal`.

```ts
@Component({...})
export class CartComponent {
  items = signal<Item[]>([]);
  total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));

  constructor() {
    effect((onCleanup) => {
      const subscription = interval(1000).subscribe(() => this.sync());
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
```

---

### 1.3 Change detection: Zoneless i OnPush

**Kluczowe koncepty**
- Historycznie: `zone.js` monkey-patchuje async API (setTimeout, XHR, addEventListener) → Angular wie, kiedy puścić CD.
- **Zoneless** (stable w v20+): `provideZonelessChangeDetection()` — brak zone.js w bundle, mniejszy rozmiar, lepszy debug stack traces. CD odpalane przez **signals** i jawne API (`markForCheck` z async pipe).
- `ChangeDetectionStrategy.OnPush` — komponent sprawdzany tylko gdy: zmieni się `@Input` (reference equality), emituje event w szablonie, async pipe wypluje wartość, sygnał używany w template zostanie zaktualizowany.
- `ChangeDetectorRef`: `markForCheck()`, `detectChanges()`, `detach()`, `reattach()`.

**Przykładowe pytania**
1. Co się stanie jeśli w Zoneless mutujesz tablicę przez `push` i nie aktualizujesz sygnału?
2. Jakie pułapki OnPush widziałaś w praktyce?
3. Kiedy `detach()` ma sens?

**Szkic odpowiedzi**
- Mutacja bez zmiany referencji/sygnału = brak re-renderu. Dlatego: **immutability** lub `signal.update(arr => [...arr, item])`.
- Pułapki OnPush: mutowane inputy (nie wykryje), Observable poza async pipe bez `markForCheck`, komponenty trzecich stron, które liczą na zone.js.
- `detach` — heavy widgety (canvas, wykresy, virtual scrolling), gdzie ręcznie sterujemy `detectChanges` przy animacji.

---

### 1.4 Nowy control flow: `@if`, `@for`, `@switch`, `@defer`, `@let`

**Kluczowe koncepty**
- `@if / @else if / @else` zastępuje `*ngIf`; wspiera local aliasing (`@if (user(); as u) {...}`).
- `@for (item of items(); track item.id)` — `track` jest **wymagany**, daje dużo lepszy performance niż `trackBy`.
- `@switch / @case / @default` — zwartsze i czytelniejsze niż `ngSwitch`.
- `@defer` — deferrable views: lazy load fragmentu UI z triggerami (`on idle`, `on viewport`, `on hover`, `on interaction`, `when condition()`), z `@placeholder`, `@loading`, `@error`.
- `@let name = expr;` — lokalna zmienna w template, obliczana raz per CD, nie tworzy widoku.

**Przykładowe pytania**
1. Dlaczego `track` jest wymagany w `@for`?
2. Jakie triggery `@defer` znasz i kiedy który?
3. Czym różni się `@defer` od `loadComponent` w routerze?

**Szkic odpowiedzi**
- Bez `track` Angular musiałby re-renderować wszystko przy każdej zmianie tablicy; wymóg `track` to performance-by-default.
- Triggery: `on idle` (pomocniczy widget), `on viewport` (below-the-fold section), `on hover/interaction` (tooltip, modal), `when signal()` (warunek logiczny).
- `loadComponent` = cały route; `@defer` = **fragment komponentu** (np. sekcja "rekomendacje" na stronie produktu).

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-recommendations [productId]="id()" />
} @placeholder {
  <app-skeleton />
} @loading (minimum 300ms) {
  <app-spinner />
} @error {
  <p>Nie udało się załadować</p>
}
```

---

### 1.5 Dependency Injection

**Kluczowe koncepty**
- `inject()` zamiast konstruktora: czytelniejsze, działa w funkcjach (guardach, resolverach, interceptorach).
- Hierarchia: `root` → `platform` → `environment` → `component`. Dziecko może nadpisać providera rodzica.
- `InjectionToken` dla niewidocznych przez typ zależności (config, tokeny stringowe).
- `providedIn: 'root'` + tree-shakable providers; `useFactory`, `useValue`, `useExisting`, `useClass`, `multi: true`.
- `HostAttributeToken` (v18+), `@Self()`, `@SkipSelf()`, `@Optional()`, `@Host()`.

**Przykładowe pytania**
1. Różnica między `providedIn: 'root'` a `providers: []` w komponencie.
2. Kiedy user `multi: true`?
3. Jak przekazać konfigurację do biblioteki przez DI?

**Szkic odpowiedzi**
- `root` = singleton aplikacji; `providers` w komponencie = nowa instancja per komponent (przydatne dla state-per-instance).
- `multi: true` — `HTTP_INTERCEPTORS`, `APP_INITIALIZER`, własne "extension points".
- `export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');` + `{ provide: APP_CONFIG, useValue: {...} }`.

```ts
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.token()}` } }));
};
```

---

### 1.6 Routing

**Kluczowe koncepty**
- Funkcyjne guardy/resolvery: `CanActivateFn`, `CanMatchFn`, `ResolveFn`, `CanDeactivateFn`.
- Lazy: `loadComponent: () => import('./page').then(m => m.PageComponent)` lub `loadChildren` z routes.
- `withComponentInputBinding()` — parametry routa wstrzykiwane jako `@Input` / `input()` komponentu.
- `withViewTransitions()` — natywne View Transitions API.
- `Router.events` → `toSignal` dla bieżącego URL.
- `Title`, `Meta` + `data: { title: '...' }` + custom `TitleStrategy`.
- `NavigationEnd`, `GuardsCheckEnd` — obserwacja cyklu.

**Przykładowe pytania**
1. Różnica między `CanActivate` a `CanMatch`?
2. Jak zrobić preload lazy modułów?
3. Jak przekazywać dane między routami bez query-paramów?

**Szkic odpowiedzi**
- `CanActivate` = "czy mogę wejść na ten route" (odpalane po match). `CanMatch` = "czy ten config routes w ogóle pasuje do URL" (wcześniej, potrafi pominąć lazy load). Dla auth + role routing lepszy `CanMatch`.
- `withPreloading(PreloadAllModules)` albo własna strategia — preload tylko tras oznaczonych flagą `data.preload = true`.
- `Router.getCurrentNavigation().extras.state` albo usługa ze signalem (state shared w pamięci), bo query-params są publiczne i bookmarkable.

---

### 1.7 Formularze

**Kluczowe koncepty**
- **Reactive Forms**: `FormControl`, `FormGroup`, `FormArray`, `FormBuilder`, `NonNullableFormBuilder` (typed od v14).
- **Template-driven**: `[(ngModel)]`, `FormsModule` — prostsze, ale mniej kontroli.
- **Signal Forms** (nowe API Angular 21, signal-first): alternatywa dla Reactive Forms z pełną integracją sygnałów.
- Walidatory: synchroniczne i async, composable.
- Cross-field validation: walidator na poziomie `FormGroup`.
- `updateOn: 'blur' | 'submit'` — kontrola częstotliwości walidacji.

**Przykładowe pytania**
1. Jak typowo podejść do dużego formularza wizard (5 kroków, walidacje krzyżowe)?
2. Jak zrobić custom walidator async (np. unikalność username)?
3. Reactive vs Template-driven — twoja rekomendacja dla senior projektu.

**Szkic odpowiedzi**
- Wizard: każdy krok to `FormGroup`, cały to `FormGroup<{ step1, step2, ... }>`, nawigacja przez sygnał `currentStep = signal(0)`, walidacja przy przejściu `if (stepForm.invalid) stepForm.markAllAsTouched()`. Stan trzymany w serwisie, odporny na odświeżenie (session/localStorage).
- `AsyncValidatorFn` + `debounceTime` + `distinctUntilChanged` + `switchMap` (anulowanie poprzedniego requestu) + `catchError(() => of(null))`.
- Reactive — zawsze dla senior projektu. Typy, testowalność, composition, RxJS-friendly.

```ts
private fb = inject(NonNullableFormBuilder);
form = this.fb.group({
  email: ['', [Validators.required, Validators.email], [this.uniqueEmailValidator()]],
  passwords: this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  }, { validators: passwordsMatch }),
});
```

---

### 1.8 Lazy loading i code splitting

**Kluczowe koncepty**
- `loadComponent` (standalone) i `loadChildren` (routes).
- `@defer` dla fragmentów komponentu.
- Dynamic imports w kodzie: `const { heavyFn } = await import('./heavy')`.
- Preload strategies: `PreloadAllModules`, custom strategies.
- Podział bundla: initial / per-route / per-defer-block.

**Przykładowe pytania**
1. Jak zweryfikować, że lazy load faktycznie działa?
2. Kiedy preload ma sens, a kiedy jest szkodliwy?
3. Różnica między `loadComponent` a `@defer`.

**Szkic odpowiedzi**
- DevTools → Network → filtruj JS → odtwórz nawigację → oczekuj oddzielnego chunka. W build stats `ng build --stats-json` + analyzer.
- Preload dobry na szybkich sieciach i częstych ścieżkach. Szkodliwy: mobile + metered connection → zużywa transfer i baterie. Custom strategy z `navigator.connection.saveData`.
- `loadComponent` = cały route, wymaga nawigacji. `@defer` = fragment w obrębie komponentu, wypłyala na trigger.

---

### 1.9 Optymalizacja wydajności

**Kluczowe koncepty**
- **Bundle size**: esbuild application builder (v17+), tree-shaking, `ng build --stats-json`, source-map-explorer / rollup-plugin-visualizer.
- **Runtime**: OnPush, signals, `@defer`, `@for track`, `trackBy` (legacy), virtual scrolling (`@angular/cdk/scrolling`).
- **Rendering**: SSR + hydration (incremental od v19), prerender (SSG), Angular Universal.
- **Images**: `NgOptimizedImage` — lazy loading, priorytetowe LCP, srcset, placeholder.
- **CD**: Zoneless, `runOutsideAngular` dla ciężkich pętli, `afterNextRender`, `afterRender`.
- **Network**: `HttpClient` z `withFetch`, interceptor cache, `shareReplay`, HTTP/2 multiplexing.
- **Web Vitals**: LCP < 2.5s, CLS < 0.1, INP < 200ms.

**Przykładowe pytania**
1. Strona ładuje się 5s. Jakie pierwsze 5 kroków?
2. Jak zoptymalizować listę 10 000 elementów?
3. Co to jest incremental hydration i kiedy pomaga?

**Szkic odpowiedzi**
- (1) Lighthouse/WebPageTest → zidentyfikuj wąskie gardło (LCP vs TBT vs CLS). (2) Bundle analyzer → odciąć zależności / lazy load. (3) SSR + preconnect/DNS-prefetch. (4) `NgOptimizedImage` dla LCP-image. (5) OnPush + sygnały + `@defer` dla below-the-fold.
- Virtual scrolling (`<cdk-virtual-scroll-viewport>`), OnPush, signals zamiast ngFor ze zwykłą tablicą, `track` po id, memoizacja ciężkich obliczeń w `computed`.
- Incremental hydration = hydruje tylko fragmenty, które są potrzebne (np. po kliknięciu w widok) zamiast całego drzewa. Przydatne dla stron dużo statycznych z kilkoma interaktywnymi wyspami.

---

### 1.10 SSR, hydration, SSG

**Kluczowe koncepty**
- `@angular/ssr` (v17+), `provideClientHydration()`.
- Hydration: klient "podpina" się pod już wyrenderowany HTML bez re-renderu.
- Incremental hydration (v19+), event replay.
- `afterRender` vs `afterNextRender` — kod wyłącznie client-side.
- `isPlatformBrowser(platformId)` — guard dla window/document.
- Prerender: lista tras generowana na build, statyczny HTML.

**Przykładowe pytania**
1. Jak SSR wpływa na SEO i LCP?
2. Dlaczego hydration mismatch jest problemem?
3. Jak obsłużyć `localStorage` przy SSR?

**Szkic odpowiedzi**
- SEO: boty Google zjadają CSR, ale i tak SSR daje lepszy time-to-first-byte-content i lepszy LCP (serwer renderuje HTML od razu).
- Mismatch = serwer i klient wygenerowały inny DOM → hydration się psuje, Angular wypisuje warning i może zrobić full re-render → gorszy UX.
- `if (isPlatformBrowser(platformId)) localStorage.getItem(...)` lub abstrakcja `StorageService` z DI, która na serwerze jest no-op.

---

### 1.11 Interceptory, HttpClient, error handling

**Kluczowe koncepty**
- `HttpInterceptorFn` (funkcyjne od v15) — composable, łatwiejsze testy.
- Kolejność: `withInterceptors([auth, log, retry, cache])` — dokładnie w tej kolejności.
- `HttpContext` i `HttpContextToken` — metadane per-request (np. "skip auth").
- Globalny error handler: `ErrorHandler` + provider. Plus interceptor mapujący HTTP errors.
- `retry` / `retryWhen` (RxJS) dla transient errors.

**Przykładowe pytania**
1. Jak pokazać globalny toast na 401?
2. Jak ponowić request po odświeżeniu tokena?
3. Caching GET'ów — co rozważysz?

**Szkic odpowiedzi**
- Interceptor łapie `HttpErrorResponse` 401 → `ToastService.error(...)` + redirect na login.
- `catchError` + `switchMap(() => refreshToken$).pipe(switchMap(newToken => next(req.clone(...))))`. Ważne: zabezpieczyć przed storm of refresh (singleton refresh observable + `shareReplay(1)`).
- In-memory Map z TTL, `HttpContext` z flagą `CACHE_TTL`, oraz ETag/If-None-Match gdy API wspiera.

---

### 1.12 i18n i lokalizacja

**Kluczowe koncepty**
- Wbudowane `@angular/localize` + `i18n` w templatach, build per-locale.
- Trzecie strony: Transloco, ngx-translate (run-time switching bez per-locale bundle).
- ICU dla liczebników i rodzajów (PL ma złożone formy mnogie).
- `LOCALE_ID`, `registerLocaleData`, pipes `date`, `currency`, `number`.

**Przykładowe pytania**
1. Angular i18n vs ngx-translate — kiedy co?
2. Jak obsłużyć polskie formy mnogie?
3. Jak przetestować lokalizację w CI?

**Szkic odpowiedzi**
- Angular i18n: lepszy performance (brak runtime-overhead), build per locale. ngx-translate/Transloco: elastyczność, runtime switch bez przeładowania.
- ICU: `{count, plural, =1 {1 produkt} few {# produkty} many {# produktów} other {# produktu}}`.
- Snapshot testy z różnymi locale, e2e z ustawionym `LOCALE_ID`, build `ng build --localize` i sanity check artefaktów.

---

### 1.13 Dostępność (a11y)

**Kluczowe koncepty**
- Semantyczny HTML (nagłówki, `<button>` zamiast `<div onClick>`).
- `@angular/cdk/a11y`: `FocusMonitor`, `FocusTrap`, `LiveAnnouncer`, `HighContrastModeDetector`.
- ARIA: `aria-label`, `aria-live`, `aria-expanded`, `role`.
- Klawiatura: focus visible, tab order, `cdkTrapFocus` w modalach.
- Standards: WCAG 2.1/2.2 AA.

**Przykładowe pytania**
1. Jak zrobić dostępny modal?
2. Jak testować a11y?
3. Co to INP i jak wpływa na a11y/UX?

**Szkic odpowiedzi**
- Modal: `role="dialog"`, `aria-modal="true"`, trap focus (`cdkTrapFocus`), ESC zamyka, focus wraca na trigger, `aria-labelledby` wskazuje tytuł.
- Axe-core (jest-axe, cypress-axe), Lighthouse, screen reader manual test (NVDA / VoiceOver).
- INP (Interaction to Next Paint) zastąpił FID. Mierzy całkowity czas od inputu do następnej ramki. Powyżej 200ms → UX "zacina się".

---

## 2. TypeScript i JavaScript ES6+

### 2.1 System typów TypeScript

**Kluczowe koncepty**
- Podstawy: primitives, `unknown` vs `any`, `never`, union/intersection, literal types, `as const`.
- Generics, constraints (`extends`), default types, `keyof`, `typeof`, indexed access (`T[K]`).
- Utility types: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `ReturnType`, `Parameters`, `Awaited`, `NonNullable`.
- Conditional types, mapped types, template literal types.
- Type guards: `typeof`, `instanceof`, `in`, user-defined (`x is Foo`), `asserts`.
- `satisfies` — walidacja bez szerszego typu.
- Discriminated unions.
- Strict mode: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

**Przykładowe pytania**
1. `unknown` vs `any` — kiedy co?
2. Co robi `satisfies` i dlaczego jest lepsze od `as`?
3. Jak napisać typ `DeepReadonly<T>`?

**Szkic odpowiedzi**
- `any` = opt-out z typów, zabija safety. `unknown` = trzeba zawęzić przed użyciem (typed try/catch, parsowanie JSON). **Senior zawsze preferuje `unknown`.**
- `satisfies` sprawdza, że wartość pasuje do typu, ale **zachowuje wąski typ literalny**. `as` to cast (niebezpieczny, może zamaskować błąd).

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

const config = {
  theme: 'dark',
  features: { chat: true },
} satisfies AppConfig;
// typeof config.theme === 'dark' (literal, nie string!)
```

### 2.2 JavaScript — event loop i asynchroniczność

**Kluczowe koncepty**
- Call stack, Web APIs, callback queue (macrotasks), microtask queue.
- Microtasks: `Promise.then`, `queueMicrotask`, `MutationObserver`. Wykonują się **przed** kolejnym macrotask.
- Macrotasks: `setTimeout`, `setInterval`, I/O, UI rendering, `MessageChannel`.
- `requestAnimationFrame` — przed paint.
- `async/await` = cukier na Promises + generators.
- `AbortController` / `AbortSignal` — anulowanie fetch, timerów.

**Przykładowe pytania**
1. Kolejność wykonania: Promise vs setTimeout vs queueMicrotask.
2. Jak anulować fetch po 5 sekundach?
3. Co się stanie, gdy zrobisz `await` w pętli nad 1000 promise'ów?

**Szkic odpowiedzi**
```js
console.log('1');
setTimeout(() => console.log('2'));
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
// 1, 5, 3, 4, 2
```
```js
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 5000);
const res = await fetch(url, { signal: ctrl.signal });
```
- Sekwencyjnie — trwa suma wszystkich. Zamiast tego `Promise.all` (równolegle) lub `p-limit` dla concurrency (np. 10 na raz, żeby nie zabić serwera).

### 2.3 Closures, `this`, prototypy, klasy

**Kluczowe koncepty**
- Closure — funkcja "pamięta" scope, w którym powstała.
- `this` zależy od tego **jak** funkcja jest wywołana (nie gdzie zdefiniowana), chyba że arrow.
- Arrow functions nie mają własnego `this`, `arguments`, nie można użyć `new`.
- Prototype chain: `__proto__` vs `prototype`, `Object.create(null)`.
- `class` = cukier na funkcje konstruktory + prototypy; ES pole prywatne `#field`.

**Przykładowe pytania**
1. Jak działa `bind`?
2. Co to jest "lexical this"?
3. Dlaczego nie robić arrow jako metody klasy (czasami)?

### 2.4 Moduły ESM vs CommonJS

**Kluczowe koncepty**
- ESM: `import`/`export`, statyczne, wspiera tree-shaking, top-level await.
- CJS: `require`/`module.exports`, dynamiczne, bez tree-shaking.
- Node.js: `"type": "module"` w package.json → ESM; `.cjs` / `.mjs`.
- Dual package hazard, interop (`import defaultFn from 'cjs-pkg'`).

**Przykładowe pytania**
1. Dlaczego ESM jest preferowany w nowych projektach?
2. Co to jest dual package hazard?
3. Jak jedna biblioteka może eksportować ESM i CJS?

### 2.5 Pythagoras TypeScript w projekcie

**Praktyki**
- `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- Brand types do ID-ków: `type UserId = string & { __brand: 'UserId' }`.
- Type-only imports: `import type { Foo }` — lepszy tree-shaking.
- Generics zamiast `any`, `unknown` zamiast `any` na granicy systemu.
- Enums → `const` objects (`as const`) dla mniejszego JS.

---

## 3. HTML5, CSS3, SCSS, architektury CSS

### 3.1 HTML5 — semantyka i a11y

**Kluczowe koncepty**
- Semantyczne tagi: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<figure>`.
- Formularze: `<label for>`, `<fieldset>`, `<legend>`, `<output>`, typy input (`email`, `number`, `date`, `search`), `autocomplete`.
- `<dialog>` natywny, `<details>`/`<summary>`.
- Meta: viewport, OpenGraph, canonical.
- ARIA jako uzupełnienie, nigdy zamiast.

### 3.2 CSS3 — layout i nowe możliwości

**Kluczowe koncepty**
- **Flexbox** — 1D layout, `justify-content`, `align-items`, `gap`, `flex-grow/shrink/basis`.
- **Grid** — 2D, `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`, `grid-area`, `subgrid`.
- **Container Queries** (`@container`) — responsywność po rozmiarze rodzica, nie viewport.
- `:has()` — parent selector.
- **CSS Cascade Layers** (`@layer`) — kontrola specificity w dużych projektach.
- **Custom Properties** — dynamiczne, dziedziczone, można zmieniać z JS.
- **Logical properties** (`margin-inline`, `padding-block`) — RTL-friendly.
- `@supports` — feature detection.
- Nowe jednostki: `dvh`, `svh`, `lvh` (dynamic viewport), `cqw`, `cqh`.
- `color-mix()`, relative color syntax, `oklch()`.

**Przykładowe pytania**
1. Flexbox czy Grid — na co które?
2. Kiedy Container Queries wygrywa z media queries?
3. Co robi `:has()` i jaki masz konkretny use case?

**Szkic odpowiedzi**
- Flex = 1D (nawigacja, rząd kart). Grid = 2D (cała strona, dashboard). Często zagnieżdżane: Grid na layout, Flex wewnątrz karty.
- Kiedy komponent żyje w różnych szerokościach (sidebar wąski, main szeroki) na tej samej stronie — media queries patrzą tylko na viewport.
- `.form:has(:invalid) button { opacity: .5 }` — stylowanie rodzica na podstawie dziecka bez JS.

### 3.3 SCSS — ekosystem Sass (dart-sass)

**Kluczowe koncepty**
- `@use` / `@forward` (nowe), **przestarzałe** `@import`.
- Mixins (`@mixin`/`@include`), funkcje (`@function`), placeholdery (`%name` + `@extend`).
- Moduły wbudowane: `sass:math`, `sass:color`, `sass:map`.
- `!default` dla configurable tokens.
- Najczęstsze anty-wzorce: głębokie zagnieżdżenie (>3 poziomów), `@extend` ponad mixins (trudniejsze refactoringi).

**Przykładowe pytania**
1. Różnica `@use` vs `@import`?
2. Kiedy mixin, a kiedy placeholder?
3. Jak zorganizować tokeny designu w SCSS?

**Szkic odpowiedzi**
- `@use` ma namespace (`tokens.$color`), nie duplikuje, nie ma global leak. `@import` jest deprecated.
- Mixin — gdy potrzebujesz parametrów. Placeholder — gdy powtarzalny blok bez parametrów, wrzucany do jednego selektora.
- `abstracts/_tokens.scss` (CSS custom properties na `:root` + opcjonalnie Sass mapy do iteracji), `abstracts/_mixins.scss`, `base/`, `components/`, `layouts/`. Tokeny designu tylko jako CSS custom properties (runtime theming).

### 3.4 Architektury CSS

**BEM** (Block__Element--Modifier) — prosty, dobrze skaluje, czytelny, łatwo grepować.
**ITCSS** — warstwy od ogólnych do szczegółowych (Settings → Tools → Generic → Elements → Objects → Components → Utilities).
**SMACSS** — kategoryzacja reguł (base, layout, module, state, theme).
**Atomic/Utility-first** (Tailwind) — `class="flex gap-4 p-2"`, ekstremalna reużywalność, ale verbose.
**CSS Modules** — scoping per-file, unikalny hash (typowe w React).
**CSS-in-JS** — styled-components, Emotion; w Angular rzadsze.

**Przykładowe pytania**
1. Jakiej architektury używałaś i dlaczego?
2. BEM vs Tailwind — kiedy co?
3. Jak zapobiec regresji stylów w dużym projekcie?

**Szkic odpowiedzi**
- W Angular typowo: **ViewEncapsulation.Emulated** (domyślna) + BEM + SCSS + tokeny jako CSS custom properties. `ShadowDom` dla komponentów eksportowanych na zewnątrz.
- BEM — czytelność, design-system friendly. Tailwind — rapid prototyping, spójność tokenów, ale slow refactors jeśli bez `@apply` / komponentów.
- Design tokens + linter (stylelint), testy wizualne (Chromatic / Percy), Storybook jako źródło prawdy, code review dla nowych custom properties.

### 3.5 Responsive design

**Kluczowe koncepty**
- Mobile-first vs desktop-first; rekomendacja: mobile-first.
- Breakpointy: 390 (iPhone mini), 768 (tablet), 1024, 1440. Zawsze decydować po **content**, nie device.
- `clamp(min, preferred, max)` — płynne skalowanie typografii (`font-size: clamp(1rem, 1vw + .5rem, 1.5rem)`).
- `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`.

---

## 4. RxJS

### 4.1 Podstawy: Observable, Observer, Subscription

**Kluczowe koncepty**
- Observable to "leniwy push" — nic się nie dzieje, dopóki nie zasubskrybujesz.
- `subscribe({ next, error, complete })`.
- `Subject` (multicast, bez wartości początkowej), `BehaviorSubject` (z wartością, emituje ostatnią nowym subskrybentom), `ReplaySubject(n)` (n ostatnich), `AsyncSubject` (tylko po complete).
- Cold vs Hot: cold = każda subskrypcja = nowa produkcja (HTTP). Hot = produkcja niezależna od subskrybentów (WebSocket, fromEvent).
- Multicasting: `share()`, `shareReplay({ bufferSize: 1, refCount: true })`.

### 4.2 Operatory — muszę znać

**Transformacja**
- `map`, `scan`, `reduce`, `pluck` (deprec.), `tap` (side-effects).

**Filtracja**
- `filter`, `take`, `takeUntil`, `takeWhile`, `takeUntilDestroyed` (Angular ≥16), `first`, `last`, `skip`, `distinct`, `distinctUntilChanged`, `debounceTime`, `throttleTime`, `auditTime`, `sampleTime`.

**Kombinacja**
- `combineLatest` (każde źródło musi emitnąć ≥1), `forkJoin` (czeka aż wszystkie complete, emituje ostatnie), `zip` (parowanie), `merge`, `concat`, `startWith`, `withLatestFrom`.

**Flattening (higher-order)**
- `switchMap` (anuluj poprzedni, ostatni wygrywa — **autocomplete, nawigacja**).
- `mergeMap` (równolegle, wszystko leci — **równoległe zapisy niezależne**).
- `concatMap` (sekwencyjnie, jedno po drugim — **zapis do kolejki**).
- `exhaustMap` (ignoruj nowe póki poprzedni trwa — **submit form, login**).

**Błędy i retry**
- `catchError(err => of(fallback))`, `retry({ count, delay })`, `retryWhen` (deprec.).

**Przykładowe pytania**
1. Różnica `switchMap` vs `mergeMap` vs `concatMap` vs `exhaustMap` — **klasyk**, musi polecieć z przykładami.
2. Kiedy `shareReplay(1)` się zwróci przeciwko tobie?
3. Jak uniknąć memory leaków?

**Szkic odpowiedzi**
- `shareReplay(1, undefined, true)` z `refCount` — gdy 0 subskrybentów, odłącza source. Bez tego źródło nigdy się nie kończy (np. WebSocket), masz leak.
- Memory leaks: unsubscribe w `ngOnDestroy`, `takeUntilDestroyed()`, async pipe (auto-unsubscribe), `takeUntil(destroy$)`.

```ts
// klasyk autocomplete
this.search$ = this.queryControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => q ? this.api.search(q).pipe(catchError(() => of([]))) : of([])),
  takeUntilDestroyed(),
);
```

### 4.3 RxJS + Signals interop

**Kluczowe koncepty**
- `toSignal(obs$, { initialValue })` — zmienia Observable w Signal (auto-unsubscribe na destroy komponentu).
- `toObservable(sig)` — Signal w Observable (odpalane przez effect internally).
- Wzorce hybrydowe: źródło danych = Observable (HTTP, WS), UI state = Signals, pochodne UI = `computed`.

### 4.4 Tworzenie własnych operatorów

**Przykład — `debounceIf(predicate, time)`:**
```ts
export function debounceIf<T>(pred: (v: T) => boolean, ms: number): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(
    mergeMap(v => pred(v) ? of(v).pipe(delay(ms)) : of(v))
  );
}
```

### 4.5 Marble testing

**Kluczowe koncepty**
- `TestScheduler` + `expectObservable` + `expectSubscriptions`.
- Diagramy: `-` = 10ms, `|` = complete, `#` = error, `()` = grupa w tym samym frame.
- Testujesz **czas i wartości**.

```ts
it('debounces', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const source$ = cold('a-b-c---d|');
    const expected  = '---------c--- d|'; // przykładowe
    expectObservable(source$.pipe(debounceTime(30))).toBe(expected);
  });
});
```

---

## 5. REST API, WebSockets, HTTP

### 5.1 Protokół HTTP

**Kluczowe koncepty**
- HTTP/1.1 — keep-alive, head-of-line blocking. HTTP/2 — binarny, multipleksowany, serwer push. HTTP/3 — QUIC (UDP), bez HoL blocking, szybszy reconnect.
- Status codes: 2xx (sukces), 3xx (redirect), 4xx (klient), 5xx (serwer). Ważne: 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503.
- Idempotentność: GET, PUT, DELETE, HEAD, OPTIONS — tak. POST, PATCH — nie (konieczne dla retry safety).
- Metody: GET, POST, PUT (replace), PATCH (partial), DELETE, HEAD, OPTIONS (CORS preflight).
- Nagłówki: `Content-Type`, `Accept`, `Authorization`, `Cache-Control`, `ETag`, `If-None-Match`, `Vary`, `X-Request-Id`.

### 5.2 REST i alternatywy

**REST**
- Zasoby, URL-e, HTTP verbs, HATEOAS (rzadko w praktyce).
- Richardson Maturity Model: 0 (RPC), 1 (resources), 2 (HTTP verbs), 3 (hypermedia).
- Wersjonowanie: `/v1/...`, `Accept: application/vnd.api.v2+json`, query param.

**GraphQL**
- Jeden endpoint, klient deklaruje, czego chce. Eliminuje over/under-fetching. Minus: złożoność cache, N+1 na backendzie.
- Apollo Client / URQL.

**gRPC-Web**
- Binarny protobuf, streaming (server/bi-di), typowanie z proto. Mniej popularny w przeglądarce.

**Przykładowe pytania**
1. REST vs GraphQL — kiedy co?
2. Jak zrobić paginację (offset/limit vs cursor)?
3. Jak zaprojektować API dla mobile + web z różnymi potrzebami?

### 5.3 Autoryzacja

**Kluczowe koncepty**
- **Cookie + session** — serwer stateful, CSRF-vulnerable (trzeba token), same-site lax/strict, HttpOnly + Secure.
- **JWT** — stateless, client trzyma token, często `access_token` (krótki TTL) + `refresh_token` (długi, httpOnly cookie). XSS kradnie access_token z localStorage — dlatego refresh w httpOnly cookie.
- **OAuth 2.0** — framework delegacji (Authorization Code + PKCE dla SPA). **Nie do autentykacji — to OpenID Connect (OIDC) na bazie OAuth**.
- Token w `Authorization: Bearer ...` vs cookie.

**Przykładowe pytania**
1. Gdzie trzymać tokeny w SPA?
2. Jak zrobić silent refresh przy wygasłym access tokenie?
3. Kiedy OAuth, a kiedy własny mechanizm?

**Szkic odpowiedzi**
- **Najbezpieczniej**: httpOnly Secure cookie dla refresh, in-memory (`AuthService` signal) dla access. Unikać localStorage (XSS surface).
- Interceptor łapie 401 → wysyła request `/refresh` z cookie → nowy access token → retry oryginalnego requestu. Singleton refresh Observable (`shareReplay(1)`), żeby równoległe requesty nie odpalały wielu refreshy.
- OAuth tam, gdzie potrzebujesz delegacji (Google Login, integracja z 3rd party). Własny — gdy jest to wewnętrzna apka z własnym user store.

### 5.4 WebSockets i real-time

**Kluczowe koncepty**
- `WebSocket` API: `onopen`, `onmessage`, `onclose`, `onerror`.
- `webSocket()` z `rxjs/webSocket` — gotowy Observable z ponownym łączeniem.
- Server-Sent Events (SSE) — jednokierunkowy, HTTP-based, automatyczny reconnect. Prostsze niż WS dla notyfikacji.
- Long polling — fallback, gdy brak WS.
- Protokoły nad WS: STOMP, SockJS, Socket.IO.
- Heartbeat / ping-pong, reconnect z exponential backoff, buforowanie wiadomości offline.

**Przykładowe pytania**
1. WS vs SSE — kiedy co?
2. Jak zaimplementować odporny reconnect?
3. Jak autoryzować WS?

**Szkic odpowiedzi**
- WS: two-way, niskie opóźnienie, chaty, gry, real-time collab. SSE: one-way (serwer → klient), notyfikacje, live feed, znacznie prostszy.
- Exponential backoff (1s, 2s, 4s, 8s, max 30s) + jitter. Po `reconnect` — resync stanu (fetch delta). `retryWhen` / `retry({ delay: backoff })`.
- Token w query string (niezbyt bezpieczny — loguje się w serwerach) lub pierwsza wiadomość auth po handshake, albo cookie (jeśli same-origin).

### 5.5 CORS

**Kluczowe koncepty**
- Same-origin policy blokuje cross-origin requests. CORS to **mechanizm serwera**, który pozwala na wyjątki.
- Preflight OPTIONS dla "nietrywialnych" requestów (custom headers, methods inne niż GET/POST/HEAD).
- `Access-Control-Allow-Origin` (konkretny origin, nie `*` gdy `credentials: include`).
- `Access-Control-Allow-Credentials: true` + `withCredentials: true` po stronie klienta.

**Pytanie klasyk**
- "Kiedy preflight?", "Co robić w dev, a co w prod?" (odpowiedź: dev = proxy Angular CLI; prod = config backendu/gatewaya).

### 5.6 Caching HTTP

**Kluczowe koncepty**
- `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.
- `ETag` + `If-None-Match` → 304 Not Modified (bez body).
- `Last-Modified` + `If-Modified-Since`.
- Service Worker cache (Workbox, Angular SW).
- In-memory cache w interceptorze (TTL).

---

## 6. Git, Node.js, npm

### 6.1 Git — poziom senior

**Kluczowe koncepty**
- Merge vs rebase: merge zachowuje historię, rebase tworzy linearną. `rebase -i` dla squash/fixup.
- `git cherry-pick` — wyciągnięcie commita na inny branch.
- `git bisect` — binary search bugów.
- `git reflog` — ratunek utraconych commitów.
- Git flow vs GitHub flow vs trunk-based development.
- Conventional Commits (`feat:`, `fix:`, `chore:`) + semantic release.
- `.gitignore`, `.gitattributes`, git hooks (husky + lint-staged).
- `git worktree` — wiele branchy wyewtracted równocześnie.

**Przykładowe pytania**
1. Merge vs rebase — rekomendacja w zespole.
2. Jak odkręcić `git reset --hard`?
3. Co to jest trunk-based development?

**Szkic odpowiedzi**
- W zespole z PR review: **squash merge** (jeden commit per PR, czysta historia main) + rebase lokalny żeby utrzymać branch aktualny.
- `git reflog` → znajdź SHA sprzed reseta → `git reset --hard <sha>` lub `git branch recover <sha>`.
- Trunk-based: wszyscy mergują często (≤1 dzień) do main, feature flags zamiast long-lived branches. Lepsze CI/CD, mniej merge hell, wymaga discypliny.

### 6.2 Node.js

**Kluczowe koncepty**
- Event loop w Node (libuv): timers → pending callbacks → idle → **poll** → check (`setImmediate`) → close. Microtasks (Promise, queueMicrotask) pomiędzy fazami.
- `process.nextTick` priorytetniejsze niż Promise microtasks.
- Streams: readable, writable, duplex, transform. Backpressure.
- `cluster`, `worker_threads`.
- ESM w Node — `"type": "module"` lub `.mjs`.

### 6.3 npm, pnpm, yarn, monorepo

**Kluczowe koncepty**
- `package.json`: `dependencies`, `devDependencies`, `peerDependencies` (host dostarcza), `optionalDependencies`.
- `package-lock.json` — odtwarzalność, **zawsze commitujemy**.
- SemVer: `major.minor.patch`. `^1.2.3` = compatible, `~1.2.3` = patch only, `1.2.3` = exact.
- `npm audit`, `npm outdated`, `npm ci` (clean install dla CI).
- **pnpm** — hardlinks, szybszy, mniej miejsca, strict (default: brak "phantom deps").
- **yarn** (v2+/3+/4+ berry) — plug'n'play.
- Monorepo tools: **Nx** (Angular-native), **Turborepo**, **Lerna** (legacy). Workspaces w npm/pnpm.

**Przykładowe pytania**
1. Dlaczego lockfile musi być w repo?
2. Kiedy monorepo?
3. npm vs pnpm — dlaczego pnpm wygrywa w 2025?

---

## 7. Testy jednostkowe (Jest / Vitest)

### 7.1 Piramida testów

- **Unit** — 70%, szybkie, izolowane, mocki dla zależności.
- **Integration** — 20%, kilka modułów razem, często `TestBed` z realnymi provider'ami.
- **E2E** — 10%, pełna aplikacja w browser (Playwright / Cypress).
- Anty-wzorzec: odwrócona piramida (dużo E2E, mało unit) → wolne, flaky.

### 7.2 Angular — TestBed i Testing Library

**Kluczowe koncepty**
- `TestBed.configureTestingModule` + `createComponent`.
- `fixture.detectChanges()`, `fixture.whenStable()`.
- `HttpTestingController` → `httpMock.expectOne(url).flush(data)`.
- `@angular/testing/fakeAsync`, `tick()`, `flush()`.
- **Angular Testing Library** (`@testing-library/angular`) — user-centric, "test like a user".
- Testowanie signals: `TestBed.runInInjectionContext` + `effect()`; `flushEffects()`.

```ts
it('adds to cart', async () => {
  await render(CartComponent, { providers: [...] });
  await userEvent.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getByText(/1 produkt/)).toBeInTheDocument();
});
```

### 7.3 Jest vs Vitest

**Jest** — klasyk, działa wszędzie, ale w 2025 kiepsko z ESM (workaroundy z `@swc/jest`).
**Vitest** — szybszy (Vite), natywny ESM, jest-compatible API, wspiera snapshot, watch mode, UI. Od Angular 19+ official support.

**Rekomendacja 2025/2026**: Vitest dla nowych projektów Angular.

### 7.4 Co testować

- **Logika biznesowa** w serwisach — zawsze.
- **Reakcja UI** na interakcje — zawsze.
- **Selektory / computed** — selektywnie, gdy złożone.
- **Mockować**: HTTP, time, randomness, trzecie usługi.
- **Nie mockować**: implementation details ("białe testy"), własnych pipe'ów wewnątrz komponentu.

---

## 8. Bundlery (Webpack, Vite, esbuild)

### 8.1 Krajobraz 2025

- **Angular 21** domyślnie używa **esbuild application builder** (od v17); Webpack został w legacy projektach.
- **Vite** + Rollup — de facto standard w React/Vue/SvelteKit, Angular wspiera przez esbuild.
- **Turbopack** (Next.js), **Rspack** (Rust Webpack-compatible).

### 8.2 Koncepty

- **Bundling** — łączenie modułów w chunki.
- **Tree-shaking** — usuwanie dead code (działa na ESM, nie na CJS).
- **Code splitting** — dynamic imports → osobne chunki.
- **Source maps** — debugowanie zminifikowanego kodu; `hidden-source-map` w prod.
- **Module Federation** — runtime sharing modułów między apkami.
- **HMR** — Hot Module Replacement, zamiana modułu bez reloadu strony.
- **Build targets** — ES2022, ES2020, nowoczesne + legacy (differential loading deprecated).

### 8.3 Webpack — kiedy jeszcze

- Skomplikowane legacy configi.
- Module Federation "v1" — Webpack tylko (choć Native Federation dla esbuild już istnieje).
- Własne loadery dla egzotycznych assetów.

### 8.4 Vite — zalety

- Dev server na esbuild, startuje **~100ms**.
- Rollup dla produkcji.
- Plug'n'play, prosty config.

### 8.5 Pytania

1. Różnica między code splitting a tree-shaking?
2. Co to jest Module Federation?
3. Dlaczego Angular poszedł w esbuild?

**Szkic odpowiedzi**
- Code splitting = dzielisz bundle na chunki (runtime). Tree-shaking = usuwasz nieużywany kod (build-time).
- MF: apka A może lazy-loadować komponent z apki B deployowanej osobno, **w runtime**. Shared deps (Angular, RxJS) ustalane jako singleton.
- esbuild jest napisany w Go, ~100x szybszy od Webpack w typowym Angular build. Gorący reload w sekundach zamiast minut.

---

## 9. Mikrofrontendy (Module Federation, Web Components)

### 9.1 Kiedy mikrofrontendy

**Plusy**
- Niezależny deploy per zespół (skalowanie organizacyjne).
- Różne stacki w różnych częściach (np. legacy AngularJS + nowy Angular).
- Niezależny release cycle.

**Minusy**
- Koszt infra (routing, shared deps, komunikacja, auth).
- Performance (duplikacja zależności jeśli źle skonfigurowane).
- Debugging cross-app.
- **Najczęstszy błąd**: używanie MF, gdy wystarczyłby monorepo.

**Rekomendacja senior**: MF ma sens przy 5+ zespołach. Dla <5 → monorepo (Nx).

### 9.2 Module Federation

**Architektury**
- **Host + Remotes**: host (shell) ładuje dynamicznie remoty.
- **Native Federation** — standard-based (import maps), działa z esbuild.
- **Webpack Module Federation** — `ModuleFederationPlugin`.

**Shared deps**
- Singleton, requiredVersion, strictVersion.
- Pułapka: Angular instances duplicated → `inject()` zwraca różne instancje.

**Komunikacja**
- **URL / router** — najprostsze, stateless, linkable.
- **Custom Events** / EventBus — decoupled.
- **RxJS Subject w window** — nie rekomendowane (leak, globalny state).
- **Shared state service** przez Module Federation exposed → trudne, kruche.

### 9.3 Web Components / Angular Elements

**Kluczowe koncepty**
- Custom Elements API (`customElements.define`), Shadow DOM, HTML Templates.
- Angular Elements: `createCustomElement(AppComponent, { injector })`.
- Zastosowania: widget osadzany na innych stronach (WordPress, CMS), wspólny komponent między React/Vue/Angular.
- Ograniczenia: Shadow DOM izoluje style (plus), ale trudniej theme'ować (minus).

### 9.4 Pytania

1. Module Federation vs Web Components — kiedy co?
2. Jak rozwiązać wspólny state między mikrofrontendami?
3. Jak obsługujesz auth cross-MF?

**Szkic odpowiedzi**
- MF = dzielenie **aplikacji** (routingu, widoków). Web Components = dzielenie **komponentów** (widget). Często łączone.
- Najlepiej: wspólny BFF (Backend for Frontend) lub shared storage (localStorage + storage events, BroadcastChannel). Unikaj globalnego window state.
- Single sign-on przez host — host ma token w cookie / service; remoty dostają token przez `getToken()` na eksponowanym serwisie lub przez intercepted fetch.

---

## 10. Wzorce projektowe i dobre praktyki

### 10.1 SOLID

**S** — Single Responsibility: klasa/komponent robi jedną rzecz.
**O** — Open/Closed: otwarte na rozszerzenie, zamknięte na modyfikację. (Strategy pattern, DI tokens.)
**L** — Liskov Substitution: podtyp zastępowalny przez typ bazowy bez łamania kontraktu.
**I** — Interface Segregation: wiele małych interfejsów > jeden wielki. (Angular: małe serwisy, `inject()`).
**D** — Dependency Inversion: zależność od abstrakcji (interfejs), nie implementacji.

### 10.2 GoF w kontekście Angular

- **Singleton** → `providedIn: 'root'`.
- **Factory** → `useFactory` provider.
- **Observer** → RxJS Observables, Signals.
- **Strategy** → providers z różnymi implementacjami tego samego interfejsu.
- **Decorator** → HTTP interceptors.
- **Facade** → serwis agregujący wiele API dla UI.
- **Adapter** → DTO ↔ Model translation.
- **Command** → NgRx actions.

### 10.3 Angular-specific patterns

- **Smart/Presentational (Container/Presentational)**
  - Smart: inject services, fetch data, trzyma state.
  - Presentational: `input()`, `output()`, pure UI.
- **Facade** — `CheckoutFacade` skrywa NgRx selectors + dispatch za prostym API.
- **State management**:
  - **Signal-based** (built-in) — dla małego/średniego state.
  - **NgRx SignalStore** (v17+) — nowa rekomendacja, signal-first.
  - **NgRx Store** (Redux-like) — enterprise, dev tools, time-travel.
  - **Akita** / **Elf** — lżejsze alternatywy.
  - **Component Store** (local state per smart component).

### 10.4 DRY / KISS / YAGNI

- **DRY** — Don't Repeat Yourself, ale uważaj na over-abstraction (AHA: Avoid Hasty Abstractions).
- **KISS** — Keep It Simple, Stupid.
- **YAGNI** — You Aren't Gonna Need It.
- **Rule of Three**: abstrahuj dopiero przy trzeciej duplikacji.

### 10.5 Clean Code + Clean Architecture

- Małe pliki, małe funkcje (<50 linii), małe komponenty (<200 linii template/logika).
- Nazewnictwo: `isLoading`, `hasError` (boole), `getUsers()` (funkcje), `USER_ROLES` (const).
- Warstwy: domain (modele) → application (use-cases/serwisy) → infrastructure (HTTP, storage) → UI.
- Dependency rule: zewnętrzne warstwy zależą od wewnętrznych, nie odwrotnie.

---

## 11. Agile / Scrum

### 11.1 Role i ceremonie

**Role**
- **Product Owner** — priorytetyzacja backlogu, stakeholder-facing.
- **Scrum Master** — facylitator, usuwa blockery, chroni zespół.
- **Developers** — self-organizing team.

**Ceremonie**
- **Sprint Planning** — co + jak + ile (commitment na sprint).
- **Daily** — 15 min, 3 pytania (co robiłem, co będę, blockery).
- **Refinement / Grooming** — ocena i rozbijanie historyjek z backlogu.
- **Sprint Review** — demo przed stakeholderami.
- **Retro** — co dobre, co złe, co poprawić.

**Artefakty**
- Product backlog, sprint backlog, increment.
- Definition of Done / Definition of Ready.

### 11.2 Estymacje

- **Story Points** (Fibonacci 1, 2, 3, 5, 8, 13, 21) — relatywna złożoność, nie godziny.
- **Planning poker** — konsensus przez anonimowe estymowanie.
- **Velocity** — średnia SP na sprint, do prognoz.

### 11.3 Kanban podstawy

- WIP limits, continuous flow, cycle time, lead time.
- Plusy: elastyczność, brak sprintów. Minusy: trudniej o rytm demo/retro.

### 11.4 Pytania

1. Kiedy Scrum, a kiedy Kanban?
2. Jak sobie radzisz, gdy PO dorzuca pracę w środku sprinta?
3. Co robisz, gdy retro nic nie zmienia?

**Szkic odpowiedzi**
- Scrum = złożony produkt z częstymi zmianami i potrzebą rytmu. Kanban = ops, support, wysoki przepływ zadań o różnym priorytecie.
- Rozmowa z PO — "tak, ale kosztem czego?". Proposed scope change → trzeba wyrzucić coś innego. Dopuszczalne zmiany tylko gdy blocker produkcyjny.
- Escalate do Scrum Mastera, szukam root cause (brak action items? brak accountability? brak trustu?). Retro bez follow-through jest teatrem.

---

## 12. Decyzje techniczne i odpowiedzialność seniora

### 12.1 Architecture Decision Records (ADR)

**Kluczowe koncepty**
- Krótki dokument (1-2 strony) opisujący **kontekst → decyzja → konsekwencje**.
- Numerowane, niemutowalne (superseded by ADR-NNN).
- Przechowywane w repo (`docs/adr/`).
- Narzędzia: `adr-tools`, `log4brains`.

### 12.2 Tech debt

**Kategorie (Martin Fowler)**
- **Deliberate & Prudent** — "wiemy, że to nie optymalne, ale musimy się poruszyć".
- **Deliberate & Reckless** — "nie mamy czasu na projektowanie".
- **Inadvertent & Prudent** — "teraz rozumiemy lepiej".
- **Inadvertent & Reckless** — "nie wiemy, czego nie wiemy".

**Zarządzanie**
- Osobny backlog / tag. % capacity per sprint (np. 20%).
- Boy Scout Rule — zostaw kod czystszym niż był.

### 12.3 Trade-offs

**Klasyczne dylematy**
- Build vs buy (własny komponent vs biblioteka).
- Monorepo vs polyrepo.
- SSR vs CSR vs SSG.
- Monolith vs mikrofrontendy.
- REST vs GraphQL.
- Konsekwencja vs elastyczność (np. narzucone style vs wolność).

**Framework decyzji**
- Lista opcji → kryteria (cost, time, team skill, maintenance, performance, UX) → ocena → rekomendacja → ADR.

### 12.4 Code review i mentoring

- Review z empatią: "Consider", "nit:", "blocking:" prefixy.
- Automatyzuj co się da (lint, prettier, stylelint, CI) — review o design, nie o spacje.
- Pair programming / mob programming dla trudnych tematów.
- Mentoring — ask questions > tell answers.

### 12.5 Observability

- **Logging** — Sentry, Datadog, LogRocket.
- **Error tracking** — Sentry (source maps upload).
- **Performance** — Real User Monitoring (RUM), Web Vitals.
- **Tracing** — OpenTelemetry, correlation IDs.
- **Feature flags** — LaunchDarkly, Unleash, własne.

---

## 13. System Design — frontendowy

### 13.1 Typowe zadania z rozmów

**1. "Zaprojektuj autocomplete dla 10 mln produktów"**
- Frontend: debounce 250ms, anulowanie poprzedniego requestu (`switchMap`), abort controller, minimum 2 znaki, pokaż max 10 wyników.
- Cache last N zapytań (LRU Map).
- Keyboard navigation (ARIA combobox).
- Backend: ElasticSearch / Algolia / Typesense + prefix index.
- Offline: Service Worker cache dla popularnych zapytań.

**2. "Zaprojektuj infinite scroll dla feedu"**
- Paginacja cursor-based (`after`, `limit`).
- `IntersectionObserver` trigger przy 80% viewport.
- Virtual scrolling, jeśli items są ciężkie (cdk-virtual-scroll).
- Scroll restoration przy powrocie na listę (sticky scroll position).
- A11y: "Load more" button dla screen readers.
- Preload następnej strony na idle.

**3. "Zaprojektuj chat real-time"**
- WebSocket (lub fallback SSE → long polling).
- Reconnect z backoff + resync (fetch wiadomości od ostatniego seen_id).
- Optimistic UI (pokazuj wiadomość od razu, mark as sending).
- Offline queue w IndexedDB.
- Typing indicators (throttle 500ms).
- Read receipts (batched co N ms).
- E2E encryption? (Signal protocol) — jeśli security-critical.

**4. "Zaprojektuj collaborative editor (Google Docs)"**
- CRDT (Yjs, Automerge) lub OT (Operational Transform).
- WebSocket + offline-first (IndexedDB persistence).
- Presence (kto jest online, kursor, zaznaczenie).
- Conflict resolution — CRDT automatyczny, OT server-side.

**5. "Zaprojektuj design system"**
- Tokeny (color, spacing, typography) jako CSS custom properties.
- Komponenty jako standalone (Angular) + Storybook.
- Publikowane jako npm package + versionowane (semver).
- Visual regression tests (Chromatic).
- Dokumentacja automatyczna (Storybook autodocs).
- Dostępność — axe-core w CI.

### 13.2 Framework odpowiedzi — FR-NR-T-E-R

1. **F**requirements — functional (co musi umieć) i **NR** non-functional (RPS, latency, scale).
2. **T**rade-offs — co wybierasz i dlaczego.
3. **E**dge cases — offline, slow network, błędy.
4. **R**eview — co poprawisz przy większej skali.

### 13.3 Niefunkcjonalne wymagania (NFR)

- **Performance**: LCP, FID/INP, CLS, TTFB.
- **Scalability**: ilu userów równocześnie, ile danych.
- **Security**: auth, XSS, CSRF, CSP, SRI.
- **Availability**: SLA (99.9% = ~8h/rok downtime), fallback UI.
- **Observability**: metryki, logi, tracing.
- **Accessibility**: WCAG 2.2 AA minimum.
- **i18n**: PL + EN, formaty liczb/dat, RTL.

---

## 14. Live coding — typowe zadania

Na rozmowie **technika ≠ wszystko**. Seniora oceniają głównie za to, czy:

1. **Dopytuje o wymagania** zanim zacznie kodować (edge cases, typy wejścia, konwencje).
2. **Komentuje trade-offy** na głos: „robię wariant O(n) bo dane <1k; przy większych pisałbym LRU".
3. **Zaczyna od prostej wersji**, potem iteracyjnie dorzuca edge cases i optymalizacje.
4. **Pisze testy lub przynajmniej je opisuje** (choćby jeden happy path + jeden edge).
5. **Zna TypeScript na tyle**, żeby typy były prawidłowe *bez* `any` — generics, `unknown`, narrowing.

**Checklist przed `return`:**

- [ ] Co z `null` / `undefined` / pustym wejściem?
- [ ] Czy funkcja jest czysta (bez mutacji argumentów)?
- [ ] Czy typy są poprawne (nie `any`)?
- [ ] Czy zadziała dla bardzo dużych / bardzo małych wejść?
- [ ] Czy są wycieki pamięci (timery, listenery, subskrypcje)?

---

### 14.1 Debounce / throttle od zera (JS)

```ts
function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

function throttle<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let lastCall = 0;
  return (...args: Parameters<F>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}
```

### 14.2 Deep clone / deep equal

```ts
// structuredClone działa dla Date, Map, Set, ArrayBuffer; cykliczne też OK.
const copy = structuredClone(obj);

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => deepEqual((a as any)[k], (b as any)[k]));
}
```

### 14.3 Custom RxJS operator

```ts
// retryWithBackoff — ponawia z exp. backoff + jitter, max N razy.
function retryWithBackoff<T>(max = 3, baseDelayMs = 500): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(
    retry({
      count: max,
      delay: (err, attempt) => {
        const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
        return timer(delay);
      },
    }),
  );
}
```

### 14.4 Event emitter (pub-sub)

```ts
class EventBus<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<(payload: any) => void>>();

  on<K extends keyof Events>(event: K, cb: (p: Events[K]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }
}
```

### 14.5 Promise.all od zera

```ts
function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(v => {
        results[i] = v;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}
```

### 14.6 Custom form validator (Angular)

```ts
export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value ?? '';
    const hasUpper = /[A-Z]/.test(v);
    const hasDigit = /\d/.test(v);
    const long = v.length >= 8;
    return hasUpper && hasDigit && long ? null : { weakPassword: { hasUpper, hasDigit, long } };
  };
}
```

### 14.7 Directive: click outside

```ts
@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective {
  private host = inject(ElementRef<HTMLElement>);
  outside = output<void>();

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (!this.host.nativeElement.contains(target)) this.outside.emit();
  }
}
```

### 14.8 Pipe: filesize

```ts
@Pipe({ name: 'filesize', standalone: true, pure: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, digits = 1): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log10(bytes) / 3);
    return `${(bytes / 1000 ** i).toFixed(digits)} ${units[i]}`;
  }
}
```

### 14.9 Klasyczne algorytmy (z kompletnymi rozwiązaniami)

Krótkie zadania, które padają jako **rozgrzewka** — często przed właściwym problemem z system designu. Senior powinien zrobić je w **≤5 min na kartce**, bez google'a.

#### 14.9.1 Two Sum — O(n) z hash-mapą

```ts
/**
 * Zwraca pierwszą parę indeksów, dla których nums[i] + nums[j] === target.
 * Zakłada: może być wiele par — zwracamy pierwszą napotkaną.
 */
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // wartość → indeks
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return null;
}
```

**Co powiedzieć:** „Naiwnie byłoby O(n²). Hash-mapa daje O(n) czasu i O(n) pamięci — klasyczny trade-off czas-za-pamięć."

#### 14.9.2 FizzBuzz (seniorska wersja — rozszerzalna)

```ts
type Rule = { divisor: number; label: string };

function fizzBuzz(n: number, rules: Rule[] = [
  { divisor: 3, label: 'Fizz' },
  { divisor: 5, label: 'Buzz' },
]): string[] {
  return Array.from({ length: n }, (_, i) => {
    const num = i + 1;
    const hit = rules.filter(r => num % r.divisor === 0).map(r => r.label).join('');
    return hit || String(num);
  });
}
```

**Dlaczego tak:** rekruter czasem dopowiada „a teraz dodaj 7 = Bazz". Parametryzacja pokazuje Open/Closed Principle bez słowa „SOLID".

#### 14.9.3 Flatten (rekurencyjny + iteracyjny)

```ts
// Wariant 1 — rekurencja + Array.flat (gdy depth znane).
const flat1 = <T>(arr: unknown[], depth = Infinity): T[] =>
  arr.flat(depth) as T[];

// Wariant 2 — iteracyjny ze stosem (bezpieczny dla głębokich struktur).
function flat<T>(arr: unknown[]): T[] {
  const result: T[] = [];
  const stack: unknown[] = [...arr];
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) stack.push(...next);
    else result.push(next as T);
  }
  return result.reverse(); // bo pop czyta od końca
}
```

**Pułapka:** rekurencja `flatten(arr.flatMap(...))` przy głębokości ~10 000 wywróci stos — w wersji produkcyjnej dawaj iteracyjną.

#### 14.9.4 groupBy — strongly typed

```ts
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// Użycie:
const byRole = groupBy(users, u => u.role); // Record<'admin'|'member', User[]>
```

**Uwaga:** od ES2024 jest `Object.groupBy` / `Map.groupBy` — na rozmowie wspomnij, ale napisz własną wersję.

#### 14.9.5 Fibonacci — memoizowany

```ts
const fib = (() => {
  const cache = new Map<number, bigint>([[0, 0n], [1, 1n]]);
  return function fib(n: number): bigint {
    if (cache.has(n)) return cache.get(n)!;
    const v = fib(n - 1) + fib(n - 2);
    cache.set(n, v);
    return v;
  };
})();
```

**Dlaczego `bigint`:** `fib(100)` już przekracza `Number.MAX_SAFE_INTEGER`. Jeśli rekruter nie chce bigint, zaznacz ograniczenie.

#### 14.9.6 Anagram detection

```ts
function isAnagram(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, '');
  a = norm(a); b = norm(b);
  if (a.length !== b.length) return false;
  const count: Record<string, number> = {};
  for (const ch of a) count[ch] = (count[ch] ?? 0) + 1;
  for (const ch of b) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
```

**Edge cases do zasygnalizowania:** Unicode (é vs e + ́), emoji (`for..of` łapie code points, ale złożone grafemy wymagałyby `Intl.Segmenter`).

---

### 14.10 Debounce z opcjami (leading / trailing / cancel / flush)

**Zadanie:** napisz zaawansowany debounce — wersja z Lodash. Rekruter często dodaje „a teraz żeby pierwszy klik przeszedł od razu".

```ts
interface DebounceOptions {
  leading?: boolean;    // odpal natychmiast przy pierwszym wywołaniu
  trailing?: boolean;   // odpal na końcu (default true)
  maxWait?: number;     // gwarantuj wywołanie nie rzadziej niż co maxWait ms
}

interface DebouncedFn<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): void;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
}

function debounce<F extends (...args: any[]) => any>(
  fn: F,
  wait: number,
  { leading = false, trailing = true, maxWait }: DebounceOptions = {},
): DebouncedFn<F> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<F> | null = null;
  let lastResult: ReturnType<F> | undefined;
  let lastCallTime = 0;

  const invoke = () => {
    if (!lastArgs) return;
    lastResult = fn(...lastArgs);
    lastArgs = null;
    if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
  };

  const debounced = ((...args: Parameters<F>) => {
    lastArgs = args;
    const now = Date.now();
    const isFirst = timer === null;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke();
    }, wait);

    if (leading && isFirst) {
      lastCallTime = now;
      invoke();
    }

    if (maxWait !== undefined && !maxTimer) {
      maxTimer = setTimeout(() => {
        maxTimer = null;
        if (lastArgs) invoke();
      }, maxWait);
    }
  }) as DebouncedFn<F>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    if (maxTimer) clearTimeout(maxTimer);
    timer = maxTimer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      invoke();
    }
    return lastResult;
  };

  return debounced;
}
```

**Na co zwrócić uwagę:**
- `cancel()` i `flush()` to must-have do integracji z Angularem (`ngOnDestroy` → `cancel()`).
- `maxWait` chroni przed „nigdy się nie wykona" gdy events lecą non-stop (autocomplete przy szybkim pisaniu).
- Nie używaj `this` — w Angularze łatwo się pomylić przy `addEventListener`.

---

### 14.11 Throttle z leading / trailing + cancel

```ts
interface ThrottleOptions { leading?: boolean; trailing?: boolean }

function throttle<F extends (...args: any[]) => any>(
  fn: F,
  wait: number,
  { leading = true, trailing = true }: ThrottleOptions = {},
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastInvoke = 0;
  let lastArgs: Parameters<F> | null = null;

  const invoke = () => {
    lastInvoke = Date.now();
    if (lastArgs) fn(...lastArgs);
    lastArgs = null;
  };

  const throttled = (...args: Parameters<F>) => {
    const now = Date.now();
    if (!lastInvoke && !leading) lastInvoke = now;
    const remaining = wait - (now - lastInvoke);
    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timer) { clearTimeout(timer); timer = null; }
      invoke();
    } else if (!timer && trailing) {
      timer = setTimeout(() => { timer = null; invoke(); }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastInvoke = 0;
    lastArgs = null;
  };

  return throttled;
}
```

**Kiedy throttle vs debounce:**
- **Throttle** — scroll, resize, mousemove: chcemy stały strumień co X ms.
- **Debounce** — autocomplete, walidacja: chcemy ostatniej wartości, nie serii.

---

### 14.12 Curry + pipe / compose

```ts
// Nieskończony currying — dowolna liczba argumentów, do wywołania przez `.call()` / pustą parą `()`.
function curry<F extends (...args: any[]) => any>(fn: F) {
  return function curried(...args: any[]): any {
    return args.length >= fn.length
      ? fn(...args)
      : (...more: any[]) => curried(...args, ...more);
  };
}

// pipe: f(g(h(x))) = pipe(h, g, f)(x) — left-to-right (czytelniejsze).
const pipe = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduce((acc, fn) => fn(acc), x);

// compose: pipe w przeciwną stronę, bliższy matematyce.
const compose = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduceRight((acc, fn) => fn(acc), x);
```

**Użycie:**

```ts
const add = curry((a: number, b: number, c: number) => a + b + c);
add(1)(2)(3);    // 6
add(1, 2)(3);    // 6
add(1)(2, 3);    // 6

const trim = (s: string) => s.trim();
const lower = (s: string) => s.toLowerCase();
const slug = pipe<string>(trim, lower, s => s.replace(/\s+/g, '-'));
slug('  Hello World  '); // 'hello-world'
```

**Pułapka:** curry wyrzeka się wariadyczności (`...rest`) — `fn.length` nie liczy rest-parametrów. Na rozmowie to się podkreśla.

---

### 14.13 Memoize z TTL i limitem rozmiaru

```ts
interface MemoizeOptions<Args extends any[]> {
  ttlMs?: number;                          // czas życia wpisu
  maxSize?: number;                        // LRU-like limit
  keyFn?: (...args: Args) => string;       // custom key (default JSON.stringify)
}

function memoize<Args extends any[], R>(
  fn: (...args: Args) => R,
  { ttlMs, maxSize = 100, keyFn = (...a) => JSON.stringify(a) }: MemoizeOptions<Args> = {},
) {
  const cache = new Map<string, { value: R; expiresAt: number }>();

  return (...args: Args): R => {
    const key = keyFn(...args);
    const now = Date.now();
    const hit = cache.get(key);

    if (hit && (!ttlMs || hit.expiresAt > now)) {
      // LRU refresh — przenieś na koniec (Map zachowuje insertion order).
      cache.delete(key);
      cache.set(key, hit);
      return hit.value;
    }

    const value = fn(...args);
    cache.set(key, { value, expiresAt: ttlMs ? now + ttlMs : Infinity });

    if (cache.size > maxSize) {
      const oldest = cache.keys().next().value!;
      cache.delete(oldest);
    }

    return value;
  };
}
```

**Ograniczenie `JSON.stringify`:** nie serializuje funkcji, `undefined`, `BigInt`, cykli. Dla Date/Map/Set — OK tylko jeżeli custom keyFn.

---

### 14.14 LRU Cache — O(1) get/set

**Zadanie:** Cache o pojemności N z operacjami `get(key)` i `put(key, value)` w O(1).

```ts
/**
 * Trick: Map w JS zachowuje kolejność wstawień.
 * `get` odświeża kolejność przez delete + set.
 * `put` usuwa najstarszy (pierwszy w iteracji), jeśli przepełniony.
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {
    if (capacity <= 0) throw new Error('capacity must be positive');
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const oldest = this.cache.keys().next().value!;
      this.cache.delete(oldest);
    }
  }

  get size(): number { return this.cache.size; }
}
```

**Wersja „klasyczna" dla leetcode:** doubly-linked list + hashmap. W JS nie trzeba — Map wystarcza. Jeśli rekruter pyta „a bez Map?", narysuj DLL na kartce:

```ts
class Node<K, V> { constructor(public k: K, public v: V, public prev: Node<K,V>|null = null, public next: Node<K,V>|null = null) {} }
```

**Złożoność:** get/put O(1) amortyzowane. Pamięć O(N).

---

### 14.15 Promise pool — równoległość z limitem

**Zadanie:** Wykonaj 1000 zadań, ale nie więcej niż 5 na raz (np. upload plików, batch API).

```ts
async function promisePool<T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = 5,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runOne(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runOne(),
  );
  await Promise.all(workers);
  return results;
}
```

**Użycie:**

```ts
const urls = ['/a', '/b', '/c', /* ... 1000 ... */];
const bodies = await promisePool(urls, url => fetch(url).then(r => r.text()), 5);
```

**Ulepszenia, o których warto wspomnieć:**
- `Promise.allSettled` zamiast `all` → zwraca sukcesy i błędy, nie przerywa przy pierwszym rejectu.
- **AbortController** — każdy `worker` dostaje `AbortSignal`, żeby można było przerwać.
- Biblioteki: `p-limit`, `p-map` — prod-grade, 0 deps, ~1kB.

---

### 14.16 Retry z exponential backoff + jitter (vanilla)

```ts
interface RetryOptions {
  retries?: number;
  baseMs?: number;
  maxMs?: number;
  jitter?: boolean;
  shouldRetry?: (err: unknown, attempt: number) => boolean;
}

async function retry<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    baseMs = 500,
    maxMs = 30_000,
    jitter = true,
    shouldRetry = () => true,
  }: RetryOptions = {},
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries || !shouldRetry(err, attempt)) throw err;
      const expo = Math.min(baseMs * 2 ** (attempt - 1), maxMs);
      const delay = jitter ? Math.random() * expo : expo;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

**Co powiedzieć:**
- **Jitter jest krytyczny** — bez niego wszystkie klienty retryują w tej samej sekundzie → thundering herd.
- `shouldRetry` pozwala retryować tylko transient errors (5xx, network), a nie 4xx.
- W RxJS to samo robi `retry({ count, delay: ... })` — patrz 14.3.

---

### 14.17 Finite State Machine (TS, typesafe)

**Zadanie:** Modeluj stan formularza: `idle → submitting → (success | error) → idle`. Niech TS pilnuje, że nie strzelasz akcji niedozwolonej w danym stanie.

```ts
type FSM<State extends string, Event extends string> = {
  [S in State]?: { [E in Event]?: State };
};

class StateMachine<S extends string, E extends string> {
  private current: S;
  private listeners = new Set<(s: S) => void>();

  constructor(initial: S, private transitions: FSM<S, E>) {
    this.current = initial;
  }

  get state(): S { return this.current; }

  send(event: E): boolean {
    const next = this.transitions[this.current]?.[event];
    if (!next) return false;
    this.current = next;
    this.listeners.forEach(cb => cb(next));
    return true;
  }

  onChange(cb: (s: S) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

// Użycie:
type FormState = 'idle' | 'submitting' | 'success' | 'error';
type FormEvent = 'SUBMIT' | 'RESOLVE' | 'REJECT' | 'RESET';

const form = new StateMachine<FormState, FormEvent>('idle', {
  idle:       { SUBMIT: 'submitting' },
  submitting: { RESOLVE: 'success', REJECT: 'error' },
  success:    { RESET: 'idle' },
  error:      { RESET: 'idle', SUBMIT: 'submitting' },
});

form.send('SUBMIT');   // → submitting
form.send('RESOLVE');  // → success
form.send('SUBMIT');   // false — niedozwolone w 'success'
```

**Dlaczego warto:** eliminuje klasę bugów typu „Cannot submit while submitting". Zamiast flag booleanowych (`isLoading`, `isError`, `isSuccess`) — jeden explicit state. To samo filozoficznie co XState, tylko 20 linii.

---

### 14.18 Autocomplete — Angular signals + RxJS

**Zadanie:** Pole wyszukiwania z podpowiedziami. Ma: debounce 300 ms, anulować stare żądania, pokazywać loading, handle'ować błędy.

```ts
@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input [ngModel]="query()" (ngModelChange)="query.set($event)"
           placeholder="Szukaj użytkownika…" />
    @if (loading()) { <span class="spinner">…</span> }
    @if (error()) { <p class="error">{{ error() }}</p> }
    <ul>
      @for (user of results(); track user.id) {
        <li>{{ user.name }}</li>
      } @empty {
        @if (query().length > 0 && !loading()) { <li>Brak wyników</li> }
      }
    </ul>
  `,
})
export class AutocompleteComponent {
  private http = inject(HttpClient);
  query = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  // Źródłem prawdy jest signal; przepuszczamy przez RxJS dla switchMap/debounce.
  private query$ = toObservable(this.query);

  results = toSignal(
    this.query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(q => q.trim().length < 2
        ? of<User[]>([])
        : this.http.get<User[]>(`/api/users?q=${encodeURIComponent(q)}`).pipe(
            catchError(err => {
              this.error.set(err.message ?? 'Błąd sieci');
              return of<User[]>([]);
            }),
          ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] },
  );
}
```

**Kluczowe decyzje (powiedzieć głośno):**

- **`switchMap`** anuluje poprzedni request — klasyczny race condition fix.
- **`debounceTime(300)`** — standard UX; poniżej 150ms użytkownik jeszcze pisze, powyżej 500ms czuje lag.
- **`distinctUntilChanged`** — nie wysyłaj tego samego zapytania po spacji-backspace.
- **Early return** `q.length < 2` — nie spamuj backendu 1-literowymi query.
- **`toSignal`** w template — nie potrzebujesz `async` pipe.
- **`takeUntilDestroyed`** (nie widać tu, ale `toSignal` robi to pod spodem).

---

### 14.19 Undo / Redo stack — generyczny

```ts
class UndoRedo<T> {
  private past: T[] = [];
  private future: T[] = [];
  constructor(private present: T) {}

  get value(): T { return this.present; }
  get canUndo(): boolean { return this.past.length > 0; }
  get canRedo(): boolean { return this.future.length > 0; }

  /** Zapisz nowy stan; wyczyść future (klasyczna semantyka undo/redo). */
  set(next: T): void {
    if (Object.is(next, this.present)) return;
    this.past.push(this.present);
    this.present = next;
    this.future = [];
  }

  undo(): T {
    if (!this.canUndo) return this.present;
    this.future.push(this.present);
    this.present = this.past.pop()!;
    return this.present;
  }

  redo(): T {
    if (!this.canRedo) return this.present;
    this.past.push(this.present);
    this.present = this.future.pop()!;
    return this.present;
  }
}
```

**Adaptacja do signali:** zamiast trzymać `present` w polu, trzymaj `signal<T>` i mutuj przez `.set()`. Wtedy komponent automatycznie renderuje.

**Ograniczenie pamięci:** dla dużych stanów (edytor tekstu) trzymaj **diffy**, nie kopie. `past: Patch[]` zamiast `past: T[]` — patrz Immer + patches.

---

### 14.20 Wskazówki taktyczne — co działa na rozmowie

- **Mów co robisz.** Cisza = niepewność. „Teraz zajmę się edge case pustej tablicy…".
- **Pisz typy przed implementacją.** `function foo(…): R` — zmusza Cię do uporządkowania myśli.
- **Nie zaczynaj od super-optymalnej wersji.** Naiwne rozwiązanie + komentarz „to jest O(n²), za chwilę zrefaktoruję" jest lepsze niż 10 minut ciszy i od razu O(n).
- **Testuj w głowie na jednym przykładzie.** Prześledź krok po kroku. Rekruter to lubi.
- **Znaj skróty klawiszowe IDE**, który dostaniesz (VS Code zwykle). Multi-cursor, rename symbol, fold. Pokazuje senioralność.
- **Po skończeniu zadaj pytania.** „Ile elementów w wejściu w produkcji?", „Czy to będzie używane na hot-path?". Nawet jeśli rozwiązanie gotowe — to właśnie pokazuje myślenie seniora.

---

## 15. Pytania behawioralne (STAR)

### 15.1 Metoda STAR

- **S**ituation — kontekst (projekt, zespół, problem).
- **T**ask — twoja odpowiedzialność.
- **A**ction — co konkretnie zrobiłaś.
- **R**esult — efekt, najlepiej liczbowy.

### 15.2 Top 15 pytań

1. **Opowiedz o najtrudniejszym projekcie.** (Scale, stakeholders, tech challenges, twoja rola.)
2. **Opisz konflikt w zespole i jak go rozwiązałaś.** (Unikaj "wszyscy się zgodzili"; pokaż proces.)
3. **Kiedy podjęłaś złą decyzję techniczną i jak się z tego wycofałaś.** (Ownership + learning.)
4. **Jak przekonałaś zespół do zmiany technologii?** (Proof-of-concept, ADR, metryki.)
5. **Opowiedz o bugu, który znalazłaś po długim debuggowaniu.** (Metodyka: isolate, reproduce, fix.)
6. **Jak radzisz sobie z presją deadline'u?**
7. **Opisz sytuację, gdy musiałaś powiedzieć "nie" stakeholderowi.**
8. **Jak mentorowałaś juniora?** (Konkrety: code review, pair programming, weekly 1:1.)
9. **Co robisz, gdy nie zgadzasz się z decyzją tech leada?** (Disagree and commit; escalate tylko gdy blocker.)
10. **Opowiedz o projekcie, który poszedł źle — czego się nauczyłaś?**
11. **Jak utrzymujesz się na bieżąco z nowymi technologiami?**
12. **Opisz sytuację, gdy odkryłaś i naprawiłaś incydent produkcyjny.** (Post-mortem blameless.)
13. **Jak wprowadzasz nową osobę do projektu?**
14. **Co lubisz, a czego nie lubisz w obecnej pracy?** (Uważaj — nie szkaluj poprzedniego pracodawcy.)
15. **Gdzie widzisz siebie za 3 lata?**

### 15.3 Zasady

- **Zawsze** używaj STAR, ale w luźnej formie (bez odhaczania).
- **Nie generalizuj** — konkretne przykłady.
- **Bądź autentyczna** — rekruter słyszał 1000 "nauczyłam się komunikacji".
- **Ownership** — nawet porażki pokazuj z perspektywy "co z tego wyniosłam".

---

## 16. Pytania do rekrutera / firmy

### 16.1 O zespole i pracy

1. Jak wygląda typowy dzień seniora w tym zespole?
2. Jaki jest stosunek maintenance'u do nowego kodu?
3. Kto decyduje o tech stacku i jak wygląda proces decyzji?
4. Jak wygląda code review? (PR template, approvers, SLA)
5. Czy zespół ma czas na tech debt?
6. Jaka jest obecna velocity i największe blockery?

### 16.2 O procesie

1. Jak wygląda onboarding?
2. Czy macie ADR/design docs?
3. Jakie macie testy (coverage, e2e, visual regression)?
4. Jaki macie CI/CD, deployment frequency?
5. Jak wygląda incident response i postmortem?

### 16.3 O produkcie

1. Co jest największym technicznym wyzwaniem produktu?
2. Jakie macie SLA / SLO?
3. Kto jest waszym użytkownikiem końcowym?
4. Jakie macie metryki sukcesu?

### 16.4 O rozwoju

1. Ścieżka awansu dla seniora?
2. Budżet na konferencje / książki / kursy?
3. Czas na R&D / side projects?

### 16.5 O kulturze

1. Jak wygląda praca zdalna / hybrydowa?
2. Jak zespół celebrate sukcesy i radzi sobie z porażkami?
3. Jaka jest kultura feedbacku?

### 16.6 Red flags — uważaj na odpowiedzi

- "Pracujemy pod presją" — może znaczyć chroniczny crunch.
- "Mamy dużo do zrobienia" — brak priorytetyzacji.
- "Nie robimy testów, bo nie mamy czasu" — tech debt spiral.
- "Junior sam się uczy" — brak mentoringu.
- "Ciągle zmieniamy wymagania" — brak PO / stakeholder management.

---

## 17. Materiały dodatkowe

### 17.1 Dokumentacja oficjalna

- [Angular](https://angular.dev) — **docs.angular.dev** nowa domena od v17.
- [RxJS](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN](https://developer.mozilla.org/)
- [web.dev](https://web.dev/) — performance, a11y, best practices.

### 17.2 Blogi i newslettery

- [Angular Blog](https://blog.angular.dev/)
- [This Week in Angular](https://mgechev.github.io/) (Minko Gechev)
- [Nx Blog](https://nx.dev/blog)
- [JavaScript Weekly](https://javascriptweekly.com/)
- [Frontend Focus](https://frontendfoc.us/)

### 17.3 Książki

- "Clean Code" — Robert C. Martin
- "Clean Architecture" — Robert C. Martin
- "Designing Data-Intensive Applications" — Martin Kleppmann (system design)
- "Refactoring" — Martin Fowler
- "You Don't Know JS" — Kyle Simpson (seria, free na GitHubie)
- "Effective TypeScript" — Dan Vanderkam

### 17.4 Kanały YouTube / podcasty

- **Joshua Morony** — Angular & Signals.
- **Decoded Frontend** — Dmytro Mezhenskyi.
- **Angular Air** — podcast.
- **JS Party** (Changelog).
- **Syntax** — Wes Bos & Scott Tolinski.

### 17.5 Praktyka

- [Exercism](https://exercism.org/) — kata w TS.
- [Frontend Mentor](https://www.frontendmentor.io/) — realne projekty UI.
- [BigFrontend.dev](https://bigfrontend.dev/) — pytania system design / coding.
- [LeetCode](https://leetcode.com/) — algorytmy (Blind 75 wystarczy).

### 17.6 System Design

- [Frontend System Design Interview](https://www.greatfrontend.com/front-end-system-design-playbook) — GreatFrontEnd.
- [System Design Primer](https://github.com/donnemartin/system-design-primer) — backend-heavy, ale koncepty przydają się frontendowcowi.

---

## 18. Stary vs nowy Angular — porównanie i migracja

Ostatnie cztery lata (Angular v14 → v21) to największy lifting frameworka w jego historii. **Senior musi płynnie tłumaczyć różnice** — na rozmowie często pojawia się pytanie „co się zmieniło?" albo „co byś zmigrował w pierwszej kolejności w legacy appce?".

Ten rozdział to ściąga: **pięć filarów zmian**, tabela decyzyjna „kiedy jeszcze stary pattern", i praktyczny plan migracji.

### 18.1 Pięć kluczowych zmian (TL;DR)

| Obszar              | Stary Angular (≤ v13)                              | Nowy Angular (v19+)                                    | Kiedy stał się default           |
|---------------------|----------------------------------------------------|--------------------------------------------------------|----------------------------------|
| **Moduły**          | `NgModule` obowiązkowy                             | `standalone: true` domyślnie                           | v19 (opt-in od v14)              |
| **Stan komponentu** | RxJS + `BehaviorSubject` / `@Input`                | Signals + `input()` / `output()` / `model()`           | v17 stable, dominujące od v20    |
| **Change detection**| `zone.js` monkey-patches wszystkiego               | Zoneless + sygnały sterują CD                          | v20 stable                       |
| **Control flow**    | `*ngIf`, `*ngFor`, `*ngSwitch` (strukturalne dyr.) | `@if`, `@for`, `@switch`, `@defer`, `@let` (wbudowane) | v17 (domyślny w nowych projektach) |
| **DI**              | Konstruktor + dekoratory                           | `inject()` wszędzie (również w funkcjach)              | v14 stable, default od v19       |

**Jednozdaniowa wersja na rozmowę:** *„Angular 21 to już inny framework — mniej boilerplate'u, mniej RxJS w UI, natychmiastowa reaktywność przez Signals, i CD, które nie wymaga zone.js. NgModule i RxJS nie znikły, ale stały się opcjonalne."*

---

### 18.2 NgModule vs Standalone Components

#### Stary sposób

```ts
// app.module.ts
@NgModule({
  declarations: [AppComponent, UserListComponent, UserCardComponent],
  imports: [BrowserModule, HttpClientModule, RouterModule.forRoot(routes), CommonModule, FormsModule],
  providers: [UserService, { provide: ERROR_HANDLER, useClass: AppErrorHandler }],
  bootstrap: [AppComponent],
})
export class AppModule {}

// main.ts
platformBrowserDynamic().bootstrapModule(AppModule);
```

**Problemy:**
- Duplikacja importów (to samo `CommonModule` w 20 feature-modułach).
- „Barrel hell" — pytanie *co deklaruje co* wymaga grep-owania.
- Shared module anti-pattern — jeden `SharedModule` z 80 komponentami psuje tree-shaking.
- Lazy loading przez `loadChildren: () => import('./feature.module').then(m => m.FeatureModule)`.

#### Nowy sposób

```ts
// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,                                   // ← w v19+ pole opcjonalne, true jest default
  imports: [RouterOutlet, UserCardComponent, DatePipe], // ← importujesz dokładnie to, czego używasz
  template: `<router-outlet />`,
})
export class AppComponent {}

// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: ERROR_HANDLER, useClass: AppErrorHandler },
  ],
});
```

**Zyski:**
- **Mniej boilerplate'u** — 1 plik zamiast 3 (module + routing + barrel).
- **Lepszy tree-shaking** — bundler widzi dokładnie jakie dyrektywy są używane.
- **Prostszy lazy loading** — `loadComponent: () => import('./page').then(m => m.PageComponent)`.
- **Prostsze testy** — `TestBed.configureTestingModule({ imports: [MyComponent] })` bez deklarowania dummy-modułów.

#### Migracja

```bash
# Automatyczny schematic — idzie przez cały projekt.
ng generate @angular/core:standalone

# 3 kroki, każdy osobno:
#   1. Convert all components, directives, pipes to standalone
#   2. Remove unnecessary NgModule classes
#   3. Bootstrap the application using standalone APIs
```

**Co schematic nie zrobi:** custom `providers` z injection tokenami poskleja, ale guardy, resolvery i interceptory w stylu „class-based" trzeba przepisać ręcznie na wersje funkcyjne.

---

### 18.3 Observables vs Signals (stan w komponencie)

To **najczęstsze pytanie** na rozmowie „stary vs nowy". Kluczowy punkt: **nie zastępują się 1:1**. Signals są lepsze do **stanu komponentu**, RxJS jest lepsze do **strumieni asynchronicznych**.

#### Porównanie head-to-head

```ts
// ── STARY ──────────────────────────────────────────────────
@Component({
  template: `
    <p>Count: {{ count$ | async }}</p>
    <p>Double: {{ double$ | async }}</p>
    <button (click)="inc()">+</button>
  `,
})
export class Old {
  count$ = new BehaviorSubject(0);
  double$ = this.count$.pipe(map(n => n * 2));
  inc() { this.count$.next(this.count$.value + 1); }
}

// ── NOWY ───────────────────────────────────────────────────
@Component({
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="inc()">+</button>
  `,
})
export class New {
  count = signal(0);
  double = computed(() => this.count() * 2);
  inc() { this.count.update(n => n + 1); }
}
```

**Różnice, o których warto powiedzieć:**

| Aspekt                         | BehaviorSubject + async pipe         | signal + computed                     |
|--------------------------------|--------------------------------------|---------------------------------------|
| **Odczyt w template**          | `value$ \| async` — wymaga pipe'a    | `value()` — wywołanie funkcji         |
| **Odczyt w TS**                | `.getValue()` (brzydkie) lub subscribe | `value()` (synchroniczne, zawsze aktualne) |
| **Derived state**              | `pipe(map(...))` + nowy Observable   | `computed(...)` — lazy, memoized      |
| **Nie-subscribe ≠ aktualna**   | Problem (trzeba `shareReplay`)       | Nie — sygnał zawsze ma `current value`|
| **Glitch-free**                | Zależne od operatorów (combineLatest) | Tak — computed re-ewaluuje raz per tick |
| **Cleanup**                    | `takeUntilDestroyed()` / ngOnDestroy | Automatyczny (effect + DestroyRef)    |

#### Kiedy *nadal* RxJS

- **HTTP** — `HttpClient` zwraca Observable. W 90% przypadków: `toSignal(http.get(...))`.
- **WebSocket / SSE / EventSource** — strumień wydarzeń.
- **Debounce / throttle / switchMap** — cancellation przy szybkich zmianach (autocomplete).
- **Combine z race condition** — merge, concat, combineLatest.
- **Retries, backoff** — `retry({ delay: ... })`.

**Reguła seniora:** „RxJS dla strumienia, Signals dla stanu. Na granicy — `toSignal()`."

#### Interop

```ts
// Observable → Signal (konsumpcja)
results = toSignal(
  this.query$.pipe(debounceTime(300), switchMap(q => this.api.search(q))),
  { initialValue: [] },
);

// Signal → Observable (gdy potrzebujemy operatorów)
private query$ = toObservable(this.query); // signal → Observable
```

---

### 18.4 Zone.js vs Zoneless

#### Stary świat: `zone.js`

`zone.js` **małpiowe-łatał** wszystkie async API (`setTimeout`, `Promise.then`, `addEventListener`, XHR, …), żeby Angular wiedział kiedy uruchomić change detection.

**Konsekwencje:**
- Każdy `setTimeout(() => {})` w libce nie-angularowej wywoływał **cały cykl CD na wszystkich komponentach**.
- Bibliotekom jak `Monaco editor`, `Three.js` trzeba było `NgZone.runOutsideAngular(...)`.
- Performance cap: nie ważne jak OnPush — `zone.js` goni po drzewie co interakcję.
- ~80 kB bundle'a (gzip ~30 kB) tylko dla zone.

#### Nowy świat: zoneless

```ts
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(), // ← od v20 stable
    provideRouter(routes),
  ],
});

// angular.json — usuń polyfill
"polyfills": [
  // "zone.js",   ← usunąć
  "zone.js/testing", // dla ng test, do v21 jeszcze używane
]
```

**Co teraz uruchamia CD:**

1. **Sygnały** w template — zmiana `count.set(x)` oznacza komponent jako dirty.
2. **Eventy w template** — `(click)`, `(input)` itd.
3. **Async pipe** — przy emisji nowej wartości.
4. **Manualne** — `ChangeDetectorRef.markForCheck()` (rzadko).

**Pułapki migracji:**

- `setTimeout(() => this.data = ...)` — **nie zadziała** bez sygnału. Albo sygnał, albo `ChangeDetectorRef`.
- `element.addEventListener` poza template — musi zakończyć się sygnałem/`markForCheck`.
- Testy: `fakeAsync` + `tick()` nadal działają (testowanie wciąż zone-based do v21/v22).

**Zysk bundle'a:** ~30 kB gzip. **Zysk perf:** znikają niepotrzebne cykle CD z libów nie-angularowych.

---

### 18.5 Control flow — `*ngIf` vs `@if`

#### Stary

```html
<div *ngIf="user$ | async as user; else loading">
  {{ user.name }}
  <ul>
    <li *ngFor="let item of user.items; trackBy: trackById">{{ item.title }}</li>
  </ul>
</div>
<ng-template #loading>Ładowanie…</ng-template>

<div [ngSwitch]="status">
  <p *ngSwitchCase="'ok'">OK</p>
  <p *ngSwitchCase="'err'">Błąd</p>
  <p *ngSwitchDefault>—</p>
</div>
```

#### Nowy

```html
@if (user(); as u) {
  {{ u.name }}
  <ul>
    @for (item of u.items; track item.id) {
      <li>{{ item.title }}</li>
    } @empty {
      <li>Brak elementów.</li>
    }
  </ul>
} @else {
  <p>Ładowanie…</p>
}

@switch (status()) {
  @case ('ok')  { <p>OK</p> }
  @case ('err') { <p>Błąd</p> }
  @default      { <p>—</p> }
}
```

**Co się zyskuje:**

| Stary                            | Nowy                                                | Zysk                                      |
|----------------------------------|-----------------------------------------------------|-------------------------------------------|
| `*ngIf` + `ng-template` + `#ref` | `@if / @else`                                       | **1 blok**, nie musisz nazywać templatu   |
| `trackBy: trackById`             | `track item.id` (inline expression)                 | **~90% szybsze** na dużych listach (v17 benchmark) |
| Brak odpowiednika `@empty`       | `@for (... ; empty { ... })`                        | Natywny „brak danych"                     |
| `[ngSwitch]` + 3 dyrektywy       | `@switch` z `@case / @default`                      | Bez importu CommonModule                  |
| —                                | `@defer (on viewport) { <heavy /> }`                | Lazy-loading fragmentu template'u         |
| —                                | `@let value = expensiveCalc()` w template            | Jednorazowa zmienna, nie trzeba pipe      |

#### Migracja

```bash
ng generate @angular/core:control-flow
# Przepisuje *ngIf / *ngFor / *ngSwitch na @if / @for / @switch w całym projekcie.
```

Schematic jest bezpieczny — robi git diff przed commitem, ale uważaj na edge case z `*ngIf="x as y"` wewnątrz `*ngFor`.

---

### 18.6 Decoratory vs funkcje (`inject()`, `input()`, `output()`)

#### DI

```ts
// Stary — constructor DI
export class OldService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    @Optional() private logger?: LoggerService,
  ) {}
}

// Nowy — inject()
export class NewService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private logger = inject(LoggerService, { optional: true });
}
```

**Zyski `inject()`:**
- Można wołać **w funkcjach** — guardy, resolvery, interceptory, stand-alone utilsy.
- Nie dublujesz nazw pola 2× (jak w konstruktorze).
- Lepiej działa z `strictPropertyInitialization` + generics.
- Działa w `CanActivateFn`, `HttpInterceptorFn`, `ResolveFn`, `EnvironmentInitializer`.

#### Input / Output / ViewChild

```ts
// Stary
export class OldCard {
  @Input() user!: User;
  @Input({ required: true }) id!: string;
  @Output() save = new EventEmitter<User>();
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) this.recalc();
  }
}

// Nowy
export class NewCard {
  user = input<User>();                 // signal input (readonly)
  id   = input.required<string>();      // wymuszony przy bindingu
  save = output<User>();                // funkcja (emit nie EventEmitter)
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  // Reactive zamiast ngOnChanges — effect reaguje na zmianę inputa.
  constructor() {
    effect(() => {
      const u = this.user();
      if (u) this.recalc(u);
    });
  }
}
```

**Dlaczego lepiej:**
- **Signal inputs** są *automatycznie reaktywne* — komponent re-renderuje się bez `ngOnChanges`.
- `input.required<T>()` — błąd compile-time, nie runtime.
- `model<T>()` — two-way binding bez `@Input() + @Output()` parą.
- `viewChild()` / `viewChildren()` → sygnały, nie `QueryList`.

#### Guards & interceptors — class-based vs functional

```ts
// Stary — klasa + dekorator
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    return this.auth.isLoggedIn() || this.router.parseUrl('/login');
  }
}

// Rejestr w routes:
{ path: 'admin', canActivate: [AuthGuard], component: AdminComponent }

// ── Nowy — funkcja ──────────────────────────────────────────
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.parseUrl('/login');
};

// Rejestr:
{ path: 'admin', canActivate: [authGuard], component: AdminComponent }
```

To samo dla `HttpInterceptorFn`, `ResolveFn`, `CanDeactivateFn`.

---

### 18.7 Tabela decyzyjna — „kiedy jeszcze zostajemy przy starym"

| Scenariusz                                              | Rekomendacja                                  |
|---------------------------------------------------------|-----------------------------------------------|
| Nowy projekt, greenfield                                | 100% standalone + signals + zoneless         |
| Migracja v14 → v21, zespół ma RxJS w krwi               | Signals tylko do stanu komponentu; RxJS zostaje w serwisach |
| Legacy NgRx store z 50 reducerami                       | Zostaw NgRx (lub migruj na `signalStore` z `@ngrx/signals`) |
| Projekt używający `ng-bootstrap` < v18                  | Trzymaj NgModule dopóki biblioteka nie zmigrowana |
| Dużo `ngOnChanges` z kompleksową logiką                 | Najpierw signal inputs + effect — potem wyrzucasz lifecycle |
| Aplikacja renderująca mapę / canvas z `NgZone.runOutsideAngular` | Zoneless to wygrana — usuwasz boilerplate |
| Frontend z `*ngIf` w 400 templatach                     | `ng g @angular/core:control-flow` + code review |
| Microfrontend używający Module Federation z NgModule remote | Zostaw NgModule dopóki shellA zmigrowany |
| Aplikacja działa w IE11 (serio?)                        | Nie da się — zoneless + standalone wymaga evergreen |

**Złota reguła:** *nie migruj na siłę — migruj feature-po-feature przy okazji nowych historyjek. `ng update` robi 80% roboty; pozostałe 20% to pattern changes.*

---

### 18.8 Plan migracji ze starego Angulara na nowy (v14 → v21)

**Faza 0 — fundament (tydzień):**
1. `ng update @angular/core @angular/cli --force` — iteracyjnie, major po majorze.
2. Rozwiąż deprecations z [update.angular.io](https://update.angular.io).
3. Przejdź na `strict: true` w `tsconfig.json` jeśli jeszcze nie.

**Faza 1 — standalone (2-4 tygodnie):**
1. `ng g @angular/core:standalone` krok 1 (convert).
2. `ng g @angular/core:standalone` krok 2 (remove modules).
3. `ng g @angular/core:standalone` krok 3 (bootstrap).
4. Zastąp `HttpClientModule` → `provideHttpClient()`.
5. Zastąp `RouterModule.forRoot(routes)` → `provideRouter(routes)`.

**Faza 2 — control flow (dzień):**
1. `ng g @angular/core:control-flow`.
2. Code review zmian w templatach.

**Faza 3 — signals (stopniowo, feature-po-feature):**
1. Nowe komponenty: tylko `input()` / `output()` / `signal()`.
2. Istniejące: przy każdej zmianie wymień `@Input` → `input()`.
3. `BehaviorSubject` w komponentach → `signal()` (zachowaj w serwisach jeśli strumień).
4. `ngOnChanges` → `effect(() => ...)` reagujący na signal input.

**Faza 4 — zoneless (ostatni krok):**
1. Upewnij się że wszystkie state changes są przez signal/event/async pipe.
2. Znajdź `setTimeout / setInterval / addEventListener` — dodaj `signal.set()` lub `markForCheck()`.
3. `provideZonelessChangeDetection()` w `main.ts`.
4. Odpal całość, przetestuj regresy. Usuń zone.js z polyfills.

**Faza 5 — higiena:**
1. Class-based guards/resolvers/interceptors → funkcyjne.
2. `@ViewChild` → `viewChild()`.
3. `EventEmitter` → `output()`.
4. `constructor(inj: X)` → `inject(X)`.

---

### 18.9 Najczęstsze pytania rozmówców

1. **„Czy NgModule jest deprecated?"** — *Nie, ale nie jest już potrzebne w nowych projektach. Standalone jest default od v19, a NgModule traktujemy jak legacy. Zespół Angulara deklaruje długie wsparcie.*
2. **„Czy RxJS umiera?"** — *W UI tak, w serwisach żyje. `HttpClient`, WebSockety, operatory cancellation zostają. Do stanu komponentu — Signals.*
3. **„Zoneless — co mogło się zepsuć?"** — *setTimeout bez sygnału, eventy dodane przez `addEventListener` nie przez template, biblioteki third-party zakładające zone.*
4. **„Co daje @defer ponad lazy-loaded route?"** — *Granularność: lazy-load'ujesz konkretny fragment template'u (np. sekcję komentarzy na dole strony), nie całą stronę. Możesz lazy-load'ować na viewport, interaction, hover, idle, timer.*
5. **„Czym różni się `signal` od `BehaviorSubject`?"** — *Signal synchronicznie czyta aktualną wartość (`value()`), nie wymaga subscribe; computed jest lazy i memoized; integruje się z CD automatycznie; brak multi-casting bo zawsze jest jednym „current value".*
6. **„Czy `input()` i `@Input()` działają razem?"** — *Tak, aż do pełnej migracji. Ale w jednym komponencie mieszanie jest confusing — zrefaktoruj od razu cały plik.*
7. **„Czy `inject()` działa w konstruktorze?"** — *Tak — i to jest zalecane miejsce (`injection context`). Poza tym działa też w factory, guardach, interceptorach, resolverach. Nie zadziała w `ngOnInit` bez ręcznego `runInInjectionContext`.*

---

## 19. Connectis (Frontend Angular / bank) — cheat sheet pod rozmowę

> Ta sekcja jest dopasowana do oferty Connectis z 2026-04-19: **Frontend Developer (Angular)** dla finansowego partnera (bank). Rozmowa pojutrze. Pierwszy etap — **AI Recruiter (AIR)**, więc odpowiadaj strukturalnie, z jawnymi słowami-kluczami. Wymagane: Angular / **Camunda** / **GitHub Copilot** / Agile. Nice-to-have: **AML / KYC / AWS / REST API**. Stack produktowy: Angular 21 refactoring + **Camunda Tasklist integration** + OneAML + KYC flows.

### 19.1 Fundamentalna pętla przygotowania (2 dni)

| Dzień | Zakres | Format |
|---|---|---|
| **D-2 (dziś)** | Przeleciej quiz z naciskiem na kategorie **Camunda / Domena / AI-tools**. Przeczytaj fiszki: wszystkie z `cat: "camunda"` + `cat: "domain"` + `cat: "ai-tools"`. | 90 min |
| **D-1 (jutro)** | Mock interview x2 (reset po pierwszym), ze szczególnym naciskiem na pytania `cat: "camunda"` i `cat: "domain"`. STAR dla dwóch historii: *tech decision in regulated industry* + *refactor legacy Angular*. | 2 h |
| **D-day** | 30 min przed — sprawdź mikrofon i kamerę, wodę pod ręką, papier + długopis. Powtórz 5 numerów z PZU/banking: **GIIF, KNF, PSD2, SCA, FATF**. | 30 min |

### 19.2 Hot topics — must-know pod AIR

**Trigger words, które AIR łapie i ocenia (jak scoring):**

- **Camunda**: `BPMN 2.0`, `user task`, `service task`, `process variables`, `Tasklist`, `Operate`, `Zeebe`, `DMN`, `bpmn-js viewer`, `correlation message`, `form key`, `engine REST API`, `Camunda 7 vs 8`, `embedded forms vs Camunda Forms`.
- **KYC / AML**: `CDD`, `EDD`, `SDD`, `PEP` (Politically Exposed Person), `STR`, `SAR`, `GIIF` (Generalny Inspektor Informacji Finansowej), `KNF` (Komisja Nadzoru Finansowego), `PSD2`, `SCA`, `FATF`, `OneAML`, `risk-based approach`, `adverse media`, `transaction monitoring`, `sanctions screening`.
- **GitHub Copilot**: `inline completion`, `Chat`, `Agent mode`, `Content Exclusions`, `Business/Enterprise tier`, `no training on your code`, `review-first mindset`, `prompt patterns`, `audit log`.
- **Angular 21**: `standalone`, `signals`, `zoneless`, `@if/@for/@defer`, `input() / output() / model()`, `inject()`, `provideHttpClient(withInterceptors())`, `SignalStore (@ngrx/signals)`, `toSignal / toObservable`, `DestroyRef + takeUntilDestroyed`.
- **AWS (nice)**: `S3 + CloudFront`, `Cognito User Pool / Identity Pool`, `ACM`, `Route 53`, `CloudWatch RUM`, `OIDC GitHub Actions → IAM role (no keys)`, `Origin Access Control`.

### 19.3 Camunda — minimum produktowe dla frontu

**Jak działa Camunda Tasklist (C7, bo OneAML / typowa bankowość):**

1. **Engine** trzyma procesy BPMN (np. *„weryfikacja klienta KYC"*) + instancje (konkretna osoba w trakcie procesu) + user-taski (kroki wymagające operatora).
2. **Tasklist REST API** daje frontowi endpointy:
   - `GET /task?assignee=current-user&active=true` — moje otwarte zadania.
   - `POST /task/{id}/claim` — przypisuję zadanie do siebie (lock).
   - `POST /task/{id}/submit-form` — kończę task + wysyłam `variables` procesu.
   - `GET /task/{id}/form-variables` — pobieram stan zmiennych dla formularza.
3. **Zmienne procesu** przesyłasz w formacie `{ [key]: { value, type } }` — np. `{ decision: { value: "approve", type: "String" } }`. Bez `type` engine odrzuci.
4. **Form key** — każdy user-task ma `formKey` (np. `embedded:app:forms/kyc-verify.html` albo `camunda-forms:bpmn:KycForm`). W Angularze: wg `formKey` ładujesz własny komponent (w OneAML zwykle mapa `formKey → Angular component`).
5. **bpmn-js viewer** — dla „widoku procesu" w UI (np. *„gdzie jest teraz sprawa klienta?"*). Biblioteka `bpmn-js` renderuje BPMN XML do SVG. Integracja z Angularem przez cienki wrapper — ngAfterViewInit + `new BpmnViewer({ container })`.
6. **Correlation message** — z frontu wysyłasz `POST /message` z `messageName` i `businessKey`, żeby obudzić czekający `intermediate message event` w procesie (np. operator banku klika „got AML response" i proces idzie dalej).

**Różnice C7 vs C8 (Zeebe):**

| Aspekt | C7 | C8 (Zeebe) |
|---|---|---|
| Baza | Relacyjna (Postgres/Oracle) | Event-sourced, rozproszona |
| Protokół | REST do wszystkiego | gRPC do engine + REST dla Tasklist/Operate |
| Skalowanie | Pionowe | Poziome (cloud-native) |
| API Tasklist | Camunda 7 REST | **Inne** endpointy — `/tasks/search`, `/tasks/{id}/complete`, `/tasks/{id}/assign` |
| Historia | W bazie | W Operate (osobny komponent) |

Jeśli rekruter zapyta „czy znasz 7 czy 8", powiedz: *„Pracowałabym z dowolną, różnica dla frontu to tylko kontrakty Tasklist API — w C8 jest `/tasks/search` zamiast `/task`, i w C8 Operate jest osobną aplikacją do historii"*.

### 19.4 KYC / AML — minimum domeny dla frontu

**Proces KYC w banku (happy path):**

1. **Onboarding** — zbieramy: dane osobowe, dokument tożsamości (OCR + face-match), adres, źródło majątku (`source of funds`), cel relacji (`purpose of relationship`).
2. **Screening** — sprawdzenie w listach sankcyjnych (OFAC, UE, ONZ), PEP (Politically Exposed Person — polityk/krewny), adverse media.
3. **Risk scoring** — `low / medium / high / prohibited` na bazie: kraj, typ klienta, produkt, historia transakcji.
4. **CDD / EDD / SDD** — poziom weryfikacji zależny od ryzyka:
   - **SDD** (Simplified) — low-risk, np. klient z UE z regularnym wynagrodzeniem.
   - **CDD** (Customer Due Diligence) — default, średnie ryzyko.
   - **EDD** (Enhanced) — PEP, kraje wysokiego ryzyka, skomplikowana struktura własnościowa. Wymaga dodatkowych dokumentów + approval senior-managera.
5. **Ongoing monitoring** — transaction monitoring + okresowy review (co 1/3/5 lat wg poziomu ryzyka) + trigger-based review (np. skok transakcji 10x).
6. **STR / SAR** — jeśli operator widzi podejrzaną transakcję → **Suspicious Transaction/Activity Report** do **GIIF** (polski FIU). Bank musi wysłać w ciągu 2 dni. W UI: przycisk „Report to GIIF" z obowiązkowym opisem + ewidencją + audit trail.

**Kluczowe skróty (AIR łapie je jako sygnał domain-knowledge):**

| Skrót | Rozwinięcie | Co warto o tym wiedzieć |
|---|---|---|
| **KYC** | Know Your Customer | Podstawa — identyfikacja klienta |
| **AML** | Anti-Money Laundering | Nadrzędna — KYC jest częścią AML |
| **CDD** | Customer Due Diligence | Standardowy poziom weryfikacji |
| **EDD** | Enhanced Due Diligence | PEP, high-risk — więcej dokumentów |
| **PEP** | Politically Exposed Person | Politycy + krewni + bliscy współpracownicy |
| **STR / SAR** | Suspicious Transaction/Activity Report | Zgłoszenie do GIIF — 2 dni |
| **GIIF** | Gen. Inspektor Informacji Finansowej | Polska FIU |
| **KNF** | Komisja Nadzoru Finansowego | Polski regulator finansów |
| **FATF** | Financial Action Task Force | Międzynarodowa organizacja AML |
| **PSD2** | Payment Services Directive 2 | UE, open banking + SCA |
| **SCA** | Strong Customer Authentication | 2 z 3: wiedza, posiadanie, biometria |
| **OneAML** | Produkt compliance | OneAML = end-to-end AML suite używana w polskich bankach |

### 19.5 GitHub Copilot w regulowanej branży

**Co AIR chce usłyszeć (kolejność argumentów):**

1. **„Używam Copilot świadomie, nie ślepo"** — każdą sugestię traktuję jak PR od juniora: review, test, zadbaj o edge-case'y.
2. **„W banku zawsze Enterprise/Business tier"** — bo: (a) nie trenują na waszym kodzie, (b) admin audit log, (c) IP indemnity (odpowiedzialność za ewentualne naruszenie copyright).
3. **„Content Exclusions dla wrażliwych repo"** — pliki typu schemas/, terraform/secrets, fixtures z PII — exclude z indeksu Copilota. Robisz to w settings organizacji GitHub.
4. **„Prompt patterns, które stosuję"**: (a) *specification prompting* — najpierw piszę komentarz z kontraktem funkcji, dopiero potem generuję, (b) *test-first* — piszę test, każę Copilotowi wygenerować implementację, (c) *refactor prompts* — „zrefaktoruj ten komponent na signals" + kontekst.
5. **„Agent mode używam ostrożnie"** — tylko na branch feature/, z pipeline CI + code review. Nigdy nie na main.
6. **„Wiem, czego Copilot nie powie dobrze"** — domain rules (KYC/AML logic), security-critical flows (auth, sanctions screening), performance-critical hot paths. Tam piszę sama + proszę Copilota tylko o boilerplate.

### 19.6 AWS — nice-to-have cheat sheet (frontend perspective)

**Stack typowego Angulara na AWS:**

```
GitHub Actions (build) ──(OIDC)──▶ IAM Role (deploy)
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                            S3            CloudFront ── ACM (TLS cert)
                         (static)         (CDN + cache)
                                              │
                                          Route 53 (DNS)
```

- **S3** — bucket z plikami statycznymi, *website hosting OFF* (dostęp tylko przez CloudFront, OAC).
- **CloudFront** — CDN + cache, `index.html` z `Cache-Control: no-cache` (żeby deploy był natychmiastowy), assets z hash-em → `Cache-Control: max-age=31536000, immutable`.
- **ACM** — darmowy TLS dla CloudFront.
- **Route 53** — DNS (A-record alias do CloudFront).
- **Cognito** — auth: User Pool (uwierzytelnianie) + Identity Pool (AWS credentials dla klienta, zwykle nie potrzebne w bankowości gdzie auth robi backend przez BFF).
- **CloudWatch RUM** — real user monitoring (Core Web Vitals, błędy JS).
- **IAM + OIDC** — GitHub Actions loguje się do AWS przez OIDC (bez long-lived access keys) — audytowalne, rotowalne.

**Jeśli rekruter zapyta „znasz AWS?":** *„Znam frontend-perspective: deploy S3+CloudFront z GitHub Actions przez OIDC, Cognito na auth gdy nie ma BFF, CloudWatch RUM na monitoring. Dla backendu-heavy tematów (Lambda, API Gateway) wspierałabym się doc-em i architektem."*

### 19.7 Angular 21 refactoring — 10 typowych kroków migracji v14→v21

Projekt Connectis mówi wprost o *„refactoring Angular 21"*. To plan, który możesz przedstawić jako *„moje 10 kroków":*

1. **Audit baseline** — `ng version`, bundle size (source-map-explorer), CWV z RUM.
2. **Update do v17** — control flow migration `ng g @angular/core:control-flow` (ngIf→@if, ngFor→@for), standalone migration `ng g @angular/core:standalone`.
3. **Zastąp NgModule → standalone** — `bootstrapApplication(AppComponent, { providers: [...] })`, moduły zostają tylko jako legacy wrapper gdy lib.
4. **Routing → `loadComponent` / `loadChildren` z `() => import(...)`** + `provideRouter`.
5. **DI nowy styl** — `inject(Service)` w property initializers, usuń konstruktorowe zastrzyki gdzie możesz.
6. **Sygnały w UI** — state komponentu na signal/computed; async pipe zostawiam tylko gdy źródło to naturalny stream.
7. **Update do v21** — formularze `input()/output()/model()`, `@defer` dla ciężkich sekcji (komentarze, mapy), `view transitions API`.
8. **Zoneless** — `provideZonelessChangeDetection()`, usuń zone.js, audyt setTimeout/addEventListener → end z `sig.set()`.
9. **RxJS slim** — zostaje tylko na HTTP/WS/complex async; reszta signals + computed. `takeUntilDestroyed()` wszędzie.
10. **Smoke tests + budget** — `angular.json` budget dla bundle-a, regression tests przed każdym mergem, feature flagi na nowe ścieżki.

### 19.8 STAR — 3 historie pod Connectis

**STAR #1 — Tech decision in regulated industry (AIR to poda jako pytanie):**

- **S**: Fintech startup z obszaru bankingu, klient compliance-heavy. Dostałam zadanie zaproponować state management dla nowego modułu KYC (50+ komponentów, integracja z 3 backendami).
- **T**: Wybrać między klasycznym NgRx (team już zna) a nowym @ngrx/signals SignalStore.
- **A**: 3-kryteria doc: auditability (Redux DevTools obsługuje oba), LoC (SignalStore ~30% mniej), learning curve (SignalStore prostszy dla juniorów). POC w jednej feature → czas-do-merge 5d→2d. Pokazałam compliance-architectowi że immutability jest gwarantowana, a każda akcja ma traceable event w DevTools.
- **R**: Zespół zatwierdził SignalStore. Migracja 2 sprinty. 30% mniej LoC w state-layer. Nowy junior onboard w 2 dni zamiast 2 tyg. Lekcja: w regulowanej branży argumentuj *traceability* i *precedens*, nie tylko *szybciej/lepiej*.

**STAR #2 — Legacy Angular migration:**

Zobacz sekcję 18.8 — użyj tego planu jako *„zrobiłam" dla v11→v19*. Liczby: bundle 2.4→1.3 MB (-46%), LCP 4.2→1.8s (-57%), INP 180→65ms. Zero regresji w 3 miesiące.

**STAR #3 — Camunda integration (jeśli pytają bez niej, podaj sama):**

- **S**: Projekt dla banku, operator KYC dostawał 200 alertów dziennie w Camunda Tasklist — obsługiwali po kolei bez priorytetów, SLA strzelał.
- **T**: Zbudować UI, które priorytetyzuje + redukuje kliknięcia.
- **A**: Refactoring listy → sticky filters + sort po risk-score + keyboard shortcuts (J/K/A/R/E). Bulk actions z wymuszonym commentem (audit). Optimistic UI dla claim + rollback na 409. Polling 15s + focus-refresh.
- **R**: Czas handle'owania alertu 3m→1m20s. SLA breaches -70%. Operator przeszedł z *„klikaczy"* na *„reviewerów"* — mogli zrobić 350 alertów zamiast 200 z mniejszą liczbą błędów.

### 19.9 Pytania do rekrutera (koniec rozmowy, zawsze zadaj)

1. *„Jaka wersja Camunda jest na produkcji — 7 czy 8? Planujecie migrację?"* — pokazuje że rozumiesz różnicę.
2. *„Jak wygląda flow deploy — CI/CD, kto approveuje release w regulowanej branży?"*
3. *„Na ile feature-teamów się dzielicie i jak dzielicie kod — monorepo / polyrepo / MFE?"*
4. *„Jaki jest stosunek nowej pracy (Angular 21 refactor) do maintenance starej?"*
5. *„Czy zespół ma product-ownera z obszaru AML/KYC, czy domain knowledge dzielicie na siebie?"*
6. *„Copilot — Business czy Enterprise tier? Macie Content Exclusions na KYC schemas?"* — to pokazuje że myślisz o compliance, nie tylko o kodzie.
7. *„Onboarding — ile trwa zwykle do pierwszego PR?"*

### 19.10 Czerwone flagi i zachowania pod AIR

**Co robić:**

- Mów wolno, struktura: **„Po pierwsze..., Po drugie..., Podsumowując..."**.
- W każdej odpowiedzi użyj 2-3 trigger-words z sekcji 19.2.
- Przy pytaniach sytuacyjnych zawsze STAR (Situation → Task → Action → Result).
- Gdy nie wiesz: *„Nie pracowałam z X bezpośrednio, ale wiem, że działa jak Y, więc podszedłbym..."* — AIR widzi to jako meta-knowledge.

**Czego unikać:**

- *„Eee..."*, *„yyy..."*, długie pauzy. Lepiej powiedz *„zastanawiam się chwilę"*.
- Sugerowania narzędzia bez uzasadnienia (*„wzięłabym NgRx"* bez *dlaczego*).
- Mieszania PL/EN w jednym zdaniu (AIR transkrybuje — wygląda niepewnie).
- Negatywnych komentarzy o poprzednim pracodawcy — AI łapie sentiment.

---

## Aktualizacje dokumentu

- **2026-04-21** — wersja 1.0 — pierwsza kompletna wersja bazowa.
- **2026-04-21** — wersja 1.1 — rozszerzono sekcję 14 (Live coding): intro z senior-checklist, 14.9 rozbite na 6 pełnych rozwiązań (twoSum, FizzBuzz, flatten, groupBy, fib, anagram), 11 nowych zadań 14.10–14.20 (debounce z flagami, throttle+cancel, curry/compose, memoize+TTL, LRU O(1), promise pool, retry+jitter, FSM, autocomplete signals+RxJS, undo/redo, wskazówki taktyczne).
- **2026-04-21** — wersja 1.2 — dodano rozdział 18 „Stary vs nowy Angular — porównanie i migracja": 5 filarów zmian (NgModule/standalone, RxJS/Signals, zone/zoneless, *ngIf/@if, decoratory/inject), interop, tabela decyzyjna, 5-fazowy plan migracji v14→v21, 7 FAQ rekrutera.
- **2026-04-21** — wersja 1.3 — dodano mock interview (poza tym dokumentem): `mock.html` + `js/mock-data.js` (10 pytań open-ended PL/EN pokrywające Angular, RxJS, perf, architecture, testing, TS, CSS, system-design, behavioural) + `js/mock.js` (timer na pytanie 180–300s, pole odpowiedzi, reveal wzorca, samoocena 3-poziomowa, wynik w % + lista „do powtórki").
- **2026-04-21** — wersja 1.4 — pakiet **Connectis cheat sheet**: dodano rozdział 19 (10 podsekcji: pętla 2-dniowa, hot topics, Camunda produktowo, KYC/AML podstawy, Copilot w regulated industry, AWS frontend, Angular 21 refactor-10-steps, 3 STAR stories, pytania do rekrutera, zachowania pod AIR), 4 nowe kategorie w apce (`camunda`, `domain`, `ai-tools`, `cloud`) z kolorami CSS i i18n, 23 nowe fiszki w `definitions-data.js` (10 Camunda + 5 KYC/AML + 4 Copilot + 4 AWS), 3 nowe pytania mock interview (`mk-camunda-tasklist`, `mk-kyc-step-flow`, `mk-aml-alert-ux`), 7 nowych pytań quizu (3 Camunda + 2 domain + 2 ai-tools).

## Kolejne zadania (do ustalenia z Claude)

- [x] **Wygenerować quiz z tego dokumentu → zasilić `quiz.html` w apce `paula-pzu`.** *(2026-04-21: 43 pytania PL/EN, single + multi, 9 kategorii. Plik: `quiz.html` + `js/i18n.js` + `js/quiz-data.js` + `js/quiz.js`.)*
- [x] **Przygotować fiszki z definicjami → zasilić `definitions.html`.** *(2026-04-21: 53 fiszki PL/EN w 9 kategoriach, search + filtr kategorii + expand/collapse. Plik: `definitions.html` + `js/definitions-data.js` + `js/definitions.js`, i18n rozszerzone o `defs.*` i `cat.*`.)*
- [x] **Rozbudować sekcję *Live coding* o więcej zadań z kompletnymi rozwiązaniami.** *(2026-04-21: sekcja 14 rozszerzona z 9 do 20 podsekcji — 6 pełnych algorytmów w 14.9, 10 nowych zadań 14.10–14.19 (advanced debounce/throttle, curry, memoize+TTL, LRU, promise pool, retry+jitter, FSM, autocomplete signals+RxJS, undo/redo) + 14.20 wskazówki taktyczne.)*
- [x] **Dodać sekcję porównania "stary vs nowy Angular"** (NgModules vs standalone, Observables vs Signals, zone.js vs zoneless). *(2026-04-21: rozdział 18 z 9 podsekcjami — TL;DR tabela 5 filarów, NgModule→standalone, Observables↔Signals z tabelą interop, zone→zoneless z pułapkami, control flow schematic, decoratory→inject/input/output, tabela decyzyjna „kiedy stare", 5-fazowy plan migracji, 7 FAQ rekrutera.)*
- [x] **Wygenerować mock interview — 10 pytań, timed answer, feedback.** *(2026-04-21: `mock.html` + `js/mock-data.js` + `js/mock.js` — 10 open-ended pytań PL/EN pokrywających Angular / RxJS / perf / architecture / testing / TS / CSS / system-design / behavioural, timer 180–300s na pytanie (budżet 36 min), reveal wzorcowej odpowiedzi z key-points, samoocena good/ok/bad → wynik w % + lista tematów do powtórki. Link w navie dodany na `definitions.html` i `quiz.html`.)*
- [x] **Connectis cheat sheet — pakiet pod rozmowę z Connectis / bankiem.** *(2026-04-21: rozdział 19 (10 podsekcji) + 23 nowe fiszki (Camunda/KYC-AML/Copilot/AWS) + 3 mock questions + 7 quiz questions + 4 nowe kategorie z kolorami/i18n.)*
