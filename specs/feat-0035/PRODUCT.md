# feat-0035: Public chat demo (`/demo`)

## Summary

A **public, unauthenticated** route at **`/demo`** (French) and **`/en/demo`** (English) lets visitors explore the Afalambe **chat experience** before sign-up: same visual shell as the product chat, **pre-scripted scenarios**, and clear CTAs to create an account for real verification.

This fulfills the optional “non-authenticated demo” called out in [`landing-page.md`](../landing-page.md) and closes the gap between the **decorative hero preview** on `/` and the **authenticated** chat at `/chat` ([feat-0006](../feat-0006/PRODUCT.md)).

**Status:** **Planned** — locale routing and FR/EN bundles exist in the app; **`/demo` route and demo client are not implemented yet**.

## Current state (codebase)

| Area | Status | Notes |
|------|--------|-------|
| **URL locales** | Implemented | [`I18N_ROUTED_SPEC.md`](../I18N_ROUTED_SPEC.md) — FR unprefixed, EN under `/en` |
| **`localized-path.ts`** | Implemented | `localizedHref`, `getLocaleFromPathname`, `createLocaleAlternates` |
| **`middleware.ts`** | Implemented | Sets `x-ui-locale` + cookie from path; `/fr/*` → 301 |
| **`useUiLocale()`** | Implemented | Locale from **pathname**; toggle **navigates** (`/demo` ↔ `/en/demo`) |
| **`useLocalizedNavigation()`** | Implemented | `href('/sign-up')` → `/sign-up` or `/en/sign-up` |
| **`LocaleSwitcher`** | Implemented | Single toggle button on landing/auth/chat |
| **Message bundles** | Partial | [`ui-locale.ts`](../../apps/web/lib/ui-locale.ts) — `CHAT_UI`, `CHAT_HOME_UI`, auth/legal/admin meta |
| **Landing localized links** | Implemented | [feat-0036](../feat-0036/PRODUCT.md) — `chatNavHref`, `brandHref` via `href()` |
| **`/demo` route** | **Missing** | No `app/(marketing)/demo/` or `app/en/demo/` |
| **Demo scripts / UI** | **Missing** | No `demo-scenarios.ts`, `demo-ui.ts`, `demo-page-client.tsx` |
| **Landing link to demo** | **Missing** | `landing-content.ts` has no demo nav item |
| **Multi-chat sidebar** | Separate | [feat-0037](../feat-0037/PRODUCT.md) — demo uses **single-thread** shell, not `ChatPageClient` sidebar |


1. **Landing hero** shows a non-interactive chat mock — visitors cannot *use* the interface.
2. **`/chat`** requires a verified account — high friction for first-time visitors from WhatsApp or campaigns.
3. **FAQ and program copy** promise an “aperçu” / preview but there is no dedicated demo surface.
4. **Conversion** suffers when users cannot see how fact-check replies, verdict badges, and escalation messaging look in context.

## Goals

1. **`GET /demo`** and **`GET /en/demo`** — public routes, no session required.
2. **Interactive but safe** — scripted turns only; **no** real claims, **no** AI API spend, **no** database writes.
3. **Product-faithful UI** — reuse `@afalambe/ui/chat` layout tokens and patterns ([feat-0024](../feat-0024/PRODUCT.md)); **not** full `ChatPageClient` (no tRPC, no thread sidebar per [feat-0037](../feat-0037/PRODUCT.md)).
4. **Honest limits** — persistent banner: demo is illustrative; sign up for real verification ([`program.md`](../program.md) accuracy posture).
5. **Bilingual product chrome (FR + EN)** — full demo at **`/demo`** (French) and **`/en/demo`** (English). URL is the locale source of truth per [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md); reuse `LocaleSwitcher`, `useUiLocale`, and message-bundle patterns from [feat-0029](../feat-0029/PRODUCT.md) / [feat-0034](../feat-0034/PRODUCT.md).
6. **Funnel** — localized CTAs via `useLocalizedNavigation().href()`: **Sign up** / **Commencer** → `/sign-up` or `/en/sign-up`; **Sign in** / **Connexion** → `/sign-in` or `/en/sign-in`.

## Non-goals

