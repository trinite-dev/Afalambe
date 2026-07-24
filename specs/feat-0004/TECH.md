# feat-0004: Tech Spec — Password reset

## Procedures

| Procedure | Auth | Input |
|-----------|------|-------|
| `auth.requestPasswordReset` | public | `email` |
| `auth.resetPassword` | public | `token`, `newPassword` |

## Prisma

`PasswordResetToken` — `tokenHash`, `userId`, `expiresAt`, `usedAt`.

## Email

[`packages/emails/src/templates/password-reset.ts`](../../packages/emails/src/templates/password-reset.ts).

Reset URL: `${ctx.appUrl}/reset-password?token=${rawToken}`.

## Web

- `/forgot-password` — `RequestPasswordResetForm`
- `/reset-password` — `ResetPasswordForm` (reads `token` from query)

## Env

`NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.

## Related

- [feat-0002 TECH](../feat-0002/TECH.md)
