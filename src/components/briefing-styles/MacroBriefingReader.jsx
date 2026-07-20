import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/desk-dashboard.css";
import { prepareMacroBriefing } from "../../lib/prepare-macro-briefing";
import { formatBriefingDate } from "../../lib/briefings";

function MarkdownText({ children }) {
  if (!children) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children }) => (
          <Link href={href || "#"} className="macro-dash__inline-link">
            {children}
          </Link>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function BulletList({ items, variant }) {
  if (!items?.length) {
    return <p className="macro-dash__empty">Nothing captured yet.</p>;
  }

  return (
    <ul className={`macro-dash__list${variant ? ` macro-dash__list--${variant}` : ""}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <MarkdownText>{item}</MarkdownText>
        </li>
      ))}
    </ul>
  );
}

function SnapshotStrip({ snapshot, fallback }) {
  const items = snapshot?.bullets?.length ? snapshot.bullets : fallback?.bullets || [];

  if (!items.length) return null;

  return (
    <section className="macro-dash__snapshot" aria-label="Macro snapshot">
      {items.slice(0, 6).map((item, index) => (
        <div key={`${item}-${index}`} className="macro-dash__snapshot-item">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>
            <MarkdownText>{item}</MarkdownText>
          </p>
        </div>
      ))}
    </section>
  );
}

function BaseCasePanel({ baseCase, regime }) {
  const paragraphs = baseCase?.paragraphs || [];
  const bullets = baseCase?.bullets || [];
  const fallback = regime?.bullets || [];

  if (!paragraphs.length && !bullets.length && !fallback.length) return null;

  return (
    <section className="macro-dash__base">
      <div className="macro-dash__section-kicker">Base case</div>
      {paragraphs[0] ? (
        <p className="macro-dash__base-text">
          <MarkdownText>{paragraphs[0]}</MarkdownText>
        </p>
      ) : null}
      <BulletList items={bullets.length ? bullets : fallback.slice(0, 4)} />
    </section>
  );
}

function ThemeGrid({ themes }) {
  const items = themes?.items || [];
  if (!items.length) return null;

  return (
    <section className="macro-dash__themes">
      <div className="macro-dash__section-head">
        <div>
          <p className="macro-dash__section-kicker">Theme map</p>
          <h2>Drivers of the current tape</h2>
        </div>
      </div>
      <div className="macro-dash__theme-grid">
        {items.map((item, index) => (
          <article key={`${item.raw}-${index}`} className="macro-dash__theme">
            <div className="macro-dash__theme-index">{String(index + 1).padStart(2, "0")}</div>
            <h3>{item.label || "Theme"}</h3>
            <p>
              <MarkdownText>{item.text}</MarkdownText>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompactPanel({ title, kicker, items, variant }) {
  if (!items?.length) return null;

  return (
    <section className={`macro-dash__panel${variant ? ` macro-dash__panel--${variant}` : ""}`}>
      <p className="macro-dash__section-kicker">{kicker}</p>
      <h2>{title}</h2>
      <BulletList items={items} variant={variant} />
    </section>
  );
}

function DeskCard({ desk }) {
  return (
    <article className="macro-dash__desk">
      <header className="macro-dash__desk-head">
        <div>
          <p className="macro-dash__desk-label">Source desk</p>
          <h3>{desk.name}</h3>
        </div>
        {desk.regime ? <span className="macro-dash__chip">{desk.regime}</span> : null}
      </header>
      <BulletList items={desk.bullets} />
      {desk.latest ? (
        <Link href={desk.latest.href} className="macro-dash__desk-link">
          {desk.latest.label}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : null}
    </article>
  );
}

export default function MacroBriefingReader({ briefing }) {
  const content = prepareMacroBriefing(briefing);
  const updatedLabel = content.meta.updatedAt
    ? new Date(content.meta.updatedAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : formatBriefingDate(content.meta.date);

  return (
    <div className="macro-dash">
      <header className="macro-dash__hero">
        <div className="macro-dash__hero-copy">
          <p className="macro-dash__eyebrow">Macro Mind</p>
          <h1 className="macro-dash__title">{content.meta.title}</h1>
          <p className="macro-dash__subtitle">
            Living synthesis across podcasts, newsletters, and desk notes.
          </p>
        </div>
        <div className="macro-dash__status-board" aria-label="Overview metadata">
          <div>
            <span>Updated</span>
            <strong>{updatedLabel}</strong>
          </div>
          {content.meta.sourceCount ? (
            <div>
              <span>Inputs</span>
              <strong>{content.meta.sourceCount}</strong>
            </div>
          ) : null}
          {content.desks.length ? (
            <div>
              <span>Desks</span>
              <strong>{content.desks.length}</strong>
            </div>
          ) : null}
        </div>
      </header>

      <SnapshotStrip snapshot={content.snapshot} fallback={content.agreement} />

      <div className="macro-dash__topology">
        <BaseCasePanel baseCase={content.baseCase} regime={content.regime} />
        <CompactPanel
          title="What to watch"
          kicker="Watchlist"
          items={content.watchlist?.bullets}
          variant="watch"
        />
      </div>

      <ThemeGrid themes={content.themes} />

      <div className="macro-dash__synthesis">
        <CompactPanel
          title="Consensus"
          kicker="Agreement"
          items={content.agreement?.bullets}
          variant="agree"
        />
        <CompactPanel
          title="Tensions"
          kicker="Disagreement"
          items={content.disagreement?.bullets}
          variant="disagree"
        />
        <CompactPanel
          title="Latest shifts"
          kicker="What changed"
          items={content.whatChanged?.bullets}
          variant="change"
        />
      </div>

      {content.regime?.bullets?.length ? (
        <section className="macro-dash__regime">
          <p className="macro-dash__section-kicker">Regime tape</p>
          <BulletList items={content.regime.bullets} />
        </section>
      ) : null}

      {content.desks.length ? (
        <section className="macro-dash__desks">
          <div className="macro-dash__section-head">
            <div>
              <p className="macro-dash__section-kicker">Source desks</p>
              <h2>What each source is saying</h2>
            </div>
          </div>
          <div className="macro-dash__desk-grid">
            {content.desks.map((desk) => (
              <DeskCard key={desk.name} desk={desk} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
