import { NextResponse } from "next/server";
import { getMacroSynthesisContext } from "../../../../lib/briefings";
import { verifyIngestAuth } from "../../../../lib/ingest";
import { isSupabaseServiceConfigured } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

function sourceName(briefing) {
  if (briefing.sources?.length) return briefing.sources[0];
  if (briefing.type === "newsletter_summary") return "Friday Speedrun";
  return null;
}

function serializeBriefing(briefing) {
  if (!briefing) return null;

  return {
    slug: briefing.slug,
    type: briefing.type,
    title: briefing.title,
    date: briefing.date,
    status: briefing.status,
    source: sourceName(briefing),
    sources: briefing.sources || [],
    top_story: briefing.top_story,
    primary_signal: briefing.primary_signal,
    source_count: briefing.source_count,
    content_markdown: briefing.content_markdown,
    created_at: briefing.created_at,
    updated_at: briefing.updated_at,
  };
}

export async function GET(request) {
  const auth = verifyIngestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured on server" },
      { status: 503 }
    );
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 80;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 200)
    : 80;

  try {
    const { inputs, currentOverview } = await getMacroSynthesisContext({ limit });

    return NextResponse.json({
      ok: true,
      count: inputs.length,
      inputs: inputs.map(serializeBriefing),
      current_overview: serializeBriefing(currentOverview),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to read macro inputs" },
      { status: 500 }
    );
  }
}
