"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, T } from "./translations";

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: T; }

const Ctx = createContext<LangCtx>({ lang: "pt", setLang: () => {}, t: translations.pt });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const s = localStorage.getItem("lang") as Lang | null;
    if (s && s in translations) setLangState(s);
  }, []);

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };

  return <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
