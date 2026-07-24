# feat-0008: Chat image uploads and storage

## Summary

Users attach **PNG, JPEG, or WebP** images to claims. The API issues **Supabase Storage signed upload URLs**; the browser **PUTs** the file directly. Attachments are stored on `ClaimMessage.attachments` JSON. **Orphan files** in storage are cleaned hourly.

## Problem

Fact-checking often requires screenshots or photos. Uploads must be size-limited, MIME-validated, and scoped to the user's claim.

## Non-goals

- Video or audio file uploads to claims (schema enums exist; allowlist does not).
- Client-side direct Supabase anon uploads (service role signs URLs server-side).
- CDN public URLs without signed read refresh.

## Use case catalog

| ID | Use case | Trigger | Success |
|----|----------|---------|---------|
| **UC-U01** | Request upload URL | User picks image | `claim.requestUpload` returns `uploadUrl`, `uploadPath` |
| **UC-U02** | Upload file | Client PUT to Supabase | 200 from storage |
| **UC-U03** | Reject invalid file | Wrong type/size | Client `validateImage` toast |
| **UC-U04** | Attach to message | Create/append with attachments | JSON on message |
| **UC-U05** | Refresh read URLs | Load thread | Signed read URLs in `byId` |

## Limits

- Default max **5 MB** (`CHAT_IMAGE_MAX_BYTES`).
- MIME: `image/png`, `image/jpeg`, `image/webp`.

## Acceptance criteria

1. Image preview in composer before send.
2. Image visible in message list after send.
3. Orphan cleanup runs without deleting referenced files.

## Related

- [feat-0008 TECH](./TECH.md)
- [feat-0010](../feat-0010/PRODUCT.md) — orphan job
