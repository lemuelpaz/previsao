"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Candlestick from "@/components/Candlestick";
import { useLang } from "@/lib/lang";
import { CAT_KEY } from "@/lib/translations";
import type { Candle } from "@/lib/candle";

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
  const [user,     setUser]     = useState<User | null>(null);
  const [rows,     setRows]     = useState<Ticker[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [q,        setQ]        = useState("");
  const [cat,      setCat]      = useState("Todos");
  const [sortKey,  setSortKey]  = useState<SortKey>("volume");
  const [sortDir,  setSortDir]  = useState<1 | -1>(-1);
  const [quick,    setQuick]    = useState<{ market: Ticker; side: "SIM" | "NÃO" } | null>(null);
  const [qAmount,  setQAmount]  = useState(50);
  const [qBusy,    setQBusy]    = useState(false);
  const [qErr,     setQErr]     = useState("");

  // ── Terminal (painel expandido) ──
  const [selected,     setSelected]     = useState<Ticker | null>(null);
  const [candles,      setCandles]      = useState<Candle[]>([]);
  const [candlesLoad,  setCandlesLoad]  = useState(false);
  const [termSide,     setTermSide]     = useState<"SIM" | "NÃO">("SIM");
  const [termAmount,   setTermAmount]   = useState(50);
  const [termBusy,     setTermBusy]     = useState(false);
  const [termErr,      setTermErr]      = useState("");

  const loadTicker = useCallback(() => {
    fetch("/api/markets/ticker").then(r => r.json()).then(d => {
      const list: Ticker[] = d.ticker ?? [];
      setRows(list);
      setLoading(false);
      setSelected(cur => cur ? list.find(m => m.id === cur.id) ?? cur : cur);
    }).catch(() => setLoading(false));
  }, []);

  const loadCandles = useCallback((market: Ticker) => {
    if (!market.yesOutcomeId) { setCandles([]); return; }
    setCandlesLoad(true);
    fetch(`/api/markets/${market.id}/candles?outcomeId=${market.yesOutcomeId}`)
      .then(r => r.json()).then(d => setCandles(d.candles ?? []))
      .finally(() => setCandlesLoad(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    loadTicker();
    const iv = setInterval(loadTicker, REFRESH_MS);
    return () => clearInterval(iv);
  }, [loadTicker]);

  useEffect(() => {
    if (!selected) return;
    loadCandles(selected);
    const iv = setInterval(() => loadCandles(selected), REFRESH_MS);
    return () => clearInterval(iv);
  }, [selected?.id, loadCandles]); // eslint-disable-line react-hooks/exhaustive-deps

  function openTerminal(m: Ticker) {
    setSelected(m); setTermSide("SIM"); setTermAmount(50); setTermErr("");
  }

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

  async function confirmTerminalTrade() {
    if (!selected || !user) return;
    const outcomeId = termSide === "SIM" ? selected.yesOutcomeId : selected.noOutcomeId;
    if (!outcomeId) return;
    setTermBusy(true); setTermErr("");
    const res = await fetch(`/api/markets/${selected.id}/trade`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcomeId, amount: termAmount }),
    });
    const d = await res.json();
    setTermBusy(false);
    if (!res.ok) { setTermErr(d.error ?? "Erro ao negociar"); return; }
    setUser(u => u ? { ...u, balance: d.newBalance } : u);
    loadTicker();
    loadCandles(selected);
  }

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <th onClick={() => toggleSort(k)} style={{ padding: "10px 14px", textAlign: "right", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
      {label} {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  const TickerTable = ({ compact }: { compact: boolean }) => (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: compact ? 0 : 780 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Ativo</th>
              <SortHead label="Preço" k="yesPrice" />
              <SortHead label={compact ? "24h" : "Variação 24h"} k="change24h" />
              {!compact && <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Gráfico</th>}
              {!compact && <SortHead label={t.vol} k="volume" />}
              {!compact && <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .6 }}>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={compact ? 3 : 6} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{t.loading}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={compact ? 3 : 6} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>{t.noMarkets}</td></tr>
            ) : filtered.map(m => {
              const positive = m.change24h >= 0;
              const isSel = selected?.id === m.id;
              return (
                <tr key={m.id} onClick={() => openTerminal(m)}
                  style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background .15s", background: isSel ? "var(--badge-bg)" : "none" }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,.02)"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "none"; }}>
                  <td style={{ padding: compact ? "10px 12px" : "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: compact ? 16 : 20 }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: "var(--text)", maxWidth: compact ? 150 : 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        {!compact && <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{catLabel(m.category)}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: compact ? "10px 12px" : "12px 14px", textAlign: "right" }}>
                    <div style={{ fontSize: compact ? 12.5 : 14, fontWeight: 800, color: "var(--text)" }}>{m.yesPrice.toFixed(0)}¢</div>
                    {!compact && <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{t.yes}</div>}
                  </td>
                  <td style={{ padding: compact ? "10px 12px" : "12px 14px", textAlign: "right" }}>
                    <span style={{ fontSize: compact ? 11.5 : 13, fontWeight: 700, color: positive ? "var(--yes)" : "var(--no)" }}>
                      {positive ? "▲" : "▼"} {Math.abs(m.change24h).toFixed(1)}pp
                    </span>
                  </td>
                  {!compact && (
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Sparkline points={m.sparkline} positive={positive} />
                      </div>
                    </td>
                  )}
                  {!compact && <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, color: "var(--text-muted)" }}>{fmtK(m.volume)}</td>}
                  {!compact && (
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
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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

        {!selected ? (
          <TickerTable compact={false} />
        ) : (
          <div className="trader-layout">
            {/* Lista compacta */}
            <div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: "7px 12px", marginBottom: 10, width: "100%" }}>
                ← Ver lista completa
              </button>
              <TickerTable compact={true} />
            </div>

            {/* Terminal */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 26 }}>{selected.emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{selected.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{catLabel(selected.category)} · {t.vol} {fmtK(selected.volume)}</div>
                    </div>
                  </div>
                  <button onClick={() => router.push(`/market/${selected.id}`)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    Ver página completa →
                  </button>
                </div>

                <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--yes)" }}>{selected.yesPrice.toFixed(1)}¢</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{t.yes}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--no)" }}>{selected.noPrice.toFixed(1)}¢</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{t.no}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: selected.change24h >= 0 ? "var(--yes)" : "var(--no)" }}>
                      {selected.change24h >= 0 ? "▲" : "▼"} {Math.abs(selected.change24h).toFixed(1)}pp
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>24h</div>
                  </div>
                </div>

                {candlesLoad && candles.length === 0 ? (
                  <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-dim)" }}>{t.loading}</div>
                ) : (
                  <Candlestick candles={candles} />
                )}
              </div>

              {/* Painel de ordem */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {(["SIM", "NÃO"] as const).map(opt => {
                    const price = opt === "SIM" ? selected.yesPrice : selected.noPrice;
                    const active = termSide === opt;
                    return (
                      <button key={opt} onClick={() => setTermSide(opt)} style={{
                        padding: "12px 8px", borderRadius: 8, cursor: "pointer",
                        background: active ? (opt === "SIM" ? "rgba(154,255,0,.12)" : "rgba(255,68,68,.12)") : "var(--surface2)",
                        border: `2px solid ${active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--border)"}`,
                        transition: "all .15s",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--text-muted)" }}>{opt === "SIM" ? t.yes : t.no}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--text-dim)" }}>{price.toFixed(0)}¢</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>{t.amount}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {[20, 50, 100, 200, 500].map(v => (
                      <button key={v} onClick={() => setTermAmount(v)} style={{
                        padding: "5px 11px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                        background: termAmount === v ? "var(--badge-bg)" : "var(--surface2)",
                        border: `1px solid ${termAmount === v ? "var(--border-acc)" : "var(--border)"}`,
                        color: termAmount === v ? "var(--primary)" : "var(--text-muted)",
                      }}>R${v}</button>
                    ))}
                  </div>
                  <input type="number" min={1} value={termAmount} onChange={e => setTermAmount(parseFloat(e.target.value) || 0)} className="inp" style={{ fontSize: 15, fontWeight: 700 }} />
                </div>

                {termErr && <div style={{ padding: "8px 12px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{termErr}</div>}

                {!user ? (
                  <button onClick={() => router.push("/register")} style={{ width: "100%", padding: 13, background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    {t.signupFree}
                  </button>
                ) : (
                  <button onClick={confirmTerminalTrade} disabled={termBusy || termAmount <= 0 || termAmount > user.balance}
                    className={`btn ${termSide === "SIM" ? "btn-yes" : "btn-no"}`} style={{ width: "100%", padding: 13, fontSize: 14, opacity: termBusy ? .6 : 1 }}>
                    {termBusy ? t.processing : `${t.bet} R$${termAmount} em ${termSide === "SIM" ? t.yes : t.no}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Quick trade modal (compra rápida direto na lista) ── */}
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
