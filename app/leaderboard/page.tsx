"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/lib/lang";

const fmtR = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface User    { balance: number; name: string | null; phone: string; role: string; }
interface Trader  { id: string; name: string | null; phone: string; balance: number; _count: { positions: number }; }

const MEDAL = ["🥇","🥈","🥉"];

function censorName(raw: string): string {
  return raw.split(" ").map(word => {
    if (word.length <= 1) return word;
    return word[0] + "•".repeat(Math.min(word.length - 1, 5));
  }).join(" ");
}

export default function LeaderboardPage() {
  const router  = useRouter();
  const { t }   = useLang();
  const [user,    setUser]    = useState<User | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
    fetch("/api/leaderboard").then(r => r.json()).then(d => { setTraders(d.users ?? []); }).catch(() => {});
  }, [router]);

  return (
    <>
      <Navbar balance={user?.balance} role={user?.role} userName={user ? (user.name ?? user.phone) : undefined} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: -.5 }}>{t.rankTitle}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.rankSubtitle}</p>
        </div>

        {/* Top 3 podium */}
        {traders.length >= 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
            {[traders[1], traders[0], traders[2]].map((trader, i) => {
              const rank    = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = [160, 200, 140];
              const isMe    = !!user && (trader.phone === user.phone || trader.name === user.name);
              return (
                <div key={trader.id} style={{ background: rank === 1 ? "rgba(154,255,0,.08)" : "var(--surface)", border: `1px solid ${rank === 1 ? "var(--border-acc)" : "var(--border)"}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", height: heights[i], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ fontSize: 24 }}>{MEDAL[rank-1]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: rank === 1 ? "var(--primary)" : "var(--text)" }}>{isMe ? (trader.name ?? trader.phone) : censorName(trader.name ?? trader.phone)}</div>
                  <div style={{ fontSize: 12, color: rank === 1 ? "var(--yes)" : "var(--text-muted)", fontWeight: 700 }}>{fmtR(trader.balance)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{trader._count.positions} {t.bets}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{t.traderCol}</span>
            <div className="lb-cols">
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{t.betsCol}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{t.balanceCol}</span>
            </div>
          </div>
          {traders.map((trader, i) => {
            const isMe = !!user && (trader.phone === user.phone || trader.name === user.name);
            return (
              <div key={trader.id} style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: isMe ? "var(--badge-bg)" : "none", transition: "background .15s" }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = "rgba(255,255,255,.02)"; }}
                onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 700, minWidth: 24 }}>
                    {i < 3 ? MEDAL[i] : `#${i+1}`}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: isMe ? "var(--primary)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isMe ? "#000" : "var(--text-muted)", border: `1px solid ${isMe ? "var(--border-acc)" : "var(--border)"}` }}>
                    {(trader.name ?? trader.phone).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isMe ? "var(--primary)" : "var(--text)" }}>
                      {isMe ? (trader.name ?? trader.phone) : censorName(trader.name ?? trader.phone)} {isMe && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>({t.you})</span>}
                    </div>
                  </div>
                </div>
                <div className="lb-cols">
                  <span style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "right", minWidth: 40 }}>{trader._count.positions}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isMe ? "var(--primary)" : "var(--text)", minWidth: 100, textAlign: "right" }}>{fmtR(trader.balance)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
