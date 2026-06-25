"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtR = (v: unknown): string => {
  const n = Number(v);
  if (!isFinite(n)) return "R$ 0,00";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface Summary {
  totalDeposits: number; totalWithdraws: number; totalWins: number;
  totalBuyVolume: number; countDeposits: number; countWithdraws: number;
  totalUsers: number; totalMarkets: number; totalVolume: number; totalBalances: number;
}
interface Tx {
  id: string; type: string; amount: number; detail: string | null; createdAt: string;
  user: { id: string; phone: string; name: string | null };
}

const TYPE_LABEL: Record<string, string> = { buy: "Aposta", win: "Prêmio", deposit: "Depósito", withdraw: "Saque", bonus: "Bônus" };
const TYPE_COLOR: Record<string, string> = { buy: "var(--red)", win: "var(--yes)", deposit: "var(--yes)", withdraw: "var(--red)", bonus: "var(--yes)" };

function Card({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: color ?? "var(--text)", letterSpacing: -.5, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminFinancialPage() {
  const router  = useRouter();
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [txs,      setTxs]      = useState<Tx[]>([]);
  const [filter,   setFilter]   = useState("all");
  const [error,    setError]    = useState("");

  const loadData = (type = "all") => {
    fetch(`/api/admin/financial?type=${type}&limit=100`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(d => { setSummary(d.summary); setTxs(d.transactions ?? []); })
      .catch(e => setError(`Erro ao carregar dados financeiros (${e.message})`));
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
        loadData("all");
      }).catch(() => setError("Erro de conexão."));
  }, [router]);

  const applyFilter = (t: string) => { setFilter(t); loadData(t); };

  if (error) return (
    <div style={{ padding: 40 }}>
      <div style={{ padding: "12px 16px", background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>{error}</div>
    </div>
  );

  if (!summary) return <div style={{ padding: 40, color: "var(--text-muted)", fontSize: 13 }}>Carregando...</div>;

  const net = summary.totalDeposits - Math.abs(summary.totalWithdraws);

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Financeiro</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Visão consolidada de movimentações financeiras</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 10, marginBottom: 28 }}>
        <Card label="Total Depositado"    value={fmtR(summary.totalDeposits)}            color="var(--yes)"     sub={`${summary.countDeposits} depósitos`} />
        <Card label="Total Sacado"        value={fmtR(Math.abs(summary.totalWithdraws))} color="var(--red)"     sub={`${summary.countWithdraws} saques`} />
        <Card label="Prêmios Pagos"       value={fmtR(summary.totalWins)}                color="var(--primary)" />
        <Card label="Volume Negociado"    value={fmtR(summary.totalVolume)}              color="var(--text)" />
        <Card label="Saldo em Carteiras"  value={fmtR(summary.totalBalances)}            color="var(--text)"    sub={`${summary.totalUsers} usuários`} />
        <Card label="Resultado Líquido"   value={fmtR(net)}                              color={net >= 0 ? "var(--yes)" : "var(--red)"} />
      </div>

      <div style={{ display: "flex", gap: 1, background: "var(--surface2)", borderRadius: 7, border: "1px solid var(--border)", overflow: "hidden", width: "fit-content", marginBottom: 16 }}>
        {[
          { key: "all",      label: "Todas"     },
          { key: "deposit",  label: "Depósitos" },
          { key: "withdraw", label: "Saques"    },
          { key: "win",      label: "Prêmios"   },
          { key: "buy",      label: "Apostas"   },
        ].map(f => (
          <button key={f.key} onClick={() => applyFilter(f.key)} style={{
            padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 12,
            background: filter === f.key ? "var(--surface)" : "none",
            color: filter === f.key ? "var(--primary)" : "var(--text-muted)", transition: "all .12s",
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 100px 100px 130px", gap: 12 }}>
          {["Usuário / Detalhe", "Tipo", "Valor", "Data"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .8 }}>{h}</span>
          ))}
        </div>

        {txs.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>Sem registros para este filtro</div>}

        {txs.map(tx => (
          <div key={tx.id} style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 100px 100px 130px", gap: 12, alignItems: "center", transition: "background .12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{tx.user.name ?? tx.user.phone}</div>
              {tx.detail && <div style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.detail}</div>}
            </div>
            <span style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 5, fontWeight: 600, width: "fit-content",
              background: TYPE_COLOR[tx.type] === "var(--yes)" ? "rgba(154,255,0,.1)" : "rgba(255,68,68,.1)",
              color: TYPE_COLOR[tx.type] ?? "var(--text-muted)",
              border: `1px solid ${TYPE_COLOR[tx.type] === "var(--yes)" ? "var(--border-acc)" : "rgba(255,68,68,.25)"}`,
            }}>
              {TYPE_LABEL[tx.type] ?? tx.type}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TYPE_COLOR[tx.type] ?? "var(--text)" }}>
              {tx.amount >= 0 ? "+" : ""}{fmtR(tx.amount)}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {new Date(tx.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
