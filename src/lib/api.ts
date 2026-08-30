export type Language = "auto" | "fr" | "en";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface TranscriptionJob {
  id: string;
  filename: string;
  status: JobStatus;
  requested_language: Language;
  detected_language: string | null;
  text: string | null;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function createTranscriptionJob(
  file: File,
  language: Language,
): Promise<TranscriptionJob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const res = await fetch(`${API_URL}/api/v1/transcriptions`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Échec de l'envoi (${res.status})`);
  }

  return res.json();
}

export async function getTranscriptionJob(id: string): Promise<TranscriptionJob> {
  const res = await fetch(`${API_URL}/api/v1/transcriptions/${id}`);

  if (!res.ok) {
    throw new Error(`Échec de la récupération (${res.status})`);
  }

  return res.json();
}
