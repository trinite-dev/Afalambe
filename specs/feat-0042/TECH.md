# feat-0042: Tech Spec — Source URL images and previews

## Files

```text
specs/feat-0042/PRODUCT.md
specs/feat-0042/TECH.md
apps/web/lib/source-preview.ts
apps/web/lib/source-preview.test.ts
apps/web/components/source-preview-list.tsx
apps/web/components/fact-check-details-card.tsx
apps/web/components/chat-page-client.tsx
apps/web/components/demo-page-client.tsx
apps/web/lib/ui-locale.ts                    # SOURCE_PREVIEW_UI labels
```

## Classification

```ts
type SourceMediaKind = 'image' | 'video' | 'audio' | 'link'

type SourcePreviewItem = {
  url: string
  kind: SourceMediaKind
  mimeType?: string
  hostname: string
  pathnameLabel: string  // truncated path or file name
}

classifySourceUrl(url: string, mimeType?: string | null): SourceMediaKind
buildSourcePreviewItems(urls: string[], mimeByUrl?: Record<string, string>): SourcePreviewItem[]
```

Rules (first match wins):

1. Explicit `mimeType` starting with `image/` → `image`; `video/` → `video`; `audio/` → `audio`
2. Path extension: images (`.png` `.jpg` `.jpeg` `.webp` `.gif` `.avif`), video (`.mp4` `.webm` `.mov`), audio (`.mp3` `.wav` `.ogg` `.m4a`)
3. Else → `link`

Invalid URLs still render as `link` with raw text as label.

## UI

`SourcePreviewList` inside the Sources `dd`:

- **image**: `<a><img /></a>` thumbnail, `object-contain`, border, max-h-36 max-w-full; `onError` → swap to link preview
- **video** / **audio**: bordered chip with localized kind label + truncated URL link
- **link**: bordered row with hostname (semibold) + pathname (muted), full URL as `href`

Props on `FactCheckDetailsCard`:

```ts
sourceMimeTypes?: Record<string, string>  // url → mime
```

Chat/demo build `sourceMimeTypes` from USER message attachments when collecting `sourceUrls`.

## i18n

```ts
SOURCE_PREVIEW_UI[locale] = {
  image: 'Image' | 'Image',
  video: 'Video' | 'Video',
  audio: 'Audio' | 'Audio',
  link: 'Link' | 'Lien',
  openSource: 'Open source' | 'Ouvrir la source',
}
```

## Testing

| Test | Assert |
|------|--------|
| MIME image | kind `image` |
| `.webp` path | kind `image` |
| `.mp4` | kind `video` |
| bare article URL | kind `link` + hostname |
| dedupe | one item per URL |

## Verification

```bash
pnpm --filter @afalambe/web exec node --import tsx --test lib/source-preview.test.ts
pnpm --filter @afalambe/web typecheck
```

## Security

- Never invent or substitute placeholder images for demo/chat sources
- External images: only `http:`/`https:` URLs (plus same-origin `/` paths and `blob:`/`data:image` from real uploads); no `javascript:`
- Links: `target="_blank"` + `rel="noopener noreferrer"`
- Do not proxy remote images through the API in this feat
