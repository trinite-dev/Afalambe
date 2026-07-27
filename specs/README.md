# Spec-driven development (SDD)

This folder holds **program and feature specifications** used as the single source of truth before implementation. Feature specs follow the same pattern as [`sample/`](../sample/): each major capability has **`PRODUCT.md`** (user flows, acceptance criteria) and **`TECH.md`** (routes, files, env, gaps).

## Four phases

1. **Specify** — User-visible outcomes in `feat-*/PRODUCT.md`.
2. **Plan** — Architecture in `feat-*/TECH.md` and legacy vertical specs.
3. **Tasks** — Derive issues from use case IDs (e.g. `UC-R01`).
4. **Implement** — Code traces to a spec section.

## Feature spec index (`feat-*/`)

Each row links PRODUCT + TECH. Status reflects codebase as of spec authoring.

| ID | Feature | PRODUCT | TECH | Status |
|----|---------|---------|------|--------|
| 0001 | API platform (health, tRPC, CORS) | [PRODUCT](./feat-0001/PRODUCT.md) | [TECH](./feat-0001/TECH.md) | Implemented |
| 0002 | Auth: register, login, logout | [PRODUCT](./feat-0002/PRODUCT.md) | [TECH](./feat-0002/TECH.md) | Implemented |
| 0003 | Email verification (OTP) | [PRODUCT](./feat-0003/PRODUCT.md) | [TECH](./feat-0003/TECH.md) | Implemented |
| 0004 | Password reset | [PRODUCT](./feat-0004/PRODUCT.md) | [TECH](./feat-0004/TECH.md) | Implemented |
| 0005 | Session (`session.me`) | [PRODUCT](./feat-0005/PRODUCT.md) | [TECH](./feat-0005/TECH.md) | Implemented |
| 0006 | Claims and chat threads | [PRODUCT](./feat-0006/PRODUCT.md) | [TECH](./feat-0006/TECH.md) | Implemented |
| 0007 | AI fact-check pipeline | [PRODUCT](./feat-0007/PRODUCT.md) | [TECH](./feat-0007/TECH.md) | Partial |
| 0008 | Chat image uploads | [PRODUCT](./feat-0008/PRODUCT.md) | [TECH](./feat-0008/TECH.md) | Implemented |
| 0009 | Realtime WebSocket | [PRODUCT](./feat-0009/PRODUCT.md) | [TECH](./feat-0009/TECH.md) | Partial |
| 0010 | Storage orphan cleanup | [PRODUCT](./feat-0010/PRODUCT.md) | [TECH](./feat-0010/TECH.md) | Implemented |
| 0011 | Transactional email (Resend) | [PRODUCT](./feat-0011/PRODUCT.md) | [TECH](./feat-0011/TECH.md) | Implemented |
| 0012 | Resend webhook | [PRODUCT](./feat-0012/PRODUCT.md) | [TECH](./feat-0012/TECH.md) | Implemented |
| 0013 | Offline message outbox | [PRODUCT](./feat-0013/PRODUCT.md) | [TECH](./feat-0013/TECH.md) | Implemented |
| 0014 | Multilingual / language detection | [PRODUCT](./feat-0014/PRODUCT.md) | [TECH](./feat-0014/TECH.md) | Partial |
| 0015 | Voice input (Whisper) | [PRODUCT](./feat-0015/PRODUCT.md) | [TECH](./feat-0015/TECH.md) | Implemented (see feat-0048) |
| 0016 | Marketing landing | [PRODUCT](./feat-0016/PRODUCT.md) | [TECH](./feat-0016/TECH.md) | Implemented |
| 0017 | Legal pages | [PRODUCT](./feat-0017/PRODUCT.md) | [TECH](./feat-0017/TECH.md) | Stub |
| 0018 | SEO and PWA metadata | [PRODUCT](./feat-0018/PRODUCT.md) | [TECH](./feat-0018/TECH.md) | Implemented |
| 0019 | Theme (light/dark) | [PRODUCT](./feat-0019/PRODUCT.md) | [TECH](./feat-0019/TECH.md) | Implemented |
| 0020 | Admin and human review queue | [PRODUCT](./feat-0020/PRODUCT.md) | [TECH](./feat-0020/TECH.md) | Stub |
| 0021 | Rate limiting | [PRODUCT](./feat-0021/PRODUCT.md) | [TECH](./feat-0021/TECH.md) | Implemented |
| 0022 | Database / Prisma | [PRODUCT](./feat-0022/PRODUCT.md) | [TECH](./feat-0022/TECH.md) | Implemented |
| 0023 | Web tRPC client and toasts | [PRODUCT](./feat-0023/PRODUCT.md) | [TECH](./feat-0023/TECH.md) | Implemented |
| 0024 | Chat / auth / landing UI kit | [PRODUCT](./feat-0024/PRODUCT.md) | [TECH](./feat-0024/TECH.md) | Implemented |
| 0025 | WhatsApp / campaigns | [PRODUCT](./feat-0025/PRODUCT.md) | [TECH](./feat-0025/TECH.md) | Planned |
| 0026 | Testing strategy | [PRODUCT](./feat-0026/PRODUCT.md) | [TECH](./feat-0026/TECH.md) | Partial |
| 0027 | Security and environment | [PRODUCT](./feat-0027/PRODUCT.md) | [TECH](./feat-0027/TECH.md) | Implemented |
| 0028 | Admin UI (reviewer workspace) | [PRODUCT](./feat-0028/PRODUCT.md) | [TECH](./feat-0028/TECH.md) | Planned |
| 0029 | UI i18n (FR/EN chrome) | [PRODUCT](./feat-0029/PRODUCT.md) | [TECH](./feat-0029/TECH.md) | Partial — see [I18N_SPEC](./I18N_SPEC.md) |
| 0030 | Claim lifecycle and emails | [PRODUCT](./feat-0030/PRODUCT.md) | [TECH](./feat-0030/TECH.md) | Implemented (see gaps) |
| 0031 | AI roadmap (vision, async) | [PRODUCT](./feat-0031/PRODUCT.md) | [TECH](./feat-0031/TECH.md) | Roadmap |
| 0032 | Chat UX utilities | [PRODUCT](./feat-0032/PRODUCT.md) | [TECH](./feat-0032/TECH.md) | Partial |
| 0033 | Platform ops and deploy | [PRODUCT](./feat-0033/PRODUCT.md) | [TECH](./feat-0033/TECH.md) | Implemented |
| 0034 | Full English translation | [PRODUCT](./feat-0034/PRODUCT.md) | [TECH](./feat-0034/TECH.md) | Partial |
| 0035 | URL locales (`/chat`, `/en/chat`) | — | [I18N_ROUTED_SPEC](./I18N_ROUTED_SPEC.md) | Partial |
| 0035 | Public chat demo (`/demo`) | [PRODUCT](./feat-0035/PRODUCT.md) | [TECH](./feat-0035/TECH.md) | Planned |
| 0036 | Localized landing nav links | [PRODUCT](./feat-0036/PRODUCT.md) | [TECH](./feat-0036/TECH.md) | Implemented |
| 0037 | Multiple chats in sidebar | [PRODUCT](./feat-0037/PRODUCT.md) | [TECH](./feat-0037/TECH.md) | Implemented |
| 0038 | Fact-check grounding (`_data`) | [PRODUCT](./feat-0038/PRODUCT.md) | [TECH](./feat-0038/TECH.md) | Implemented |
| 0039 | Demo scenario matching (no generic fallback) | [PRODUCT](./feat-0039/PRODUCT.md) | [TECH](./feat-0039/TECH.md) | Implemented |
| 0040 | Fact-check details on every reply | [PRODUCT](./feat-0040/PRODUCT.md) | [TECH](./feat-0040/TECH.md) | Implemented |
| 0041 | Durable chat history (reload / login / logout) | [PRODUCT](./feat-0041/PRODUCT.md) | [TECH](./feat-0041/TECH.md) | Implemented |
| 0042 | Source URL images and previews | [PRODUCT](./feat-0042/PRODUCT.md) | [TECH](./feat-0042/TECH.md) | Implemented |
| 0043 | Detect meta / follow-up vs fact-check chats | [PRODUCT](./feat-0043/PRODUCT.md) | [TECH](./feat-0043/TECH.md) | Implemented |
| 0044 | Static chat sidebar, scrollable main | [PRODUCT](./feat-0044/PRODUCT.md) | [TECH](./feat-0044/TECH.md) | Implemented |
| 0045 | Signup verification email delivery | [PRODUCT](./feat-0045/PRODUCT.md) | [TECH](./feat-0045/TECH.md) | Implemented |
| 0046 | Core hardening + TruthSentry ops parity | [PRODUCT](./feat-0046/PRODUCT.md) | [TECH](./feat-0046/TECH.md) | Implemented |
| 0047 | Single Vercel deploy (“one deploy”) | [PRODUCT](./feat-0047/PRODUCT.md) | [TECH](./feat-0047/TECH.md) | Done (1–3a) |
| 0048 | Language experience (FR/EN chrome + claim prompts + voice) | [PRODUCT](./feat-0048/PRODUCT.md) | [TECH](./feat-0048/TECH.md) | Implemented |

