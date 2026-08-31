"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Header } from "@/components/Header";
import { ApiError, verifyEmail } from "@/lib/api";

type Status = "verifying" | "success" | "error";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string>("Confirmation en cours…");

  useEffect(() => {
    const verification = token
      ? verifyEmail(token)
      : Promise.reject(new Error("Lien de confirmation invalide : jeton manquant."));

    verification
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Lien de confirmation invalide");
      });
  }, [token]);

  return (
    <div
      className={`rounded-2xl border px-6 py-6 ${
        status === "error" ? "border-danger/30 bg-danger/5" : "border-line bg-surface"
      }`}
    >
      <p className={`text-sm ${status === "error" ? "text-danger" : ""}`}>{message}</p>
      {status === "success" && (
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-accent">
          Aller à la connexion
        </Link>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <AuthCard title="Confirmation de l'email">
        <Suspense fallback={<p className="text-sm text-ink-muted">Chargement…</p>}>
          <VerifyContent />
        </Suspense>
      </AuthCard>
    </div>
  );
}
