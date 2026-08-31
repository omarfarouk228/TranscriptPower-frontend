"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { WaveformBars } from "./WaveformBars";

const ACCEPTED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"];
const ACCEPTED = ACCEPTED_EXTENSIONS.join(",");

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function UploadDropzone({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedFile(file)) {
        toast.error("Format non pris en charge. Utilisez MP3, WAV, M4A, OGG, FLAC ou WEBM.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-8 py-16 text-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isDragging ? "border-accent bg-accent/5" : "border-line hover:border-ink-muted"
      }`}
    >
      <div className="pointer-events-none flex flex-col items-center gap-4">
        <WaveformBars />
        <div>
          <p className="text-base font-medium">
            Glissez un fichier audio, ou{" "}
            <span className="text-accent">parcourez</span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            MP3, WAV, M4A, OGG, FLAC · traité localement, jamais envoyé au cloud
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
