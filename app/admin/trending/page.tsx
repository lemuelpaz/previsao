"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v.toFixed(0)}`;

const inp: React.CSSProperties = {
  padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none", width: "100%",
  fontFamily: "'Inter', sans-serif", transition: "border .15s",
};

interface Market {
  id: string; title: string; category: string; emoji: string; volume: number;
  _count: { positions: number };
}

interface Config {
  pinned_ids?:      string;
  banner_enabled?:  string;
  banner_title?:    string;
  banner_subtitle?: string;
  banner_cta?:      string;
  banner_url?:      string;
  banner_badge?:    string;
  banner_color?:    string;
  banner_image?:    string;
}

const PRESET_COLORS = [
  { label: "Verde Metrix", value: "#9AFF00" },
  { label: "Azul",         value: "#3b82f6" },
  { label: "Roxo",         value: "#8b5cf6" },
  { label: "Laranja",      value: "#f97316" },
  { label: "Rosa",         value: "#ec4899" },
  { label: "Ciano",        value: "#06b6d4" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,.02)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .8 }}>{title}</span>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

export default function AdminTrendingPage() {
  const router    = useRouter();
  const fileRef   = useRef<HTMLInputElement>(null);
  const [markets,   setMarkets]   = useState<Market[]>([]);
  const [cfg,       setCfg]       = useState<Config>({});
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [dragOver,  setDragOver]  = useState(false);

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const load = () =>
    fetch("/api/admin/trending").then(r => r.json()).then(d => {
      setMarkets(d.markets ?? []);
      if (d.config) {
        setCfg(d.config);
        setPinnedIds(d.config.pinned_ids ? d.config.pinned_ids.split(",").filter(Boolean) : []);
      }
    });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
      load();
    });
  }, [router]);

  const setC = (key: keyof Config, val: string) => setCfg(c => ({ ...c, [key]: val }));

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 10) { flash("Máximo 10 previsões em destaque.", false); return prev; }
      return [...prev, id];
    });
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    setPinnedIds(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i: number) => {
    setPinnedIds(prev => {
      if (i >= prev.length - 1) return prev;
      const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
    });
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { flash("Use uma imagem (JPG, PNG, WebP).", false); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { flash(d.error ?? "Erro no upload.", false); return; }
      setC("banner_image", d.url);
      flash("Imagem carregada com sucesso!");
    } finally { setUploading(false); }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...cfg, pinned_ids: pinnedIds.join(",") };
      const r = await fetch("/api/admin/trending", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) flash("Salvo com sucesso!");
      else flash("Erro ao salvar.", false);
    } finally { setSaving(false); }
  };

  const pinnedMarkets = pinnedIds.map(id => markets.find(m => m.id === id)).filter((m): m is Market => !!m);
  const available = markets.filter(m =>
    !pinnedIds.includes(m.id) &&
    (!search || m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
  );

  const c = cfg.banner_color || "#9AFF00";
  const hasImage = !!cfg.banner_image;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 980 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -.4, marginBottom: 3 }}>Mercado em Alta</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Selecione quais previsões aparecem em destaque e configure o banner promocional</p>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", background: msg.ok ? "var(--badge-bg)" : "rgba(255,68,68,.1)", border: `1px solid ${msg.ok ? "var(--border-acc)" : "rgba(255,68,68,.3)"}`, borderRadius: 8, color: msg.ok ? "var(--primary)" : "var(--red)", fontSize: 13, marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* ── Market selector ─────────────────────────────── */}
      <Section title="Previsões em Destaque">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

          {/* Available */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .7, marginBottom: 10 }}>
              Disponíveis ({markets.length})
            </div>
            <input type="text" placeholder="Buscar mercado..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, marginBottom: 10, fontSize: 12 }}
              onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
              onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
            <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {available.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--text-dim)" }}>
                  {search ? "Nenhum resultado" : "Todos os mercados já selecionados"}
                </div>
              )}
              {available.map(m => (
                <div key={m.id} onClick={() => togglePin(m.id)} style={{
                  padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.background = "var(--badge-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{m.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{m.category} · {fmtK(m.volume)} · {m._count.positions} apostas</div>
                  </div>
                  <span style={{ fontSize: 16, color: "var(--primary)", flexShrink: 0 }}>+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .7 }}>
                Em destaque ({pinnedMarkets.length}/10)
              </div>
              {pinnedMarkets.length > 0 && (
                <button onClick={() => setPinnedIds([])} style={{ background: "none", border: "none", fontSize: 11, color: "var(--red)", cursor: "pointer", padding: 0 }}>
                  Limpar tudo
                </button>
              )}
            </div>
            <div style={{ minHeight: 60, display: "flex", flexDirection: "column", gap: 6 }}>
              {pinnedMarkets.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-dim)" }}>
                  Selecione previsões à esquerda
                </div>
              )}
              {pinnedMarkets.map((m, i) => (
                <div key={m.id} style={{ padding: "8px 10px", background: "var(--badge-bg)", border: "1px solid var(--border-acc)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#000", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{m.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)" }}>{m.category}</div>
                  </div>
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: 22, height: 22, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", color: "var(--text-muted)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", opacity: i === 0 ? .3 : 1 }}>↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === pinnedMarkets.length - 1} style={{ width: 22, height: 22, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", color: "var(--text-muted)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", opacity: i === pinnedMarkets.length - 1 ? .3 : 1 }}>↓</button>
                    <button onClick={() => togglePin(m.id)} style={{ width: 22, height: 22, background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.25)", borderRadius: 4, cursor: "pointer", color: "var(--red)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Banner editor ─────────────────────────────────── */}
      <Section title="Banner Promocional">
        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setC("banner_enabled", cfg.banner_enabled === "true" ? "false" : "true")} style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: cfg.banner_enabled === "true" ? "var(--primary)" : "var(--surface3)",
            position: "relative", transition: "background .2s",
          }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: cfg.banner_enabled === "true" ? 23 : 3, transition: "left .2s" }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: cfg.banner_enabled === "true" ? "var(--yes)" : "var(--text-muted)" }}>
            {cfg.banner_enabled === "true" ? "Banner ativo — exibido na página inicial" : "Banner desativado"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ─ Left: form fields ─ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Image upload zone */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>
                Imagem do banner
              </label>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "var(--primary)" : hasImage ? "var(--border-acc)" : "var(--border)"}`,
                  borderRadius: 10, cursor: "pointer", overflow: "hidden",
                  background: dragOver ? "var(--badge-bg)" : "var(--surface)",
                  transition: "all .15s", position: "relative",
                  height: hasImage ? "auto" : 110,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                {hasImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cfg.banner_image} alt="Banner" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "var(--surface2)" }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                        {cfg.banner_image?.split("/").pop()}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); setC("banner_image", ""); }}
                        style={{ background: "rgba(255,68,68,.15)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 5, color: "var(--red)", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "3px 10px", flexShrink: 0 }}>
                        Remover
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 16, pointerEvents: "none" }}>
                    {uploading ? (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Carregando...</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 28, marginBottom: 6, opacity: .4 }}>🖼️</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Clique ou arraste uma imagem</div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>JPG, PNG, WebP, GIF — máx 5 MB</div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />

              {/* URL input as alternative */}
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--text-dim)", flexShrink: 0 }}>ou URL:</span>
                <input
                  style={{ ...inp, fontSize: 11, padding: "6px 10px" }}
                  placeholder="https://..."
                  value={hasImage && cfg.banner_image?.startsWith("http") ? cfg.banner_image : ""}
                  onChange={e => setC("banner_image", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                  onBlur={e  => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>Badge / Etiqueta</label>
              <input style={inp} placeholder="Ex: NOVO, 🔥 HOT" value={cfg.banner_badge ?? ""}
                onChange={e => setC("banner_badge", e.target.value)}
                onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>Título</label>
              <input style={inp} placeholder="Título principal do banner" value={cfg.banner_title ?? ""}
                onChange={e => setC("banner_title", e.target.value)}
                onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>Subtítulo</label>
              <input style={inp} placeholder="Descrição ou chamada de ação" value={cfg.banner_subtitle ?? ""}
                onChange={e => setC("banner_subtitle", e.target.value)}
                onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>Botão CTA</label>
                <input style={inp} placeholder="Ver mercados" value={cfg.banner_cta ?? ""}
                  onChange={e => setC("banner_cta", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                  onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>URL do botão</label>
                <input style={inp} placeholder="/ ou /market/..." value={cfg.banner_url ?? ""}
                  onChange={e => setC("banner_url", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "var(--border-acc)")}
                  onBlur={e  => (e.target.style.borderColor = "var(--border)")} />
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>Cor de destaque</label>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                {PRESET_COLORS.map(pc => (
                  <button key={pc.value} title={pc.label} onClick={() => setC("banner_color", pc.value)} style={{
                    width: 28, height: 28, borderRadius: 6, border: cfg.banner_color === pc.value ? "2.5px solid var(--text)" : "2.5px solid transparent",
                    background: pc.value, cursor: "pointer", transition: "transform .1s",
                    transform: cfg.banner_color === pc.value ? "scale(1.2)" : "scale(1)",
                  }} />
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <input type="color" value={cfg.banner_color || "#9AFF00"} onChange={e => setC("banner_color", e.target.value)}
                    style={{ width: 28, height: 28, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }} />
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Personalizado</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─ Right: live preview ─ */}
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>Preview</div>

            {/* Banner preview */}
            <div style={{
              borderRadius: 12, overflow: "hidden", border: `1px solid ${c}44`,
              background: hasImage ? "transparent" : `linear-gradient(135deg, ${c}14 0%, transparent 60%)`,
              position: "relative", minHeight: 130,
            }}>
              {/* Background image */}
              {hasImage && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cfg.banner_image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* Overlay for text readability */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.45) 60%, rgba(0,0,0,.1) 100%)" }} />
                </>
              )}
              {!hasImage && (
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${c}0a, transparent 65%)`, pointerEvents: "none" }} />
              )}

              <div style={{ position: "relative", padding: "20px 24px" }}>
                {cfg.banner_badge && (
                  <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, background: c, color: "#000", display: "inline-block", marginBottom: 10 }}>
                    {cfg.banner_badge}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: hasImage ? "#fff" : "var(--text)", letterSpacing: -.4, lineHeight: 1.2, marginBottom: 5 }}>
                      {cfg.banner_title || <span style={{ opacity: .4 }}>Título do banner</span>}
                    </div>
                    {cfg.banner_subtitle && (
                      <div style={{ fontSize: 12, color: hasImage ? "rgba(255,255,255,.8)" : "var(--text-muted)" }}>
                        {cfg.banner_subtitle}
                      </div>
                    )}
                  </div>
                  {cfg.banner_cta && (
                    <div style={{ flexShrink: 0, padding: "7px 18px", background: c, color: "#000", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      {cfg.banner_cta}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>
              {hasImage
                ? "A imagem aparecerá como fundo do banner. Um overlay escuro garante legibilidade do texto."
                : "Sem imagem: o banner usa gradiente de cor. Faça upload para sobrepor a cor com uma foto ou ilustração."}
            </div>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ padding: "11px 28px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        <button onClick={load} style={{ padding: "11px 18px", background: "none", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          Restaurar
        </button>
      </div>
    </div>
  );
}
