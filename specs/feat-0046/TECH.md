# feat-0046: Tech Spec — Sign-up recovery

## Status

**Implement now.** Depends on [feat-0045](../feat-0045/TECH.md) register output shape.

## Root cause

`auth.register` for existing **unverified** users required the **original** password. Retries from `/en/sign-up` with a new password threw `UNAUTHORIZED` → client toast **Sign up failed**.

Resend still cannot deliver to arbitrary recipients until `afalambe.org` is verified.

## Changes

### `auth.register` (unverified retry)

```ts
if (existing?.emailVerifiedAt) {
  throw CONFLICT // clear message: sign in instead
}
if (existing) {
  // Unverified: allow password reset via re-register
  const passwordHash = await ctx.hashPassword(input.password)
  await ctx.prisma.user.update({ where: { id: existing.id }, data: { passwordHash } })
  userId = existing.id
} else {
  // create as today
}
// then OTP + session + send (unchanged)
```

### Dev OTP helpers

In `apps/api` or emails caller after failed send:

```ts
if (!verifySend.ok && process.env.NODE_ENV !== 'production') {
  if (process.env.EMAIL_DEV_LOG_OTP === 'true') {
    console.info(`[dev] verify OTP for ${email}: ${rawVerificationOtp}`)
  }
}
```

Register output add optional:

```ts
devOtp: z.string().optional()
// set only when EMAIL_DEV_EXPOSE_OTP=true && NODE_ENV !== 'production'
```

### Web `sign-up-form.tsx`

| Condition | Toast |
|-----------|--------|
| `verificationEmailSent === false` | Warning (title: verification email not sent; description: provider error or fallback). If `devOtp`, append “Dev OTP: …” |
| `CONFLICT` | Error title: account exists; description: sign in |
| Other errors | Sign up failed + message |

### Env

```env
# apps/api/.env (local)
EMAIL_DEV_LOG_OTP=true
# EMAIL_DEV_EXPOSE_OTP=true   # optional; shows OTP in UI warning
```

Document in `.env.example` and `docs/env/README.md`. **Never enable expose in production.**

### Files

| Path | Change |
|------|--------|
| `packages/trpc/src/routers/auth.ts` | Unverified password update; devOtp; CONFLICT copy |
| `apps/web/components/auth/sign-up-form.tsx` | Toast routing |
| `apps/web/lib/ui-locale.ts` | `accountExistsTitle` / `accountExistsDescription` |
| `apps/api/.env` / `.env.example` | Dev OTP flags |
| `specs/README.md` | feat-0046 row |

## Verification

```bash
# 1) Register email A
# 2) Register email A again with different password → success + verify page
# 3) API log shows OTP when EMAIL_DEV_LOG_OTP=true and Resend fails
```

## Related

- [feat-0046 PRODUCT](./PRODUCT.md)
