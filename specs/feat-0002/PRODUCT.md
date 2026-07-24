# feat-0002: Authentication — register, login, logout

## Summary

**Email/password authentication** for Afalambe: users **register** with email and password, **log in** to receive a session cookie, and **log out** (cookie cleared). Passwords are hashed with **scrypt**; sessions are opaque UUIDs stored hashed in Postgres. This is **custom auth** (not Supabase Auth).

Complements [feat-0003](../feat-0003/PRODUCT.md) (email verification), [feat-0004](../feat-0004/PRODUCT.md) (password reset), [feat-0005](../feat-0005/PRODUCT.md) (session).

## Problem

Users need a secure account to submit fact-check claims. Registration must send verification email, create a session, and gate duplicate emails without leaking whether an email exists on login.

## Non-goals

- OAuth / social login (Google, Apple).
- Magic-link-only login.
- Multi-factor authentication (MFA).
- Supabase Auth integration.

## Actors

| Actor | Description |
|-------|-------------|
| **New user** | Registers at `/sign-up`. |
| **Returning user** | Signs in at `/sign-in`. |
| **Authenticated user** | Logs out from chat sidebar. |

## Use case catalog

### Register

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-R01** | Register success | Unique email; password min 8 chars (API); form also requires uppercase + digit | Submit sign-up form → `auth.register` | User row, verification OTP sent, session cookie set, redirect `/sign-up/verify?email=` |
| **UC-R02** | Duplicate email | Email exists | Register | 409 CONFLICT "Cet e-mail est deja utilise." |
| **UC-R03** | Rate limited | 3+ register attempts/hour/email (production) | Register | 429 TOO_MANY_REQUESTS |

### Login

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-L01** | Login success | Verified or unverified user; correct password | `auth.login` | Session cookie; redirect `/chat` |
| **UC-L02** | Invalid credentials | Wrong email or password | Login | 401 UNAUTHORIZED generic message |
| **UC-L03** | Rate limited | 10+ login attempts/min/email (production) | Login | 429 |

### Logout

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-O01** | Logout | Authenticated | `auth.logout` | Cookie cleared; redirect `/sign-in` |
| **UC-O02** | Server session row | After logout | — | **Gap:** DB `Session` row not deleted; token valid until expiry if stolen |

## Behavior (product rules)

1. Login response does **not** distinguish unknown email vs wrong password.
2. Register always creates session even before email verified (user can resend OTP while logged in).
3. Web sign-up validates stricter password than API (`signUpSchema` min 8 only on server).
4. Rate limits disabled when `NODE_ENV !== 'production'` unless `RATE_LIMIT_DISABLED=false`.

## Acceptance criteria

1. User can register, receive OTP email, and land on verify page with email in URL.
2. User can log in and reach `/chat` (then redirected to verify if unverified).
3. Logout clears cookie and returns to sign-in.
4. French error toasts on failure paths.

## Related

- [feat-0002 TECH](./TECH.md)
- [feat-0003](../feat-0003/PRODUCT.md)
- [feat-0019](../feat-0019/PRODUCT.md) — rate limits
