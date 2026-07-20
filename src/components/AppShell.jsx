"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/macro", label: "Overview" },
  { href: "/macro/inputs", label: "Inputs" },
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

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div className="studio-wordmark">
          <span>Libertrade</span>
          Macro Intelligence
        </div>

        <div className="studio-nav-groups">
          <div className="studio-nav-section">
            <p className="studio-nav-label">Desk</p>
            <div className="studio-nav">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isNavActive(pathname, item.href) ? "active" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  );
}
