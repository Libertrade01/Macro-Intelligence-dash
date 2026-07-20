"use client";

import { useTransition } from "react";
import { setEpisodeReadAction } from "../app/macro/inputs/actions";

export default function EpisodeReadToggle({ slug, readAt }) {
  const [pending, startTransition] = useTransition();
  const read = Boolean(readAt);

  function toggle() {
    startTransition(async () => {
      await setEpisodeReadAction(slug, !read);
    });
  }

  return (
    <footer className="episode-read-footer">
      <button
        type="button"
        className={`episode-read-btn${read ? " episode-read-btn--read" : ""}`}
        onClick={toggle}
        disabled={pending}
      >
        {read ? "Mark as unread" : "Mark as read"}
      </button>
    </footer>
  );
}
