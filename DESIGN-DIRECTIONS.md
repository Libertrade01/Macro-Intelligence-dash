# Macro Intelligence — visual redesign directions

## Product premise

Macro Intelligence is not a podcast archive. It is a continuously updated house view built from a small set of trusted macro voices.

The product has two jobs:

1. **Inputs** should make incoming episodes easy to scan, triage, revisit, and understand before opening.
2. **Overview** should show the current macro thesis, what changed, why it changed, and which sources support or challenge it.

The core loop should be visible in the product:

**New episode → extracted signals → changed beliefs → current house view**

### Positioning

**Category:** a private macro intelligence desk, not a podcast reader.

**Brand promise:** Turn the voices you trust into one living market view.

**Suggested product line:** **Your sources. One evolving view.**

Supporting copy: “Macro Intelligence listens across your core sources, tracks changes in their thinking, and keeps a current view of the regime, risks, and next catalysts.”

## What is not working today

- The permanent left rail and narrow content column make the product feel smaller than the screen.
- The inputs page gives almost identical visual weight to every episode. Show, subject, relevance, and freshness are difficult to scan.
- Read/unread is the dominant state, although “changed the view / supports the view / background” matters more.
- The overview is a sequence of boxes. It has sections, but no clear reading order or strong central conclusion.
- Source summaries sometimes leak into the base-case area, turning synthesis back into a transcript archive.
- “Living intelligence” is stated in the subtitle but not demonstrated through change history, evidence, confidence, or traceability.
- The current purple accent and geometric display face feel close to a generic dark AI dashboard.
- The overview and inputs page look like separate templates rather than two sides of one intelligence workflow.

## Shared information architecture

All three directions use a new top-level structure:

- **Today** — the current macro view
- **Signals** — episode and newsletter intake
- **Sources** — persistent views of each show and how its stance has evolved
- **History** — prior house views and the change log

“Overview” becomes **Today** and “Inputs” becomes **Signals**. The original terms can remain as small explanatory labels during transition.

### Shared overview hierarchy

1. **The call** — one short house-view statement, horizon, regime, and confidence
2. **What changed** — deltas caused by the newest inputs
3. **Causal picture** — the relationships between growth, inflation, policy, liquidity, and assets
4. **Next tests** — upcoming catalysts and explicit invalidation conditions
5. **Source alignment** — agreement, dissent, and the evidence trail

### Shared signal-card anatomy

Every episode should expose, without opening it:

- show identity and publish time
- episode title and a two-line “why it matters” deck
- 2–3 topic labels
- stance: supports / challenges / adds context
- impact on the house view: high / medium / background
- state: new / reviewed / incorporated

The first release can use title, show, date, read state, and `top_story`. Topic, stance, impact, and incorporation state require structured metadata from ingestion.

---

## Direction 01 — The Signal Room

### Idea

A calm, high-end decision terminal: closer to a modern research desk than a trading screen. This is the most operational direction and the strongest continuation of Briefing Studio.

### Brand character

Precise, fast, composed, proprietary. The interface should feel like someone is actively maintaining the view behind the glass.

**Tagline:** **Know what changed. Know what matters.**

### Visual system

- **Base:** carbon `#111411`
- **Raised surface:** mineral `#181C18`
- **Primary text:** bone `#F1F0E8`
- **Secondary text:** fog `#969C91`
- **Single accent:** signal lime `#B7D36B`
- **Dividers:** `rgba(241, 240, 232, .10)`
- **Typography:** Satoshi or Geist for interface and display; IBM Plex Mono or DM Mono for timestamps and evidence labels
- **Shape:** mostly square, with 4–8px radii only where containment matters
- **Texture:** extremely subtle charcoal grain; no gradients except a restrained radial glow around the live status
- **Motion:** new signals enter as a short left-to-right sweep; changed fields flash once, then settle; 180–240ms transitions

### Navigation

Remove the permanent sidebar. Use a 64px top bar:

`LIBERTRADE / MACRO INTELLIGENCE     Today  Signals  Sources  History      Live · updated 8m ago`

This returns roughly 220px of horizontal space and makes the product feel like a workspace rather than an admin panel.

