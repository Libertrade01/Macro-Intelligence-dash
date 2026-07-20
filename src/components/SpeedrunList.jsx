import Link from "next/link";
import { formatBriefingDateShort } from "../lib/briefings";
import { isPreviewText } from "../lib/macro-podcasts";

function SpeedrunRow({ briefing, hrefPrefix }) {
  const preview =
    briefing.top_story && isPreviewText(briefing.top_story) ? briefing.top_story : null;

  return (
    <div className="episode-row episode-row--static">
      <Link href={`${hrefPrefix}${briefing.slug}`} className="episode-row__link">
        <span
          className="episode-row__status episode-row__status--speedrun"
          aria-hidden="true"
        />
        <time dateTime={briefing.date} className="episode-row__date">
          {formatBriefingDateShort(briefing.date)}
        </time>
        <span className="episode-row__title-wrap">
          <span className="episode-row__title">{briefing.title}</span>
          {preview ? <span className="episode-row__deck">{preview}</span> : null}
        </span>
      </Link>
    </div>
  );
}

export default function SpeedrunList({
  briefings,
  hrefPrefix = "/macro/inputs/",
}) {
  if (!briefings.length) {
    return (
      <section className="inputs-section">
        <h2 className="episode-group__label">
          Speedrun
          <span>0</span>
        </h2>
        <p className="inputs-section__empty">
          Editions appear here after the Friday run.
        </p>
      </section>
    );
  }

  return (
    <section className="inputs-section">
      <h2 className="episode-group__label">
        Speedrun
        <span>{briefings.length}</span>
      </h2>
      <div className="episode-group__rows">
        {briefings.map((briefing) => (
          <SpeedrunRow key={briefing.slug} briefing={briefing} hrefPrefix={hrefPrefix} />
        ))}
      </div>
    </section>
  );
}
