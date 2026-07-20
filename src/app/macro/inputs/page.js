import MacroEpisodeList from "../../../components/MacroEpisodeList";
import SpeedrunList from "../../../components/SpeedrunList";
import { BRIEFING_TYPES } from "../../../lib/briefing-types";
import { listBriefingsByType } from "../../../lib/briefings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inputs — Macro Intelligence",
};

export default async function MacroInputsPage() {
  const [episodes, speedrun] = await Promise.all([
    listBriefingsByType(BRIEFING_TYPES.PODCAST, { limit: 120 }),
    listBriefingsByType(BRIEFING_TYPES.NEWSLETTER, { limit: 52 }),
  ]);

  return (
    <div className="studio-content inputs-page">
      <p className="eyebrow">Macro Intelligence</p>
      <h1 className="page-title" style={{ marginBottom: 28 }}>
        Inputs
      </h1>

      <MacroEpisodeList briefings={episodes} hrefPrefix="/macro/inputs/" />

      <SpeedrunList briefings={speedrun} hrefPrefix="/macro/inputs/" />
    </div>
  );
}
