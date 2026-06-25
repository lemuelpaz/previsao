"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/lib/lang";

const fmtR  = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK  = (v: number) => v >= 1000 ? `R$ ${(v/1000).toFixed(1)}k` : `R$ ${v.toFixed(0)}`;

interface User     { id: string; name: string | null; phone: string; role: string; balance: number; }
interface Outcome  { id: string; label: string; probability: number; shares: number; }
interface Comment  { id: string; text: string; createdAt: string; user: { id: string; name: string | null; phone: string }; }
interface Market   { id: string; title: string; description: string | null; category: string; emoji: string; status: string; resolution: string | null; volume: number; endsAt: string | null; resolvedAt: string | null; outcomes: Outcome[]; comments: Comment[]; _count: { positions: number }; }
interface Position { id: string; shares: number; avgPrice: number; status: string; pnl?: number; outcome: Outcome; }

function ProbBar({ outcomes }: { outcomes: Outcome[] }) {
  const { t } = useLang();
  const yes = outcomes.find(o => o.label === "SIM");
  const no  = outcomes.find(o => o.label === "NÃO");
  if (!yes || !no) return null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--yes)", letterSpacing: -1, lineHeight: 1 }}>{yes.probability.toFixed(1)}%</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{t.yes}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--no)", letterSpacing: -1, lineHeight: 1 }}>{no.probability.toFixed(1)}%</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{t.no}</div>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 8, overflow: "hidden", background: "var(--surface3)", display: "flex" }}>
        <div style={{ width: `${yes.probability}%`, background: "var(--yes)", transition: "width .4s" }} />
        <div style={{ width: `${no.probability}%`,  background: "var(--no)",  transition: "width .4s" }} />
      </div>
    </div>
  );
}

