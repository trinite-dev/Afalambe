# feat-0025: WhatsApp and campaign distribution (planned)

## Summary

**Planned** capability for sharing Afalambe entry points via **WhatsApp** and campaign landing URLs with **attribution** (`Campaign`, `UserAttribution` models in [`api.md`](../api.md)). **Not implemented** in code today.

## Problem (future)

Users discover claims through social channels; product needs traceable `/r/{slug}` style entry and UTM capture at signup.

## Non-goals (current MVP)

- WhatsApp Business API integration.
- In-chat WhatsApp share button.

## Target use cases (from legacy spec)

| ID | Use case | Status |
|----|----------|--------|
| **UC-WA01** | Campaign landing slug | Planned |
| **UC-WA02** | Store attribution at signup | Planned |
| **UC-WA03** | Share verification result link | Planned |

## Related

- [`whatsapp-distribution.md`](../whatsapp-distribution.md)
- [feat-0022 TECH](../feat-0022/TECH.md) — schema gaps
