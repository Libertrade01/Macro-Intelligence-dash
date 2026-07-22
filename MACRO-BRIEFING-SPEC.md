# Macro Briefing Spec

> **Current contract (V2):** the living Room View is stored in `content_json` (`schema_version: 2`) with `room_view`, `next_tests`, `regime`, `drivers`, and `source_alignment`. See `scripts/macro_signal_room_v2.py`. The markdown sections below remain the **legacy** display/ingest fallback when `content_json` is absent.

Living macro view - layer 2. One row in `briefings` with `type: macro_briefing` and slug `macro-living`. Hermes updates this row in place after each podcast episode, newsletter edition, or manual refresh.

The app owns the display contract. Hermes owns synthesis.

## Ingest Payload

```json
{
  "type": "macro_briefing",
  "slug": "macro-living",
  "title": "Macro overview",
  "date": "2026-07-01",
  "status": "ready",
  "source_count": 12,
  "sources": ["Macro Voices", "Forward Guidance", "Friday Speedrun"],
  "content_markdown": "..."
}
```

Slug defaults to `macro-living` if omitted.

## Purpose

The overview should answer:

- What is the current macro story?
- What is the base-case outlook?
- Which themes are driving the tape?
- What should be watched next?
- Where do sources agree, disagree, or change tone?

Keep it concise, evidence-led, and source-aware. Do not mirror individual summaries. Synthesize across them.

## Markdown Structure

Use `##` section headings exactly as below. The dashboard reader parses these titles.

### `## Snapshot`

Executive summary. Bullet list only. Use 4-6 bullets.

```markdown
## Snapshot

- Growth is cooling but not yet breaking; speakers are treating the labour market as the swing factor.
- The rates debate is shifting from "how high" to "how long", with cuts still data-dependent.
- USD strength remains the default until US data weakens or global growth breadth improves.
```

### `## Base Case`

The current outlook in one short paragraph, optionally followed by 2-4 bullets. Include horizon where useful.

```markdown
## Base Case

The desk base case is a late-cycle, range-bound macro tape over the next 1-4 weeks: growth is softer, inflation is not cleanly solved, and risk assets remain liquidity-sensitive rather than fundamentally cheap.

- Bias: cautious risk, USD supported, duration selective
- Confidence: medium
- Invalidation: payrolls or inflation surprise enough to reprice the Fed path
```

### `## Themes`

Theme bullets. Use bold labels followed by synthesis. Recommended labels:

- Growth
- Inflation
- Rates
- USD / FX
- Liquidity
- Risk assets
- Commodities
- Policy / geopolitics

```markdown
## Themes

- **Growth:** Softer activity data is gaining attention, but most sources are not yet calling recession.
- **Inflation:** Services inflation remains the sticky component that keeps central banks cautious.
- **Rates:** Front-end repricing is the most important transmission channel for risk.
- **USD / FX:** Dollar strength is still the cleanest expression of US relative resilience.
```

### `## Watchlist`

Things to watch next. Bullet list only. Prefer concrete catalysts, levels, assets, or invalidation signals.

```markdown
## Watchlist

- Payrolls and unemployment rate for confirmation of labour-market cooling.
- 2Y Treasury yield: sustained break lower would validate the growth-scare view.
- DXY near 105: failure to hold would challenge the USD consensus.
- Credit spreads: widening would turn the macro tone from cautious to defensive.
```

### `## What Changed`

Delta versus the prior macro-living overview. Bullet list only.

```markdown
## What Changed

- Sources are less worried about an immediate inflation re-acceleration than last week.
- The USD view has become more consensual after recent European data weakness.
- Recession language has moved from fringe risk to active scenario.
```

### `## Agreement`

Cross-source consensus. Bullet list only.

```markdown
## Agreement

- Soft-landing narrative is still alive, but increasingly dependent on labour data.
- Policy divergence supports USD until global data improves.
- Risk assets need either lower yields or better earnings breadth to extend.
```

### `## Disagreement`

Explicit tensions. Name sources where helpful.

```markdown
## Disagreement

- Macro Voices: recession risk rising. Forward Guidance: slowdown but not contraction.
- Friday Speedrun: bullish USD. Podcast B: USD reversal possible into Q3.
```

### `## Regime`

Short current regime description. Bullet list or one-line-per-source snapshot.

```markdown
## Regime

- Overall: late-cycle, liquidity-sensitive, USD-supported.
- Macro Voices: risk-off growth scare.
- Friday Speedrun: cautious, USD bid.
```

### `## Desk - {Source name}`

One desk per recurring source. Use the show/newsletter name after `Desk -`.

Each desk:

```markdown
## Desk - Macro Voices

**Regime:** Risk-off growth scare

- Pushing recession narrative after weak data.
- Watching 2Y yields for confirmation.
- Latest episode focused on labour market.

**Latest:** [Jun 24 episode](/macro/inputs/2026-06-24-macro-voices)
```

Friday Speedrun example:

```markdown
## Desk - Friday Speedrun

**Regime:** Cautious, USD bid

- Weekly anchor: positioning into month-end.
- Key level: DXY 105.
- Emphasis on central-bank divergence.

**Latest:** [Jun 27 edition](/macro/inputs/2026-06-27-friday-speedrun)
```

## Update Flow

1. Hermes ingests `podcast_summary` or `newsletter_summary`.
2. Hermes fetches recent macro inputs from Briefing Studio/Supabase.
3. Hermes fetches the previous `macro-living` row if available.
4. Hermes generates the full markdown structure above.
5. Hermes `POST`s `/api/briefings` with `type: macro_briefing`.
6. Briefing Studio upserts `macro-living` and `/macro` displays the new version.

## UI

Rendered by the desk dashboard at `/macro`:

- top command header with update time and source count
- snapshot strip
- base-case outlook panel
- theme grid
- watchlist and what-changed panels
- agreement/disagreement panels
- regime strip
- source desk cards
