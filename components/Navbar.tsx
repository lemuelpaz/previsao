"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "@/lib/lang";
import type { Lang } from "@/lib/translations";

const fmt = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props { balance?: number; role?: string; userName?: string; onSearch?: (q: string) => void; }

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "https://flagcdn.com/w20/br.png", label: "PT" },
  { code: "en", flag: "https://flagcdn.com/w20/us.png", label: "EN" },
  { code: "es", flag: "https://flagcdn.com/w20/es.png", label: "ES" },
];

export default function Navbar({ balance, role, userName, onSearch }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const { t, lang, setLang } = useLang();
  const [open,     setOpen]     = useState(false);
  const [mob,      setMob]      = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isDark,   setIsDark]   = useState(true);
  const dropRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
  }, []);

  function toggleTheme() {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => setMob(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  const LINKS = [
    { href: "/",            label: t.markets    },
    { href: "/portfolio",   label: t.portfolio   },
    { href: "/leaderboard", label: t.leaderboard },
  ];

  const curLang = LANGS.find(l => l.code === lang) ?? LANGS[0];

  return (
    <nav style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)", position: "sticky", top: 2, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 20px", height: 52, maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Logo ─────────────────────────────── */}
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: -.5, textTransform: "uppercase" }}>Metrix</span>
        </button>

        {/* ── Search (desktop only) ─────────────── */}
        {onSearch && (
          <div style={{ position: "relative", flexShrink: 0 }} className="hide-mobile">
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder={t.search} onChange={e => onSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", fontSize: 12, outline: "none", width: 200 }} />
          </div>
        )}

        {/* ── Desktop nav links ─────────────────── */}
        <div className="nav-links" style={{ display: "flex", gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <button key={l.href} onClick={() => router.push(l.href)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "5px 12px", fontSize: 13, fontWeight: 500, borderRadius: 6,
              color: isActive(l.href) ? "var(--primary)" : "var(--text-muted)", transition: "color .15s",
            }}
            onMouseEnter={e => { if (!isActive(l.href)) e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { if (!isActive(l.href)) e.currentTarget.style.color = "var(--text-muted)"; }}>
              {l.label}
            </button>
          ))}
          {role === "admin" && (
            <button onClick={() => router.push("/admin")} style={{ background: "none", border: "none", cursor: "pointer", padding: "5px 12px", fontSize: 13, fontWeight: 500, borderRadius: 6, color: isActive("/admin") ? "var(--primary)" : "var(--text-muted)" }}>
              {t.admin}
            </button>
          )}
        </div>

        {/* ── Spacer (mobile only, pushes controls right) */}
        <div className="mobile-spacer" style={{ flex: 1 }} />

        {/* ── Right controls ─────────────────────── */}
        {/* ORDER: Lang → Theme → [desktop auth] → Hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

          {/* Language switcher */}
          <div ref={langRef} style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(v => !v)} style={{
              height: 30, padding: "0 8px", borderRadius: 6,
              background: langOpen ? "var(--badge-bg)" : "var(--surface)",
              border: `1px solid ${langOpen ? "var(--border-acc)" : "var(--border)"}`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "var(--text-muted)", transition: "all .15s",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={curLang.flag} alt={curLang.label} width={18} height={13} style={{ borderRadius: 2, objectFit: "cover", display: "block" }} />
              <span className="hide-mobile" style={{ fontSize: 11, fontWeight: 600 }}>{curLang.label}</span>
            </button>
            {langOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,.7)", minWidth: 100 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} style={{
                    width: "100%", padding: "9px 14px",
                    background: l.code === lang ? "var(--badge-bg)" : "none",
                    border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    color: l.code === lang ? "var(--primary)" : "var(--text-muted)", transition: "background .12s",
                  }}
                  onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                  onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "none"; }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.flag} alt={l.label} width={20} height={15} style={{ borderRadius: 2, objectFit: "cover", display: "block" }} />
                    <span style={{ fontWeight: l.code === lang ? 700 : 400 }}>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={isDark ? "Tema claro" : "Tema escuro"} style={{
            height: 30, width: 30, borderRadius: 6, background: "var(--surface)",
            border: "1px solid var(--border)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-acc)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Desktop-only auth section */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {userName ? (
              <>
                <button onClick={() => router.push("/portfolio")}
                  style={{ padding: "6px 14px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                  {t.withdraw}
                </button>
                <button onClick={() => router.push("/portfolio")}
                  style={{ padding: "6px 16px", background: "var(--primary)", border: "none", borderRadius: 7, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {t.deposit}
                </button>
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button onClick={() => setOpen(v => !v)} style={{
                    height: 32, padding: "0 10px", borderRadius: 6,
                    background: open ? "var(--badge-bg)" : "var(--surface)",
                    border: `1px solid ${open ? "var(--border-acc)" : "var(--border)"}`,
                    color: open ? "var(--primary)" : "var(--text-muted)",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .15s", fontSize: 12, fontWeight: 600,
                  }}>
                    {userName.charAt(0).toUpperCase()}
                    {balance !== undefined && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{fmt(balance)}</span>}
                  </button>
                  {open && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", minWidth: 180, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", zIndex: 200, boxShadow: "0 12px 40px rgba(0,0,0,.8)" }}>
                      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                      {balance !== undefined && <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--primary)", fontWeight: 700 }}>{fmt(balance)}</div>}
                      {role === "admin" && <DropItem label={t.admin} color="var(--primary)" onClick={() => { router.push("/admin"); setOpen(false); }} />}
                      <DropItem label={t.portfolio} onClick={() => { router.push("/portfolio"); setOpen(false); }} />
                      <DropItem label={t.signout} color="var(--red)" onClick={() => { logout(); setOpen(false); }} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => router.push("/login")}
                  style={{ padding: "6px 14px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                  {t.signin}
                </button>
                <button onClick={() => router.push("/register")}
                  style={{ padding: "6px 16px", background: "var(--primary)", border: "none", borderRadius: 7, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {t.signup}
                </button>
              </>
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button onClick={() => setMob(v => !v)} className="hamburger" style={{ display: "none", background: mob ? "var(--badge-bg)" : "none", border: `1px solid ${mob ? "var(--border-acc)" : "var(--border)"}`, borderRadius: 6, padding: "5px 7px", cursor: "pointer", color: mob ? "var(--primary)" : "var(--text-muted)", transition: "all .15s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {mob
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="8"  x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile panel ──────────────────────────── */}
      {mob && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "8px 12px 14px" }}>

          {/* Account section */}
          {userName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* User info + balance */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#000" }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{userName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>conta ativa</div>
                  </div>
                </div>
                {balance !== undefined && (
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>{fmt(balance)}</div>
                )}
              </div>

              {/* Deposit / Withdraw */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { router.push("/portfolio"); setMob(false); }}
                  style={{ flex: 1, padding: "11px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {t.deposit}
                </button>
                <button onClick={() => { router.push("/portfolio"); setMob(false); }}
                  style={{ flex: 1, padding: "11px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {t.withdraw}
                </button>
              </div>

              {/* Sign out */}
              <button onClick={() => { logout(); setMob(false); }}
                style={{ padding: "10px", background: "none", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t.signout}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { router.push("/register"); setMob(false); }}
                style={{ padding: "12px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {t.signup}
              </button>
              <button onClick={() => { router.push("/login"); setMob(false); }}
                style={{ padding: "11px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t.signin}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function DropItem({ label, color = "var(--text)", onClick }: { label: string; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--border)", textAlign: "left", color, fontSize: 13, cursor: "pointer", transition: "background .12s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
      {label}
    </button>
  );
}
