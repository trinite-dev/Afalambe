# feat-0045: Signup verification email delivery reliability

## Summary

Users can reach `/en/sign-up/verify?email=…` after sign-up but **never receive the OTP email**, then see **“Sign up failed”** on retry. This feature hardens the **verify-email delivery path**: Resend configuration, failure surfacing, and a sane path for **unverified accounts that already exist**.

**Status:** Specified — implement with [TECH](./TECH.md).

## Incident (reproduced)

| Observation | Evidence |
|-------------|----------|
| URL | `http://localhost:3001/en/sign-up/verify?email=iam%40damolaoladipo.com` |
| Toast | Sign up failed / Inscription impossible |
| Inbox | No verification email |
| API | `auth.register` for that address → **409 CONFLICT** (`Cet e-mail est deja utilise.`) |
| DB | User exists, `emailVerifiedAt = null` |
| `EmailDelivery` | `templateKey=verify-email`, `status=failed`, `errorCode=RESEND_SEND_FAILED` |
| Resend | Domain must be verified for `EMAIL_FROM=hello@afalambe.com` (previously failed on unverified `afalambe.org`) |

### Failure chain

1. First register **creates the user** and tries Resend → **send fails** (unverified domain).
2. Register still returns **success** and the UI navigates to `/sign-up/verify`.
3. User never gets OTP; resend may also fail while UI claims success.
4. Second register attempt → **CONFLICT** → “Sign up failed” with no recovery path.

## Goals

1. **Actionable email errors** — If Resend rejects the send, the user sees why (or a safe summary) and how to continue (resend / wait / contact).
2. **Do not lie** — Never toast “email sent” when `EmailDelivery.status === failed`.
3. **Unverified retry** — If email already exists and is **not** verified, a new sign-up with the **correct password** re-issues OTP + session and lands on verify (instead of a dead-end CONFLICT).
4. **Ops visibility** — Persist Resend’s error message (or truncated form) on `EmailDelivery` for debugging.
5. **Env contract** — Document that `EMAIL_FROM` must use a **verified Resend domain**, or `beth.t@example.com` for local sandbox (send restricted by Resend).

## Non-goals

- Changing OTP length or expiry (still 6 digits / 15 min per [feat-0003](../feat-0003/PRODUCT.md)).
- Magic-link verification.
- Auto-provisioning Resend domains via API.
- Hiding all account-existence signals (CONFLICT for **verified** emails remains).

## Actors

| Actor | Need |
|-------|------|
| **New registrant** | Receives OTP or clear failure when email cannot send |
| **Unverified returner** | Can complete signup/verify without “email already used” dead end |
| **Operator** | Sees Resend domain/from misconfig in logs or `EmailDelivery` |

## Use cases

| ID | Use case | Success |
|----|----------|---------|
| **UC-VE01** | Register with working Resend | User created; OTP email delivered; verify page |
| **UC-VE02** | Register with Resend failure | User created (or unchanged); verify page; **warning toast** with send failure detail; no “sent” toast |
| **UC-VE03** | Resend when Resend fails | Error toast with provider message; no success toast |
| **UC-VE04** | Re-register unverified email + correct password | New OTP; session; navigate verify; attempt send |
| **UC-VE05** | Re-register verified email | CONFLICT (unchanged) |
| **UC-VE06** | Re-register unverified + wrong password | Unauthorized / invalid credentials (do not send OTP) |

## Acceptance criteria

1. With unverified `EMAIL_FROM` domain, UI does **not** claim the verification email was sent.
2. `EmailDelivery` rows for failed sends store a usable Resend error string (truncated ok).
3. Existing unverified user can recover via password-confirmed re-register or working resend once Resend is fixed.
4. `apps/api/.env.example` documents verified domain vs `onboarding@resend.dev`.
5. Unit/integration coverage for UC-VE04 password check and failed-send response shape.

## Related

- [feat-0003](../feat-0003/PRODUCT.md) — OTP verification
- [feat-0002](../feat-0002/PRODUCT.md) — register
- [feat-0011](../feat-0011/PRODUCT.md) — Resend
- [docs/env/README.md](../../docs/env/README.md)
