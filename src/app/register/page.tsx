"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Header } from "@/components/Header";
import { PasswordInput } from "@/components/PasswordInput";
import { registerAccount } from "@/lib/api";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerAccount(fullName, email, password);
      setIsRegistered(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <AuthCard
        title={isRegistered ? "Vérifiez vos emails" : "Créer un compte"}
        subtitle={
          isRegistered
            ? `Un lien de confirmation a été envoyé à ${email}.`
            : "Retrouvez l'historique de vos transcriptions."
        }
      >
        {isRegistered ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m3 7 8.4 6.1a1 1 0 0 0 1.2 0L21 7" />
              </svg>
            </div>

            <p className="text-sm text-ink-muted">
              Ouvrez le lien reçu par email pour activer votre compte. Pensez à vérifier vos spams
              si vous ne le voyez pas d&apos;ici quelques minutes.
            </p>

            <Link
              href="/login"
              className="w-full rounded-full bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Aller à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-muted">Nom complet</span>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Jeanne Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
              />
            </label>

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
                minLength={8}
                autoComplete="new-password"
                placeholder="8 caractères minimum"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {isSubmitting ? "Création…" : "Créer mon compte"}
            </button>

            <p className="text-center text-sm text-ink-muted">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-medium text-accent">
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
