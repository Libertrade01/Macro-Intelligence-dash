import { NextResponse } from "next/server";
import {
  insertMacroRegimeChange,
  listMacroRegimeChanges,
} from "../../../../lib/briefings";
import { verifyIngestAuth } from "../../../../lib/ingest";
import { isSupabaseServiceConfigured } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

function intParam(request, name, fallback) {
  const value = Number(new URL(request.url).searchParams.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function validateRegimeChange(body) {
  const errors = [];
  if (!body || typeof body !== "object") return { ok: false, errors: ["Body must be an object"] };
  if (!body.to_regime || typeof body.to_regime !== "string") errors.push("to_regime is required");
  if (!body.effective_at || Number.isNaN(Date.parse(body.effective_at))) errors.push("effective_at must be an ISO timestamp");
  if (!body.reason || typeof body.reason !== "string") errors.push("reason is required");
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      from_regime: body.from_regime ? String(body.from_regime) : null,
      to_regime: String(body.to_regime),
      effective_at: body.effective_at,
      reason: String(body.reason),
      trigger_slugs: Array.isArray(body.trigger_slugs) ? body.trigger_slugs.map(String) : [],
      evidence: Array.isArray(body.evidence) ? body.evidence : [],
    },
  };
}

export async function GET(request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase not configured on server" }, { status: 503 });
  }
  const regime_changes = await listMacroRegimeChanges({ limit: intParam(request, "limit", 30) });
  return NextResponse.json({ ok: true, count: regime_changes.length, regime_changes }, { status: 200 });
}

export async function POST(request) {
  const auth = verifyIngestAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase not configured on server" }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const validation = validateRegimeChange(body);
  if (!validation.ok) return NextResponse.json({ errors: validation.errors }, { status: 400 });
  try {
    const regime_change = await insertMacroRegimeChange(validation.data);
    return NextResponse.json({ ok: true, regime_change }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to save regime change" }, { status: 500 });
  }
}
