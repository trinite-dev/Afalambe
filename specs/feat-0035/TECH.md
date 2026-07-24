# feat-0035: Tech Spec — Public chat demo (`/demo`)

## Status

**Planned.** Prerequisites from [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md) and [feat-0036](../feat-0036/TECH.md) are **implemented**. Demo route, client, and bundles are **not** in the repo yet.

## Routes (URL locales)

Per [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md) section 4 — add demo to the URL map when shipping:

| French (default) | English | Auth | Indexing |
|------------------|---------|------|----------|
| `/demo` | `/en/demo` | None | `robots: { index: false }` |

| Property | Value |
|----------|-------|
| Layout | Compact marketing chrome (logo, `LocaleSwitcher`, sign-up CTA) or minimal chat top bar — **no** authenticated sidebar |
| Mirror tree | `app/en/demo/page.tsx` re-exports FR page (same pattern as [`app/en/chat/page.tsx`](../../apps/web/app/en/chat/page.tsx)) |

### `localized-path.ts` — extend `CanonicalPath`

Add when implementing:

```ts
| '/demo'
```

Then `localizedHref('/demo', 'en')` → `/en/demo`.

## Prerequisites (already in codebase)

| Asset | Path | Demo usage |
|-------|------|------------|
| Path locale | [`localized-path.ts`](../../apps/web/lib/localized-path.ts) | `getLocaleFromPathname`, `localizedHref`, `createLocaleAlternates` |
| Middleware | [`middleware.ts`](../../apps/web/middleware.ts) | Cookie + `x-ui-locale` from path |
| Client locale | [`use-ui-locale.ts`](../../apps/web/hooks/use-ui-locale.ts) | `locale` from pathname; `toggleLocale` → `router.push(localizedPath(...))` |
| Localized links | [`use-localized-navigation.ts`](../../apps/web/hooks/use-localized-navigation.ts) | `href('/sign-up')`, `push`, `switchLocalePath` |
| Server metadata locale | [`locale-cookie.ts`](../../apps/web/lib/locale-cookie.ts) | `getServerUiLocale()` reads `x-ui-locale` then cookie |
| Page metadata helpers | [`page-metadata.ts`](../../apps/web/lib/page-metadata.ts) | Pattern for `createDemoPageMetadata()` + `createLocaleAlternates('/demo', locale)` |
| Chat chrome bundles | [`ui-locale.ts`](../../apps/web/lib/ui-locale.ts) | Reuse `CHAT_UI`, `getChatUILabel` for verdict labels; optional slim `CHAT_HOME_UI` subset |
| Landing link pattern | [feat-0036 TECH](../feat-0036/TECH.md) | `href('/demo')` in `LandingPageClient` / `landing-content.ts` |
| Locale switcher | [`locale-switcher.tsx`](../../apps/web/components/locale-switcher.tsx) | Same control as landing/chat |
| EN route mirror | `app/en/**/page.tsx` | Thin re-exports |

**Not used on demo:** [`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx) (tRPC, session, multi-thread sidebar per [feat-0037](../feat-0037/PRODUCT.md)).

## Architecture

```text
/demo | /en/demo (public)
  DemoPageClient
    useUiLocale()              // locale from pathname
    useLocalizedNavigation()   // href('/sign-up'), etc.
    useDemoSession()           // local useReducer only — no trpc
    demo-scenarios.ts
    demo-ui.ts
    @afalambe/ui/chat          // presentation only
    NO trpc.claim.*
```

### Component reuse

| From `@afalambe/ui/chat` | Demo usage |
|--------------------------|------------|
| `ChatKitRoot`, `ChatAppShell` | Layout (single column — no `ChatSidebar`) |
| `ChatTopBar` | Brand + demo badge + `href('/sign-up')` CTA |
| `ChatHomeEmpty` | Example column from `getDemoScenarios(locale)` |
| `ChatMessageList`, `ChatMessageRow` | Scripted thread |
| `ChatComposer` | Text only; hide image/mic or pass disabled |
| `ChatTypingIndicator` | Before canned reply |

### State model (`useDemoSession`)

```ts
type DemoMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  factCheckStatus?: 'VERIFIED' | 'MISLEADING' | 'PARTIALLY_TRUE' | 'PENDING';
};

