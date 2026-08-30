# TranscriptPower — Frontend

Interface Next.js pour [TranscriptPower](https://github.com/omarfarouk228/TranscriptPower-backend), transcription audio locale en français et anglais — sans IA cloud.

## Installation

```bash
npm install
cp .env.local.example .env.local
```

Renseigner `NEXT_PUBLIC_API_URL` avec l'URL du backend FastAPI (par défaut `http://localhost:8000`).

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Le backend TranscriptPower doit tourner en parallèle.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Police [Geist](https://vercel.com/font) (Sans + Mono)
