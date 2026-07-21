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
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}...`;
}

function evidenceHref(slug) {
  return `/macro/inputs/${slug}`;
}

function EvidenceList({ evidence }) {
  if (!evidence?.length) return null;
  return (
    <ul className="signal-room__evidence">
      {evidence.slice(0, 4).map((item) => (
        <li key={`${item.slug}-${item.claim}`}>
          <Link href={evidenceHref(item.slug)}>{item.source}</Link>
          <span>{item.claim}</span>
        </li>
      ))}
    </ul>
  );
}

function EvidenceDisclosure({ evidence, label = "Evidence" }) {
  if (!evidence?.length) return null;
  return (
    <details className="signal-room__disclosure">
      <summary>{label}<span>{evidence.length}</span></summary>
      <EvidenceList evidence={evidence} />
    </details>
  );
}

function ChangeItem({ label, text }) {
  if (!text) return null;
  return (
    <div className="signal-room__change-item">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function V2NextTests({ tests }) {
  return (
    <aside className="signal-room__tests">
      <div className="signal-room__panel-head">
        <p className="signal-room__kicker">Next tests</p>
        <span>{tests?.length || 0} active</span>
      </div>
      <ol>
        {(tests || []).slice(0, 4).map((test, index) => (
          <li key={`${test.title}-${index}`}>
            <span className="signal-room__test-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="signal-room__test-copy">
              <div><h3>{test.title}</h3><span>{test.window}</span></div>
              <p>{test.description}</p>
              <details className="signal-room__test-detail">
                <summary>Test conditions</summary>
                <dl>
                  <div><dt>Confirms</dt><dd>{test.confirmation}</dd></div>
                  <div><dt>Breaks</dt><dd>{test.invalidation}</dd></div>
                </dl>
                <EvidenceList evidence={test.evidence} />
              </details>
            </div>
          </li>
        ))}
      </ol>
      {!tests?.length ? <p className="signal-room__empty">Awaiting structured tests.</p> : null}
    </aside>
  );
}

function DirectionMark({ direction }) {
  const value = direction || "flat";
  return <span className={`signal-room__direction signal-room__direction--${value}`}>{value.replace("_", " ")}</span>;
}

function AlignmentMark({ value }) {
  const normalized = value || "no_view";
  const labels = { aligned: "Aligned", mixed: "Mixed", not_aligned: "Not aligned", no_view: "No view" };
  const glyphs = { aligned: "+", mixed: "~", not_aligned: "x", no_view: "-" };
  return (
    <span className={`signal-room__matrix-mark signal-room__matrix-mark--${normalized}`} aria-label={labels[normalized]}>
      {glyphs[normalized]}
    </span>
  );
}

function V2DriverChain({ drivers }) {
  return (
    <section className="signal-room__drivers">
      <header className="signal-room__section-head">
        <div><p className="signal-room__kicker">Causal picture</p><h2>What is driving the room view</h2></div>
        <p>Primary transmission / left to right</p>
      </header>
      <div className="signal-room__chain">
        {drivers.map((driver, index) => (
          <div className="signal-room__chain-step" key={driver.id || driver.name}>
            <article>
              <header>
                <span className="signal-room__driver-index">{String(index + 1).padStart(2, "0")}</span>
                <DirectionMark direction={driver.direction} />
              </header>
              <h3>{driver.name}</h3>
              <strong className="signal-room__driver-signal">{driver.signal || driver.state}</strong>
              <p>{driver.summary}</p>
              {index < drivers.length - 1 ? (
                <div className="signal-room__transmission">
                  <span>Transmits to {drivers[index + 1]?.name}</span>
                  <p>{driver.transmission || driver.causes_next}</p>
                </div>
              ) : null}
              <EvidenceDisclosure evidence={driver.evidence} />
            </article>
            {index < drivers.length - 1 ? <i aria-hidden="true">-&gt;</i> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function V2SourceMatrix({ sources, drivers }) {
  return (
    <section className="signal-room__alignment">
      <header className="signal-room__section-head">
        <div><p className="signal-room__kicker">Source alignment</p><h2>Where the desks stand</h2></div>
        <div className="signal-room__matrix-legend"><span>+ Aligned</span><span>~ Mixed</span><span>- No view</span></div>
      </header>
      <div className="signal-room__matrix-wrap">
        <div className="signal-room__matrix" style={{ "--driver-count": drivers.length }} role="table" aria-label="Source alignment by causal driver">
          <div className="signal-room__matrix-header" role="row">
            <span role="columnheader">Desk</span>
            {drivers.map((driver) => <span role="columnheader" key={driver.id}>{driver.name}</span>)}
            <span role="columnheader">Trend</span>
            <span role="columnheader">Evidence</span>
          </div>
          {sources.map((source) => (
            <div className="signal-room__matrix-row" role="row" key={source.source}>
              <div className="signal-room__matrix-source" role="rowheader"><strong>{source.source}</strong><span>{source.stance}</span></div>
              {drivers.map((driver) => (
                <div className="signal-room__matrix-cell" role="cell" key={driver.id}>
                  <AlignmentMark value={source.positions?.[driver.id]} />
                </div>
              ))}
              <div className="signal-room__matrix-trend" role="cell"><i aria-hidden="true" />{source.trend || "unchanged"}</div>
              <div className="signal-room__matrix-link" role="cell">
                {source.latest_slug ? <Link href={evidenceHref(source.latest_slug)}>Open +</Link> : "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function V2MacroBriefingReader({ content }) {
  const updatedLabel = content.meta.updatedAt
    ? new Date(content.meta.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : formatBriefingDate(content.meta.date);
  const roomView = content.roomView;
  const regimeDefinition = content.regime.definition || content.regime.description;
  const sourceCount = content.meta.sourceCount || content.sourceAlignment.length;
  const inputCount = content.meta.inputCount || 0;

  return (
    <div className="signal-room">
      <section className="signal-room__command">
        <article className="signal-room__call">
          <div className="signal-room__panel-head"><p className="signal-room__kicker">The call</p><span>{roomView.horizon || "Current horizon"}</span></div>
          <h1>{roomView.headline || content.meta.title}</h1>
          <p className="signal-room__call-support">{roomView.thesis}</p>
          <footer>
            <span>Primary view <strong>{roomView.primary_view || "Room view"}</strong></span>
            <span>Last updated <strong>{updatedLabel}</strong></span>
            <span>Confidence <strong>{roomView.confidence || "unknown"}</strong></span>
          </footer>
        </article>

        <aside className="signal-room__revision">
          <div className="signal-room__panel-head"><p className="signal-room__kicker">Since last update</p><time>{updatedLabel}</time></div>
          <ChangeItem label="What changed" text={content.revision.changed} />
          <ChangeItem label="What held" text={content.revision.held || content.revision.unchanged} />
          <ChangeItem label="Why it matters" text={content.revision.impact} />
          <EvidenceDisclosure evidence={content.revision.evidence} label="Supporting sources" />
        </aside>

        <V2NextTests tests={content.nextTests} />
      </section>

      <section className="signal-room__regime signal-room__regime--v2" aria-label="Current regime">
        <div className="signal-room__regime-title"><p className="signal-room__kicker">Current regime</p><span>{content.regime.since ? `Since ${content.regime.since}` : "Live"}</span></div>
        <div className="signal-room__regime-cells">
          <div><span>Regime</span><strong>{content.regime.label || "Unknown"}</strong></div>
          <div><span>Definition</span><strong>{regimeDefinition}</strong></div>
          <div><span>Bias</span><strong>{roomView.bias || content.regime.bias}</strong></div>
          <div><span>Invalidation</span><strong>{roomView.invalidation || content.regime.invalidation}</strong></div>
        </div>
      </section>

      <V2DriverChain drivers={content.drivers} />
      <V2SourceMatrix sources={content.sourceAlignment} drivers={content.drivers} />

      <footer className="signal-room__engine">
        <strong>Synthesis engine V2</strong>
        <span>{inputCount} inputs / {sourceCount} sources / Current through {content.payload?.through_date || content.meta.date}</span>
        <Link href="/macro/revisions">Open revisions -&gt;</Link>
      </footer>
    </div>
  );
}

function extractConfidence(baseCase) {
  const line = baseCase?.bullets?.find((item) => /^confidence:/i.test(item.replace(/\*\*/g, "")));
  return line?.replace(/\*\*/g, "").replace(/^confidence:\s*/i, "").trim() || "Developing";
}

function LegacyNextTests({ items }) {
  return (
    <aside className="signal-room__tests">
      <p className="signal-room__kicker">Next tests</p>
      <ol>{(items || []).slice(0, 4).map((item, index) => <li key={`${item}-${index}`}><span className="signal-room__test-index">{String(index + 1).padStart(2, "0")}</span><p><MarkdownText>{shorten(item, 150)}</MarkdownText></p></li>)}</ol>
    </aside>
  );
}

function LegacyMacroBriefingReader({ content }) {
  const updatedLabel = content.meta.updatedAt
    ? new Date(content.meta.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : formatBriefingDate(content.meta.date);
  const call = content.baseCase?.paragraphs?.[0] || content.snapshot?.bullets?.[0] || content.regime?.bullets?.[0] || "The room view is still forming as new signals arrive.";
  const support = content.baseCase?.bullets?.[0] || content.snapshot?.bullets?.[1];
  const themes = content.themes?.items || [];

  return (
    <div className="signal-room">
      <section className="signal-room__command">
        <article className="signal-room__call"><p className="signal-room__kicker">The call</p><h1><MarkdownText>{shorten(call, 245)}</MarkdownText></h1>{support ? <p className="signal-room__call-support"><MarkdownText>{support}</MarkdownText></p> : null}<footer><span>Primary view <strong>Room view</strong></span><span>Last updated <strong>{updatedLabel}</strong></span><span>Confidence <strong>{extractConfidence(content.baseCase)}</strong></span></footer></article>
        <aside className="signal-room__revision"><p className="signal-room__kicker">Since last update</p><ChangeItem label="What changed" text={content.whatChanged?.bullets?.[0]} /><ChangeItem label="What held" text={content.agreement?.bullets?.[0]} /></aside>
        <LegacyNextTests items={content.watchlist?.bullets} />
      </section>
      <V2DriverChain drivers={themes.slice(0, 4).map((item, index) => ({ id: item.label || `driver-${index}`, name: item.label || "Driver", summary: item.text, signal: "Legacy signal", direction: "flat", evidence: [] }))} />
      <footer className="signal-room__engine"><strong>Synthesis engine</strong><span>Legacy Room View format</span><Link href="/macro/inputs">Open signals -&gt;</Link></footer>
    </div>
  );
}

export default function MacroBriefingReader({ briefing }) {
  const content = prepareMacroBriefing(briefing);
  return content.v2 ? <V2MacroBriefingReader content={content} /> : <LegacyMacroBriefingReader content={content} />;
}
