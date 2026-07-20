# Podcast Summary Spec

This is the target shape for podcast summary pages.

## Frontmatter

- `title`: the page title
- `date`: the episode date or ingestion date
- `type`: `podcast_summary`
- `status`: `draft` or `published`
- `show`: the show name
- `episode`: the episode title or identifier
- `tags`: podcast, summary, and topic tags

## Reading structure

### Episode overview

Give the listener one quick paragraph on what the episode was about.

### Key points

A few bullets. Not a transcript mirror.

### Quotes worth saving

Only keep the lines that actually earn space.

### Takeaways

End with the useful part:

- what matters now
- what to remember later
- what to link back to the macro overview or trading notes

## Ingest payload

```json
{
  "type": "podcast_summary",
  "title": "Show Name — Episode title",
  "date": "2026-06-25",
  "status": "ready",
  "show": "Show Name",
  "episode": "Episode title or number",
  "top_story": "One-line hook for archive cards",
  "content_markdown": "..."
}
```

Slug defaults to `{date}-{show-slug}` if omitted.

## UI

- Archive: `/macro/episodes`
- Episode reader: `/macro/episodes/{slug}`

## Example shape

Use the sample layout below when generating new summary pages:

- title, date, type, status, show, episode, tags
- episode overview
- key points
- quotes worth saving
- takeaways