### Today layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ THE CALL                         │ SINCE LAST UPDATE                      │
│ Late-cycle, liquidity-sensitive │ 3 beliefs reinforced · 1 challenged   │
│ USD supported / risk selective  │ Latest: Forward Guidance, 18m ago     │
│ 1–4 weeks · MEDIUM CONFIDENCE   │ View update 04                         │
├──────────────────────────────────┴───────────────────────────────────────┤
│ REGIME TAPE  Growth ↓   Inflation →   Policy restrictive   Liquidity ↓  │
├───────────────────────────────────────────────┬──────────────────────────┤
│ WHAT IS DRIVING THE VIEW                      │ NEXT TESTS               │
│ Growth cooling → cuts repriced → USD/risk ... │ Payrolls · 2Y · DXY 105 │
│ A horizontal causal chain, not a card grid    │ with date + invalidation │
├───────────────────────────────────────────────┴──────────────────────────┤
│ SOURCE ALIGNMENT: aligned lanes with dissent visibly pulled off-axis     │
└──────────────────────────────────────────────────────────────────────────┘
```

The page is intentionally shallow: the answer appears in the first viewport. Lower sections hold expandable evidence, individual source desks, and the update ledger.

### Signals layout

- Top row: search, source filter, topic filter, state filter, and `View: Stream / Sources`.
- A wide **New since your last visit** band contains the 2–4 newest episodes as substantial editorial cards.
- The remaining library uses a two-column feed, not a skinny list.
- Cards have a 72px source monogram block, title, deck, topics, and an evidence footer.
- Selecting a card opens a persistent right-side reading pane; the library remains in context.
- Source view becomes horizontal shelves: one row per show, newest three visible, with an “open source” action.

### Signature interaction

An episode card includes **View impact**. Opening it highlights the exact sentences or regime labels changed in Today and links back to the supporting excerpt.

### Strengths and trade-off

- Best daily-use ergonomics and strongest “intelligence system” positioning.
- Handles growing volume without becoming noisy.
- Requires disciplined restraint; too many live indicators would turn it into a faux Bloomberg terminal.

---

## Direction 02 — The Macro Journal

### Idea

An intelligence publication that rewrites itself. It treats the house view as the front page and each source as a correspondent. This is the most premium and editorial direction.

### Brand character

Authoritative, thoughtful, independent, human. It says “considered judgment” rather than “real-time dashboard.”

**Tagline:** **The market story, continuously revised.**

### Visual system

- **Base:** warm paper `#EEEADF`
- **Primary text:** ink `#1D211E`
- **Secondary text:** graphite `#66685F`
- **Inset surface:** parchment `#E3DED1`
- **Single accent:** oxblood `#8B3F36`
- **Typography:** Instrument Serif for the thesis and major headings; Satoshi/Geist for navigation and supporting copy; DM Mono for dates and revisions
- **Shape:** almost no card radii; hierarchy comes from rules, columns, scale, and whitespace
- **Texture:** fine paper grain with subtle registration marks and revision notations
- **Motion:** restrained page/revision transitions; changed passages receive a temporary margin mark

### Navigation

A slim masthead replaces the sidebar. The product name sits left; issue metadata sits right. Primary navigation sits below as a ruled text menu.

### Today layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LIBERTRADE / MACRO INTELLIGENCE                 REV. 04 · 21 JUL 2026    │
├──────────────────────────────────────────────────────────────────────────┤
│ THE HOUSE VIEW                         │ IN THIS REVISION                 │
│ Large serif thesis over 4–6 lines      │ + liquidity concern increased   │
│ with horizon and confidence below      │ − immediate inflation concern   │
├────────────────────────────────────────┼──────────────────────────────────┤
│ The argument                           │ Catalysts / invalidation         │
│ Narrative explanation in two columns   │ A dated margin agenda            │
├────────────────────────────────────────┴──────────────────────────────────┤
│ Correspondents: one crisp stance line per source + latest dispatch       │
└──────────────────────────────────────────────────────────────────────────┘
```

Consensus and disagreement become annotated pull quotes in the argument, not three equal dashboard cards. “What changed” is literally presented as editorial revision marks. The whole page reads like a coherent memo.

### Signals layout

- The newest episode becomes a large lead story with source masthead, title, summary, and “effect on the view.”
- The next four sit in a mixed two-column editorial grid with varied proportions.
- Older material moves into a clean archive index grouped by week, with generous row height and a visible one-line deck.
- A persistent source rail uses typographic mastheads instead of generic filter pills.
- Read state becomes secondary; **Filed into view** is the primary completion state.

### Signature interaction

Toggle **Show revisions** to reveal what the living overview said before the selected episode arrived, with margin annotations explaining each change.

### Strengths and trade-off

- Most distinctive, premium, and memorable brand expression.
- Makes long-form synthesis exceptionally readable.
- Less suitable if the future product needs dense real-time market data, charts, and many rapid controls.

---

## Direction 03 — The Macro Atlas

### Idea

A spatial map of the current regime. Sources and episodes are not presented as documents first; they appear as evidence moving the system’s major forces. This is the most original and ambitious direction.

### Brand character

Exploratory, systemic, intelligent, cinematic. It makes the AI’s model of the world tangible.

**Tagline:** **See the forces moving the view.**

### Visual system

- **Base:** midnight slate `#10181B`
- **Primary text:** frost `#E8EEE9`
- **Secondary text:** sage gray `#88958F`
- **Panel:** deep teal `#162226`
- **Single accent:** mineral cyan `#68B9B2`
- **Typography:** Cabinet Grotesk or Geist for display; Source Serif 4 for explanatory text; DM Mono for levels and dates
- **Shape:** map panels with clipped corners and thin plotting lines, not rounded cards
- **Texture:** faint contour lines and a low-opacity coordinate grid
- **Motion:** relationships draw on; selecting a signal softly reweights connected nodes; reduced-motion mode swaps this for static emphasis

