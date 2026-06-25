"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtR = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface Outcome { id: string; label: string; probability: number; }
interface Market  {
  id: string; title: string; category: string; emoji: string; status: string;
  description: string | null; volume: number; endsAt: string | null; resolution: string | null;
  outcomes: Outcome[];
  _count: { positions: number };
}

const CATEGORIES = ["Crypto","Esportes","Política","Economia","Tech","Geral"];
const STATUS_COLOR: Record<string,string> = { open: "var(--yes)", closed: "#f5a623", resolved: "var(--text-dim)" };

const inp: React.CSSProperties = {
  padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none", width: "100%",
  fontFamily: "'Inter', sans-serif",
};

const BLANK = { title: "", description: "", category: "Crypto", emoji: "🔮", endsAt: "", yesProb: 50 };

export default function AdminMarketsPage() {
  const router = useRouter();
  const [markets,  setMarkets]  = useState<Market[]>([]);
  const [filter,   setFilter]   = useState<"all"|"open"|"closed"|"resolved">("all");
  const [showForm, setShowForm] = useState(false);
  const [editMkt,  setEditMkt]  = useState<Market | null>(null);
  const [resolveId, setResolveId]     = useState<string | null>(null);
  const [resolveLabel, setResolveLabel] = useState("SIM");
  const [form,     setForm]     = useState(BLANK);
  const [msg,      setMsg]      = useState<{ text: string; ok: boolean } | null>(null);
  const [search,   setSearch]   = useState("");

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const load = () => fetch("/api/admin/markets").then(r => r.json()).then(d => setMarkets(d.markets ?? []));

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
      load();
    });
  }, [router]);

  const action = async (marketId: string, act: string, extra?: Record<string,string|number>) => {
    const r = await fetch("/api/admin/markets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act, marketId, ...extra }),
    });
    if (r.ok) { load(); flash(`"${act}" executado com sucesso.`); }
    else { const d = await r.json(); flash(d.error ?? "Erro.", false); }
  };

  const save = async () => {
    if (!form.title.trim()) { flash("Título é obrigatório.", false); return; }
    const isEdit = !!editMkt;
    const body = isEdit
      ? { action: "edit", marketId: editMkt!.id, ...form }
      : form;
    const r = await fetch("/api/admin/markets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      load(); setShowForm(false); setEditMkt(null); setForm(BLANK);
      flash(isEdit ? "Mercado atualizado!" : "Mercado criado!");
    } else { const d = await r.json(); flash(d.error ?? "Erro.", false); }
  };

  const openEdit = (m: Market) => {
    setEditMkt(m);
    setForm({ title: m.title, description: m.description ?? "", category: m.category, emoji: m.emoji, endsAt: m.endsAt ? m.endsAt.slice(0, 10) : "", yesProb: m.outcomes.find(o => o.label === "SIM")?.probability ?? 50 });
    setShowForm(true);
  };

  const visible = markets
    .filter(m => filter === "all" || m.status === filter)
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Previsões</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{markets.length} mercados cadastrados</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setEditMkt(null); setForm(BLANK); }}
          style={{ padding: "9px 20px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Nova Previsão
        </button>
      </div>

      {/* Flash */}
      {msg && (
        <div style={{ padding: "10px 16px", background: msg.ok ? "var(--badge-bg)" : "rgba(255,68,68,.1)", border: `1px solid ${msg.ok ? "var(--border-acc)" : "rgba(255,68,68,.3)"}`, borderRadius: 8, color: msg.ok ? "var(--primary)" : "var(--red)", fontSize: 13, marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "22px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {editMkt ? `Editar: ${editMkt.title.slice(0,40)}` : "Criar Nova Previsão"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Título *</label>
              <input style={inp} placeholder="Ex: Bitcoin vai superar R$500k em 2025?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Descrição</label>
              <textarea style={{ ...inp, height: 68, resize: "vertical" }} placeholder="Descreva o mercado e critérios de resolução..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Categoria</label>
              <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Emoji</label>
              <input style={inp} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Probabilidade SIM inicial ({form.yesProb}%)</label>
              <input type="range" min={1} max={99} value={form.yesProb} onChange={e => setForm(f => ({ ...f, yesProb: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--primary)" }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Data de encerramento</label>
              <input type="date" style={inp} value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save}
              style={{ padding: "9px 24px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {editMkt ? "Salvar alterações" : "Criar Previsão"}
            </button>
            <button onClick={() => { setShowForm(false); setEditMkt(null); setForm(BLANK); }}
              style={{ padding: "9px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 1, background: "var(--surface2)", borderRadius: 7, border: "1px solid var(--border)", overflow: "hidden" }}>
          {(["all","open","closed","resolved"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "6px 14px", border: "none", cursor: "pointer", fontSize: 12,
              background: filter === s ? "var(--surface)" : "none",
              color: filter === s ? "var(--primary)" : "var(--text-muted)", transition: "all .12s",
            }}>
              {{ all:"Todos", open:"Abertos", closed:"Fechados", resolved:"Resolvidos" }[s]}
            </button>
          ))}
        </div>
        <input placeholder="Buscar previsão..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, width: 200, padding: "6px 12px" }} />
        <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>{visible.length} resultado{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {visible.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>Nenhuma previsão encontrada</div>}
        {visible.map(m => {
          const yes = m.outcomes.find(o => o.label === "SIM") ?? m.outcomes[0];
          const no  = m.outcomes.find(o => o.label === "NÃO") ?? m.outcomes[1];
          return (
            <div key={m.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.emoji}</span>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{m.title}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: STATUS_COLOR[m.status] ?? "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>{m.status}</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{m.category}</span>
                  <span style={{ fontSize: 10, color: "var(--yes)", fontWeight: 600 }}>SIM {yes?.probability.toFixed(0)}%</span>
                  <span style={{ fontSize: 10, color: "var(--no)",  fontWeight: 600 }}>NÃO {no?.probability.toFixed(0)}%</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{m._count.positions} posições · {fmtR(m.volume)} vol.</span>
                  {m.resolution && <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 600 }}>✓ {m.resolution}</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => openEdit(m)}
                  style={{ padding: "5px 11px", background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>
                  Editar
                </button>
                {m.status === "open" && (
                  <button onClick={() => action(m.id, "close")}
                    style={{ padding: "5px 11px", background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>
                    Fechar
                  </button>
                )}
                {m.status === "closed" && (
                  <button onClick={() => action(m.id, "reopen")}
                    style={{ padding: "5px 11px", background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>
                    Reabrir
                  </button>
                )}
                {m.status !== "resolved" && (
                  <button onClick={() => { setResolveId(m.id); setResolveLabel(m.outcomes[0]?.label ?? "SIM"); }}
                    style={{ padding: "5px 11px", background: "var(--badge-bg)", border: "1px solid var(--border-acc)", borderRadius: 5, color: "var(--primary)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                    Resolver
                  </button>
                )}
                <button onClick={() => { if (confirm("Excluir esta previsão?")) action(m.id, "delete"); }}
                  style={{ padding: "5px 11px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.25)", borderRadius: 5, color: "var(--red)", fontSize: 11, cursor: "pointer" }}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve modal */}
      {resolveId && (() => {
        const mkt = markets.find(m => m.id === resolveId);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,.8)" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Resolver Previsão</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>{mkt?.title}</div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Resultado correto</label>
              <select style={{ ...inp, marginBottom: 12 }} value={resolveLabel} onChange={e => setResolveLabel(e.target.value)}>
                {mkt?.outcomes.map(o => <option key={o.id} value={o.label}>{o.label} ({o.probability.toFixed(0)}%)</option>)}
              </select>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.5 }}>
                Vencedores recebem R$1,00 por cota apostada. Ação irreversível.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { action(resolveId, "resolve", { resolution: resolveLabel }); setResolveId(null); }}
                  style={{ flex: 1, padding: "10px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Confirmar resolução
                </button>
                <button onClick={() => setResolveId(null)}
                  style={{ padding: "10px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
