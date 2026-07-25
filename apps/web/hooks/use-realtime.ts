'use client';

import { useEffect, useRef, useCallback } from 'react';

interface WSMessage {
  type: string;
  payload: Record<string, unknown>;
  ts: number;
  seq?: number;
}

interface UseRealtimeOptions {
  claimId: string | null;
  enabled: boolean;
  /** When true, poll instead of waiting only for WS (also used when no standalone API). */
  isGenerating?: boolean;
  onMessage?: (payload: Record<string, unknown>) => void;
  onStatusChange?: (payload: Record<string, unknown>) => void;
  onTypingChange?: (isTyping: boolean) => void;
  onGapDetected?: () => void;
}

const RECONNECT_CONFIG = {
  baseDelay: 1_000,
  maxDelay: 30_000,
  backoffMultiplier: 2,
} as const;

const POLL_INTERVAL_MS = 2_500;

/** Dual-run: WS against standalone API. Same-origin Next backend: polling only. */
function useStandaloneWs(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}

function getWsUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  try {
    const parsed = new URL(apiUrl);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${parsed.host}`;
  } catch {
    const protocol =
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//localhost:4000`;
  }
}

/**
 * Realtime for claim threads.
 * - Standalone API (`NEXT_PUBLIC_API_URL`): WebSocket (feat-0009).
 * - Same-origin / Vercel (feat-0047): poll via invalidate callbacks.
 */
export function useRealtime({
  claimId,
  enabled,
  isGenerating = false,
  onMessage,
  onStatusChange,
  onTypingChange,
  onGapDetected,
}: UseRealtimeOptions): void {
  const wsRef = useRef<WebSocket | null>(null);
  const lastSeqRef = useRef(0);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const standalone = useStandaloneWs();

  const onMessageRef = useRef(onMessage);
  const onStatusChangeRef = useRef(onStatusChange);
  const onTypingChangeRef = useRef(onTypingChange);
  const onGapDetectedRef = useRef(onGapDetected);
  onMessageRef.current = onMessage;
  onStatusChangeRef.current = onStatusChange;
  onTypingChangeRef.current = onTypingChange;
  onGapDetectedRef.current = onGapDetected;

  // --- Polling path (same-origin / no WS host) ---
  useEffect(() => {
    if (standalone || !enabled || !claimId) return;

    const tick = () => {
      onMessageRef.current?.({});
      onStatusChangeRef.current?.({});
    };

    // Always poll lightly while a thread is open; faster while generating.
    const intervalMs = isGenerating ? POLL_INTERVAL_MS : POLL_INTERVAL_MS * 2;
    const id = setInterval(tick, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [standalone, enabled, claimId, isGenerating]);

  // Local typing from mutation pending (no server typing without WS)
  useEffect(() => {
    if (standalone) return;
    onTypingChangeRef.current?.(isGenerating);
  }, [standalone, isGenerating]);

  // --- WebSocket path (dual-run standalone API) ---
  const connect = useCallback(() => {
    if (!standalone || !enabled) return;

    try {
      const ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        if (claimId) {
          ws.send(JSON.stringify({ type: 'subscribe', payload: { claimIds: [claimId] } }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as WSMessage;
          if (typeof msg.seq === 'number') {
            if (lastSeqRef.current > 0 && msg.seq > lastSeqRef.current + 1) {
              onGapDetectedRef.current?.();
            }
            lastSeqRef.current = msg.seq;
          }
          if (msg.type === 'message') onMessageRef.current?.(msg.payload);
          if (msg.type === 'status') onStatusChangeRef.current?.(msg.payload);
          if (msg.type === 'typing') {
            onTypingChangeRef.current?.(Boolean(msg.payload.isTyping));
          }
        } catch {
          // ignore malformed
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!enabled) return;
        const delay = Math.min(
          RECONNECT_CONFIG.baseDelay *
            RECONNECT_CONFIG.backoffMultiplier ** reconnectAttemptRef.current,
          RECONNECT_CONFIG.maxDelay,
        );
        reconnectAttemptRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      wsRef.current = ws;
    } catch {
      // ignore
    }
  }, [standalone, enabled, claimId]);

  useEffect(() => {
    if (!standalone) return;

    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [standalone, connect]);

  useEffect(() => {
    if (!standalone || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !claimId) {
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'subscribe', payload: { claimIds: [claimId] } }));
  }, [standalone, claimId]);
}