### Navigation

A compact floating command bar sits at the bottom or top centre. `Today`, `Signals`, and `Sources` behave as lenses over the same underlying map rather than separate-looking pages.

### Today layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ HOUSE VIEW: late-cycle / liquidity-sensitive          Confidence 63%     │
├────────────────────────────────────────────────┬─────────────────────────┤
│                                                │ CHANGE LEDGER           │
│     INFLATION ───→ POLICY                      │ 18m  AI unwind ↑        │
│          │            │                        │ 2h   USD view reinforced │
│          ↓            ↓                        │ 1d   growth softened     │
│       GROWTH ───→ LIQUIDITY ───→ RISK          ├─────────────────────────┤
│       node size = importance                   │ NEXT CATALYSTS          │
│       line weight = evidence                   │ Payrolls · CPI · FOMC   │
├────────────────────────────────────────────────┴─────────────────────────┤
│ EVIDENCE RIBBON: episode cards positioned under the force they changed  │
└──────────────────────────────────────────────────────────────────────────┘
```

The map is not decorative. Clicking “Liquidity” filters the evidence ribbon, shows agreement and dissent, and explains which inputs last changed that node. A compact prose “house view” remains available so insight never depends on interpreting a diagram.

### Signals layout

- Incoming episodes form a broad chronological river with lanes for each source.
- Each item has a compact cover tile; vertical position shows time, horizontal lane shows source.
- Topic and impact filters temporarily regroup the river by macro force.
- A **Digest mode** converts the map into a conventional two-column list for scanning and accessibility.
- The reading pane shows “connected forces” and the before/after state of the map.

### Signature interaction

Drag the timeline backward to replay how the regime and confidence changed as episodes arrived. Every state remains attributable to its evidence.

### Strengths and trade-off

- Best expression of “the AI is learning in real time” and strongest long-term product moat.
- Creates a memorable visual identity without relying on generic AI gradients.
- Highest implementation and data-model cost; it should be phased after the ingestion metadata and revision history are reliable.

---

## Direction comparison

| Criterion | Signal Room | Macro Journal | Macro Atlas |
|---|---:|---:|---:|
| Daily scanning | Excellent | Good | Good |
| Long-form reading | Good | Excellent | Good |
| Makes change visible | Excellent | Excellent | Excellent |
| Works with current data | Strong | Strong | Limited |
| Distinctive brand | Strong | Excellent | Excellent |
| Implementation risk | Low–medium | Medium | High |
| Future market-data fit | Excellent | Fair | Strong |

## Recommendation

Build **Direction 01, The Signal Room**, then borrow two signature ideas from the others:

- the Journal’s visible revision language for **What changed**
- the Atlas’s causal chain for **Drivers of the view**, implemented first as a simple horizontal system rather than an interactive graph

This gives the product a usable, premium v1 without designing around data that does not exist yet. It also leaves a clear path toward the more ambitious “AI learning” experience.

## Recommended delivery sequence

### Phase 1 — visual and structural redesign

- Replace sidebar with top navigation.
- Rebuild Today around The call, What changed, regime tape, causal chain, next tests, and source alignment.
- Replace the input inbox with featured new arrivals and a two-column card feed.
- Add a reading side panel on desktop and full-page reader on mobile.
- Use existing data only; gracefully omit enrichment fields.

### Phase 2 — intelligence metadata

Add structured fields during ingestion:

- `topics[]`
- `stance` (`supports`, `challenges`, `context`)
- `impact` (`high`, `medium`, `background`)
- `incorporated_at`
- `changed_sections[]`
- `key_assets[]`
- `confidence_delta`

### Phase 3 — provenance and history

- Save each macro view revision instead of only overwriting `macro-living`.
- Link changed claims to episodes and excerpts.
- Add before/after revision mode.
- Introduce the Atlas replay only when enough history exists to make it meaningful.

## Non-negotiable product rules

- One primary accent per direction; status colours appear only when their meaning is essential.
- The first viewport must answer “What is the view?” and “What changed?”
- No three-equal-card dashboard rows as the main composition.
- No 44px archive rows for new or important signals.
- Body text stays near 60–70 characters per line.
- Use sentence case for navigation and section headings.
- Every change in the house view should eventually be traceable to evidence.
- Animation supports state change; it never impersonates market activity.
- Mobile collapses into a clear narrative, not a miniature dashboard.

