# Implementation roadmap (spec index)

Maps initiative checklist items to **specs** and suggested **SDD phase** order. Dates are placeholders; update as you execute.

## Dependency graph (high level)

```text
Repo + env contracts → DB schema → Auth → Claim submit → AI pipeline → Admin queue → Landing/campaign polish → Staging → Production
```

## Phases

| Phase | Item                                | Spec / doc                                               | SDD phase                               |
| ----- | ----------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| 0     | Monorepo, tooling, env templates    | `README.md`, `docs/env/README.md`                        | Plan + Implement                        |
| 1     | Database provider + Prisma schema   | `api.md` (data impact), `claims-ai-pipeline.md`          | Specify → Plan → Tasks                  |
| 2     | Domain + TLS + hosting              | `program.md` (NFR), ops runbooks (future)                | Plan                                    |
| 3     | Email provider (Resend) wired       | `docs/rules/email-rules.md`, ADR-0005                    | Plan → Implement                        |
| 4     | Staging and prod env separation     | `docs/env/README.md`                                     | Plan                                    |
| 5     | AI and RAG pipeline                 | `claims-ai-pipeline.md`                                  | Specify → Plan (before heavy Implement) |
| 6     | Data model completion               | `api.md`, Prisma package                                 | Plan → Tasks                            |
| 7     | Landing page                        | `landing-page.md`                                        | Specify → Tasks                         |
| 8     | Copies and content                  | `landing-page.md` (content section), CMS decision (open) | Specify                                 |
| 9     | Training data / evaluation sets     | `claims-ai-pipeline.md` (evaluation)                     | Specify                                 |
| 10    | Feature 0: User authentication      | `web.md`, `api.md`                                       | Specify (done) → Tasks                  |
| 11    | Feature 1: Claim via campaign links | `whatsapp-distribution.md`, `web.md`                     | Specify → Tasks                         |
| 12    | Feature 2: Web chat interface       | `web.md`                                                 | Specify → Tasks                         |
| 13    | Feature 3: AI semantic matching     | `claims-ai-pipeline.md`                                  | Specify → Tasks                         |
| 14    | Feature 4: Unmatched storage        | `claims-ai-pipeline.md`, `api.md`                        | Specify → Tasks                         |
| 15    | Feature 5–6: Admin auth + dashboard | `web.md`, `api.md`                                       | Specify → Tasks                         |
| 16    | Staging deploy + QA                 | `program.md` (acceptance), testing ADR                   | Implement                               |
| 17    | Production go-live                  | same + rollback in each spec                             | Rollout                                 |

## MVP v0.50.00 definition

Deliverables that must be **spec-complete** before coding freeze for v0.50.00:

1. `landing-page.md` — signed off content and layout constraints.
2. `web.md` — chat UX, error states, locales.
3. `api.md` — procedure list, inputs/outputs, authorisation matrix.
4. `claims-ai-pipeline.md` — thresholds and failure behaviour.
5. `whatsapp-distribution.md` — URL formats and analytics expectations.

## Items marked with asterisk in source checklist

Treat third-party terms (hosting, registry, providers) as **contractual**: keep subscription, billing, and DPA details outside this repo in your ops vault.
