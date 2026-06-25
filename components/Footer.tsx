"use client";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import type { Lang } from "@/lib/translations";

/* ── Social icon SVGs ──────────────────────────────── */
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const IconDiscord = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.116 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);
const IconTikTok = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);
const IconYouTube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const SOCIAL = [
  { icon: <IconX />,         href: "#",                             title: "X (Twitter)" },
  { icon: <IconFacebook />,  href: "#",                             title: "Facebook" },
  { icon: <IconInstagram />, href: "#",                             title: "Instagram" },
  { icon: <IconDiscord />,   href: "#",                             title: "Discord" },
  { icon: <IconTikTok />,    href: "#",                             title: "TikTok" },
  { icon: <IconYouTube />,   href: "#",                             title: "YouTube" },
  { icon: <IconLinkedIn />,  href: "#",                             title: "LinkedIn" },
  { icon: <IconEmail />,     href: "mailto:suporte@metrixbrasil.com", title: "E-mail" },
];

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "https://flagcdn.com/w20/br.png", label: "Português" },
  { code: "en", flag: "https://flagcdn.com/w20/us.png", label: "English" },
  { code: "es", flag: "https://flagcdn.com/w20/es.png", label: "Español" },
];

export default function Footer() {
  const { t, lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const year = new Date().getFullYear();
  const curLang = LANGS.find(l => l.code === lang) ?? LANGS[0];

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const COLS = [
    {
      title: "Top 5 Mercados em Tendência",
      links: [
        { label: "Cripto",                href: "/?cat=Crypto" },
        { label: "Esportes",              href: "/?cat=Esportes" },
        { label: "Política",              href: "/?cat=Política" },
        { label: "Economia",              href: "/?cat=Economia" },
        { label: "Tecnologia",            href: "/?cat=Tech" },
      ],
    },
    {
      title: "Top 5 Tópicos em Tendência",
      links: [
        { label: "Bitcoin & Crypto",      href: "/?cat=Crypto" },
        { label: "Eleições",              href: "/?cat=Política" },
        { label: "Inteligência Artificial", href: "/?cat=Tech" },
        { label: "Commodities",           href: "/?cat=Economia" },
        { label: "Futebol",               href: "/?cat=Esportes" },
      ],
    },
    {
      title: "Suporte e Social",
      links: [
        { label: "Documentação",          href: "#" },
        { label: "X (Twitter)",           href: "#" },
        { label: "Facebook",              href: "#" },
        { label: "Instagram",             href: "#" },
        { label: "Discord",               href: "#" },
        { label: "TikTok",                href: "#" },
        { label: "YouTube",               href: "#" },
        { label: "LinkedIn",              href: "#" },
        { label: "E-mail",                href: "mailto:suporte@metrixbrasil.com" },
      ],
    },
    {
      title: "Metrix",
      links: [
        { label: "Sobre nós",             href: "#" },
        { label: "Perguntas frequentes",  href: "#" },
        { label: "Termos de uso",         href: "#" },
        { label: "Privacidade",           href: "#" },
        { label: "Contato",               href: "mailto:suporte@metrixbrasil.com" },
      ],
    },
  ];

  return (
    <footer style={{ background: "var(--nav-bg)", borderTop: "1px solid var(--border)", position: "relative" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px 0" }}>

        {/* ── 4-column grid ─────────────────────────────── */}
        <div className="footer-cols" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, marginBottom: 36 }}>
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>
                {col.title}
              </div>
              {col.links.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ display: "block", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 9, transition: "color .12s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* ── Social icons + lang ─────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          {/* Social row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {SOCIAL.map(s => (
              <a key={s.title} href={s.href} title={s.title} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", transition: "all .15s", textDecoration: "none", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}>
                {s.icon}
              </a>
            ))}
          </div>

          {/* Language picker */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(v => !v)} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "none", border: "1px solid var(--border)", borderRadius: 7,
              padding: "6px 10px", cursor: "pointer", color: "var(--text-muted)",
              fontSize: 13, transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { if (!langOpen) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; } }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={curLang.flag} alt={curLang.label} width={18} height={13} style={{ borderRadius: 2, objectFit: "cover", display: "block" }} />
              <span>{curLang.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {langOpen && (
              <div style={{ position: "absolute", bottom: "calc(100% + 6px)", right: 0, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,.6)", minWidth: 140 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} style={{
                    width: "100%", padding: "9px 14px", background: l.code === lang ? "var(--badge-bg)" : "none",
                    border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 9, fontSize: 13,
                    color: l.code === lang ? "var(--primary)" : "var(--text-muted)", transition: "background .12s",
                  }}
                  onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                  onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "none"; }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.flag} alt={l.label} width={18} height={13} style={{ borderRadius: 2, objectFit: "cover" }} />
                    <span style={{ fontWeight: l.code === lang ? 700 : 400 }}>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Legal text ──────────────────────────────────── */}
        <div style={{ paddingBottom: 28 }}>
          <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
            © {year} Metrix Inc. Plataforma global de mercados de previsão. Versão brasileira operada por Metrix Tecnologia Ltda. A Metrix é uma plataforma global de mercado de previsão baseada em inteligência coletiva, sempre condicionada às políticas de geolocalização, KYC, AML, proteção de dados e exigências locais de cada jurisdição. No Brasil, a Metrix opera atualmente em ambiente de testes, estudos e desenvolvimento tecnológico, com foco em segurança do usuário, integridade de mercado, auditoria, governança e conformidade regulatória. Na Metrix, os usuários negociam posições em eventos futuros por meio de um modelo de mercado ponto a ponto. A Metrix não é plataforma de apostas, não atua como casa de apostas, não promete retorno financeiro e não opera como contraparte dos usuários. Atendimento oficial Metrix Brasil: [suporte@metrixbrasil.com]. Ao usar esta plataforma, você concorda com nossos{" "}
            <Link href="#" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Termos de uso</Link>
            {" "}e{" "}
            <Link href="#" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Privacidade</Link>.
          </p>
        </div>
      </div>

      {/* ── Voltar ao Topo ──────────────────────────────── */}
      <div style={{ textAlign: "center", paddingBottom: 20 }}>
        <button onClick={scrollTop} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: 99, padding: "8px 20px", cursor: "pointer",
          fontSize: 13, color: "var(--text-muted)", fontFamily: "'Inter', sans-serif",
          transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-acc)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
          Voltar ao Topo
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-cols { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
        }
        @media (max-width: 540px) {
          .footer-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
