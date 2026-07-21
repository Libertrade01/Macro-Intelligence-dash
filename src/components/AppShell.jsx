"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/macro", label: "Today" },
  { href: "/macro/inputs", label: "Signals" },
  { href: "/macro/revisions", label: "Revisions" },
];

function isNavActive(pathname, href) {
  if (href === "/macro") return pathname === "/macro";
  if (href === "/macro/inputs") {
    return (
      pathname.startsWith("/macro/inputs") ||
      pathname.startsWith("/macro/episodes") ||
      pathname.startsWith("/macro/newsletter")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("signal-room-theme");
    const nextTheme = saved || "dark";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("signal-room-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <Link href="/macro" className="studio-wordmark" aria-label="Macro Signal Room home">
          <span className="studio-wordmark__signal" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <rect x="3" y="14" width="3.5" height="7" rx="0.75" fill="currentColor" opacity="0.45" />
              <rect x="10" y="9" width="3.5" height="12" rx="0.75" fill="currentColor" opacity="0.75" />
              <rect x="17" y="3" width="3.5" height="18" rx="0.75" fill="var(--brand)" />
            </svg>
          </span>
          <strong>Macro Signal Room</strong>
        </Link>

        <nav className="studio-nav" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isNavActive(pathname, item.href) ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="studio-actions">
          <div className="studio-live" aria-label="Synthesis engine active">
            <span aria-hidden="true" />
            Live synthesis
          </div>
          <button type="button" className="studio-theme" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
            Theme <strong>{theme}</strong>
          </button>
        </div>
      </header>
      <main className="studio-main">{children}</main>
    </div>
  );
}