- **Anonymous real claims** or calls to `claim.create`, `generateAssistantReply`, or upload endpoints.
- **Persisting** demo sessions server-side (local-only state is acceptable).
- **Full feature parity** with `/chat` (voice, image upload, multi-thread sidebar, admin, offline outbox, realtime).
- **Embedding** demo in an iframe on third-party sites (unless a later distribution spec adds it).
- **Public accuracy benchmarks** or live web search in demo scripts.
- **Fula (ff)** demo scripts — UI locales are **`fr` and `en` only** (claim text in demo may *mention* Fula/Peul; scripts stay in FR/EN chrome).
- Replacing **`/chat`** as the authenticated product entry.

## Bilingual requirements (FR + EN)

Demo is a **first-class bilingual surface**, not “French with English later.” Both locales ship in MVP phase 1.

### Locale behaviour (aligned with [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md))

| Rule | Detail |
|------|--------|
| **French URL** | `/demo` — all demo chrome in French |
| **English URL** | `/en/demo` — all demo chrome in English |
| **Default** | Unprefixed `/demo` is authoritative French; **no `/fr/demo`** |
| **Toggle** | `LocaleSwitcher` on demo navigates `/demo` ↔ `/en/demo` (preserves query string) |
| **Resolution** | `getLocaleFromPathname(pathname)` — path wins over cookie/`localStorage` |
| **Cookie sync** | `middleware.ts` writes `afalambe_locale` from path for `getServerUiLocale()` metadata |
| **On switch** | Navigation to equivalent path; demo copy reloads from bundles for new locale. Active in-memory thread may remain; **new** sends use scripts for the URL locale. Optional reset prompt (phase 2). |
| **`<html lang>`** | `fr` on `/demo`, `en` on `/en/demo` |
| **Parity** | Every `fr` demo string has an `en` counterpart; scenario IDs **S1–S3** in both locales |
| **Internal links** | All CTAs use `href('/sign-up')` etc. — never hardcode `/en/...` in components |

### What must be localized on `/demo`

| Surface | FR | EN |
|---------|----|----|
| Page title / meta description | Required | Required |
| Demo badge | Démonstration | Demo |
| Disclaimer banner | Required | Required |
| Sign-up / sign-in CTAs | Commencer / Connexion | Get started / Sign in |
| Composer placeholder | Required | Required |
| Empty-state column titles + example lines | Required | Required |
| Typing indicator | Required | Required |
| Reset / start-over control | Required | Required |
| Scripted assistant replies (S1–S3) | Required | Required |
| Verdict badge labels | Required | Required — reuse `getChatUILabel` / `CHAT_UI` |
| Unavailable state (`DEMO_ENABLED=false`) | Required | Required |

### Copy principles (both locales)

1. **Tone:** Plain, trustworthy; mirror production chat wording from [feat-0034](../feat-0034/PRODUCT.md) glossary (claim, review queue, fact-checking).
2. **Scripts:** Product-owned examples; may reference Fula/Peul **as claim subject matter** but assistant replies stay in the active UI locale.
3. **Disclaimer:** Must state demo is **not** legal advice and **not** a real verification in both languages.
4. **No mixed locale:** When EN is active, no French chrome strings except proper nouns (Afalambè).

## Actors

| Actor | Need |
|-------|------|
| **Campaign visitor** | Try the UI on mobile without registering. |
| **Prospective partner** | Share `/demo` in pitches without provisioning accounts. |
| **Returning evaluator** | Switch FR/EN and replay sample scenarios. |
| **Operator** | Optional env flag to disable demo in production if abuse occurs. |

## Relationship to existing surfaces

| Surface | Role |
|---------|------|
| `/` / `/en` landing | Marketing; should link to `/demo` / `/en/demo` ([feat-0036](../feat-0036/PRODUCT.md) link pattern) |
| `/demo` / `/en/demo` | **This spec** — interactive scripted preview |
| `/chat` / `/en/chat` | Authenticated product; real claims and AI |
| Hero `LandingHeroChatPreview` | Decorative only; optional CTA → localized `/demo` |

## Use case catalog

### Discovery and entry

| ID | Use case | Success criteria | Status |
|----|----------|------------------|--------|
| **UC-D01** | Open `/demo` without auth | 200 at `/demo` and `/en/demo`, no redirect to sign-in | Not implemented |
| **UC-D02** | Reach demo from landing nav | `/` → link `href=/demo`; `/en` → `href=/en/demo` | Not implemented |
| **UC-D03** | Preserve UTM on sign-up CTA | `?utm_*` on demo URL forwarded via `href('/sign-up?...')` | Not implemented |

### Demo interaction

