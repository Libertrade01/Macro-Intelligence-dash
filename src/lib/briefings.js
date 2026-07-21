import { BRIEFING_TYPES, MACRO_LIVING_SLUG } from "./briefing-types";
import { createPublicClient, createServiceClient } from "./supabase";

const BRIEFING_COLUMNS =
  "id, slug, type, title, date, status, primary_signal, source_count, sources, top_story, content_markdown, content_json, prompt_version, evidence_slugs, created_at, updated_at, read_at";

const REVISION_COLUMNS =
  "id, version, effective_at, through_date, trigger_slugs, attached_input_slugs, material_change, change_summary, payload, metadata, created_at, updated_at";

const REGIME_CHANGE_COLUMNS =
  "id, from_regime, to_regime, effective_at, reason, trigger_slugs, evidence, created_at";

export async function listBriefings({ limit = 30, type = BRIEFING_TYPES.AI } = {}) {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .eq("type", type)
    .in("status", ["ready", "published"])
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listBriefings:", error.message);
    return [];
  }

  return data || [];
}

export async function listBriefingsByType(type, { limit = 30 } = {}) {
  return listBriefings({ limit, type });
}

export async function getBriefingBySlug(slug) {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getBriefingBySlug:", error.message);
    return null;
  }

  return data;
}

export async function getLatestBriefing() {
  const briefings = await listBriefings({ limit: 1 });
  return briefings[0] || null;
}

export async function getMacroBriefing() {
  return getBriefingBySlug(MACRO_LIVING_SLUG);
}

export async function getMacroSynthesisContext({ limit = 80 } = {}) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { data: inputs, error: inputsError } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .in("type", [BRIEFING_TYPES.PODCAST, BRIEFING_TYPES.NEWSLETTER])
    .in("status", ["ready", "published"])
    .order("date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (inputsError) {
    throw new Error(inputsError.message);
  }

  const { data: currentOverview, error: overviewError } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .eq("slug", MACRO_LIVING_SLUG)
    .maybeSingle();

  if (overviewError) {
    throw new Error(overviewError.message);
  }

  return {
    inputs: inputs || [],
    currentOverview,
    revisions: await listMacroHouseViewRevisions({ limit: 20 }),
    regimeChanges: await listMacroRegimeChanges({ limit: 20 }),
  };
}

export async function listMacroHouseViewRevisions({ limit = 30 } = {}) {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("macro_house_view_revisions")
    .select(REVISION_COLUMNS)
    .order("effective_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listMacroHouseViewRevisions:", error.message);
    return [];
  }

  return data || [];
}

export async function upsertMacroHouseViewRevision(record) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { data, error } = await supabase
    .from("macro_house_view_revisions")
    .upsert(record, { onConflict: "version" })
    .select(REVISION_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function listMacroRegimeChanges({ limit = 30 } = {}) {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("macro_regime_changes")
    .select(REGIME_CHANGE_COLUMNS)
    .order("effective_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listMacroRegimeChanges:", error.message);
    return [];
  }

  return data || [];
}

export async function insertMacroRegimeChange(record) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { data, error } = await supabase
    .from("macro_regime_changes")
    .insert(record)
    .select(REGIME_CHANGE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertBriefing(record) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { data, error } = await supabase
    .from("briefings")
    .upsert(record, { onConflict: "slug" })
    .select(BRIEFING_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteBriefingBySlug(slug) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await supabase.from("briefings").delete().eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setBriefingReadAt(slug, read) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await supabase
    .from("briefings")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }
}

export function parseBriefingSections(markdown) {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: "" };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    }
  }

  if (current) sections.push(current);

  return sections.map((section) => ({
    ...section,
    body: section.body.trim(),
    variant: sectionVariant(section.title),
  }));
}

function sectionVariant(title) {
  const normalized = title.toLowerCase();

  if (normalized.includes("30 seconds") || normalized === "tldr") {
    return "hero";
  }
  if (normalized.includes("pulse") || normalized.includes("top signal")) {
    return "pulse";
  }
  if (normalized.includes("x list")) {
    return "social";
  }
  if (normalized.includes("watchlist")) {
    return "watchlist";
  }
  if (
    normalized.includes("your take") ||
    normalized.includes("takeaway") ||
    normalized.includes("the lens") ||
    normalized.includes("mike's take")
  ) {
    return "take";
  }

  return "default";
}

