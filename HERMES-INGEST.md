# Hermes → Macro Signal Room ingest

Macro Signal Room is the destination for finished macro content. Hermes POSTs here after synthesis. No Notion mirror.

AI daily briefings belong in [AI Daily Pulse](https://github.com/Libertrade01/AI-Daily-Pulse), not this app.

## Endpoint

```
POST https://your-macro-app.vercel.app/api/briefings
Authorization: Bearer $BRIEFING_INGEST_SECRET
Content-Type: application/json
```

## Example (curl)

```bash
curl -X POST "https://your-macro-app.vercel.app/api/briefings" \
  -H "Authorization: Bearer $BRIEFING_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @briefing.json
```

## Example (Python)

```python
import os
import requests

def publish_to_macro_signal_room(payload: dict) -> dict:
    response = requests.post(
        os.environ["MACRO_SIGNAL_ROOM_URL"].rstrip("/") + "/api/briefings",
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
MACRO_SIGNAL_ROOM_URL=https://your-macro-app.vercel.app
BRIEFING_INGEST_SECRET=same-value-as-vercel-env
```

Source credentials and transcript-provider keys stay on the VPS only. Not in this app.

## Ingest order

### Podcast episodes

See `HERMES-PODCAST-WORKFLOW.md`. On each new episode from the channel list:

1. Fetch transcript
2. Summarize
3. `POST` `podcast_summary`
4. Regenerate and `POST` `macro_briefing` (`macro-living`), or run the V2 worker

No approval gate. Title filters only.

### Friday Speedrun

See `HERMES-FRIDAY-SPEEDRUN-WORKFLOW.md`. Spectra library → article fetch → summarize → `POST` `newsletter_summary` → refresh `macro-living`. No Notion.

## Content types

| type | Spec | App route |
|------|------|-----------|
| `podcast_summary` | `PODCAST-SUMMARY-SPEC.md` | `/macro/inputs/{slug}` |
| `newsletter_summary` | `NEWSLETTER-SUMMARY-SPEC.md` | `/macro/inputs/{slug}` |
| `macro_briefing` | `MACRO-BRIEFING-SPEC.md` | `/macro` |
