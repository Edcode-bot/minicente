"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Lang = "en" | "lug";

// ─── English base ─────────────────────────────────────────────────────────────

const en = {
  // App shell
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

  // Common onboarding
  trust_line: "🛡 Licensed by Bank of Uganda · money held at a licensed bank",
  continue: "Continue",
  back: "Back",

  // Step 0 – Language
  onb_headline: "Money that always works.",
  onb_subtext: "Simple, safe, instant — pay, save, and send from your phone.",

  // Step 1 – Phone
  phone_title: "What's your phone number?",
  phone_reassurance:
    "This is your account — like Mobile Money. No forms, no bank account needed.",
  phone_ussd_hint: "No smartphone? You can also use Minicente on *384#",

  // Step 2 – OTP
  otp_title: "Enter the code",
  otp_sent: "We sent a 5-digit code by SMS to",
  otp_resend: "Resend in",
  otp_resend_now: "Resend code",
  otp_demo: "demo: 12345",

  // Step 3 – PIN
  pin_title: "Create a PIN to lock your money.",
  pin_warning: "Keep it secret — Minicente staff will never ask for it.",
  pin_confirm_title: "Confirm your PIN",
  pin_mismatch: "PINs don't match. Try again.",
  pin_biometric: "Also unlock with fingerprint — faster, and just as safe",

  // Step 4 – Gift
  gift_title: "Welcome gift",
  gift_amount: "UGX 1,000",
  gift_on_balance: "is on your Minicente balance.",
  gift_subtext:
    "Try it now — make one real payment, free, and see how fast it is. No ID needed yet.",
  gift_cta: "Try my first payment",

  // Step 5 – First win
  firstwin_title: "Your first win — pick one.",
  firstwin_subtext: "It uses your UGX 1,000 gift, costs you nothing.",
  firstwin_yaka: "Buy UGX 1,000 YAKA — electricity tokens to your meter",
  firstwin_airtime: "Send yourself UGX 1,000 airtime — to this number",
  firstwin_protection: "Protected — refunded automatically if it ever fails.",

  // Step 6 – Processing
  processing_title: "Sending…",
  processing_sub: "securing it with the bank.",

  // Step 7 – Success
  success_title: "It works. 🎉",
  success_sub_yaka: "YAKA top-up done in 4 seconds — that's your first win.",
  success_sub_airtime: "Airtime sent in 2 seconds — that's your first win.",
  success_paid: "Paid",
  success_fee: "Fee",
  success_time: "Time",
  success_ref: "Reference",
  success_cta: "Continue",

  // Step 8 – Unlock
  unlock_title: "Unlock the rest",
  unlock_sub:
    "Verify your ID once to send bigger amounts, save, and borrow. Takes about a minute.",
  unlock_perk1: "Send up to UGX 5,000,000",
  unlock_perk2: "Save with goals",
  unlock_perk3: "Qualify for small loans",
  unlock_cta: "Get started",
  unlock_skip: "I'll verify later",
} as const;

export type I18nKey = keyof typeof en;

// ─── Luganda ─────────────────────────────────────────────────────────────────

const lug: Record<I18nKey, string> = {
  greeting_morning: "Wasuze otya nno",
  greeting_webale: "Webale, wasuze otya nno",
  home: "Awaka",
  grow: "Kulungi",
  cash: "Sente",
  me: "Nze",
  coming_soon: "Ekijja mu nkola ennamba",
  safety_tagline: "Ssente zo zirinzikira",
  trust_ribbon:
    "Ssente zo zirinzikira — zisinziirizibwa mu bank eyateekebwawo, osubulwa sente zo singa okusaasaana kufaayo",
  success_rate: "Njukizo 99.4%",
  notifications: "Obubaka",
  safety: "Obukuumi",
  send: "Waŋdissa",
  receive: "Nkwata",
  balance: "Omuwendo",
  transactions: "Emikolere",
  see_all: "Laba byonna",
  switch_lang: "English",

  trust_line:
    "🛡 Waakiririzibwa Banki ya Uganda · ssente zisinziirizibwa mu banki eyateekebwawo",
  continue: "Endeera",
  back: "Zaamuuka",

  onb_headline: "Ssente ezikolera bulijjo.",
  onb_subtext:
    "Yosegeke, sirinzikira, mangu — seereza, tereka, weerezereza okuva ku ssimu yo.",

  phone_title: "Ennamba ya ssimu yo?",
  phone_reassurance:
    "Kino kye akawunti yo — ng'eMobile Money. Teefuna bikapu, neera bank.",
  phone_ussd_hint: "Tolina smartphone? Osobola okozesa Minicente ku *384#",

  otp_title: "Yingiza koodi",
  otp_sent: "Tuweereza koodi ez'ebinumerro 5 ku SMS eri",
  otp_resend: "Wereza nate mu",
  otp_resend_now: "Wereza koodi nate",
  otp_demo: "demo: 12345",

  pin_title: "Kola PIN okukuuma ssente zo.",
  pin_warning: "Kikuume nga esiri — abaana ba Minicente tabaakubuuza.",
  pin_confirm_title: "Kakasa PIN yo",
  pin_mismatch: "PIN ezitawagana. Gezaako nate.",
  pin_biometric:
    "Nnyonnyola n'olupapula lw'engalo — mangu, era sirinzika bwekityo",

  gift_title: "Wammwanyi",
  gift_amount: "UGX 1,000",
  gift_on_balance: "eri ku ssente zo ez'e Minicente.",
  gift_subtext:
    "Gezaako kaakano — seereza essente emu, bwerere, laba mangu. Teefuna kitambulizo.",
  gift_cta: "Gezaako okuseereza okusookerwamu",

  firstwin_title: "Kulembera kwo — londa kimu.",
  firstwin_subtext: "Kigozesa UGX 1,000 wammwanyi wo, tekutwala kimu.",
  firstwin_yaka: "Gula UGX 1,000 YAKA — amaanyi ag'amasannyalaze ku meter yo",
  firstwin_airtime: "Weeweereza UGX 1,000 airtime — ku nnamba eno",
  firstwin_protection:
    "Sirinzikira — osubulibwa ssente zo amangu singa kizikirira.",

  processing_title: "Tuseereza…",
  processing_sub: "tukikuuma n'omulamwa.",

  success_title: "Kikoze. 🎉",
  success_sub_yaka:
    "YAKA ezimala mu ssekunde 4 — ekyo kulembera kwo okusookerwamu.",
  success_sub_airtime:
    "Airtime eweereddwa mu ssekunde 2 — ekyo kulembera kwo okusookerwamu.",
  success_paid: "Waseereza",
  success_fee: "Omusaasaane",
  success_time: "Ekiseera",
  success_ref: "Olukalala",
  success_cta: "Endeera",

  unlock_title: "Ggulawo ebirala",
  unlock_sub:
    "Kakasa kitambulizo kyo omu kyakuuma okuwereza ssente nnyingi, okutereka, n'okuguza. Bigula eddakiika emu.",
  unlock_perk1: "Wereza okutuuka ku UGX 5,000,000",
  unlock_perk2: "Tereka n'ebisuubirizo",
  unlock_perk3: "Ndirizibwa okuguza ssente ntono",
  unlock_cta: "Tandika",
  unlock_skip: "Ndikakilanga nyuma",
};

// ─── Context & provider ───────────────────────────────────────────────────────

export const dict = { en, lug } as const;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mc_lang");
      if (saved === "en" || saved === "lug") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("mc_lang", l);
    } catch {}
  };

  const t = (key: I18nKey): string =>
    (lang === "en" ? (en as Record<string, string>) : lug)[key] ?? en[key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
