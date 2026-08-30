import type { JobStatus } from "./api";

export function statusLabel(status: JobStatus): string {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En cours";
    case "completed":
      return "Terminé";
    case "failed":
      return "Échec";
    case "cancelled":
      return "Annulé";
  }
}
