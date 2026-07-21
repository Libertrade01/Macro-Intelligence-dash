import { NextResponse } from "next/server";
import {
  listMacroHouseViewRevisions,
  upsertMacroHouseViewRevision,
} from "../../../../lib/briefings";
import { verifyIngestAuth } from "../../../../lib/ingest";
import { isSupabaseServiceConfigured } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

function intParam(request, name, fallback) {
  const value = Number(new URL(request.url).searchParams.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function validateRevision(body) {
  const errors = [];
  if (!body || typeof body !== "object") return { ok: false, errors: ["Body must be an object"] };
  if (!Number.isInteger(body.version) || body.version < 1) errors.push("version must be a positive integer");
  if (!body.effective_at || Number.isNaN(Date.parse(body.effective_at))) errors.push("effective_at must be an ISO timestamp");
  if (!body.through_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.through_date)) errors.push("through_date must be YYYY-MM-DD");
  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) errors.push("payload must be an object");
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      version: body.version,
      effective_at: body.effective_at,
      through_date: body.through_date,
      trigger_slugs: Array.isArray(body.trigger_slugs) ? body.trigger_slugs.map(String) : [],
      attached_input_slugs: Array.isArray(body.attached_input_slugs) ? body.attached_input_slugs.map(String) : [],
      material_change: body.material_change !== false,
      change_summary: body.change_summary ? String(body.change_summary) : null,
      payload: body.payload,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
    },
  };
}

export async function GET(request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase not configured on server" }, { status: 503 });
  }
  const revisions = await listMacroHouseViewRevisions({ limit: intParam(request, "limit", 30) });
  return NextResponse.json({ ok: true, count: revisions.length, revisions }, { status: 200 });
}

export async function POST(request) {
  const auth = verifyIngestAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase not configured on server" }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const validation = validateRevision(body);
  if (!validation.ok) return NextResponse.json({ errors: validation.errors }, { status: 400 });
  try {
    const revision = await upsertMacroHouseViewRevision(validation.data);
    return NextResponse.json({ ok: true, revision }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to save revision" }, { status: 500 });
  }
}
