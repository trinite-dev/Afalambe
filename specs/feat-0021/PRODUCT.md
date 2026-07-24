# feat-0021: Rate limiting and abuse protection

## Summary

In-memory **sliding-window rate limits** protect auth and claim endpoints from brute force and spam. Disabled in **non-production** unless `RATE_LIMIT_DISABLED=false`.

## Limits (production)

| Key pattern | Max | Window | Procedure |
|-------------|-----|--------|-----------|
| `register:{email}` | 3 | 1 hour | `auth.register` |
| `login:{email}` | 10 | 1 minute | `auth.login` |
| `claim-create:{userId}` | 5 | 1 minute | `claim.create` |
| `claim-upload:{userId}` | 10 | 1 minute | `claim.requestUpload` |

## Behavior

French error messages: "Trop de requetes..."

## Limitations

- Single API process only (not Redis/distributed).
- Restart clears counters.

## Related

- [feat-0021 TECH](./TECH.md)
