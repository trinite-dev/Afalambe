# feat-0036: Tech Spec — Localized landing navigation links

## Root cause

[`packages/ui/src/components/landing/landing-site-header.tsx`](../../packages/ui/src/components/landing/landing-site-header.tsx) line 115 hardcodes `href="/chat"`. [`apps/web/components/landing-page-client.tsx`](../../apps/web/components/landing-page-client.tsx) already localizes `signInHref` and `primaryCtaHref` via `useLocalizedNavigation().href()` but never passed a chat href.

## Changes

### 1. UI kit — `LandingSiteHeader`

**File:** `packages/ui/src/components/landing/landing-site-header.tsx`

Add required prop:

```ts
chatNavHref: string
```

Replace hardcoded `/chat` anchor with `href={chatNavHref}`.

Keep `brandHref` optional (default `/`); web app will pass localized value.

### 2. Web app — `LandingPageClient`

**File:** `apps/web/components/landing-page-client.tsx`

```tsx
const { href } = useLocalizedNavigation();

<LandingSiteHeader
  brandHref={href('/')}
  chatNavHref={href('/chat')}
  signInHref={href('/sign-in')}
  primaryCtaHref={href('/sign-up')}
  ...
/>

<LandingSiteFooter
  brandHref={href('/')}
  ...
/>
```

`href()` delegates to [`localizedHref()`](../../apps/web/lib/localized-path.ts):

| Locale | `href('/chat')` | `href('/')` |
|--------|-----------------|-------------|
| `fr` | `/chat` | `/` |
| `en` | `/en/chat` | `/en` |

### 3. Tests

| Test | File | Assertion |
|------|------|-----------|
| Unit (existing) | `apps/web/lib/localized-path.test.ts` | `localizedHref('/chat', 'en') === '/en/chat'` |
| E2E FR | `tests/e2e/landing-navigation.spec.ts` | `/` → Chat link `href=/chat` |
| E2E EN | `tests/e2e/landing-navigation-en.spec.ts` | `/en` → Chat link `href=/en/chat` |

### 4. Spec index

Add row to [`specs/README.md`](../README.md) feat table.

Update [`I18N_ROUTED_SPEC.md`](../I18N_ROUTED_SPEC.md) landing section to note chat nav is localized via feat-0036.

## Out of scope

- Footer column links already localized in `getLandingContent()` for `/legal/*` paths
- Hero CTAs already use `href('/sign-up')` and `href('/sign-in')`

## Verification

```bash
pnpm --filter @afalambe/ui exec tsc --noEmit
pnpm --filter @afalambe/web exec tsc --noEmit
pnpm --filter @afalambe/web test
```

Manual: open `http://localhost:3001/en`, click **Chat** → URL is `/en/chat`.
