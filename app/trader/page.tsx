"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/lib/lang";
import { CAT_KEY } from "@/lib/translations";

const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`;
const REFRESH_MS = 10000;

interface User   { id: string; name: string | null; phone: string; role: string; balance: number; }
interface Ticker {
  id: string; title: string; emoji: string; category: string; volume: number; endsAt: string | null;
  yesPrice: number; noPrice: number; yesOutcomeId: string | null; noOutcomeId: string | null;
  change24h: number; sparkline: number[];
}
type SortKey = "volume" | "yesPrice" | "change24h";

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length < 2) return <div style={{ width: 80, height: 28 }} />;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const w = 80, h = 28;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={coords} fill="none" stroke={positive ? "var(--yes)" : "var(--no)"} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function TraderPage() {
  const router = useRouter();
  const { t }  = useLang();
  const [user,    setUser]    = useState<User | null>(null);
  const [rows,    setRows]    = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState("");
  const [cat,     setCat]     = useState("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [quick,   setQuick]   = useState<{ market: Ticker; side: "SIM" | "NÃO" } | null>(null);
  const [qAmount, setQAmount] = useState(50);
  const [qBusy,   setQBusy]   = useState(false);
  const [qErr,    setQErr]    = useState("");

  const loadTicker = useCallback(() => {
    fetch("/api/markets/ticker").then(r => r.json()).then(d => {
      setRows(d.ticker ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    loadTicker();
    const iv = setInterval(loadTicker, REFRESH_MS);
    return () => clearInterval(iv);
  }, [loadTicker]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(rows.map(r => r.category)))], [rows]);
  const catLabel = (c: string): string => t.categories[CAT_KEY[c] as keyof typeof t.categories] ?? c;

  const filtered = useMemo(() => {
    let list = rows;
    if (cat !== "Todos") list = list.filter(r => r.category === cat);
    if (q.trim()) list = list.filter(r => r.title.toLowerCase().includes(q.trim().toLowerCase()));
    return [...list].sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
  }, [rows, cat, q, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  }

  async function confirmQuickTrade() {
    if (!quick || !user) return;
    const outcomeId = quick.side === "SIM" ? quick.market.yesOutcomeId : quick.market.noOutcomeId;
    if (!outcomeId) return;
    setQBusy(true); setQErr("");
    const res = await fetch(`/api/markets/${quick.market.id}/trade`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcomeId, amount: qAmount }),
    });
    const d = await res.json();
    setQBusy(false);
    if (!res.ok) { setQErr(d.error ?? "Erro ao negociar"); return; }
    setUser(u => u ? { ...u, balance: d.newBalance } : u);
    setQuick(null);
    loadTicker();
  }

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <th onClick={() => toggleSort(k)} style={{ padding: "10px 14px", textAlign: "right", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
      {label} {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <>
      <Navbar balance={user?.balance} role={user?.role} userName={user ? (user.name ?? user.phone) : undefined} />
      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 20px 60px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, display: "flex", alignItems: "center", gap: 8 }}>
              Trader
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "var(--yes)", background: "var(--badge-bg)", border: "1px solid var(--border-acc)", borderRadius: 99, padding: "3px 9px", textTransform: "uppercase", letterSpacing: .6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--yes)", animation: "pulse 1.6s infinite" }} />
                {t.live}
              </span>
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Painel de negociação em tempo real — todos os mercados abertos</p>
          </div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} className="inp" style={{ width: 220 }} />
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "6px 13px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: cat === c ? "var(--badge-bg)" : "var(--surface)",
              border: `1px solid ${cat === c ? "var(--border-acc)" : "var(--border)"}`,
              color: cat === c ? "var(--primary)" : "var(--text-muted)", transition: "all .15s",
            }}>
              {catLabel(c)}
            </button>
          ))}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Ativo</th>
                  <SortHead label="Preço" k="yesPrice" />
                  <SortHead label="Variação 24h" k="change24h" />
                  <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Gráfico</th>
                  <SortHead label={t.vol} k="volume" />
                  <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{t.loading}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{t.noMarkets}</td></tr>
                ) : filtered.map(m => {
                  const positive = m.change24h >= 0;
                  return (
                    <tr key={m.id} onClick={() => router.push(`/market/${m.id}`)}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{m.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                            <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{catLabel(m.category)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{m.yesPrice.toFixed(0)}¢</div>
                        <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{t.yes}</div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: positive ? "var(--yes)" : "var(--no)" }}>
                          {positive ? "▲" : "▼"} {Math.abs(m.change24h).toFixed(1)}pp
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Sparkline points={m.sparkline} positive={positive} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, color: "var(--text-muted)" }}>{fmtK(m.volume)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button onClick={() => { setQuick({ market: m, side: "SIM" }); setQAmount(50); setQErr(""); }}
                            style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--yes)", color: "#000", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                            {t.yes} {m.yesPrice.toFixed(0)}¢
                          </button>
                          <button onClick={() => { setQuick({ market: m, side: "NÃO" }); setQAmount(50); setQErr(""); }}
                            style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--no)", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                            {t.no} {m.noPrice.toFixed(0)}¢
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Quick trade modal ── */}
      {quick && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setQuick(null)}>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                {quick.side === "SIM" ? t.yes : t.no} — {quick.market.title.slice(0, 40)}
              </span>
              <button onClick={() => setQuick(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>

            {!user ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{t.signupToBet}</div>
                <button onClick={() => router.push("/register")} style={{ width: "100%", padding: 11, background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.signupFree}</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t.amount}</label>
                  <input type="number" min={1} value={qAmount} onChange={e => setQAmount(parseFloat(e.target.value) || 0)} className="inp" style={{ fontSize: 16, fontWeight: 700 }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[20, 50, 100, 200, 500].map(v => (
                    <button key={v} onClick={() => setQAmount(v)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${qAmount === v ? "var(--border-acc)" : "var(--border)"}`, background: qAmount === v ? "var(--badge-bg)" : "none", color: qAmount === v ? "var(--primary)" : "var(--text-muted)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>R${v}</button>
                  ))}
                </div>
                {qErr && <div style={{ padding: "8px 12px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>{qErr}</div>}
                <button onClick={confirmQuickTrade} disabled={qBusy || qAmount <= 0 || qAmount > (user.balance ?? 0)}
                  className={`btn ${quick.side === "SIM" ? "btn-yes" : "btn-no"}`} style={{ padding: 13, fontSize: 14, opacity: qBusy ? .6 : 1 }}>
                  {qBusy ? t.processing : `${t.bet} R$${qAmount} em ${quick.side === "SIM" ? t.yes : t.no}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