type DemoSessionState = {
  messages: DemoMessage[];
  started: boolean;
  isTyping: boolean;
};
```

Actions:

- `sendUserMessage(text)` — append user msg; `matchDemoScenario(locale, text)`; typing delay → assistant msg.
- `applyExampleLine(line)` — set composer value.
- `reset()` — clear messages; `started = false`.

Scenario matching: substring on **active URL locale** triggers only; fallback **S3**.

## Internationalisation (FR + EN)

### Locale source of truth

**URL path** — not cookie-only. Align with [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md) section 5.

| Path | `UiLocale` |
|------|------------|
| `/demo` | `fr` |
| `/en/demo` | `en` |

| Mechanism | Usage on demo |
|-----------|---------------|
| `useUiLocale()` | `locale = getLocaleFromPathname(pathname)` |
| `LocaleSwitcher` | `toggleLocale()` → `localizedPath('/demo', 'en')` etc. |
| `persistUiLocale` | Side effect when pathname changes (cookie mirror) |
| `getServerUiLocale()` | Metadata on SSR via `x-ui-locale` header |

**Forbidden:** English chrome on `/demo` or French chrome on `/en/demo`.

### Message bundles (new files)

| Bundle | File | Contents |
|--------|------|----------|
| **`DEMO_UI`** | `apps/web/lib/demo-ui.ts` | Badge, disclaimer, CTAs, reset, typing, unavailable, column titles |
| **`DEMO_PAGE_META`** | `demo-ui.ts` | `title`, `description` per `UiLocale` |
| **`DEMO_SCENARIOS`** | `apps/web/lib/demo-scenarios.ts` | S1–S3 per locale |

Verdict **labels:** `getChatUILabel(locale, 'verified' | …)` from existing [`ui-locale.ts`](../../apps/web/lib/ui-locale.ts).

### `DemoScenario` type

```ts
import type { UiLocale } from '@/lib/ui-locale';

export type DemoScenarioId = 'S1' | 'S2' | 'S3';

export type DemoScenario = {
  id: DemoScenarioId;
  exampleLine: string;
  triggers: string[];
  assistantReply: string;
  factCheckStatus: 'VERIFIED' | 'MISLEADING' | 'PARTIALLY_TRUE' | 'PENDING';
};

export function getDemoScenarios(locale: UiLocale): DemoScenario[];
export function matchDemoScenario(locale: UiLocale, userText: string): DemoScenario;
```

### `DEMO_UI` keys (both locales required)

See [PRODUCT.md](./PRODUCT.md) — keys and reference copy are normative.

### `DemoPageClient` wiring

```tsx
const { locale } = useUiLocale();
const { href } = useLocalizedNavigation();
const scenarios = useMemo(() => getDemoScenarios(locale), [locale]);
const demoUi = DEMO_UI[locale];

