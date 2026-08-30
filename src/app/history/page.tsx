"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Modal } from "@/components/Modal";
import { Sheet } from "@/components/Sheet";
import { TranscriptResult } from "@/components/TranscriptResult";
import {
  deleteTranscriptionJob,
  listTranscriptionJobs,
  type TranscriptionJob,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { statusLabel } from "@/lib/status";

const PREVIEW_THRESHOLD = 220;

export default function HistoryPage() {
  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();
  const [jobs, setJobs] = useState<TranscriptionJob[] | null>(null);
  const [openJob, setOpenJob] = useState<TranscriptionJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TranscriptionJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    listTranscriptionJobs(token)
      .then(setJobs)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Échec du chargement"));
  }, [token, isAuthLoading, router]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le texte");
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !token) return;
    setIsDeleting(true);
    try {
      await deleteTranscriptionJob(deleteTarget.id, token);
      setJobs((prev) => prev?.filter((j) => j.id !== deleteTarget.id) ?? prev);
      toast.success("Transcription supprimée");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la suppression");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, token]);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Historique</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Vos transcriptions passées.</p>

        {jobs && jobs.length === 0 && (
          <p className="mt-8 text-sm text-ink-muted">
            Aucune transcription pour le moment.{" "}
            <Link href="/" className="font-medium text-accent">
              Transcrire un fichier
            </Link>
          </p>
        )}

        {jobs && jobs.length > 0 && (
          <ul className="mt-8 flex flex-col divide-y divide-line rounded-2xl border border-line">
            {jobs.map((job) => (
              <li key={job.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.filename}</p>
                    <p className="mt-1 font-mono text-xs text-ink-muted">
                      {statusLabel(job.status)}
                      {job.detected_language && ` · ${job.detected_language.toUpperCase()}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(job.text ?? "")}
                      disabled={!job.text}
                      aria-label="Copier le texte"
                      title="Copier"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-line/40 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(job)}
                      aria-label="Supprimer"
                      title="Supprimer"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {job.text && (
                  <>
                    <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{job.text}</p>
                    {job.text.length > PREVIEW_THRESHOLD && (
                      <button
                        type="button"
                        onClick={() => setOpenJob(job)}
                        className="mt-2 text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                      >
                        Voir tout
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {openJob && (
        <Sheet title={openJob.filename} onClose={() => setOpenJob(null)}>
          <TranscriptResult
            text={openJob.text ?? ""}
            filename={openJob.filename}
            detectedLanguage={openJob.detected_language}
          />
        </Sheet>
      )}

      {deleteTarget && (
        <Modal title="Supprimer la transcription" onClose={() => setDeleteTarget(null)}>
          <div className="p-6">
            <p className="text-sm text-ink-muted">
              Supprimer définitivement « {deleteTarget.filename} » de votre historique ? Cette
              action est irréversible.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
