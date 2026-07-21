"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteEpisodeAction } from "../app/macro/inputs/actions";
import { formatBriefingDateShort } from "../lib/briefings";
import {
  episodeDisplayTitle,
  isPreviewText,
  podcastShowName,
} from "../lib/macro-podcasts";

const TOPIC_RULES = [
  ["Liquidity", /liquidity|funding|credit|financial conditions/i],
  ["Rates", /rates?|fed|yield|duration|central bank/i],
  ["Inflation", /inflation|prices?|cpi|disinflation/i],
  ["Growth", /growth|recession|labou?r|employment|consumer/i],
  ["Positioning", /positioning|rotation|crowded|flows?|risk appetite/i],
  ["AI", /\bai\b|artificial intelligence|semiconductor/i],
  ["Crypto", /crypto|bitcoin|defi|perpetual|on-chain/i],
  ["Market structure", /market structure|exchange|trading|execution/i],
];

function sourceName(briefing) {
  if (briefing.type === "newsletter_summary") return "Friday Speedrun";
  return podcastShowName(briefing);
}

function sourceMark(show) {
  if (show === "1000x Network") return "1K";
  if (show === "Forward Guidance") return "FG";
  if (show === "Capital Flows Research") return "CF";
  if (show === "Friday Speedrun") return "SR";
  return show.slice(0, 2).toUpperCase();
}

function signalTitle(briefing) {
  return briefing.type === "podcast_summary"
    ? episodeDisplayTitle(briefing)
    : briefing.title;
}

function plainText(value) {
  return String(value || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#*_>\[\]()`]/g, "")
    .replace(/^[-\s]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function signalPreview(briefing) {
  if (briefing.top_story && isPreviewText(briefing.top_story)) {
    return plainText(briefing.top_story);
  }

  const content = plainText(briefing.content_markdown);
  return content.slice(0, 210) || "Open the signal to read the extracted argument and evidence.";
}

function signalTopics(briefing) {
  const haystack = `${signalTitle(briefing)} ${briefing.top_story || ""} ${briefing.content_markdown || ""}`;
  const found = TOPIC_RULES.filter(([, rule]) => rule.test(haystack)).map(([name]) => name);
  return found.slice(0, 2);
}

function SignalState({ briefing }) {
  const read = Boolean(briefing.read_at);
  return (
    <span className={`signal-state${read ? " signal-state--reviewed" : ""}`}>
      <i aria-hidden="true" />
      {read ? "Reviewed" : "New signal"}
    </span>
  );
}

function DeleteControl({ briefing }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="signal-delete-confirm" onClick={(event) => event.preventDefault()}>
        <span>Remove?</span>
        <button
          type="button"
          disabled={pending}
          onClick={(event) => {
            event.preventDefault();
            startTransition(() => deleteEpisodeAction(briefing.slug));
          }}
        >
          Yes
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={(event) => {
            event.preventDefault();
            setConfirming(false);
          }}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="signal-delete"
      aria-label={`Remove ${signalTitle(briefing)}`}
      onClick={(event) => {
        event.preventDefault();
        setConfirming(true);
      }}
    >
      Remove
    </button>
  );
}

function FeatureSignal({ briefing, hrefPrefix }) {
  const show = sourceName(briefing);
  const topics = signalTopics(briefing);

  return (
    <article className="signal-feature">
      <div className="signal-feature__source">
        <span className="signal-source-mark">{sourceMark(show)}</span>
        <span>
          <strong>{show}</strong>
          <time dateTime={briefing.date}>{formatBriefingDateShort(briefing.date)}</time>
        </span>
      </div>
      <Link href={`${hrefPrefix}${briefing.slug}`} className="signal-feature__link">
        <h3>{signalTitle(briefing)}</h3>
        <p>{signalPreview(briefing)}</p>
      </Link>
      <div className="signal-feature__topics">
        <SignalState briefing={briefing} />
        {topics.map((topic) => <span key={topic}>{topic}</span>)}
      </div>
      <footer className="signal-feature__footer">
        <Link href={`${hrefPrefix}${briefing.slug}`}>Open signal <span aria-hidden="true">↗</span></Link>
        {briefing.type === "podcast_summary" ? <DeleteControl briefing={briefing} /> : null}
      </footer>
    </article>
  );
}

function SignalRow({ briefing, hrefPrefix }) {
  const show = sourceName(briefing);
  const topics = signalTopics(briefing);

  return (
    <article className="signal-row">
      <span className="signal-source-mark">{sourceMark(show)}</span>
      <time dateTime={briefing.date}>{formatBriefingDateShort(briefing.date)}</time>
      <Link href={`${hrefPrefix}${briefing.slug}`} className="signal-row__main">
        <strong>{signalTitle(briefing)}</strong>
        <span>{signalPreview(briefing)}</span>
      </Link>
      <span className="signal-row__topic">{topics[0] || show}</span>
      <SignalState briefing={briefing} />
      {briefing.type === "podcast_summary" ? <DeleteControl briefing={briefing} /> : <span />}
    </article>
  );
}

export default function MacroEpisodeList({
  briefings,
  newsletters = [],
  hrefPrefix = "/macro/inputs/",
}) {
  const [filter, setFilter] = useState("all");
  const allSignals = useMemo(
    () => [...briefings, ...newsletters].sort((a, b) => b.date.localeCompare(a.date)),
    [briefings, newsletters]
  );
  const sources = useMemo(
    () => [...new Set(allSignals.map(sourceName))],
    [allSignals]
  );
  const filtered = useMemo(
    () => filter === "all" ? allSignals : allSignals.filter((item) => sourceName(item) === filter),
    [allSignals, filter]
  );
  const featured = filtered.slice(0, 2);
  const archive = filtered.slice(2);

  if (!allSignals.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Signal intake</p>
        <h2>No signals yet</h2>
        <p>New podcast and newsletter summaries will appear here after ingestion.</p>
      </div>
    );
  }

  return (
    <section className="signal-library">
      <div className="signal-filters" aria-label="Filter by source">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All sources</button>
        {sources.map((source) => (
          <button key={source} type="button" className={filter === source ? "active" : ""} onClick={() => setFilter(source)}>{source}</button>
        ))}
      </div>

      <section className="signal-new">
        <header className="signal-section-head">
          <div>
            <p className="eyebrow">Latest intake</p>
            <h2>{filter === "all" ? "Newest signals" : filter}</h2>
          </div>
          <p>{filtered.length} {filtered.length === 1 ? "signal" : "signals"}</p>
        </header>
        <div className="signal-feature-grid">
          {featured.map((briefing) => <FeatureSignal key={briefing.slug} briefing={briefing} hrefPrefix={hrefPrefix} />)}
        </div>
      </section>

      {archive.length ? (
        <section className="signal-archive">
          <header className="signal-section-head">
            <div><p className="eyebrow">Evidence archive</p><h2>Earlier signals</h2></div>
            <p>Newest first ↓</p>
          </header>
          <div className="signal-rows">
            {archive.map((briefing) => <SignalRow key={briefing.slug} briefing={briefing} hrefPrefix={hrefPrefix} />)}
          </div>
        </section>
      ) : null}
    </section>
  );
}
