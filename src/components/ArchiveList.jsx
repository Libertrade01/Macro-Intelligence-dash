import Link from "next/link";
import { formatBriefingDate } from "../lib/briefings";

export default function ArchiveList({
  briefings,
  hrefPrefix = "/briefings/",
  emptyEyebrow = "Archive",
  emptyTitle = "No briefings yet",
  emptyMessage = "When Hermes posts your first briefing, it will show up here.",
}) {
  if (!briefings.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">{emptyEyebrow}</p>
        <h2>{emptyTitle}</h2>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="archive-list">
      {briefings.map((briefing) => (
        <Link
          key={briefing.slug}
          href={`${hrefPrefix}${briefing.slug}`}
          className="archive-card"
        >
          <div className="archive-card-date">
            {formatBriefingDate(briefing.date)}
          </div>
          <div className="archive-card-title">{briefing.title}</div>
          {briefing.sources?.[0] ? (
            <p className="archive-card-show">{briefing.sources[0]}</p>
          ) : null}
          {briefing.top_story ? (
            <p className="archive-card-preview">{briefing.top_story}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
