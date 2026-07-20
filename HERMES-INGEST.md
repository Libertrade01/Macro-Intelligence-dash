# Hermes → Briefing Studio ingest

Briefing Studio is the **only** destination for finished content. Hermes POSTs here after synthesis — no Notion mirror.

## Endpoint

```
POST https://your-briefing-studio.vercel.app/api/briefings
Authorization: Bearer $BRIEFING_INGEST_SECRET
Content-Type: application/json
```

## Example (curl)

```bash
curl -X POST "https://your-app.vercel.app/api/briefings" \
  -H "Authorization: Bearer $BRIEFING_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @briefing.json
```

## Example (Python)

```python
import os
import requests

def publish_to_briefing_studio(payload: dict) -> dict:
    response = requests.post(
        os.environ["BRIEFING_STUDIO_URL"].rstrip("/") + "/api/briefings",
        headers={
            "Authorization": f"Bearer {os.environ['BRIEFING_INGEST_SECRET']}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()
```

## VPS environment variables

```
BRIEFING_STUDIO_URL=https://your-app.vercel.app
BRIEFING_INGEST_SECRET=same-value-as-vercel-env
```

X credentials (`AUTH_TOKEN`, `CT0`) and Supadata keys stay on the VPS only — not in Briefing Studio.

## Ingest order

### AI daily brief

Hermes cron → synthesize → `POST` `ai_briefing` → read at `/`

### Podcast episodes

See `HERMES-PODCAST-WORKFLOW.md`. On each new episode from the channel list:

1. Fetch transcript (Supadata)
2. Summarize
3. `POST` `podcast_summary`
4. Regenerate and `POST` `macro_briefing` (`macro-living`)

No approval gate. Title filters only.

### Friday Speedrun

See `HERMES-FRIDAY-SPEEDRUN-WORKFLOW.md`. Spectra library → article fetch → summarize → `POST` `newsletter_summary` → refresh `macro-living`. No Notion.

## Content types

| type | Spec | App route |
|------|------|-----------|
| `ai_briefing` | `AI-BRIEFING-SPEC.md` | `/` |
| `podcast_summary` | `PODCAST-SUMMARY-SPEC.md` | `/macro/inputs/{slug}` |
| `newsletter_summary` | `NEWSLETTER-SUMMARY-SPEC.md` | `/macro/inputs/{slug}` |
| `macro_briefing` | `MACRO-BRIEFING-SPEC.md` | `/macro` |
