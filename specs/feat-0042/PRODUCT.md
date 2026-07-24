# feat-0042: Source URL images and previews

## Summary

In the structured fact-check details card ([feat-0040](../feat-0040/PRODUCT.md)), the **Sources** row must show **visual previews** for media and a compact **link preview** for other URLs — not only raw URL text. Image sources render as thumbnails; videos/audio get typed media chips; generic links show hostname + truncated path.

Applies to authenticated **chat** and public **demo** (`/demo`, `/en/demo`) equally: both render `FactCheckDetailsCard` with `SourcePreviewList`.

**Do not invent media.** Image thumbnails appear only when a source URL is a real image (user upload / attachment MIME, or an authentic image URL). Demo scenarios must not attach placeholder, marketing, or unrelated images as claim sources.

## Assumptions

1. Previews are **client-side**: classify by MIME hint (from attachments) and/or URL path extension — no Open Graph / metadata fetch service in this feat.
2. Image thumbnails use the same signed/public URLs already shown for chat attachments.
3. Broken image URLs fall back to the link preview (no endless spinner).
4. Plain-text message footer (copy) remains URL list only — previews are UI-only.
5. FR + EN labels for media types (Image, Video, Audio, Link).

## Problem

Sources today are a vertical list of full URLs. Users cannot tell which entries are screenshots vs articles vs videos without opening each link. Uploaded claim images already appear under the user bubble but are easy to miss next to the details card.

## Goals

| Goal | Detail |
|------|--------|
| **Image thumbnails** | Image URLs/MIME show a clickable thumbnail in Sources |
| **Media chips** | Video/audio sources show a typed preview with open-in-new-tab |
| **Link preview** | Other http(s) URLs show hostname + short path, still clickable |
| **Same card** | Works inside existing `FactCheckDetailsCard` on chat + demo |
| **Accessible** | Thumbnails have alt text; links keep `rel="noopener noreferrer"` |
| **Missing → Not** | Empty sources still show **Not** / **Non** |

## Non-goals

- Inventing or substituting placeholder images for demo/chat sources
- Server-side link unfurling / Open Graph scraping
- PDF or document embed viewers
- Editing or uploading sources from the details card
- Changing which URLs are collected (still `sourceUrl` + attachment URLs + footer extract)

## Actors

| Actor | Description |
|-------|-------------|
| **Verified user** | Reviews sources under each assistant reply |
| **Demo visitor** | Sees the same preview UX on guided replies |

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-SP01** | Image attachment as source | User sent image; AI replied | Sources row shows thumbnail of that image |
| **UC-SP02** | Image URL by extension | Source ends with `.jpg`/`.png`/`.webp`/… | Thumbnail preview |
| **UC-SP03** | Broken image | Image URL 404 | Falls back to link preview |
| **UC-SP04** | Video / audio URL | Extension or MIME is video/audio | Typed media chip + open link |
| **UC-SP05** | Article / generic URL | e.g. `https://africacheck.org/...` | Hostname + truncated path preview |
| **UC-SP06** | No sources | Empty list | **Not** / **Non** |
| **UC-SP07** | Demo parity | Guided demo with outlet links | Same link-preview UI as chat; **no** invented image thumbnails |
| **UC-SP08** | Real upload preview | User attaches an image in chat/demo | That attachment URL shows as an image thumbnail in Sources |

## Acceptance criteria

1. Spec PRODUCT + TECH exist and are indexed in `specs/README.md`.
2. Image sources render as thumbnails (max height ~8–12rem) linking to the original URL.
3. Non-image http(s) sources render a compact preview (hostname + path), not only the raw string.
4. Video/audio classified sources show a media-type label chip.
5. Classification helper is unit-tested (image / video / audio / link).
6. Chat and demo both pass attachment MIME hints when available.
7. Demo scenario metadata never invents image/file URLs; only authentic outlet links (or real user attachments at runtime).
8. Typecheck passes for `@afalambe/web`.

## Related

- [feat-0042 TECH](./TECH.md)
- [feat-0040](../feat-0040/PRODUCT.md)
- [feat-0008](../feat-0008/PRODUCT.md)