export default function MarketPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const { t }   = useLang();
  const [user,       setUser]       = useState<User | null>(null);
  const [market,     setMarket]     = useState<Market | null>(null);
  const [myPos,      setMyPos]      = useState<Position | null>(null);
  const [selected,   setSelected]   = useState<"SIM" | "NÃO">("SIM");
  const [amount,     setAmount]     = useState(50);
  const [trading,    setTrading]    = useState(false);
  const [tradeErr,   setTradeErr]   = useState("");
  const [comment,    setComment]    = useState("");
  const [commenting, setCommenting] = useState(false);

  const loadMarket = useCallback(() => {
    fetch(`/api/markets/${params.id}`).then(r => r.json()).then(d => {
      if (d.market) { setMarket(d.market); setMyPos(d.myPosition ?? null); }
    });
  }, [params.id]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    });
    loadMarket();
  }, [router, loadMarket]);

  async function trade() {
    if (!market || !user) return;
    setTradeErr(""); setTrading(true);
    const outcome = market.outcomes.find(o => o.label === selected);
    if (!outcome) return;
    const res = await fetch(`/api/markets/${market.id}/trade`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcomeId: outcome.id, amount }),
    });
    const d = await res.json();
    setTrading(false);
    if (!res.ok) { setTradeErr(d.error ?? "Erro ao apostar"); return; }
    setUser(u => u ? { ...u, balance: d.newBalance } : u);
    loadMarket();
  }

  async function sendComment() {
    if (!comment.trim()) return;
    setCommenting(true);
    await fetch(`/api/markets/${params.id}/comment`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });
    setComment("");
    setCommenting(false);
    loadMarket();
  }

  if (!market) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{t.loading}</div>
    </div>
  );

  const yesOutcome = market.outcomes.find(o => o.label === "SIM");
  const noOutcome  = market.outcomes.find(o => o.label === "NÃO");
  const selOutcome = market.outcomes.find(o => o.label === selected);
  const price      = selOutcome ? selOutcome.probability / 100 : 0.5;
  const shares     = price > 0 ? amount / price : 0;
  const potential  = shares;
  const canTrade   = !!user && market.status === "open" && !myPos && user.balance >= amount && amount > 0;
  const daysLeft   = market.endsAt ? Math.ceil((new Date(market.endsAt).getTime() - Date.now()) / 86400000) : null;

  return (
    <>
      <Navbar balance={user?.balance} role={user?.role} userName={user ? (user.name ?? user.phone) : undefined} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          {t.backToMarkets}
        </button>

        <div className="market-layout">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Market header */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{market.emoji}</div>
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{market.category}</span>
                    {market.status !== "open" && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, background: market.status === "resolved" ? "var(--badge-bg)" : "rgba(255,68,68,.1)", color: market.status === "resolved" ? "var(--primary)" : "var(--red)", border: `1px solid ${market.status === "resolved" ? "var(--border-acc)" : "rgba(255,68,68,.25)"}` }}>
                        {market.status === "resolved" ? `${t.resolved}: ${market.resolution}` : t.closed}
                      </span>
                    )}
                    {daysLeft !== null && daysLeft > 0 && market.status === "open" && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, color: "var(--text-dim)", border: "1px solid var(--border)" }}>{daysLeft}{t.daysLeft}</span>
                    )}
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{market.title}</h1>
                </div>
              </div>

              <ProbBar outcomes={market.outcomes} />

              <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                {[
                  { label: t.volume,     val: fmtK(market.volume) },
                  { label: t.bettors, val: String(market._count.positions) },
                  { label: `${t.yes} (preço)`, val: `${yesOutcome?.probability.toFixed(0) ?? "—"}¢` },
                  { label: `${t.no} (preço)`, val: `${noOutcome?.probability.toFixed(0) ?? "—"}¢` },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {market.description && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{t.resolutionRules}</div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{market.description}</p>
              </div>
            )}

            {/* My position */}
            {myPos && (
              <div style={{ background: "var(--surface)", border: `1px solid ${myPos.status === "won" ? "var(--border-acc)" : myPos.status === "lost" ? "rgba(255,68,68,.25)" : "var(--border)"}`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{t.myPosition}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: myPos.outcome.label === "SIM" ? "var(--yes)" : "var(--no)" }}>{myPos.outcome.label === "SIM" ? t.yes : t.no}</div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{t.betResult}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{myPos.shares.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{t.shares}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{(myPos.avgPrice * 100).toFixed(0)}¢</div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{t.avgPrice}</div>
                    </div>
                  </div>
                  {myPos.status !== "open" && (
                    <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, fontWeight: 700, textTransform: "uppercase", background: myPos.status === "won" ? "var(--badge-bg)" : "rgba(255,68,68,.1)", color: myPos.status === "won" ? "var(--primary)" : "var(--red)", border: `1px solid ${myPos.status === "won" ? "var(--border-acc)" : "rgba(255,68,68,.25)"}` }}>
                      {myPos.status === "won" ? `${t.won}! +${fmtR(myPos.pnl ?? 0)}` : t.lost}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.discussion}</span>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{market.comments.length} {t.comments}</span>
              </div>

              {/* Comment box */}
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10 }}>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder={t.shareAnalysis}
                  style={{ flex: 1, padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, resize: "none", outline: "none", height: 70, fontFamily: "'Inter', sans-serif" }} />
                <button onClick={sendComment} disabled={commenting || !comment.trim()} className="btn btn-yes" style={{ alignSelf: "flex-end", padding: "9px 16px", fontSize: 12, opacity: (!comment.trim() || commenting) ? .5 : 1 }}>
                  {commenting ? "..." : t.send}
                </button>
              </div>

              {/* Comments list */}
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {market.comments.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", fontSize: 13, color: "var(--text-dim)" }}>
                    {t.beFirst}
                  </div>
                ) : market.comments.map(c => (
                  <div key={c.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>
                        {(c.user.name ?? c.user.phone).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.user.name ?? c.user.phone}</span>
                      <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{new Date(c.createdAt).toLocaleString("pt-BR")}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, paddingLeft: 32 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Trade panel */}
          <div className="trade-sticky" style={{ position: "sticky", top: 70 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  {market.status === "open" ? t.bet : `Mercado ${market.status === "resolved" ? t.resolved : t.closed}`}
                </span>
              </div>

              {!user ? (
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>🔒</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.signupToBet}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Crie uma conta gratuita e comece a prever eventos do mundo real.</div>
                  <button onClick={() => router.push("/register")} style={{ padding: "11px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {t.signupFree}
                  </button>
                  <button onClick={() => router.push("/login")} style={{ padding: "9px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                    {t.alreadyHaveAccount}
                  </button>
                </div>
              ) : market.status === "open" && !myPos ? (
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* YES / NO toggle */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(["SIM","NÃO"] as const).map(opt => {
                      const out  = market.outcomes.find(o => o.label === opt);
                      const prob = out?.probability ?? 50;
                      const active = selected === opt;
                      return (
                        <button key={opt} onClick={() => setSelected(opt)} style={{
                          padding: "14px 8px", borderRadius: 8, cursor: "pointer",
                          background: active ? (opt === "SIM" ? "rgba(154,255,0,.12)" : "rgba(255,68,68,.12)") : "var(--surface2)",
                          border: `2px solid ${active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--border)"}`,
                          transition: "all .15s",
                        }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--text-muted)" }}>{opt === "SIM" ? t.yes : t.no}</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: active ? (opt === "SIM" ? "var(--yes)" : "var(--no)") : "var(--text-dim)", marginTop: 2 }}>{prob.toFixed(0)}¢</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount presets */}
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}>{t.amount}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {[20,50,100,200,500].map(v => (
                        <button key={v} onClick={() => setAmount(v)} style={{
                          padding: "5px 11px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                          background: amount === v ? "var(--badge-bg)" : "var(--surface2)",
                          border: `1px solid ${amount === v ? "var(--border-acc)" : "var(--border)"}`,
                          color: amount === v ? "var(--primary)" : "var(--text-muted)", transition: "all .15s",
                        }}>R${v}</button>
                      ))}
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)" }}>R$</span>
                      <input type="number" min={1} value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "10px 12px 10px 34px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "'Inter', sans-serif" }} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: t.sharesToReceive,  val: `${shares.toFixed(2)} ${t.sharesLbl}` },
                      { label: t.potentialGain, val: fmtR(potential), color: "var(--yes)" },
                      { label: t.yourBalanceLbl,         val: fmtR(user.balance) },
                    ].map(r => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{r.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: r.color ?? "var(--text)" }}>{r.val}</span>
                      </div>
                    ))}
                  </div>

                  {tradeErr && <div style={{ padding: "8px 12px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>{tradeErr}</div>}

                  <button onClick={trade} disabled={!canTrade || trading} className={`btn ${selected === "SIM" ? "btn-yes" : "btn-no"}`} style={{ padding: "13px", fontSize: 14, width: "100%", opacity: (!canTrade || trading) ? .5 : 1 }}>
                    {trading ? t.processing : `${t.bet} ${fmtR(amount)} em ${selected === "SIM" ? t.yes : t.no}`}
                  </button>

                  <div style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
                    {t.oneShareEq}
                  </div>
                </div>
              ) : myPos ? (
                <div style={{ padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{t.alreadyBet}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: myPos.outcome.label === "SIM" ? "var(--yes)" : "var(--no)" }}>{myPos.outcome.label === "SIM" ? t.yes : t.no}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{myPos.shares.toFixed(2)} {t.sharesLbl} a {(myPos.avgPrice * 100).toFixed(0)}¢</div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {market.status === "resolved" ? `${t.result}: ${market.resolution}` : t.betsClosed}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