| ID | Use case | Success criteria | Status |
|----|----------|------------------|--------|
| **UC-D10** | View welcome empty state | Home columns with example prompts (reuse or slim `CHAT_HOME_UI`) | Not implemented |
| **UC-D11** | Tap example prompt | Fills composer; user can edit before send | Not implemented |
| **UC-D12** | Send message in demo | User bubble appears; scripted assistant reply after short delay | Not implemented |
| **UC-D13** | Show verdict-style badge | At least one scenario displays `VERIFIED` or `PENDING` / queue messaging | Not implemented |
| **UC-D14** | Typing indicator | Brief “assistant typing” before canned reply | Not implemented |
| **UC-D15** | Reset demo | “Start over” clears thread and returns to empty state | Not implemented |

### Trust and conversion

| ID | Use case | Success criteria | Status |
|----|----------|------------------|--------|
| **UC-D20** | Demo disclaimer visible | Banner: not legal advice; not a real verification | Not implemented |
| **UC-D21** | Sign-up CTA always available | Top bar CTA to `href('/sign-up')` (locale-aware) | Not implemented |
| **UC-D22** | No misleading persistence copy | Do not claim “your chat is private and tied to your account” on demo | Not implemented |

### Locale and accessibility

| ID | Use case | Success criteria | Status |
|----|----------|------------------|--------|
| **UC-D30** | French demo at `/demo` | All demo chrome + S1–S3 scripts in French | Not implemented |
| **UC-D31** | English demo at `/en/demo` | All demo chrome + S1–S3 scripts in English; zero French chrome | Not implemented |
| **UC-D32** | Locale switcher on demo | `/demo` → navigate to `/en/demo` (and reverse); query preserved | Not implemented |
| **UC-D33** | FR/EN parity | `getDemoScenarios('fr')` and `getDemoScenarios('en')` share same scenario IDs | Not implemented |
| **UC-D34** | Keyboard send | Enter to send where chat kit supports it | Not implemented |
| **UC-D35** | `robots` + metadata | `noindex`; title/description + `hreflang` alternates per [I18N_ROUTED_SPEC](../I18N_ROUTED_SPEC.md) | Not implemented |
| **UC-D36** | Localized demo links | Links from `/en/demo` to sign-in/chat stay under `/en/*` | Not implemented |

## Scripted scenarios (MVP)

Minimum **three** canned flows per locale (`fr`, `en`). Each flow: user message (trigger match or example tap) → assistant reply + `factCheckStatus` badge. **Scenario IDs are locale-neutral**; copy differs by locale.

| Scenario ID | User intent (summary) | Assistant outcome (summary) | Badge |
|-------------|----------------------|-----------------------------|-------|
| **S1** | Election claim (may mention Fulfulde) | Verified against curated sources | `VERIFIED` |
| **S2** | Health / vaccine rumor | Partially true or misleading | `MISLEADING` or `PARTIALLY_TRUE` |
| **S3** | Obscure or unverifiable claim | Cannot verify; human review queue | `PENDING` |

Scripts must **not** reproduce real user data. Wording is product-owned, not copied from external fact-check sites.

### Example prompts (empty state) — by locale

These lines appear in the demo home column and double as trigger hints.

| ID | Français (fr) | English (en) |
|----|---------------|--------------|
| **S1** | Cette affirmation electorale en fulfulde est-elle exacte ? | Is this election claim I saw in Fulfulde accurate? |
| **S2** | Ce message WhatsApp sur les vaccins est-il fiable ? | Is this WhatsApp message about vaccines reliable? |
| **S3** | Pouvez-vous verifier cette rumeur sans source claire ? | Can you verify this rumor with no clear source? |

### Scripted assistant replies — by locale (reference copy)

Implementers may tighten wording; IDs and outcomes must match.

**S1 — Verified**

| Locale | Assistant reply (summary) |
|--------|---------------------------|
| **fr** | Correspondance a forte confiance avec des sources selectionnees. Resume factuel + rappel des limites. |
| **en** | High-confidence match with selected sources. Factual summary + reminder of limits. |

**S2 — Misleading / partially true**

| Locale | Assistant reply (summary) |
|--------|---------------------------|
| **fr** | Elements exacts et elements trompeurs identifies ; recommande des sources officielles. |
| **en** | Accurate and misleading elements identified; points to official sources. |

**S3 — Human queue**

| Locale | Assistant reply (summary) |
|--------|---------------------------|
| **fr** | Incertitude : dossier place en file de verification humaine ; pas de conclusion automatique. |
| **en** | Uncertain: claim placed in human review queue; no automatic conclusion. |

