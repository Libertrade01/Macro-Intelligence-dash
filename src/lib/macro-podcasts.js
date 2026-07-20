/** Display order for macro podcast filters and grouping. */
export const MACRO_PODCAST_SHOWS = [
  "1000x Network",
  "Forward Guidance",
  "Capital Flows Research",
];

const SLUG_SHOW_PATTERNS = [
  { pattern: /1000x/i, show: "1000x Network" },
  { pattern: /forward-guidance|forwardguidance/i, show: "Forward Guidance" },
  { pattern: /capital-flows|capitalflows/i, show: "Capital Flows Research" },
];

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function canonicalShow(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || isUrl(trimmed)) return null;

  const exact = MACRO_PODCAST_SHOWS.find(
    (show) => show.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  if (/1000x/i.test(trimmed)) return "1000x Network";
  if (/forward guidance/i.test(trimmed)) return "Forward Guidance";
  if (/capital flows/i.test(trimmed)) return "Capital Flows Research";

  return trimmed;
}

function showFromSlug(slug) {
  for (const { pattern, show } of SLUG_SHOW_PATTERNS) {
    if (pattern.test(slug)) return show;
  }
  return null;
}

function showFromTitle(title) {
  if (/1000x/i.test(title)) return "1000x Network";
  if (/forward guidance/i.test(title)) return "Forward Guidance";
  if (/capital flows/i.test(title)) return "Capital Flows Research";

  for (const show of MACRO_PODCAST_SHOWS) {
    if (title.toLowerCase().includes(show.toLowerCase())) return show;
  }

  return null;
}

export function podcastShowName(briefing) {
  const fromSource = canonicalShow(briefing.sources?.[0]);
  if (fromSource && !isUrl(fromSource)) {
    const known = MACRO_PODCAST_SHOWS.find(
      (show) => show.toLowerCase() === fromSource.toLowerCase()
    );
    if (known) return known;
  }

  const fromSlug = showFromSlug(briefing.slug || "");
  if (fromSlug) return fromSlug;

  const fromTitle = showFromTitle(briefing.title || "");
  if (fromTitle) return fromTitle;

  if (fromSource && !isUrl(fromSource)) return fromSource;

  return "Other";
}

export function podcastFilterOptions(briefings) {
  const present = new Set(briefings.map(podcastShowName));
  const filters = MACRO_PODCAST_SHOWS.filter((show) => present.has(show));
  if (present.has("Other")) filters.push("Other");
  return filters;
}

export function groupEpisodesByShow(briefings) {
  const groups = new Map();

  for (const briefing of briefings) {
    const show = podcastShowName(briefing);
    if (!groups.has(show)) groups.set(show, []);
    groups.get(show).push(briefing);
  }

  const ordered = [];
  for (const show of MACRO_PODCAST_SHOWS) {
    if (groups.has(show)) {
      ordered.push([show, groups.get(show)]);
      groups.delete(show);
    }
  }

  if (groups.has("Other")) {
    ordered.push(["Other", groups.get("Other")]);
    groups.delete("Other");
  }

  const rest = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  return [...ordered, ...rest];
}

export function isPreviewText(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return !/^https?:\/\//i.test(trimmed);
}

export function episodeDisplayTitle(briefing) {
  let title = briefing.title?.trim() || "Untitled episode";
  const show = podcastShowName(briefing);

  if (show !== "Other") {
    title = title
      .replace(new RegExp(`^${escapeRegExp(show)}\\s*[:—–-]\\s*`, "i"), "")
      .replace(new RegExp(`^\\[${escapeRegExp(show)}\\]\\s*`, "i"), "");
  }

  title = title.replace(/^\[.*?\]\s*/, "").trim();

  if (isUrl(title)) {
    return briefing.top_story && isPreviewText(briefing.top_story)
      ? briefing.top_story
      : "Untitled episode";
  }

  return title || "Untitled episode";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
