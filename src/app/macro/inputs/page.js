import MacroEpisodeList from "../../../components/MacroEpisodeList";
import { BRIEFING_TYPES } from "../../../lib/briefing-types";
import { listBriefingsByType } from "../../../lib/briefings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Signals — Macro Signal Room",
};

export default async function MacroInputsPage() {
  const [episodes, speedrun] = await Promise.all([
    listBriefingsByType(BRIEFING_TYPES.PODCAST, { limit: 120 }),
    listBriefingsByType(BRIEFING_TYPES.NEWSLETTER, { limit: 52 }),
  ]);

  return (
    <div className="signals-page">
      <header className="signals-page__header">
        <div>
          <p className="eyebrow">Intelligence intake</p>
          <h1 className="page-title">Signals</h1>
          <p className="signals-page__intro">
            New episodes, extracted arguments, and the evidence feeding the house view.
          </p>
        </div>
        <div className="signals-page__count">
          <span>Current library</span>
          <strong>{episodes.length + speedrun.length}</strong>
          <small>signals</small>
        </div>
      </header>

      <MacroEpisodeList
        briefings={episodes}
        newsletters={speedrun}
        hrefPrefix="/macro/inputs/"
      />
    </div>
  );
}
