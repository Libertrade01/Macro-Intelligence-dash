# Macro Signal Room

A living macro intelligence desk across trusted podcasts and newsletters.

Hermes watches curated sources, summarizes new inputs into this app, then a V2 synthesis worker rebuilds a structured Room View with evidence, revisions, and regime memory.

Spun out from Briefing Studio. May share the same Supabase project so existing podcast and newsletter history carries over.

AI daily briefings live in a separate product: [AI Daily Pulse](https://github.com/Libertrade01/AI-Daily-Pulse).

## What this repo is

- Next.js Macro Signal Room desk (`/macro`)
- Authenticated ingest API (`POST /api/briefings`)
- Macro inputs / revisions / regime-change APIs
- Supabase schema for summaries, living view, revisions, and regimes
- V2 synthesis worker (`scripts/macro_signal_room_v2.py`)

## What this repo is not

- Podcast discovery and newsletter watching (Hermes on the VPS)
- Source credentials, YouTube/Spectra access, or transcript provider keys
- The AI Daily Pulse reader

## Architecture

```text
Hermes VPS
  -> watch podcasts / Friday Speedrun
  -> fetch + summarize
  -> POST /api/briefings (Bearer secret)
  -> Supabase archive (podcast_summary / newsletter_summary)

V2 worker (this repo)
  -> GET /api/macro/inputs
  -> compact evidence
  -> Hermes synthesize Room View JSON
  -> validate_report
  -> dry-run by default
  -> --persist writes macro-living + revisions + regime changes

Next.js desk
  -> /macro Room View
  -> /macro/inputs archive
  -> /macro/revisions history
```

Discovery stays on the VPS. This app owns the publish contract, durable archive, Room View persistence, and the V2 synthesis worker.

## Stack

- Next.js
- Supabase
- Vercel
- Hermes Agent (VPS + local CLI for V2)
- Python (V2 worker)

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill Supabase + BRIEFING_INGEST_SECRET values
# See SUPABASE-SETUP.md

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/macro`).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public read key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side write/admin key |
| `BRIEFING_INGEST_SECRET` | Shared Bearer secret for Hermes ingest |
| `SUPABASE_ACCESS_TOKEN` | Optional Management API token for setup scripts |

Keep source credentials on the VPS only.

## Routes

| Path | Purpose |
|------|---------|
| `/macro` | Living Room View |
| `/macro/inputs` | Podcast + newsletter library |
| `/macro/episodes` | Episode list |
| `/macro/newsletter` | Friday Speedrun list |
| `/macro/revisions` | Revision history |

## Ingest

Hermes publishes typed payloads:

```text
POST /api/briefings
Authorization: Bearer $BRIEFING_INGEST_SECRET
```

Supported types include `podcast_summary`, `newsletter_summary`, and `macro_briefing` (slug `macro-living`).

V2 also posts revisions and regime changes through:

- `POST /api/macro/revisions`
- `POST /api/macro/regime-changes`

## V2 synthesis

```bash
# Dry-run by default — writes a reviewed report file, does not persist
python scripts/macro_signal_room_v2.py

# Persist only after review
python scripts/macro_signal_room_v2.py --from-report ~/macro_signal_room_v2_dryrun.json --persist
```

The worker validates Room View structure before write. Bad synthesis should not silently overwrite the living view.

## Docs

| File | Purpose |
|------|---------|
| `MACRO-BRIEFING-SPEC.md` | Living view contract (V2 `content_json` current; markdown legacy) |
| `PODCAST-SUMMARY-SPEC.md` | Podcast summary ingest format |
| `NEWSLETTER-SUMMARY-SPEC.md` | Friday Speedrun summary format |
| `HERMES-INGEST.md` | VPS → app publish contract |
| `HERMES-PODCAST-WORKFLOW.md` | Podcast discovery / transcript path |
| `HERMES-FRIDAY-SPEEDRUN-WORKFLOW.md` | Spectra library newsletter path |
| `SUPABASE-SETUP.md` | Database setup |

## Scripts

```bash
npm run create:project   # Create Supabase project (one-time)
npm run setup:db         # Apply schema
npm run verify:db        # Check connection
```
