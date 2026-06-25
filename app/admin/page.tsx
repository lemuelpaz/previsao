"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtR = (v: unknown): string => {
  const n = Number(v);
  if (!isFinite(n)) return "R$ 0,00";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface Stats {
  totalUsers: number; totalMarkets: number; openMarkets: number;
  resolvedMarkets: number; totalVolume: number; totalPositions: number;
}
interface Tx {
  id: string; type: string; amount: number; detail: string | null; createdAt: string;
  user: { phone: string; name: string | null };
}

const TYPE_LABEL: Record<string, string> = { buy: "Aposta", win: "Prêmio", deposit: "Depósito", withdraw: "Saque", bonus: "Bônus" };
const TYPE_COLOR: Record<string, string> = { buy: "var(--red)", win: "var(--yes)", deposit: "var(--yes)", withdraw: "var(--red)", bonus: "var(--yes)" };

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color ?? "var(--text)", letterSpacing: -1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Tx[]>([]);
  const [error,  setError]  = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== "admin") {
          router.push("/");
          return;
        }
        Promise.all([
          fetch("/api/admin/stats").then(r => r.ok ? r.json() : Promise.reject(r.status)),
          fetch("/api/admin/financial?limit=10").then(r => r.ok ? r.json() : { transactions: [] }),
        ]).then(([statsData, txData]) => {
          setStats(statsData);
          setRecent(txData.transactions ?? []);
        }).catch(() => setError("Erro ao carregar dados do painel."));
      }).catch(() => setError("Erro de conexão."));
  }, [router]);

  if (error) return (
    <div style={{ padding: 40 }}>
      <div style={{ padding: "12px 16px", background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>{error}</div>
    </div>
  );

  if (!stats) return <div style={{ padding: 40, color: "var(--text-muted)", fontSize: 13 }}>Carregando...</div>;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Visão Geral</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Painel de administração da plataforma Previsão</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10, marginBottom: 28 }}>
        <StatCard label="Usuários"          value={stats.totalUsers}        color="var(--text)" />
        <StatCard label="Mercados Abertos"  value={stats.openMarkets}       color="var(--yes)" />
        <StatCard label="Resolvidos"        value={stats.resolvedMarkets}   color="var(--text-muted)" />
        <StatCard label="Posições Totais"   value={stats.totalPositions}    color="var(--text)" />
        <StatCard label="Volume Total"      value={fmtR(stats.totalVolume)} color="var(--primary)" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "+ Nova Previsão",      href: "/admin/markets",   primary: true },
          { label: "Mercado em Alta",      href: "/admin/trending" },
          { label: "Gerenciar Usuários",   href: "/admin/users" },
          { label: "Relatório Financeiro", href: "/admin/financial" },
          { label: "Configurar Gateway",   href: "/admin/gateway" },
        ].map(a => (
          <button key={a.href} onClick={() => router.push(a.href)}
            style={{ padding: "9px 18px", background: a.primary ? "var(--primary)" : "none", color: a.primary ? "#000" : "var(--text-muted)", border: a.primary ? "none" : "1px solid var(--border)", borderRadius: 7, fontSize: 12, fontWeight: a.primary ? 700 : 500, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { if (!a.primary) { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--primary)"; } }}
            onMouseLeave={e => { if (!a.primary) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; } }}>
            {a.label}
          </button>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Últimas Transações</div>
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {recent.length === 0 && <div style={{ padding: "24px", fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>Sem transações</div>}
          {recent.map(tx => (
            <div key={tx.id} style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>
                {(tx.user.name ?? tx.user.phone).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{tx.user.name ?? tx.user.phone}</div>
                {tx.detail && <div style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.detail}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TYPE_COLOR[tx.type] ?? "var(--text)" }}>
                  {tx.amount >= 0 ? "+" : ""}{fmtR(tx.amount)}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                  {TYPE_LABEL[tx.type] ?? tx.type} · {new Date(tx.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
