"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Header } from "@/components/Header";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TranscribingPanel } from "@/components/TranscribingPanel";
import { TranscriptResult } from "@/components/TranscriptResult";
import { UploadDropzone } from "@/components/UploadDropzone";
import {
  cancelTranscriptionJob,
  createTranscriptionJob,
  getTranscriptionJob,
  type Language,
  type TranscriptionJob,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { statusLabel } from "@/lib/status";

const POLL_INTERVAL_MS = 1500;

type SourceMode = "file" | "record";

const SOURCE_OPTIONS: { value: SourceMode; label: string }[] = [
  { value: "file", label: "Fichier" },
  { value: "record", label: "Micro" },
];

export default function Home() {
  const { token } = useAuth();
  const [language, setLanguage] = useState<Language>("auto");
  const [sourceMode, setSourceMode] = useState<SourceMode>("file");
  const [job, setJob] = useState<TranscriptionJob | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
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
      setJob(null);
      setIsCancelling(false);
      try {
        const created = await createTranscriptionJob(file, language, token);
        setJob(created);

        pollRef.current = setInterval(async () => {
          try {
            const updated = await getTranscriptionJob(created.id);
            setJob(updated);
            if (["completed", "failed", "cancelled"].includes(updated.status)) {
              stopPolling();
            }
          } catch {
            stopPolling();
            toast.error("Connexion au serveur perdue pendant le traitement.");
          }
        }, POLL_INTERVAL_MS);
      } catch {
        toast.error("Impossible de contacter le serveur de transcription.");
      }
    },
    [language, token, stopPolling],
  );

  const handleCancel = useCallback(async () => {
    if (!job) return;
    setIsCancelling(true);
    try {
      await cancelTranscriptionJob(job.id);
    } catch {
      toast.error("Impossible d'annuler la transcription.");
      setIsCancelling(false);
    }
  }, [job]);

  const reset = useCallback(() => {
    stopPolling();
    setJob(null);
    setIsCancelling(false);
  }, [stopPolling]);

  const isBusy = job?.status === "pending" || job?.status === "processing";

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                ariaLabel="Source audio"
                value={sourceMode}
                options={SOURCE_OPTIONS}
                onChange={setSourceMode}
              />
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            {sourceMode === "file" ? (
              <UploadDropzone onFileSelected={handleFileSelected} />
            ) : (
              <AudioRecorder onRecordingReady={handleFileSelected} />
            )}
          </div>
        )}

        {job && (
          <div className="flex flex-col gap-6">
            {!isBusy && (
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
            )}

            {isBusy && (
              <TranscribingPanel
                key={job.id}
                filename={job.filename}
                isCancelling={isCancelling}
                onCancel={handleCancel}
              />
            )}

            {job.status === "cancelled" && (
              <div className="rounded-2xl border border-line bg-surface px-6 py-5">
                <p className="text-sm text-ink-muted">Transcription annulée.</p>
              </div>
            )}

            {job.status === "failed" && (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-5">
                <p className="text-sm font-medium text-danger">Échec de la transcription</p>
                <p className="mt-1 text-sm text-ink-muted">{job.error}</p>
              </div>
            )}

            {job.status === "completed" && (
              <TranscriptResult
                text={job.text ?? ""}
                filename={job.filename}
                detectedLanguage={job.detected_language}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
