import {
  BRIEFING_TYPES,
  MACRO_LIVING_SLUG,
  VALID_BRIEFING_TYPES,
} from "./briefing-types";

const VALID_STATUSES = new Set(["draft", "ready", "needs_review", "published"]);
const VALID_SIGNALS = new Set([
  "Launches",
  "Research",
  "Infra",
  "Markets",
  "Policy",
  "Security",
  "Mixed",
]);

export function slugFromDate(date) {
  return String(date).slice(0, 10);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveIngestSlug(body) {
  if (body.slug && typeof body.slug === "string") {
    return body.slug.trim();
  }

  const type = body.type;

  if (type === BRIEFING_TYPES.AI) {
    return slugFromDate(body.date);
  }

  if (type === BRIEFING_TYPES.MACRO) {
    return MACRO_LIVING_SLUG;
  }

  if (type === BRIEFING_TYPES.NEWSLETTER) {
    return `${body.date}-friday-speedrun`;
  }

  if (type === BRIEFING_TYPES.PODCAST && body.show) {
    return `${body.date}-${slugify(body.show)}`;
  }

  return null;
}

export function validateIngestPayload(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Body must be a JSON object"] };
  }

  if (!body.type || !VALID_BRIEFING_TYPES.has(body.type)) {
    errors.push(
      `type must be one of: ${[...VALID_BRIEFING_TYPES].join(", ")}`
    );
  }

  if (!body.title || typeof body.title !== "string") {
    errors.push("title is required");
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push("date is required (YYYY-MM-DD)");
  }

  if (!body.content_markdown || typeof body.content_markdown !== "string") {
    errors.push("content_markdown is required");
  }

  const status = body.status || "ready";
  if (!VALID_STATUSES.has(status)) {
    errors.push(`status must be one of: ${[...VALID_STATUSES].join(", ")}`);
  }

  if (body.primary_signal && !VALID_SIGNALS.has(body.primary_signal)) {
    errors.push(`primary_signal must be one of: ${[...VALID_SIGNALS].join(", ")}`);
  }

  if (body.sources && !Array.isArray(body.sources)) {
    errors.push("sources must be an array of strings");
  }

  if (body.type === BRIEFING_TYPES.PODCAST && !body.show && !body.slug) {
    errors.push('podcast_summary requires "show" or "slug"');
  }

  const slug = resolveIngestSlug(body);
  if (!slug) {
    errors.push("slug could not be resolved — provide slug explicitly");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const sources = Array.isArray(body.sources)
    ? body.sources.map(String)
    : body.show
      ? [String(body.show)]
      : [];

  return {
    ok: true,
    data: {
      slug,
      type: body.type,
      title: body.title.trim(),
      date: body.date,
      status,
      primary_signal: body.primary_signal || null,
      source_count: typeof body.source_count === "number" ? body.source_count : null,
      sources,
      top_story: body.top_story
        ? String(body.top_story).trim()
        : body.episode
          ? String(body.episode).trim()
          : null,
      content_markdown: body.content_markdown.trim(),
    },
  };
}

export function verifyIngestAuth(request) {
  const secret = process.env.BRIEFING_INGEST_SECRET;
  if (!secret) {
    return { ok: false, error: "BRIEFING_INGEST_SECRET not configured" };
  }

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token || token !== secret) {
    return { ok: false, error: "Unauthorized" };
  }

  return { ok: true };
}
