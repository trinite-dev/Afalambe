# feat-0040: Tech Spec — Structured fact-check details on replies

## Data sources (existing Prisma `Claim`)

| UI field | Column / source |
|----------|-----------------|
| Fact-check status | `factCheckStatus` |
| Fact-check date | `factCheckDate` or **Not** |
| Topic category | `topicCategory` |
| Claim location | `location` |
| Claim date | `claimDate` |
| Who made the claim | `sourceName` |
| Platform | `platform` |
| Sources | `sourceUrl` + USER message `attachments[].url` + http(s) URLs in assistant text |
| Source type | `sourceType` |
| Source name | `sourceName` (same as who, kept as separate labeled row per product) |

## Files

```text
specs/feat-0040/PRODUCT.md
specs/feat-0040/TECH.md
apps/web/lib/fact-check-details.ts          # format footer + display rows
apps/web/lib/fact-check-details.test.ts
apps/web/components/fact-check-details-card.tsx
apps/web/lib/ui-locale.ts                   # FACT_CHECK_DETAILS_UI
apps/web/components/chat-page-client.tsx    # render card under ASSISTANT
packages/trpc/src/routers/claim.ts          # append footer; broaden metadata extract
packages/ai/src/format-fact-check-footer.ts # shared plain-text formatter (optional; web may own copy)
```

Prefer a single formatter in `apps/web/lib/fact-check-details.ts` for UI, and a mirrored helper used by the API when appending to `ClaimMessage.content` — place the shared formatter in `packages/ai` so API + web stay aligned:

```text
packages/ai/src/format-fact-check-footer.ts
packages/ai/src/format-fact-check-footer.test.ts
```

## Formatter API

```ts
type FactCheckDetailsInput = {
  factCheckStatus?: string | null
  factCheckDate?: Date | string | null
  topicCategory?: string | null
  location?: string | null
  claimDate?: Date | string | null
  sourceName?: string | null
  sourceType?: string | null
  platform?: string | null
  sourceUrl?: string | null
  sourceUrls?: string[]  // attachments + extras
  locale: 'fr' | 'en'
}

formatFactCheckDetailsFooter(input): string
buildFactCheckDetailsRows(input): Array<{ label: string; value: string }>
```

Rules:

- Null/empty → `Not` (en) / `Non` (fr)
- Dates → locale short date+time for `factCheckDate`; date-only for `claimDate` when time is midnight/unknown
- Enums mapped to readable labels (FR/EN)
- Footer separated from prose by `\n\n---\n`

## API (`generateAssistantReply`)

1. Always call `extractClaimMetadata` when any of `topicCategory`, `sourceName`, `location`, `platform`, `sourceType`, `claimDate` is missing (not only when all empty).
2. Persist extracted fields.
3. Re-read claim (or merge in memory) after updates.
4. Create ASSISTANT message with `content = assistantText + formatFactCheckDetailsFooter(...)`.
5. Collect attachment URLs from USER messages in the thread for `sourceUrls`.

## UI

`FactCheckDetailsCard` under each ASSISTANT bubble:

- Definition list / stacked rows
- Status row uses existing verdict color chip when not PENDING
- Sources as link list (external `rel="noopener noreferrer"`)
- Do not duplicate the old sparse header chip-only experience; keep `ClaimMetadataHeader` optional or slim it to avoid double noise — **keep header**, card is authoritative under messages.

## i18n

`FACT_CHECK_DETAILS_UI[locale]` for labels. Claim-language for footer when appending server-side: use `claim.claimLanguage` mapped to `fr`/`en` (default `fr`).

## Testing

| Test | Assert |
|------|--------|
| Footer includes all labels | FR + EN |
| Null fields → Non/Not | yes |
| Sources dedupe URLs | yes |

## Verification

```bash
pnpm --filter @afalambe/ai test
pnpm --filter @afalambe/web test
pnpm --filter @afalambe/web exec tsc --noEmit
pnpm --filter @afalambe/trpc exec tsc --noEmit
pnpm --filter @afalambe/api exec tsc --noEmit
```
