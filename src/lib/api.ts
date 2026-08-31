export type Language = "auto" | "fr" | "en";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface TranscriptionJob {
  id: string;
  filename: string;
  status: JobStatus;
  requested_language: Language;
  detected_language: string | null;
  text: string | null;
  error: string | null;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  is_verified: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function createTranscriptionJob(
  file: File,
  language: Language,
  token?: string | null,
): Promise<TranscriptionJob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const res = await fetch(`${API_URL}/api/v1/transcriptions`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de l'envoi"), res.status);
  }

  return res.json();
}

export async function getTranscriptionJob(id: string): Promise<TranscriptionJob> {
  const res = await fetch(`${API_URL}/api/v1/transcriptions/${id}`);

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de la récupération"), res.status);
  }

  return res.json();
}

export async function cancelTranscriptionJob(id: string): Promise<TranscriptionJob> {
  const res = await fetch(`${API_URL}/api/v1/transcriptions/${id}/cancel`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de l'annulation"), res.status);
  }

  return res.json();
}

export async function listTranscriptionJobs(token: string): Promise<TranscriptionJob[]> {
  const res = await fetch(`${API_URL}/api/v1/transcriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de la récupération de l'historique"), res.status);
  }

  return res.json();
}

export async function deleteTranscriptionJob(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/transcriptions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de la suppression"), res.status);
  }
}

export async function registerAccount(
  fullName: string,
  email: string,
  password: string,
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password }),
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de l'inscription"), res.status);
  }

  return res.json();
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/v1/auth/verify?token=${encodeURIComponent(token)}`);

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Lien de confirmation invalide"), res.status);
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de la connexion"), res.status);
  }

  return res.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Session invalide"), res.status);
  }

  return res.json();
}
