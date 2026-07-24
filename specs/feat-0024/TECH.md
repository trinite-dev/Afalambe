# feat-0024: Tech Spec — UI kit

## Package

[`packages/ui`](../../packages/ui) — exports via `package.json` `exports` field.

## Chat exports

[`packages/ui/src/components/chat/index.ts`](../../packages/ui/src/components/chat/index.ts).

## Primitives

[`packages/ui/src/components/ui/**`](../../packages/ui/src/components/ui/) — Button, Field, Input, etc. (Base UI / coss patterns).

## Web integration

[`apps/web/next.config.ts`](../../apps/web/next.config.ts) — `transpilePackages: ['@afalambe/ui']`.

## Testing

Component-level tests minimal; rely on web integration and visual QA.

## Related

- [feat-0019 TECH](../feat-0019/TECH.md)
