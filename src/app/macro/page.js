import BriefingReader from "../../components/BriefingReader";
import { getMacroBriefing } from "../../lib/briefings";
import { isSupabaseConfigured } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview — Macro Intelligence",
};

export default async function MacroOverviewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="studio-content">
        <div className="empty-state">
          <p className="eyebrow">Setup</p>
          <h2>Connect Supabase</h2>
          <p>Add your Supabase keys to read macro briefings.</p>
        </div>
      </div>
    );
  }

  const briefing = await getMacroBriefing();

  if (!briefing) {
    return (
      <div className="macro-dash">
        <div className="empty-state">
          <p className="eyebrow">Macro Mind</p>
          <h2>Living macro view not set up yet</h2>
          <p>
            Hermes will POST a <code>macro_briefing</code> after podcast or
            newsletter ingest. See <code>MACRO-BRIEFING-SPEC.md</code>.
          </p>
        </div>
      </div>
    );
  }

  return <BriefingReader briefing={briefing} />;
}
