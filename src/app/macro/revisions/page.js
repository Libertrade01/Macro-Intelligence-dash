import { listMacroHouseViewRevisions, listMacroRegimeChanges } from "../../../lib/briefings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Revisions — Macro Signal Room",
};

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function RevisionCard({ revision }) {
  const call = revision.payload?.call || {};
  const regime = revision.payload?.regime || {};
  return (
    <article className="signal-room__revision-card">
      <header>
        <span>V{revision.version}</span>
        <time>{formatDate(revision.effective_at)}</time>
      </header>
      <h2>{call.headline || revision.change_summary || "House view revision"}</h2>
      {call.thesis ? <p>{call.thesis}</p> : null}
      {revision.change_summary ? <p><strong>Change:</strong> {revision.change_summary}</p> : null}
      {regime.label ? <p><strong>Regime:</strong> {regime.label}</p> : null}
      {revision.trigger_slugs?.length ? <small>Triggers: {revision.trigger_slugs.join(", ")}</small> : null}
    </article>
  );
}

function RegimeCard({ change }) {
  return (
    <article className="signal-room__revision-card">
      <header>
        <span>Regime</span>
        <time>{formatDate(change.effective_at)}</time>
      </header>
      <h2>{change.from_regime || "Start"} → {change.to_regime}</h2>
      <p>{change.reason}</p>
      {change.trigger_slugs?.length ? <small>Triggers: {change.trigger_slugs.join(", ")}</small> : null}
    </article>
  );
}

export default async function MacroRevisionsPage() {
  const [revisions, regimeChanges] = await Promise.all([
    listMacroHouseViewRevisions({ limit: 40 }),
    listMacroRegimeChanges({ limit: 40 }),
  ]);

  return (
    <div className="signals-page">
      <header className="signals-page__header">
        <div>
          <p className="eyebrow">Macro Signal Room</p>
          <h1 className="page-title">House-view revisions</h1>
          <p className="signals-page__intro">Meaningful changes in the house macro view, not an episode activity log.</p>
        </div>
        <div className="signals-page__count">
          <span>History</span>
          <strong>{revisions.length}</strong>
          <small>revisions</small>
        </div>
      </header>

      <section className="signal-room__revision-list">
        {revisions.length ? revisions.map((revision) => <RevisionCard key={revision.id || revision.version} revision={revision} />) : <p>No V2 revisions stored yet.</p>}
      </section>

      <section className="signal-room__revision-list">
        <h2>Regime changes</h2>
        {regimeChanges.length ? regimeChanges.map((change) => <RegimeCard key={change.id || `${change.effective_at}-${change.to_regime}`} change={change} />) : <p>No regime changes stored yet.</p>}
      </section>
    </div>
  );
}
