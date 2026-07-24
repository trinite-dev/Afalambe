# feat-0018: SEO, metadata, and PWA

## Summary

Next.js **metadata**, **sitemap**, **robots**, **manifest**, **Open Graph** images, and **JSON-LD** for discoverability. Auth and chat routes use **`noindex`**.

## Use case catalog

| ID | Surface | Behavior |
|----|---------|----------|
| **UC-SEO01** | Production indexing | Allowed when `VERCEL_ENV=production` |
| **UC-SEO02** | Preview/staging | Blocked or limited |
| **UC-SEO03** | `/chat`, auth | `noindex` |
| **UC-SEO04** | OG/Twitter cards | Generated images |

## Related

- [feat-0018 TECH](./TECH.md)
