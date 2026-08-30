"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UploadDropzone } from "@/components/UploadDropzone";
import { WaveformBars } from "@/components/WaveformBars";
import {
  createTranscriptionJob,
  getTranscriptionJob,
  type Language,
  type TranscriptionJob,
} from "@/lib/api";

const POLL_INTERVAL_MS = 1500;

export default function Home() {
  const [language, setLanguage] = useState<Language>("auto");
  const [job, setJob] = useState<TranscriptionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setError(null);
      setJob(null);
      try {
        const created = await createTranscriptionJob(file, language);
        setJob(created);

        pollRef.current = setInterval(async () => {
          try {
            const updated = await getTranscriptionJob(created.id);
            setJob(updated);
            if (updated.status === "completed" || updated.status === "failed") {
              stopPolling();
            }
          } catch {
            stopPolling();
            setError("Connexion au serveur perdue pendant le traitement.");
          }
        }, POLL_INTERVAL_MS);
      } catch {
        setError("Impossible de contacter le serveur de transcription.");
      }
    },
    [language, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setJob(null);
    setError(null);
  }, [stopPolling]);

  const isBusy = job?.status === "pending" || job?.status === "processing";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <span className="text-sm font-semibold tracking-tight">
            Transcript<span className="text-accent">Power</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Local · aucun cloud
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
        {!job && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Transcrivez votre audio
              </h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                Français et anglais, traité entièrement sur cette machine.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-muted">Langue</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <UploadDropzone onFileSelected={handleFileSelected} />

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        )}

        {job && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{job.filename}</p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {statusLabel(job.status)}
                  {job.detected_language && ` · ${job.detected_language.toUpperCase()}`}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="shrink-0 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
              >
                Nouveau fichier
              </button>
            </div>

            {isBusy && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-8 py-14">
                <WaveformBars active />
                <p className="text-sm text-ink-muted">Transcription en cours…</p>
              </div>
            )}

            {job.status === "failed" && (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-5">
                <p className="text-sm font-medium text-danger">Échec de la transcription</p>
                <p className="mt-1 text-sm text-ink-muted">{job.error}</p>
              </div>
            )}

            {job.status === "completed" && (
              <div className="rounded-2xl border border-line bg-surface px-6 py-6">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {job.text || "(aucun texte détecté)"}
                </p>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function statusLabel(status: TranscriptionJob["status"]): string {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En cours";
    case "completed":
      return "Terminé";
    case "failed":
      return "Échec";
  }
}
