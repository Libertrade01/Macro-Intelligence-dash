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
        p: ({ children: value }) => <>{value}</>,
        a: ({ href, children: value }) => <Link href={href || "#"}>{value}</Link>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function shorten(value, max = 180) {
  const clean = String(value || "").replace(/\*\*/g, "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function extractConfidence(baseCase) {
  const line = baseCase?.bullets?.find((item) => /^confidence:/i.test(item.replace(/\*\*/g, "")));
  return line?.replace(/\*\*/g, "").replace(/^confidence:\s*/i, "").trim() || "Developing";
}

function findTheme(items, patterns, fallbackIndex) {
  const match = items.find((item) => patterns.some((pattern) => pattern.test(item.label || "")));
  return match || items[fallbackIndex] || null;
}

function ChangeItem({ label, text }) {
  if (!text) return null;
  return (
    <div className="signal-room__change-item">
      <span>{label}</span>
      <p><MarkdownText>{shorten(text, 210)}</MarkdownText></p>
    </div>
  );
}

function NextTests({ items }) {
  return (
    <aside className="signal-room__tests">
      <p className="signal-room__kicker">Next tests</p>
      <ol>
        {(items || []).slice(0, 4).map((item, index) => (
          <li key={`${item}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p><MarkdownText>{shorten(item, 150)}</MarkdownText></p>
          </li>
        ))}
      </ol>
      {!items?.length ? <p className="signal-room__empty">No catalysts captured yet.</p> : null}
    </aside>
  );
}

function RegimeTape({ themes, regime }) {
  const themeItems = themes?.items || [];
  const items = themeItems.length
    ? themeItems.slice(0, 5).map((item) => ({ label: item.label || "Signal", text: item.text }))
    : (regime?.bullets || []).slice(0, 5).map((item, index) => ({ label: `Regime ${index + 1}`, text: item }));

  if (!items.length) return null;

  return (
    <section className="signal-room__regime" aria-label="Current regime tape">
      <p className="signal-room__kicker">Regime tape</p>
      <div className="signal-room__regime-cells">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <span>{item.label}</span>
            <strong>{shorten(item.text, 72)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function DriverChain({ themes }) {
  const items = themes?.items || [];
  const drivers = [
    { label: "Growth", item: findTheme(items, [/growth/i], 0) },
    { label: "Policy", item: findTheme(items, [/rates?|policy|fed/i], 1) },
    { label: "Liquidity", item: findTheme(items, [/liquidity|credit/i], 2) },
    { label: "Risk", item: findTheme(items, [/risk|equity|asset/i], 3) },
  ];

  return (
    <section className="signal-room__drivers">
      <header className="signal-room__section-head">
        <div><p className="signal-room__kicker">Causal picture</p><h2>What is driving the view</h2></div>
        <p>Read left to right</p>
      </header>
      <div className="signal-room__chain">
        {drivers.map((driver, index) => (
          <div className="signal-room__chain-step" key={driver.label}>
            <article>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{driver.label}</h3>
              <p>{driver.item ? shorten(driver.item.text, 135) : "Awaiting a clear cross-source signal."}</p>
            </article>
            {index < drivers.length - 1 ? <i aria-hidden="true">→</i> : null}
          </div>
        ))}
      </div>
      <p className="signal-room__chain-caption">
        The house view is a chain of claims. Each link can be traced back to the source desks below.
      </p>
    </section>
  );
}

function SourceAlignment({ desks, disagreement }) {
  if (!desks.length) return null;
  const dissent = (disagreement?.bullets || []).join(" ").toLowerCase();

  return (
    <section className="signal-room__alignment">
      <header className="signal-room__section-head">
        <div><p className="signal-room__kicker">Source alignment</p><h2>Where the desks stand</h2></div>
        <p><span className="alignment-dot" /> Broad alignment <span className="alignment-dot alignment-dot--mixed" /> Active tension</p>
      </header>
      <div className="signal-room__source-table">
        {desks.map((desk) => {
          const hasDissent = dissent.includes(desk.name.toLowerCase());
          return (
            <article key={desk.name}>
              <div><strong>{desk.name}</strong><span>{desk.regime || "Current stance"}</span></div>
              <span className={`signal-room__alignment-state${hasDissent ? " signal-room__alignment-state--mixed" : ""}`}>
                <i aria-hidden="true" />{hasDissent ? "Active tension" : "Broadly aligned"}
              </span>
              {desk.latest ? <Link href={desk.latest.href}>Latest evidence ↗</Link> : <span />}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function MacroBriefingReader({ briefing }) {
  const content = prepareMacroBriefing(briefing);
  const updatedLabel = content.meta.updatedAt
    ? new Date(content.meta.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : formatBriefingDate(content.meta.date);
  const call = content.baseCase?.paragraphs?.[0]
    || content.snapshot?.bullets?.[0]
    || content.regime?.bullets?.[0]
    || "The house view is still forming as new signals arrive.";
  const callSupport = content.baseCase?.bullets?.find((item) => !/^confidence:|^bias:|^invalidation:/i.test(item.replace(/\*\*/g, "")))
    || content.snapshot?.bullets?.[1];
  const changed = content.whatChanged?.bullets || [];
  const held = content.agreement?.bullets || [];

  return (
    <div className="signal-room">
      <section className="signal-room__command">
        <article className="signal-room__call">
          <p className="signal-room__kicker">The call</p>
          <h1><MarkdownText>{shorten(call, 245)}</MarkdownText></h1>
          {callSupport ? <p className="signal-room__call-support"><MarkdownText>{shorten(callSupport, 220)}</MarkdownText></p> : null}
          <footer>
            <span>Primary view <strong>House view</strong></span>
            <span>Last updated <strong>{updatedLabel}</strong></span>
            <span>Confidence <strong>{extractConfidence(content.baseCase)}</strong></span>
          </footer>
        </article>

        <aside className="signal-room__revision">
          <div><p className="signal-room__kicker">Since last update</p><time>{updatedLabel}</time></div>
          <ChangeItem label="What changed" text={changed[0]} />
          <ChangeItem label="What held" text={held[0]} />
          <ChangeItem label="Why it matters" text={changed[1] || content.snapshot?.bullets?.[2]} />
          {!changed.length && !held.length ? <p className="signal-room__empty">Revision notes will appear after the next synthesis.</p> : null}
        </aside>

        <NextTests items={content.watchlist?.bullets} />
      </section>

      <RegimeTape themes={content.themes} regime={content.regime} />

      <div className="signal-room__analysis-grid">
        <DriverChain themes={content.themes} />
        <SourceAlignment desks={content.desks} disagreement={content.disagreement} />
      </div>

      <footer className="signal-room__engine">
        <strong>Synthesis engine</strong>
        <span>Continuously maintaining the house view from {content.meta.sourceCount || content.desks.length} inputs</span>
        <Link href="/macro/inputs">Open all signals →</Link>
      </footer>
    </div>
  );
}
