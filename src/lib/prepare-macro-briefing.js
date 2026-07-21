import { parseBriefingSections } from "./briefings";

function parseBullets(body) {
  if (!body) return [];

  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^\*\*Regime:\*\*/i.test(line) && !/^Regime:/i.test(line))
    .filter((line) => !/^\*\*Latest:\*\*/i.test(line) && !/^Latest:/i.test(line));
}

function stripKnownRows(body) {
  return String(body || "")
    .split("\n")
    .filter((line) => !/^\s*(\*\*)?Regime:/i.test(line))
    .filter((line) => !/^\s*(\*\*)?Latest:/i.test(line))
    .join("\n")
    .trim();
}

function parseParagraphs(body) {
  return stripKnownRows(body)
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => !/^[-*]\s+/m.test(chunk));
}

function parseLabeledBullets(body) {
  return parseBullets(body).map((item) => {
    const markdownLabel = item.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
    if (markdownLabel) {
      return {
        label: markdownLabel[1].trim(),
        text: markdownLabel[2].trim(),
        raw: item,
      };
    }

    const plainLabel = item.match(/^([^:]{2,32}):\s+(.+)$/);
    if (plainLabel) {
      return {
        label: plainLabel[1].trim(),
        text: plainLabel[2].trim(),
        raw: item,
      };
    }

    return { label: null, text: item, raw: item };
  });
}

function extractRegime(body) {
  const match =
    body?.match(/\*\*Regime:\*\*\s*(.+)/i) || body?.match(/^Regime:\s*(.+)/im);
  return match?.[1]?.trim() || null;
}

function extractLatestLink(body) {
  const match =
    body?.match(/\*\*Latest:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/i) ||
    body?.match(/Latest:\s*\[([^\]]+)\]\(([^)]+)\)/i);

  if (!match) return null;

  return { label: match[1].trim(), href: match[2].trim() };
}

function isDeskSection(title) {
  const normalized = title.toLowerCase();
  return (
    normalized.startsWith("desk -") ||
    normalized.startsWith("desk ·") ||
    normalized.startsWith("desk Â·")
  );
}

function deskName(title) {
  return title.replace(/^desk\s*(?:-|·|Â·)\s*/i, "").trim();
}

function sectionPayload(section) {
  if (!section) return null;

  return {
    title: section.title,
    body: section.body,
    bullets: parseBullets(section.body),
    paragraphs: parseParagraphs(section.body),
    items: parseLabeledBullets(section.body),
  };
}

function collectEvidenceSlugs(payload) {
  const slugs = new Set();
  for (const item of payload?.revision?.evidence || []) if (item?.slug) slugs.add(item.slug);
  for (const driver of payload?.drivers || []) {
    for (const item of driver?.evidence || []) if (item?.slug) slugs.add(item.slug);
  }
  for (const test of payload?.next_tests || []) {
    for (const item of test?.evidence || []) if (item?.slug) slugs.add(item.slug);
  }
  return [...slugs];
}

function prepareV2MacroBriefing(briefing) {
  const payload = briefing.content_json;
  return {
    v2: true,
    payload,
    evidenceSlugs: collectEvidenceSlugs(payload),
    meta: {
      title: briefing.title,
      date: briefing.date,
      updatedAt: briefing.updated_at,
      sourceCount: payload?.input_count || briefing.source_count,
      sources: briefing.sources || [],
    },
    call: payload?.call || {},
    revision: payload?.revision || {},
    regime: payload?.regime || {},
    drivers: payload?.drivers || [],
    nextTests: payload?.next_tests || [],
    sourceAlignment: payload?.source_alignment || [],
  };
}

export function prepareMacroBriefing(briefing) {
  if (briefing.content_json?.schema_version === 2) {
    return prepareV2MacroBriefing(briefing);
  }

  const sections = parseBriefingSections(briefing.content_markdown);
  const byTitle = (name) =>
    sections.find((section) => section.title.toLowerCase() === name.toLowerCase());

  const desks = sections
    .filter((section) => isDeskSection(section.title))
    .map((section) => ({
      name: deskName(section.title),
      regime: extractRegime(section.body),
      bullets: parseBullets(section.body),
      latest: extractLatestLink(section.body),
      body: section.body,
    }));

  return {
    meta: {
      title: briefing.title,
      date: briefing.date,
      updatedAt: briefing.updated_at,
      sourceCount: briefing.source_count || desks.length,
      sources: briefing.sources || [],
    },
    snapshot: sectionPayload(byTitle("Snapshot")),
    baseCase: sectionPayload(byTitle("Base Case")),
    themes: sectionPayload(byTitle("Themes")),
    watchlist: sectionPayload(byTitle("Watchlist")),
    whatChanged: sectionPayload(byTitle("What Changed")),
    agreement: sectionPayload(byTitle("Agreement")),
    disagreement: sectionPayload(byTitle("Disagreement")),
    regime: sectionPayload(byTitle("Regime")),
    desks,
  };
}
