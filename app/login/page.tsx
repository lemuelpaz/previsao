"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang";

export default function LoginPage() {
  const router = useRouter();
  const { t }  = useLang();
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error ?? "Erro ao entrar"); return; }
    router.push(d.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, fontWeight: 900, color: "#000" }}>P</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Previsão</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.loginTitle}</div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t.userLbl}</label>
            <input placeholder={t.userPh} value={phone} onChange={e => setPhone(e.target.value)} required className="inp" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>{t.passwordLbl}</label>
            <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="inp" />
          </div>

          {error && <div style={{ padding: "10px 14px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.25)", borderRadius: 8, fontSize: 13, color: "var(--red)" }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-yes" style={{ marginTop: 4, padding: "13px", fontSize: 14, width: "100%", opacity: loading ? .6 : 1 }}>
            {loading ? t.loggingIn : t.loginBtn}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            {t.noAccount}{" "}
            <button type="button" onClick={() => router.push("/register")} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {t.createFree}
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-dim)", marginTop: -4 }}>
            Demo: <code style={{ color: "var(--text-muted)" }}>demo</code> / <code style={{ color: "var(--text-muted)" }}>demo123</code> — R$5.000 de saldo
          </div>
        </form>
      </div>
    </div>
  );
}
