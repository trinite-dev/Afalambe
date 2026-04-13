# Email Rules (Resend)

## References

- Agent skill (Resend API, Node SDK, React Email, webhooks): `.agents/skills/resend/SKILL.md`
- Resend documentation index for agents: [https://resend.com/docs/llms.txt](https://resend.com/docs/llms.txt)
- Resend introduction: [https://resend.com/docs/introduction](https://resend.com/docs/introduction)
- React Email docs (upstream): [https://react.email](https://react.email) and [react-email `apps/docs` on GitHub](https://github.com/resend/react-email/tree/canary/apps/docs)

## Scope

Applies to transactional and campaign emails sent by this project.

## Boundaries

- Transactional emails are triggered by product events.
- Campaign/broadcast emails are managed separately from transactional flows.

## Provider and templates

- Resend is the default provider.
- Store template ownership and version in code/config.
- Do not silently change template semantics without a version bump.

## Safety and privacy

- Minimize personally identifiable information in email payloads.
- Do not include secrets or internal-only diagnostics in email content.

## Delivery behavior

- Use idempotency keys for retriable sends.
- Define retry/backoff policy per email class.
- Log provider failures with enough context for support and debugging.

## Operations

- Track delivery, bounce, and failure metrics.
- Define disable/fallback behavior for provider outages.