## Critical path (core product)

```text
feat-0033 (ops) + feat-0027 (env) + feat-0022 (DB)
  → feat-0001 (API) → feat-0002/3/4/5 (Auth)
  → feat-0023 (Web client) → feat-0006 (Claims)
  → feat-0030 (lifecycle) + feat-0007/0031 (AI)
  → feat-0008 (Uploads) + feat-0011 (Email) + feat-0009 (Realtime)
```

## Cross-cutting specs (read with feature specs)

| Spec | Covers |
|------|--------|
| [feat-0026](./feat-0026/PRODUCT.md) | Tests and CI |
| [feat-0027](./feat-0027/PRODUCT.md) | Secrets, CORS, env checklist |
| [feat-0029](./feat-0029/PRODUCT.md) | UI language switcher (vs feat-0014 claim language); bundles in [I18N_SPEC](./I18N_SPEC.md) |
| [feat-0034](./feat-0034/PRODUCT.md) | Full EN translation checklist |
| [**I18N_ROUTED_SPEC**](./I18N_ROUTED_SPEC.md) | **URL routing:** `/chat` (FR), `/en/chat` (EN); all pages translated |
| [feat-0036](./feat-0036/PRODUCT.md) | Landing header chat + brand links preserve URL locale |
| [feat-0037](./feat-0037/PRODUCT.md) | Multi-conversation sidebar: list, switch, search, rename, delete |
| [feat-0038](./feat-0038/PRODUCT.md) | Static `_data` fact-check corpus + DB evidence grounding |
| [feat-0040](./feat-0040/PRODUCT.md) | Structured fact-check details card on every assistant reply |
| [feat-0041](./feat-0041/PRODUCT.md) | Durable chat history across reload, login, and logout |
| [feat-0042](./feat-0042/PRODUCT.md) | Source URL image thumbnails and link previews |
| [feat-0043](./feat-0043/PRODUCT.md) | Detect meta and follow-up questions vs fact-check claims |
| [feat-0044](./feat-0044/PRODUCT.md) | Static chat sidebar; main content scrolls independently |
| [feat-0045](./feat-0045/PRODUCT.md) | Signup verification email delivery reliability |
| [feat-0046](./feat-0046/PRODUCT.md) | Core loop hardening, admin resolve parity, port 3002 / migrate baseline |
| [feat-0047](./feat-0047/PRODUCT.md) | One Vercel deploy: tRPC/webhooks/cron inside Next.js; retire standalone API |
| [feat-0048](./feat-0048/PRODUCT.md) | Language experience: claim prompts, EN voice, no browser AI keys |
| [feat-0030](./feat-0030/PRODUCT.md) | Verdicts, status machine, email trigger truth |
| [feat-0031](./feat-0031/PRODUCT.md) | AI phases (replaces reading full AI_CHATBOT_SPEC for planning) |
| [feat-0032](./feat-0032/PRODUCT.md) | Auto-scroll, copy, composer limits |
| [feat-0033](./feat-0033/PRODUCT.md) | `pnpm dev:all`, migrations, deploy |
| [feat-0035](./feat-0035/PRODUCT.md) | Public `/demo` — scripted chat preview before sign-up |