### Trigger keywords (implementation hint)

Matching is substring, case-insensitive, **per active locale** (do not match FR triggers when EN is active).

| ID | fr triggers (examples) | en triggers (examples) |
|----|------------------------|-------------------------|
| **S1** | `election`, `electoral`, `fulfulde`, `vote` | `election`, `fulfulde`, `vote` |
| **S2** | `vaccin`, `whatsapp`, `sante` | `vaccine`, `whatsapp`, `health` |
| **S3** | `rumeur`, `source`, `verifier` | `rumor`, `source`, `verify` |

Fallback when no trigger matches: **S3** (human queue) for the active locale.

## Implementation options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **A. Client-only canned state** | No API cost; fast; easy to ship | No “real” AI feel for edge cases | **Default MVP** |
| **B. Server `demo.*` tRPC with rate limit** | Centralized script versioning | API surface + abuse risk | Phase 2 only if needed |
| **C. Ephemeral real AI (no DB)** | Most realistic | Cost, latency, safety review | **Out of scope** for feat-0035 |

## Acceptance criteria

1. Unauthenticated user completes UC-D01, D10–D15, D20–D21 on mobile and desktop at **`/demo`** and **`/en/demo`**.
2. Network tab shows **no** calls to `claim.create`, `claim.appendUserMessage`, or upload procedures during demo use.
3. **French path:** `/demo` shows French disclaimer, examples, and S1 reply with French verdict label (UC-D30).
4. **English path:** `/en/demo` shows English disclaimer, examples, and S1 reply with English verdict label (UC-D31).
5. Locale switcher navigates `/demo` ↔ `/en/demo` with equivalent experience (UC-D32).
6. `getDemoScenarios('fr')` and `getDemoScenarios('en')` have identical scenario IDs (UC-D33).
7. `/chat` and `/en/chat` behaviour unchanged for signed-in users.
8. Landing includes localized demo link: `/` → `/demo`, `/en` → `/en/demo` (UC-D02).
9. `createDemoPageMetadata()` sets localized title/description, `noindex`, and `alternates.languages` (UC-D35).
10. Sign-up CTA from `/en/demo` lands on `/en/sign-up` (UC-D36).

## Delivery phases

| Phase | Scope |
|-------|-------|
| **0** | *(done)* URL locale infra, middleware, `useUiLocale`, landing localized links |
| **1** | `/demo` + `/en/demo` routes, client scripts, disclaimer, localized CTAs, FR/EN bundles |
| **2** | Landing nav link via `href('/demo')`, UTM preservation, “Start over”, typing indicator |
| **3** | Optional `NEXT_PUBLIC_DEMO_ENABLED=false`, analytics `demo_cta_signup_click` |

## Risks

| Risk | Mitigation |
|------|------------|
| Users think demo results are real | Persistent disclaimer + no verdict without scenario label “Example” |
| Scrapers abuse demo | No backend AI; optional disable flag; `noindex` |
| Drift from real chat UI | Share components from `@afalambe/ui/chat`; snapshot test or visual checklist |
| Duplicate maintenance of scripts | Single `demo-scenarios.ts` keyed by `UiLocale` (`fr` \| `en`); unit test enforces parity |
| Locale switch mid-thread confuses user | Navigation to `/en/demo` may keep thread; optional reset prompt (phase 2); new sends use URL locale scripts |
| Wrong locale on shared link | Document share URLs: `/demo` = FR, `/en/demo` = EN |

## Related

- [feat-0035 TECH](./TECH.md)
- [I18N_ROUTED_SPEC.md](../I18N_ROUTED_SPEC.md) — URL locale rules (add `/demo` to section 4 when implementing)
- [feat-0036](../feat-0036/PRODUCT.md) — localized landing `href()` pattern for demo nav
- [feat-0037](../feat-0037/PRODUCT.md) — multi-chat sidebar (not used on demo)
- [feat-0016](../feat-0016/PRODUCT.md) — marketing landing
- [feat-0006](../feat-0006/PRODUCT.md) — real chat
- [feat-0024](../feat-0024/PRODUCT.md) — UI kit
- [feat-0021](../feat-0021/PRODUCT.md) — rate limits (if server demo added later)
- [feat-0029](../feat-0029/PRODUCT.md) — locale switcher
- [feat-0034](../feat-0034/PRODUCT.md) — FR/EN message bundles
- [`landing-page.md`](../landing-page.md)
- [`program.md`](../program.md) — SC-5 core flows
