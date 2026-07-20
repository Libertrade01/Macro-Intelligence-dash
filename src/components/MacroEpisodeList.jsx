"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteEpisodeAction } from "../app/macro/inputs/actions";
import { formatBriefingDateShort } from "../lib/briefings";
import {
  episodeDisplayTitle,
  groupEpisodesByShow,
  podcastFilterOptions,
  podcastShowName,
} from "../lib/macro-podcasts";

function ReadStatus({ read }) {
  return (
    <span
      className={`episode-row__status${read ? " episode-row__status--read" : " episode-row__status--unread"}`}
      aria-label={read ? "Read" : "Unread"}
      title={read ? "Read" : "Unread"}
    />
  );
}

function EpisodeRow({ briefing, hrefPrefix }) {
  const [pending, startTransition] = useTransition();
  const read = Boolean(briefing.read_at);
  const title = episodeDisplayTitle(briefing);

  function remove(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteEpisodeAction(briefing.slug);
    });
  }

  return (
    <div
      className={`episode-row${read ? " episode-row--read" : ""}${pending ? " episode-row--pending" : ""}`}
    >
      <Link href={`${hrefPrefix}${briefing.slug}`} className="episode-row__link">
        <ReadStatus read={read} />
        <time dateTime={briefing.date} className="episode-row__date">
          {formatBriefingDateShort(briefing.date)}
        </time>
        <span className="episode-row__title">{title}</span>
      </Link>

      <button
        type="button"
        className="episode-row__delete"
        onClick={remove}
        disabled={pending}
        aria-label="Delete episode"
      >
        ×
      </button>
    </div>
  );
}

function EpisodeGroup({ show, briefings, hrefPrefix }) {
  return (
    <section className="episode-group">
      <h2 className="episode-group__label">
        {show}
        <span>{briefings.length}</span>
      </h2>
      <div className="episode-group__rows">
        {briefings.map((briefing) => (
          <EpisodeRow key={briefing.slug} briefing={briefing} hrefPrefix={hrefPrefix} />
        ))}
      </div>
    </section>
  );
}

export default function MacroEpisodeList({ briefings, hrefPrefix = "/macro/inputs/" }) {
  const [filter, setFilter] = useState("all");

  const showFilters = useMemo(() => podcastFilterOptions(briefings), [briefings]);

  const filtered = useMemo(() => {
    if (filter === "all") return briefings;
    return briefings.filter((b) => podcastShowName(b) === filter);
  }, [briefings, filter]);

  const grouped = useMemo(() => groupEpisodesByShow(filtered), [filtered]);
  const flatFiltered = filter !== "all";

  if (!briefings.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Episodes</p>
        <h2>No episodes yet</h2>
        <p>When Hermes ingests a podcast summary, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="episode-library">
      <div className="episode-filters" role="tablist" aria-label="Filter by podcast">
        <button
          type="button"
          role="tab"
          className={filter === "all" ? "active" : undefined}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {showFilters.map((show) => (
          <button
            key={show}
            type="button"
            role="tab"
            className={filter === show ? "active" : undefined}
            onClick={() => setFilter(show)}
          >
            {show}
          </button>
        ))}
      </div>

      <div className="episode-groups">
        {flatFiltered ? (
          <div className="episode-group__rows episode-group__rows--flat">
            {filtered.map((briefing) => (
              <EpisodeRow key={briefing.slug} briefing={briefing} hrefPrefix={hrefPrefix} />
            ))}
          </div>
        ) : (
          grouped.map(([show, items]) => (
            <EpisodeGroup key={show} show={show} briefings={items} hrefPrefix={hrefPrefix} />
          ))
        )}
      </div>
    </div>
  );
}
