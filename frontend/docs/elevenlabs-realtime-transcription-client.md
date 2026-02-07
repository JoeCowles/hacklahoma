# ElevenLabs Realtime Transcription (Client-Side) Rebuild Guide

This guide explains how to fully rebuild browser-side realtime transcription with ElevenLabs Scribe in a Next.js App Router project.

## Goals

- Stream microphone audio from the browser to ElevenLabs realtime speech-to-text.
- Keep `ELEVENLABS_API_KEY` server-side only.
- Use single-use temporary tokens for client websocket auth.
- Render partial and committed transcripts live.

## Required Packages

Install these in the frontend project:

```bash
npm install @elevenlabs/elevenlabs-js
npm install dotenv
```

Notes:
- Next.js already loads `.env` files automatically at runtime.
- `dotenv` is optional in App Router routes, but listed here to match ElevenLabs docs requirements.

## Environment Variables

Use server-side env only:

```env
ELEVENLABS_API_KEY=your_secret_key
```

Do not expose this in `NEXT_PUBLIC_*` variables.

## Architecture

1. Browser requests a new single-use token from a Next.js API route.
2. Route calls ElevenLabs SDK: `client.tokens.singleUse.create("realtime_scribe")`.
3. Browser opens websocket to:
   `wss://api.elevenlabs.io/v1/speech-to-text/realtime`
   with query params including `token` and `model_id=scribe_v2_realtime`.
4. Browser captures mic audio, converts Float32 to 16-bit PCM, base64-encodes, sends `input_audio_chunk` messages.
5. Browser handles transcript events and updates UI.

## File Layout

- `src/app/api/transcribe/token/route.ts`: mints single-use Scribe token.
- `src/hooks/useRealtimeTranscription.ts`: mic + websocket logic.
- `src/components/TranscriptionCard.tsx`: renders transcripts and errors.

## 1. Token Route (Next.js API)

Create a server route that returns a fresh token every time:

- Use `POST`, not `GET`.
- Disable caching (`dynamic = "force-dynamic"`, `revalidate = 0`, no-store headers).

Why this matters:
- Scribe tokens are single-use and short-lived.
- Cached responses can replay the same token and trigger auth errors.

Minimal implementation pattern:

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function POST() {
  const token = await client.tokens.singleUse.create("realtime_scribe");
  return NextResponse.json(
    { token: token.token },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
  );
}
```

## 2. Browser Hook (Realtime Streaming)

Core responsibilities:

1. Request token from `/api/transcribe/token` with `POST` + `cache: "no-store"`.
2. Get mic stream via `navigator.mediaDevices.getUserMedia({ audio: ... })`.
3. Create `AudioContext` (16k sample rate preferred for `pcm_16000`).
4. Convert audio frames `Float32Array -> Int16 PCM -> base64`.
5. Send websocket payloads:

```json
{
  "message_type": "input_audio_chunk",
  "audio_base_64": "...",
  "sample_rate": 16000
}
```

6. Listen for events:
- `session_started`
- `partial_transcript`
- `committed_transcript`
- `committed_transcript_with_timestamps`
- `error` and auth-related errors

7. Clean up all resources on stop/unmount:
- close websocket
- stop media tracks
- disconnect processor/source
- close audio context

## 3. Websocket URL and Params

Build URL like this:

```text
wss://api.elevenlabs.io/v1/speech-to-text/realtime
  ?model_id=scribe_v2_realtime
  &token=<single_use_token>
  &audio_format=pcm_16000
  &language_code=en
  &commit_strategy=vad
  &include_timestamps=true
```

Authentication rule:
- Client-side websocket should use `token` query param.
- Do not send secret API key from browser.

## 4. UI Behavior

Recommended transcript UX:

- Keep one active `partial` row and replace its text as updates arrive.
- Convert `partial` row to `committed` when final transcript event arrives.
- Show clear error state when websocket/auth fails.

## 5. Common Failure Modes

### A) "You must be authenticated" on websocket

Typical causes:
- token endpoint reused a cached single-use token.
- token already consumed by a previous connection attempt.
- using expired token.
- wrong query key (`token`) or missing `model_id`.

Fixes:
- use `POST` token route + no-store everywhere.
- request a new token immediately before opening websocket.
- never reuse token across sessions.

### B) No transcripts but socket connected

Typical causes:
- audio chunk format not 16-bit PCM base64.
- wrong `audio_format` / sample rate mismatch.
- microphone stream not active.

Fixes:
- ensure `pcm_16000` and `sample_rate: 16000`.
- verify mic permissions and active track.

### C) Secret leak risk

Cause:
- using `NEXT_PUBLIC_ELEVENLABS_API_KEY` in browser.

Fix:
- keep only `ELEVENLABS_API_KEY` server-side.
- always mint temporary token via server route.

## 6. Verification Checklist

1. Start frontend and open page.
2. Click "Start Transcription".
3. Confirm token route returns a unique token per click.
4. Confirm websocket receives `session_started`.
5. Speak and observe `partial` then `committed` transcript updates.
6. Stop and confirm resources are released cleanly.

## 7. Hardening Suggestions (Optional)

- Add basic rate limiting on `/api/transcribe/token`.
- Add request auth so only signed-in users can mint tokens.
- Migrate from `ScriptProcessorNode` to `AudioWorklet` for modern audio pipeline reliability.
- Add reconnect policy with fresh token on reconnect.
- Add server logging with request IDs for token mint and websocket startup debugging.
