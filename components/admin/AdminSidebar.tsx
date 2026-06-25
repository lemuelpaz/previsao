"use client";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin",           label: "Visão Geral",   icon: "▦" },
  { href: "/admin/markets",   label: "Previsões",     icon: "◈" },
  { href: "/admin/trending",  label: "Mercado em Alta", icon: "📈" },
  { href: "/admin/financial", label: "Financeiro",    icon: "₿" },
  { href: "/admin/users",     label: "Usuários",      icon: "⊙" },
  { href: "/admin/gateway",   label: "Gateway",       icon: "⚡" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside style={{
      width: 210, minHeight: "100vh", background: "var(--surface)",
      borderRight: "1px solid var(--border)", flexShrink: 0,
      display: "flex", flexDirection: "column",
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginBottom: 2, letterSpacing: -.3 }}>Previsão</div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Painel Admin</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "8px 6px", flex: 1 }}>
        {LINKS.map(l => {
          const active = isActive(l.href);
          return (
            <button key={l.href} onClick={() => router.push(l.href)} style={{
              width: "100%", padding: "9px 10px", marginBottom: 2,
              background: active ? "var(--badge-bg)" : "none", border: "none",
              borderRadius: 6,
              borderLeft: `2px solid ${active ? "var(--primary)" : "transparent"}`,
              color: active ? "var(--primary)" : "var(--text-muted)",
              textAlign: "left", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "all .12s", fontFamily: "'Inter', sans-serif",
              fontWeight: active ? 600 : 400,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}>
              <span style={{ fontSize: 13, opacity: active ? 1 : .55, minWidth: 16, textAlign: "center" }}>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 6px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => router.push("/")} style={{
          width: "100%", padding: "8px 10px",
          background: "none", border: "1px solid var(--border)",
          borderRadius: 6, color: "var(--text-muted)", fontSize: 12,
          cursor: "pointer", fontFamily: "'Inter', sans-serif",
          transition: "border .15s, color .15s", textAlign: "left",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
          ← Ir à plataforma
        </button>
      </div>
    </aside>
  );
}
