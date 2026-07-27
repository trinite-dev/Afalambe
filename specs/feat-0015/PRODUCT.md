# feat-0015: Voice input (microphone transcription)

## Summary

Chat composer supports **microphone recording**; audio is transcribed via **OpenAI Whisper** and appended to the composer text. Intended for hands-free claim entry in local languages.

## Problem

Users may prefer speaking claims; typing in Peul/Fula can be difficult on some devices.

## Use case catalog

| ID | Use case | Status |
|----|----------|--------|
| **UC-V01** | Toggle mic | MediaRecorder via `useAudioRecording` |
| **UC-V02** | Transcribe | POST OpenAI `/v1/audio/transcriptions` |
| **UC-V03** | Append text to composer | `onTranscriptionComplete` |

## Known limitations (product)

1. ~~Whisper from browser with `NEXT_PUBLIC_OPENAI_API_KEY`~~ — **fixed**: server `claim.transcribeAudio` + `AI_API_KEY` ([feat-0048](../feat-0048/PRODUCT.md)).
2. ~~Language hardcoded `fr`~~ — **fixed**: UI locale when composer empty; Fula → auto-detect ([feat-0048](../feat-0048/PRODUCT.md)).
3. Transcribed text is not auto-sent; user must submit.
4. No audio attachment stored on claim.

## Related

- [feat-0015 TECH](./TECH.md)
- [feat-0048](../feat-0048/PRODUCT.md) language experience completion
