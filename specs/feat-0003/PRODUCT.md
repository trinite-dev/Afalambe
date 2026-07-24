# feat-0003: Email verification (OTP)

## Summary

After registration, users must **verify their email** with a **6-digit OTP** sent via Resend. Verification sets `User.emailVerifiedAt`. **Chat and claim creation** require a verified email. Users can **resend** the code while logged in.

## Problem

Afalambe must confirm email ownership before users submit claims and receive notifications. Unverified users who reach `/chat` need a clear path to verify without losing their session.

## Non-goals

- Magic-link verification (OTP only today).
- SMS verification.
- Changing email address post-signup (not implemented).

## Actors

| Actor | Description |
|-------|-------------|
| **New registrant** | Lands on `/sign-up/verify?email=` after sign-up. |
| **Unverified returning user** | Logged in; redirected from chat gate with email in query. |

## Use case catalog

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-V01** | Verify OTP | Valid 6-digit code; not expired (15 min) | `auth.verifyEmail` | `emailVerifiedAt` set; redirect `/chat` |
| **UC-V02** | Invalid OTP | Wrong code | Verify | 400 BAD_REQUEST |
| **UC-V03** | Resend OTP | Logged in; not yet verified | `auth.resendVerification` | New OTP emailed; toast confirmation |
| **UC-V04** | Chat gate | Session without `emailVerifiedAt` | Open `/chat` | Redirect `/sign-up/verify?email={session.email}` |
| **UC-V05** | Missing email on verify page | Direct `/sign-up/verify` without query | Submit OTP | Toast "E-mail manquant"; resend still works if session exists |
| **UC-V06** | Already verified | `emailVerifiedAt` set | Resend | No-op `{ ok: true }` |

## Behavior (product rules)

1. OTP stored as **hashed** token in `EmailVerificationToken`.
2. Used tokens cannot be reused (`usedAt` set).
3. Template: [`packages/emails/src/templates/verify-email.ts`](../../packages/emails/src/templates/verify-email.ts) — French copy, 15-minute validity stated in email.
4. `requireVerifiedEmail` guard on all `claim.*` procedures.

## Acceptance criteria

1. OTP email arrives from `EMAIL_FROM` via Resend after register or resend.
2. Successful verify allows claim creation.
3. Chat redirect includes email query param (feat-0007 chat gate fix).

## Related

- [feat-0003 TECH](./TECH.md)
- [feat-0008](../feat-0008/PRODUCT.md) — Resend delivery
