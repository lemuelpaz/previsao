"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang";

export default function RegisterPage() {
  const router = useRouter();
  const { t }  = useLang();
  const [form,    setForm]    = useState({ phone: "", name: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError(t.passwordMismatch); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone, name: form.name, password: form.password }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error ?? "Erro ao cadastrar"); return; }
    router.push("/");
    router.refresh();
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, fontWeight: 900, color: "#000" }}>P</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>{t.registerTitle}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.bonus}</div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: t.phoneLbl,         key: "phone",    type: "text",     ph: t.phonePh },
            { label: t.nameLbl,          key: "name",     type: "text",     ph: t.namePh },
            { label: t.passwordLbl,      key: "password", type: "password", ph: t.passwordPh },
            { label: t.passwordConfirm,  key: "confirm",  type: "password", ph: t.passwordConfirmPh },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input placeholder={f.ph} type={f.type} value={form[f.key as keyof typeof form]} onChange={set(f.key as keyof typeof form)} required={f.key !== "name"} className="inp" />
            </div>
          ))}

          {error && <div style={{ padding: "10px 14px", background: "rgba(255,68,68,.08)", border: "1px solid rgba(255,68,68,.25)", borderRadius: 8, fontSize: 13, color: "var(--red)" }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-yes" style={{ marginTop: 4, padding: "13px", fontSize: 14, width: "100%", opacity: loading ? .6 : 1 }}>
            {loading ? t.registering : t.registerBtn}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            {t.haveAccount}{" "}
            <button type="button" onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {t.enterBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
