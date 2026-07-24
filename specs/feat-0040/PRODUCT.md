# feat-0040: Structured fact-check details on every chat reply

## Summary

Every **assistant** fact-check reply in `/chat` (and `/en/chat`) must show a structured details block with claim and verification metadata:

| Field | Meaning |
|-------|---------|
| Fact-check status | Verdict (`PENDING`, `VERIFIED`, `DEBUNKED`, `MISLEADING`, `PARTIALLY_TRUE`) |
| Fact-check date | When verification completed, or **Not** if not yet verified |
| Topic category | Politics, health, finance, etc. |
| Claim location | Country or region |
| Claim date | When the claim was made (if known) |
| Who made the claim | Source person/org name |
| Platform | Where the claim appeared (WhatsApp, Facebook, etc.) |
| Sources | URLs, images, videos linked to the claim |
| Source type | Politician, media, social media, blog, NGO, citizen |
| Source name | Display name of the source |

Data comes from the existing `Claim` model fields (plus message attachments as media sources). The block is shown on **each ASSISTANT message** in the thread.

Complements [feat-0006](../feat-0006/PRODUCT.md), [feat-0007](../feat-0007/PRODUCT.md), [feat-0038](../feat-0038/PRODUCT.md).

## Problem

Today the UI only shows a small verdict chip and a sparse metadata header. Users cannot see location, claim date, source type, or media sources next to the reply. Copy/paste of the assistant message also omits this structure.

## Goals

| Goal | Detail |
|------|--------|
| **Always visible** | Every ASSISTANT reply renders the full details card |
| **Localized labels** | FR + EN chrome for all field labels and “Not” |
| **Missing → Not** | Empty optional fields display **Not** / **Non** (never blank rows without a value) |
| **Sources list** | Include `sourceUrl`, user-uploaded image/video URLs, and known HTTP links from the reply when present |
| **Copy-friendly** | Assistant `content` ends with a plain-text details footer matching the same fields |
| **Fill gaps** | Metadata extraction runs on each `generateAssistantReply` when fields are still empty |

## Non-goals

- Per-message independent metadata (still claim-scoped)
- New Prisma columns (reuse existing `Claim` fields)
- Admin-only alternate layout
- Changing verdict enum values

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Reads structured details under each AI reply |
| **System** | Extracts/persists claim metadata; formats footer + UI card |

## Use cases

| ID | Use case | Success |
|----|----------|---------|
| **UC-FD01** | View details after reply | ASSISTANT message shows status, dates, topic, location, source fields, sources |
| **UC-FD02** | Unverified claim | Fact-check date and unknown fields show **Not** |
| **UC-FD03** | Image attachment | Sources list includes the image URL |
| **UC-FD04** | Copy reply | Copied text includes the structured footer |
| **UC-FD05** | Locale EN | Labels render in English on `/en/chat` |

## Acceptance criteria

1. Spec PRODUCT + TECH exist and are indexed in `specs/README.md`.
2. After a successful `generateAssistantReply`, the assistant message body includes a structured footer with all listed fields.
3. Chat UI renders a details card under each ASSISTANT message (not only the header).
4. Missing values display locale-aware **Not** / **Non**.
5. Unit tests cover footer formatting for FR and EN.
6. Typecheck passes for `@afalambe/web` and `@afalambe/trpc`.

## Related

- [feat-0040 TECH](./TECH.md)
- [feat-0007](../feat-0007/PRODUCT.md)
- [feat-0038](../feat-0038/PRODUCT.md)
