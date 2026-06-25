"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "@/lib/lang";

export default function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useLang();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const items = [
    {
      href: "/",
      label: t.markets,
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3"  y="3"  width="7" height="7" rx="1.5"/>
          <rect x="14" y="3"  width="7" height="7" rx="1.5"/>
          <rect x="3"  y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      href: "/portfolio",
      label: t.portfolio,
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
    },
    {
      href: "/leaderboard",
      label: t.leaderboard,
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="2"  y="14" width="5" height="8" rx="1"/>
          <rect x="9"  y="8"  width="6" height="14" rx="1"/>
          <rect x="17" y="11" width="5" height="11" rx="1"/>
          <polyline points="2 14 7 9 12 12 17 6 22 2"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150,
      background: "var(--nav-bg)", borderTop: "1px solid var(--border)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ display: "flex", alignItems: "stretch", maxWidth: 480, margin: "0 auto" }}>
        {items.map(item => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4, padding: "9px 0 11px",
                background: "none", border: "none", cursor: "pointer",
                color: active ? "var(--primary)" : "var(--text-dim)",
                position: "relative", transition: "color .15s",
              }}
            >
              {/* Active top indicator */}
              {active && (
                <span style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 28, height: 2.5,
                  background: "var(--primary)",
                  borderRadius: "0 0 3px 3px",
                  display: "block",
                }} />
              )}
              {item.icon(active)}
              <span style={{
                fontSize: 9.5, fontWeight: active ? 700 : 500,
                letterSpacing: .5, textTransform: "uppercase",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
