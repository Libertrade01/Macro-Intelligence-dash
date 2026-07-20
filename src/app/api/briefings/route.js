import { NextResponse } from "next/server";
import { upsertBriefing } from "../../../lib/briefings";
import { validateIngestPayload, verifyIngestAuth } from "../../../lib/ingest";
import { isSupabaseConfigured } from "../../../lib/supabase";

export async function POST(request) {
  const auth = verifyIngestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured on server" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateIngestPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    const briefing = await upsertBriefing(validation.data);
    return NextResponse.json({ ok: true, briefing }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save briefing" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "macro-intelligence-dash",
    ingest: "POST /api/briefings with Bearer token",
    macro_inputs: "GET /api/macro/inputs with Bearer token",
    types: [
      "macro_briefing",
      "podcast_summary",
      "newsletter_summary",
    ],
    specs: {
      macro_briefing: "MACRO-BRIEFING-SPEC.md",
      podcast_summary: "PODCAST-SUMMARY-SPEC.md",
      newsletter_summary: "NEWSLETTER-SUMMARY-SPEC.md",
    },
  });
}
