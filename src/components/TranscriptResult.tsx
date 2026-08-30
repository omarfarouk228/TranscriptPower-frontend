"use client";

import { toast } from "sonner";
import { WaveformBars } from "./WaveformBars";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function TranscriptResult({
  text,
  filename,
  detectedLanguage,
}: {
  text: string;
  filename: string;
  detectedLanguage: string | null;
}) {
  const hasText = text.trim().length > 0;
  const wordCount = hasText ? text.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le texte");
    }
  };

  const handleDownload = () => {
    const base = filename.replace(/\.[^./]+$/, "") || "transcription";
    download(`${base}.txt`, text);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <WaveformBars heightClassName="h-5" />
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Transcription
          </span>
        </div>

        {hasText && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copier le texte"
              title="Copier"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-line/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Télécharger en .txt"
              title="Télécharger"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-line/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-6">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {hasText ? text : "(aucun texte détecté)"}
        </p>
      </div>

      {hasText && (
        <div className="flex items-center justify-between border-t border-line px-6 py-3 font-mono text-xs text-ink-muted">
          <span>{wordCount} mot{wordCount > 1 ? "s" : ""}</span>
          {detectedLanguage && <span>{detectedLanguage.toUpperCase()}</span>}
        </div>
      )}
    </div>
  );
}
