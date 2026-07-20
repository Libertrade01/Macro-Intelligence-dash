# Macro Intelligence

Living macro overview, podcast episode summaries, and Friday Speedrun inputs.

Spun out from Briefing Studio. Uses the same Supabase project so existing podcast and newsletter history carries over automatically.

## Stack

- **Next.js 16** — reader UI + ingest API
- **Supabase** — briefings (shared with Briefing Studio)

## Quick start

```bash
npm install
cp .env.example .env.local
# Reuse the same Supabase keys as Briefing Studio

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/macro`).

## Routes

| Path | Purpose |
|------|---------|
| `/macro` | Living overview |
| `/macro/inputs` | Podcast + newsletter library |
| `/macro/episodes` | Episode list |
| `/macro/newsletter` | Friday Speedrun list |

## Hermes

Point podcast / newsletter / macro_briefing POSTs at this app's `POST /api/briefings` (or keep posting to Briefing Studio — both can write the same Supabase `briefings` table).

## Specs

- `MACRO-BRIEFING-SPEC.md`
- `PODCAST-SUMMARY-SPEC.md`
- `NEWSLETTER-SUMMARY-SPEC.md`
- `HERMES-INGEST.md`
