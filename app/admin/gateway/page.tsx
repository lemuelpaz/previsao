"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const inp: React.CSSProperties = {
  padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none", width: "100%",
  fontFamily: "'Inter', sans-serif", transition: "border .15s",
};

interface Config {
  // VeoPag
  gateway_enabled?:        string;
  gateway_name?:           string;
  gateway_api_key?:        string;
  gateway_secret_key?:     string;
  gateway_webhook_secret?: string;
  gateway_base_url?:       string;
  gateway_callback_url?:   string;
  gateway_pix_key?:        string;
  gateway_pix_type?:       string;
  gateway_min_deposit?:    string;
  gateway_max_deposit?:    string;
  gateway_min_withdraw?:   string;
  gateway_test_mode?:      string;
  // Stripe
  stripe_enabled?:          string;
  stripe_publishable_key?:  string;
  stripe_secret_key?:       string;
  stripe_webhook_secret?:   string;
  // PayPal
  paypal_enabled?:          string;
  paypal_client_id?:        string;
  paypal_client_secret?:    string;
  paypal_mode?:             string;
  // MB WAY
  mbway_enabled?:            string;
  mbway_key?:                string;
  mbway_antiphishing_key?:   string;
  mbway_min_deposit?:        string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,.02)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .8 }}>{title}</span>
      </div>
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, color = "var(--primary)" }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button onClick={() => onChange(!on)} type="button" style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: on ? color : "var(--surface3)", position: "relative", transition: "background .2s",
    }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 23 : 3, transition: "left .2s" }} />
    </button>
  );
}

type Tab = "veopag" | "stripe" | "paypal" | "mbway";

