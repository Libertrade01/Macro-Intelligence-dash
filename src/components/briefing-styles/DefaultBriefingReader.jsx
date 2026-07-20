import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  estimateReadTime,
  formatBriefingDate,
  hasStructuredItems,
  parseBriefingSections,
  parseStoryItems,
} from "../../lib/briefings";

function Markdown({ children, className }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

function StoryList({ body }) {
  const items = parseStoryItems(body);

  return (
    <div className="story-list">
      {items.map((item, index) => {
        if (!item.headline && !item.why) {
          return (
            <div key={index} className="story-item story-item--plain">
              <Markdown className="story-plain">{item.raw}</Markdown>
            </div>
          );
        }

        return (
          <article key={index} className="story-item">
            {item.headline ? (
              <h3 className="story-headline">{item.headline}</h3>
            ) : null}
            {item.why ? <p className="story-why">{item.why}</p> : null}
            {item.sourceText ? (
              <p className="story-source">
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    {item.sourceText}
                  </a>
                ) : (
                  item.sourceText
                )}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function Section({ section }) {
  const { variant, title, body } = section;
  const structured =
    ["pulse", "default", "social"].includes(variant) && hasStructuredItems(body);

  if (variant === "hero") {
    return (
      <section className="briefing-block briefing-block--lead">
        <h2 className="block-label">{title}</h2>
        <div className="lead-body">
          <Markdown>{body}</Markdown>
        </div>
      </section>
    );
  }

  if (variant === "take") {
    return (
      <section className="briefing-block briefing-block--take">
        <h2 className="block-label">{title}</h2>
        <div className="take-body">
          <Markdown>{body}</Markdown>
        </div>
      </section>
    );
  }

  if (variant === "watchlist") {
    return (
      <section className="briefing-block">
        <h2 className="block-label">{title}</h2>
        <div className="watchlist-body">
          <Markdown>{body}</Markdown>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`briefing-block${variant === "pulse" ? " briefing-block--pulse" : ""}`}
    >
      <h2 className="block-label">{title}</h2>
      {structured ? (
        <StoryList body={body} />
      ) : (
        <div className="prose-body">
          <Markdown>{body}</Markdown>
        </div>
      )}
    </section>
  );
}

export default function DefaultBriefingReader({ briefing }) {
  const sections = parseBriefingSections(briefing.content_markdown);
  const readTime = estimateReadTime(briefing.content_markdown);
  const sources = briefing.sources || [];

  return (
    <div className="studio-content">
      <article className="briefing-article">
        <header className="briefing-header">
          <p className="eyebrow">Briefing</p>
          <h1 className="page-title">{briefing.title}</h1>

          <div className="briefing-byline">
            <time dateTime={briefing.date}>{formatBriefingDate(briefing.date)}</time>
            <span className="byline-sep" aria-hidden="true">
              ·
            </span>
            <span>{readTime} min read</span>
            {briefing.primary_signal ? (
              <>
                <span className="byline-sep" aria-hidden="true">
                  ·
                </span>
                <span className="byline-signal">{briefing.primary_signal}</span>
              </>
            ) : null}
          </div>

          {sources.length > 0 ? (
            <p className="briefing-sources">
              {briefing.source_count ? `${briefing.source_count} sources · ` : ""}
              {sources.join(" · ")}
            </p>
          ) : null}
        </header>

        <div className="briefing-body">
          {sections.map((section) => (
            <Section key={section.title} section={section} />
          ))}
        </div>
      </article>
    </div>
  );
}
