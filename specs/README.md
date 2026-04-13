# Spec-driven development (SDD)

This folder holds **program and feature specifications** used as the single source of truth before implementation. The workflow follows the same idea as [Zencoder’s spec-driven development guide](https://docs.zencoder.ai/user-guides/tutorials/spec-driven-development-guide): define requirements clearly up front, then plan, task, and implement against them.

## Four phases (how we use them here)

1. **Specify** — User-visible outcomes, constraints, non-goals, success metrics, acceptance tests. See `program.md` and vertical specs (`web.md`, `api.md`, etc.).
2. **Plan** — Architecture touchpoints: apps, packages, ADRs, env vars, data boundaries. Each spec has an **Architecture impact** section (aligned with `docs/specs/template.md`).
3. **Tasks** — Trackable work: derive issues or checklist items from the spec’s implementation plan; keep tasks small enough to verify in one PR.
4. **Implement** — Code changes must trace to a spec section or an explicit amendment to the spec.

## Document map

| Spec                       | Purpose                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `program.md`               | North star: Safe Voices / Afalambè product, stakeholders, global requirements, non-goals |
| `roadmap.md`               | Phased delivery and dependency order (MVP v0.50.00)                                      |
| `landing-page.md`          | Marketing / entry site and campaign landing behaviour                                    |
| `web.md`                   | Authenticated web app: chat UI, locales, accessibility                                   |
| `api.md`                   | tRPC surface: auth context, claims, admin, observability                                 |
| `claims-ai-pipeline.md`    | AI verification, semantic matching, human queue                                          |
| `whatsapp-distribution.md` | WhatsApp and other channels: links, deep links, attribution                              |

Smaller or experimental changes can still use `docs/specs/template.md` under `docs/specs/` and link here when they affect the same flows.

## Rules

- **No secrets in specs** (passwords, API keys, session tokens). Reference only variable names documented in `docs/env/README.md` and values in private `.env` (never committed).
- When behaviour changes, **update the spec** in the same change set as the code when possible.
- Link **ADRs** from `docs/architecture/decisions/` in the Architecture impact section when a decision is involved.
