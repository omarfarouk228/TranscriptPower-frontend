"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Header } from "@/components/Header";
import { PasswordInput } from "@/components/PasswordInput";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Connecté");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Échec de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <AuthCard title="Se connecter" subtitle="Accédez à votre historique de transcriptions.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="jeanne@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-muted">Mot de passe</span>
            <PasswordInput
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Votre mot de passe"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>

          <p className="text-center text-sm text-ink-muted">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-accent">
              Créer un compte
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
