"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation reste possible sans le service worker ; l'app fonctionne normalement.
      });
    }
  }, []);

  return null;
}
