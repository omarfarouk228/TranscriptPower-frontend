"use client";

import { useEffect, useState } from "react";
import { WaveformBars } from "./WaveformBars";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TranscribingPanel({
  filename,
  isCancelling,
  onCancel,
}: {
  filename: string;
  isCancelling: boolean;
  onCancel: () => void;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => setElapsedMs(Date.now() - startedAt), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-8 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-7">
        <WaveformBars active heightClassName="h-16" />

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Transcription
          </span>
          <p className="max-w-xs truncate text-base font-medium">
            {isCancelling ? "Annulation…" : filename}
          </p>
          <p className="font-mono text-xs text-ink-muted">{formatElapsed(elapsedMs)}</p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-line/40 hover:text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
          Arrêter
        </button>
      </div>
    </div>
  );
}
