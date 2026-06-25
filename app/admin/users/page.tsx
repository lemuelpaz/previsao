"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtR = (v: unknown): string => {
  const n = Number(v);
  if (!isFinite(n)) return "R$ 0,00";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface User {
  id: string; phone: string; name: string | null; role: string; balance: number; createdAt: string;
  _count: { positions: number; transactions: number };
}

const inp: React.CSSProperties = {
  padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none", width: "100%",
  fontFamily: "'Inter', sans-serif",
};

type Modal =
  | { type: "adjust"; user: User }
  | { type: "reset";  user: User }
  | { type: "create" }
  | null;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users,  setUsers]  = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState<Modal>(null);
  const [msg,    setMsg]    = useState<{ text: string; ok: boolean } | null>(null);
  const [error,  setError]  = useState("");

  const [adjAmount, setAdjAmount] = useState("");
  const [adjNote,   setAdjNote]   = useState("");
  const [newPass,   setNewPass]   = useState("");
  const [newUser,   setNewUser]   = useState({ phone: "", name: "", password: "", role: "user", balance: "0" });

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const load = () =>
    fetch("/api/admin/users")
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(d => setUsers(d.users ?? []))
      .catch(e => setError(`Erro ao carregar usuários (${e.message})`));

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
        load();
      });
  }, [router]);

  const action = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (r.ok) { load(); return true; }
    const d = await r.json(); flash(d.error ?? "Erro.", false); return false;
  };

  const setRole = async (userId: string, role: string) => {
    if (await action({ action: "set_role", userId, role })) flash(`Papel atualizado para ${role}.`);
  };

  const doDelete = async (userId: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Esta ação é irreversível.`)) return;
    if (await action({ action: "delete", userId })) flash("Usuário excluído.");
  };

  const doAdjust = async () => {
    const m = modal as { type: "adjust"; user: User };
    const amount = parseFloat(adjAmount.replace(",", "."));
    if (isNaN(amount)) { flash("Valor inválido.", false); return; }
    if (await action({ action: "adjust_balance", userId: m.user.id, amount, note: adjNote || undefined })) {
      flash(`Saldo ajustado em ${fmtR(amount)}.`); setModal(null); setAdjAmount(""); setAdjNote("");
    }
  };

  const doReset = async () => {
    const m = modal as { type: "reset"; user: User };
    if (!newPass.trim()) { flash("Senha não pode ser vazia.", false); return; }
    if (await action({ action: "reset_password", userId: m.user.id, newPassword: newPass })) {
      flash("Senha redefinida."); setModal(null); setNewPass("");
    }
  };

  const doCreate = async () => {
    if (!newUser.phone || !newUser.password) { flash("Telefone e senha são obrigatórios.", false); return; }
    if (await action({ action: "create", ...newUser, balance: parseFloat(newUser.balance) || 0 })) {
      flash("Usuário criado!"); setModal(null);
      setNewUser({ phone: "", name: "", password: "", role: "user", balance: "0" });
    }
  };

  const visible = users.filter(u =>
    !search ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  if (error) return (
    <div style={{ padding: 40 }}>
      <div style={{ padding: "12px 16px", background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>{error}</div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Usuários</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{users.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setModal({ type: "create" })}
          style={{ padding: "9px 20px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Novo Usuário
        </button>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", background: msg.ok ? "var(--badge-bg)" : "rgba(255,68,68,.1)", border: `1px solid ${msg.ok ? "var(--border-acc)" : "rgba(255,68,68,.3)"}`, borderRadius: 8, color: msg.ok ? "var(--primary)" : "var(--red)", fontSize: 13, marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, width: 280, padding: "7px 12px" }} />
      </div>

      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 90px 130px 70px 60px 1fr", gap: 12 }}>
          {["Usuário", "Papel", "Saldo", "Posições", "Txs", "Ações"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: .8 }}>{h}</span>
          ))}
        </div>

        {visible.length === 0 && !error && (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
            {users.length === 0 ? "Carregando..." : "Nenhum usuário encontrado"}
          </div>
        )}

        {visible.map(u => (
          <div key={u.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 90px 130px 70px 60px 1fr", gap: 12, alignItems: "center", transition: "background .12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: u.role === "admin" ? "var(--primary)" : "var(--text-muted)", flexShrink: 0 }}>
                {(u.name ?? u.phone).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{u.name ?? u.phone}</div>
                {u.name && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{u.phone}</div>}
              </div>
            </div>

            <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
              style={{ padding: "4px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, color: u.role === "admin" ? "var(--primary)" : "var(--text-muted)", fontSize: 12, cursor: "pointer", outline: "none" }}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{fmtR(u.balance)}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{u._count.positions}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{u._count.transactions}</span>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <button onClick={() => { setModal({ type: "adjust", user: u }); setAdjAmount(""); setAdjNote(""); }}
                style={{ padding: "4px 10px", background: "var(--badge-bg)", border: "1px solid var(--border-acc)", borderRadius: 5, color: "var(--primary)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                Saldo
              </button>
              <button onClick={() => { setModal({ type: "reset", user: u }); setNewPass(""); }}
                style={{ padding: "4px 10px", background: "none", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>
                Senha
              </button>
              <button onClick={() => doDelete(u.id, u.name ?? u.phone)}
                style={{ padding: "4px 10px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.25)", borderRadius: 5, color: "var(--red)", fontSize: 11, cursor: "pointer" }}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,.8)" }}>

            {modal.type === "adjust" && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Ajustar Saldo</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{modal.user.name ?? modal.user.phone} · atual: {fmtR(modal.user.balance)}</div>
                <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Valor (negativo para debitar)</label>
                <input style={{ ...inp, marginBottom: 10 }} placeholder="Ex: 100 ou -50" value={adjAmount} onChange={e => setAdjAmount(e.target.value)} />
                <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Motivo (opcional)</label>
                <input style={{ ...inp, marginBottom: 18 }} placeholder="Ex: Bônus de boas-vindas" value={adjNote} onChange={e => setAdjNote(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={doAdjust} style={{ flex: 1, padding: "10px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Aplicar</button>
                  <button onClick={() => setModal(null)} style={{ padding: "10px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                </div>
              </>
            )}

            {modal.type === "reset" && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Redefinir Senha</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{modal.user.name ?? modal.user.phone}</div>
                <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Nova senha</label>
                <input type="password" style={{ ...inp, marginBottom: 18 }} placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={doReset} style={{ flex: 1, padding: "10px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Redefinir</button>
                  <button onClick={() => setModal(null)} style={{ padding: "10px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                </div>
              </>
            )}

            {modal.type === "create" && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Criar Usuário</div>
                {[
                  { label: "Telefone *",           key: "phone",    type: "text",     ph: "Ex: 11999999999" },
                  { label: "Nome",                 key: "name",     type: "text",     ph: "Nome completo" },
                  { label: "Senha *",              key: "password", type: "password", ph: "Mínimo 6 caracteres" },
                  { label: "Saldo inicial (R$)",   key: "balance",  type: "number",   ph: "0" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>{f.label}</label>
                    <input type={f.type} style={inp} placeholder={f.ph}
                      value={(newUser as Record<string, string>)[f.key]}
                      onChange={e => setNewUser(u => ({ ...u, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Papel</label>
                  <select style={inp} value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={doCreate} style={{ flex: 1, padding: "10px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Criar</button>
                  <button onClick={() => setModal(null)} style={{ padding: "10px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
