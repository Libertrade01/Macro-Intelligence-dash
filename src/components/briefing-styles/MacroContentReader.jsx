import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EpisodeReadToggle from "../EpisodeReadToggle";
import {
  estimateReadTime,
  formatBriefingDate,
  parseBriefingSections,
} from "../../lib/briefings";
import { BRIEFING_TYPES } from "../../lib/briefing-types";
import { episodeDisplayTitle, isPreviewText, podcastShowName } from "../../lib/macro-podcasts";

function Markdown({ children, className }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

function sectionEyebrow(type) {
  if (type === "newsletter_summary") return "Speedrun";
  if (type === "podcast_summary") return "Episode";
  return "Macro Mind";
}

export default function MacroContentReader({ briefing }) {
  const sections = parseBriefingSections(briefing.content_markdown);
  const readTime = estimateReadTime(briefing.content_markdown);
  const isEpisode = briefing.type === BRIEFING_TYPES.PODCAST;
  const showName = isEpisode ? podcastShowName(briefing) : briefing.sources?.[0];
  const title = isEpisode ? episodeDisplayTitle(briefing) : briefing.title;
  const read = Boolean(briefing.read_at);
  const preview =
    briefing.top_story && isPreviewText(briefing.top_story) ? briefing.top_story : null;

  return (
    <div className="studio-content macro-content">
      <article className="briefing-article">
        <header className="briefing-header">
          <div className="macro-content__meta">
            <p className="eyebrow">{sectionEyebrow(briefing.type)}</p>
            {isEpisode ? (
              <span
                className={`macro-read-pill${read ? " macro-read-pill--read" : ""}`}
              >
                {read ? "Read" : "Unread"}
              </span>
            ) : null}
          </div>
          <h1 className="page-title">{title}</h1>

          <div className="briefing-byline">
            <time dateTime={briefing.date}>{formatBriefingDate(briefing.date)}</time>
            <span className="byline-sep" aria-hidden="true">
              ·
            </span>
            <span>{readTime} min read</span>
            {showName && showName !== "Other" ? (
              <>
                <span className="byline-sep" aria-hidden="true">
                  ·
                </span>
                <span className="byline-signal">{showName}</span>
              </>
            ) : null}
          </div>

          {preview ? <p className="briefing-sources">{preview}</p> : null}
        </header>

        <div className="briefing-body">
          {sections.map((section) => (
            <section key={section.title} className="briefing-block">
              <h2 className="block-label">{section.title}</h2>
              <div className="prose-body">
                <Markdown>{section.body}</Markdown>
              </div>
            </section>
          ))}
        </div>

        {isEpisode ? (
          <EpisodeReadToggle slug={briefing.slug} readAt={briefing.read_at} />
        ) : null}
      </article>
    </div>
  );
}
