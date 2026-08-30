"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WaveformBars } from "./WaveformBars";

type RecorderState = "idle" | "recording" | "recorded" | "denied" | "unsupported";

function pickMimeType(): { mimeType: string; extension: string } {
  const candidates = [
    { mimeType: "audio/webm;codecs=opus", extension: "webm" },
    { mimeType: "audio/webm", extension: "webm" },
    { mimeType: "audio/mp4", extension: "m4a" },
  ];
  for (const candidate of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }
  return { mimeType: "", extension: "webm" };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onRecordingReady,
}: {
  onRecordingReady: (file: File) => void;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<File | null>(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      setState("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { mimeType, extension } = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType });
        fileRef.current = new File([blob], `enregistrement.${extension}`, { type: blob.type });
        setAudioUrl(URL.createObjectURL(blob));
        setState("recorded");
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);
      setState("recording");
    } catch {
      setState("denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const discardRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    fileRef.current = null;
    setElapsedMs(0);
    setState("idle");
  }, [audioUrl]);

  const submitRecording = useCallback(() => {
    if (fileRef.current) onRecordingReady(fileRef.current);
  }, [onRecordingReady]);

  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border border-line bg-surface px-8 py-14 text-center">
        <p className="text-sm text-ink-muted">
          L&apos;enregistrement micro n&apos;est pas pris en charge par ce navigateur.
        </p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-8 py-14 text-center">
        <p className="text-sm text-danger">Accès au micro refusé.</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="rounded text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (state === "recorded" && audioUrl) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-surface px-8 py-10">
        <WaveformBars />
        <audio src={audioUrl} controls className="w-full" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={discardRecording}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Réenregistrer
          </button>
          <button
            type="button"
            onClick={submitRecording}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Transcrire
          </button>
        </div>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/40 bg-accent/5 px-8 py-14">
        <WaveformBars active />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
          <span className="font-mono text-sm text-ink-muted">{formatDuration(elapsedMs)}</span>
        </div>
        <button
          type="button"
          onClick={stopRecording}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Arrêter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-8 py-16 text-center">
      <WaveformBars />
      <div>
        <p className="text-base font-medium">Enregistrez depuis votre micro</p>
        <p className="mt-1 text-sm text-ink-muted">Traité localement, jamais envoyé au cloud</p>
      </div>
      <button
        type="button"
        onClick={startRecording}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Démarrer l&apos;enregistrement
      </button>
    </div>
  );
}
