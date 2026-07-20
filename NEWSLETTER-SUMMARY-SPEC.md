# Newsletter Summary Spec

Weekly newsletter summaries — starting with **Friday Speedrun** by Brent Donnelly.

## Schedule

Hermes cron reviews the Spectra Markets library — see `HERMES-FRIDAY-SPEEDRUN-WORKFLOW.md`.

Target: **Fridays at 16:00 Europe/London** (or poll until the edition lands).

## Ingest payload

```json
{
  "type": "newsletter_summary",
  "title": "Friday Speedrun — 27 Jun 2026",
  "date": "2026-06-27",
  "status": "ready",
  "show": "Friday Speedrun",
  "sources": ["Friday Speedrun"],
  "top_story": "One-line hook for archive cards",
  "content_markdown": "..."
}
```

Slug defaults to `{date}-friday-speedrun` if omitted (e.g. `2026-06-27-friday-speedrun`).

## Markdown structure

### Edition overview

One paragraph — what this week's note covered.

### Key calls

Bullets. Levels, pairs, regime, positioning. Not a full mirror.

### Themes

What Brent is emphasising this week.

### Quotes worth saving

Only lines that earn space.

### Takeaways

- What matters now
- What to watch next week
- Link back to macro overview or trading notes if useful

## Example desk link (for macro living doc)

After ingest, update `macro-living` with:

```markdown
**Latest:** [Jun 27 edition](/macro/newsletter/2026-06-27-friday-speedrun)
```

## UI

- Archive: `/macro/newsletter`
- Edition reader: `/macro/newsletter/{slug}`
