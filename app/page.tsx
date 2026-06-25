"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/lib/lang";
import { CAT_KEY } from "@/lib/translations";

const fmtR = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v: number) => v >= 1_000_000 ? `R$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `R$${(v / 1_000).toFixed(0)}K` : `R$${v.toFixed(0)}`;

const CAT_ICONS: Record<string, string> = {
  "Todos": "⊞", "Política": "🏛", "Crypto": "₿", "Tech": "💻",
  "Economia": "📊", "Esportes": "⚽", "Geral": "🌐", "Clima": "🌡", "Ciência": "🔬", "Entretenimento": "🎬",
};
const CATEGORIES = ["Todos", "Política", "Crypto", "Tech", "Economia", "Esportes", "Geral", "Clima", "Ciência", "Entretenimento"];

interface User    { id: string; name: string | null; phone: string; role: string; balance: number; }
interface Outcome { id: string; label: string; probability: number; }
interface Market  {
  id: string; title: string; category: string; emoji: string; status: string;
  volume: number; endsAt: string | null;
  outcomes: Outcome[];
  _count: { positions: number; comments: number };
}

function ProbBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div style={{ display: "flex", height: 3, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,.06)" }}>
      <div style={{ width: `${yes}%`, background: "var(--yes)", transition: "width .3s" }} />
      <div style={{ width: `${no}%`,  background: "var(--no)",  transition: "width .3s" }} />
    </div>
  );
}

function Dot({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0,
      boxShadow: glow ? `0 0 8px ${color}` : "none",
      animation: glow ? "pulse 1.4s ease-in-out infinite" : "none",
    }} />
  );
}

function SectionHeader({ title, dot, count }: { title: string; dot?: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
      {dot && <Dot color={dot} glow />}
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .9 }}>{title}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>({count})</span>}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { t } = useLang();
  const catLabel = (c: string): string => t.categories[CAT_KEY[c] as keyof typeof t.categories] ?? c;
  interface TrendingBanner { enabled: boolean; title?: string; subtitle?: string; cta?: string; url?: string; badge?: string; color?: string; image?: string; }
  interface TrendingData  { pinnedIds: string[]; pinnedMarkets: Market[]; banner: TrendingBanner; }

  const [user,     setUser]     = useState<User | null>(null);
  const [markets,  setMarkets]  = useState<Market[]>([]);
  const [cat,      setCat]      = useState("Todos");
  const [q,        setQ]        = useState("");
  const [featIdx,  setFeatIdx]  = useState(0);
  const [posValue, setPosValue] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user);
        fetch("/api/portfolio").then(r => r.json()).then(d => {
          const open = (d.positions ?? []).filter((p: { status: string; shares: number; outcome: { probability: number } }) => p.status === "open");
          setPosValue(open.reduce((s: number, p: { shares: number; outcome: { probability: number } }) => s + p.shares * (p.outcome.probability / 100), 0));
        }).catch(() => {});
      }
    }).catch(() => {});
    fetch("/api/markets?status=all&category=Todos")
      .then(r => r.json())
      .then(d => { setMarkets(d.markets ?? []); setLoading(false); })
      .catch(() => { setLoading(false); });
    fetch("/api/trending")
      .then(r => r.json())
      .then(d => setTrending(d))
      .catch(() => {});
  }, [router]);

  const openMarkets = markets.filter(m => m.status === "open");

  // Auto-rotate featured carousel
  useEffect(() => {
    const feat = openMarkets.slice(0, 5);
    if (feat.length < 2) return;
    timer.current = setInterval(() => setFeatIdx(i => (i + 1) % feat.length), 5000);
    return () => clearInterval(timer.current);
  }, [openMarkets.length]);

  const filtered   = openMarkets.filter(m =>
    (cat === "Todos" || m.category === cat) &&
    (!q || m.title.toLowerCase().includes(q.toLowerCase()))
  );
  const featured   = openMarkets.slice(0, 5);
  const featMarket = featured[Math.min(featIdx, featured.length - 1)];
  const liveCards  = openMarkets.slice(0, 3);
  const oddsLive   = openMarkets.slice(0, 14);
  const emAlta = (trending?.pinnedIds?.length ?? 0) > 0
    ? trending!.pinnedMarkets.slice(0, 10)
    : [...openMarkets].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const novos      = [...openMarkets].slice(-5).reverse();
  const movimentos = [...openMarkets].sort((a, b) => {
    const dA = Math.abs((a.outcomes[0]?.probability ?? 50) - 50);
    const dB = Math.abs((b.outcomes[0]?.probability ?? 50) - 50);
    return dB - dA;
  }).slice(0, 5);

  return (
    <>
      <Navbar balance={user?.balance} role={user?.role} userName={user ? (user.name ?? user.phone) : undefined} onSearch={setQ} />

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto", padding: "0 16px 32px", gap: 14 }}>

        {/* ─── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside className="sidebar" style={{ width: 224, flexShrink: 0, paddingTop: 16 }}>
          <div style={{ position: "sticky", top: 68, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Odds ao vivo */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "9px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7 }}>
                <Dot color="var(--yes)" glow />
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .9 }}>{t.liveOdds}</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {oddsLive.length === 0 && (
                  <div style={{ padding: "16px 14px", fontSize: 12, color: "var(--text-dim)" }}>{t.noOpenMarkets}</div>
                )}
                {oddsLive.map(m => {
                  const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
                  const pct = yes?.probability ?? 50;
                  return (
                    <div key={m.id} onClick={() => router.push(`/market/${m.id}`)}
                      style={{ padding: "8px 13px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 8, transition: "background .12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.03)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.title}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, color: pct >= 60 ? "var(--yes)" : pct <= 40 ? "var(--no)" : "var(--text)" }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saldo */}
            {user && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .9, marginBottom: 12 }}>{t.yourBalance}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>{t.available}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)", letterSpacing: -.5 }}>{fmtR(user.balance)}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>{t.inPositions}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{fmtR(posValue)}</div>
                </div>
                <button onClick={() => router.push("/portfolio")}
                  style={{ width: "100%", padding: "8px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 7 }}>
                  + Depositar
                </button>
                <button onClick={() => router.push("/portfolio")}
                  style={{ width: "100%", padding: "7px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
                  Sacar
                </button>
              </div>
            )}

          </div>
        </aside>

        {/* ─── MAIN CONTENT ─────────────────────────────────── */}
        <main style={{ flex: 1, paddingTop: 16, minWidth: 0 }}>

          {/* Filters header */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{openMarkets.length} mercados</span>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: -.4, marginTop: 2 }}>{t.filterByCategory}</h2>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 5,
                background: cat === c ? "var(--badge-bg)" : "var(--surface)",
                border: `1px solid ${cat === c ? "var(--border-acc)" : "var(--border)"}`,
                color: cat === c ? "var(--primary)" : "var(--text-muted)", transition: "all .15s",
              }}>
                <span style={{ fontSize: 13 }}>{CAT_ICONS[c] ?? "●"}</span>
                {catLabel(c)}
              </button>
            ))}
          </div>

          {/* ── Trending Banner ──────────────────────────── */}
          {trending?.banner?.enabled && trending.banner.title && (() => {
            const b = trending.banner;
            const c = b.color || "#9AFF00";
            const hasImg = !!b.image;
            return (
              <div
                onClick={() => b.url && router.push(b.url)}
                style={{
                  marginBottom: 20, borderRadius: 12, overflow: "hidden",
                  border: `1px solid ${c}44`, cursor: b.url ? "pointer" : "default",
                  background: hasImg ? "transparent" : `linear-gradient(135deg, ${c}14 0%, transparent 60%)`,
                  position: "relative", minHeight: 100,
                  transition: "border-color .2s",
                }}
                onMouseEnter={e => b.url && (e.currentTarget.style.borderColor = `${c}88`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${c}44`)}
              >
                {/* Background image with gradient overlay */}
                {hasImg && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.5) 55%, rgba(0,0,0,.12) 100%)", pointerEvents: "none" }} />
                  </>
                )}
                {!hasImg && (
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${c}0a, transparent 65%)`, pointerEvents: "none" }} />
                )}

                <div style={{ position: "relative", padding: "18px 24px" }}>
                  {b.badge && (
                    <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, background: c, color: "#000", display: "inline-block", marginBottom: 10 }}>
                      {b.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: hasImg ? "#fff" : "var(--text)", letterSpacing: -.4, lineHeight: 1.2, marginBottom: b.subtitle ? 5 : 0 }}>
                        {b.title}
                      </div>
                      {b.subtitle && (
                        <div style={{ fontSize: 12, color: hasImg ? "rgba(255,255,255,.8)" : "var(--text-muted)" }}>{b.subtitle}</div>
                      )}
                    </div>
                    {b.cta && (
                      <div style={{ flexShrink: 0, padding: "7px 20px", background: c, color: "#000", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        {b.cta}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Featured carousel */}
          {featMarket && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title={t.hotMarkets} dot="var(--yes)" />

              <div onClick={() => router.push(`/market/${featMarket.id}`)}
                style={{ background: "var(--surface)", border: "1px solid var(--border-acc)", borderRadius: 12, padding: "22px 26px", cursor: "pointer", position: "relative", overflow: "hidden", minHeight: 185 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(154,255,0,.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-acc)")}>

                {/* Subtle gradient tint */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(154,255,0,.05) 0%, transparent 55%)", pointerEvents: "none" }} />

                {/* Big emoji BG */}
                <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 90, opacity: .1, pointerEvents: "none", userSelect: "none" }}>
                  {featMarket.emoji}
                </div>

                <div style={{ position: "relative" }}>
                  <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: .8, background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {featMarket.category}
                  </span>

                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: "12px 0 10px", maxWidth: "68%", letterSpacing: -.4, lineHeight: 1.3 }}>
                    {featMarket.title}
                  </h2>

                  {(() => {
                    const yes = featMarket.outcomes.find(o => o.label === "SIM") ?? featMarket.outcomes[0];
                    const no  = featMarket.outcomes.find(o => o.label === "NÃO") ?? featMarket.outcomes[1];
                    if (!yes || !no) return null;
                    const yesPrice = yes.probability / 100;
                    const noPrice  = no.probability / 100;
                    return (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                          <span style={{ fontSize: 30, fontWeight: 900, color: "var(--yes)", letterSpacing: -1 }}>{yes.probability.toFixed(0)}%</span>
                          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{t.chance}</span>
                          <div style={{ flex: 1, maxWidth: 220 }}>
                            <ProbBar yes={yes.probability} no={no.probability} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/market/${featMarket.id}`); }}
                            style={{ padding: "8px 20px", background: "var(--yes)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            {t.yes} {fmtR(yesPrice)}
                          </button>
                          <button onClick={e => { e.stopPropagation(); router.push(`/market/${featMarket.id}`); }}
                            style={{ padding: "8px 20px", background: "rgba(255,68,68,.12)", color: "var(--no)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            {t.no} {fmtR(noPrice)}
                          </button>
                          <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 4 }}>
                            {fmtK(featMarket.volume)} {t.vol}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Dots */}
              {featured.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                  {featured.map((_, i) => (
                    <button key={i} onClick={() => { setFeatIdx(i); clearInterval(timer.current); }}
                      style={{ width: i === featIdx ? 18 : 6, height: 6, borderRadius: 3, border: "none", cursor: "pointer", background: i === featIdx ? "var(--primary)" : "var(--surface3)", transition: "all .2s", padding: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ao Vivo section */}
          {liveCards.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title={t.live} dot="var(--no)" />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 10 }}>
                {liveCards.map(m => {
                  const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
                  const no  = m.outcomes.find(o => o.label === "NÃO") ?? m.outcomes[1];
                  return (
                    <div key={m.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                      {/* Card header */}
                      <div style={{ padding: "10px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{m.emoji}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{m.category} · {m._count.positions} {t.bets}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, background: "rgba(255,68,68,.1)", color: "var(--no)", border: "1px solid rgba(255,68,68,.25)", flexShrink: 0 }}>LIVE</span>
                      </div>

                      {/* SIM / NÃO split buttons */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        {[yes, no].filter(Boolean).map((o, i) => (
                          <button key={o!.id} onClick={() => router.push(`/market/${m.id}`)}
                            style={{ padding: "13px 10px", border: "none", borderRight: i === 0 ? "1px solid var(--border)" : "none", background: "none", cursor: "pointer", transition: "background .12s", textAlign: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.background = i === 0 ? "rgba(154,255,0,.06)" : "rgba(255,68,68,.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? "var(--yes)" : "var(--no)", marginBottom: 2 }}>
                              {o!.probability.toFixed(0)}%
                            </div>
                            <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .7, marginBottom: 5 }}>{o!.label === "SIM" ? t.yes : t.no}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{t.betNow}</div>
                          </button>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ padding: "7px 13px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Dot color="var(--yes)" /> {t.realtime}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{fmtK(m.volume)} {t.vol}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Markets grid */}
          <div>
            <SectionHeader title={`Mercados${cat !== "Todos" ? " · " + cat : ""}`} count={filtered.length} />

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 10 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ height: 160, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                {t.noMarkets}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 10 }}>
                {filtered.map(m => {
                  const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
                  const no  = m.outcomes.find(o => o.label === "NÃO") ?? m.outcomes[1];
                  const daysLeft = m.endsAt ? Math.ceil((new Date(m.endsAt).getTime() - Date.now()) / 86_400_000) : null;

                  return (
                    <div key={m.id} onClick={() => router.push(`/market/${m.id}`)}
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "border-color .15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(154,255,0,.25)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>

                      {/* Card header */}
                      <div style={{ padding: "14px 15px 10px", display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                          {m.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{m.category}</span>
                            <span style={{ fontSize: 9, color: "var(--text-dim)" }}>2 opções</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{m.title}</p>
                        </div>

                        {/* Probability badge */}
                        {yes && (
                          <div style={{ textAlign: "center", flexShrink: 0 }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--yes)", lineHeight: 1, letterSpacing: -1 }}>{yes.probability.toFixed(0)}%</div>
                            <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{t.yes}</div>
                          </div>
                        )}
                      </div>

                      {/* Prob bar */}
                      {yes && no && (
                        <div style={{ padding: "0 15px 10px" }}>
                          <ProbBar yes={yes.probability} no={no.probability} />
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ padding: "9px 15px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{fmtK(m.volume)}</span> {t.vol}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{m._count.positions} {t.bets}</span>
                          {daysLeft !== null && daysLeft > 0 && (
                            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{daysLeft}d</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/market/${m.id}`); }}
                            style={{ padding: "4px 10px", background: "var(--badge-bg)", color: "var(--primary)", border: "1px solid var(--border-acc)", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                            {t.buy} {yes?.probability.toFixed(0)}%
                          </button>
                          <button onClick={e => { e.stopPropagation(); router.push(`/market/${m.id}`); }}
                            style={{ padding: "4px 10px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 10, cursor: "pointer" }}>
                            {t.viewAll}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ─── RIGHT SIDEBAR ────────────────────────────────── */}
        <aside className="sidebar" style={{ width: 224, flexShrink: 0, paddingTop: 16 }}>
          <div style={{ position: "sticky", top: 68, display: "flex", flexDirection: "column", gap: 12 }}>

            <SideList title={t.trending} icon="📈" items={emAlta.map((m, i) => {
              const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
              return { rank: i + 1, label: m.title, value: (yes?.probability ?? 50).toFixed(0) + "%", id: m.id, color: (yes?.probability ?? 50) >= 60 ? "var(--yes)" : "var(--text-muted)" };
            })} onNavigate={id => router.push(`/market/${id}`)} />

            <SideList title={t.biggestMoves} icon="⚡" items={movimentos.map((m, i) => {
              const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
              const diff = Math.abs((yes?.probability ?? 50) - 50);
              return { rank: i + 1, label: m.title, value: diff > 0 ? `+${diff.toFixed(0)}%` : "0%", id: m.id, color: diff > 10 ? "var(--yes)" : "var(--text-muted)" };
            })} onNavigate={id => router.push(`/market/${id}`)} />

            <SideList title={t.newMarkets} icon="✨" items={novos.map((m, i) => {
              const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
              return { rank: i + 1, label: m.title, value: (yes?.probability ?? 50).toFixed(0) + "%", id: m.id, color: "var(--text-muted)" };
            })} onNavigate={id => router.push(`/market/${id}`)} />

          </div>
        </aside>

      </div>
    </>
  );
}

function SideList({ title, icon, items, onNavigate }: {
  title: string; icon: string;
  items: { rank: number; label: string; value: string; id: string; color?: string }[];
  onNavigate: (id: string) => void;
}) {
  const { t } = useLang();
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "9px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .9 }}>{title}</span>
      </div>
      {items.length === 0 && <div style={{ padding: "12px 13px", fontSize: 11, color: "var(--text-dim)" }}>{t.noData}</div>}
      {items.map(item => (
        <div key={item.id} onClick={() => onNavigate(item.id)}
          style={{ padding: "8px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", transition: "background .12s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.03)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 700, minWidth: 14, textAlign: "right" }}>{item.rank}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{item.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: item.color ?? "var(--yes)", flexShrink: 0 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