export function parseStoryItems(body) {
  if (!body) return [];

  const chunks = body
    .split(/\n(?=- )/)
    .map((chunk) => chunk.replace(/^- /, "").trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const headline = chunk.match(
      /\*\*Headline:\*\*\s*(.+?)(?=\s*\*\*Why it matters:|\n\n|\n\*\*|$)/is
    )?.[1]?.trim();

    const why = chunk.match(
      /\*\*Why it matters:\*\*\s*(.+?)(?=\s*\*\*Source:|\n\n|\n\*\*|$)/is
    )?.[1]?.trim();

    const sourceRaw = chunk.match(/\*\*Source:\*\*\s*(.+)/is)?.[1]?.trim();
    const linkMatch = sourceRaw?.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const sourceText = linkMatch?.[1] || sourceRaw;
    const sourceUrl = linkMatch?.[2] || null;

    if (headline || why) {
      return { headline, why, sourceText, sourceUrl, raw: chunk };
    }

    return { headline: null, why: null, sourceText: null, sourceUrl: null, raw: chunk };
  });
}

export function hasStructuredItems(body) {
  return /\*\*Headline:\*\*/i.test(body || "");
}

export function hasSocialItems(body) {
  return /\*\*Author:\*\*/i.test(body || "") || /\*\*Post:\*\*/i.test(body || "");
}

export function parseSocialItems(body) {
  if (!body) return { items: [], readThrough: null };

  const readThrough =
    body.match(/\*\*Read-through:\*\*\s*(.+)/is)?.[1]?.trim() ||
    body.match(/Read-through:\s*(.+)/is)?.[1]?.trim() ||
    null;

  const listBody = body
    .replace(/\*\*Read-through:\*\*[\s\S]*/i, "")
    .replace(/Read-through:[\s\S]*/i, "")
    .trim();

  const chunks = listBody
    .split(/\n(?=- )/)
    .map((chunk) => chunk.replace(/^- /, "").trim())
    .filter(Boolean)
    .filter((chunk) => !/^(\*\*)?Read-through:/i.test(chunk));

  const items = chunks
    .map((chunk) => parseSocialChunk(chunk))
    .filter((item) => item && (item.author || item.post || item.why || item.raw));

  return { items, readThrough };
}

function parseSocialChunk(chunk) {
  let author = chunk.match(/\*\*Author:\*\*\s*(.+?)(?=\s*\*\*|$)/is)?.[1]?.trim();
  let post = chunk.match(
    /\*\*Post:\*\*\s*(.+?)(?=\s*\*\*Why it matters:|\s*\*\*URL:|\n\n|\n\*\*|$)/is
  )?.[1]?.trim();
  let why = chunk.match(
    /\*\*Why it matters:\*\*\s*(.+?)(?=\s*\*\*URL:|\n\n|\n\*\*|$)/is
  )?.[1]?.trim();
  let urlRaw = chunk.match(/\*\*URL:\*\*\s*(.+)/is)?.[1]?.trim();

  if (!author && !post) {
    author = chunk.match(/Author:\s*(.+?)\s+Post:/is)?.[1]?.trim();
    post = chunk.match(/Post:\s*(.+?)\s+Why it matters:/is)?.[1]?.trim();
    why = chunk.match(/Why it matters:\s*(.+?)(?:\s+URL:|$)/is)?.[1]?.trim();
    urlRaw = chunk.match(/URL:\s*(.+)/is)?.[1]?.trim();
  }

  const linkMatch = urlRaw?.match(/\[([^\]]+)\]\(([^)]+)\)/);
  const bareUrl = urlRaw?.match(/(https?:\/\/\S+)/)?.[1];
  const sourceText = linkMatch?.[1] || bareUrl || urlRaw?.trim() || null;
  const sourceUrl = linkMatch?.[2] || bareUrl || null;

  if (author || post || why) {
    return { author, post, why, sourceText, sourceUrl, raw: chunk };
  }

  if (chunk.length > 0) {
    return { author: null, post: null, why: null, sourceText: null, sourceUrl: null, raw: chunk };
  }

  return null;
}

export function formatBriefingDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatBriefingDateShort(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function estimateReadTime(markdown) {
  const words = (markdown || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
