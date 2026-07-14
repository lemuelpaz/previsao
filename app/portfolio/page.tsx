"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/lib/lang";

const fmtR = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface User     { balance: number; name: string | null; phone: string; }
interface Outcome  { id: string; label: string; probability: number; }
interface Market   { id: string; title: string; emoji: string; status: string; resolution: string | null; }
interface Position { id: string; shares: number; avgPrice: number; status: string; pnl: number; market: Market; outcome: Outcome; createdAt: string; }
interface Tx       { id: string; type: string; amount: number; detail: string | null; createdAt: string; }

const TX_COLOR: Record<string,string> = { buy:"var(--red)", win:"var(--yes)", bonus:"var(--yes)", deposit:"var(--yes)" };

export default function PortfolioPage() {
  const router = useRouter();
  const { t }  = useLang();
  const TX_LABEL: Record<string,string> = { buy: t.bet, win: t.won, bonus: "Bônus", deposit: "Depósito" };
  const [user,      setUser]      = useState<User | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [txs,       setTxs]       = useState<Tx[]>([]);
  const [tab,       setTab]       = useState<"positions"|"history">("positions");
  const [modal,          setModal]          = useState<null | "deposit" | "withdraw">(null);
  const [depositMethod,  setDepositMethod]  = useState<"pix"|"stripe"|"paypal"|"mbway"|"multibanco">("pix");
  const [depositAmount,  setDepositAmount]  = useState(100);
  const [depositPhone,   setDepositPhone]   = useState("");
  const [depositResult,  setDepositResult]  = useState<{ pixCode?: string; pixQRCode?: string; fee?: number; mbway?: boolean } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [withdrawKey,    setWithdrawKey]    = useState("");
  const [withdrawKeyType,setWithdrawKeyType]= useState("CPF");
  const [withdrawDone,   setWithdrawDone]   = useState(false);
  const [loadingPay,     setLoadingPay]     = useState(false);
  const [payError,       setPayError]       = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
    }).catch(() => {});
    fetch("/api/portfolio").then(r => r.json()).then(d => {
      setUser(d.user ?? null);
      setPositions(d.positions ?? []);
      setTxs(d.transactions ?? []);
    }).catch(() => {});
  }, [router]);

  async function doDeposit() {
    setLoadingPay(true); setPayError("");
    if (depositMethod === "stripe" || depositMethod === "multibanco") {
      const res = await fetch("/api/payments/stripe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount, method: depositMethod === "multibanco" ? "multibanco" : "card" }),
      });
      const d = await res.json();
      setLoadingPay(false);
      if (!res.ok) { setPayError(d.error ?? "Erro ao iniciar pagamento"); return; }
      window.location.href = d.url;
      return;
    }
    if (depositMethod === "paypal") {
      const res = await fetch("/api/payments/paypal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const d = await res.json();
      setLoadingPay(false);
      if (!res.ok) { setPayError(d.error ?? "Erro ao iniciar PayPal"); return; }
      window.location.href = d.approveUrl;
      return;
    }
    if (depositMethod === "mbway") {
      const res = await fetch("/api/payments/mbway", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount, phone: depositPhone }),
      });
      const d = await res.json();
      setLoadingPay(false);
      if (!res.ok) { setPayError(d.error ?? "Erro ao iniciar MB WAY"); return; }
      setDepositResult({ mbway: true });
      return;
    }
    const res = await fetch("/api/payments/deposit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: depositAmount }),
    });
    const d = await res.json();
    setLoadingPay(false);
    if (!res.ok) { setPayError(d.error ?? "Erro ao gerar PIX"); return; }
    setDepositResult({ pixCode: d.pixCode, pixQRCode: d.pixQRCode, fee: d.fee });
  }

  async function doWithdraw() {
    setLoadingPay(true); setPayError("");
    const res = await fetch("/api/payments/withdraw", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: withdrawAmount, pixKey: withdrawKey, pixKeyType: withdrawKeyType }),
    });
    const d = await res.json();
    setLoadingPay(false);
    if (!res.ok) { setPayError(d.error ?? "Erro ao processar saque"); return; }
    setWithdrawDone(true);
    setUser(u => u ? { ...u, balance: u.balance - withdrawAmount } : u);
  }

  const open   = positions.filter(p => p.status === "open");
  const closed = positions.filter(p => p.status !== "open");
  const pnlTotal = closed.reduce((s, p) => s + (p.pnl ?? 0), 0);
  const curVal   = open.reduce((s, p) => s + p.shares * (p.outcome.probability / 100), 0);

  if (!user) return null;

  return (
    <>
      <Navbar balance={user.balance} role={undefined} userName={user.name ?? user.phone} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* Balance card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 40, flexWrap: "wrap" }}>
          {[
            { label: t.availableBalance,   val: fmtR(user.balance),  color: "var(--primary)" },
            { label: t.openValue,          val: fmtR(curVal),        color: "var(--text)" },
            { label: t.realizedPL,         val: fmtR(pnlTotal),      color: pnlTotal >= 0 ? "var(--yes)" : "var(--red)" },
            { label: t.openPositions,      val: String(open.length), color: "var(--text)" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Payment buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => setModal("deposit")} style={{ flex: 1, padding: "11px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {t.deposit}
          </button>
          <button onClick={() => setModal("withdraw")} style={{ flex: 1, padding: "11px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {t.withdraw}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", width: "fit-content" }}>
          {(["positions","history"] as const).map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)} style={{
              padding: "8px 20px", background: tab === tabKey ? "var(--surface2)" : "none",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              color: tab === tabKey ? "var(--primary)" : "var(--text-muted)", transition: "all .15s",
            }}>
              {tabKey === "positions" ? `${t.positions} (${positions.length})` : t.history}
            </button>
          ))}
        </div>

        {tab === "positions" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {positions.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                {t.noPositions} <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{t.seeMarkets}</button>
              </div>
            ) : positions.map(p => {
              const curPrice  = p.outcome.probability / 100;
              const curValue  = p.shares * curPrice;
              const cost      = p.shares * p.avgPrice;
              const unrealPnl = curValue - cost;
              const isOpen    = p.status === "open";
              return (
                <div key={p.id} onClick={() => router.push(`/market/${p.market.id}`)}
                  style={{ background: "var(--surface)", border: `1px solid ${p.status === "won" ? "var(--border-acc)" : p.status === "lost" ? "rgba(255,68,68,.2)" : "var(--border)"}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "border .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(154,255,0,.2)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = p.status === "won" ? "var(--border-acc)" : p.status === "lost" ? "rgba(255,68,68,.2)" : "var(--border)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{p.market.emoji}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{p.market.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {t.betIn} <strong style={{ color: p.outcome.label === "SIM" ? "var(--yes)" : "var(--no)" }}>{p.outcome.label === "SIM" ? t.yes : t.no}</strong>
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{p.shares.toFixed(2)} {t.sharesLbl}</span>
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.avgPriceLbl} {(p.avgPrice * 100).toFixed(0)}¢</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {isOpen ? (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 700, color: unrealPnl >= 0 ? "var(--yes)" : "var(--red)" }}>
                            {unrealPnl >= 0 ? "+" : ""}{fmtR(unrealPnl)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{t.unrealizedPL}</div>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, fontWeight: 700, textTransform: "uppercase", background: p.status === "won" ? "var(--badge-bg)" : "rgba(255,68,68,.1)", color: p.status === "won" ? "var(--primary)" : "var(--red)", border: `1px solid ${p.status === "won" ? "var(--border-acc)" : "rgba(255,68,68,.25)"}` }}>
                          {p.status === "won" ? `${t.won} +${fmtR(p.pnl ?? 0)}` : t.lost}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {txs.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-dim)" }}>{t.noHistory}</div>
            ) : txs.map(tx => (
              <div key={tx.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{TX_LABEL[tx.type] ?? tx.type}</div>
                  {tx.detail && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{tx.detail}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tx.amount >= 0 ? "var(--yes)" : "var(--red)" }}>
                    {tx.amount >= 0 ? "+" : ""}{fmtR(tx.amount)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{new Date(tx.createdAt).toLocaleString("pt-BR")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Deposit Modal ── */}
      {modal === "deposit" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Depositar</span>
              <button onClick={() => { setModal(null); setDepositResult(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            {!depositResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Payment method selector */}
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Método de pagamento</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {([
                      { id: "pix",        label: "PIX",        sub: "Brasil",       color: "var(--primary)" },
                      { id: "stripe",     label: "Stripe",     sub: "Cartão",       color: "#635bff" },
                      { id: "paypal",     label: "PayPal",     sub: "Internacional", color: "#0070ba" },
                      { id: "mbway",      label: "MB WAY",     sub: "Portugal",     color: "#d80c73" },
                      { id: "multibanco", label: "Multibanco", sub: "Portugal",     color: "#004a99" },
                    ] as const).map(m => (
                      <button key={m.id} onClick={() => setDepositMethod(m.id)} style={{
                        padding: "10px 6px", borderRadius: 8, border: `1px solid ${depositMethod === m.id ? m.color : "var(--border)"}`,
                        background: depositMethod === m.id ? `${m.color}18` : "var(--surface)",
                        cursor: "pointer", transition: "all .15s",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: depositMethod === m.id ? m.color : "var(--text)" }}>{m.label}</span>
                        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{m.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    {depositMethod === "pix" ? "Valor (R$)" : depositMethod === "mbway" || depositMethod === "multibanco" ? "Valor (€)" : "Valor (USD)"}
                  </label>
                  <input type="number" min={depositMethod === "pix" ? 10 : 1} value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                    className="inp" style={{ fontSize: 18, fontWeight: 700 }} />
                </div>
                {depositMethod === "mbway" && (
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Telemóvel</label>
                    <input value={depositPhone} onChange={e => setDepositPhone(e.target.value)} className="inp" placeholder="912345678" />
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(depositMethod === "pix" ? [50, 100, 200, 500, 1000] : [5, 10, 20, 50, 100]).map(v => (
                    <button key={v} onClick={() => setDepositAmount(v)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${depositAmount === v ? "var(--border-acc)" : "var(--border)"}`, background: depositAmount === v ? "var(--badge-bg)" : "none", color: depositAmount === v ? "var(--primary)" : "var(--text-muted)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                      {depositMethod === "pix" ? `R$${v}` : depositMethod === "mbway" || depositMethod === "multibanco" ? `€${v}` : `$${v}`}
                    </button>
                  ))}
                </div>
                {payError && <div style={{ padding: "8px 12px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>{payError}</div>}
                <button onClick={doDeposit} disabled={loadingPay || depositAmount < (depositMethod === "pix" ? 10 : 1) || (depositMethod === "mbway" && depositPhone.replace(/\D/g, "").length < 9)}
                  style={{
                    padding: "13px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    opacity: loadingPay ? .6 : 1,
                    background: depositMethod === "stripe" ? "#635bff" : depositMethod === "paypal" ? "#0070ba" : depositMethod === "mbway" ? "#d80c73" : depositMethod === "multibanco" ? "#004a99" : "var(--primary)",
                    color: "#fff",
                  }}>
                  {loadingPay
                    ? "Aguarde..."
                    : depositMethod === "pix"
                      ? `Gerar PIX — R$${depositAmount}`
                      : depositMethod === "stripe"
                        ? `Pagar com Stripe — $${depositAmount}`
                        : depositMethod === "paypal"
                          ? `Pagar com PayPal — $${depositAmount}`
                          : depositMethod === "mbway"
                            ? `Pagar com MB WAY — €${depositAmount}`
                            : `Gerar referência Multibanco — €${depositAmount}`
                  }
                </button>
              </div>
            ) : depositResult.mbway ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", textAlign: "center" }}>
                <div style={{ fontSize: 34 }}>📲</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Notificação enviada!</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Abra o app MB WAY no seu telemóvel e aprove o pagamento. Tem 4 minutos para confirmar.</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>
                  Saldo creditado automaticamente após confirmação do pagamento
                </div>
                <button onClick={() => { setModal(null); setDepositResult(null); }} style={{ width: "100%", padding: "11px", background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Fechar
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>PIX gerado com sucesso!</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Escaneie o QR Code ou copie o código</div>
                </div>

                {depositResult.pixQRCode && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "2px solid var(--border-acc)" }}>
                    <img
                      src={depositResult.pixQRCode}
                      alt="PIX QR Code"
                      style={{ width: 220, height: 220, display: "block" }}
                    />
                  </div>
                )}

                {depositResult.fee !== undefined && depositResult.fee > 0 && (
                  <div style={{ fontSize: 11, color: "var(--text-dim)", background: "var(--surface3)", borderRadius: 6, padding: "4px 12px" }}>
                    Taxa: R$ {depositResult.fee.toFixed(2)}
                  </div>
                )}

                {depositResult.pixCode && (
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 5 }}>PIX Copia e Cola</div>
                    <div
                      style={{ background: "var(--surface3)", borderRadius: 8, padding: "10px 12px", fontSize: 10.5, color: "var(--text-muted)", wordBreak: "break-all", cursor: "pointer", border: "1px solid var(--border)", lineHeight: 1.5 }}
                      onClick={() => {
                        navigator.clipboard.writeText(depositResult!.pixCode!);
                      }}
                    >
                      {depositResult.pixCode}
                      <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 8, fontWeight: 600 }}>📋 Toque para copiar</div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", lineHeight: 1.5 }}>
                  Saldo creditado automaticamente após confirmação do pagamento
                </div>
                <button onClick={() => { setModal(null); setDepositResult(null); }} style={{ width: "100%", padding: "11px", background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Withdraw Modal ── */}
      {modal === "withdraw" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Sacar via PIX</span>
              <button onClick={() => { setModal(null); setWithdrawDone(false); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            {!withdrawDone ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Valor (R$)</label>
                  <input type="number" min={20} max={user.balance} value={withdrawAmount} onChange={e => setWithdrawAmount(parseFloat(e.target.value) || 0)} className="inp" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Tipo de Chave PIX</label>
                  <select value={withdrawKeyType} onChange={e => setWithdrawKeyType(e.target.value)} className="inp">
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="EVP">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Chave PIX</label>
                  <input value={withdrawKey} onChange={e => setWithdrawKey(e.target.value)} className="inp" placeholder="Digite sua chave PIX" />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Saldo disponível: {fmtR(user.balance)}</div>
                {payError && <div style={{ padding: "8px 12px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>{payError}</div>}
                <button onClick={doWithdraw} disabled={loadingPay || withdrawAmount < 20 || !withdrawKey} style={{ padding: "13px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loadingPay ? .6 : 1 }}>
                  {loadingPay ? "Processando..." : `Sacar R$${withdrawAmount}`}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Saque solicitado!</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>O valor será enviado para sua chave PIX em até 1 dia útil.</div>
                <button onClick={() => { setModal(null); setWithdrawDone(false); }} style={{ padding: "10px 24px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fechar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
