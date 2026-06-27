"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Lang = "en" | "lug";

export const dict = {
  en: {
    greeting_morning: "Good morning",
    greeting_webale: "Webale, good morning",
    home: "Home",
    grow: "Grow",
    cash: "Cash",
    me: "Me",
    coming_soon: "Coming in the next step",
    safety_tagline: "Your money is safe",
    trust_ribbon:
      "Your money is safe — held at a licensed bank, refunded if a payment fails",
    success_rate: "99.4% success",
    notifications: "Notifications",
    safety: "Safety",
    send: "Send",
    receive: "Receive",
    balance: "Balance",
    transactions: "Transactions",
    see_all: "See all",
    switch_lang: "Luganda",
  },
  lug: {
    greeting_morning: "Wasuze otya nno",
    greeting_webale: "Webale, wasuze otya nno",
    home: "Awaka",
    grow: "Kulungi",
    cash: "Sente",
    me: "Nze",
    coming_soon: "Ekijja mu nkola ennamba",
    safety_tagline: "Ssente zo zirinzikira",
    trust_ribbon:
      "Ssente zo zirinzikira — zisinziirizibwa mu bank eyeteekebwawo, osubulwa sente zo singa okusaasaana kufaayo",
    success_rate: "Njukizo 99.4%",
    notifications: "Obubaka",
    safety: "Obukuumi",
    send: "Waŋdissa",
    receive: "Nkwata",
    balance: "Omuwendo",
    transactions: "Emikolere",
    see_all: "Laba byonna",
    switch_lang: "English",
  },
} as const;

type DictShape = typeof dict.en;
export type I18nKey = keyof DictShape;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mc_lang");
      if (saved === "en" || saved === "lug") setLangState(saved);
    } catch {
      // localStorage unavailable (SSR safety)
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("mc_lang", l);
    } catch {}
  };

  const t = (key: I18nKey): string => dict[lang][key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
