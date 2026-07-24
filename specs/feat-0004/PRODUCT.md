# feat-0004: Password reset

## Summary

Users who forget their password can request a **reset link** by email and set a **new password** via a tokenized URL. The flow is **enumeration-safe** (always returns success on request).

## Problem

Locked-out users need self-service recovery without exposing whether an email is registered.

## Non-goals

- Password change while logged in (profile settings).
- OTP-based password reset.

## Use case catalog

| ID | Use case | Preconditions | Main flow | Postcondition |
|----|----------|---------------|-----------|---------------|
| **UC-P01** | Request reset | Any email | `auth.requestPasswordReset` | Always `{ ok: true }`; email sent if user exists |
| **UC-P02** | Reset password | Valid token (1 hour) | `auth.resetPassword` | Password updated; token consumed |
| **UC-P03** | Expired token | Token past `expiresAt` | Reset | 400 BAD_REQUEST |
| **UC-P04** | Open reset link | Query `?token=` | `/reset-password` page | Form submits token + new password |

## Acceptance criteria

1. Email contains link to `{APP_URL}/reset-password?token=...`.
2. Invalid/expired tokens show French error.
3. User can sign in with new password after reset.

## Related

- [feat-0004 TECH](./TECH.md)
- [feat-0008](../feat-0008/PRODUCT.md)