## Legacy vertical specs (still referenced)

| Document | Scope |
|----------|--------|
| [program.md](./program.md) | North star, stakeholders, global requirements |
| [roadmap.md](./roadmap.md) | Phased delivery |
| [api.md](./api.md) | tRPC matrix, planned models |
| [web.md](./web.md) | Web app cross-cutting concerns — admin UI in [feat-0028](./feat-0028/PRODUCT.md) |
| [chat.md](./chat.md) | Chat product notes (pre-feat-0006) |
| [landing-page.md](./landing-page.md) | Marketing MVP |
| [claims-ai-pipeline.md](./claims-ai-pipeline.md) | AI pipeline depth |
| [resend-email-implementation.md](./resend-email-implementation.md) | Email detail |
| [whatsapp-distribution.md](./whatsapp-distribution.md) | Distribution (planned) |
| [AI_CHATBOT_SPEC.md](./AI_CHATBOT_SPEC.md) | Large chat/AI reference — prefer [feat-0031](./feat-0031/PRODUCT.md) for planning |
| [AI_CHAT_IMAGE_CONTEXT.md](./AI_CHAT_IMAGE_CONTEXT.md) | Vision roadmap |

Prefer **`feat-*/`** for implementation tasks; update legacy docs when they diverge or link to the matching `feat-*` spec.

## Style reference

See [`sample/feat-0005/`](../sample/feat-0005/) and [`sample/feat-0006/`](../sample/feat-0006/) for the Troott template: Summary, Problem, Non-goals, Actors, Use case catalog, Acceptance criteria, TECH route maps, Known gaps.

## Rules

- **No secrets in specs** — env var names only; see `docs/env/README.md`.
- Update PRODUCT/TECH when behaviour changes.
- Link ADRs from `docs/architecture/decisions/` in TECH specs when relevant.