export default function AdminGatewayPage() {
  const router = useRouter();
  const [cfg,     setCfg]     = useState<Config>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [tab,     setTab]     = useState<Tab>("veopag");

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
      fetch("/api/admin/gateway").then(r => r.json()).then(d => {
        if (d.config) setCfg(d.config);
      });
    });
  }, [router]);

  const set = (key: keyof Config, value: string) => setCfg(c => ({ ...c, [key]: value }));
  const toggle = (key: string) => setShowKey(s => ({ ...s, [key]: !s[key] }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/gateway", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg),
      });
      if (r.ok) flash("Configurações salvas com sucesso!");
      else flash("Erro ao salvar.", false);
    } finally { setSaving(false); }
  };

  const SecretInput = ({ cfgKey, placeholder }: { cfgKey: keyof Config; placeholder?: string }) => (
    <div style={{ position: "relative" }}>
      <input type={showKey[cfgKey] ? "text" : "password"} style={{ ...inp, paddingRight: 36 }}
        placeholder={placeholder} value={cfg[cfgKey] ?? ""}
        onChange={e => set(cfgKey, e.target.value)}
        onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
        onBlur={e  => (e.target.style.borderColor = "var(--border)")}
      />
      <button onClick={() => toggle(cfgKey)} type="button" style={{
        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 14, lineHeight: 1,
      }}>
        {showKey[cfgKey] ? "🙈" : "👁"}
      </button>
    </div>
  );

  const TextInput = ({ cfgKey, placeholder, type = "text" }: { cfgKey: keyof Config; placeholder?: string; type?: string }) => (
    <input type={type} style={inp} placeholder={placeholder}
      value={cfg[cfgKey] ?? ""}
      onChange={e => set(cfgKey, e.target.value)}
      onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
      onBlur={e  => (e.target.style.borderColor = "var(--border)")}
    />
  );

  const TABS: { id: Tab; label: string; badge?: string }[] = [
    { id: "veopag",  label: "VeoPag PIX",  badge: cfg.gateway_enabled === "true" ? "ativo" : undefined },
    { id: "stripe",  label: "Stripe",      badge: cfg.stripe_enabled  === "true" ? "ativo" : undefined },
    { id: "paypal",  label: "PayPal",      badge: cfg.paypal_enabled  === "true" ? "ativo" : undefined },
    { id: "mbway",   label: "MB WAY",      badge: cfg.mbway_enabled   === "true" ? "ativo" : undefined },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 780 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Gateway de Pagamento</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Configure os provedores de pagamento — VeoPag (PIX), Stripe e PayPal</p>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", background: msg.ok ? "var(--badge-bg)" : "rgba(255,68,68,.1)", border: `1px solid ${msg.ok ? "var(--border-acc)" : "rgba(255,68,68,.3)"}`, borderRadius: 8, color: msg.ok ? "var(--primary)" : "var(--red)", fontSize: 13, marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 5 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "var(--surface)" : "none",
            color: tab === t.id ? "var(--text)" : "var(--text-muted)",
            boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,.3)" : "none",
            transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            {t.label}
            {t.badge && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "var(--badge-bg)", color: "var(--primary)", textTransform: "uppercase", letterSpacing: .5 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── VeoPag Tab ─────────────────────────── */}
      {tab === "veopag" && (
        <>
          <Section title="Status">
            <Field label="Gateway ativo" hint="Ativa ou desativa o processamento PIX">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggle on={cfg.gateway_enabled === "true"} onChange={v => set("gateway_enabled", v ? "true" : "false")} />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.gateway_enabled === "true" ? "var(--yes)" : "var(--text-muted)" }}>
                  {cfg.gateway_enabled === "true" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </Field>
            <Field label="Modo de teste" hint="Em sandbox, nenhuma cobrança real é efetuada">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggle on={cfg.gateway_test_mode === "true"} onChange={v => set("gateway_test_mode", v ? "true" : "false")} color="#f5a623" />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.gateway_test_mode === "true" ? "#f5a623" : "var(--text-muted)" }}>
                  {cfg.gateway_test_mode === "true" ? "Sandbox ativo" : "Produção"}
                </span>
              </div>
            </Field>
          </Section>

          <Section title="Credenciais VeoPag">
            <Field label="Nome do provedor">
              <TextInput cfgKey="gateway_name" placeholder="VeoPag" />
            </Field>
            <Field label="Client ID" hint="Chave pública de acesso à API VeoPag">
              <SecretInput cfgKey="gateway_api_key" placeholder="cli_xxxxxxxxxxxx" />
            </Field>
            <Field label="Client Secret" hint="Chave secreta — nunca compartilhe">
              <SecretInput cfgKey="gateway_secret_key" placeholder="xxxxxxxxxxxxxxxxxx" />
            </Field>
            <Field label="Webhook Secret" hint="Valida eventos recebidos do VeoPag">
              <SecretInput cfgKey="gateway_webhook_secret" placeholder="whsec_xxxxxxxxxxxx" />
            </Field>
            <Field label="URL base da API">
              <TextInput cfgKey="gateway_base_url" placeholder="https://api.veopag.com" />
            </Field>
          </Section>

          <Section title="URLs de Integração">
            <Field label="Callback URL" hint="Recebe notificações PIX">
              <TextInput cfgKey="gateway_callback_url" placeholder="https://seusite.com/api/payments/webhook" />
            </Field>
            <div style={{ padding: "10px 14px", background: "rgba(154,255,0,.05)", border: "1px solid var(--border-acc)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>URL de webhook sugerida</div>
              <code style={{ fontSize: 12, color: "var(--primary)", fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}/api/payments/webhook
              </code>
            </div>
          </Section>

          <Section title="Configuração PIX">
            <Field label="Chave PIX">
              <TextInput cfgKey="gateway_pix_key" placeholder="cnpj, email, telefone ou chave aleatória" />
            </Field>
            <Field label="Tipo da chave PIX">
              <select style={inp} value={cfg.gateway_pix_type ?? "cnpj"} onChange={e => set("gateway_pix_type", e.target.value)}>
                <option value="cnpj">CNPJ</option>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave aleatória (EVP)</option>
              </select>
            </Field>
            <Field label="Depósito mínimo (R$)">
              <TextInput cfgKey="gateway_min_deposit" placeholder="10" type="number" />
            </Field>
            <Field label="Depósito máximo (R$)">
              <TextInput cfgKey="gateway_max_deposit" placeholder="5000" type="number" />
            </Field>
            <Field label="Saque mínimo (R$)">
              <TextInput cfgKey="gateway_min_withdraw" placeholder="20" type="number" />
            </Field>
          </Section>
        </>
      )}

      {/* ── Stripe Tab ─────────────────────────── */}
      {tab === "stripe" && (
        <>
          <Section title="Status">
            <Field label="Stripe ativo" hint="Habilita pagamentos internacionais via cartão">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggle on={cfg.stripe_enabled === "true"} onChange={v => set("stripe_enabled", v ? "true" : "false")} color="#635bff" />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.stripe_enabled === "true" ? "#635bff" : "var(--text-muted)" }}>
                  {cfg.stripe_enabled === "true" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </Field>
          </Section>

          <Section title="Credenciais Stripe">
            <Field label="Publishable Key" hint="Chave pública — usada no frontend">
              <TextInput cfgKey="stripe_publishable_key" placeholder="pk_live_xxxxxxxxxxxx" />
            </Field>
            <Field label="Secret Key" hint="Chave secreta — nunca exponha ao cliente">
              <SecretInput cfgKey="stripe_secret_key" placeholder="sk_live_xxxxxxxxxxxx" />
            </Field>
            <Field label="Webhook Secret" hint="Valida eventos recebidos do Stripe">
              <SecretInput cfgKey="stripe_webhook_secret" placeholder="whsec_xxxxxxxxxxxx" />
            </Field>
          </Section>

          <Section title="Integração">
            <div style={{ padding: "10px 14px", background: "rgba(99,91,255,.06)", border: "1px solid rgba(99,91,255,.3)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>URL do webhook Stripe</div>
              <code style={{ fontSize: 12, color: "#635bff", fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}/api/payments/stripe/webhook
              </code>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, padding: "4px 0" }}>
              Configure este endpoint no Stripe Dashboard → Developers → Webhooks. Eventos necessários: <code style={{ fontSize: 11, color: "var(--text)", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4 }}>checkout.session.completed</code>, <code style={{ fontSize: 11, color: "var(--text)", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4 }}>checkout.session.async_payment_succeeded</code> e <code style={{ fontSize: 11, color: "var(--text)", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4 }}>checkout.session.async_payment_failed</code>
            </div>
            <div style={{ padding: "10px 14px", background: "rgba(99,91,255,.06)", border: "1px solid rgba(99,91,255,.3)", borderRadius: 6, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              O Multibanco usa as mesmas credenciais Stripe acima — é cobrado em EUR e confirmado de forma assíncrona (o cliente paga a referência depois, em até 7 dias).
            </div>
          </Section>
        </>
      )}

      {/* ── MB WAY Tab ─────────────────────────── */}
      {tab === "mbway" && (
        <>
          <Section title="Status">
            <Field label="MB WAY ativo" hint="Habilita depósitos via MB WAY (Portugal)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggle on={cfg.mbway_enabled === "true"} onChange={v => set("mbway_enabled", v ? "true" : "false")} color="#d80c73" />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.mbway_enabled === "true" ? "#d80c73" : "var(--text-muted)" }}>
                  {cfg.mbway_enabled === "true" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </Field>
          </Section>

          <Section title="Credenciais ifthenpay">
            <Field label="MB WAY Key" hint="Chave atribuída pela ifthenpay ao aderir ao MB WAY">
              <SecretInput cfgKey="mbway_key" placeholder="xxxx-xxxx-xxxx" />
            </Field>
            <Field label="Chave anti-phishing" hint="Opcional — valida a autenticidade do callback recebido">
              <SecretInput cfgKey="mbway_antiphishing_key" placeholder="xxxxxxxxxxxxxxxx" />
            </Field>
            <Field label="Depósito mínimo (€)">
              <TextInput cfgKey="mbway_min_deposit" placeholder="1" type="number" />
            </Field>
          </Section>

          <Section title="Integração">
            <div style={{ padding: "10px 14px", background: "rgba(216,12,115,.06)", border: "1px solid rgba(216,12,115,.3)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>URL de callback</div>
              <code style={{ fontSize: 12, color: "#d80c73", fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}/api/payments/mbway/webhook
              </code>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, padding: "4px 0" }}>
              Configure esta URL no backoffice da ifthenpay para o método MB WAY. O cliente recebe uma notificação push no app MB WAY e tem 4 minutos para aprovar o pagamento.
            </div>
          </Section>
        </>
      )}

      {/* ── PayPal Tab ─────────────────────────── */}
      {tab === "paypal" && (
        <>
          <Section title="Status">
            <Field label="PayPal ativo" hint="Habilita pagamentos via PayPal">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggle on={cfg.paypal_enabled === "true"} onChange={v => set("paypal_enabled", v ? "true" : "false")} color="#003087" />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.paypal_enabled === "true" ? "#0070ba" : "var(--text-muted)" }}>
                  {cfg.paypal_enabled === "true" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </Field>
            <Field label="Ambiente" hint="Sandbox para testes, Live para produção">
              <select style={inp} value={cfg.paypal_mode ?? "sandbox"} onChange={e => set("paypal_mode", e.target.value)}>
                <option value="sandbox">Sandbox (testes)</option>
                <option value="live">Live (produção)</option>
              </select>
            </Field>
          </Section>

          <Section title="Credenciais PayPal">
            <Field label="Client ID" hint="Chave pública da aplicação PayPal">
              <TextInput cfgKey="paypal_client_id" placeholder="AXxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </Field>
            <Field label="Client Secret" hint="Chave secreta — nunca compartilhe">
              <SecretInput cfgKey="paypal_client_secret" placeholder="EKxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </Field>
          </Section>

          <Section title="Integração">
            <div style={{ padding: "10px 14px", background: "rgba(0,112,186,.08)", border: "1px solid rgba(0,112,186,.3)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Endpoint de criação de ordem</div>
              <code style={{ fontSize: 12, color: "#0070ba", fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}/api/payments/paypal
              </code>
            </div>
            <div style={{ padding: "10px 14px", background: "rgba(0,112,186,.08)", border: "1px solid rgba(0,112,186,.3)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Endpoint de captura</div>
              <code style={{ fontSize: 12, color: "#0070ba", fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}/api/payments/paypal/capture
              </code>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, padding: "4px 0" }}>
              Crie uma aplicação no PayPal Developer Dashboard e copie as credenciais acima. Use o ambiente Sandbox para testes antes de ir para produção.
            </div>
          </Section>
        </>
      )}

      {/* Save */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: "11px 28px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        <button onClick={() => fetch("/api/admin/gateway").then(r => r.json()).then(d => d.config && setCfg(d.config))}
          style={{ padding: "11px 18px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          Restaurar
        </button>
      </div>
    </div>
  );
}
