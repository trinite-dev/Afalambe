# Specs Framework

Use specs to describe medium and large changes before implementation.

## When to write a spec

- New user-facing feature or flow
- API contract change
- Data model change
- Integration with external providers
- Any change with rollout risk

## Lifecycle

1. Copy `template.md` and fill all sections.
2. Link related ADRs (if architecture changes are involved).
3. Implement work in small, reviewable increments.
4. Update the spec with outcomes and follow-up tasks.

## Required quality bar

- Problem and scope are explicit
- Risks and rollback are documented
- Test plan covers expected and failure paths