<Link href={href('/sign-up')}>{demoUi.signUpCta}</Link>
```

### Landing links ([feat-0036](../feat-0036/TECH.md) pattern)

In [`landing-content.ts`](../../apps/web/lib/landing-content.ts), add nav item:

```ts
{ href: localizedHref('/demo', locale), label: locale === 'en' ? 'Demo' : 'Demonstration' }
```

In [`landing-page-client.tsx`](../../apps/web/components/landing-page-client.tsx):

```tsx
// If demo is a dedicated header link rather than navItems only:
demoNavHref={href('/demo')}
```

`href('/demo')` yields `/demo` on `/` and `/en/demo` on `/en`.

## Files to add

| File | Purpose |
|------|---------|
| `apps/web/lib/demo-scenarios.ts` | Scenarios + `matchDemoScenario` |
| `apps/web/lib/demo-ui.ts` | `DEMO_UI`, `DEMO_PAGE_META` |
| `apps/web/hooks/use-demo-session.ts` | Reducer + typing delay |
| `apps/web/components/demo-page-client.tsx` | Page composition |
| `apps/web/app/(marketing)/demo/page.tsx` | `generateMetadata`, render client |
| `apps/web/app/en/demo/page.tsx` | `export { default, generateMetadata } from '../../(marketing)/demo/page'` |
| `apps/web/lib/demo-scenarios.test.ts` | Parity + per-locale triggers |
| `apps/web/lib/demo-ui.test.ts` | `DEMO_UI` key parity |

## Files to touch

| File | Change |
|------|--------|
| `apps/web/lib/localized-path.ts` | Add `'/demo'` to `CanonicalPath` |
| `apps/web/lib/landing-content.ts` | Demo nav label + localized `href` in `navItems` |
| `apps/web/components/landing-page-client.tsx` | Pass demo link if header prop added |
| `apps/web/lib/page-metadata.ts` | `createDemoPageMetadata()` |
| `specs/I18N_ROUTED_SPEC.md` | Section 4.1 — add `/demo` \| `/en/demo` row |
| `apps/web/.env.example` | `NEXT_PUBLIC_DEMO_ENABLED` (phase 3) |

## Metadata

```ts
// page-metadata.ts
export async function createDemoPageMetadata(): Promise<Metadata> {
  const locale = await getServerUiLocale();
  const copy = DEMO_PAGE_META[locale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: createLocaleAlternates('/demo', locale),
    robots: { index: false, follow: true },
  };
}
```

| Path | `lang` | `canonical` (example) |
|------|--------|------------------------|
| `/demo` | `fr` | `/demo` |
| `/en/demo` | `en` | `/en/demo` |

## Environment (phase 3)

| Variable | Default | Effect |
|----------|---------|--------|
| `NEXT_PUBLIC_DEMO_ENABLED` | `true` | When `false`, show unavailable UI or redirect to `href('/')` |

## Security checklist

- [ ] No `trpc` claim/auth mutations from demo client.
- [ ] No `NEXT_PUBLIC_*` AI keys for demo.
- [ ] Composer max length ≤ 4000 (match production).
- [ ] Disclaimer visible on mobile without scroll.
- [ ] No hardcoded `/sign-up` — always `href('/sign-up')`.

## Testing

| Test | Type |
|------|------|
| `localizedHref('/demo', 'en') === '/en/demo'` | Unit (`localized-path.test.ts`) |
| `getDemoScenarios('fr')` / `'en'` — same IDs S1–S3 | Unit |
| `DEMO_UI` fr/en key parity | Unit |
| `matchDemoScenario` per locale | Unit |
| `/demo` — French disclaimer, no auth redirect | Playwright |
| `/en/demo` — English disclaimer | Playwright (`locale-en` or dedicated spec) |
| Toggle on `/demo` → lands on `/en/demo` | Playwright |
| `/en/demo` sign-up CTA → `/en/sign-up` | Playwright |
| No `claim.create` in network log | Playwright |

## Analytics (optional phase 3)

`demo_scenario_played`, `demo_signup_click` — preserve `utm_*` from `useSearchParams()`.

## Known gaps after MVP

| Gap | Follow-up |
|-----|-----------|
| Image upload preview | feat-0008 UI mock |
| Voice button | feat-0015 stub |
| Multi-thread sidebar | feat-0037 — not on demo |
| `?scenario=s2` deep link | Query param |
| Server `demo.*` tRPC | Phase 2+ only |

## Related

- [feat-0035 PRODUCT](./PRODUCT.md)
- [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md)
- [feat-0036 TECH](../feat-0036/TECH.md)
- [feat-0037 TECH](../feat-0037/TECH.md)
- [feat-0006 TECH](../feat-0006/TECH.md)
- [feat-0024 TECH](../feat-0024/TECH.md)
- [feat-0029 TECH](../feat-0029/TECH.md)
- [feat-0034 TECH](../feat-0034/TECH.md)
