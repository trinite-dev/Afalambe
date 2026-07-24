# feat-0015: Tech Spec — Voice input

## Hooks / libs

- [`apps/web/hooks/use-audio-recording.ts`](../../apps/web/hooks/use-audio-recording.ts)
- [`apps/web/lib/audio-utils.ts`](../../apps/web/lib/audio-utils.ts) — `recordAudio`, webm/opus
- [`packages/ui/.../chat-composer.tsx`](../../packages/ui/src/components/chat/chat-composer.tsx) — mic button

## Transcription

[`chat-page-client.tsx`](../../apps/web/components/chat-page-client.tsx) — inline `fetch` to OpenAI; `language: 'fr'`.

## Env

`NEXT_PUBLIC_OPENAI_API_KEY` — used in client; **missing from** `apps/web/.env.example`.

## Target architecture

- Proxy transcription through `apps/api` with `AI_API_KEY`.
- Pass `WHISPER_LANGUAGE_CODES[claimLanguage]` or `detectUserLanguage`.

## Related

- [feat-0014 TECH](../feat-0014/TECH.md)
