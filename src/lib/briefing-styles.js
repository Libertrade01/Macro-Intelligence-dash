/** Maps briefing `type` from Supabase to a reader style id. */
export const BRIEFING_STYLES = {
  ai_briefing: "broadsheet",
  macro_briefing: "desk-dashboard",
  podcast_summary: "macro-content",
  newsletter_summary: "macro-content",
};

export function getBriefingStyleId(type) {
  return BRIEFING_STYLES[type] ?? "default";
}
