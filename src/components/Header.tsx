"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight sm:text-xl">
          Transcript<span className="text-accent">Power</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Gratuit
          </span>

          {!isLoading && user && (
            <>
              <span className="hidden truncate text-sm text-ink-muted md:inline">
                {user.email}
              </span>
              <Link
                href="/history"
                className="text-sm font-medium text-ink-muted hover:text-ink"
              >
                Historique
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded sm:inline-block"
              >
                Se déconnecter
              </button>
            </>
          )}

          {!isLoading && !user && (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-ink-muted hover:text-ink sm:inline-block"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium whitespace-nowrap text-accent-ink hover:opacity-90 sm:px-3.5 sm:text-sm"
              >
                Créer un compte
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
