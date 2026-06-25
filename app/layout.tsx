import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/lang";
import FooterWrapper from "@/components/FooterWrapper";
import BottomNavWrapper from "@/components/BottomNavWrapper";

export const metadata: Metadata = {
  title: "Previsão — Mercado de Apostas Sociais",
  description: "Aposte em eventos do mundo real com outros usuários",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})()` }} />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LangProvider>
          <div style={{ flex: 1 }}>{children}</div>
          <FooterWrapper />
          <BottomNavWrapper />
        </LangProvider>
      </body>
    </html>
  );
}
