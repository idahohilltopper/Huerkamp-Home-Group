# Huerkamp Home Group – Recruiting Website

Next.js (App Router) recruiting site. The application form posts to `/api/apply`, which creates a lead in Follow Up Boss tagged `Recruiting`.

## Run
```
cp .env.example .env.local   # set FUB_API_KEY
npm install
npm run dev
```

## Deploy
Any Node host (Vercel, Railway, etc.). Set `FUB_API_KEY` (and optionally `FUB_SYSTEM`, `FUB_SYSTEM_KEY`) as environment variables.
